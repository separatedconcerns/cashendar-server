const admin = require('../apiClients/firebaseClient');

const db = ref => admin.database().ref(ref);
const auth = admin.auth();

exports.doesUserExist = uniqueUserId =>
  db(`users/${uniqueUserId}`)
    .once('value')
    .then(snapshot => snapshot);

exports.getUserFromDB = uniqueUserId =>
  db(`users/${uniqueUserId}`)
    .once('value')
    .then(snapshot => snapshot.val());

exports.getUserItems = uniqueUserId =>
  db(`users/${uniqueUserId}/items`)
    .once('value')
    .then(snapshot => snapshot.val());

exports.getUserProfile = uniqueUserId =>
  auth.getUser(uniqueUserId)
    .then(userRecord => userRecord.toJSON());

exports.initializeUser = (uniqueUserId, payload) =>
  db(`users/${uniqueUserId}`)
    .set(payload);

exports.updateUser = (uniqueUserId, newData) =>
  db(`users/${uniqueUserId}`)
    .update(newData);

exports.deleteUserInAuth = uniqueUserId =>
  auth.deleteUser(uniqueUserId);

exports.deleteUserFromDB = uniqueUserId =>
  db(`users/${uniqueUserId}`)
    .remove();

exports.getDatesToScheduleQueueFromDB = uniqueUserId =>
  db(`users/${uniqueUserId}/datesToScheduleQueue`)
    .once('value')
    .then(snapshot => snapshot.val());

exports.updateScheduledEvents = (uniqueUserId, newEvents) =>
  db(`users/${uniqueUserId}/scheduledEvents`)
    .update(newEvents);

exports.updateEventsToDeleteQueue = (uniqueUserId, eventsToDeleteQueue) =>
  db(`users/${uniqueUserId}/eventsToDeleteQueue`)
    .set(eventsToDeleteQueue);

exports.addItemsToUser = (uniqueUserId, itemId, institutionName) =>
  db(`users/${uniqueUserId}/items/${itemId}`)
    .set(institutionName);

exports.updateDatesToScheduleQueue = (uniqueUserId, transactionsToRemove) =>
  db(`users/${uniqueUserId}/datesToScheduleQueue`)
    .set(transactionsToRemove);

exports.clearDatesToScheduleAndEventsToDeleteQueues = uniqueUserId =>
  db(`users/${uniqueUserId}`)
    .update({ datesToScheduleQueue: null, eventsToDeleteQueue: null });

exports.deleteItemFromUserCollection = (uniqueUserId, itemId) =>
  db(`users/${uniqueUserId}/items/${itemId}`)
    .remove();

