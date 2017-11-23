const item = require('./controllers/itemController');
const user = require('./controllers/userController');
const axios = require('axios');
const plaidClient = require('./apiClients/plaidClient.js');
const Promise = require('bluebird');

function deleteItem(request, response) {
  const itemId = request.body.itemToDelete;
  let uniqueUserId;
  let accessToken;

  item.getUserIdByItemFromDB(itemId)
    .then((output) => {
      uniqueUserId = output;
    })
    .then(() => {
      item.getAccessTokenByItem(itemId)
        .then((token) => {
          accessToken = token;
        })
        .then(() => {
          plaidClient.deleteItem(accessToken)
            .then((result) => {
              item.getItemTransactionsFromDB(itemId)
                .then((transactions) => {
                  return Object.keys(transactions);
                })
                .then((transactionDates) => {
                  console.log(transactionDates);
                  user.updateDatesToScheduleQueue(uniqueUserId, transactionDates)
                    .then(() => {
                      Promise.all([item.deleteItemFromItemsCollection(itemId),
                        user.deleteItemFromUserCollection(uniqueUserId, itemId)])
                        .then(() => {
                          axios.post(`${process.env.HOST}addCalendarEvents`, { uniqueUserId })
                            .then(() => {
                              response.end('Bank Item Deleted', result);
                            });
                        });
                    });
                });
            });
        });
    });
}

module.exports = deleteItem;
