import ApplicationError from "../models/ApplicationError.mjs";
import { winstonLogger as logger } from "./loggingSetup.mjs";

export async function exponentialBackoff(fn, maxRetries = 10, baseDelay = 250) {
  logger.debug("Entering exponentialBackoff")
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      logger.debug(`Attempt ${attempt} failed`)
      attempt += 1;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      if (attempt >= maxRetries) throw new ApplicationError(err);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
