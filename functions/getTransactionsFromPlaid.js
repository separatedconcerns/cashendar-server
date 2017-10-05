const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const moment = require('moment');
const plaidClient = require('./apiClients/plaidClient.js');
const Promise = require('bluebird');
const packageTransactionsById = Promise.method(require('./utils/packageTransactionsById.js'));

const getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  const accessToken = request.body.access_token;
  const newTransactions = request.body.newTransactions;
  console.log('10', request.body);
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
 
      packageTransactionsById(transactions)
        .then((transactionsById) => {
          console.log(transactionsById);
          admin.database()
            .ref(`items/${itemId}/transactions`)
            .update(transactionsById)
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
