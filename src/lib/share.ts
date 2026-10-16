export async function sharePage(title: string): Promise<'shared' | 'copied'> {
  const url = window.location.href;
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url });
      return 'shared';
    } catch {
      // AbortError from user dismiss is fine; fall through to clipboard
    }
  }
  await navigator.clipboard.writeText(url);
  return 'copied';
}
