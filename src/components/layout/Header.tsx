import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site';
import { Container } from './Container';
import styles from './Header.module.css';

export function Header(): JSX.Element {
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
          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>
              Gallery
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
