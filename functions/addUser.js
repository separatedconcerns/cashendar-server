const functions = require('firebase-functions');
const verifyIdToken = require('./utils/verifyIdToken.js');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');

const addUser = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const idToken = request.body.idToken;
  const OAuthToken = request.body.OAuthToken;
  let uniqueUserId;

  verifyIdToken(idToken)
    .then((result) => {
      uniqueUserId = result;
      admin.database()
        .ref(`users/${uniqueUserId}`)
        .once('value')
        .then(snapshot => snapshot.exists());
    })
    .then((exists) => {
      if (exists) {
        response.send({ userExists: true });
      } else {
        return admin.auth().getUser(uniqueUserId);
      }
    })
    .then((userRecord) => {
      const user = userRecord.toJSON();
      return {
        email: user.email,
        name: user.displayName,
        OAuthToken,
      };
    })
    .then((payload) => {
      admin.database()
        .ref(`users/${uniqueUserId}`)
        .set(payload);
    })
    .then(() => {
      const config = {
        url: `${process.env.HOST}createNewCalendar`,
        payload: { OAuthToken, uniqueUserId },
      };
      return config;
    })
    .then(config => axios.post(config.url, config.payload)
      .then(calendar => ({
        calId: calendar.data.id,
        calName: calendar.data.summary,
      })))
    .then((configCal) => {
      admin.database()
        .ref(`users/${uniqueUserId}`)
        .update({ calendarId: configCal.calId, calendarName: configCal.calName });
    })
    .then(response.end())
    .catch(error => console.log('Error fetching user data:', error));
});

module.exports = addUser;
