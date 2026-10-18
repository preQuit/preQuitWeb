import type { Page } from '../../domain/repositories/common';

export type QueryValue = string | number | boolean | undefined;

export interface CallOptions {
  readonly signal?: AbortSignal;
  readonly authenticated?: boolean;
  readonly params?: Readonly<Record<string, QueryValue>>;
}

export interface HttpClient {
  get<T>(path: string, options?: CallOptions): Promise<T | null>;
  getPage<T>(path: string, options?: CallOptions): Promise<Page<T>>;
  post<T>(path: string, body?: unknown, options?: CallOptions): Promise<T | null>;
  patch<T>(path: string, body?: unknown, options?: CallOptions): Promise<T | null>;
  put<T>(path: string, body?: unknown, options?: CallOptions): Promise<T | null>;
  delete<T>(path: string, options?: CallOptions): Promise<T | null>;
}
