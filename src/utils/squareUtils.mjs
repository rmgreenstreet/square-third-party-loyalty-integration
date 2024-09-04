import { Client, Environment } from 'square';
import { encrypt, decrypt } from './tokenUtils.mjs';


// Initialize Square client
const environment = process.env.NODE_ENV === 'production'
  ? Environment.Production
  : Environment.Sandbox;

export const createSquareClient = async (accessToken) => {
  return new Client({
    environment,
    accessToken: accessToken
  });
};

// Function to check if the user's Square account is authorized
export const isSquareAuthorized = async (user) => {
  if (!user.squareAccessToken || !user.squareRefreshToken) {
    return false;
  }

  try {
    const client = createSquareClient(user.squareAccessToken);
    const { customersApi } = client;

    // Attempt to make an API call to check if the token is valid
    const response = await customersApi.listCustomers();
    return response.result.customers ? true : false;
  } catch (error) {
    console.error('Error checking Square authorization:', error);
    return false;
  }
};

// Refresh access token using the refresh token and save the tokens
export const refreshAccessToken = async (user) => {
  try {
    const client = new Client({
      environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
    });

    const { oAuthApi } = client;
    const response = await oAuthApi.obtainToken({
      grant_type: 'refresh_token',
      refresh_token: decrypt(user.squareRefreshToken),
      client_id: process.env.SQUARE_APP_ID,
      client_secret: process.env.SQUARE_APP_SECRET,
    });

    if (response.result.access_token) {
      user.squareAccessToken = encrypt(response.result.access_token);
      user.squareRefreshToken = encrypt(response.result.refresh_token);
      await user.save(); // Save updated tokens to the user
    }

    return true;
  } catch (error) {
    console.error('Error refreshing Square access token:', error);
    return false;
  }
};
