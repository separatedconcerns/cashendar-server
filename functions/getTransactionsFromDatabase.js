const user = require('./controllers/userController');
const item = require('./controllers/itemController');

function getTransactionsFromDatabase(request, response) {
  const uniqueUserId = request.body.uniqueUserId;
  user.getUserFromDB(uniqueUserId)
    .then((userData) => {
      const payload = {
        datesToScheduleQueue: userData.datesToScheduleQueue,
        itemIds: Object.keys(userData.items),
      };
      let allTransactions = {};
      const lastItemId = payload.itemIds[payload.itemIds.length - 1];
      const lastDate = payload.datesToScheduleQueue[payload.datesToScheduleQueue.length - 1];
      const promiseArr = payload.itemIds.map(itemId => item.getItemTransactionsFromDB(itemId)
        .then((transactions) => {
          payload.datesToScheduleQueue.forEach((date) => {
            const mergeObj = Object.assign(allTransactions, transactions[date] || {});
            allTransactions = mergeObj;
            if (itemId === lastItemId && date === lastDate) {
              response.json(allTransactions);
            }
          });
        }));
      return Promise.all(promiseArr);
    });
}

module.exports = getTransactionsFromDatabase;
