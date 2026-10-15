export const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_SECONDS = 12 * 60 * 60;

function bufferToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBuffer(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aHash = await crypto.subtle.digest('SHA-256', encoder.encode(a));
  const bHash = await crypto.subtle.digest('SHA-256', encoder.encode(b));
  const aBuf = new Uint8Array(aHash);
  const bBuf = new Uint8Array(bHash);
  let mismatch = 0;
  for (let i = 0; i < aBuf.length; i++) {
    mismatch |= (aBuf[i] ?? 0) ^ (bBuf[i] ?? 0);
  }
  return mismatch === 0;
}

export async function createSessionToken(
  secret: string,
  durationSeconds: number = SESSION_DURATION_SECONDS
): Promise<string> {
  const encoder = new TextEncoder();
  const exp = Math.floor(Date.now() / 1000) + durationSeconds;
  const payloadJson = JSON.stringify({ exp });
  const payloadPart = bufferToBase64Url(encoder.encode(payloadJson));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadPart));
  const signaturePart = bufferToBase64Url(new Uint8Array(signatureBuffer));

  return `${payloadPart}.${signaturePart}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  const dotIndex = token.indexOf('.');
  if (dotIndex === -1) {
    return false;
  }

  const payloadPart = token.slice(0, dotIndex);
  const signaturePart = token.slice(dotIndex + 1);

  if (payloadPart.length === 0 || signaturePart.length === 0) {
    return false;
  }

  const encoder = new TextEncoder();
  let signatureBytes: Uint8Array;
  try {
    signatureBytes = base64UrlToBuffer(signaturePart);
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const isValidSignature = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(payloadPart)
  );

  if (!isValidSignature) {
    return false;
  }

  try {
    const payloadBytes = base64UrlToBuffer(payloadPart);
    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(payloadBytes)) as { exp?: number };
    if (typeof payload.exp !== 'number') {
      return false;
    }
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowInSeconds;
  } catch {
    return false;
  }
}

export function createSessionCookie(token: string, isSecure: boolean): string {
  const secureFlag = isSecure ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_SECONDS}${secureFlag}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function extractSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name === SESSION_COOKIE_NAME) {
      return valueParts.join('=');
    }
  }
  return null;
}
