import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import styles from './NotFoundPage.module.css';

export function NotFoundPage(): JSX.Element {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.inner}>
          <h1 className={styles.title}>404 - Page Not Found</h1>
          <p className={styles.message}>The requested page does not exist.</p>
          <Link to="/" className={styles.homeLink}>
            Return to Gallery
          </Link>
        </div>
      </Container>
    </section>
  );
}
