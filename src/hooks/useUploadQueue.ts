import { useState, useEffect, useRef, useCallback } from 'react';
import type { Photo } from '../types/gallery';
import type { UploadItem } from '../types/admin';
import { uploadPhotoFile } from '../lib/cloudinaryUpload';
import { isAppError } from '../lib/api';
import { getFriendlyErrorMessage } from '../lib/errorMessages';

export interface UseUploadQueueOptions {
  readonly onPhotoUploaded: (photo: Photo) => void;
  readonly onSessionExpired: () => void;
}

export interface UseUploadQueueResult {
  readonly queue: readonly UploadItem[];
  readonly enqueueFiles: (files: readonly File[]) => void;
  readonly retryUpload: (id: string) => void;
  readonly clearCompleted: () => void;
}

export function useUploadQueue({
  onPhotoUploaded,
  onSessionExpired,
}: UseUploadQueueOptions): UseUploadQueueResult {
  const [queue, setQueue] = useState<readonly UploadItem[]>([]);
  const activeIdsRef = useRef<Set<string>>(new Set());

  const enqueueFiles = useCallback((files: readonly File[]): void => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const retryUpload = useCallback((id: string): void => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'pending', progress: 0, error: undefined } : item
      )
    );
  }, []);

  const clearCompleted = useCallback((): void => {
    setQueue((prev) => prev.filter((item) => item.status !== 'success'));
  }, []);

  const startUpload = useCallback(
    async (item: UploadItem): Promise<void> => {
      activeIdsRef.current.add(item.id);
      setQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i))
      );

      try {
        const photo = await uploadPhotoFile(item.file, (progress) => {
          setQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
          );
        });

        activeIdsRef.current.delete(item.id);
        setQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'success', progress: 100 } : i))
        );
        onPhotoUploaded(photo);
      } catch (err: unknown) {
        activeIdsRef.current.delete(item.id);
        if (isAppError(err) && err.status === 401) {
          onSessionExpired();
          return;
        }

        const message = isAppError(err)
          ? getFriendlyErrorMessage(err.code)
          : err instanceof Error
            ? err.message
            : 'Upload failed';

        setQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: message } : i))
        );
      }
    },
    [onPhotoUploaded, onSessionExpired]
  );

  useEffect(() => {
    const pendingItems = queue.filter(
      (item) => item.status === 'pending' && !activeIdsRef.current.has(item.id)
    );

    const availableSlots = 3 - activeIdsRef.current.size;
    if (availableSlots <= 0 || pendingItems.length === 0) {
      return;
    }

    const itemsToStart = pendingItems.slice(0, availableSlots);
    for (const item of itemsToStart) {
      void startUpload(item);
    }
  }, [queue, startUpload]);

  return {
    queue,
    enqueueFiles,
    retryUpload,
    clearCompleted,
  };
}
