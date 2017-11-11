const admin = require('../apiClients/firebaseClient');

// const userRef = admin.database()
//   .ref(`users/${uniqueUserId}`);

const userRef = uniqueUserId => admin.database()
  .ref(`users/${uniqueUserId}`);

const doesUserExist = uniqueUserId =>
  new Promise((resolve, reject) => {
    userRef(uniqueUserId).once('value')
      .then(snapshot => resolve(snapshot.exists()))
      .catch(err => reject(err));
  });

const getUserFromDB = uniqueUserId =>
  new Promise((resolve, reject) => {
    userRef(uniqueUserId).once('value')
      .then(snapshot => resolve(snapshot.val()))
      .catch(err => reject(err));
  });

const getUserItems = uniqueUserId =>
  new Promise((resolve, reject) => {
    admin.database()
      .ref(`users/${uniqueUserId}/items`).once('value')
      .then(snapshot => resolve(snapshot))
      .catch(err => reject(err));
  });

const getUserProfile = uniqueUserId =>
  new Promise((resolve, reject) => {
    admin.auth()
      .getUser(uniqueUserId)
      .then(userRecord => resolve(userRecord.toJSON()))
      .catch(err => reject(err));
  });

const initializeUser = (uniqueUserId, payload) =>
  new Promise((resolve, reject) => {
    userRef(uniqueUserId).set(payload)
      .then(resolve())
      .catch(err => reject(err));
  });

const updateUser = (uniqueUserId, newData) =>
  new Promise((resolve, reject) => {
    userRef(uniqueUserId).update(newData)
      .then(resolve())
      .catch(err => reject(err));
  });

const deleteUserInAuth = uniqueUserId =>
  new Promise((resolve, reject) => {
    admin.auth()
      .deleteUser(uniqueUserId)
      .then(resolve())
      .catch(err => reject(err));
  });

const deleteUserFromDB = uniqueUserId =>
  new Promise((resolve, reject) => {
    userRef(uniqueUserId).remove()
      .then(resolve())
      .catch(err => reject(err));
  });

const getDatesToScheduleFromDB = uniqueUserId =>
  new Promise((resolve, reject) => {
    admin.database().ref(`users/${uniqueUserId}/datesToSchedule`).once('value')
      .then(snapshot => resolve(snapshot.val()))
      .catch(err => reject(err));
  });


module.exports = { doesUserExist,
  getUserFromDB,
  getUserItems,
  getUserProfile,
  initializeUser,
  updateUser,
  deleteUserInAuth,
  deleteUserFromDB,
  getDatesToScheduleFromDB,
};
