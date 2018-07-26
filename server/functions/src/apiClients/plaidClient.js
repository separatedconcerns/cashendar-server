import { Client } from 'plaid';
import { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_PUBLIC_KEY, PLAID_ENV } from '../creds.json';

const plaidClient = new Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  PLAID_ENV);

module.exports = plaidClient;
