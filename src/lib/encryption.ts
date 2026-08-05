import crypto from 'crypto';

/**
 * Encrypts a plaintext string using AES-256-CBC and the configured encryption key.
 */
export function encryptToken(text: string, secretKey: string): string {
  if (!secretKey) {
    throw new Error('Encryption key is required.');
  }
  // Generate a SHA-256 hash of the secretKey to ensure it is exactly 32 bytes
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts an AES-256-CBC encrypted token back to plaintext.
 */
export function decryptToken(encryptedText: string, secretKey: string): string {
  if (!secretKey) {
    throw new Error('Encryption key is required.');
  }
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted token format.');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedHex = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
