import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import type { Photo } from '../../types/gallery';
import { siteConfig } from '../../config/site';
import { buildDeliveryUrl, buildSrcSet } from '../../lib/cloudinaryUrl';
import styles from './Lightbox.module.css';

export interface LightboxProps {
  readonly isOpen: boolean;
  readonly photos: readonly Photo[];
  readonly cloudName: string;
  readonly currentIndex: number;
  readonly onClose: () => void;
  readonly onNavigate: (index: number) => void;
  readonly triggerElement: HTMLElement | null;
}

export function Lightbox({
  isOpen,
  photos,
  cloudName,
  currentIndex,
  onClose,
  onNavigate,
  triggerElement,
}: LightboxProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
  const nextIndex = (currentIndex + 1) % photos.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = '';
      if (triggerElement) triggerElement.focus();
    }

    return (): void => {
      document.body.style.overflow = '';
    };
  }, [isOpen, triggerElement]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate(prevIndex);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate(nextIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return (): void => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, prevIndex, nextIndex, onNavigate, onClose]);

  useEffect(() => {
    if (!isOpen || photos.length <= 1) return;
    const nextPhoto = photos[nextIndex];
    const prevPhoto = photos[prevIndex];
    if (nextPhoto) new Image().src = buildDeliveryUrl(cloudName, nextPhoto.publicId, 1600);
    if (prevPhoto) new Image().src = buildDeliveryUrl(cloudName, prevPhoto.publicId, 1600);
  }, [isOpen, nextIndex, prevIndex, photos, cloudName]);

  if (!isOpen || photos.length === 0) return null;
  const currentPhoto = photos[currentIndex];
  if (!currentPhoto) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      aria-label="Image lightbox"
    >
      <div className={styles.topBar}>
        <span className={styles.counter}>
          {currentIndex + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close dialog"
        >
          &times;
        </button>
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onNavigate(prevIndex)}
            className={styles.prevButton}
            aria-label="Previous photo"
          >
            &#8249;
          </button>
          <button
            type="button"
            onClick={() => onNavigate(nextIndex)}
            className={styles.nextButton}
            aria-label="Next photo"
          >
            &#8250;
          </button>
        </>
      )}

      <div className={styles.content}>
        <img
          src={buildDeliveryUrl(cloudName, currentPhoto.publicId, 1600)}
          srcSet={buildSrcSet(cloudName, currentPhoto.publicId)}
          width={currentPhoto.width}
          height={currentPhoto.height}
          alt={`${siteConfig.galleryAltPrefix} ${currentIndex + 1}`}
          className={styles.image}
        />
      </div>
    </dialog>
  );
}
