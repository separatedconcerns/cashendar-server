import * as axios from 'axios';
import * as user from './controllers/userController';
import * as creds from './creds.json';

async function addUser(request, response) {
  const idToken = request.body.idToken;
  const OAuthToken = request.body.OAuthToken;
  const uniqueUserId = await user.verifyIdToken(idToken);

  const snapshot = await user.doesUserExist(uniqueUserId);
  snapshot.exists() ? response.send({ items: snapshot.val().items }) : addUserToDB(); // eslint-disable-line

  async function addUserToDB() {
    const userProfile = await user.getUserProfile(uniqueUserId);
    const payload = {
      email: userProfile.email,
      name: userProfile.displayName,
      OAuthToken,
    };
    await user.initializeUser(uniqueUserId, payload);
    await createGoogleCalendar(); // eslint-disable-line
  }

  async function createGoogleCalendar() {
    const config = {
      url: `${creds.HOST}createNewCalendar`,
      payload: { OAuthToken, uniqueUserId },
    };
    const calendar = await axios.post(config.url, config.payload)
    const userCalendarDetails = {
      calendarId: calendar.data.id,
      calendarName: calendar.data.summary,
    };
    await user.updateUser(uniqueUserId, userCalendarDetails);
    response.end();
  }
}


export default addUser;
