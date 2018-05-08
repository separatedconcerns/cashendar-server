import { post } from 'axios';
import { calendar } from 'googleapis';
import { promisify, all } from 'bluebird';
import { map, reduce } from 'underscore';
import { getUserFromDB } from './controllers/userController';
import { authorize } from './apiClients/googleClient';
import * as deleteDuplicateEventsFlow from '../utils/deleteDuplicateEventsFlow';
import { HOST } from './creds.json';

function groupTransactionsByAccountName(acctIdsAndNames, dailySpending, date) {
  return reduce(acctIdsAndNames, (arr, transaction, acctIdAndName) => {
    if (acctIdAndName !== 'sum') {
      const acctName = acctIdAndName.split(': ')[1];
      arr.push(`${acctName}: \n${dailySpending[date][acctIdAndName].join('\n')}`);
    }
    return arr;
  }, []);
}

function makeEvent(acctIdsAndNames, dailySpending, date) {
  const sum = Math.round(dailySpending[date].sum);
  const transactionsByAcctName = groupTransactionsByAccountName(acctIdsAndNames, dailySpending, date);
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
  return event;
}

async function makeEvents(auth, uniqueUserId, calendarId) {
  const config = {
    url: `${HOST}getDailySpendingAndTransactions`,
    payload: { uniqueUserId },
  };
  const transactionsByDate = await post(config.url, config.payload);
  const dailySpending = transactionsByDate.data;
  const events = map(dailySpending, (acctIdsAndNames, date) => ({
    auth,
    calendarId,
    resource: makeEvent(acctIdsAndNames, dailySpending, date),
  }));
  return events;
}

async function scheduleEvents(events) {
  const newEvents = {};
  const insertEvent = promisify(calendar('v3').events.insert);
  const allEvents = events.map(async (event) => {
    try {
      const newEvent = await insertEvent(event);
      newEvents[newEvent.start.date] = newEvent.id;
    } catch (error) {
      console.log('insertEvent Error:', error);
    }
  });
  await all(allEvents);
}

export default async function addCalendarEvents(request, response) {
  const uniqueUserId = request.body.uniqueUserId;
  const userData = await getUserFromDB(uniqueUserId);
  const calendarId = userData.calendarId;
  const OAuthToken = userData.OAuthToken;
  const googleClientAuthorize = promisify(authorize);
  async function createEvents(auth) {
    const events = await makeEvents(auth, uniqueUserId, calendarId);
    const eventsToBeScheduled = events.length;
    console.log(`${eventsToBeScheduled} new events to be scheduled`);
    const newEvents = await scheduleEvents(events);
    await deleteDuplicateEventsFlow(uniqueUserId, newEvents);
  }
  await googleClientAuthorize(OAuthToken, createEvents)
    .catch(e => console.log('line 24 inside addCalendarEvents', e));
  response.end();
}
