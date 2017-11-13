const functions = require('firebase-functions');
const item = require('./controllers/itemController');
const user = require('./controllers/userController');
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
      // let uniqueUserId;
      const itemId = successResponse.item.item_id;
      // const institutionId = successResponse.item.institution_id;
      const transactions = successResponse.transactions;
      // const accounts = successResponse.accounts;
      // const requestId = successResponse.request_id;
      console.log('getTransactionsFromPlaid total transactions:', transactions.length);

      packageTransactionsByDate(transactions)
        .then((transactionsByDate) => {
          const payload = {
            dates: Object.keys(transactionsByDate),
            transactions: transactionsByDate,
          };
          return payload;
        })
        .then((payload) => {
          payload.dates.forEach((date) => {
            item.addTransactionsByDate(itemId, date, payload.transactions[date])
              .catch(e => console.log(e, 'NOT UPDATED IN DB!'));
          });
          return payload;
        })
        .then((payload) => {
          item.getUserIdByItemFromDB(itemId)
            .then((uniqueUserId) => {
              const pollStatusAndDatesToSchedule =
              { fetchingBanks: false, datesToSchedule: payload.dates };
              user.updateUser(uniqueUserId, pollStatusAndDatesToSchedule)
                .then(response.json(payload.dates));
            });
        });
    })
    .catch(error => console.log('getTransactionsFromPlaid', error));
});

module.exports = getTransactionsFromPlaid;
