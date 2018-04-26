import { calendar } from 'googleapis';
import { promisify, all } from 'bluebird';
import { authorize } from './apiClients/googleClient';

function deleteDuplicateEventsInCalendar(request, response) {
  const googleClientAuthorize = promisify(authorize);
  const calendarId = request.body.calendarId;
  const OAuthToken = request.body.OAuthToken;
  const eventsToDeleteQueue = request.body.eventsToDeleteQueue;

  const deleteDuplicateEvents = (auth) => {
    const deleteEvent = promisify(calendar('v3').events.delete);
    const packagedEvents = eventsToDeleteQueue.reduce((packagedEventsToDelete, eventId) => {
      const event = {
        auth,
        calendarId,
        eventId,
      };
      packagedEventsToDelete.push(event);
      return packagedEventsToDelete;
    }, []);
    const eventsToBeDeleted = packagedEvents.length;
    console.log(`${eventsToBeDeleted} events to be deleted`);
    const deletePromises = packagedEvents.map(event => deleteEvent(event));
    return all(deletePromises).catch(error => console.log(error));
  };

  googleClientAuthorize(OAuthToken, deleteDuplicateEvents)
    .then(response.end())
    .catch(e => console.log('deleteDuplicateEvents FAILURE!:', e));
}

export default deleteDuplicateEventsInCalendar;
