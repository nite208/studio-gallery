import { describe, it, expect } from 'vitest';
import { validateEnv } from './env';

describe('validateEnv', () => {
  it('throws an error naming the missing environment variable when undefined', () => {
    const rawEnv = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
    };

    expect(() => validateEnv(rawEnv)).toThrowError(
      'Missing environment variable: CLOUDINARY_API_SECRET'
    );
  });

  it('throws an error naming the missing environment variable when empty string', () => {
    const rawEnv = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: '   ',
      CLOUDINARY_API_SECRET: 'test-secret',
    };

    expect(() => validateEnv(rawEnv)).toThrowError(
      'Missing environment variable: CLOUDINARY_API_KEY'
    );
  });

  it('returns validated map when all variables are present', () => {
    const rawEnv = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    };

    const validated = validateEnv(rawEnv);
    expect(validated.CLOUDINARY_CLOUD_NAME).toBe('test-cloud');
    expect(validated.CLOUDINARY_API_KEY).toBe('test-key');
    expect(validated.CLOUDINARY_API_SECRET).toBe('test-secret');
  });

  it('validates custom specified keys', () => {
    const rawEnv = {
      CUSTOM_VAR: 'val',
    };

    const validated = validateEnv(rawEnv, ['CUSTOM_VAR']);
    expect(validated.CUSTOM_VAR).toBe('val');
  });
});
