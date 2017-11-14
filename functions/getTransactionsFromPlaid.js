const functions = require('firebase-functions');
const item = require('./controllers/itemController');
const user = require('./controllers/userController');
const moment = require('moment');
const plaidClient = require('./apiClients/plaidClient.js');
const Promise = require('bluebird');
const packageTransactionsByDate = Promise.method(require('./utils/packageTransactionsByDate.js'));

const getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  const accessToken = request.body.access_token;
  const numOfNewTransactions = request.body.newTransactions;
  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const daysAgo = now.subtract(3650, 'days').format('YYYY-MM-DD');

  const plaidGetTransactions = new Promise((resolve, reject) => {
    const transactionsObj = {
      transactions: [],
      itemId: null,
    };
    let numLoops = Math.ceil(numOfNewTransactions / 500);
    let count = numOfNewTransactions > 500 ? numOfNewTransactions % 500 : numOfNewTransactions;
    let offset = 0;
    const pingPlaid = setInterval(() => {
      plaidClient.getTransactions(accessToken, daysAgo, today, { count, offset })
        .then((plaidResponse) => {
          transactionsObj.transactions = transactionsObj.transactions.concat(plaidResponse.transactions);
          transactionsObj.itemId = transactionsObj.itemId || plaidResponse.item.item_id;
          console.log(`${transactionsObj.transactions.length} of ${numOfNewTransactions} NEW TRANSACTIONS FETCHED FROM PLAID`);
        })
        .catch((e) => {
          console.log('pingPlaid ERROR!: ', e);
          reject('Error inside pingPlaid');
        });
      offset += count;
      count = 500;
      numLoops -= 1;
      if (numLoops < 1) {
        setTimeout(() => {
          resolve(transactionsObj);
        }, 4000);
        clearInterval(pingPlaid);
      }
    }, 100);
  });

  plaidGetTransactions.then((transactionsObj) => {
    const itemId = transactionsObj.itemId;
    const transactions = transactionsObj.transactions;
    console.log(`getTransactionsFromPlaid TOTAL TRANSACTIONS: ${transactions.length}`);

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
            const pollStatusAndDatesToScheduleQueue =
              { fetchingBanks: false, datesToScheduleQueue: payload.dates };
            user.updateUser(uniqueUserId, pollStatusAndDatesToScheduleQueue)
              .then(response.json(payload.dates));
          });
      });
  })
    .catch(error => console.log('getTransactionsFromPlaid', error));
});

module.exports = getTransactionsFromPlaid;
