import type { JSX } from 'react';
import type { Photo } from '../../types/gallery';
import { buildDeliveryUrl } from '../../lib/cloudinaryUrl';
import styles from './PhotoList.module.css';

export interface PhotoListProps {
  readonly photos: readonly Photo[];
  readonly cloudName: string;
  readonly onDeleteClick: (photo: Photo) => void;
}

export function PhotoList({
  photos,
  cloudName,
  onDeleteClick,
}: PhotoListProps): JSX.Element {
  if (photos.length === 0) {
    return (
      <div className={styles.emptyState}>
        No photos uploaded yet. Use the upload area above to add photos.
      </div>
    );
  }

  return (
    <div className={styles.list} role="region" aria-label="Managed photos">
      {photos.map((photo) => (
        <div key={photo.publicId} className={styles.card}>
          <div className={styles.thumbnailContainer}>
            <img
              src={buildDeliveryUrl(cloudName, photo.publicId, 400)}
              alt={photo.publicId}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              className={styles.thumbnail}
            />
          </div>
          <div className={styles.details}>
            <span className={styles.publicId} title={photo.publicId}>
              {photo.publicId}
            </span>
            <span className={styles.meta}>
              {photo.width} &times; {photo.height} px
            </span>
            <button
              type="button"
              onClick={() => onDeleteClick(photo)}
              className={styles.deleteButton}
              aria-label={`Delete photo ${photo.publicId}`}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
