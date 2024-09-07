import ApplicationError from "../models/ApplicationError.mjs";
import { winstonLogger as logger } from "./loggingSetup.mjs";

export async function exponentialBackoff(fn, maxRetries = 10, baseDelay = 250) {
  logger.debug("Entering exponentialBackoff")
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.debug(`Attempt ${ attempt + 1 } failed, retrying in ${ delay/1000 } seconds`);
      attempt += 1;
      if (attempt >= maxRetries) {
        // TODO Figure out how to do this more gracefully and potentially retry to start the process
        const exponentialError = new ApplicationError({name: "ExponentialBackoffError", err});
        logger.error(exponentialError);
        throw exponentialError;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
