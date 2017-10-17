const functions = require('firebase-functions');
const user = require('./controllers/userController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');
const admin = require('./apiClients/firebaseClient');

let idToken;
let OAuthToken;
let uniqueUserId;

const addUser = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  idToken = request.body.idToken;
  OAuthToken = request.body.OAuthToken;

  verifyIdToken(idToken)
    .then((result) => {
      uniqueUserId = result;
      user.doesUserExist(uniqueUserId)
        .then((userExists) => {
          if (userExists) {
            // end response if user already exists
            response.send({ uniqueUserId });
          } else {
            addUserToDB(response); // eslint-disable-line
          }
        });
    });
});

function addUserToDB(response) {
  console.log('addUserToDB called');
  admin.auth().getUser(uniqueUserId)
    .then((userRecord) => {
      console.log(35);
      // todo: move userRecord.toJSON to controller also? 
      const userProfile = userRecord.toJSON();
      return {
        email: userProfile.email,
        name: userProfile.displayName,
        OAuthToken,
      };
    })
    .then((payload) => {
      // add user to db
      console.log(45);
      admin.database().ref(`users/${uniqueUserId}`).set(payload)
        .then(() => createGoogleCalendar(response)); // eslint-disable-line
    });
}

function createGoogleCalendar(response) {
  const config = {
    url: `${process.env.HOST}createNewCalendar`,
    payload: { OAuthToken, uniqueUserId },
  };

  axios.post(config.url, config.payload)
    .then(calendar => ({
      calId: calendar.data.id,
      calName: calendar.data.summary,
    }))
    .then((configCal) => {
      const userCalendarDetails = { calendarId: configCal.calId, calendarName: configCal.calName };
      user.updateUser(uniqueUserId, userCalendarDetails);
    })
    .then(response.end())
    .catch(error => console.log('Error fetching user data:', error));
}

module.exports = addUser;
