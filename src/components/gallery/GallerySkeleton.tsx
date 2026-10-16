import type { JSX } from 'react';
import styles from './GallerySkeleton.module.css';

const skeletonHeights: readonly number[] = [280, 360, 240, 320, 400, 260, 340, 300];

export function GallerySkeleton(): JSX.Element {
  return (
    <div className={styles.grid} aria-label="Loading gallery" aria-busy="true">
      {skeletonHeights.map((height, index) => (
        <div
          key={index}
          className={styles.card}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}
