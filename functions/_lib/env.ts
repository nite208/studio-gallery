export interface ServerEnv {
  readonly CLOUDINARY_CLOUD_NAME: string;
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
  readonly CLOUDINARY_FOLDER: string;
  readonly ADMIN_PASSWORD: string;
  readonly SESSION_SECRET: string;
}

export type RawEnv = Record<string, unknown>;

const requiredEnvKeys: readonly (keyof Omit<ServerEnv, 'CLOUDINARY_FOLDER'>)[] = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ADMIN_PASSWORD',
  'SESSION_SECRET',
];

export function validateEnv(rawEnv: RawEnv): ServerEnv {
  for (const key of requiredEnvKeys) {
    const value = rawEnv[key];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  const folderValue = rawEnv['CLOUDINARY_FOLDER'];
  const folder =
    typeof folderValue === 'string' && folderValue.trim() !== ''
      ? folderValue.trim()
      : 'studio-gallery';

  return {
    CLOUDINARY_CLOUD_NAME: (rawEnv['CLOUDINARY_CLOUD_NAME'] as string).trim(),
    CLOUDINARY_API_KEY: (rawEnv['CLOUDINARY_API_KEY'] as string).trim(),
    CLOUDINARY_API_SECRET: (rawEnv['CLOUDINARY_API_SECRET'] as string).trim(),
    CLOUDINARY_FOLDER: folder,
    ADMIN_PASSWORD: (rawEnv['ADMIN_PASSWORD'] as string).trim(),
    SESSION_SECRET: (rawEnv['SESSION_SECRET'] as string).trim(),
  };
}
