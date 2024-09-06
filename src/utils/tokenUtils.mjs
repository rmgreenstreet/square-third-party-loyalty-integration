import crypto from 'crypto';

import { winstonLogger as logger } from "./loggingSetup.mjs"
import ApplicationError from '../models/ApplicationError.mjs';

const algorithm = 'aes-256-cbc';
const ivLength = 16;

export function encrypt(text) {
  logger.debug("Entering encrypt function");
  try {
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Convert the hex key string to a Buffer
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    // Clear sensitive data from memory after using
    key.fill(0);
    iv.fill(0);
    key = null;
    iv = null;
    logger.info("Text has been encrypted using", algorithm)
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new ApplicationError("There was an issue encrypting the value", {err: error, statusCode: 500, name: "EncryptionError"});
  }
}

export function decrypt(text) {
  logger.debug("Entering decrypt function");
  try {
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Convert the hex key string to a Buffer
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    // Clear sensitive data from memory after using
    key.fill(0);
    iv.fill(0);
    key = null;
    iv = null;
    logger.info("Text has been decrypted using", algorithm)
    return decrypted;
  } catch (error) {
    throw new ApplicationError("There was an issue decrypting the value", {err: error, statusCode: 500, name: "EncryptionError"});
  }
}
