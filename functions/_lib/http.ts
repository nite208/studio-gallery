import type { ApiErrorResponse } from '../../shared/types';
import type { AppError } from './errors';

export function jsonResponse<T>(data: T, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function errorResponse(error: AppError, headers?: HeadersInit): Response {
  const body: ApiErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
    },
  };

  return jsonResponse(body, error.status, headers);
}
