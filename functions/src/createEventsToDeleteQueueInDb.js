import { getUserFromDB, updateEventsToDeleteQueue } from './controllers/userController';

async function createEventsToDeleteQueueInDb(request, response) {
  const newEventDates = request.body.newEventDates;
  const uniqueUserId = request.body.uniqueUserId;
  const userData = await getUserFromDB(uniqueUserId);
  const calendarId = userData.calendarId;
  const OAuthToken = userData.OAuthToken;
  const scheduledEvents = userData.scheduledEvents || [];
  const eventsToDeleteQueue = newEventDates.reduce((accumulator, date) => {
    if (scheduledEvents[date]) {
      accumulator.push(scheduledEvents[date]);
    }
    return accumulator;
  }, []);
  const responseObj = {
    eventsToDeleteQueue,
    calendarId,
    OAuthToken,
  };
  await updateEventsToDeleteQueue(uniqueUserId, eventsToDeleteQueue);
  response.json(responseObj);
  // .catch(e => console.log('Error in createEventsToDeleteQueueInDb', e));
}

export default createEventsToDeleteQueueInDb;

