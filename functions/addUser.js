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
            response.send({ uniqueUserId });
          } else {
            addUserToDB(response); // eslint-disable-line
          }
        });
    });
});

function addUserToDB(response) {
  user.getUserProfile(uniqueUserId)
    .then((userRecord) => {
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
      user.initializeUser(uniqueUserId, payload);
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
      const userCalendarDetails = { calendarId: configCal.calId, calendarName: configCal.calName };
      user.updateUser(uniqueUserId, userCalendarDetails);
    })
    .then(response.end())
    .catch(error => console.log('Error fetching user data:', error));
}

// function createGoogleCalendar(config, response) {
// }

module.exports = addUser;
