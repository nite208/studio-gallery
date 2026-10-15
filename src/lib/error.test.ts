import { describe, it, expect } from 'vitest';
import { createAppError, formatErrorResponse } from './error';

describe('error utilities', () => {
  it('creates an AppError with code, message, and status', () => {
    const error = createAppError('NOT_FOUND', 'Item not found', 404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Item not found');
    expect(error.status).toBe(404);
  });

  it('formats error into standard API error response JSON shape', () => {
    const error = createAppError('UNAUTHORIZED', 'Access denied', 401);
    const response = formatErrorResponse(error);

    expect(response).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access denied',
      },
    });
  });
});
