const item = require('./controllers/itemController');
const user = require('./controllers/userController');

function removeTransactionsFromDb(request, response) {
  const itemId = request.body.itemId;
  const plaidRemovedTransactions = request.body.removedTransactions;
  let uniqueUserId;

  Promise.all([item.getUserIdByItemFromDB(itemId), item.getItemTransactionsFromDB(itemId)])
    .then((results) => {
      uniqueUserId = results[0];
      const transactions = results[1];
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
}

module.exports = removeTransactionsFromDb;
