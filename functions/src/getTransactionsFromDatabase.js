import { getUserFromDB } from './controllers/userController';
import { getItemFromDB } from './controllers/itemController';

function getTransactionsFromDatabase(request, response) {
  const uniqueUserId = request.body.uniqueUserId;
  getUserFromDB(uniqueUserId)
    .then((userData) => {
      const payload = {
        datesToScheduleQueue: userData.datesToScheduleQueue,
        itemIds: userData.items ? Object.keys(userData.items) : [],
      };
      const allTransactions = { accounts: {}, transactions: {} };
      const lastItemId = payload.itemIds[payload.itemIds.length - 1];
      const lastDate = payload.datesToScheduleQueue[payload.datesToScheduleQueue.length - 1];

      if (payload.itemIds.length === 0) { response.json(allTransactions); }

      const itemsProm = payload.itemIds.map(itemId =>
        getItemFromDB(itemId)
          .then((itemObj) => {
            const transactions = itemObj.transactions ? itemObj.transactions : {};
            const accounts = itemObj.accounts ? itemObj.accounts : {};
            Object.assign(allTransactions.accounts, accounts);
            payload.datesToScheduleQueue.forEach((date) => {
              const mergeObj = Object.assign(allTransactions.transactions, transactions[date] || {});
              allTransactions.transactions = mergeObj;
              if (itemId === lastItemId && date === lastDate) { response.json(allTransactions); }
            });
          }));
      return Promise.all(itemsProm);
    });
}

export default getTransactionsFromDatabase;
