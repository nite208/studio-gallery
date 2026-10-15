export interface ServerEnv {
  readonly CLOUDINARY_CLOUD_NAME: string;
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
}

export type RawEnv = Record<string, string | undefined>;
