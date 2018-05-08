import { calendar as _calendar } from 'googleapis';
import { promisify } from 'bluebird';
import * as googleClient from './apiClients/googleClient';
import * as user from './controllers/userController';

function createNewCalendar(request, response) {
  const OAuthToken = request.body.OAuthToken;
  const uniqueUserId = request.body.uniqueUserId;

  async function createCalendar(auth) {
    const calendarCreate = promisify(_calendar('v3').calendars.insert);
    const config = {
      auth,
      resource: { summary: 'Cashendar' },
    };
    try {
      const calendar = await calendarCreate(config);
      const userCalendarDetails = {
        calendarId: calendar.id,
        calendarName: calendar.summary,
      };
      await user.updateUser(uniqueUserId, userCalendarDetails);
      response.end();
    } catch (error) {
      console.log(error);
    }
  }
  googleClient.authorize(OAuthToken, createCalendar);
}

export default createNewCalendar;
