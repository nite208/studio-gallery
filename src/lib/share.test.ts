import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sharePage } from './share';

describe('sharePage', () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'location', {
      value: { href: 'https://example.com/gallery' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('returns copied and writes to clipboard when navigator.share is absent', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText } },
      writable: true,
      configurable: true,
    });

    const result = await sharePage('Studio Placeholder');

    expect(result).toBe('copied');
    expect(writeText).toHaveBeenCalledWith('https://example.com/gallery');
  });

  it('returns copied and writes to clipboard when navigator.share throws AbortError', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    const share = vi.fn().mockRejectedValue(abortError);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: { share, clipboard: { writeText } },
      writable: true,
      configurable: true,
    });

    const result = await sharePage('Studio Placeholder');

    expect(result).toBe('copied');
    expect(writeText).toHaveBeenCalledWith('https://example.com/gallery');
  });

  it('returns shared when navigator.share resolves', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: { share },
      writable: true,
      configurable: true,
    });

    const result = await sharePage('Studio Placeholder');

    expect(result).toBe('shared');
    expect(share).toHaveBeenCalledWith({
      title: 'Studio Placeholder',
      url: 'https://example.com/gallery',
    });
  });
});
