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
  const transactionsByDate = {};
  axios.post(config.url, config.payload)
    .then((transactions) => {
      console.log(transactions.data.length);
      transactions.data.forEach((transaction) => {
        if (transaction) {
          transactionsByDate[transaction.date] = transactionsByDate[transaction.date] || { list: [], sum: 0 };
          transactionsByDate[transaction.date].list.push(`${transaction.name}: $${transaction.amount}`);
          transactionsByDate[transaction.date].sum += transaction.amount;
        }
      });
      return transactionsByDate;
    })
    .then(transactionsByDate => response.json(transactionsByDate))
    .catch(error => console.log(error));
});

module.exports = getDailySpendingAndTransactions;
