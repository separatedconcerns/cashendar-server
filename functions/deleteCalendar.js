const Promise = require('bluebird');
const google = require('googleapis');
const googleClient = require('./apiClients/googleClient.js');

function deleteCalendar(OAuthToken, calendarId) {
  const googleClientAuthorize = Promise.promisify(googleClient.authorize);

  const deleteGoogleCalendar = (auth, calendarId) => {
    const calendarDelete = Promise.promisify(google.calendar('v3').calendars.delete);
    const config = {
      auth,
      calendarId,
    };
    return calendarDelete(config)
      .then(calendar => calendar)
      .catch(e => e);
  };

  return googleClientAuthorize(OAuthToken, deleteGoogleCalendar, calendarId);
}

module.exports = deleteCalendar;
