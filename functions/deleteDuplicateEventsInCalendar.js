const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');
const packageEventsToDelete = require('./utils/packageEventsToDelete.js');

function deleteDuplicateEventsInCalendar(request, response) {
  const googleClientAuthorize = Promise.promisify(googleClient.authorize);
  const calendarId = request.body.calendarId;
  const OAuthToken = request.body.OAuthToken;
  const eventsToDeleteQueue = request.body.eventsToDeleteQueue;

  const deleteDuplicateEvents = (auth) => {
    const deleteEvent = Promise.promisify(google.calendar('v3').events.delete);
    const packageEventsToDeleteProm = Promise.method(packageEventsToDelete);

    packageEventsToDeleteProm(auth, calendarId, eventsToDeleteQueue)
      .then((packagedEvents) => {
        let i = 0;
        let eventsToBeDeleted = packagedEvents.length;
        console.log(`${eventsToBeDeleted} events to be deleted`);

        const deleteEvents = setInterval(() => {
          if (i <= packagedEvents.length - 1) {
            deleteEvent(packagedEvents[i])
              .catch((e) => {
                eventsToBeDeleted -= 1;
                console.log('EVENT NOT DELETED!:', e);
              });
            i += 1;
            console.log(i);
          } else {
            console.log(`${eventsToBeDeleted} of ${packagedEvents.length} new events have been deleted`);
            console.log('EVENTS UP-TO-DATE AND PROGRAM LOOP COMPLETE!');
            clearInterval(deleteEvents);
          }
        }, 400);
      });
  };

  googleClientAuthorize(OAuthToken, deleteDuplicateEvents)
    .then(() => response.end())
    .catch(e => console.log('deleteDuplicateEvents FAILURE!:', e));
}

module.exports = deleteDuplicateEventsInCalendar;
