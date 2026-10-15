import type { EventContext } from '@cloudflare/workers-types';
import { validateEnv } from '../../_lib/env';
import { extractSessionCookie, verifySessionToken } from '../../_lib/auth';
import { jsonResponse } from '../../_lib/http';

export async function onRequestGet(
  context: EventContext<Record<string, unknown>, string, Record<string, unknown>>
): Promise<Response> {
  const env = validateEnv(context.env);
  const cookieHeader = context.request.headers.get('Cookie');
  const token = extractSessionCookie(cookieHeader);

  if (!token) {
    return jsonResponse({ authenticated: false });
  }

  const isValid = await verifySessionToken(token, env.SESSION_SECRET);
  return jsonResponse({ authenticated: isValid });
}
