import { winstonLogger as logger } from "../utils/loggingSetup.mjs";
import ApplicationError from "../models/ApplicationError.mjs";import User from '../models/User.mjs';
import { encrypt, decrypt } from '../utils/tokenUtils.mjs';
import { createSquareClient } from '../utils/squareUtils.mjs';

const client = await createSquareClient(process.env.SQUARE_CLIENT_ID);
const { oAuthApi } = client;
const environment = process.env.NODE_ENV === 'production' ? "" : "sandbox";
const sessionArg = environment === "sandbox" ? "" : "&session=false";

export const authorize = async (req, res) => {
  logger.debug("Entering Square Authorize redirect controller");
  try {
    const authorizationUrl = `https://connect.squareup${environment}.com/oauth2/authorize?client_id=${process.env.SQUARE_CLIENT_ID}&scope=PAYMENTS_READ+CUSTOMERS_READ+ORDERS_READ+LOYALTY_READ+LOYALTY_WRITE&state=${req.sessionID}${sessionArg}`;
    logger.info("Redirecting user to square authorization", {user: req.user.id})
    res.redirect(authorizationUrl);
  } catch (err) {
    next(new ApplicationError("There was an issue redirecting to Square", {user: req.user.id, name: "SquareAuthRedirectError", err}));
  }
};

export const oauthCallback = async (req, res, next) => {
  try {
    logger.debug("Entering Square oauthCallback controller");
    // if (req.state !== req.sessionID) {
    //   res.status(403).send("There was a security issue. Try the OAuth integration again");
    // }
    const { code } = req.query;
    logger.debug(`Square Auth Code: ${code}`);

    logger.debug("Attempting to get OAuth Token");
    const response = await oAuthApi.obtainToken({
      code,
      clientId: process.env.SQUARE_CLIENT_ID,
      clientSecret: process.env.SQUARE_CLIENT_SECRET,
      redirectUri: process.env.SQUARE_REDIRECT_URI,
      grantType: "authorization_code"
    });
    logger.debug("Tokens obtained. Encrypting and saving to database");
    const { accessToken, refreshToken, expiresAt } = response.result;
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = encrypt(refreshToken)
    try {
      logger.debug("Attempting to save Tokens to User");
      const user = await User.findById(req.user._id);
      user.squareAccessToken = encryptedAccessToken;
      user.squareRefreshToken = encryptedRefreshToken;
      user.squareTokenExpiry = new Date(expiresAt); // Convert to JavaScript Date
      await user.save();
    } catch (err) {
      next(new ApplicationError("There was an issue saving Square Authorization tokens", {user: req.user.id, name: "SquareoAuthTokenError", err}));
    }
    logger.debug("Tokens saved to user. Redirecting to home page");
    res.redirect('/');
  } catch (err) {
    next(new ApplicationError("There was an issue obtaining Square Authorization tokens", {user: req.user.id, name: "SquareoAuthTokenError", err}));
  }
};

export const revoke = async (req, res, next) => {
  logger.debug("Entering Square token revoke controller");
  try {
    logger.debug(`attempting to retrieve logged in user using req.user: ${req.user}`);
    const user = await User.findById(req.user._id);
    if (!user || !user.squareRefreshToken) {
      next(new ApplicationError("There is no Token to revoke", {name: "NoSquareTokenError", statusCode: 400, err}));
    }

    logger.debug("Attempting to revoke access token");
    const response = await oAuthApi.revokeToken({
      clientId: process.env.SQUARE_CLIENT_ID,
      accessToken: decrypt(user.squareAccessToken)
    },
      `Client ${process.env.SQUARE_CLIENT_SECRET}`);
    logger.debug(`revokeToken response: ${response}`);

    user.squareAccessToken = undefined;
    user.squareRefreshToken = undefined;
    user.squareTokenExpiry = undefined;
    logger.debug("Saving user without tokens:", user);
    await user.save();
    logger.info("Square Token revoked", {user: user.id});
    res.redirect('/');
  } catch (err) {
    next(new ApplicationError("There was an issue revoking Square tokens", {user: req.user.id, name: "SquareRevokeError", err}));
  }
};
