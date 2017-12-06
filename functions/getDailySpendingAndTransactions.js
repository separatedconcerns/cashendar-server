const axios = require('axios');
const creds = require('./creds.json');

function getDailySpendingAndTransactions(request, response) {
  const uniqueUserId = request.body.uniqueUserId;
  const config = {
    url: `${creds.HOST}getTransactionsFromDatabase`,
    payload: {
      uniqueUserId,
    },
  };
  axios.post(config.url, config.payload)
    .then((accountsAndTransactions) => {
      const transactions = accountsAndTransactions.data.transactions;
      const accounts = accountsAndTransactions.data.accounts;
      const transactionIds = Object.keys(transactions);
      // abbreviate transactionsByDateAndAccount w/ tBDAA
      const tBDAA = {};
      const transactionsByDateAndAccount = tBDAA;
      
      let counter = 0;
      if (transactionIds.length < 1) { response.json(transactionsByDateAndAccount); }
      transactionIds.forEach((transactionId) => {
        const transaction = transactions[transactionId];
        
        if (transaction.date) {
          const date = transaction.date;
          const acctId = transaction.account_id;
          const acctName = accounts[acctId].name;

          tBDAA[date] = tBDAA[date] || { sum: 0 };
          tBDAA[date][`${acctId}: ${acctName}`] = tBDAA[date][`${acctId}: ${acctName}`] || [];
          tBDAA[date][`${acctId}: ${acctName}`].push(` $ ${transaction.amount}   ${transaction.name}`);
          tBDAA[date].sum += transaction.amount;
        }

        if (counter >= transactionIds.length - 1) {
          response.json(transactionsByDateAndAccount);
        }
        counter += 1;
      });
    })
    .catch(error => console.log(error));
}

module.exports = getDailySpendingAndTransactions;
