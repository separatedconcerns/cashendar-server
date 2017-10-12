
const packageTransactionsByDate = (transactions) => {
  const transactionsByDate = {};

  transactions.forEach((transaction) => {
    transactionsByDate[transaction.date] = transactionsByDate[transaction.date] || {};
    transactionsByDate[transaction.date][transaction.transaction_id] = transaction;
  });

  return transactionsByDate;
};

module.exports = packageTransactionsByDate;
