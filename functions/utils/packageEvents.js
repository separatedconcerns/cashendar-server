const functions = require('firebase-functions');
const admin = require('../apiClients/firebaseClient.js');

const packageEvents = (auth, calendarId, transactionsByDate) => {
  const dailySpending = transactionsByDate.data;
  // const dailySpendingKeys = Object.keys(transactionsByDate.data);
  // const total = dailySpendingKeys.length;
  const calEvents = [];
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

    calEvents.push(targetCal);
  }

  return calEvents;
};

module.exports = packageEvents;
