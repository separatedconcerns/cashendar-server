import { post } from 'axios';
import { getItemFromDB } from './controllers/itemController';
import { HOST } from './creds.json';

function processHistorical() {

}

async function processTransactionsRemoved(itemId, removedTransactions) {
  const config = {
    url: `${HOST}removeTransactionsFromDb`,
    payload: {
      itemId,
      removedTransactions,
    },
  };

  const uniqueUserId = await post(config.url, config.payload);
  await post(`${HOST}addCalendarEvents`, { uniqueUserId: uniqueUserId.data });
}

async function processInitial(itemId, newTransactions) {
  const itemData = await getItemFromDB(itemId);
  if (itemData) {
    const config = {
      url: `${HOST}getTransactionsFromPlaid`,
      payload: {
        accessToken: itemData.accessToken,
        uniqueUserId: itemData.uniqueUserId,
        newTransactions,
      },
    };
    await post(config.url, config.payload);
    await post(`${HOST}addCalendarEvents`, config.payload);
    // .catch(e => console.log('plaidWebHook Error!:', e));
  }
  return ' ';
}

export default async function plaidWebHook(request, response) {
  const itemId = request.body.item_id;
  const webHookCode = request.body.webhook_code;
  const newTransactions = request.body.new_transactions || null;
  const removedTransactions = request.body.removed_transactions || null;
  console.log('WEBHOOK HIT:', itemId, webHookCode, newTransactions, removedTransactions);

  if (webHookCode === 'HISTORICAL_UPDATE') {
    processHistorical();
  } else if (webHookCode === 'TRANSACTIONS_REMOVED') {
    processTransactionsRemoved(itemId, removedTransactions);
  } else {
    processInitial(itemId, newTransactions);
  }
  response.end();
}
