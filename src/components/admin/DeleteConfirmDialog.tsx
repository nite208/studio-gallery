import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import styles from './DeleteConfirmDialog.module.css';

export interface DeleteConfirmDialogProps {
  readonly isOpen: boolean;
  readonly photoId: string | null;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  photoId,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  if (!isOpen || !photoId) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onCancel();
        }
      }}
      aria-labelledby="confirm-dialog-title"
    >
      <h2 id="confirm-dialog-title" className={styles.title}>
        Delete Photo
      </h2>
      <p className={styles.message}>
        Are you sure you want to delete this photo from the gallery? This action cannot be undone.
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={styles.deleteButton}>
          Delete
        </button>
      </div>
    </dialog>
  );
}
