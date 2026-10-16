import type { JSX } from 'react';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site';
import { usePhotoCount } from '../../lib/photoCountContext';
import { sharePage } from '../../lib/share';
import { Container } from './Container';
import styles from './Header.module.css';

export function Header(): JSX.Element {
  const photoCount = usePhotoCount();
  const [shareLabel, setShareLabel] = useState<'Share' | 'Copied!'>('Share');

  const handleShare = useCallback(async (): Promise<void> => {
    const result = await sharePage(siteConfig.studioName);
    if (result === 'copied') {
      setShareLabel('Copied!');
      setTimeout(() => setShareLabel('Share'), 2000);
    }
  }, []);

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <Link to="/" className={styles.brandLink}>
            {siteConfig.logoUrl ? (
              <img
                src={siteConfig.logoUrl}
                alt={siteConfig.studioName}
                className={styles.logo}
              />
            ) : (
              <span className={styles.studioName}>{siteConfig.studioName}</span>
            )}
          </Link>
          <div className={styles.actions}>
            {photoCount > 0 && (
              <span className={styles.photoCount}>{photoCount} photos</span>
            )}
            <button
              type="button"
              className={styles.shareButton}
              onClick={() => void handleShare()}
              aria-live="polite"
            >
              {shareLabel}
            </button>
            <nav className={styles.nav}>
              <Link to="/" className={styles.navLink}>
                Gallery
              </Link>
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
