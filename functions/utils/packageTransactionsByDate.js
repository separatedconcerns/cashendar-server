
const packageTransactionsByDate = (transactions) => {
  const transactionsByDate = {};

  transactions.forEach((transaction) => {
    transactionsByDate[transaction.date] = transactionsByDate[transaction.date] || [];
    transactionsByDate[transaction.date].push(transaction);
  });

  return transactionsByDate;
};

module.exports = packageTransactionsByDate;
