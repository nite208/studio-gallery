import { describe, it, expect } from 'vitest';
import { validateEnv } from './env';

describe('validateEnv', () => {
  it('throws an error naming missing environment variable', () => {
    const rawEnv = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
    };

    expect(() => validateEnv(rawEnv)).toThrowError(
      'Missing environment variable: CLOUDINARY_API_SECRET'
    );
  });

  it('validates and applies default folder when missing', () => {
    const rawEnv = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_PASSWORD: 'test-password',
      SESSION_SECRET: 'test-session-secret',
    };

    const validated = validateEnv(rawEnv);
    expect(validated.CLOUDINARY_FOLDER).toBe('studio-gallery');
    expect(validated.ADMIN_PASSWORD).toBe('test-password');
  });

  it('accepts custom folder when specified', () => {
    const rawEnv = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      CLOUDINARY_FOLDER: 'custom-folder',
      ADMIN_PASSWORD: 'test-password',
      SESSION_SECRET: 'test-session-secret',
    };

    const validated = validateEnv(rawEnv);
    expect(validated.CLOUDINARY_FOLDER).toBe('custom-folder');
  });
});
