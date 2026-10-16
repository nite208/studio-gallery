import type { JSX } from 'react';
import { useState, useCallback } from 'react';
import type { UseGalleryResult } from '../../hooks/useGallery';
import { useGallery } from '../../hooks/useGallery';
import { siteConfig } from '../../config/site';
import { Container } from '../layout/Container';
import { GallerySkeleton } from './GallerySkeleton';
import { GalleryGrid } from './GalleryGrid';
import { Lightbox } from './Lightbox';
import styles from './GallerySection.module.css';

export interface GallerySectionProps {
  readonly galleryResult?: UseGalleryResult;
}

function GalleryContent({ galleryResult }: Required<GallerySectionProps>): JSX.Element {
  const { status, photos, cloudName, error, retry } = galleryResult;
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [activeTriggerElement, setActiveTriggerElement] = useState<HTMLElement | null>(null);

  const handlePhotoClick = useCallback((index: number, element: HTMLElement): void => {
    setActivePhotoIndex(index);
    setActiveTriggerElement(element);
  }, []);

  const handleCloseLightbox = useCallback((): void => {
    setActivePhotoIndex(null);
  }, []);

  const handleNavigateLightbox = useCallback((index: number): void => {
    setActivePhotoIndex(index);
  }, []);

  return (
    <>
      {status === 'loading' && <GallerySkeleton />}

      {status === 'empty' && (
        <div className={styles.stateCard}>
          <h3 className={styles.stateTitle}>No Photos Yet</h3>
          <p className={styles.stateMessage}>
            Our portfolio is currently being curated. Please check back soon.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.stateCard} role="alert">
          <h3 className={styles.stateTitle}>Unable to Load Gallery</h3>
          <p className={styles.stateMessage}>
            {error?.message || 'A network error occurred while retrieving gallery photos.'}
          </p>
          <button type="button" onClick={retry} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <GalleryGrid
            photos={photos}
            cloudName={cloudName}
            onPhotoClick={handlePhotoClick}
          />
          <Lightbox
            isOpen={activePhotoIndex !== null}
            photos={photos}
            cloudName={cloudName}
            currentIndex={activePhotoIndex ?? 0}
            onClose={handleCloseLightbox}
            onNavigate={handleNavigateLightbox}
            triggerElement={activeTriggerElement}
          />
        </>
      )}
    </>
  );
}

function GallerySectionWithOwnFetch(): JSX.Element {
  const result = useGallery();
  return <GalleryContent galleryResult={result} />;
}

export function GallerySection({ galleryResult }: GallerySectionProps): JSX.Element {
  return (
    <section className={styles.section} aria-labelledby="gallery-heading">
      <Container>
        <div className={styles.header}>
          <h2 id="gallery-heading" className={styles.title}>
            Portfolio Gallery
          </h2>
          <p className={styles.description}>{siteConfig.tagline}</p>
        </div>
        {galleryResult ? (
          <GalleryContent galleryResult={galleryResult} />
        ) : (
          <GallerySectionWithOwnFetch />
        )}
      </Container>
    </section>
  );
}
