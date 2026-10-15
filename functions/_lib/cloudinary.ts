export interface CloudinaryPhoto {
  readonly publicId: string;
  readonly width: number;
  readonly height: number;
  readonly createdAt: string;
}

export interface CloudinaryResourceDetails {
  readonly public_id: string;
  readonly asset_folder?: string;
  readonly width?: number;
  readonly height?: number;
}

export type FetchResourceResult =
  | { readonly status: 'found'; readonly resource: CloudinaryResourceDetails }
  | { readonly status: 'not_found' }
  | { readonly status: 'error'; readonly message: string };

interface CloudinarySearchItem {
  readonly public_id: string;
  readonly width: number;
  readonly height: number;
  readonly created_at: string;
}

interface CloudinarySearchResponse {
  readonly resources?: readonly CloudinarySearchItem[];
  readonly next_cursor?: string;
}

export function generateRandomPublicId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export async function buildUploadSignature(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  const excluded = new Set(['file', 'cloud_name', 'resource_type', 'api_key', 'signature']);
  const serialized = Object.keys(params)
    .filter((k) => !excluded.has(k))
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const buffer = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(`${serialized}${apiSecret}`)
  );
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function fetchAllPhotosInFolder(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  folder: string
): Promise<readonly CloudinaryPhoto[]> {
  const photos: CloudinaryPhoto[] = [];
  let nextCursor: string | undefined = undefined;
  const auth = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;

  do {
    const searchBody = {
      expression: `asset_folder="${folder}" AND resource_type:image`,
      sort_by: [{ created_at: 'desc' }],
      max_results: 100,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    };
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      throw new Error(`Cloudinary search failed with status ${response.status}`);
    }

    const data = (await response.json()) as CloudinarySearchResponse;
    if (data.resources) {
      for (const res of data.resources) {
        photos.push({
          publicId: res.public_id,
          width: res.width,
          height: res.height,
          createdAt: res.created_at,
        });
      }
    }
    nextCursor = data.next_cursor;
  } while (nextCursor);

  return photos;
}

export async function getCloudinaryResource(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  publicId: string
): Promise<FetchResourceResult> {
  const auth = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;
  const encodedId = encodeURIComponent(publicId);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${encodedId}`,
    { method: 'GET', headers: { Authorization: auth } }
  );

  if (response.status === 404) {
    return { status: 'not_found' };
  }

  if (!response.ok) {
    return {
      status: 'error',
      message: `Cloudinary get resource failed with status ${response.status}`,
    };
  }

  const data = (await response.json()) as CloudinaryResourceDetails;
  return { status: 'found', resource: data };
}

export async function deleteCloudinaryPhoto(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  publicId: string
): Promise<boolean> {
  const auth = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_id: publicId }),
  });

  if (!response.ok) {
    throw new Error(`Cloudinary destroy failed with status ${response.status}`);
  }

  const data = (await response.json()) as { readonly result?: string };
  return data.result === 'ok';
}
