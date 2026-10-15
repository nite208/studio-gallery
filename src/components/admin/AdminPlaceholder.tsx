import type { JSX } from 'react';
import styles from './AdminPlaceholder.module.css';

export function AdminPlaceholder(): JSX.Element {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.description}>
        Administrative controls and gallery management will be configured here.
      </p>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Management Portal</h2>
        <p className={styles.cardText}>
          Authentication and asset management features are scheduled for subsequent phases.
        </p>
      </div>
    </section>
  );
}
