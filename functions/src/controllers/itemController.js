import * as admin from '../apiClients/firebaseClient';

const db = admin.firestore();
const itemCollection = db.collection('items');
const anItemsDocs = itemId => itemCollection.doc(`${itemId}`);

export async function deleteItemFromItemsCollection(itemId) {
  let fs;
  try {
    fs = await anItemsDocs(itemId).delete();
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function getItemFromDB(itemId) {
  let fs;
  let item;
  try {
    fs = await anItemsDocs(itemId).get();
    item = fs.data();
  } catch (error) {
    console.log(error);
  }
  return item;
}

export async function getAccessTokenByItem(itemId) {
  let fs;
  let itemData;
  let accessToken;
  try {
    fs = await anItemsDocs(itemId).get();
    itemData = fs.data();
    accessToken = itemData.access_token;
  } catch (error) {
    console.log(error);
  }
  return accessToken;
}

export async function getItemTransactionsFromDB(itemId) {
  const transactions = {};
  try {
    const snapshot = await anItemsDocs(itemId).collection('transactions').get();
    snapshot.forEach((doc) => {
      transactions[doc.id] = doc.data();
    });
  } catch (error) {
    console.log(error);
  }
  return transactions;
}

export async function getUserIdByItemFromDB(itemId) {
  let fs;
  let uniqueUserId;
  try {
    fs = await anItemsDocs(itemId).get();
    uniqueUserId = fs.data().uniqueUserId;
  } catch (error) {
    console.log(error);
  }
  return uniqueUserId;
}

export async function addTransactionsByDate(itemId, date, transactions) {
  let fs;
  try {
    fs = await anItemsDocs(itemId).collection('transactions').doc(`${date}`).set(transactions);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function addDataToItem(itemId, dataToAdd) {
  let fs;
  try {
    fs = await anItemsDocs(itemId).set(dataToAdd);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function removeTransactions(itemId, dateAndId1, dateAndId2) {
  let fs;
  try {
    fs = await anItemsDocs(itemId).collection('transactions').doc(`${dateAndId1}`).remove();
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function addAccountsToItem(itemId, dataToAdd) {
  let fs;
  try {
    fs = await anItemsDocs(itemId).collection('accounts').doc(`${dataToAdd.account_id}`).set(dataToAdd);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function removeAllTransactionsInAnItem(itemId) {
  let fs;
  try {
    fs = await anItemsDocs(itemId).collection('transactions').delete();
  } catch (error) {
    console.log(error);
  }
  return fs;
}
