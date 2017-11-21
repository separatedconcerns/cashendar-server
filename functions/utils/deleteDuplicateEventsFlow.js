const axios = require('axios');
const user = require('../controllers/userController.js');
const Promise = require('bluebird');

const deleteDuplicateEventsFlow = (uniqueUserId, newEvents) => {
  user.getDatesToScheduleQueueFromDB(uniqueUserId)
    .then((datesToScheduleQueue) => {
      datesToScheduleQueue.forEach((date) => {
        newEvents[date] = newEvents[date] || null;
      });
    });

  setTimeout(() => {
    const config = {
      url: `${process.env.HOST}createEventsToDeleteQueueInDb`,
      payload: {
        newEventDates: Object.keys(newEvents),
        uniqueUserId,
      },
    };
    axios.post(config.url, config.payload)
      .then((calIdEventsToDeleteQueueOAuthToken) => {
        const config2 = {
          url: `${process.env.HOST}deleteDuplicateEventsInCalendar`,
          payload: calIdEventsToDeleteQueueOAuthToken.data,
        };
        return axios.post(config2.url, config2.payload);
      })
      .then(() => Promise.all([user.updateScheduledEvents(uniqueUserId, newEvents),
        user.clearDatesToScheduleAndEventsToDeleteQueues(uniqueUserId)]))
      .catch(e => console.log('Promise.all error!:', e));
  }, 300);
};

module.exports = deleteDuplicateEventsFlow;
