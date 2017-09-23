const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');
const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');
const packageEvents = require('./utils/packageEvents.js');

const addCalendarEvents = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  let calendarId;
  let OAuthToken;

  admin.database()
    .ref(`users/${uniqueUserId}`)
    .once('value').then((snapshot) => {
      calendarId = snapshot.val().calendarId;
      OAuthToken = snapshot.val().OAuthToken;
    })
    .then(() => {
      googleClient.authorize(OAuthToken, createEvents);
    });

  function createEvents(auth) {
    const config = {
      url: `${process.env.HOST}getDailySpendingAndTransactions`,
      payload: { uniqueUserId },
    };
    axios.post(config.url, config.payload)
      .then((transactionsByDate) => { return packageEvents(auth, calendarId, transactionsByDate); })
      .then((events) => {
        console.log(events.length);
        const eventInsert = Promise.promisify(google.calendar('v3').events.insert);
        let i = 0;
        const scheduleEvents = setInterval(() => {
          eventInsert(events[i])
            .then(() => {
              console.log(i);
              if (i >= events.length) {
                clearInterval(scheduleEvents);
                response.end();
              }
              i += 1;
            })
            .catch(e => console.log('line 46', e));
        }, 300);
      })
      .catch(e => console.log('line 49', e));
  }
});
// const eventInsert = Promise.promisify(google.calendar('v3').events.insert);
// eventInsert(targetCal)
//   .catch(e => console.log(`there was an error contacting Google Calendar${e}`));

module.exports = addCalendarEvents;
