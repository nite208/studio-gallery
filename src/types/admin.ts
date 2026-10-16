export interface SignResponse {
  readonly signature: string;
  readonly timestamp: number;
  readonly asset_folder: string;
  readonly public_id: string;
  readonly apiKey: string;
  readonly cloudName: string;
}

export type UploadStatus = 'pending' | 'signing' | 'uploading' | 'success' | 'error';

export interface UploadItem {
  readonly id: string;
  readonly file: File;
  readonly status: UploadStatus;
  readonly progress: number;
  readonly error?: string;
}

export interface FileValidationError {
  readonly fileName: string;
  readonly message: string;
}
