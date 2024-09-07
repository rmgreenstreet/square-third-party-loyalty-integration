import mongoose from 'mongoose';

import { winstonLogger as logger } from "../utils/loggingSetup.mjs";
import ApplicationError from "../models/ApplicationError.mjs";
import { exponentialBackoff } from './exponentialBackoff.mjs';

async function connectToMongoose() {
  logger.debug("Entering connectToMongoose");
  try {
    exponentialBackoff(async () => {
      await mongoose.connect(process.env.DB_CONNECTION_STRING, { dbName: process.env.DB_NAME });
    }, 10, 250);
  } catch (err) {
    // TODO Figure out how to do this more gracefully and potentially retry to start the process
    const mongooseConnectionError = new ApplicationError({ name: "MongooseConnectionError", err });
    logger.error(mongooseConnectionError);
    throw mongooseConnectionError;
  }
}

export default connectToMongoose;
