import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiClient, isAppError } from './api';
import type { AppError } from '../../shared/types';

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON data on successful request', async () => {
    const mockData = { id: 1, title: 'Test Item' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await apiClient<typeof mockData>('/api/test');
    expect(result).toEqual(mockData);
  });

  it('parses standard error response into AppError', async () => {
    const errorBody = {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(errorBody), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(apiClient('/api/protected')).rejects.toEqual({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
      status: 401,
    });
  });

  it('handles non-JSON error responses with fallback HTTP_ERROR AppError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Bad Gateway', {
        status: 502,
        statusText: 'Bad Gateway',
      })
    );

    let caughtError: unknown;
    try {
      await apiClient('/api/broken');
    } catch (err) {
      caughtError = err;
    }

    expect(isAppError(caughtError)).toBe(true);
    const appError = caughtError as AppError;
    expect(appError.code).toBe('HTTP_ERROR');
    expect(appError.status).toBe(502);
  });

  it('isAppError validates valid and invalid shapes', () => {
    expect(isAppError({ code: 'ERR', message: 'msg', status: 500 })).toBe(true);
    expect(isAppError({ code: 'ERR' })).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError('error string')).toBe(false);
  });
});
