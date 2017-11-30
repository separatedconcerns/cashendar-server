const admin = require('../apiClients/firebaseClient');

const db = ref => admin.database().ref(ref);

exports.deleteItemFromItemsCollection = itemId =>
  db(`items/${itemId}`)
    .remove()
    .catch(err => console.log(err));

exports.getItemFromDB = itemId =>
  db(`items/${itemId}`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));

exports.getAccessTokenByItem = itemId =>
  db(`items/${itemId}/access_token`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));

exports.getItemTransactionsFromDB = itemId =>
  db(`items/${itemId}/transactions`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));

exports.addTransactionsByDate = (itemId, date, transactions) =>
  db(`/items/${itemId}/transactions/${date}`)
    .update(transactions)
    .catch(err => console.log(err));

exports.getUserIdByItemFromDB = itemId =>
  db(`items/${itemId}/uniqueUserId`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));

exports.addDataToItem = (itemId, dataToAdd) =>
  db(`items/${itemId}`)
    .set(dataToAdd)
    .catch(err => console.log(err));

exports.removeTransactions = (itemId, dateAndId1, dateAndId2) =>
  db(`items/${itemId}/transactions/${dateAndId1}/${dateAndId2}`)
    .remove()
    .catch(err => console.log(err));

exports.addAccountsToItem = (itemId, dataToAdd) =>
  db(`items/${itemId}/accounts/${dataToAdd.account_id}`)
    .set(dataToAdd)
    .catch(err => console.log(err));

exports.removeAllTransactionsInAnItem = itemId =>
  db(`items/${itemId}/transactions`)
    .remove()
    .catch(err => console.log(err));
