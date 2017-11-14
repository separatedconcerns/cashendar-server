const functions = require('firebase-functions');
const item = require('./controllers/itemController');
const user = require('./controllers/userController');

const removeTransactionsFromDb = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const itemId = request.body.itemId;
  const plaidRemovedTransactions = request.body.removedTransactions;
  let uniqueUserId;

  item.getUserIdByItemFromDB(itemId)
    .then((userId) => { uniqueUserId = userId; });

  item.getItemTransactionsFromDB(itemId)
    .then((transactions) => {
      const transactionsToRemove = [];
      const transactionsToRemoveDates = {};
      const transactionDates = Object.keys(transactions);

      plaidRemovedTransactions.forEach((transactionId) => {
        for (let i = 0; i < transactionDates.length; i += 1) {
          const date = transactionDates[i];
          if (transactions[date][transactionId]) {
            transactionsToRemove.push([date, transactionId]);
            transactionsToRemoveDates[date] = true;
            break;
          }
        }
      });

      return { transactionsToRemove, transactionsToRemoveDates };
    })
    .then((transactionInfo) => {
      let counter = transactionInfo.transactionsToRemove.length;
      transactionInfo.transactionsToRemove.forEach((dateAndId) => {
        item.removeTransactions(itemId, dateAndId[0], dateAndId[1])
          .then(counter -= 1);

        if (counter <= 0) {
          console.log(transactionInfo.transactionsToRemove.length, 'transactions have been removed from database.');
          user.updateDatesToScheduleQueue(uniqueUserId, Object.keys(transactionInfo.transactionsToRemoveDates))
            .then(response.send(uniqueUserId));
        }
      });
    });
});

module.exports = removeTransactionsFromDb;
