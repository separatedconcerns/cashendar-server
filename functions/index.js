const dotenv = require('dotenv');
dotenv.config();
const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const moment = require('moment');
const axios = require('axios');
const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');
const plaidClient = require('./apiClients/plaidClient.js');

//***************** ADD USER *********************//
exports.addUser = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const idToken = request.body.idToken;
  const OAuthToken = request.body.OAuthToken;

  // verifies firebase idToken
  admin.auth().verifyIdToken(idToken)
  .then(decodedToken => {
    let uniqueUserId = decodedToken.uid;
    let ref = admin.database().ref(`users/${uniqueUserId}`);

    // searches for uniqueUserId in db
        // if user exists response is ended
        // otherwise a new user is created in db,
        // a new calendar is created,
        // calendarId is saved in db
    ref.once('value')
    .then(snapshot => {
      if (snapshot.exists()) { response.end(); } else {
        admin.auth().getUser(uniqueUserId)
        .then(userRecord => {
              let user = userRecord.toJSON();
              let payload = {
                email: user.email,
                name: user.displayName,
                OAuthToken: OAuthToken
              };
              admin.database().ref('users/' + uniqueUserId).set(payload)
              .then(() => {
                let config = {
                  url: 'http://localhost:5000/testproject-6177f/us-central1/createNewCalendar',
                  payload: {OAuthToken: OAuthToken}
                };
                axios.post(config.url, config.payload)
                .then(calendar => {
                  let calId = calendar.data.id;
                  let calName = calendar.data.summary;
                  admin.database().ref('users/' + uniqueUserId).update({calendarId: calId, calendarName: calName});
                });
              });
            }).then(response.end(''))
            .catch(error => console.log('Error fetching user data:', error));
      }
    });
  });
});

//************** EXCHANGE PUBLIC TOKEN ******************//
exports.exchangePublicToken = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const publicToken = request.body.publicToken;
  const uniqueUserId = request.body.uniqueUserId;

  // Exchanges publicToken with Plaid API for access_token,
  //  then saves access-token to user's profile in db,
  //  then invokes getTransactionsFromPlaid endpoint passing in uniqueUserId and access_token
  plaidClient.exchangePublicToken(publicToken)
  .then(successResponse => {
    return {
      access_token: successResponse.access_token,
      request_id: successResponse.request_id
    };
  }).then(payload => {
    admin.database()
    .ref(`/users/${uniqueUserId}/access_tokens`)
    .set(payload);
    return payload;
  }).then(payload => {
    axios.post('http://localhost:5000/testproject-6177f/us-central1/getTransactionsFromPlaid', {
      access_token: payload.access_token,
      uniqueUserId: uniqueUserId
    })
  }).then(response.end())
  .catch(error => console.log(error));
});

//*************** GET TRANSACTIONS FROM PLAID ***********************//
exports.getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  const access_token = request.body.access_token;
  const uniqueUserId = request.body.uniqueUserId;
  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const thirtyDaysAgo = now.subtract(30, 'days').format('YYYY-MM-DD');

  // Gets user's transactions from Plaid API,
  // then saves transactions to user profile in db
  // then invokes addCalendarEvents passing in uniqueUserId, calendarId, and OAuthToken
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
        .set({transactions});
      });
    });
  }).then(() => {
    let ref = admin.database().ref(`users/${uniqueUserId}/`);
    ref.once('value')
    .then(snapshot => {
      let calendarId = snapshot.val().calendarId;
      let OAuthToken = snapshot.val().OAuthToken;
      let config = {
        url: 'http://localhost:5000/testproject-6177f/us-central1/addCalendarEvents',
        payload: {uniqueUserId: uniqueUserId, calendarId: calendarId, OAuthToken: OAuthToken}
      };
      axios.post(config.url, config.payload);
    });
  }).then(() => response.end())
  .catch(error => console.log(error));
});

//**************** CREATE NEW CALENDAR **********************//
exports.createNewCalendar = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const OAuthToken = request.body.OAuthToken;

  // Creates a new OAuth2 client,
  // then adds OAuthToken to OAuth2Client and invokes a callback passing in the oauth2Client,
  // in this case the callback is createCalendar
  googleClient.authorize(OAuthToken, createCalendar);

  // Creates new Where's My Money calendar in user's google calendar
  function createCalendar(auth) {
    let calendarCreate = Promise.promisify(google.calendar('v3').calendars.insert);
    let config = {
      auth: auth,
      resource: {summary: 'Wheres My Money!!!'}
    };
    calendarCreate(config)
    .then(calendar => response.json(calendar))
    .catch(e => response.end('there was an error contacting Google Calendar ' + e));
  }
});

//**************** ADD CALENDAR EVENTS **********************//
exports.addCalendarEvents = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  const calendarId = request.body.calendarId;
  const OAuthToken = request.body.OAuthToken;

  // Creates a new OAuth2 client,
  // then adds OAuthToken to OAuth2Client and invokes a callback passing in the oauth2Client,
  // in this case the callback is createEvents
  googleClient.authorize(OAuthToken, createEvents);

  // Gets daily spending object
  // then creates a new calendar event for each day's total spending
  function createEvents(auth) {
    let config = {
      url: 'http://localhost:5000/testproject-6177f/us-central1/getDailySpending',
      payload: { uniqueUserId: uniqueUserId}
    };
    axios.post(config.url, config.payload)
    .then(sums => {
      let dailySpending = sums.data;

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

//************** GET DAILY SPENDING **********************//
exports.getDailySpending = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  let config = {
    url: 'http://localhost:5000/testproject-6177f/us-central1/getTransactionsFromDatabase',
    payload: {uniqueUserId: uniqueUserId}
  };

  // Gets a user's transactions from db
  // then sums the transaction amounts by date
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
  .catch(error => {console.log(error);});
});

//************** GET TRANSACTIONS FROM DATABASE ************************//
exports.getTransactionsFromDatabase = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;

  admin.database()
    .ref(`users/${uniqueUserId}/access_tokens/itemId/transactions`)
    .once('value')
    .then(snapshot => response.json(snapshot.val()));
});

// end point that requires USER ID
// returns "Profile deleted" message
exports.deleteUserProfile = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;

  let ref = admin.database().ref(`users/${uniqueUserId}/`);
  ref.once('value')
  .then(snapshot => {
    let config = {
      url: 'http://localhost:5000/testproject-6177f/us-central1/deleteCalendar',
      payload: {
        calendarId: snapshot.val().calendarId,
        OAuthToken: snapshot.val().OAuthToken
      }
    }
    axios.post(config.url, config.payload)
    .then(admin.database().ref(`users/${uniqueUserId}`).remove());
  }).then(response.end('Profile Deleted'))
  // TODO: send delete request to plaid after deleting calendar and before deleting Profile
  // prevents unnecessary billing from plaid if going to production
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

exports.deleteCalendar = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const OAuthToken = request.body.OAuthToken;
  const calendarId = request.body.calendarId;

  googleClient.authorize(OAuthToken, deleteCalendar);

  function deleteCalendar(auth) {
    let calendarDelete = Promise.promisify(google.calendar('v3').calendars.delete);
    let config = {
      auth: auth,
      calendarId: calendarId,
    };
    calendarDelete(config)
    .then(calendar => {
      response.json(calendar);
    }).catch(e => response.end('there was an error contacting Google Calendar ' + e));
  }
});
