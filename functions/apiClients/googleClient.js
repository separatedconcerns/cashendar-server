// const Promise = require('bluebird');
const googleAuth = require('google-auth-library');

// function authorize(callback) {
//     // console.log(callback);
//     var _callback = Promise.promisify(callback);
//     var credentials = {
//         "installed": {
//             "client_id": process.env.GCAL_CLIENT_ID,
//             "project_id": process.env.GCAL_PROJECT_ID,
//             "auth_uri": process.env.GCAL_AUTH_URI,
//             "token_uri": process.env.GCAL_TOKEN_URI,
//             "auth_provider_x509_cert_url": process.env.GCAL_AUTH_PROVIDER,
//             "client_secret": process.env.GCAL_CLIENT_SECRET,
//             "redirect_uris": [
//                 process.env.GCAL_URN,
//                 process.env.GCAL_LOCALHOST
//             ]
//         }
//     }
//     var clientSecret = credentials.installed.client_secret;
//     // console.log(clientSecret);
//     var clientId = credentials.installed.client_id;
//     var redirectUrl = credentials.installed.redirect_uris[0];
//     var auth = new googleAuth();
//     // console.log(auth);
//     var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

//     oauth2Client.credentials = {
//         "access_token": process.env.OAUTH2_ACCESS_TOKEN,
//         "refresh_token": process.env.OAUTH2_REFRESH_TOKEN,
//         "token_type": process.env.OAUTH2_TOKEN_TYPE,
//         "expiry_date": process.env.OAUTH2_EXPIRY_DATE
//     };

//     _callback(oauth2Client)
//         .catch(e => console.log('ERROR!!!!'));
// }

// function getToken(oauth2Client, callback) {
//     oauth2Client.getToken(code)
//         .then(token => {
//             oauth2Client.credentials = token;
//             storeToken(token);
//             callback(oauth2Client);
//         }).catch(err => console.log('Error while trying to retrieve access token', err));
// }
// var oauth2ClientCredentials = {
//         "access_token": process.env.OAUTH2_ACCESS_TOKEN,
//     };


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

module.exports = {
    APICredentials
}
