const functions = require('firebase-functions');
const plaidClient = require('./apiClients/plaidClient.js');

const deleteItem = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const accessToken = request.body.access_token;
  plaidClient.deleteItem(accessToken)
    .then((result) => {
      response.end('Bank Item Deleted', result);
    });
});

module.exports = deleteItem;
