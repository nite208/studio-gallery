import type { EventContext } from '@cloudflare/workers-types';
import { validateEnv } from '../../_lib/env';
import { createAppError } from '../../_lib/errors';
import { errorResponse, jsonResponse } from '../../_lib/http';
import { extractSessionCookie, verifySessionToken } from '../../_lib/auth';
import { buildUploadSignature, generateRandomPublicId } from '../../_lib/cloudinary';

export async function onRequestPost(
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

  const timestamp = Math.floor(Date.now() / 1000);
  const assetFolder = env.CLOUDINARY_FOLDER;
  const publicId = generateRandomPublicId();

  const signature = await buildUploadSignature(
    {
      asset_folder: assetFolder,
      public_id: publicId,
      timestamp,
    },
    env.CLOUDINARY_API_SECRET
  );

  return jsonResponse({
    signature,
    timestamp,
    asset_folder: assetFolder,
    public_id: publicId,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
  });
}
