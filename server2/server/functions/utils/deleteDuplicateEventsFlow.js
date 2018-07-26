import { post } from 'axios';
import { getDatesToScheduleQueueFromDB, updateScheduledEvents, clearDatesToScheduleAndEventsToDeleteQueues } from '../src/controllers/userController';
import { HOST } from '../src/creds.json';

const deleteDuplicateEventsFlow = (uniqueUserId, newEvents) =>
  getDatesToScheduleQueueFromDB(uniqueUserId)
    .then((datesToScheduleQueue) => {
      datesToScheduleQueue.forEach((date) => {
        newEvents[date] = newEvents[date] || null;
      });
      const config = {
        url: `${HOST}createEventsToDeleteQueueInDb`,
        payload: {
          newEventDates: Object.keys(newEvents),
          uniqueUserId,
        },
      };
      return post(config.url, config.payload);
    })
    .then((calId_eventsToDeleteQueue_OAuthToken) => {
      const config2 = {
        url: `${HOST}deleteDuplicateEventsInCalendar`,
        payload: calId_eventsToDeleteQueue_OAuthToken.data,
      };
      return post(config2.url, config2.payload);
    })
    .then(() => Promise.all(
      [updateScheduledEvents(uniqueUserId, newEvents),
        clearDatesToScheduleAndEventsToDeleteQueues(uniqueUserId)]))
    .catch(e => console.log('Promise.all error!:', e));

module.exports = deleteDuplicateEventsFlow;
