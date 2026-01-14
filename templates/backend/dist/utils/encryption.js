"use strict";
/**
 * Token Encryption Utility
 * Uses AES-256-GCM for encrypting OAuth tokens at rest
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.isEncrypted = isEncrypted;
exports.ensureEncrypted = ensureEncrypted;
exports.ensureDecrypted = ensureDecrypted;
const crypto = __importStar(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
/**
 * Get encryption key from environment
 * Key should be 32 bytes (256 bits) base64 encoded
 */
function getEncryptionKey() {
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
function encrypt(plaintext) {
    if (!plaintext)
        return '';
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
function decrypt(encryptedText) {
    if (!encryptedText)
        return '';
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
function isEncrypted(text) {
    if (!text)
        return false;
    const parts = text.split(':');
    return parts.length === 3 && parts.every(p => p.length > 0);
}
/**
 * Encrypt if not already encrypted
 */
function ensureEncrypted(text) {
    if (!text)
        return '';
    if (isEncrypted(text))
        return text;
    return encrypt(text);
}
/**
 * Decrypt if encrypted, otherwise return as-is
 */
function ensureDecrypted(text) {
    if (!text)
        return '';
    if (!isEncrypted(text))
        return text;
    return decrypt(text);
}
