import { removeAllTransactionsInAnItem as _removeAllTransactionsInAnItem } from '../controllers/itemController';

async function removeAllTransactionsInAnItem(request, response) {
  const itemId = request.body.itemId;
  await _removeAllTransactionsInAnItem(itemId);
  response.end(`All Transactions Deleted for item: ${itemId}`);
  // .catch(e => response.end(`Transactions NOT Deleted for item: ${itemId}, ${e}`));
}

export default removeAllTransactionsInAnItem;
