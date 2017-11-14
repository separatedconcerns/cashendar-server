const axios = require('axios');
const user = require('../controllers/userController.js');

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
      .catch(e => console.log('Events to delete array not created!:', e))
      .then(calId_eventsToDeleteQueue_OAuthToken => ({
        url: `${process.env.HOST}deleteDuplicateEventsInCalendar`,
        payload: calId_eventsToDeleteQueue_OAuthToken.data,
      }))
      .then((config2) => {
        axios.post(config2.url, config2.payload)
          .then(() => {
            user.updateScheduledEvents(uniqueUserId, newEvents)
              .then(() => {
                user.clearDatesToScheduleAndEventsToDeleteQueues(uniqueUserId);
              });
          });
      });
  }, 300);
};

module.exports = deleteDuplicateEventsFlow;
