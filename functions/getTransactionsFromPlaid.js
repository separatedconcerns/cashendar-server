const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const moment = require('moment');
const plaidClient = require('./apiClients/plaidClient.js');
const Promise = require('bluebird');
const packageTransactionsByDate = Promise.method(require('./utils/packageTransactionsByDate.js'));

const getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  const accessToken = request.body.access_token;
  const newTransactions = request.body.newTransactions;
  // const uniqueUserId = request.body.uniqueUserId;
  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const daysAgo = now.subtract(1000, 'days').format('YYYY-MM-DD');
  
  plaidClient.getTransactions(accessToken, daysAgo, today, { count: newTransactions })
    .then((successResponse) => {
      let uniqueUserId;
      const itemId = successResponse.item.item_id;
      const institutionId = successResponse.item.institution_id;
      const transactions = successResponse.transactions;
      // const accounts = successResponse.accounts;
      // const requestId = successResponse.request_id;
      console.log('getTransactionsFromPlaid total transactions:', transactions.length);
 
      packageTransactionsByDate(transactions)
        .then((transactionsByDate) => {
          admin.database()
            .ref(`items/${itemId}`)
            .update({
              dates_to_schedule: Object.keys(transactionsByDate),
              transactions: transactionsByDate,
            })
            .then(() => {
              admin.database()
                .ref(`/items/${itemId}/uniqueUserId`)
                .once('value')
                .then((snapshot) => {
                  uniqueUserId = snapshot.val();
                })
                .then(() => {
                  // set bool to indicate data is no longer being fetched from Plaid
                  admin.database()
                    .ref(`users/${uniqueUserId}/`)
                    .update({ fetchingBanks: false })
                    .then(response.end());
                });
            });
        });
    })
    .catch(error => console.log('getTransactionsFromPlaid', error));
});

module.exports = getTransactionsFromPlaid;
