import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import { AppError, ErrorCode } from '../../domain/errors/AppError';
import type { Page } from '../../domain/repositories/common';
import type { SessionRepository } from '../../domain/repositories/SessionRepository';
import type { CallOptions, HttpClient } from './HttpClient';
import { cursorOf, dataOf, rowsOf, type Envelope } from './envelope';

const REFRESH_PATH = '/auth/refresh';

interface RetriableConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  retried?: boolean;
}

interface RefreshPayload {
  readonly accessToken?: string;
  readonly refreshToken?: string;
}

export interface AxiosHttpClientOptions {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly session: SessionRepository;
  readonly onSessionLost?: () => void;
}

const isTimeout = (error: AxiosError): boolean =>
  error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

const toAppError = (error: AxiosError<Envelope<unknown>>): AppError => {
  if (axios.isCancel(error)) {
    return new AppError('The request was cancelled.', { code: ErrorCode.TIMEOUT });
  }
  if (isTimeout(error)) {
    return new AppError('The request timed out.', { code: ErrorCode.TIMEOUT });
  }
  if (!error.response) {
    return new AppError('Could not reach the server.', { code: ErrorCode.NETWORK });
  }

  const body = error.response.data?.error;
  return new AppError(body?.message ?? 'Something went wrong.', {
    code: body?.code ?? ErrorCode.UNKNOWN,
    status: error.response.status,
    details: body?.details ?? [],
  });
};

export class AxiosHttpClient implements HttpClient {
  private readonly instance: AxiosInstance;
  private readonly session: SessionRepository;
  private readonly onSessionLost: () => void;
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(options: AxiosHttpClientOptions) {
    this.session = options.session;
    this.onSessionLost = options.onSessionLost ?? (() => {});
    this.instance = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeoutMs,
      headers: { Accept: 'application/json' },
    });

    this.instance.interceptors.request.use(config => {
      const scoped = config as RetriableConfig;
      if (scoped.skipAuth) return config;
      const token = this.session.accessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.instance.interceptors.response.use(
      response => response,
      (error: AxiosError<Envelope<unknown>>) => this.recover(error),
    );
  }

  get<T>(path: string, options?: CallOptions): Promise<T | null> {
    return this.send<T>({ ...this.configOf(options), url: path, method: 'GET' });
  }

  async getPage<T>(path: string, options?: CallOptions): Promise<Page<T>> {
    const response = await this.exchange<readonly T[] | Page<T>>({
      ...this.configOf(options),
      url: path,
      method: 'GET',
    });
    const payload = response.data;
    const body = dataOf(payload);

    if (body && !Array.isArray(body) && 'items' in body) {
      return { items: body.items ?? [], nextCursor: body.nextCursor ?? null };
    }
    return { items: rowsOf<T>(body), nextCursor: cursorOf(payload) };
  }

  post<T>(path: string, body?: unknown, options?: CallOptions): Promise<T | null> {
    return this.send<T>({ ...this.configOf(options), url: path, method: 'POST', data: body ?? {} });
  }

  patch<T>(path: string, body?: unknown, options?: CallOptions): Promise<T | null> {
    return this.send<T>({ ...this.configOf(options), url: path, method: 'PATCH', data: body ?? {} });
  }

  put<T>(path: string, body?: unknown, options?: CallOptions): Promise<T | null> {
    return this.send<T>({ ...this.configOf(options), url: path, method: 'PUT', data: body ?? {} });
  }

  delete<T>(path: string, options?: CallOptions): Promise<T | null> {
    return this.send<T>({ ...this.configOf(options), url: path, method: 'DELETE' });
  }

  private configOf(options: CallOptions = {}): RetriableConfig {
    const { signal, authenticated = true, params } = options;
    return {
      ...(signal ? { signal } : {}),
      ...(params ? { params } : {}),
      skipAuth: !authenticated,
    };
  }

  private async send<T>(config: RetriableConfig): Promise<T | null> {
    const response = await this.exchange<T>(config);
    return dataOf(response.data);
  }

  private exchange<T>(config: RetriableConfig): Promise<AxiosResponse<Envelope<T>>> {
    return this.instance.request<Envelope<T>>(config);
  }

  private async recover(error: AxiosError<Envelope<unknown>>): Promise<AxiosResponse> {
    const config = error.config as RetriableConfig | undefined;
    const retriable =
      error.response?.status === 401 && config && !config.skipAuth && !config.retried;

    if (!retriable) throw toAppError(error);

    if (await this.refreshSession()) {
      const retry: RetriableConfig = { ...config, retried: true };
      return this.instance.request(retry);
    }

    await this.session.clear();
    this.onSessionLost();
    throw new AppError('Your session expired. Please sign in again.', {
      code: ErrorCode.SESSION_EXPIRED,
      status: 401,
    });
  }

  private refreshSession(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;

    const refreshToken = this.session.refreshToken();
    if (!refreshToken) return Promise.resolve(false);

    this.refreshInFlight = this.performRefresh(refreshToken)
      .catch(() => false)
      .finally(() => {
        this.refreshInFlight = null;
      });

    return this.refreshInFlight;
  }

  private async performRefresh(refreshToken: string): Promise<boolean> {
    const refresh: RetriableConfig = {
      url: REFRESH_PATH,
      method: 'POST',
      data: { refreshToken },
      skipAuth: true,
      retried: true,
    };
    const response = await this.instance.request<Envelope<RefreshPayload>>(refresh);

    const payload = dataOf(response.data);
    if (!payload?.accessToken) return false;

    await this.session.write({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken ?? refreshToken,
    });
    return true;
  }
}
