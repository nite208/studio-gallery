import type { JSX } from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Photo, PhotosResponse } from '../../types/gallery';
import { Container } from '../layout/Container';
import { UploadDropzone } from './UploadDropzone';
import { UploadProgressList } from './UploadProgressList';
import { PhotoList } from './PhotoList';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { useUploadQueue } from '../../hooks/useUploadQueue';
import { apiClient, isAppError } from '../../lib/api';
import { getFriendlyErrorMessage } from '../../lib/errorMessages';
import styles from './AdminPanel.module.css';

export interface AdminPanelProps {
  readonly onLogout: () => Promise<void>;
  readonly onSessionExpired: () => void;
}

export function AdminPanel({ onLogout, onSessionExpired }: AdminPanelProps): JSX.Element {
  const [photos, setPhotos] = useState<readonly Photo[]>([]);
  const [cloudName, setCloudName] = useState<string>('');
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async (): Promise<void> => {
    try {
      const data = await apiClient<PhotosResponse>('/api/photos?fresh=1');
      setPhotos(data.photos);
      setCloudName(data.cloudName);
    } catch (err: unknown) {
      if (isAppError(err) && err.status === 401) {
        onSessionExpired();
        return;
      }
      setActionError('Failed to load gallery photos.');
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void fetchPhotos();
  }, [fetchPhotos]);

  const handlePhotoUploaded = useCallback((newPhoto: Photo): void => {
    setPhotos((prev) => [newPhoto, ...prev.filter((p) => p.publicId !== newPhoto.publicId)]);
  }, []);

  const { queue, enqueueFiles, retryUpload, clearCompleted } = useUploadQueue({
    onPhotoUploaded: handlePhotoUploaded,
    onSessionExpired,
  });

  async function handleConfirmDelete(): Promise<void> {
    if (!photoToDelete) return;
    const target = photoToDelete;
    setPhotoToDelete(null);
    setActionError(null);

    const previousPhotos = photos;
    setPhotos((prev) => prev.filter((p) => p.publicId !== target.publicId));

    try {
      await apiClient('/api/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: target.publicId }),
      });
    } catch (err: unknown) {
      setPhotos(previousPhotos);
      if (isAppError(err) && err.status === 401) {
        onSessionExpired();
        return;
      }
      const message = isAppError(err)
        ? getFriendlyErrorMessage(err.code)
        : 'Failed to delete photo. Please try again.';
      setActionError(message);
    }
  }

  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Admin Panel</h1>
            <span className={styles.subtitle}>Upload and manage your portfolio photos</span>
          </div>
          <button type="button" onClick={onLogout} className={styles.logoutButton}>
            Log Out
          </button>
        </div>

        {actionError && (
          <div className={styles.errorMessage} role="alert">
            {actionError}
          </div>
        )}

        <section className={styles.section} aria-labelledby="upload-section-title">
          <h2 id="upload-section-title" className={styles.sectionTitle}>
            Upload New Photos
          </h2>
          <UploadDropzone onFilesSelected={enqueueFiles} />
          <UploadProgressList
            queue={queue}
            onRetry={retryUpload}
            onClearCompleted={clearCompleted}
          />
        </section>

        <section className={styles.section} aria-labelledby="manage-section-title">
          <h2 id="manage-section-title" className={styles.sectionTitle}>
            Manage Gallery ({photos.length})
          </h2>
          <PhotoList
            photos={photos}
            cloudName={cloudName}
            onDeleteClick={(p) => setPhotoToDelete(p)}
          />
        </section>

        <DeleteConfirmDialog
          isOpen={photoToDelete !== null}
          photoId={photoToDelete?.publicId ?? null}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPhotoToDelete(null)}
        />
      </div>
    </Container>
  );
}
