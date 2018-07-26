import { database } from '../apiClients/firebaseClient';

const db = ref => database().ref(ref);

export function deleteItemFromItemsCollection(itemId) {
  return db(`items/${itemId}`)
    .remove()
    .catch(err => console.log(err));
}

export function getItemFromDB(itemId) {
  return db(`items/${itemId}`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));
}

export function getAccessTokenByItem(itemId) {
  return db(`items/${itemId}/access_token`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));
}

export function getItemTransactionsFromDB(itemId) {
  return db(`items/${itemId}/transactions`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));
}

export function addTransactionsByDate(itemId, date, transactions) {
  return db(`/items/${itemId}/transactions/${date}`)
    .update(transactions)
    .catch(err => console.log(err));
}

export function getUserIdByItemFromDB(itemId) {
  return db(`items/${itemId}/uniqueUserId`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));
}

export function addDataToItem(itemId, dataToAdd) {
  return db(`items/${itemId}`)
    .set(dataToAdd)
    .catch(err => console.log(err));
}

export function removeTransactions(itemId, dateAndId1, dateAndId2) {
  return db(`items/${itemId}/transactions/${dateAndId1}/${dateAndId2}`)
    .remove()
    .catch(err => console.log(err));
}

export function addAccountsToItem(itemId, dataToAdd) {
  return db(`items/${itemId}/accounts/${dataToAdd.account_id}`)
    .set(dataToAdd)
    .catch(err => console.log(err));
}

export function removeAllTransactionsInAnItem(itemId) {
  return db(`items/${itemId}/transactions`)
    .remove()
    .catch(err => console.log(err));
}
