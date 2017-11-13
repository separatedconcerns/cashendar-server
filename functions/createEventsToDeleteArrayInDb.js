const functions = require('firebase-functions');
const user = require('./controllers/userController');
const getEventsToDeleteArray = require('./utils/getEventsToDeleteArray.js');

const createEventsToDeleteArrayInDb = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const newEventDates = request.body.newEventDates;
  const uniqueUserId = request.body.uniqueUserId;
  let calendarId;
  let OAuthToken;

  user.getUserFromDB(uniqueUserId)
    .then((userData) => {
      calendarId = userData.calendarId;
      OAuthToken = userData.OAuthToken;
      const scheduledEvents = userData.scheduledEvents || [];
      return getEventsToDeleteArray(newEventDates, scheduledEvents);
    })
    .then((eventsToDelete) => {
      const responseObj = {
        eventsToDelete,
        calendarId,
        OAuthToken,
      };
      user.updateEventsToDelete(uniqueUserId, eventsToDelete)
        .then(response.json(responseObj))
        .catch(e => console.log('Error in createEventsToDeleteArrayInDb', e));
    });
});

module.exports = createEventsToDeleteArrayInDb;

