import type { AppError, ApiErrorResponse } from '../../shared/types';

export function isAppError(error: unknown): error is AppError {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const candidate = error as Record<string, unknown>;
  return (
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string' &&
    typeof candidate.status === 'number'
  );
}

export async function apiClient<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    let appError: AppError;
    try {
      const data = (await response.json()) as ApiErrorResponse;
      if (
        data &&
        data.error &&
        typeof data.error.code === 'string' &&
        typeof data.error.message === 'string'
      ) {
        appError = {
          code: data.error.code,
          message: data.error.message,
          status: response.status,
        };
      } else {
        appError = {
          code: 'HTTP_ERROR',
          message: response.statusText || 'Request failed',
          status: response.status,
        };
      }
    } catch {
      appError = {
        code: 'HTTP_ERROR',
        message: response.statusText || 'Request failed',
        status: response.status,
      };
    }
    throw appError;
  }

  return (await response.json()) as T;
}
