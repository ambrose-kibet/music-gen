import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended IV size for GCM
const SALT_LENGTH = 16; // Random salt per encryption
const KEY_LENGTH = 32; // AES-256 = 32 bytes

interface EncryptedPayload {
  salt: string; // base64
  iv: string; // base64
  authTag: string; // base64
  ciphertext: string; // base64
}

/**
 * Encrypt text using AES-256-GCM with a derived key from the given secret.
 * @augments {string} plainText - The text to encrypt
 * @augments {string} secret - The secret used to derive the encryption key
 * @returns Encrypted text as a base64-encoded JSON string
 */
export function encrypt(plainText: string, secret: string): string {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  const key = scryptSync(secret, salt, KEY_LENGTH); // derive key using scrypt

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext: encrypted.toString('base64'),
  };

  // Encode as base64 JSON string for portability
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Decrypt text that was encrypted using the above function.
 * @augments {string} encryptedBase64 - The base64-encoded encrypted text
 * @augments {string} secret - The secret used to derive the decryption key
 * @returns Decrypted plain text
 */
export function decrypt(encryptedBase64: string, secret: string): string {
  const payloadJson = Buffer.from(encryptedBase64, 'base64').toString('utf8');
  const { salt, iv, authTag, ciphertext } = JSON.parse(
    payloadJson,
  ) as EncryptedPayload;

  const key = scryptSync(secret, Buffer.from(salt, 'base64'), KEY_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
