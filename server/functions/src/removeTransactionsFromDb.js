import { getUserIdByItemFromDB, getItemTransactionsFromDB, removeTransactions } from './controllers/itemController';
import { updateDatesToScheduleQueue } from './controllers/userController';

async function removeTransactionsFromDb(request, response) {
  const itemId = request.body.itemId;
  const plaidRemovedTransactions = request.body.removedTransactions;
  const [uniqueUserId, transactions] = Promise.all([
    getUserIdByItemFromDB(itemId),
    getItemTransactionsFromDB(itemId)]);
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

  const transactionInfo = { transactionsToRemove, transactionsToRemoveDates };
  const removeTransactionPromise = transactionInfo.transactionsToRemove.map(dateAndId =>
    removeTransactions(itemId, dateAndId[0], dateAndId[1]));
  await Promise.all(removeTransactionPromise);
  await updateDatesToScheduleQueue(uniqueUserId, Object.keys(transactionInfo.transactionsToRemoveDates));
  response.send(uniqueUserId);
}

export default removeTransactionsFromDb;
