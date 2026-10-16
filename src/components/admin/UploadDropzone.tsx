import type { JSX, DragEvent, ChangeEvent } from 'react';
import { useState, useRef } from 'react';
import type { FileValidationError } from '../../types/admin';
import styles from './UploadDropzone.module.css';

const ALLOWED_MIME_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_BATCH_SIZE = 20;

export interface UploadDropzoneProps {
  readonly onFilesSelected: (files: readonly File[]) => void;
  readonly disabled?: boolean;
}

export function UploadDropzone({ onFilesSelected, disabled = false }: UploadDropzoneProps): JSX.Element {
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<readonly FileValidationError[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function processFiles(fileList: FileList | readonly File[]): void {
    const rawFiles: File[] = Array.from(fileList);
    const errors: FileValidationError[] = [];

    if (rawFiles.length > MAX_BATCH_SIZE) {
      errors.push({
        fileName: 'Batch selection',
        message: `Maximum ${MAX_BATCH_SIZE} files allowed per batch. Please select fewer files.`,
      });
      setValidationErrors(errors);
      return;
    }

    const validFiles: File[] = [];

    for (const file of rawFiles) {
      let isFileValid = true;

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push({ fileName: file.name, message: 'Invalid format. Allowed: JPEG, PNG, WebP.' });
        isFileValid = false;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push({ fileName: file.name, message: 'Exceeds 10 MB size limit.' });
        isFileValid = false;
      }

      if (isFileValid) {
        validFiles.push(file);
      }
    }

    setValidationErrors(errors);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    setIsDragActive(false);
    if (!disabled && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  const triggerBrowse = (): void => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div>
      <div
        className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
        onClick={triggerBrowse}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragActive(false);
        }}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerBrowse();
          }
        }}
        aria-label="Upload photos by drag and drop or clicking to browse"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className={styles.hiddenInput}
          disabled={disabled}
        />
        <span className={styles.title}>Click or drag photos here to upload</span>
        <span className={styles.subtitle}>
          JPEG, PNG, or WebP up to 10 MB each (maximum 20 files per batch)
        </span>
      </div>

      {validationErrors.length > 0 && (
        <div className={styles.errorsContainer} role="alert">
          <div className={styles.errorsHeader}>
            <span className={styles.errorsTitle}>Validation Issues</span>
            <button
              type="button"
              onClick={() => setValidationErrors([])}
              className={styles.clearErrorsButton}
            >
              Dismiss
            </button>
          </div>
          <ul className={styles.errorList}>
            {validationErrors.map((err, i) => (
              <li key={i} className={styles.errorItem}>
                <strong>{err.fileName}</strong>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
