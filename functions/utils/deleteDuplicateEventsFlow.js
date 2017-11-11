const axios = require('axios');
const user = require('../controllers/userController.js');

const deleteDuplicateEventsFlow = (uniqueUserId, newEvents) => {
  user.getDatesToScheduleFromDB(uniqueUserId)
    .then((datesToSchedule) => {
      datesToSchedule.forEach((date) => {
        newEvents[date] = newEvents[date] || null;
      });
    });

  setTimeout(() => {
    const config = {
      url: `${process.env.HOST}createEventsToDeleteArrayInDb`,
      payload: {
        newEventDates: Object.keys(newEvents),
        uniqueUserId,
      },
    };
    axios.post(config.url, config.payload)
      .catch(e => console.log('Events to delete array not created!:', e))
      .then(calId_eventsToDelete_OAuthToken => ({
        url: `${process.env.HOST}deleteDuplicateEventsInCalendar`,
        payload: calId_eventsToDelete_OAuthToken.data,
      }))
      .then((config2) => {
        axios.post(config2.url, config2.payload)
          .then(() => {
            user.updateScheduledEvents(uniqueUserId, newEvents);
          });
      });
  }, 100);
};

module.exports = deleteDuplicateEventsFlow;
