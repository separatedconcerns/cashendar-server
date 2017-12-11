const user = require('./controllers/userController');
const axios = require('axios');
const google = require('googleapis');
const Promise = require('bluebird');
const _ = require('underscore');
const googleClient = require('./apiClients/googleClient.js');
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
      .then((transactionsByDate) => {
        const dailySpending = transactionsByDate.data;
        return _.map(dailySpending, (acctIdNameStrings, date) => {
          const sum = Math.round(dailySpending[date].sum);
          const transactionsByAcctName = _.filter(acctIdNameStrings, (transactions, acctIdNameString) => {
            acctIdNameString !== 'sum';
          }).map((idNameString) => {
            const acctName = idNameString.split(': ')[1];
            return `${acctName}:\n${dailySpending[date][idNameString].join('\n')}`;
          });
          const spentOrEarned = sum >= 0 ? 'Spent' : 'Earned';
          const color = spentOrEarned === 'Spent' ? '4' : '2';
          const emoji = spentOrEarned === 'Spent' ? `💸` : `👏`;

          const event = {
            summary: `${emoji} ${spentOrEarned} $${Math.abs(sum)} `,
            description: `${transactionsByAcctName.join('\n')}`,
            colorId: color,
            start: {
              date,
              timeZone: 'America/Los_Angeles',
            },
            end: {
              date,
              timeZone: 'America/Los_Angeles',
            },
          };

          return {
            auth,
            calendarId,
            resource: event,
          };
        });
      })
      .then((events) => {
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
