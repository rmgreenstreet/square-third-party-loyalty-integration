import mongoose from 'mongoose';

import { winstonLogger as logger } from "../utils/loggingSetup.mjs";
import ApplicationError from "../models/ApplicationError.mjs";
import { exponentialBackoff } from './exponentialBackoff.mjs';

import User from '../models/User.mjs';


const maxRetries = 5; // Number of attempts

async function connectToMongoose() {
  exponentialBackoff(async () => {
    logger.debug("Entering connectToMongoose");
    await mongoose.connect(process.env.DB_CONNECTION_STRING, { dbName: process.env.DB_NAME });
  }, 10, 250);
}

export default connectToMongoose;
