const user = require('./controllers/userController');
const item = require('./controllers/itemController');

function getTransactionsFromDatabase(request, response) {
  const uniqueUserId = request.body.uniqueUserId;
  user.getUserFromDB(uniqueUserId)
    .then(userData => ({
      datesToScheduleQueue: userData.datesToScheduleQueue,
      itemIds: userData.items ? Object.keys(userData.items) : [],
    }))
    .then((payload) => {
      let allTransactions = {};
      const lastItemId = payload.itemIds[payload.itemIds.length - 1];
      const lastDate = payload.datesToScheduleQueue[payload.datesToScheduleQueue.length - 1];
      if (payload.itemIds.length) {
        payload.itemIds.forEach((itemId) => {
          item.getItemTransactionsFromDB(itemId)
            .then((transactions) => {
              transactions = transactions || {};
              payload.datesToScheduleQueue.forEach((date) => {
                const mergeObj = Object.assign(allTransactions, transactions[date] || {});
                allTransactions = mergeObj;
                if (itemId === lastItemId && date === lastDate) {
                  response.json(allTransactions);
                }
              });
            });
        });
      } else {
        response.json(allTransactions);
      }
    });
}

module.exports = getTransactionsFromDatabase;
