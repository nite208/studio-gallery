import type { Photo } from '../types/gallery';
import type { SignResponse } from '../types/admin';
import { apiClient } from './api';

interface CloudinaryUploadResponse {
  readonly public_id: string;
  readonly width: number;
  readonly height: number;
  readonly created_at: string;
}

export async function uploadPhotoFile(
  file: File,
  onProgress: (percent: number) => void
): Promise<Photo> {
  const signData = await apiClient<SignResponse>('/api/photos/sign', {
    method: 'POST',
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signData.apiKey);
  formData.append('timestamp', String(signData.timestamp));
  formData.append('signature', signData.signature);
  formData.append('asset_folder', signData.asset_folder);
  formData.append('public_id', signData.public_id);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`;

  return new Promise<Photo>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event: ProgressEvent): void => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = (): void => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
          resolve({
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            createdAt: result.created_at,
          });
        } catch {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = (): void => {
      reject(new Error('Network error during upload'));
    };

    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}
