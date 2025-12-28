import { createHash, pbkdf2Sync, randomBytes } from 'crypto';

/**
 * Hash a password using PBKDF2 (Node.js built-in, no dependencies)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, hashValue] = hash.split(':');
  if (!salt || !hashValue) return false;
  
  const passwordHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return passwordHash === hashValue;
}

