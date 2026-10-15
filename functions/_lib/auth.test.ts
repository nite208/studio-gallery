import { describe, it, expect } from 'vitest';
import {
  createSessionCookie,
  createSessionToken,
  extractSessionCookie,
  timingSafeEqual,
  verifySessionToken,
} from './auth';

describe('auth utilities', () => {
  const secret = 'test-secret-key-for-session-tokens-12345';

  it('signs and verifies a valid session token', async () => {
    const token = await createSessionToken(secret, 3600);
    const isValid = await verifySessionToken(token, secret);
    expect(isValid).toBe(true);
  });

  it('rejects an expired session token', async () => {
    const expiredToken = await createSessionToken(secret, -10);
    const isValid = await verifySessionToken(expiredToken, secret);
    expect(isValid).toBe(false);
  });

  it('rejects a tampered token payload', async () => {
    const token = await createSessionToken(secret, 3600);
    const [, signature] = token.split('.');
    const tamperedPayload = btoa(JSON.stringify({ exp: 9999999999 })).replace(/=/g, '');
    const tamperedToken = `${tamperedPayload}.${signature}`;

    const isValid = await verifySessionToken(tamperedToken, secret);
    expect(isValid).toBe(false);
  });

  it('rejects a tampered token signature', async () => {
    const token = await createSessionToken(secret, 3600);
    const [payload] = token.split('.');
    const tamperedToken = `${payload}.invalidSignatureValue`;

    const isValid = await verifySessionToken(tamperedToken, secret);
    expect(isValid).toBe(false);
  });

  it('rejects token signed with different secret', async () => {
    const token = await createSessionToken(secret, 3600);
    const isValid = await verifySessionToken(token, 'different-secret');
    expect(isValid).toBe(false);
  });

  it('compares strings in constant time', async () => {
    const isMatch = await timingSafeEqual('admin123', 'admin123');
    const isMismatch = await timingSafeEqual('admin123', 'wrongpassword');
    expect(isMatch).toBe(true);
    expect(isMismatch).toBe(false);
  });

  it('creates and extracts session cookie', () => {
    const cookie = createSessionCookie('sample-token', true);
    expect(cookie).toContain('admin_session=sample-token');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Secure');

    const extracted = extractSessionCookie('other=1; admin_session=sample-token; test=2');
    expect(extracted).toBe('sample-token');
  });
});
