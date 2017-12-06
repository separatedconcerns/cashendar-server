
const packageEvents = (auth, calendarId, transactionsByDateAndAccount) => {
  const dailySpending = transactionsByDateAndAccount.data;
  const calEvents = [];
  // eslint-disable-next-line
  for (const date in dailySpending) {
    const sum = Math.round(dailySpending[date].sum);
    const acctIdNameStrings = Object.keys(dailySpending[date]).filter(name => name !== 'sum');
    const transactionsByAcctName = acctIdNameStrings.map((idNameString) => {
      const acctName = idNameString.split(': ')[1];
      return `${acctName}:\n${dailySpending[date][acctName].join('\n')}`;
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
