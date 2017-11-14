const functions = require('firebase-functions');
const item = require('./controllers/itemController');
const user = require('./controllers/userController');
const plaidClient = require('./apiClients/plaidClient.js');

const deleteItem = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
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
              item.deleteItemFromItemsCollection(itemId);
              return result;
            })
            .then((result) => {
              console.log('28', uniqueUserId);
              console.log('29', itemId);
              user.deleteItemFromUserCollection(uniqueUserId, itemId);
              return result;
            })
            .then((result) => {
              response.end('Bank Item Deleted', result);
            });
        });
    });
});

module.exports = deleteItem;
