const user = require('./controllers/userController');
const item = require('./controllers/itemController');

function getTransactionsFromDatabase(request, response) {
  const uniqueUserId = request.body.uniqueUserId;
  user.getUserFromDB(uniqueUserId)
    .then(userData => ({
      datesToScheduleQueue: userData.datesToScheduleQueue,
      itemIds: Object.keys(userData.items),
    }))
    .then((payload) => {
      let allTransactions = {};
      const lastItemId = payload.itemIds[payload.itemIds.length - 1];
      const lastDate = payload.datesToScheduleQueue[payload.datesToScheduleQueue.length - 1];
      payload.itemIds.forEach((itemId) => {
        item.getItemTransactionsFromDB(itemId)
          .then((transactions) => {
            payload.datesToScheduleQueue.forEach((date) => {
              const mergeObj = Object.assign(allTransactions, transactions[date] || {});
              allTransactions = mergeObj;
              if (itemId === lastItemId && date === lastDate) {
                response.json(allTransactions);
              }
            });
          });
      });
    });
}

module.exports = getTransactionsFromDatabase;
