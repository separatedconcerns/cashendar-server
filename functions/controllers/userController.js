const admin = require('../apiClients/firebaseClient');

const doesUserExist = uniqueUserId => admin.database()
  .ref(`users/${uniqueUserId}`)
  .once('value')
  .then(snapshot => snapshot.exists());

const getUserProfile = uniqueUserId => admin.auth().getUser(uniqueUserId);

const initializeUser = (uniqueUserId, payload) => {
  admin.database()
    .ref(`users/${uniqueUserId}`)
    .set(payload);
};

const updateUser = (uniqueUserId, newData) => {
  admin.database()
    .ref(`users/${uniqueUserId}`)
    .update(newData);
};

module.exports = { doesUserExist,
  getUserProfile,
  initializeUser,
  updateUser,
};
