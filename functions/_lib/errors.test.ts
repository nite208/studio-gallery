import { describe, it, expect } from 'vitest';
import { createAppError } from './errors';
import { errorResponse } from './http';
import type { ApiErrorResponse } from '../../shared/types';

describe('errors and http responses', () => {
  it('creates an AppError with code, message, and status', () => {
    const error = createAppError('NOT_FOUND', 'Asset not found', 404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Asset not found');
    expect(error.status).toBe(404);
  });

  it('formats error into standard API error response JSON shape', async () => {
    const error = createAppError('UNAUTHORIZED', 'Access denied', 401);
    const response = errorResponse(error);
    expect(response.status).toBe(401);

    const body = (await response.json()) as ApiErrorResponse;
    expect(body).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access denied',
      },
    });
  });
});
