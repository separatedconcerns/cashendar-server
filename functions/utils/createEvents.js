/* eslint-disable */
const axios = require('axios');
const google = require('googleapis');
const Promise = require('bluebird');

let createEvents = (auth, calendarId, uniqueUserId) => {
    const config = {
      url: 'http://localhost:5000/testproject-6177f/us-central1/getDailySpendingAndTransactions',
      payload: { uniqueUserId },
    };
    axios.post(config.url, config.payload)
    .then(transactionsByDate => {
      const dailySpending = transactionsByDate.data;
      for (let date in dailySpending) {
        const sum = Math.round(dailySpending[date].sum);
        const list = dailySpending[date].list.join('\n');
        const event = {
          summary: `Spent $${sum}`,
          location: 'See description for transaction details!',
          description: `Transactions: \n\  ${list}`,
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
        const eventInsert = Promise.promisify(google.calendar('v3').events.insert);
        eventInsert(targetCal)
        .catch(e => response.end(`there was an error contacting Google Calendar${e}`));
      }
    }).then(console.log('39, done'))
    .catch(e => console.log('40', e));
  }

  module.exports = createEvents;