const user = require('./controllers/userController');
const axios = require('axios');
const creds = require('./creds.json');

function addUser(request, response) {
  const idToken = request.body.idToken;
  const OAuthToken = request.body.OAuthToken;
  let uniqueUserId;

  user.verifyIdToken(idToken)
    .then((result) => {
      uniqueUserId = result;
      return user.doesUserExist(uniqueUserId);
    })
    .then((snapshot) => {
      if (snapshot.exists()) {
        response.send({ items: snapshot.val().items });
      } else {
        addUserToDB(); // eslint-disable-line
      }
    });

  function addUserToDB() {
    user.getUserProfile(uniqueUserId)
      .then((userProfile) => {
        const payload = {
          email: userProfile.email,
          name: userProfile.displayName,
          OAuthToken,
        };
        user.initializeUser(uniqueUserId, payload);
      })
      .then(() => createGoogleCalendar()); // eslint-disable-line
  }

  function createGoogleCalendar() {
    const config = {
      url: `${creds.HOST}createNewCalendar`,
      payload: { OAuthToken, uniqueUserId },
    };
    axios.post(config.url, config.payload)
      .then((calendar) => {
        const userCalendarDetails = {
          calendarId: calendar.data.id,
          calendarName: calendar.data.summary,
        };
        user.updateUser(uniqueUserId, userCalendarDetails);
      })
      .then(response.end())
      .catch(error => console.log('Error fetching user data:', error));
  }
}

module.exports = addUser;
