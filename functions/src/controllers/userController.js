import * as admin from '../apiClients/firebaseClient';

const db = ref => admin.database().ref(ref);
const auth = admin.auth();

export function doesUserExist(uniqueUserId) {
  return db(`users/${uniqueUserId}`).once('value')
    .then(snapshot => snapshot)
    .catch(err => console.log(err));
}

export function getUserFromDB(uniqueUserId) {
  return db(`users/${uniqueUserId}`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));
}

export function getUserItems(uniqueUserId) {
  return db(`users/${uniqueUserId}/items`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));
}

export function getUserProfile(uniqueUserId) {
  return auth.getUser(uniqueUserId)
    .then(userRecord => userRecord.toJSON())
    .catch(err => console.log(err));
}

export function verifyIdToken(idToken) {
  return auth.verifyIdToken(idToken)
    .then(decodedToken => decodedToken.uid)
    .catch(error => console.log(error));
}

export function initializeUser(uniqueUserId, payload) {
  return db(`users/${uniqueUserId}`)
    .set(payload)
    .catch(err => console.log(err));
}

export function updateUser(uniqueUserId, newData) {
  return db(`users/${uniqueUserId}`)
    .update(newData)
    .catch(err => console.log(err));
}

export function deleteUserInAuth(uniqueUserId) {
  return auth.deleteUser(uniqueUserId)
    .catch(err => console.log(err));
}

export function deleteUserFromDB(uniqueUserId) {
  return db(`users/${uniqueUserId}`)
    .remove()
    .catch(err => console.log(err));
}

export function getDatesToScheduleQueueFromDB(uniqueUserId) {
  return db(`users/${uniqueUserId}/datesToScheduleQueue`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => console.log(err));
}

export function updateScheduledEvents(uniqueUserId, newEvents) {
  return db(`users/${uniqueUserId}/scheduledEvents`)
    .update(newEvents)
    .catch(err => console.log(err));
}

export function updateEventsToDeleteQueue(uniqueUserId, eventsToDeleteQueue) {
  return db(`users/${uniqueUserId}/eventsToDeleteQueue`)
    .set(eventsToDeleteQueue)
    .catch(err => console.log(err));
}

export function addItemsToUser(uniqueUserId, itemId, institutionName) {
  return db(`users/${uniqueUserId}/items/${itemId}`)
    .set(institutionName)
    .catch(err => console.log(err));
}

export function updateDatesToScheduleQueue(uniqueUserId, transactionDates) {
  return db(`users/${uniqueUserId}/datesToScheduleQueue`)
    .set(transactionDates)
    .catch(err => console.log(err));
}

export function clearDatesToScheduleAndEventsToDeleteQueues(uniqueUserId) {
  return db(`users/${uniqueUserId}`)
    .update({ datesToScheduleQueue: null, eventsToDeleteQueue: null })
    .catch(err => console.log(err));
}

export function deleteItemFromUserCollection(uniqueUserId, itemId) {
  return db(`users/${uniqueUserId}/items/${itemId}`)
    .remove()
    .catch(err => console.log(err));
}
