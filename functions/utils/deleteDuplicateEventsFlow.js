const axios = require('axios');
const admin = require('../apiClients/firebaseClient.js');
const Promise = require('bluebird');
const updateScheduledEvents = require('./updateScheduledEvents.js');

const deleteDuplicateEventsFlow = (uniqueUserId, newEvents) => {
  let newEventsArr = Object.keys(newEvents);

  if (newEventsArr.length < 1) {
    admin.database().ref(`users/${uniqueUserId}/datesToSchedule`)
      .once('value')
      .then((snapshot) => {
        newEventsArr = snapshot.val()
        newEventsArr.forEach((date) => {
          newEvents[date] = null;
        });
      });
  }
  
  setTimeout(() => {
    const config = {
      url: `${process.env.HOST}createEventsToDeleteArrayInDb`,
      payload: {
        newEventDates: newEventsArr,
        uniqueUserId,
      },
    };
    console.log('deleteDuplicateEventsFlow newEventDates:', config.payload.newEventDates);
    axios.post(config.url, config.payload)
      .catch(e => console.log('Events to delete array not created!:', e))
      .then((calId_eventsToDelete_OAuthToken) => {
        return {
          url: `${process.env.HOST}deleteDuplicateEventsInCalendar`,
          payload: calId_eventsToDelete_OAuthToken.data,
        };
      })
      .then((config2) => {
        axios.post(config2.url, config2.payload)
          .then(() => {
            const updateScheduledEventsProm = Promise.promisify(updateScheduledEvents);
            updateScheduledEventsProm(uniqueUserId, newEvents)
              .catch(e => console.log('deleteDuplicateEventsFlow ERROR:', e));
          });
      });
  }, 100);
};

module.exports = deleteDuplicateEventsFlow;
