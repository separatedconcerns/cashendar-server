const Promise = require('bluebird');
const GoogleAuth = require('google-auth-library');
const creds = require('../creds.json');

const APICredentials = {
  installed: {
    client_id: creds.GCAL_CLIENT_ID,
    project_id: creds.GCAL_PROJECT_ID,
    auth_uri: creds.GCAL_AUTH_URI,
    token_uri: creds.GCAL_TOKEN_URI,
    auth_provider_x509_cert_url: creds.GCAL_AUTH_PROVIDER,
    client_secret: creds.GCAL_CLIENT_SECRET,
    redirect_uris: [
      creds.GCAL_URN,
      creds.GCAL_LOCALHOST,
    ],
  },
};

const authorize = (OAuthToken, callback, calendarId, uniqueUserId) => {
  const callbackPromise = Promise.method(callback);
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
