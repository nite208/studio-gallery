import type { RawEnv } from '../types/env';

const defaultRequiredKeys: readonly string[] = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

export function validateEnv(
  env: RawEnv,
  requiredKeys: readonly string[] = defaultRequiredKeys
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key of requiredKeys) {
    const value = env[key];
    if (value === undefined || value.trim() === '') {
      throw new Error(`Missing environment variable: ${key}`);
    }
    result[key] = value;
  }

  return result;
}
