const google = require('googleapis');
const Promise = require('bluebird');

const createGoogleCalendar = (auth) => {
  const calendarCreate = Promise.promisify(google.calendar('v3').calendars.insert);
  let calendarResponse;
  const config = {
    auth,
    resource: { summary: 'Wheres My Money!!!' },
  };
  calendarCreate(config)
    .then(calendar => {calendarResponse = calendar.id})
    .catch(e => e);
  return calendarResponse;
};

module.exports = createGoogleCalendar;
