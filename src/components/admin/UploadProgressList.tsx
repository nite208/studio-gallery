import type { JSX } from 'react';
import type { UploadItem } from '../../types/admin';
import styles from './UploadProgressList.module.css';

export interface UploadProgressListProps {
  readonly queue: readonly UploadItem[];
  readonly onRetry: (id: string) => void;
  readonly onClearCompleted: () => void;
}

export function UploadProgressList({
  queue,
  onRetry,
  onClearCompleted,
}: UploadProgressListProps): JSX.Element | null {
  if (queue.length === 0) {
    return null;
  }

  const hasCompleted = queue.some((item) => item.status === 'success');

  function getStatusBadge(item: UploadItem): JSX.Element {
    if (item.status === 'pending') {
      return <span className={`${styles.statusText} ${styles.statusPending}`}>Queued</span>;
    }
    if (item.status === 'uploading') {
      return <span className={`${styles.statusText} ${styles.statusUploading}`}>{item.progress}%</span>;
    }
    if (item.status === 'success') {
      return <span className={`${styles.statusText} ${styles.statusSuccess}`}>Uploaded</span>;
    }
    return <span className={`${styles.statusText} ${styles.statusError}`}>Failed</span>;
  }

  return (
    <div className={styles.container} role="region" aria-label="Upload progress">
      <div className={styles.header}>
        <span className={styles.title}>Upload Queue ({queue.length})</span>
        {hasCompleted && (
          <button type="button" onClick={onClearCompleted} className={styles.clearButton}>
            Clear Finished
          </button>
        )}
      </div>

      {queue.map((item) => (
        <div key={item.id} className={styles.item}>
          <div className={styles.row}>
            <span className={styles.fileName}>{item.file.name}</span>
            {getStatusBadge(item)}
          </div>

          {item.status === 'uploading' && (
            <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.progressBarFill} style={{ width: `${item.progress}%` }} />
            </div>
          )}

          {item.status === 'error' && (
            <div className={styles.errorRow}>
              <span>{item.error || 'Upload failed'}</span>
              <button
                type="button"
                onClick={() => onRetry(item.id)}
                className={styles.retryButton}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
