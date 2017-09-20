const functions = require('firebase-functions');
const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');


const createNewCalendar = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const OAuthToken = request.body.OAuthToken;

  function createCalendar(auth) {
    const calendarCreate = Promise.promisify(google.calendar('v3').calendars.insert);
    const config = {
      auth,
      resource: { summary: 'Wheres My Money!!!' },
    };
    calendarCreate(config)
      .then(calendar => response.json(calendar))
      .catch(e => response.end(`there was an error contacting Google Calendar ${e}`));
  }
  googleClient.authorize(OAuthToken, createCalendar);
});

module.exports = createNewCalendar;
