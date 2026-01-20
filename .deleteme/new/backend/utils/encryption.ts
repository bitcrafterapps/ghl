/**
 * Token Encryption Utility
 * Uses AES-256-GCM for encrypting OAuth tokens at rest
 */

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * Key should be 32 bytes (256 bits) base64 encoded
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  
  if (!key) {
    // In development, use a default key (NOT FOR PRODUCTION)
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Using default encryption key for development. Set TOKEN_ENCRYPTION_KEY in production!');
      return crypto.scryptSync('dev-secret-key', 'salt', 32);
    }
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable is required');
  }
  
  const keyBuffer = Buffer.from(key, 'base64');
  if (keyBuffer.length !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (256 bits) base64 encoded');
  }
  
  return keyBuffer;
}

/**
 * Encrypt a plaintext string
 * Returns base64 encoded string: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return '';
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:ciphertext (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 * Expects base64 encoded string: iv:authTag:ciphertext
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }
  
  const [ivBase64, authTagBase64, ciphertext] = parts;
  
  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Check if a string appears to be encrypted (has our format)
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 3 && parts.every(p => p.length > 0);
}

/**
 * Encrypt if not already encrypted
 */
export function ensureEncrypted(text: string): string {
  if (!text) return '';
  if (isEncrypted(text)) return text;
  return encrypt(text);
}

/**
 * Decrypt if encrypted, otherwise return as-is
 */
export function ensureDecrypted(text: string): string {
  if (!text) return '';
  if (!isEncrypted(text)) return text;
  return decrypt(text);
}
