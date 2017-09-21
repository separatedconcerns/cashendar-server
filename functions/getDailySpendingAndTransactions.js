const functions = require('firebase-functions');
const axios = require('axios');

const getDailySpendingAndTransactions = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  const config = {
    url: 'http://localhost:5000/testproject-6177f/us-central1/getTransactionsFromDatabase',
    payload: {
      uniqueUserId,
    },
  };

  axios.post(config.url, config.payload)
    .then((transactions) => {
      const transactionsByDate = {};
      transactions.data.forEach((transaction) => {
        let txn = transactionsByDate[transaction.date];
        txn = txn || { list: [], sum: 0 };
        txn.list
          .push(`${transaction.name}: $${transaction.amount}`);
        txn.sum += transaction.amount;
      });
      return transactionsByDate;
    }).then(transactionsByDate => response.json(transactionsByDate))
    .catch(error => console.log(error));
});

module.exports = getDailySpendingAndTransactions;
