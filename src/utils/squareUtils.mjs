import { Client, Environment } from 'square';

import { encrypt, decrypt } from './tokenUtils.mjs';
import { winstonLogger as logger } from "../utils/loggingSetup.mjs";
import ApplicationError from "../models/ApplicationError.mjs";
import { exponentialBackoff } from './exponentialBackoff.mjs';


// Initialize Square client
const environment = process.env.NODE_ENV === 'production'
  ? Environment.Production
  : Environment.Sandbox;

export const createSquareClient = async (accessToken) => {
  logger.debug("Creating Square Client");
  try {
    return exponentialBackoff(async () => {
      return await new Client({
        environment,
        accessToken: accessToken
      });
    });
  } catch (err) {
    // TODO Figure out how to do this more gracefully and potentially retry to start the process
    const squareClientSetupError = new ApplicationError({ name: "SquareClientSetupError", err });
    logger.error(squareClientSetupError);
    throw squareClientSetupError;
  }
};

// Function to check if the user's Square account is authorized
export const isSquareAuthorized = async (user) => {
  logger.debug("entering isSquareAuthorized");
  if (!user.squareAccessToken || !user.squareRefreshToken) {
    logger.debug("User does not have square access token");
    logger.info("No access token found for user", { user: user.id });
    return false;
  }
  logger.debug("User has square access token, attempting to decrypt and use it");
  try {
    logger.debug("Initializing Square Client");
    const client = await createSquareClient(decrypt(user.squareAccessToken));
    const { customersApi } = client;
    // console.log("Square Client Initialized, customersApi:", customersApi);
    logger.debug("Attempting to retrieve customers")
    // Attempt to make an API call to check if the token is valid
    const response = exponentialBackoff(async () => { await customersApi.listCustomers(); })
    logger.debug("customersApi response.result:", response.result);
    const isAuthorized = response.result ? true : false;
    logger.info(`User is Square Authorized: ${isAuthorized}`, { user: user.id });
    return isAuthorized
  } catch (error) {
    // TODO Figure out how to do this more gracefully and potentially restart the process
    const isSquareAuthorizedError = new ApplicationError( "There was an issue verifying Square authorization", { user: user.id, name: "IsSquareAuthorizedError", err, statusCode: 500 });
    logger.error(isSquareAuthorizedError);
    throw isSquareAuthorizedError;
  }
};

// Refresh access token using the refresh token and save the tokens
export const refreshAccessToken = async (user) => {
  logger.debug("Entering refreshAccessToken");
  try {
    const client = createSquareClient(decrypt(user.accessToken));
    const { oAuthApi } = client;

    logger.debug("Attempting to obtain new accessToken with current refreshToken")
    const response = await exponentialBackoff(async () => {
      oAuthApi.obtainToken({
        grant_type: 'refresh_token',
        refresh_token: decrypt(user.squareRefreshToken),
        client_id: process.env.SQUARE_APP_ID,
        client_secret: process.env.SQUARE_APP_SECRET,
      });
    });

    if (response.result.accessToken && response.result.refreshToken) {
      logger.debug("Token refresh successful. Attempting to save new tokens");
      user.squareAccessToken = encrypt(response.result.accessToken);
      user.squareRefreshToken = encrypt(response.result.refreshToken);
      await exponentialBackoff(user.save());
      // await user.save(); // Save updated tokens to the user
      logger.info("Token Refresh successful", {user: user.id})
    }
    return true;
  } catch (error) {
    // TODO Figure out how to do this more gracefully and potentially retry to start the process
    const SquareTokenRefreshError = new ApplicationError({ name: "SquareTokenRefreshError", err });
    logger.error(SquareTokenRefreshError);
    return false;
  }
};
