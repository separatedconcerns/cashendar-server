const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');

// eslint-disable-next-line
const addUser = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const idToken = request.body.idToken;
  const OAuthToken = request.body.OAuthToken;

  // verifies firebase idToken
  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      const uniqueUserId = decodedToken.uid;
      const ref = admin.database().ref(`users/${uniqueUserId}`);

      // searches for uniqueUserId in db
      // if user exists response is ended
      // otherwise a new user is created in db,
      // a new calendar is created,
      // calendarId is saved in db
      ref.once('value')
        .then((snapshot) => {
          if (snapshot.exists()) { response.send({ userExists: true }); } else {
            admin.auth().getUser(uniqueUserId)
              .then((userRecord) => {
                const user = userRecord.toJSON();
                const payload = {
                  email: user.email,
                  name: user.displayName,
                  OAuthToken,
                };
                admin.database().ref(`users/${uniqueUserId}`).set(payload)
                  .then(() => {
                    const config = {
                      url: 'http://localhost:5000/testproject-6177f/us-central1/createNewCalendar',
                      payload: { OAuthToken },
                    };
                    axios.post(config.url, config.payload)
                      .then((calendar) => {
                        const calId = calendar.data.id;
                        const calName = calendar.data.summary;
                        admin.database().ref(`users/${uniqueUserId}`).update({ calendarId: calId, calendarName: calName });
                      });
                  });
              }).then(response.end(''))
              .catch(error => console.log('Error fetching user data:', error));
          }
        });
    });
});

module.exports = addUser;
