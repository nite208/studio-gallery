import { useState, useEffect, useCallback } from 'react';
import type { AppError } from '../../shared/types';
import type { GalleryStatus, Photo, PhotosResponse } from '../types/gallery';
import { apiClient, isAppError } from '../lib/api';

export interface UseGalleryResult {
  readonly status: GalleryStatus;
  readonly photos: readonly Photo[];
  readonly cloudName: string;
  readonly error: AppError | null;
  readonly retry: () => void;
}

export function useGallery(): UseGalleryResult {
  const [status, setStatus] = useState<GalleryStatus>('loading');
  const [photos, setPhotos] = useState<readonly Photo[]>([]);
  const [cloudName, setCloudName] = useState<string>('');
  const [error, setError] = useState<AppError | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const retry = useCallback((): void => {
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    setStatus('loading');
    setError(null);

    async function fetchPhotos(): Promise<void> {
      try {
        const data = await apiClient<PhotosResponse>('/api/photos');
        if (isCancelled) {
          return;
        }
        setCloudName(data.cloudName);
        setPhotos(data.photos);
        if (data.photos.length === 0) {
          setStatus('empty');
        } else {
          setStatus('ready');
        }
      } catch (err: unknown) {
        if (isCancelled) {
          return;
        }
        const appError: AppError = isAppError(err)
          ? err
          : {
              code: 'FETCH_FAILED',
              message: err instanceof Error ? err.message : 'Failed to load gallery photos',
              status: 500,
            };
        setError(appError);
        setStatus('error');
      }
    }

    void fetchPhotos();

    return (): void => {
      isCancelled = true;
    };
  }, [retryCount]);

  return {
    status,
    photos,
    cloudName,
    error,
    retry,
  };
}
