const admin = require('../apiClients/firebaseClient');

const db = ref => admin.database().ref(ref);

exports.deleteItemFromItemsCollection = itemId =>
  db(`items/${itemId}`)
    .remove();

exports.getItemFromDB = itemId =>
  db(`items/${itemId}`)
    .once('value')
    .then(snapshot => snapshot.val());

exports.getAccessTokenByItem = itemId =>
  db(`items/${itemId}/access_token`)
    .once('value')
    .then(snapshot => snapshot.val());

exports.getItemTransactionsFromDB = itemId =>
  db(`items/${itemId}/transactions`)
    .once('value')
    .then(snapshot => snapshot.val());

exports.addTransactionsByDate = (itemId, date, transactions) =>
  db(`/items/${itemId}/transactions/${date}`)
    .update(transactions);

exports.getUserIdByItemFromDB = itemId =>
  db(`items/${itemId}/uniqueUserId`)
    .once('value')
    .then(snapshot => snapshot.val());

exports.addDataToItem = (itemId, dataToAdd) =>
  db(`items/${itemId}`)
    .set(dataToAdd);

exports.removeTransactions = (itemId, dateAndId1, dateAndId2) =>
  db(`items/${itemId}/transactions/${dateAndId1}/${dateAndId2}`)
    .remove();

exports.addAccountsToItem = (itemId, dataToAdd) =>
  db(`items/${itemId}/accounts/${dataToAdd.account_id}`)
    .update(dataToAdd);

exports.removeAllTransactionsInAnItem = itemId =>
  db(`items/${itemId}/transactions`)
    .remove();
