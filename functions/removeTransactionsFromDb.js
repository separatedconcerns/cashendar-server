const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');

const removeTransactionsFromDb = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const itemId = request.body.itemId;
  const plaidRemovedTransactions = request.body.plaidRemovedTransactions;
  const ref = admin.database().ref(`items/${itemId}/transactions`);
  let uniqueUserId;
  
  admin.database().ref(`items/${itemId}/uniqueUserId`)
    .once('value')
    .then(snapshot => uniqueUserId = snapshot.val());

  ref.once('value')
    .then((snapshot) => {
      const transactionDatesToRemove = [];
      const transactions = snapshot.val();
      const transactionDates = Object.keys(transactions);

      plaidRemovedTransactions.forEach((transactionId) => {
        for (let i = 0; i < transactionDates.length; i += 1) {
          const date = transactionDates[i];
          if (transactions[date][transactionId]) {
            transactionDatesToRemove.push([date, transactionId]);
            break;
          }
        }
      });

      return { transactionDatesToRemove, transactionDates };
    })
    .then((transactionInfo) => {
      let counter = transactionInfo.transactionDatesToRemove.length;
      transactionInfo.transactionDatesToRemove.forEach((dateAndId) => {
        console.log(dateAndId);
        admin.database().ref(`items/${itemId}/transactions/${dateAndId[0]}/${dateAndId[1]}`)
          .remove()
          .then(counter -= 1);

        if (counter <= 0) {
          console.log(transactionInfo.transactionDatesToRemove.length, 'transactions have been removed from database.');
          admin.database().ref(`users/${uniqueUserId}/datesToSchedule`)
            .once('value')
            .set(transactionInfo.transactionDates)
            .then(response.end(uniqueUserId));
        }
      });
    });
});

module.exports = removeTransactionsFromDb;
