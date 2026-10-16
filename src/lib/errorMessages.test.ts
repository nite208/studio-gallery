import { describe, it, expect } from 'vitest';
import { getFriendlyErrorMessage } from './errorMessages';

describe('errorMessages', () => {
  it('maps known error codes to friendly text', () => {
    expect(getFriendlyErrorMessage('INVALID_CREDENTIALS')).toBe(
      'Incorrect password. Please try again.'
    );
    expect(getFriendlyErrorMessage('UNAUTHORIZED')).toBe(
      'Your session has expired. Please log in again.'
    );
    expect(getFriendlyErrorMessage('FORBIDDEN')).toBe(
      'You do not have permission to perform this action.'
    );
    expect(getFriendlyErrorMessage('NOT_FOUND')).toBe(
      'The requested photo could not be found.'
    );
  });

  it('falls back to default friendly message for unknown or undefined codes', () => {
    expect(getFriendlyErrorMessage('UNKNOWN_CODE')).toBe(
      'An unexpected error occurred. Please try again.'
    );
    expect(getFriendlyErrorMessage(undefined)).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });
});
