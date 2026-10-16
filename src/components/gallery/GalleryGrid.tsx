import type { JSX } from 'react';
import type { Photo } from '../../types/gallery';
import { siteConfig } from '../../config/site';
import { buildDeliveryUrl, buildSrcSet } from '../../lib/cloudinaryUrl';
import styles from './GalleryGrid.module.css';

export interface GalleryGridProps {
  readonly photos: readonly Photo[];
  readonly cloudName: string;
  readonly onPhotoClick: (index: number, element: HTMLElement) => void;
}

export function GalleryGrid({
  photos,
  cloudName,
  onPhotoClick,
}: GalleryGridProps): JSX.Element {
  return (
    <div className={styles.masonry} role="region" aria-label="Photo gallery">
      {photos.map((photo, index) => (
        <div key={photo.publicId} className={styles.item}>
          <button
            type="button"
            className={styles.button}
            onClick={(e) => onPhotoClick(index, e.currentTarget)}
            aria-label={`View ${siteConfig.galleryAltPrefix} ${index + 1}`}
          >
            <img
              src={buildDeliveryUrl(cloudName, photo.publicId, 800)}
              srcSet={buildSrcSet(cloudName, photo.publicId)}
              sizes="(min-width: 1280px) 25vw, (min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              alt={`${siteConfig.galleryAltPrefix} ${index + 1}`}
              className={styles.image}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
