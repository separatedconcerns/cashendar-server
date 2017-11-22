const item = require('../controllers/itemController');

function removeAllTransactionsInAnItem(request, response) {
  const itemId = request.body.itemId;
  item.removeAllTransactionsInAnItem(itemId)
    .then(() => response.end(`All Transactions Deleted for item: ${itemId}`))
    .catch(e => response.end(`Transactions NOT Deleted for item: ${itemId}, ${e}`));
}

module.exports = removeAllTransactionsInAnItem;
