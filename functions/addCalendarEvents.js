const user = require('./controllers/userController');
const axios = require('axios');
const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');
const packageEventsToSchedule = require('./utils/packageEventsToSchedule.js');
const deleteDuplicateEventsFlow = require('./utils/deleteDuplicateEventsFlow.js');
const creds = require('./creds.json');

function addCalendarEvents(request, response) {
  const uniqueUserId = request.body.uniqueUserId;
  let calendarId;
  let OAuthToken;
  const newEvents = {};
  user.getUserFromDB(uniqueUserId)
    .then((userData) => {
      calendarId = userData.calendarId;
      OAuthToken = userData.OAuthToken;
      // })
      // .then(() => {
      // googleClient.authorize(OAuthToken, createEvents);
      const googleClientAuthorize = Promise.promisify(googleClient.authorize);
      googleClientAuthorize(OAuthToken, createEvents)
        .then(response.end())
        .catch(e => console.log('line 24 inside addCalendarEvents', e));
    });

  const createEvents = (auth) => {
    const config = {
      url: `${creds.HOST}getDailySpendingAndTransactions`,
      payload: { uniqueUserId },
    };
    axios.post(config.url, config.payload)
      .then(transactionsByDate => packageEventsToSchedule(auth, calendarId, transactionsByDate))
      .then((events) => {
        // console.log(events[events.length - 1].resource);
        const insertEvent = Promise.promisify(google.calendar('v3').events.insert);
        const eventsToBeScheduled = events.length;
        console.log(`${eventsToBeScheduled} new events to be scheduled`);
        const scheduleEventsPromises = events.map(event => insertEvent(event)
          .then(newEvent => newEvents[newEvent.start.date] = newEvent.id)
          .catch(e => console.log('insertEvent Error:', e)));
        return Promise.all(scheduleEventsPromises);
      })
      .then(() => deleteDuplicateEventsFlow(uniqueUserId, newEvents))
      .catch(e => console.log('line 49', e));
  };
}

module.exports = addCalendarEvents;
