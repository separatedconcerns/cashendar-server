
const packageEvents = (auth, calendarId, transactionsByDateAndAccount) => {
  const dailySpending = transactionsByDateAndAccount.data;
  const calEvents = [];
  // eslint-disable-next-line
  for (const date in dailySpending) {
    const sum = Math.round(dailySpending[date].sum);
    const acctNames = Object.keys(dailySpending[date]);
    const transactionsByAcctName = acctNames.filter(name => name !== 'sum')
      .map(name => `${name}:\n${dailySpending[date][name].join('\n')}`);
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
