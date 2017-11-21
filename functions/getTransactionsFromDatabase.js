const user = require('./controllers/userController');
const item = require('./controllers/itemController');

function getTransactionsFromDatabase(request, response) {
  const uniqueUserId = request.body.uniqueUserId;
  let allTransactions = {};
  return user.getUserFromDB(uniqueUserId)
    .then((userData) => {
      const payload = {
        datesToScheduleQueue: userData.datesToScheduleQueue,
        itemIds: Object.keys(userData.items),
      };
      const promiseArr = payload.itemIds.map(itemId => item.getItemTransactionsFromDB(itemId)
        .then((transactions) => {
          payload.datesToScheduleQueue.forEach((date) => {
            const mergeObj = Object.assign(allTransactions, transactions[date] || {});
            allTransactions = mergeObj;
          });
        }));
      return Promise.all(promiseArr);
    })
    .then(() => response.json(allTransactions));
}

module.exports = getTransactionsFromDatabase;
