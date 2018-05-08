import { post } from 'axios';
import { getUserIdByItemFromDB, getAccessTokenByItem, getItemTransactionsFromDB, deleteItemFromItemsCollection } from './controllers/itemController';
import { doesUserExist, updateDatesToScheduleQueue, deleteItemFromUserCollection } from './controllers/userController';
import { deleteItem as _deleteItem } from './apiClients/plaidClient';
import { HOST } from './creds.json';

async function deleteItem(request, response) {
  const itemId = request.body.itemToDelete;
  try {
    const [uniqueUserId, accessToken] = await Promise.all([getUserIdByItemFromDB(itemId), getAccessTokenByItem(itemId)]);
    await _deleteItem(accessToken);
    const transactions = await getItemTransactionsFromDB(itemId);
    const transactionDates = Object.keys(transactions);
    const userExists = await doesUserExist(uniqueUserId);
    if (!userExists) { response.end('Bank Item Deleted'); }
    await updateDatesToScheduleQueue(uniqueUserId, transactionDates);
    await Promise.all([deleteItemFromItemsCollection(itemId), deleteItemFromUserCollection(uniqueUserId, itemId)]);
    const result = await post(`${HOST}addCalendarEvents`, { uniqueUserId });
    response.end('Bank Item Deleted', result);
  } catch (error) {
    console.log(error);
  }
}

export default deleteItem;
