const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');

const removeTransactionsFromDb = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const itemId = request.body.itemId;
  const plaidRemovedTransactions = request.body.removedTransactions;
  const ref = admin.database().ref(`items/${itemId}/transactions`);
  let uniqueUserId;
  
  admin.database().ref(`items/${itemId}/uniqueUserId`)
    .once('value')
    .then(snapshot => uniqueUserId = snapshot.val());

  ref.once('value')
    .then((snapshot) => {
      const transactionsToRemove = [];
      const transactionsToRemoveDates = {};
      const transactions = snapshot.val();
      const transactionDates = Object.keys(transactions);

      plaidRemovedTransactions.forEach((transactionId) => {
        for (let i = 0; i < transactionDates.length; i += 1) {
          const date = transactionDates[i];
          if (transactions[date][transactionId]) {
            transactionsToRemove.push([date, transactionId]);
            transactionsToRemoveDates[date] = true;
            break;
          }
        }
      });

      return { transactionsToRemove, transactionsToRemoveDates };
    })
    .then((transactionInfo) => {
      let counter = transactionInfo.transactionsToRemove.length;
      transactionInfo.transactionsToRemove.forEach((dateAndId) => {
        admin.database().ref(`items/${itemId}/transactions/${dateAndId[0]}/${dateAndId[1]}`)
          .remove()
          .then(counter -= 1);

        if (counter <= 0) {
          console.log(transactionInfo.transactionsToRemove.length, 'transactions have been removed from database.');
          admin.database().ref(`users/${uniqueUserId}/datesToSchedule`)
            .set(Object.keys(transactionInfo.transactionsToRemoveDates))
            .then(response.send(uniqueUserId));
        }
      });
    });
});

module.exports = removeTransactionsFromDb;
