const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const moment = require('moment');
const plaidClient = require('./apiClients/plaidClient.js');


const getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  const accessToken = request.body.access_token;
  const newTransactions = request.body.newTransactions;
  console.log('10', request.body);
  // const uniqueUserId = request.body.uniqueUserId;
  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const thirtyDaysAgo = now.subtract(1000, 'days').format('YYYY-MM-DD');

  plaidClient.getTransactions(accessToken, thirtyDaysAgo, today, { count: newTransactions })
    .then((successResponse) => {
      let uniqueUserId;
      const itemId = successResponse.item.item_id;
      const institutionId = successResponse.item.institution_id;
      // const accounts = successResponse.accounts;
      // const requestId = successResponse.request_id;
      const transactions = successResponse.transactions;
      console.log('24', transactions.length);

      plaidClient.getInstitutionById(institutionId)
        .then(result => result.institution.name)
        .then((institutionName) => {
          console.log(transactions.length);
          admin.database()
            .ref(`items/${itemId}/`)
            .update({
              transactions,
              institutionName,
              institutionId })
            .then(() => {
              admin.database().ref(`/items/${itemId}/uniqueUserId`).once('value').then((snapshot) => {
                uniqueUserId = snapshot.val();
              })
                .then(() => {
                  // set bool to indicate data is no longer being fetched from Plaid
                  admin.database().ref(`users/${uniqueUserId}/`).update({ fetchingBanks: false });
                })
                .then(response.end());
            });
        });
    })
    .catch(error => console.log('getTransactionsFromPlaid', error));
});

module.exports = getTransactionsFromPlaid;
