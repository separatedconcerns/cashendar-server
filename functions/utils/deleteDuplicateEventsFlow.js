const axios = require('axios');
const Promise = require('bluebird');
const updateScheduledEvents = require('./updateScheduledEvents.js');

const deleteDuplicateEventsFlow = (uniqueUserId, newEvents) => {
  const config = {
    url: `${process.env.HOST}createEventsToDeleteArrayInDb`,
    payload: {
      newEventDates: Object.keys(newEvents),
      uniqueUserId,
    },
  };
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
};

module.exports = deleteDuplicateEventsFlow;
