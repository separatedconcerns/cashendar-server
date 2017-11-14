const functions = require('firebase-functions');
const admin = require('../apiClients/firebaseClient');

const removeAllTransactionsInAnItem = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const itemId = request.body.itemId;
  admin.database()
    .ref(`items/${itemId}/transactions`)
    .remove()
    .then(response.end(`All Transactions Deleted for item: ${itemId}`))
    .catch(e => response.end(`Transactions NOT Deleted for item: ${itemId}, ${e}`));
});

module.exports = removeAllTransactionsInAnItem;
