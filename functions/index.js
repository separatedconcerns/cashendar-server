// const axios = require('axios');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const plaid = require('plaid');
const dotenv = require('dotenv');
dotenv.config();

admin.initializeApp(functions.config().firebase);

exports.addMessage = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const username = request.body.username;
  const currentItem = request.body.currentItem;
  admin.database()
  .ref('/items')
  .push({username: username, currentItem: currentItem})
  .then(() => {
    response.end();
  });
});

exports.exchangePublicToken = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const publicToken = request.body.publicToken;
  const plaidClient = new plaid.Client(
    process.env.REACT_APP_PLAID_CLIENT_ID,
    process.env.REACT_APP_PLAID_SECRET,
    process.env.REACT_APP_PLAID_PUBLIC_KEY,
    plaid.environments.sandbox);

  plaidClient.exchangePublicToken(publicToken)
    .then((successResponse) => {

      let item_id = successResponse.item_id;
      let access_token = successResponse.access_token;
      let request_id = successResponse.request_id;

      admin.database()
      .ref('/users')
      .push({item_id: item_id,
        access_token: access_token,
          request_id: request_id})
      .then(() => {
        response.end();
      });
    }).catch((error) => {
      console.log(error);
    });
});

exports.returnMessages = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const itemsRef = admin.database().ref('items');
  itemsRef.on('value', (snapshot) => {
    let items = snapshot.val();
    let newState = [];
    for (let item in items) {
      newState.push({
        id: item,
        currentItem: items[item].currentItem,
        username: items[item].username
      });
    }
    response.end();
  });
});
