import type { JSX } from 'react';
import { useState, useCallback } from 'react';
import type { Photo } from '../../types/gallery';
import { siteConfig } from '../../config/site';
import { buildDeliveryUrl, buildSrcSet } from '../../lib/cloudinaryUrl';
import styles from './GalleryGrid.module.css';

export interface GalleryGridProps {
  readonly photos: readonly Photo[];
  readonly cloudName: string;
  readonly onPhotoClick: (index: number, element: HTMLElement) => void;
}

interface GalleryItemProps {
  readonly photo: Photo;
  readonly index: number;
  readonly cloudName: string;
  readonly onPhotoClick: (index: number, element: HTMLElement) => void;
}

function GalleryItem({ photo, index, cloudName, onPhotoClick }: GalleryItemProps): JSX.Element {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback((): void => {
    setLoaded(true);
  }, []);

  return (
    <div className={styles.item}>
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
          className={`${styles.image} ${loaded ? styles.imageLoaded : ''}`}
          onLoad={handleLoad}
        />
      </button>
    </div>
  );
}

export function GalleryGrid({
  photos,
  cloudName,
  onPhotoClick,
}: GalleryGridProps): JSX.Element {
  return (
    <div className={styles.masonry} role="region" aria-label="Photo gallery">
      {photos.map((photo, index) => (
        <GalleryItem
          key={photo.publicId}
          photo={photo}
          index={index}
          cloudName={cloudName}
          onPhotoClick={onPhotoClick}
        />
      ))}
    </div>
  );
}
