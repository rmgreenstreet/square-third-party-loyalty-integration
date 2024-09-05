import User from '../models/User.mjs';
import { encrypt, decrypt } from '../utils/tokenUtils.mjs';
import { createSquareClient } from '../utils/squareUtils.mjs';

const client = await createSquareClient(process.env.SQUARE_CLIENT_ID);
const { oAuthApi } = client;
const environment = process.env.NODE_ENV === 'production' ? "" : "sandbox";
const sessionArg = environment === "sandbox" ? "" : "&session=false";

export const authorize = async (req, res) => {
  try {
    const authorizationUrl = `https://connect.squareup${environment}.com/oauth2/authorize?client_id=${process.env.SQUARE_CLIENT_ID}&scope=PAYMENTS_READ+CUSTOMERS_READ+ORDERS_READ+LOYALTY_READ+LOYALTY_WRITE&state=${req.sessionID}${sessionArg}`;
    res.redirect(authorizationUrl);
  } catch (error) {
    res.status(500).send('Authorization Error');
  }
};

export const oauthCallback = async (req, res) => {
  try {
    console.log("Entering oauthCallBack");
    // if (req.state !== req.sessionID) {
    //   res.status(403).send("There was a security issue. Try the OAuth integration again");
    // }
    const { code } = req.query;
    console.log(code);

    console.log("Attempting to get OAuth Token");
    const response = await oAuthApi.obtainToken({
      code,
      clientId: process.env.SQUARE_CLIENT_ID,
      clientSecret: process.env.SQUARE_CLIENT_SECRET,
      redirectUri: process.env.SQUARE_REDIRECT_URI,
      grantType: "authorization_code"
    });
    console.log("Tokens obtained. Encrypting and saving to database");
    const { accessToken, refreshToken, expiresAt } = response.result;
    const encryptedAccessToken = encrypt(accessToken);

    console.log("Attempting to save Tokens to User");
    const user = await User.findById(req.user._id);
    user.squareAccessToken = encryptedAccessToken;
    user.squareRefreshToken = refreshToken;
    user.squareTokenExpiry = new Date(expiresAt); // Convert to JavaScript Date
    await user.save();
    console.log("Tokens saved to user. Redirecting to home page");
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).send('OAuth Callback Error');
  }
};

export const revoke = async (req, res) => {
  console.log("Entering token revoke route");
  try {
    console.log("attempting to retrieve logged in user using req.user:", req.user);
    const user = await User.findById(req.user._id);
    if (!user || !user.squareRefreshToken) {
      console.log("user has no token to revoke:", user)
      return res.status(400).send('No token to revoke');
    }
    console.log("Attempting to revoke access token");
    const response = await oAuthApi.revokeToken({
      clientId: process.env.SQUARE_CLIENT_ID,
      accessToken: decrypt(user.squareAccessToken)
    },
      `Client ${process.env.SQUARE_CLIENT_SECRET}`);
    console.log("revokeToken response:", response);

    user.squareAccessToken = undefined;
    user.squareRefreshToken = undefined;
    user.squareTokenExpiry = undefined;
    console.log("Saving user without tokens:", user);
    await user.save();
    console.log("User saved, redirecting to home page");
    res.redirect('/');
  } catch (error) {
    console.error("Error revoking token:", error);
    res.status(500).send('Revoke Error');
  }
};
