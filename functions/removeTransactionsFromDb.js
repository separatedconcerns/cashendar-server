const item = require('./controllers/itemController');
const user = require('./controllers/userController');

function removeTransactionsFromDb(request, response) {
  const itemId = request.body.itemId;
  const plaidRemovedTransactions = request.body.removedTransactions;
  let uniqueUserId;
  let transactionInfo;

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
    .then((result) => {
      transactionInfo = result;
      const promiseArr = transactionInfo.transactionsToRemove.map(dateAndId =>
        item.removeTransactions(itemId, dateAndId[0], dateAndId[1])
      );
      return Promise.all(promiseArr);
    })
    .then(() => {
      console.log(transactionInfo.transactionsToRemove.length, 'transactions have been removed from database.');
      return user.updateDatesToScheduleQueue(uniqueUserId, Object.keys(transactionInfo.transactionsToRemoveDates));
    })
    .then(() => response.send(uniqueUserId));
}

module.exports = removeTransactionsFromDb;
