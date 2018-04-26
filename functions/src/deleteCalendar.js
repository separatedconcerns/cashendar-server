import { promisify } from 'bluebird';
import { calendar as _calendar } from 'googleapis';
import { authorize } from './apiClients/googleClient';

function deleteCalendar(OAuthToken, calendarId) {
  const googleClientAuthorize = promisify(authorize);

  const deleteGoogleCalendar = (auth, calendarId) => {
    const calendarDelete = promisify(_calendar('v3').calendars.delete);
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

export default deleteCalendar;
