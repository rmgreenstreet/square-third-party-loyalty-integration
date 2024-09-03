import hvac from 'hvac';

const vaultAddress = process.env.VAULT_ADDRESS;
const vaultToken = process.env.VAULT_TOKEN;

const client = new hvac.Client({
  url: vaultAddress,
  token: vaultToken,
});

export default async function getOAuthToken() {
  try {
    const secret = await client.secrets.kv.v2.readSecret({ secret_path: 'secret/oauth/square' });
    return secret.data.data.oauth_token;
  } catch (error) {
    console.error('Error retrieving OAuth token:', error);
    throw error;
  }
}
