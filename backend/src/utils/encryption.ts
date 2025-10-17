import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

const getEncryptionKey = (): Buffer => {
  const keyFromEnv = process.env.CHAT_ENCRYPTION_KEY;

  if (!keyFromEnv) {
    throw new Error('CHAT_ENCRYPTION_KEY environment variable is required');
  }

  if (keyFromEnv.length !== KEY_LENGTH * 2) {
    throw new Error(
      'CHAT_ENCRYPTION_KEY must be 64 characters long (32 bytes hex)'
    );
  }

  return Buffer.from(keyFromEnv, 'hex');
};

export const encryptMessage = (plaintext: string): string => {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  const combined = iv.toString('hex') + tag.toString('hex') + encrypted;
  return combined;
};

export const decryptMessage = (encryptedData: string): string => {
  const key = getEncryptionKey();

  const ivHex = encryptedData.slice(0, IV_LENGTH * 2);
  const tagHex = encryptedData.slice(
    IV_LENGTH * 2,
    (IV_LENGTH + TAG_LENGTH) * 2
  );
  const encryptedHex = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2);

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
