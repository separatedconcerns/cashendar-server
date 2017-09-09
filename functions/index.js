const dotenv = require('dotenv');
dotenv.config();
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
const axios = require('axios');
const plaid = require('plaid');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const Promise = require('bluebird');
// const plaidClient = require('./plaidClient.js')

admin.initializeApp({
  credential: admin.credential.cert({
 "type": process.env.REACT_APP_FIREBASE_TYPE,
 "project_id": process.env.REACT_APP_FIREBASE_PROJECT_ID,
 "private_key_id": process.env.REACT_APP_FIREBASE_PRIVATE_KEY_ID,
 "private_key": process.env.REACT_APP_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
 "client_email": process.env.REACT_APP_FIREBASE_CLIENT_EMAIL,
 "client_id": process.env.REACT_APP_FIREBASE_CLIENT_ID,
 "auth_uri": process.env.REACT_APP_FIREBASE_AUTH_URI,
 "token_uri": process.env.REACT_APP_FIREBASE_TOKEN_URI,
 "auth_provider_x509_cert_url": process.env.REACT_APP_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
 "client_x509_cert_url": process.env.REACT_APP_FIREBASE_CLIENT_X509_CERT_URL
}),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
});

exports.addUser = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const idToken = request.body.idToken;
  let uniqueUserId;

  admin.auth()
  .verifyIdToken(idToken)
  .then(decodedToken => {
    uniqueUserId = decodedToken.uid;
    return admin.auth().getUser(uniqueUserId) })
  .then(userRecord => {
    let user = userRecord.toJSON();
    let payload = {
      email: user.email,
      name: user.displayName
    }
    return payload;
  })
  .then(payload =>
    admin.database()
    .ref('users/' + uniqueUserId)
    .set(payload))
  .then(response.end())
  .catch(error => console.log("Error fetching user data:", error) );
});

exports.exchangePublicToken = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const publicToken = request.body.publicToken;
  const uniqueUserId = request.body.uniqueUserId;

  const plaidClient = new plaid.Client(
    process.env.REACT_APP_PLAID_CLIENT_ID,
    process.env.REACT_APP_PLAID_SECRET,
    process.env.REACT_APP_PLAID_PUBLIC_KEY,
    plaid.environments.sandbox);

  plaidClient.exchangePublicToken(publicToken)
  .then(successResponse => {
    return {
      access_token: successResponse.access_token,
      request_id: successResponse.request_id
    };
  })
  .then(payload =>{
    admin.database()
    .ref(`/users/${uniqueUserId}/access_tokens`)
    .set(payload);
    return payload;
  })
  .then(payload => {
    axios.post('http://localhost:5000/testproject-6177f/us-central1/getTransactionsFromPlaid', {
      access_token: payload.access_token,
      uniqueUserId: uniqueUserId
    })
  })
  .then(response.end())
  .catch(error => console.log(error) );
})

exports.getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  const access_token = request.body.access_token;
  const uniqueUserId = request.body.uniqueUserId;
  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const thirtyDaysAgo = now.subtract(30, 'days').format('YYYY-MM-DD');

  const plaidClient = new plaid.Client(
    process.env.REACT_APP_PLAID_CLIENT_ID,
    process.env.REACT_APP_PLAID_SECRET,
    process.env.REACT_APP_PLAID_PUBLIC_KEY,
    plaid.environments.sandbox);

  plaidClient.getTransactions(access_token, thirtyDaysAgo, today)
  .then(successResponse => {
    let item_id = successResponse.item.item_id;
    let accounts = successResponse.accounts;
    let request_id = successResponse.request_id;
    let transactions = successResponse.transactions;

    admin.database()
    .ref('users')
    .once('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        let childKey = childSnapshot.key;
        let childData = childSnapshot.val();

        admin.database()
        .ref(`users/${uniqueUserId}/access_tokens/itemId`)
        .set({transactions})
      });
    });
  })
  .then(response.end())
  .catch(error => console.log(error));
});

exports.getTransactionsFromDatabase = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;

  admin.database()
  .ref(`users/${uniqueUserId}/access_tokens/itemId/transactions`)
  .once('value')
  .then(snapshot => response.json(snapshot.val()) );
});

exports.readCalendar = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const OAuthToken = request.body.OAuthToken;
  console.log(OAuthToken);
  response.end(OAuthToken);
});

exports.addCalendarEvent = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  var credentialsObj = {
    "installed": {
      "client_id": "560541486783-7vto2l61ga9ssbb8614354pi6i1i8a1f.apps.googleusercontent.com",
      "project_id": "feisty-coast-179022",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://accounts.google.com/o/oauth2/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_secret": "-_BbGTqmu80CBR6I9pn9A3FS",
      "redirect_uris": [
        "urn:ietf:wg:oauth:2.0:oob",
        "http://localhost"
      ]
    }
  }

  function authorize(credentials, callback) {
    var _callback = Promise.promisify(callback);
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    oauth2Client.credentials = {
      "access_token": "ya29.GlvABBCgUSYvU6HVF0dlezEhkw2KHTgsQBYcZKK2geCGLQ0sCDM613ITBxRdiDZXjXBUqKI_bWNa7BsmtRhdyMzFctN_kUuFuhtAKw8g63tPNZ1sTVhh-pWaTMUD",
      "refresh_token": "1/vU7t3U2e4FfhMyC75GTa4OJk3sysHPK8reweaV7XwEs",
      "token_type": "Bearer",
      "expiry_date": 1504909016620
    };

    _callback(oauth2Client)
    .catch(e => getToken(oauth2Client, callback));
  }

  function getToken(oauth2Client, callback) {
    oauth2Client.getToken(code)
    .then(token => {
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    }).catch(err => console.log('Error while trying to retrieve access token', err));
  }

  authorize(credentialsObj, createEvent);

  function createEvent(auth) {
    var event = {
      'summary': 'Spent $32.00',
      'description': '$32 at sandwich shop',
      'start': {
        'date': '2017-09-03',
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'date': '2017-09-03',
        'timeZone': 'America/Los_Angeles'
      }
    };

    var targetCal = {
      auth: auth,
      calendarId: "7n7ngj8e5u17gdgu363skhquhg@group.calendar.google.com",
      resource: event
    };

    var eventInsert = Promise.promisify(google.calendar('v3').events.insert);

    eventInsert(targetCal)
    .then(event => console.log('Event created: ', event.description))
    .catch(e => console.log('there was an error contacting Google Calendar' + e));
  }
  response.end('');
});
// end point that requires unique USER ID
  // returns an integer representing dollar amount spent

// end point that requires USER ID
  // returns "Profile deleted" message

// end point that requires USER ID and Auth Token
  // return "bank relationship deleted" message

// end point that requires USER ID
  // returns all accounts for that user
