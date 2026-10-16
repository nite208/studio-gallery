import { describe, it, expect } from 'vitest';
import { buildDeliveryUrl, buildSrcSet, CLOUDINARY_SRCSET_WIDTHS } from './cloudinaryUrl';

describe('cloudinaryUrl', () => {
  const cloudName = 'sample-cloud';
  const publicId = 'studio-gallery/photo-1';

  it('builds delivery URL with f_auto, q_auto, and requested width', () => {
    const url = buildDeliveryUrl(cloudName, publicId, 800);
    expect(url).toBe(
      'https://res.cloudinary.com/sample-cloud/image/upload/f_auto,q_auto,w_800/studio-gallery/photo-1'
    );
  });

  it('strips leading slash from publicId if present', () => {
    const url = buildDeliveryUrl(cloudName, '/studio-gallery/photo-1', 400);
    expect(url).toBe(
      'https://res.cloudinary.com/sample-cloud/image/upload/f_auto,q_auto,w_400/studio-gallery/photo-1'
    );
  });

  it('builds srcset covering widths 400, 800, 1200, 1600', () => {
    const srcset = buildSrcSet(cloudName, publicId);

    for (const width of CLOUDINARY_SRCSET_WIDTHS) {
      expect(srcset).toContain(`w_${width}/studio-gallery/photo-1 ${width}w`);
    }

    const entries = srcset.split(', ');
    expect(entries.length).toBe(4);
    expect(entries[0]).toBe(
      'https://res.cloudinary.com/sample-cloud/image/upload/f_auto,q_auto,w_400/studio-gallery/photo-1 400w'
    );
    expect(entries[3]).toBe(
      'https://res.cloudinary.com/sample-cloud/image/upload/f_auto,q_auto,w_1600/studio-gallery/photo-1 1600w'
    );
  });
});
