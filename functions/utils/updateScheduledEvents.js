const admin = require('../apiClients/firebaseClient.js');

const updateScheduledEvents = (uniqueUserId, newEvents) => {
  admin.database()
    .ref(`users/${uniqueUserId}/scheduledEvents`)
    .update(newEvents)
    .then({ newEvents });
};

module.exports = updateScheduledEvents;
