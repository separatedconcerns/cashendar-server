import { post } from 'axios';
import { all } from 'bluebird';
import { getUserIdByItemFromDB, getAccessTokenByItem, getItemTransactionsFromDB, deleteItemFromItemsCollection } from './controllers/itemController';
import { updateDatesToScheduleQueue, deleteItemFromUserCollection } from './controllers/userController';
import { deleteItem as _deleteItem } from './apiClients/plaidClient';
import { HOST } from './creds.json';

function deleteItem(request, response) {
  const itemId = request.body.itemToDelete;
  let uniqueUserId;
  let accessToken;

  all([getUserIdByItemFromDB(itemId), getAccessTokenByItem(itemId)])
    .then((output) => {
      uniqueUserId = output[0];
      accessToken = output[1];
      return _deleteItem(accessToken);
    })
    .then(() => getItemTransactionsFromDB(itemId))
    .then(transactions => Object.keys(transactions))
    .then(transactionDates => updateDatesToScheduleQueue(uniqueUserId, transactionDates))
    .then(() => all([deleteItemFromItemsCollection(itemId), deleteItemFromUserCollection(uniqueUserId, itemId)]))
    .then(() => post(`${HOST}addCalendarEvents`, { uniqueUserId }))
    .then((result) => { response.end('Bank Item Deleted', result); });
}

export default deleteItem;
