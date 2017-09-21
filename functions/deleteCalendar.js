const functions = require('firebase-functions');
const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');

const deleteCalendar = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const OAuthToken = request.body.OAuthToken;
  const calendarId = request.body.calendarId;

  const deleteGoogleCalendar = (auth) => {
    const calendarDelete = Promise.promisify(google.calendar('v3').calendars.delete);
    const config = {
      auth,
      calendarId,
    };
    calendarDelete(config)
      .then((calendar) => {
        response.json(calendar);
      }).catch(e => response.end(`there was an error contacting Google Calendar ${e}`));
  };
  googleClient.authorize(OAuthToken, deleteGoogleCalendar);
});

module.exports = deleteCalendar;
