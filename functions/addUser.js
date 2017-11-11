const functions = require('firebase-functions');
const user = require('./controllers/userController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

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
  user.getUserProfile(uniqueUserId)
    .then(userProfile => ({
      email: userProfile.email,
      name: userProfile.displayName,
      OAuthToken,
    }))
    .then((payload) => {
      user.initializeUser(uniqueUserId, payload)
        .then(() => createGoogleCalendar(response)); // eslint-disable-line
    });
}

function createGoogleCalendar(response) {
  const config = {
    url: `${process.env.HOST}createNewCalendar`,
    payload: { OAuthToken, uniqueUserId },
  };
  axios.post(config.url, config.payload)
    .then((calendar) => {
      return {
        calId: calendar.data.id,
        calName: calendar.data.summary,
      };
    })
    .then((configCal) => {
      const userCalendarDetails = { calendarId: configCal.calId, calendarName: configCal.calName };
      user.updateUser(uniqueUserId, userCalendarDetails);
    })
    .then(response.end())
    .catch(error => console.log('Error fetching user data:', error));
}

module.exports = addUser;
