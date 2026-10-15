import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export function NotFoundPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404 - Page Not Found</h1>
      <p className={styles.message}>The requested page does not exist.</p>
      <Link to="/" className={styles.homeLink}>
        Return to Gallery
      </Link>
    </div>
  );
}
