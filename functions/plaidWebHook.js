const item = require('./controllers/itemController');
const axios = require('axios');

function plaidWebHook(request, response) {
  const itemId = request.body.item_id;
  const webHookCode = request.body.webhook_code;
  const newTransactions = request.body.new_transactions || null;
  console.log('WEBHOOK HIT:', itemId, webHookCode, newTransactions);

  if (webHookCode === 'INITIAL_UPDATE') {
    return response.end();
  } else if (webHookCode === 'TRANSACTIONS_REMOVED') {
    const config = {
      url: `${process.env.HOST}removeTransactionsFromDb`,
      payload: {
        itemId,
        removedTransactions: request.body.removed_transactions,
      },
    };
    return axios.post(config.url, config.payload)
      .then(uniqueUserId => axios.post(`${process.env.HOST}addCalendarEvents`, { uniqueUserId: uniqueUserId.data }))
      .then(() => response.end())
      .catch(e => console.log('TRANSACTIONS_REMOVED ERROR!:', e));
  } return item.getItemFromDB(itemId)
    .then((itemData) => {
      if (itemData) {
        const config = {
          url: `${process.env.HOST}getTransactionsFromPlaid`,
          payload: {
            access_token: itemData.access_token,
            uniqueUserId: itemData.uniqueUserId,
            newTransactions,
          },
        };
        return axios.post(config.url, config.payload)
          .then(() => axios.post(`${process.env.HOST}addCalendarEvents`, config.payload))
          .then(() => response.end())
          .catch(e => console.log('plaidWebHook Error!:', e));
      }
      return response.end();
    });
}

module.exports = plaidWebHook;
