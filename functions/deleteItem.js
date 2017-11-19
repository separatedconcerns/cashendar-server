const item = require('./controllers/itemController');
const user = require('./controllers/userController');
const plaidClient = require('./apiClients/plaidClient.js');

function deleteItem(request, response) {
  const itemId = request.body.itemToDelete;

  Promise.all([item.getUserIdByItemFromDB(itemId), item.getAccessTokenByItem(itemId)])
    .then((values) => {
      const uniqueUserId = values[0];
      const accessToken = values[1];
      return Promise.all([
        plaidClient.deleteItem(accessToken),
        item.deleteItemFromItemsCollection(itemId),
        user.deleteItemFromUserCollection(uniqueUserId, itemId)]);
    })
    .then(result => response.end('Bank Item Deleted', result))
    .catch(error => console.log(error));
}

module.exports = deleteItem;
