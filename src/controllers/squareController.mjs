import User from '../models/User.mjs';
import { encrypt, decrypt } from '../utils/tokenUtils.mjs';
import { createSquareClient } from '../utils/squareUtils.mjs';

const client = await createSquareClient(process.env.SQUARE_CLIENT_ID)
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
    const { code } = req.query;
    console.log(code);
    
    const response = await client.oauth2.getToken({ 
      code,
      clientId: process.env.SQUARE_CLIENT_ID,
      clientSecret: process.env.SQUARE_CLIENT_SECRET,
      redirectUri: process.env.SQUARE_REDIRECT_URI
    });

    const { access_token, refresh_token, expires_at } = response.result;
    const encryptedAccessToken = encrypt(access_token);
    
    const user = await User.findById(req.user._id);
    user.squareAccessToken = encryptedAccessToken;
    user.squareRefreshToken = refresh_token;
    user.squareTokenExpiry = new Date(expires_at * 1000); // Convert to JavaScript Date
    await user.save();
    
    res.redirect('/');
  } catch (error) {
    res.status(500).send('OAuth Callback Error');
  }
};

export const revoke = async (req, res) => {
  try {
    const { user } = req;
    if (!user || !user.squareRefreshToken) return res.status(400).send('No token to revoke');

    const response = await client.oauth2.revokeToken({ 
      token: user.squareRefreshToken 
    });
    
    user.squareAccessToken = undefined;
    user.squareRefreshToken = undefined;
    user.squareTokenExpiry = undefined;
    await user.save();
    
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Revoke Error');
  }
};
