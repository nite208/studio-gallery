export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly status: number;
}

export interface ApiErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}
