import type { JSX } from 'react';
import { AdminPlaceholder } from '../components/admin/AdminPlaceholder';
import styles from './AdminPage.module.css';

export function AdminPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <AdminPlaceholder />
    </div>
  );
}
