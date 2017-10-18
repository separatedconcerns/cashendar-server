const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const getEventsToDeleteArray = require('./utils/getEventsToDeleteArray.js');


const createEventsToDeleteArrayInDb = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const datesToSchedule = request.body.datesToSchedule;
  const uniqueUserId = request.body.uniqueUserId;

  admin.database()
    .ref(`users/${uniqueUserId}/scheduledEvents`)
    .once('value')
    .then((snapshot) => {
      const scheduledEvents = snapshot.val() || [];
      return getEventsToDeleteArray(datesToSchedule, scheduledEvents);
    })
    .then((eventsToDelete) => {
      admin.database()
        .ref(`users/${uniqueUserId}/eventsToDelete`)
        .set(eventsToDelete)
        .then(response.end())
        .catch(e => console.log('Error in createEventsToDeleteArrayInDb', e));
    });
});

module.exports = createEventsToDeleteArrayInDb;

