const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const plaidClient = require('./apiClients/plaidClient.js');

const exchangePublicToken = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const publicToken = request.body.publicToken;
  const uniqueUserId = request.body.uniqueUserId;

  plaidClient.exchangePublicToken(publicToken)
    .then((successResponse) => {
      const payload = {
        itemId: successResponse.item_id,
        access_token: successResponse.access_token,
        request_id: successResponse.request_id,
      };
      admin.database()
        .ref(`/users/${uniqueUserId}/items/${payload.itemId}`)
        .set(payload.itemId);
      admin.database()
        .ref(`/items/${payload.itemId}`)
        .set({ access_token: payload.access_token, uniqueUserId });
    }).then(response.end())
    .catch(error => console.log(error));
});

module.exports = exchangePublicToken;