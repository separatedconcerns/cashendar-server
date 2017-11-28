const admin = require('../apiClients/firebaseClient');

const db = ref => admin.database().ref(ref);
const auth = admin.auth();

exports.doesUserExist = uniqueUserId =>
  db(`users/${uniqueUserId}`).once('value')
    .then(snapshot => snapshot)
    .catch(err => console.log(err));

exports.getUserFromDB = uniqueUserId =>
  db(`users/${uniqueUserId}`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));

exports.getUserItems = uniqueUserId =>
  db(`users/${uniqueUserId}/items`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));

exports.getUserProfile = uniqueUserId =>
  auth.getUser(uniqueUserId)
    .then(userRecord => userRecord.toJSON())
    .catch(err => console.log(err));

exports.verifyIdToken = idToken =>
  auth.verifyIdToken(idToken)
    .then(decodedToken => decodedToken.uid)
    .catch(error => console.log(error));

exports.initializeUser = (uniqueUserId, payload) =>
  db(`users/${uniqueUserId}`)
    .set(payload)
    .catch(err => console.log(err));

exports.updateUser = (uniqueUserId, newData) =>
  db(`users/${uniqueUserId}`)
    .update(newData)
    .catch(err => console.log(err));

exports.deleteUserInAuth = uniqueUserId =>
  auth.deleteUser(uniqueUserId)
    .catch(err => console.log(err));

exports.deleteUserFromDB = uniqueUserId =>
  db(`users/${uniqueUserId}`)
    .remove()
    .catch(err => console.log(err));

exports.getDatesToScheduleQueueFromDB = uniqueUserId =>
  db(`users/${uniqueUserId}/datesToScheduleQueue`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));

exports.updateScheduledEvents = (uniqueUserId, newEvents) =>
  db(`users/${uniqueUserId}/scheduledEvents`)
    .update(newEvents)
    .catch(err => console.log(err));

exports.updateEventsToDeleteQueue = (uniqueUserId, eventsToDeleteQueue) =>
  db(`users/${uniqueUserId}/eventsToDeleteQueue`)
    .set(eventsToDeleteQueue)
    .catch(err => console.log(err));

exports.addItemsToUser = (uniqueUserId, itemId, institutionName) =>
  db(`users/${uniqueUserId}/items/${itemId}`)
    .set(institutionName)
    .catch(err => console.log(err));

exports.updateDatesToScheduleQueue = (uniqueUserId, transactionDates) =>
  db(`users/${uniqueUserId}/datesToScheduleQueue`)
    .set(transactionDates)
    .catch(err => console.log(err));

exports.clearDatesToScheduleAndEventsToDeleteQueues = uniqueUserId =>
  db(`users/${uniqueUserId}`)
    .update({ datesToScheduleQueue: null, eventsToDeleteQueue: null })
    .catch(err => console.log(err));

exports.deleteItemFromUserCollection = (uniqueUserId, itemId) =>
  db(`users/${uniqueUserId}/items/${itemId}`)
    .remove()
    .catch(err => console.log(err));
