import type { EventContext } from '@cloudflare/workers-types';
import { clearSessionCookie } from '../../_lib/auth';
import { jsonResponse } from '../../_lib/http';

export async function onRequestPost(
  _context: EventContext<Record<string, unknown>, string, Record<string, unknown>>
): Promise<Response> {
  return jsonResponse(
    { authenticated: false },
    200,
    {
      'Set-Cookie': clearSessionCookie(),
    }
  );
}
