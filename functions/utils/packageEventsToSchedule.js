
const packageEvents = (auth, calendarId, transactionsByDate) => {
  const dailySpending = transactionsByDate.data;
  const calEvents = [];
  // eslint-disable-next-line
  for (const date in dailySpending) {
    const sum = Math.round(dailySpending[date].sum);
    const list = dailySpending[date].list.join('\n');
    const spentOrEarned = sum >= 0 ? 'Spent' : 'Earned';
    const color = spentOrEarned === 'Spent' ? '4' : '2';
    const emoji = spentOrEarned === 'Spent' ? `💸` : `👏`;

    const event = {
      summary: `${emoji} ${spentOrEarned} $${Math.abs(sum)} `,
      description: `Transactions:\n${list}`,
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
