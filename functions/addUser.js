const user = require('./controllers/userController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

function addUser(request, response) {
  let uniqueUserId;
  const idToken = request.body.idToken;
  const OAuthToken = request.body.OAuthToken;

  verifyIdToken(idToken)
    .then((result) => {
      uniqueUserId = result;
      return user.doesUserExist(uniqueUserId)
        .then((snapshot) => {
          if (snapshot.exists()) {
            console.log('user exists');
            response.send({ items: snapshot.val().items });
          } else {
            addUserToDB(); // eslint-disable-line
          }
        });
    });

  function addUserToDB() {
    console.log('addUserToDB called');
    return user.getUserProfile(uniqueUserId)
      .then((userProfile) => {
        const userData = {
          email: userProfile.email,
          name: userProfile.displayName,
          OAuthToken,
        };
        return Promise.all([user.initializeUser(uniqueUserId, userData), createGoogleCalendar()]);
      })
      .catch(error => console.log(error));
  }

  function createGoogleCalendar() {
    const config = {
      url: `${process.env.HOST}createNewCalendar`,
      payload: { OAuthToken, uniqueUserId },
    };
    return axios.post(config.url, config.payload)
      .then((calendar) => {
        const userCalendarDetails = { calendarId: calendar.data.id, calendarName: calendar.data.summary };
        return user.updateUser(uniqueUserId, userCalendarDetails);
      })
      .then(response.end())
      .catch(error => console.log('Error fetching user data:', error));
  }
}

module.exports = addUser;
