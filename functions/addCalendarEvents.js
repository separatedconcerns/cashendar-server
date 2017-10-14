const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');
const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');
const packageEvents = require('./utils/packageEvents.js');
const deleteDuplicateEventsFlow = require('./utils/deleteDuplicateEventsFlow');

const addCalendarEvents = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  let calendarId;
  let OAuthToken;

  admin.database()
    .ref(`users/${uniqueUserId}`)
    .once('value')
    .then((snapshot) => {
      const vals = snapshot.val(); 
      calendarId = vals.calendarId;
      OAuthToken = vals.OAuthToken;
    })
    .then(() => {
      // googleClient.authorize(OAuthToken, createEvents); 
      const googleClientAuthorize = Promise.promisify(googleClient.authorize);
      googleClientAuthorize(OAuthToken, createEvents)
        .then(response.end())
        .catch(e => console.log('line 24 inside addCalendarEvents', e));
    });

  const createEvents = (auth) => {
    const config = {
      url: `${process.env.HOST}getDailySpendingAndTransactions`,
      payload: { uniqueUserId },
    };
    axios.post(config.url, config.payload)
      .then(transactionsByDate => packageEvents(auth, calendarId, transactionsByDate))
      .then((events) => {
        // console.log(events[events.length - 1].resource);
        const eventInsert = Promise.promisify(google.calendar('v3').events.insert);
        let i = 0;
        let eventsToBeScheduled = events.length;
        console.log(eventsToBeScheduled, ' events to be scheduled');
        const scheduleEvents = setInterval(() => {
          if (i <= events.length - 1) {
            console.log(i);
            eventInsert(events[i])
              .catch((e) => {
                eventsToBeScheduled -= 1;
                console.log(`Error on event: ${events[i]} ----> ${e}`);
              });
            i += 1;
          } else {
            console.log(`${eventsToBeScheduled} of ${events.length} events have been scheduled`);
            deleteDuplicateEventsFlow(uniqueUserId);
            clearInterval(scheduleEvents);
          }
        }, 300);
      })
      .catch(e => console.log('line 49', e));
  };
});


module.exports = addCalendarEvents;
