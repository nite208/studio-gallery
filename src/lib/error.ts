import type { AppError, ApiErrorResponse } from '../types/error';

export function createAppError(code: string, message: string, status: number): AppError {
  return {
    code,
    message,
    status,
  };
}

export function formatErrorResponse(error: AppError): ApiErrorResponse {
  return {
    error: {
      code: error.code,
      message: error.message,
    },
  };
}
