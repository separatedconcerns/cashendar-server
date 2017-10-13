
const packageTransactionsById = (transactions) => {
  const transactionsById = {};

  transactions.forEach((transaction) => {
    transactionsById[transaction.transaction_id] = transaction;
  });

  return transactionsById;
};

module.exports = packageTransactionsById;
