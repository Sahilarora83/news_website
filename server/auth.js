import { configDotenv } from 'dotenv';
configDotenv();


import { createHmac, timingSafeEqual } from 'node:crypto';
import { authenticateUserRecord } from './sql-store.js';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET;

if (!ADMIN_SECRET) {
  throw new Error('ADMIN_TOKEN_SECRET environment variable is required');
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(payload) {
  return createHmac('sha256', ADMIN_SECRET).update(payload).digest('base64url');
}

export function createAdminToken(user) {
  const payload = JSON.stringify({
    sub: user.username,
    uid: user.id,
    role: user.role,
    cityId: user.assignedCityId ?? null,
    exp: Date.now() + TOKEN_TTL_MS,
  });

  const encodedPayload = base64UrlEncode(payload);
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const match = String(header).match(/^Bearer\s+(.+)$/i);
    const payload = verifyAdminToken(match?.[1] || '');

    if (!payload) {
      return res.status(401).json({ error: 'Unauthorized Access' });
    }

    if (roles.length > 0 && !roles.includes(payload.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient Permissions' });
    }

    req.admin = payload;
    return next();
  };
}

export async function authenticateUser(username, password) {
  return authenticateUserRecord(username, password);
}

export const requireAdmin = requireRole(['super_admin', 'editor', 'admin']);
