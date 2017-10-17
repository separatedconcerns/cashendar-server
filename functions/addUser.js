const functions = require('firebase-functions');
const user = require('./controllers/userController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

const addUser = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const idToken = request.body.idToken;
  const OAuthToken = request.body.OAuthToken;
  let uniqueUserId;

  verifyIdToken(idToken)
    .then((result) => {
      uniqueUserId = result;
      user.doesUserExist(uniqueUserId);
    })
    .then((exists) => {
      if (exists) {
        response.send({ userExists: true });
      } else {
        return user.getUserProfile(uniqueUserId);
      }
    })
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
});

module.exports = addUser;
