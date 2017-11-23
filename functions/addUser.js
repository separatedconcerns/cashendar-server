const user = require('./controllers/userController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

function addUser(request, response) {
  const idToken = request.body.idToken;
  const OAuthToken = request.body.OAuthToken;
  let uniqueUserId;

  verifyIdToken(idToken)
    .then((result) => {
      uniqueUserId = result;
      user.doesUserExist(uniqueUserId)
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
      url: `${process.env.HOST}createNewCalendar`,
      payload: { OAuthToken, uniqueUserId },
    };
    axios.post(config.url, config.payload)
      .then((calendar) => {
        const userCalendarDetails = {
          calendarId: calendar.data.id,
          calendarName: calendar.data.summary,
        };
        user.updateUser(uniqueUserId, userCalendarDetails);
        console.log('cal created');
      })
      .then(response.end())
      .catch(error => console.log('Error fetching user data:', error));
  }
}

module.exports = addUser;
