import { post } from 'axios';
import { getItemFromDB } from './controllers/itemController';
import { HOST } from './creds.json';

function plaidWebHook(request, response) {
  const itemId = request.body.item_id;
  const webHookCode = request.body.webhook_code;
  const newTransactions = request.body.new_transactions || null;
  console.log('WEBHOOK HIT:', itemId, webHookCode, newTransactions);

  if (webHookCode === 'HISTORICAL_UPDATE') {
    response.end();
  } else if (webHookCode === 'TRANSACTIONS_REMOVED') {
    const config = {
      url: `${HOST}removeTransactionsFromDb`,
      payload: {
        itemId,
        removedTransactions: request.body.removed_transactions,
      },
    };

    post(config.url, config.payload)
      .then(uniqueUserId =>
        post(`${HOST}addCalendarEvents`, { uniqueUserId: uniqueUserId.data }))
      .then(response.end())
      .catch(e => console.log('TRANSACTIONS_REMOVED ERROR!:', e));
  } else {
    getItemFromDB(itemId)
      .then((itemData) => {
        if (itemData) {
          const config = {
            url: `${HOST}getTransactionsFromPlaid`,
            payload: {
              access_token: itemData.access_token,
              uniqueUserId: itemData.uniqueUserId,
              newTransactions,
            },
          };
          post(config.url, config.payload)
            .then(() => post(`${HOST}addCalendarEvents`, config.payload))
            .then(() => response.end())
            .catch(e => console.log('plaidWebHook Error!:', e));
        } else {
          response.end();
        }
      });
  }
}

export default plaidWebHook;
