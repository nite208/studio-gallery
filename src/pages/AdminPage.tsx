import type { JSX } from 'react';
import { useSession } from '../hooks/useSession';
import { LoginForm } from '../components/admin/LoginForm';
import { AdminPanel } from '../components/admin/AdminPanel';
import styles from './AdminPage.module.css';

export function AdminPage(): JSX.Element {
  const { isAuthenticated, isLoading, login, logout, expireSession } = useSession();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Checking session...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isAuthenticated ? (
        <AdminPanel onLogout={logout} onSessionExpired={expireSession} />
      ) : (
        <LoginForm onLogin={login} />
      )}
    </div>
  );
}
