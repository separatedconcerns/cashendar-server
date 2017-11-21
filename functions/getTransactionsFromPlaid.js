const item = require('./controllers/itemController');
const user = require('./controllers/userController');
const moment = require('moment');
const plaidClient = require('./apiClients/plaidClient.js');
const Promise = require('bluebird');
const packageTransactionsByDate = Promise.method(require('./utils/packageTransactionsByDate.js'));

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
          accounts.forEach((account) => {
            item.addAccountsToItem(transactionsObj.itemId, account);
          });
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
    let uniqueUserId;
    let payload;
    console.log(`getTransactionsFromPlaid TOTAL TRANSACTIONS: ${transactions.length}`);

    return Promise.all([packageTransactionsByDate(transactions), item.getUserIdByItemFromDB(itemId)])
      .then((values) => {
        const transactionsByDate = values[0];
        uniqueUserId = values[1];
        payload = {
          dates: Object.keys(transactionsByDate),
          transactions: transactionsByDate,
        };
        const promiseArr = payload.dates.map(date => item.addTransactionsByDate(itemId, date, payload.transactions[date]));
        const pollStatusAndDatesToScheduleQueue =
        { fetchingBanks: false, datesToScheduleQueue: payload.dates };
        promiseArr.push(user.updateUser(uniqueUserId, pollStatusAndDatesToScheduleQueue));
        return Promise.all(promiseArr);
      })
      .then(() => response.json(payload.dates))
      .catch(error => console.log('getTransactionsFromPlaid', error));
  });
}

module.exports = getTransactionsFromPlaid;
