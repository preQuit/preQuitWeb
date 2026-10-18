import type { ErrorDetail } from '../../domain/errors/AppError';

export interface ErrorEnvelope {
  readonly code?: string;
  readonly message?: string;
  readonly details?: readonly ErrorDetail[];
}

export interface PageInfo {
  readonly nextCursor?: string | null;
  readonly hasMore?: boolean;
}

export interface Envelope<T> {
  readonly data?: T;
  readonly pageInfo?: PageInfo;
  readonly error?: ErrorEnvelope;
}

export const dataOf = <T,>(payload: Envelope<T> | null | undefined): T | null =>
  payload?.data ?? null;

export const errorOf = (payload: Envelope<unknown> | null | undefined): ErrorEnvelope | null =>
  payload?.error ?? null;

export const cursorOf = (payload: Envelope<unknown> | null | undefined): string | null =>
  payload?.pageInfo?.nextCursor ?? null;

export const rowsOf = <T,>(value: unknown): readonly T[] => (Array.isArray(value) ? (value as T[]) : []);
