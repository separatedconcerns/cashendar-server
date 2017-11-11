const admin = require('../apiClients/firebaseClient');

// const itemRef = (itemId) => {
//   admin.database().ref(`items/${itemId}`);
// };

const deleteItemFromDB = itemId =>
  new Promise((resolve, reject) => {
    admin.database()
      .ref(`items/${itemId}`)
      .remove()
      .then(resolve())
      .catch(err => reject(err));
  });

const getItemFromDB = itemId =>
  new Promise((resolve, reject) => {
    admin.database()
      .ref(`items/${itemId}`)
      .once('value')
      .then(snapshot => resolve(snapshot.val()))
      .catch(err => reject(err));
  });

const getItemTransactionsFromDB = itemId =>
  new Promise((resolve, reject) => {
    admin.database()
      .ref(`items/${itemId}/transactions`)
      .once('value')
      .then(snapshot => resolve(snapshot.val()))
      .catch(err => reject(err));
  });

const addTransactionsByDate = (itemId, date, transactions) =>
  new Promise((resolve, reject) => {
    admin.database()
      .ref(`/items/${itemId}/transactions/${date}`)
      .update(transactions)
      .then(resolve())
      .catch(err => reject(err));
  });

const getUserIdByItemFromDB = itemId =>
  new Promise((resolve, reject) => {
    admin.database()
      .ref(`items/${itemId}/uniqueUserId`)
      .once('value')
      .then(snapshot => resolve(snapshot.val()))
      .catch(err => reject(err));
  });

const addDataToItem = (itemId, dataToAdd) =>
  new Promise((resolve, reject) => {
    admin.database()
      .ref(`items/${itemId}`)
      .set(dataToAdd)
      .then(resolve())
      .catch(err => reject(err));
  });

const removeTransactions = (itemId, dateAndId1, dateAndId2) =>
  new Promise((resolve, reject) => {
    admin.database()
      .ref(`items/${itemId}/transactions/${dateAndId1}/${dateAndId2}`)
      .remove()
      .then(resolve())
      .catch(err => reject(err));
  });


module.exports = {
  deleteItemFromDB,
  getItemFromDB,
  getItemTransactionsFromDB,
  addTransactionsByDate,
  getUserIdByItemFromDB,
  addDataToItem,
  removeTransactions,
};
