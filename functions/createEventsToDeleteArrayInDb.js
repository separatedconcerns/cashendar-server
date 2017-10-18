const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const getEventsToDeleteArray = require('./utils/getEventsToDeleteArray.js');


const createEventsToDeleteArrayInDb = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const newEventDates = request.body.newEventDates;
  const uniqueUserId = request.body.uniqueUserId;
  let calendarId;
  let OAuthToken;

  admin.database()
    .ref(`users/${uniqueUserId}`)
    .once('value')
    .then((snapshot) => {
      calendarId = snapshot.val().calendarId;
      OAuthToken = snapshot.val().OAuthToken;
      const scheduledEvents = snapshot.val().scheduledEvents || [];
      return getEventsToDeleteArray(newEventDates, scheduledEvents);
    })
    .then((eventsToDelete) => {
      const responseObj = {
        eventsToDelete,
        calendarId,
        OAuthToken,
      };
      admin.database()
        .ref(`users/${uniqueUserId}/eventsToDelete`)
        .set(eventsToDelete)
        .then(response.json(responseObj))
        .catch(e => console.log('Error in createEventsToDeleteArrayInDb', e));
    });
});

module.exports = createEventsToDeleteArrayInDb;

