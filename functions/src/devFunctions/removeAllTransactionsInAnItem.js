import { removeAllTransactionsInAnItem as _removeAllTransactionsInAnItem } from '../controllers/itemController';

async function removeAllTransactionsInAnItem(request, response) {
  const itemId = request.body.itemId;
  try {
    await _removeAllTransactionsInAnItem(itemId);
  } catch (error) {
    console.log(`Transactions NOT Deleted for item: ${itemId}, ${error}`);
  }
  response.end(`All Transactions Deleted for item: ${itemId}`);
}

export default removeAllTransactionsInAnItem;
