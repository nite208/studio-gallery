const errorMap: Record<string, string> = {
  INVALID_CREDENTIALS: 'Incorrect password. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested photo could not be found.',
  INVALID_REQUEST: 'Invalid request. Please check the provided data.',
  UPSTREAM_ERROR: 'Image service encountered an error. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FILE_TOO_LARGE: 'File size exceeds the 10 MB limit.',
  INVALID_FILE_TYPE: 'File type must be JPEG, PNG, or WebP.',
  BATCH_TOO_LARGE: 'Maximum 20 files allowed per batch.',
};

export function getFriendlyErrorMessage(code: string | undefined): string {
  if (!code) {
    return 'An unexpected error occurred. Please try again.';
  }
  return errorMap[code] ?? 'An unexpected error occurred. Please try again.';
}
