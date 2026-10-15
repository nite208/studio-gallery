export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly status: number;
}

export function createAppError(code: string, message: string, status: number): AppError {
  return {
    code,
    message,
    status,
  };
}
