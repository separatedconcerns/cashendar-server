const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');

function deleteDuplicateEventsInCalendar(request, response) {
  const googleClientAuthorize = Promise.promisify(googleClient.authorize);
  const calendarId = request.body.calendarId;
  const OAuthToken = request.body.OAuthToken;
  const eventsToDeleteQueue = request.body.eventsToDeleteQueue;

  const deleteDuplicateEvents = (auth) => {
    const deleteEvent = Promise.promisify(google.calendar('v3').events.delete);
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
    return Promise.all(deletePromises).catch(error => console.log(error));
  };

  googleClientAuthorize(OAuthToken, deleteDuplicateEvents)
    .then(response.end())
    .catch(e => console.log('deleteDuplicateEvents FAILURE!:', e));
}

module.exports = deleteDuplicateEventsInCalendar;
