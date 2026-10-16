import type { JSX } from 'react';
import { useState, useCallback } from 'react';
import { siteConfig } from '../../config/site';
import { useGallery } from '../../hooks/useGallery';
import { Container } from '../layout/Container';
import { GallerySkeleton } from './GallerySkeleton';
import { GalleryGrid } from './GalleryGrid';
import { Lightbox } from './Lightbox';
import styles from './GallerySection.module.css';

export function GallerySection(): JSX.Element {
  const { status, photos, cloudName, error, retry } = useGallery();
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
    <section className={styles.section} aria-labelledby="gallery-heading">
      <Container>
        <div className={styles.header}>
          <h1 id="gallery-heading" className={styles.title}>
            Portfolio Gallery
          </h1>
          <p className={styles.description}>{siteConfig.tagline}</p>
        </div>

        {status === 'loading' && <GallerySkeleton />}

        {status === 'empty' && (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>No Photos Yet</h2>
            <p className={styles.stateMessage}>
              Our portfolio is currently being curated. Please check back soon for our latest work.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.stateCard} role="alert">
            <h2 className={styles.stateTitle}>Unable to Load Gallery</h2>
            <p className={styles.stateMessage}>
              {error?.message || 'A network error occurred while retrieving gallery photos.'}
            </p>
            <button
              type="button"
              onClick={retry}
              className={styles.retryButton}
            >
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
      </Container>
    </section>
  );
}
