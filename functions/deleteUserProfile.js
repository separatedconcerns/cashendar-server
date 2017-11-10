const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

const deleteUserProfile = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const idToken = request.body.idToken;
  let uniqueUserId;

  verifyIdToken(idToken).then((result) => {
    uniqueUserId = result;
  })
    .then(() => {
      deleteBankItems(uniqueUserId);
    })
    .then(() => {
      deleteCalendar(uniqueUserId);
    })
    .then(() => {
      admin.auth().deleteUser(uniqueUserId)
        .then(response.end('Profile Deleted'));
    })
    .catch(e => console.log(e));
});

const deleteBankItems = (uniqueUserId) => {
  admin.database()
    .ref(`users/${uniqueUserId}/items`)
    .once('value')
    .then((snapshot) => { // currently returns null
      snapshot.forEach((childSnapshot) => {
        admin.database()
          .ref(`items/${childSnapshot.val()}/`)
          .once('value')
          .then((snap) => {
            const config = {
              url: `${process.env.HOST}deleteItem`,
              payload: {
                access_token: snap.val().access_token,
              },
            };
            axios.post(config.url, config.payload).then(plaidRes => console.log('29', plaidRes.data));
          })
          .then(() => admin.database().ref(`items/${childSnapshot.val()}`).remove());
      });
    });
};

const deleteCalendar = (uniqueUserId) => {
  const ref = admin.database().ref(`users/${uniqueUserId}/`);
  ref.once('value')
    .then((snapshot) => {
      const config = {
        url: `${process.env.HOST}deleteCalendar`,
        payload: {
          calendarId: snapshot.val().calendarId,
          OAuthToken: snapshot.val().OAuthToken,
        },
      };
      axios.post(config.url, config.payload)
        .then(response => console.log('62 Gcal Deletion Response', response.data))
        .then(admin.database().ref(`users/${uniqueUserId}`).remove());
    });
};


module.exports = deleteUserProfile;
