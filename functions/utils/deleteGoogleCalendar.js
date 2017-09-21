const google = require('googleapis');
const Promise = require('bluebird');

const deleteGoogleCalendar = (auth, calendarId) => {
  const calendarDelete = Promise.promisify(google.calendar('v3').calendars.delete);
  const config = {
    auth,
    calendarId,
  };
  calendarDelete(config)
    .then(calendar => calendar).catch(e => e);
};

module.exports = deleteGoogleCalendar;
