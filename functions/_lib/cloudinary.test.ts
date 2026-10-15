import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildUploadSignature,
  generateRandomPublicId,
  getCloudinaryResource,
} from './cloudinary';

describe('cloudinary utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateRandomPublicId', () => {
    it('generates a non-empty string identifier without hyphens', () => {
      const id = generateRandomPublicId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      expect(id).not.toContain('-');
    });

    it('generates unique random identifiers', () => {
      const id1 = generateRandomPublicId();
      const id2 = generateRandomPublicId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('buildUploadSignature', () => {
    it('sorts parameters alphabetically including asset_folder and public_id', async () => {
      const params = {
        timestamp: 1315060501,
        asset_folder: 'studio-gallery',
        public_id: 'random_id_123',
      };
      const apiSecret = 'test_secret';
      const signature = await buildUploadSignature(params, apiSecret);

      const encoder = new TextEncoder();
      const expectedStringToSign =
        'asset_folder=studio-gallery&public_id=random_id_123&timestamp=1315060501test_secret';
      const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(expectedStringToSign));
      const hashBytes = new Uint8Array(hashBuffer);
      let expectedHex = '';
      for (let i = 0; i < hashBytes.length; i++) {
        expectedHex += (hashBytes[i] ?? 0).toString(16).padStart(2, '0');
      }

      expect(signature).toBe(expectedHex);
    });

    it('filters out non-signed parameters like file, cloud_name, and api_key', async () => {
      const params = {
        timestamp: 1315060501,
        asset_folder: 'studio-gallery',
        public_id: 'random_id_123',
        file: 'ignored_file_data',
        cloud_name: 'ignored_cloud',
        api_key: 'ignored_key',
        signature: 'ignored_sig',
      };
      const apiSecret = 'test_secret';
      const signatureWithExtras = await buildUploadSignature(params, apiSecret);
      const signatureClean = await buildUploadSignature(
        {
          timestamp: 1315060501,
          asset_folder: 'studio-gallery',
          public_id: 'random_id_123',
        },
        apiSecret
      );

      expect(signatureWithExtras).toBe(signatureClean);
    });
  });

  describe('getCloudinaryResource', () => {
    it('returns found status with resource details when resource exists', async () => {
      const mockResource = {
        public_id: 'photo_abc',
        asset_folder: 'studio-gallery',
        width: 1200,
        height: 800,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResource), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getCloudinaryResource('test-cloud', 'key', 'secret', 'photo_abc');
      expect(result.status).toBe('found');
      if (result.status === 'found') {
        expect(result.resource.public_id).toBe('photo_abc');
        expect(result.resource.asset_folder).toBe('studio-gallery');
      }
    });

    it('returns not_found status when API returns 404', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Resource not found' } }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getCloudinaryResource('test-cloud', 'key', 'secret', 'missing_photo');
      expect(result.status).toBe('not_found');
    });

    it('returns error status on server failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('Internal Server Error', { status: 500 })
      );

      const result = await getCloudinaryResource('test-cloud', 'key', 'secret', 'photo_err');
      expect(result.status).toBe('error');
    });
  });
});
