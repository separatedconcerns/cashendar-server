const item = require('./controllers/itemController');
const user = require('./controllers/userController');
const plaidClient = require('./apiClients/plaidClient.js');

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
              item.deleteItemFromItemsCollection(itemId);
              user.deleteItemFromUserCollection(uniqueUserId, itemId);
              return result;
            })
            .then((result) => {
              response.end('Bank Item Deleted', result);
            });
        });
    });
}

module.exports = deleteItem;
