import type { JSX, FormEvent } from 'react';
import { useState } from 'react';
import { isAppError } from '../../lib/api';
import { getFriendlyErrorMessage } from '../../lib/errorMessages';
import styles from './LoginForm.module.css';

export interface LoginFormProps {
  readonly onLogin: (password: string) => Promise<void>;
}

export function LoginForm({ onLogin }: LoginFormProps): JSX.Element {
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onLogin(password);
    } catch (err: unknown) {
      if (isAppError(err)) {
        setErrorMessage(getFriendlyErrorMessage(err.code));
      } else {
        setErrorMessage('Failed to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Access</h1>
      <p className={styles.subtitle}>Enter the administrator password to manage gallery photos.</p>

      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="admin-password" className={styles.label}>
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className={styles.input}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
