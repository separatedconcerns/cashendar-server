const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');


const plaidWebHook = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const itemId = request.body.item_id;
  const webHookCode = request.body.webhook_code;
  const newTransactions = request.body.new_transactions || null;
  console.log('WEBHOOK HIT:', itemId, webHookCode, newTransactions);

  if (webHookCode === 'INITIAL_UPDATE') {
    response.end();
  } else if (webHookCode === 'TRANSACTIONS_REMOVED') {
    const config = {
      url: `${process.env.HOST}removeTransactionsFromDb`,
      payload: {
        itemId,
        removedTransactions: request.body.removed_transactions,
      },
    };

    axios.post(config.url, config.payload)
      .then((uniqueUserId) => {
        axios.post(`${process.env.HOST}addCalendarEvents`, { uniqueUserId })
          .then(response.end())
          .catch(e => console.log('TRANSACTIONS_REMOVED ERROR!:', e));
      })
      .catch(e => console.log(e, 'line 26 plaidWebHook'));
  } else {
    const ref = admin.database().ref(`items/${itemId}`);
    ref.once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          const config = {
            url: `${process.env.HOST}getTransactionsFromPlaid`,
            payload: {
              access_token: snapshot.val().access_token,
              uniqueUserId: snapshot.val().uniqueUserId,
              newTransactions,
            },
          };
          axios.post(config.url, config.payload)
            .then(() => {
              axios.post(`${process.env.HOST}addCalendarEvents`, config.payload)
                .then(response.end());
            })
            .catch(e => console.log('plaidWebHook Error!:', e));
        } else {
          response.end();
        }
      });
  }
});

module.exports = plaidWebHook;
