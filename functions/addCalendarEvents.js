const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');
const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');

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
      url: 'http://localhost:5000/testproject-6177f/us-central1/getDailySpendingAndTransactions',
      payload: { uniqueUserId },
    };
    axios.post(config.url, config.payload)
      .then((transactionsByDate) => {
        console.log('line 32', Object.keys(transactionsByDate.data).length);
        let total = Object.keys(transactionsByDate.data).length;
        let counter = 0;
        const dailySpending = transactionsByDate.data;
        // eslint-disable-next-line
        for (const date in dailySpending) {
          const sum = Math.round(dailySpending[date].sum);
          const list = dailySpending[date].list.join('\n');
          const event = {
            summary: `Spent $${sum}`,
            location: 'See description for transaction details!',
            description: `Transactions:\n${list}`,
            start: {
              date,
              timeZone: 'America/Los_Angeles',
            },
            end: {
              date,
              timeZone: 'America/Los_Angeles',
            },
          };

          const targetCal = {
            auth,
            calendarId,
            resource: event,
          };

          setTimeout(() => { // eslint-disable-line
            console.log('setTimeout called!');
            const eventInsert = Promise.promisify(google.calendar('v3').events.insert);
            eventInsert(targetCal)
            .then(() => { // eslint-disable-line
                counter += 1;
                console.log(counter);
                if (counter >= total) {
                  response.end();
                }
              })
              .catch(e => console.log(`there was an error contacting Google Calendar${e}`));
          }, 200);
        }
      })
      .catch(e => console.log(e));
  }
});

module.exports = addCalendarEvents;
