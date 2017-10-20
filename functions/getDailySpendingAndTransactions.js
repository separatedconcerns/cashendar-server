const functions = require('firebase-functions');
const axios = require('axios');

const getDailySpendingAndTransactions = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  const config = {
    url: `${process.env.HOST}getTransactionsFromDatabase`,
    payload: {
      uniqueUserId,
    },
  };
  axios.post(config.url, config.payload)
    .then((transactions) => {
      const transKeys = Object.keys(transactions.data);
      const transactionsByDate = {};
      let counter = 0;
      transKeys.forEach((key) => {
        const transaction = transactions.data[key];
        if (transaction) {
          transactionsByDate[transaction.date] = transactionsByDate[transaction.date] || { list: [], sum: 0 };
          transactionsByDate[transaction.date].list.push(` $ ${transaction.amount}   ${transaction.name}`);
          transactionsByDate[transaction.date].sum += transaction.amount;
        }

        if (counter >= transKeys.length - 1) {
          response.json(transactionsByDate);
        }
        counter += 1;
      });
    })
    .catch(error => console.log(error));
});

module.exports = getDailySpendingAndTransactions;
