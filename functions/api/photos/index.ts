import type { EventContext } from '@cloudflare/workers-types';
import { validateEnv } from '../../_lib/env';
import { createAppError } from '../../_lib/errors';
import { errorResponse, jsonResponse } from '../../_lib/http';
import { extractSessionCookie, verifySessionToken } from '../../_lib/auth';
import {
  deleteCloudinaryPhoto,
  fetchAllPhotosInFolder,
  getCloudinaryResource,
} from '../../_lib/cloudinary';

export async function onRequestGet(
  context: EventContext<Record<string, unknown>, string, Record<string, unknown>>
): Promise<Response> {
  const env = validateEnv(context.env);
  const url = new URL(context.request.url);
  const cacheKey = new Request(new URL('/api/photos', url).toString(), {
    method: 'GET',
  });

  const isFreshRequested = url.searchParams.get('fresh') === '1';
  let shouldBypassCache = false;

  if (isFreshRequested) {
    const cookieHeader = context.request.headers.get('Cookie');
    const token = extractSessionCookie(cookieHeader);
    if (token) {
      const isAuthenticated = await verifySessionToken(token, env.SESSION_SECRET);
      if (isAuthenticated) {
        shouldBypassCache = true;
      }
    }
  }

  const cache = typeof caches !== 'undefined' && 'default' in caches ? caches.default : undefined;

  if (!shouldBypassCache && cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const photos = await fetchAllPhotosInFolder(
    env.CLOUDINARY_CLOUD_NAME,
    env.CLOUDINARY_API_KEY,
    env.CLOUDINARY_API_SECRET,
    env.CLOUDINARY_FOLDER
  );

  const response = jsonResponse(
    {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      photos,
    },
    200,
    {
      'Cache-Control': 'public, max-age=60',
    }
  );

  if (cache) {
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}

export async function onRequestDelete(
  context: EventContext<Record<string, unknown>, string, Record<string, unknown>>
): Promise<Response> {
  const env = validateEnv(context.env);
  const cookieHeader = context.request.headers.get('Cookie');
  const token = extractSessionCookie(cookieHeader);

  if (!token) {
    return errorResponse(createAppError('UNAUTHORIZED', 'Authentication required', 401));
  }

  const isAuthenticated = await verifySessionToken(token, env.SESSION_SECRET);
  if (!isAuthenticated) {
    return errorResponse(createAppError('UNAUTHORIZED', 'Authentication required', 401));
  }

  let body: { publicId?: unknown };
  try {
    body = (await context.request.json()) as { publicId?: unknown };
  } catch {
    return errorResponse(createAppError('INVALID_REQUEST', 'Invalid request body', 400));
  }

  if (typeof body.publicId !== 'string' || body.publicId.trim() === '') {
    return errorResponse(createAppError('INVALID_REQUEST', 'Missing publicId', 400));
  }

  const publicId = body.publicId.trim();

  const lookupResult = await getCloudinaryResource(
    env.CLOUDINARY_CLOUD_NAME,
    env.CLOUDINARY_API_KEY,
    env.CLOUDINARY_API_SECRET,
    publicId
  );

  if (lookupResult.status === 'not_found') {
    return errorResponse(createAppError('NOT_FOUND', 'Photo not found', 404));
  }

  if (lookupResult.status === 'error') {
    return errorResponse(createAppError('UPSTREAM_ERROR', lookupResult.message, 502));
  }

  if (lookupResult.resource.asset_folder !== env.CLOUDINARY_FOLDER) {
    return errorResponse(
      createAppError('FORBIDDEN', 'Access denied to asset in another folder', 403)
    );
  }

  await deleteCloudinaryPhoto(
    env.CLOUDINARY_CLOUD_NAME,
    env.CLOUDINARY_API_KEY,
    env.CLOUDINARY_API_SECRET,
    publicId
  );

  const cache = typeof caches !== 'undefined' && 'default' in caches ? caches.default : undefined;
  if (cache) {
    const cacheKey = new Request(new URL('/api/photos', context.request.url).toString(), {
      method: 'GET',
    });
    context.waitUntil(cache.delete(cacheKey));
  }

  return jsonResponse({ success: true });
}
