const functions = require('firebase-functions');
const user = require('./controllers/userController');
const getEventsToDeleteQueue = require('./utils/getEventsToDeleteQueue.js');

const createEventsToDeleteQueueInDb = functions.https.onRequest((request, response) => {
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
      return getEventsToDeleteQueue(newEventDates, scheduledEvents);
    })
    .then((eventsToDeleteQueue) => {
      const responseObj = {
        eventsToDeleteQueue,
        calendarId,
        OAuthToken,
      };
      user.updateEventsToDeleteQueue(uniqueUserId, eventsToDeleteQueue)
        .then(response.json(responseObj))
        .catch(e => console.log('Error in createEventsToDeleteQueueInDb', e));
    });
});

module.exports = createEventsToDeleteQueueInDb;

