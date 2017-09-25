const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');

const deleteUserProfile = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  const itemsRef = admin.database().ref(`users/${uniqueUserId}/items`);
  itemsRef.once('value')
    .then((snapshot) => {
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
            axios.post(config.url, config.payload);
          })
          .then(() => admin.database().ref(`items/${childSnapshot.val()}`).remove());
      });
    }).then(() => {
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
            .then(admin.database().ref(`users/${uniqueUserId}`).remove());
        });
    }).then(() => {
      admin.auth().deleteUser(uniqueUserId)
        .then(response.end('Profile Deleted'));
    })
    .catch(e => console.log(e));
});


module.exports = deleteUserProfile;
