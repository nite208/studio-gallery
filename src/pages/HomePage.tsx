import type { JSX } from 'react';
import { GallerySection } from '../components/gallery/GallerySection';
import styles from './HomePage.module.css';

export function HomePage(): JSX.Element {
  return (
    <div className={styles.container}>
      <GallerySection />
    </div>
  );
}
