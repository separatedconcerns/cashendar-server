import * as functions from 'firebase-functions';
import addUserFn from './addUser';
import createNewCalendarFn from './createNewCalendar';
import exchangePublicTokenFn from './exchangePublicToken';
import plaidWebHookFn from './plaidWebHook';
import getTransactionsFromPlaidFn from './getTransactionsFromPlaid';
import getDailySpendingAndTransactionsFn from './getDailySpendingAndTransactions';
import getTransactionsFromDatabaseFn from './getTransactionsFromDatabase';
import deleteUserProfileFn from './deleteUserProfile';
import deleteItemFn from './deleteItem';
import createEventsToDeleteQueueInDbFn from './createEventsToDeleteQueueInDb';
import deleteDuplicateEventsInCalendarFn from './deleteDuplicateEventsInCalendar';
import removeTransactionsFromDbFn from './removeTransactionsFromDb';
import removeAllTransactionsInAnItemFn from './devFunctions/removeAllTransactionsInAnItem';
import addCalendarEventsFn from './addCalendarEvents';

const cors = require('cors')({ origin: true, Connection: 'keep-alive' });

const wrap = fn => functions.https.onRequest((request, response) => {
  console.log(`${fn.name} triggered`);
  cors(request, response, () => fn(request, response));
});

export const addUser = wrap(addUserFn);
export const exchangePublicToken = wrap(exchangePublicTokenFn);
export const createNewCalendar = wrap(createNewCalendarFn);
export const plaidWebHook = wrap(plaidWebHookFn);
export const getTransactionsFromPlaid = wrap(getTransactionsFromPlaidFn);
export const getDailySpendingAndTransactions = wrap(getDailySpendingAndTransactionsFn);
export const getTransactionsFromDatabase = wrap(getTransactionsFromDatabaseFn);
export const deleteUserProfile = wrap(deleteUserProfileFn);
export const deleteItem = wrap(deleteItemFn);
export const createEventsToDeleteQueueInDb = wrap(createEventsToDeleteQueueInDbFn);
export const deleteDuplicateEventsInCalendar = wrap(deleteDuplicateEventsInCalendarFn);
export const removeTransactionsFromDb = wrap(removeTransactionsFromDbFn);
export const removeAllTransactionsInAnItem = wrap(removeAllTransactionsInAnItemFn);
export const addCalendarEvents = wrap(addCalendarEventsFn);
