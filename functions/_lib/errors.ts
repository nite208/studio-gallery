import type { AppError } from '../../shared/types';

export type { AppError } from '../../shared/types';

export function createAppError(code: string, message: string, status: number): AppError {
  return {
    code,
    message,
    status,
  };
}
