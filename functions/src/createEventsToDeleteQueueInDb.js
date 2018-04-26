import { getUserFromDB, updateEventsToDeleteQueue } from './controllers/userController';

function createEventsToDeleteQueueInDb(request, response) {
  const newEventDates = request.body.newEventDates;
  const uniqueUserId = request.body.uniqueUserId;
  let calendarId;
  let OAuthToken;
  let responseObj;

  getUserFromDB(uniqueUserId)
    .then((userData) => {
      calendarId = userData.calendarId;
      OAuthToken = userData.OAuthToken;
      const scheduledEvents = userData.scheduledEvents || [];
      const eventsToDeleteQueue = newEventDates.reduce((accumulator, date) => {
        if (scheduledEvents[date]) {
          accumulator.push(scheduledEvents[date]);
        }
        return accumulator;
      }, []);
      responseObj = {
        eventsToDeleteQueue,
        calendarId,
        OAuthToken,
      };
      return updateEventsToDeleteQueue(uniqueUserId, eventsToDeleteQueue);
    })
    .then(() => response.json(responseObj))
    .catch(e => console.log('Error in createEventsToDeleteQueueInDb', e));
}

export default createEventsToDeleteQueueInDb;

