const dotenv = require('dotenv');
dotenv.config();
const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const moment = require('moment');
const plaidClient = require('./apiClients/plaidClient.js');


const getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  const access_token = request.body.access_token;
  const uniqueUserId = request.body.uniqueUserId;
  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const thirtyDaysAgo = now.subtract(1000, 'days').format('YYYY-MM-DD');

  plaidClient.getTransactions(access_token, thirtyDaysAgo, today)
    .then((successResponse) => {
      const item_id = successResponse.item.item_id;
      const institution_id = successResponse.item.institution_id;
      const accounts = successResponse.accounts;
      const request_id = successResponse.request_id;
      const transactions = successResponse.transactions;

      plaidClient.getInstitutionById(institution_id)
        .then(result => result.institution.name)
        .then((institution_name) => {
          admin.database()
            .ref(`items/${item_id}/`)
            .update({
              transactions,
              institutionName: institution_name,
              institutionId: institution_id })
            .then(() => {
              accounts.forEach((account) => {
                admin.database().ref(`/accounts/${account.account_id}`).update(account);
              });
            })
            .then(response.end());
        });
    });
});

module.exports = getTransactionsFromPlaid;
