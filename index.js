const dotenv = require('dotenv');
dotenv.config();
const functions = require('firebase-functions');
const admin = require('./firebaseClient.js');
const moment = require('moment');
const axios = require('axios');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const Promise = require('bluebird');
const googleClient = require('./googleClient.js');
const plaidClient = require('./plaidClient.js');


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
    .then(response.end())
  })
  .catch(error => console.log(error) );
})

exports.getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  const access_token = request.body.access_token;
  const uniqueUserId = request.body.uniqueUserId;
  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const thirtyDaysAgo = now.subtract(30, 'days').format('YYYY-MM-DD');

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
  .then(() => response.end())
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
  // console.log(OAuthToken);
  response.end(OAuthToken);
});

exports.createNewCalendar = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;

  function authorize(credentials, callback) {
    let _callback = Promise.promisify(callback);
    let clientSecret = credentials.installed.client_secret;
    let clientId = credentials.installed.client_id;
    let redirectUrl = credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    oauth2Client.credentials = googleClient.oauth2ClientCredentials; 
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

  authorize(googleClient.APICredentials, createCalendar);

  function createCalendar(auth) {
    let calendarCreate = Promise.promisify(google.calendar('v3').calendars.insert);
    let config = {
      auth: auth,
      resource: { summary: 'cashMoney4' }
    }
    calendarCreate(config)
      .then(event => {
        console.log(event.id);
        // TODO: 
        //  save event.id to db 
        //  save event.summary to db
        response.end('')})
      .catch(e => response.end('there was an error contacting Google Calendar ' + e));
  }
});

exports.addCalendarEvent = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;

  function authorize(credentials, callback) {
    let _callback = Promise.promisify(callback);
    let clientSecret = credentials.installed.client_secret;
    let clientId = credentials.installed.client_id;
    let redirectUrl = credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    // console.log(auth);
    oauth2Client.credentials = googleClient.oauth2ClientCredentials; 
    _callback(oauth2Client)
    .catch(e => console.log(e));
  }
   
  function getToken(oauth2Client, callback) {
    oauth2Client.getToken(code)
    .then(token => {
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    }).catch(err => console.log('Error while trying to retrieve access token', err));
  }

  authorize(googleClient.APICredentials, createEvent);
 
  function createEvent(auth) {
    let config = {
      url: 'http://localhost:5000/testproject-6177f/us-central1/getDailySpending',
      payload: { uniqueUserId: uniqueUserId }
    };
    axios.post(config.url, config.payload)
    .then(sums => {
      let dailySpending = sums.data; 
      console.log(sums.data)
      const calendarId = '2slbaav4o97vbeqjftb3ihat5o@group.calendar.google.com';

      for (let date in dailySpending) {
        
        let event = {
          'summary': `Spent $${dailySpending[date]}`,
          'description': '',
          'start': {
            'date': date,
            'timeZone': 'America/Los_Angeles'
          },
          'end': {
            'date': date,
            'timeZone': 'America/Los_Angeles'
          }
        };
        // console.log(event.summary);
        let targetCal = {
          auth: auth,
          calendarId: calendarId,
          resource: event
        };

        let eventInsert = Promise.promisify(google.calendar('v3').events.insert);

        eventInsert(targetCal)
          .catch(e => response.end('there was an error contacting Google Calendar' + e));
      }
    }).then(response.end(''))
    .catch(e => console.log(e)); 
  }

});




// end point that requires unique USER ID
  // returns an integer representing dollar amount spent
exports.getDailySpending = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  let config = {
    url: 'http://localhost:5000/testproject-6177f/us-central1/getTransactionsFromDatabase',
    payload: {uniqueUserId: uniqueUserId}
  };
  axios.post(config.url, config.payload)
    .then(transactions => {
      let sums = {}; 
      transactions.data.forEach(transaction => {
        if (sums[transaction.date]) {
          sums[transaction.date] += transaction.amount;
        } else {
          sums[transaction.date] = transaction.amount;
        }
      });
      return sums; 
    }).then(sums => response.json(sums))
    .catch(error => {console.log(error)});
});
// end point that requires USER ID
  // returns "Profile deleted" message
exports.deleteUserProfile = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.end('Profile Deleted');
});
// end point that requires USER ID and Auth Token
  // return "bank relationship deleted" message
exports.deleteBankAccount = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.end('Bank relationship deleted');
});
// end point that requires USER ID
  // returns all accounts for that user
exports.getAllUserAccounts = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.end('Returns all accounts for user');
});

