const plaid = require('plaid');
const creds = require('../creds.json');

const plaidClient = new plaid.Client(
  creds.PLAID_CLIENT_ID,
  creds.PLAID_SECRET,
  creds.PLAID_PUBLIC_KEY,
  creds.PLAID_ENV);

module.exports = plaidClient;
