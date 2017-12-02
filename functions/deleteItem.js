const item = require('./controllers/itemController');
const user = require('./controllers/userController');
const axios = require('axios');
const plaidClient = require('./apiClients/plaidClient.js');
const Promise = require('bluebird');
const creds = require('./creds.json');

function deleteItem(request, response) {
  const itemId = request.body.itemToDelete;
  let uniqueUserId;
  let accessToken;

  Promise.all([item.getUserIdByItemFromDB(itemId), item.getAccessTokenByItem(itemId)])
    .then((output) => {
      uniqueUserId = output[0];
      accessToken = output[1];
      return plaidClient.deleteItem(accessToken);
    })
    .then(() => item.getItemTransactionsFromDB(itemId))
    .then(transactions => Object.keys(transactions))
    .then(transactionDates => user.updateDatesToScheduleQueue(uniqueUserId, transactionDates))
    .then(() => Promise.all([item.deleteItemFromItemsCollection(itemId), user.deleteItemFromUserCollection(uniqueUserId, itemId)]))
    .then(() => axios.post(`${creds.HOST}addCalendarEvents`, { uniqueUserId }))
    .then((result) => { response.end('Bank Item Deleted', result); });
}

module.exports = deleteItem;
