const user = require('./controllers/userController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

let idToken;
let OAuthToken;
let uniqueUserId;

function addUser(request, response) {
  idToken = request.body.idToken;
  OAuthToken = request.body.OAuthToken;

  verifyIdToken(idToken)
    .then((result) => {
      uniqueUserId = result;
      user.doesUserExist(uniqueUserId)
        .then((snapshot) => {
          if (snapshot.exists()) {
            console.log(21);
            // end response if user already exists
            response.send({ items: snapshot.val().items });
          } else {
            addUserToDB(response); // eslint-disable-line
          }
        });
    });
}

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
