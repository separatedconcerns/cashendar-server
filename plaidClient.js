const plaid = require('plaid');

const plaidClient = new plaid.Client(
    process.env.REACT_APP_PLAID_CLIENT_ID,
    process.env.REACT_APP_PLAID_SECRET,
    process.env.REACT_APP_PLAID_PUBLIC_KEY,
    plaid.environments.sandbox);

module.exports = plaidClient;