import type { EventContext } from '@cloudflare/workers-types';
import { jsonResponse } from '../_lib/http';

export async function onRequestGet(
  _context: EventContext<Record<string, unknown>, string, Record<string, unknown>>
): Promise<Response> {
  return jsonResponse({ status: 'ok' });
}
