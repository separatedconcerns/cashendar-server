const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');


const wrap = fn => functions.https.onRequest((request, response) => {
  console.log(`${fn.name} triggered`);
  cors(request, response, () => fn(request, response));
});

exports.addUser = wrap(require('./addUser.js'));
exports.createNewCalendar = wrap(require('./createNewCalendar.js'));
exports.exchangePublicToken = wrap(require('./exchangePublicToken.js'));
exports.plaidWebHook = wrap(require('./plaidWebHook.js'));
exports.getTransactionsFromPlaid = wrap(require('./getTransactionsFromPlaid'));
exports.addCalendarEvents = wrap(require('./addCalendarEvents.js'));
exports.getDailySpendingAndTransactions = wrap(require('./getDailySpendingAndTransactions.js'));
exports.getTransactionsFromDatabase = wrap(require('./getTransactionsFromDatabase'));
exports.deleteUserProfile = wrap(require('./deleteUserProfile.js'));
exports.deleteItem = wrap(require('./deleteItem.js'));
exports.createEventsToDeleteQueueInDb = wrap(require('./createEventsToDeleteQueueInDb.js'));
exports.deleteDuplicateEventsInCalendar = wrap(require('./deleteDuplicateEventsInCalendar.js'));
exports.removeTransactionsFromDb = wrap(require('./removeTransactionsFromDb.js'));
exports.removeAllTransactionsInAnItem = wrap(require('./devFunctions/removeAllTransactionsInAnItem.js'));
