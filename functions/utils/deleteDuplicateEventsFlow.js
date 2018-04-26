const axios = require('axios');
const user = require('../src/controllers/userController');
const Promise = require('bluebird');
const creds = require('../src/creds.json');

const deleteDuplicateEventsFlow = (uniqueUserId, newEvents) =>
  user.getDatesToScheduleQueueFromDB(uniqueUserId)
    .then((datesToScheduleQueue) => {
      datesToScheduleQueue.forEach((date) => {
        newEvents[date] = newEvents[date] || null;
      });
      const config = {
        url: `${creds.HOST}createEventsToDeleteQueueInDb`,
        payload: {
          newEventDates: Object.keys(newEvents),
          uniqueUserId,
        },
      };
      return axios.post(config.url, config.payload);
    })
    .then((calId_eventsToDeleteQueue_OAuthToken) => {
      const config2 = {
        url: `${creds.HOST}deleteDuplicateEventsInCalendar`,
        payload: calId_eventsToDeleteQueue_OAuthToken.data,
      };
      return axios.post(config2.url, config2.payload);
    })
    .then(() => Promise.all(
      [user.updateScheduledEvents(uniqueUserId, newEvents),
        user.clearDatesToScheduleAndEventsToDeleteQueues(uniqueUserId)]))
    .catch(e => console.log('Promise.all error!:', e));

module.exports = deleteDuplicateEventsFlow;
