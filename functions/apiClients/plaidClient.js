const plaid = require('plaid');

const plaidClient = new plaid.Client(
  process.env.PLAID_CLIENT_ID,
  process.env.PLAID_SECRET,
  process.env.PLAID_PUBLIC_KEY,
  'https://sandbox.plaid.com');

module.exports = plaidClient;
