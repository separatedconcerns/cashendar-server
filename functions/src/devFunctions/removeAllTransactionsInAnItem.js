import { removeAllTransactionsInAnItem as _removeAllTransactionsInAnItem } from '../controllers/itemController';

function removeAllTransactionsInAnItem(request, response) {
  const itemId = request.body.itemId;
  _removeAllTransactionsInAnItem(itemId)
    .then(response.end(`All Transactions Deleted for item: ${itemId}`))
    .catch(e => response.end(`Transactions NOT Deleted for item: ${itemId}, ${e}`));
}

export default removeAllTransactionsInAnItem;
