const Promise = require('bluebird');
const googleAuth = require('google-auth-library');

var APICredentials = {
        "installed": {
            "client_id": process.env.GCAL_CLIENT_ID,
            "project_id": process.env.GCAL_PROJECT_ID,
            "auth_uri": process.env.GCAL_AUTH_URI,
            "token_uri": process.env.GCAL_TOKEN_URI,
            "auth_provider_x509_cert_url": process.env.GCAL_AUTH_PROVIDER,
            "client_secret": process.env.GCAL_CLIENT_SECRET,
            "redirect_uris": [
                process.env.GCAL_URN,
                process.env.GCAL_LOCALHOST
            ]
        }
    }

function authorize(OAuthToken, callback) {
    let _callback = Promise.promisify(callback);
    let clientSecret = APICredentials.installed.client_secret;
    let clientId = APICredentials.installed.client_id;
    let redirectUrl = APICredentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    oauth2Client.credentials = {
        'access_token': OAuthToken
    };
    _callback(oauth2Client)
        .catch(e => console.log(e));
}

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
    authorize
}
