import { post } from 'axios';
import { getDatesToScheduleQueueFromDB, updateScheduledEvents, clearDatesToScheduleAndEventsToDeleteQueues } from '../src/controllers/userController';
import { HOST } from '../src/creds.json';

async function mutateNewEvents(uniqueUserId, newEvents) {
  const eventsToMutate = newEvents;
  let datesToScheduleQueue;
  try {
    datesToScheduleQueue = await getDatesToScheduleQueueFromDB(uniqueUserId);
  } catch (error) {0
    console.log(error);
  }
  datesToScheduleQueue.forEach((date) => {
    eventsToMutate[date] = newEvents[date] || null;
  });
  return eventsToMutate;
}

async function getToken(uniqueUserId, newEvents) {
  const config = {
    url: `${HOST}createEventsToDeleteQueueInDb`,
    payload: {
      newEventDates: Object.keys(newEvents),
      uniqueUserId,
    },
  };
  return post(config.url, config.payload);
}

const deleteDuplicateEventsFlow = async (uniqueUserId, newEvents) => {
  const mutatedEvents = await mutateNewEvents(uniqueUserId, newEvents);
  const calIdEventsToDeleteQueueOAuthToken = await getToken(uniqueUserId, mutatedEvents);
  const config2 = {
    url: `${HOST}deleteDuplicateEventsInCalendar`,
    payload: calIdEventsToDeleteQueueOAuthToken.data,
  };
  await post(config2.url, config2.payload);
  await Promise.all([
    updateScheduledEvents(uniqueUserId, newEvents),
    clearDatesToScheduleAndEventsToDeleteQueues(uniqueUserId)]);
};

module.exports = deleteDuplicateEventsFlow;