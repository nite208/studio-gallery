import type { EventContext } from '@cloudflare/workers-types';
import { validateEnv } from '../../_lib/env';
import { createAppError } from '../../_lib/errors';
import { errorResponse, jsonResponse } from '../../_lib/http';
import {
  createSessionCookie,
  createSessionToken,
  timingSafeEqual,
} from '../../_lib/auth';

export async function onRequestPost(
  context: EventContext<Record<string, unknown>, string, Record<string, unknown>>
): Promise<Response> {
  const env = validateEnv(context.env);

  let body: { password?: unknown };
  try {
    body = (await context.request.json()) as { password?: unknown };
  } catch {
    return errorResponse(createAppError('INVALID_REQUEST', 'Invalid request body', 400));
  }

  if (typeof body.password !== 'string') {
    return errorResponse(createAppError('INVALID_CREDENTIALS', 'Invalid credentials', 401));
  }

  const isMatch = await timingSafeEqual(body.password, env.ADMIN_PASSWORD);
  if (!isMatch) {
    return errorResponse(createAppError('INVALID_CREDENTIALS', 'Invalid credentials', 401));
  }

  const token = await createSessionToken(env.SESSION_SECRET);
  const url = new URL(context.request.url);
  const isSecure = url.protocol === 'https:';
  const cookie = createSessionCookie(token, isSecure);

  return jsonResponse(
    { authenticated: true },
    200,
    {
      'Set-Cookie': cookie,
    }
  );
}
