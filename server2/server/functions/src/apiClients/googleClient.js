import { method } from 'bluebird';
import * as GoogleAuth from 'google-auth-library';
import { GCAL_CLIENT_ID, GCAL_PROJECT_ID, GCAL_AUTH_URI, GCAL_TOKEN_URI, GCAL_AUTH_PROVIDER, GCAL_CLIENT_SECRET, GCAL_URN, GCAL_LOCALHOST } from '../creds.json';

const APICredentials = {
  installed: {
    client_id: GCAL_CLIENT_ID,
    project_id: GCAL_PROJECT_ID,
    auth_uri: GCAL_AUTH_URI,
    token_uri: GCAL_TOKEN_URI,
    auth_provider_x509_cert_url: GCAL_AUTH_PROVIDER,
    client_secret: GCAL_CLIENT_SECRET,
    redirect_uris: [
      GCAL_URN,
      GCAL_LOCALHOST,
    ],
  },
};

const authorize = (OAuthToken, callback, calendarId, uniqueUserId) => {
  const callbackPromise = method(callback);
  const clientSecret = APICredentials.installed.client_secret;
  const clientId = APICredentials.installed.client_id;
  const redirectUrl = APICredentials.installed.redirect_uris[0];
  const auth = new GoogleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  oauth2Client.credentials = {
    access_token: OAuthToken,
  };
  callbackPromise(oauth2Client, calendarId, uniqueUserId)
    .then(val => val)
    .catch(e => e);
};

/*     We will eventually need to use something like this to get
        a new token if a user's token is expired
                    |
                    |
                    V
*/
//   function getToken(oauth2Client, callback) {
//     oauth2Client.getToken(code)
//     .then(token => {
//       oauth2Client.credentials = token;
//       storeToken(token);
//       callback(oauth2Client);
//     }).catch(err => console.log('Error while trying to retrieve access token', err));
//   }

module.exports = {
  authorize,
};
