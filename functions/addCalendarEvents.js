const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');
const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');
const packageEventsToSchedule = require('./utils/packageEventsToSchedule.js');

const deleteDuplicateEventsFlow = require('./utils/deleteDuplicateEventsFlow.js');

const addCalendarEvents = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  let calendarId;
  let OAuthToken;
  const newEvents = {};
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
      .then((transactionsByDate) => {
        return packageEventsToSchedule(auth, calendarId, transactionsByDate)
      })
      .then((events) => {
        // console.log(events[events.length - 1].resource);
        const insertEvent = Promise.promisify(google.calendar('v3').events.insert);
        let i = 0;
        let eventsToBeScheduled = events.length;
        console.log(`${eventsToBeScheduled} new events to be scheduled`);
        const scheduleEvents = setInterval(() => {
          if (i <= events.length - 1) {
            insertEvent(events[i])
              .then((event) => { newEvents[event.start.date] = event.id; })
              .catch((e) => {
                eventsToBeScheduled -= 1;
                console.log(`Error on event: ${events[i].date} ----> ${e}`);
              });
            i += 1;
            console.log(i);
          } else {
            console.log(`${eventsToBeScheduled} of ${events.length} events have been scheduled`);
            setTimeout(() => {
              deleteDuplicateEventsFlow(uniqueUserId, newEvents);
              clearInterval(scheduleEvents);
            }, 200);
          }
        }, 300);
      })
      .catch(e => console.log('line 49', e));
  };
});


module.exports = addCalendarEvents;
