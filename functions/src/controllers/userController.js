import * as admin from '../apiClients/firebaseClient';

const auth = admin.auth();
const db = admin.firestore();
const FieldValue = db.FieldValue;
const userCollection = db.collection('users');
const aUsersDocs = uniqueUserId => userCollection.doc(`${uniqueUserId}`);

export async function getUserProfile(uniqueUserId) {
  let userRecord;
  let userProfile;
  try {
    userRecord = await auth.getUser(uniqueUserId);
    userProfile = userRecord.toJSON();
  } catch (error) {
    console.log(error);
  }
  return userProfile;
}

export async function verifyIdToken(idToken) {
  let decodedToken;
  let uniqueUserId;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
    uniqueUserId = decodedToken.uid;
  } catch (error) {
    console.log(error);
  }
  return uniqueUserId;
}

export async function deleteUserInAuth(uniqueUserId) {
  let fs;
  try {
    fs = await auth.deleteUser(uniqueUserId);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function doesUserExist(uniqueUserId) {
  let fs;
  try {
    fs = await aUsersDocs(uniqueUserId).get();
  } catch (error) {
    console.log(error);
  }
  return fs.exists;
}

export async function getUserFromDB(uniqueUserId) {
  let fs;
  let user;
  try {
    fs = await aUsersDocs(uniqueUserId).get();
    user = fs.data();
  } catch (error) {
    console.log(error);
  }
  return user;
}

export async function getUserItems(uniqueUserId) {
  const items = {};
  try {
    const snapshot = await aUsersDocs(uniqueUserId).collection('items').get();
    snapshot.forEach((doc) => {
      items[doc.id] = doc.data();
    });
  } catch (error) {
    console.log(error);
  }
  return items;
}


export async function initializeUser(uniqueUserId, payload) {
  let fs;
  try {
    fs = await aUsersDocs(uniqueUserId).set(payload);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function updateUser(uniqueUserId, newData) {
  let fs;
  try {
    fs = await aUsersDocs(uniqueUserId).update(newData);
  } catch (error) {
    console.log(error);
  }
  return fs;
}


export async function deleteUserFromDB(uniqueUserId) {
  let fs;
  try {
    fs = await aUsersDocs(uniqueUserId).delete();
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function getDatesToScheduleQueueFromDB(uniqueUserId) {
  let fs;
  let dates;
  try {
    fs = await aUsersDocs(uniqueUserId).get();
    dates = fs.data().datesToScheduleQueue;
  } catch (error) {
    console.log(error);
  }
  return dates;
}

export async function updateScheduledEvents(uniqueUserId, newEvents) {
  let fs;
  try {
    const payload = { scheduledEvents: newEvents };
    fs = await aUsersDocs(uniqueUserId).update(payload);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function updateEventsToDeleteQueue(uniqueUserId, eventsToDeleteQueue) {
  let fs;
  try {
    const payload = { eventsToDeleteQueue };
    fs = await aUsersDocs(uniqueUserId).set(payload);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function addItemsToUser(uniqueUserId, itemId, institutionName) {
  let fs;
  try {
    fs = await aUsersDocs(uniqueUserId).collection('items').doc(`${itemId}`)
      .set(institutionName);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function updateDatesToScheduleQueue(uniqueUserId, transactionDates) {
  let fs;
  try {
    const payload = { datesToScheduleQueue: transactionDates };
    fs = await aUsersDocs(uniqueUserId).update(payload);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function clearDatesToScheduleAndEventsToDeleteQueues(uniqueUserId) {
  let fs;
  try {
    const payload = { datesToScheduleQueue: FieldValue.delete(), eventsToDeleteQueue: FieldValue.delete() };
    fs = await aUsersDocs(uniqueUserId).update(payload);
  } catch (error) {
    console.log(error);
  }
  return fs;
}

export async function deleteItemFromUserCollection(uniqueUserId, itemId) {
  let fs;
  try {
    fs = await aUsersDocs(uniqueUserId).collection('items').doc(`${itemId}`)
      .delete();
  } catch (error) {
    console.log(error);
  }
  return fs;
}
