const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');

const getTransactionsFromDatabase = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  const allTransactions = {};
  admin.database()
    .ref('items/')
    .once('value')
    .then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().uniqueUserId === uniqueUserId) {
          Object.assign(allTransactions, childSnapshot.val().transactions);
        }
      });
    })
    .then(() => {
      response.json(allTransactions);
    });
});

module.exports = getTransactionsFromDatabase;
