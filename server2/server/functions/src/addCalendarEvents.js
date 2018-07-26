import { post } from 'axios';
import { calendar } from 'googleapis';
import { promisify, all } from 'bluebird';
import { map, reduce } from 'underscore';
import { getUserFromDB } from './controllers/userController';
import { authorize } from './apiClients/googleClient';
import * as deleteDuplicateEventsFlow from '../utils/deleteDuplicateEventsFlow';
import { HOST } from './creds.json';

function addCalendarEvents(request, response) {
  const uniqueUserId = request.body.uniqueUserId;
  let calendarId;
  let OAuthToken;
  const newEvents = {};
  getUserFromDB(uniqueUserId)
    .then((userData) => {
      calendarId = userData.calendarId;
      OAuthToken = userData.OAuthToken;
      const googleClientAuthorize = promisify(authorize);
      const createEvents = (auth) => {
        const config = {
          url: `${HOST}getDailySpendingAndTransactions`,
          payload: { uniqueUserId },
        };
        post(config.url, config.payload)
          .then((transactionsByDate) => {
            const dailySpending = transactionsByDate.data;
            return map(dailySpending, (acctIdsAndNames, date) => {
              const sum = Math.round(dailySpending[date].sum);
              const transactionsByAcctName = reduce(acctIdsAndNames, (arr, transaction, acctIdAndName) => {
                if (acctIdAndName !== 'sum') {
                  const acctName = acctIdAndName.split(': ')[1];
                  arr.push(`${acctName}: \n${dailySpending[date][acctIdAndName].join('\n')}`);
                }
                return arr;
              }, []);

              const spentOrEarned = sum >= 0 ? 'Spent' : 'Earned';
              const color = spentOrEarned === 'Spent' ? '4' : '2';
              const emoji = spentOrEarned === 'Spent' ? '💸' : '👏';

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
            const insertEvent = promisify(calendar('v3').events.insert);
            const eventsToBeScheduled = events.length;
            console.log(`${eventsToBeScheduled} new events to be scheduled`);
            const scheduleEventsPromises = events.map(event => insertEvent(event)
              .then(newEvent => newEvents[newEvent.start.date] = newEvent.id)
              .catch(e => console.log('insertEvent Error:', e)));
            return all(scheduleEventsPromises);
          })
          .then(() => deleteDuplicateEventsFlow(uniqueUserId, newEvents))
          .catch(e => console.log('line 49', e));
      };
      googleClientAuthorize(OAuthToken, createEvents)
        .then(response.end())
        .catch(e => console.log('line 24 inside addCalendarEvents', e));
    });
}

export default addCalendarEvents;
