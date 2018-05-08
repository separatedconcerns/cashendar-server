import * as axios from 'axios';
import * as user from './controllers/userController';
import * as creds from './creds.json';

async function addUserToDB(uniqueUserId, OAuthToken) {
  const userProfile = await user.getUserProfile(uniqueUserId);
  const payload = {
    email: userProfile.email,
    name: userProfile.displayName,
    OAuthToken,
  };
  await user.initializeUser(uniqueUserId, payload);
}

async function createGoogleCalendar(uniqueUserId, OAuthToken) {
  const config = {
    url: `${creds.HOST}createNewCalendar`,
    payload: { OAuthToken, uniqueUserId },
  };
  return axios.post(config.url, config.payload);
}

export default async function addUser(request, response) {
  const idToken = request.body.idToken;
  const OAuthToken = request.body.OAuthToken;
  let uniqueUserId;
  let userExists;
  try {
    uniqueUserId = await user.verifyIdToken(idToken);
    userExists = await user.doesUserExist(uniqueUserId);
  } catch (error) {
    console.log(error);
  }

  if (userExists) {
    let items;
    try {
      items = await user.getUserItems(uniqueUserId);
      console.log('44', items);
    } catch (error) {
      console.log(error);
    }
    response.send({ items });
  } else {
    try {
      await addUserToDB(uniqueUserId, OAuthToken);
      await createGoogleCalendar(uniqueUserId, OAuthToken);
    } catch (error) {
      console.log(error);
    }
    response.end();
  }
}
