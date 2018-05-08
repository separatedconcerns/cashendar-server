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
  const itemData = await getItemFromDB(itemId).catch(e => console.log(e));
  if (itemData) {
    const config = {
      url1: `${HOST}getTransactionsFromPlaid`,
      url2: `${HOST}addCalendarEvents`,
      payload: {
        access_token: itemData.access_token,
        uniqueUserId: itemData.uniqueUserId,
        newTransactions,
      },
    };
    try {
      await post(config.url1, config.payload);
      await post(config.url2, config.payload);
    } catch (error) {
      console.log(error);
    }
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
