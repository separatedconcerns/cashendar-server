const dotenv = require('dotenv');
dotenv.config();
const functions = require('firebase-functions');
const plaidClient = require('./apiClients/plaidClient.js');

const deleteItem = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const access_token = request.body.access_token;
  plaidClient.deleteItem(access_token)
    .then((result) => {
      response.end('Bank Item Deleted', result);
    });
});

module.exports = deleteItem;
