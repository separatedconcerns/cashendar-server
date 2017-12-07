const item = require('./controllers/itemController');
const user = require('./controllers/userController');
const moment = require('moment');
const plaidClient = require('./apiClients/plaidClient.js');
const Promise = require('bluebird');

function getTransactionsFromPlaid(request, response) {
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
          const accounts = plaidResponse.accounts;
          transactionsObj.transactions = transactionsObj.transactions.concat(plaidResponse.transactions);
          transactionsObj.itemId = transactionsObj.itemId || plaidResponse.item.item_id;
          console.log(`${transactionsObj.transactions.length} of ${numOfNewTransactions} NEW TRANSACTIONS FETCHED FROM PLAID`);
          const accountsPromise = accounts.map(account => item.addAccountsToItem(transactionsObj.itemId, account));
          return Promise.all(accountsPromise);
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

  let itemId;
  let transactions;
  let payload;

  plaidGetTransactions.then((transactionsObj) => {
    itemId = transactionsObj.itemId;
    transactions = transactionsObj.transactions;
    console.log(`getTransactionsFromPlaid TOTAL TRANSACTIONS: ${transactions.length}`);
    return transactions.reduce((transactionsByDate, transaction) => {
      transactionsByDate[transaction.date] = transactionsByDate[transaction.date] || {};
      transactionsByDate[transaction.date][transaction.transaction_id] = transaction;
      return transactionsByDate;
    }, {});
  })
    .then((transactionsByDate) => {
      payload = {
        dates: Object.keys(transactionsByDate),
        transactions: transactionsByDate,
      };
      const promArr = payload.dates.map(date =>
        item.addTransactionsByDate(itemId, date, payload.transactions[date])
          .catch(e => console.log(e, 'NOT UPDATED IN DB!')));
      return Promise.all(promArr);
    })
    .then(() => item.getUserIdByItemFromDB(itemId))
    .then((uniqueUserId) => {
      const pollStatusAndDatesToScheduleQueue =
          { fetchingBanks: false, datesToScheduleQueue: payload.dates };
      return user.updateUser(uniqueUserId, pollStatusAndDatesToScheduleQueue);
    })
    .then(() => response.json(payload.dates))
    .catch(error => console.log('getTransactionsFromPlaid', error));
}

module.exports = getTransactionsFromPlaid;
