import type { JSX } from 'react';
import { GalleryPlaceholder } from '../components/gallery/GalleryPlaceholder';
import styles from './HomePage.module.css';

export function HomePage(): JSX.Element {
  return (
    <div className={styles.container}>
      <GalleryPlaceholder />
    </div>
  );
}
