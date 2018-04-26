import { calendar as _calendar } from 'googleapis';
import { promisify } from 'bluebird';
import * as googleClient from './apiClients/googleClient';

function createNewCalendar(request, response) {
  const OAuthToken = request.body.OAuthToken;

  async function createCalendar(auth) {
    const calendarCreate = promisify(_calendar('v3').calendars.insert);
    const config = {
      auth,
      resource: { summary: 'Cashendar' },
    };
    const calendar = await calendarCreate(config);
    response.json(calendar);
  }
  googleClient.authorize(OAuthToken, createCalendar);
}

export default createNewCalendar;
