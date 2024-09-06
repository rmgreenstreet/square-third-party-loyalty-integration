import crypto from 'crypto';

import { logger } from "./loggingSetup.mjs"

const algorithm = 'aes-256-cbc';
const ivLength = 16;

export function encrypt(text) {
  logger.debug("Entering encrypt function")
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Convert the hex key string to a Buffer
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(text) {
  logger.debug("Entering decrypt function");
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}
