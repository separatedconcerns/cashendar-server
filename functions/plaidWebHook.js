const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');

const plaidWebHook = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const itemId = request.body.item_id;
  const webHookCode = request.body.webhook_code;
  const newTransactions = request.body.new_transactions;

  if (webHookCode === 'INITIAL_UPDATE') {
    response.end();
  } else {
    const ref = admin.database().ref(`items/${itemId}`);
    ref.once('value')
      .then(snapshot => ({
        url: 'http://localhost:5000/testproject-6177f/us-central1/getTransactionsFromPlaid',
        payload: {
          access_token: snapshot.val().access_token,
          uniqueUserId: snapshot.val().uniqueUserId,
        },
      })).then((config) => {
        axios.post(config.url, config.payload)
          .then(() => {
            axios.post('http://localhost:5000/testproject-6177f/us-central1/addCalendarEvents', config.payload)
              .then(response.end());
          });
      });
  }
});

module.exports = plaidWebHook;
