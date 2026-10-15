import type { JSX } from 'react';
import { siteConfig } from '../../config/site';
import styles from './GalleryPlaceholder.module.css';

export function GalleryPlaceholder(): JSX.Element {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Portfolio Gallery</h1>
      <p className={styles.description}>
        {siteConfig.galleryAltPrefix} collection will be displayed here.
      </p>
      <div className={styles.gridPlaceholder}>
        <div className={styles.cardPlaceholder}>
          <div className={styles.imagePlaceholder} />
          <span className={styles.caption}>Featured Work One</span>
        </div>
        <div className={styles.cardPlaceholder}>
          <div className={styles.imagePlaceholder} />
          <span className={styles.caption}>Featured Work Two</span>
        </div>
        <div className={styles.cardPlaceholder}>
          <div className={styles.imagePlaceholder} />
          <span className={styles.caption}>Featured Work Three</span>
        </div>
      </div>
    </section>
  );
}
