const functions = require('firebase-functions');
const admin = require('firebase-admin');
const plaid = require('plaid');
const dotenv = require('dotenv');
const moment = require('moment');
const axios = require('axios');
dotenv.config();

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
});

exports.addUser = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const idToken = request.body.idToken;

  admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      let uniqueUserId = decodedToken.uid;
      admin.auth().getUser(uniqueUserId)
        .then(userRecord => {
          let user = userRecord.toJSON();

          admin.database().ref('users/' + uniqueUserId).set({
            email: user.email,
            name: user.displayName
          });
        })
        .catch(error => {
          console.log("Error fetching user data:", error);
        });
    });
  response.end();
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
    .then((successResponse) => {

      let item_id = successResponse.item_id;
      let access_token = successResponse.access_token;
      let request_id = successResponse.request_id;

      let payload = {item_id: item_id,
        access_token: access_token,
        request_id: request_id};

      // TODO: try auth.currentUser.getIdToken() to retrieve current user's uid
      admin.database()
      .ref(`/users/${uniqueUserId}/access_tokens`)
      .set(payload)
      .then(() => {
        response.end();
      });

    }).catch((error) => {
      console.log(error);
    });
  // TODO: change GET to POST and POST access token to this address
  axios.get('http://localhost:5000/testproject-6177f/us-central1/getTransactionsFromPlaid').catch(error => {
    console.log(error);
  });
});

exports.getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  // get access token from the request object
  const access_token = 'access-sandbox-0228c2e2-755b-4137-b1ad-7f52300b5635';
  const plaidClient = new plaid.Client(
    process.env.REACT_APP_PLAID_CLIENT_ID,
    process.env.REACT_APP_PLAID_SECRET,
    process.env.REACT_APP_PLAID_PUBLIC_KEY,
    plaid.environments.sandbox);

  const now = moment();
  const today = now.format('YYYY-MM-DD');
  const thirtyDaysAgo = now.subtract(30, 'days').format('YYYY-MM-DD');

  plaidClient.getTransactions(access_token, thirtyDaysAgo, today)
    .then((successResponse) => {

      let item_id = successResponse.item.item_id;
      let accounts = successResponse.accounts;
      let request_id = successResponse.request_id;
      let transactions = successResponse.transactions;

      admin.database().ref('users').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();
          console.log(childKey);
          console.log(childData.item_id);
          console.log(item_id);
          console.log(childData.item_id === item_id);

          admin.database()
          .ref(`users/ni6laljDCHdTIZYA2hSrKfxfvWw2/access_tokens/access_token/${item_id}`)
          .set({transactions: transactions})
          .then(() => {
            response.end();
          });
        });
      });

      response.end();

    }).catch((error) => {
      console.log(error);
    });
});

exports.getTransactionsFromDatabase = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const sample = [{
   "account_id": "vokyE5Rn6vHKqDLRXEn5fne7LwbKPLIXGK98d",
   "amount": 2307.21,
   "category": [
     "Shops",
     "Computers and Electronics"
   ],
   "category_id": "19013000",
   "date": "2017-01-29",
   "location": {
    "address": "300 Post St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94108",
    "lat": null,
    "lon": null
   },
   "name": "Apple Store",
   "payment_meta": Object,
   "pending": false,
   "pending_transaction_id": null,
   "account_owner": null,
   "transaction_id": "lPNjeW1nR6CDn5okmGQ6hEpMo4lLNoSrzqDje",
   "transaction_type": "place"
  }, {
   "account_id": "XA96y1wW3xS7wKyEdbRzFkpZov6x1ohxMXwep",
   "amount": 78.5,
   "category": [
     "Food and Drink",
     "Restaurants"
   ],
   "category_id": "13005000",
   "date": "2017-01-29",
   "location": {
     "address": "262 W 15th St",
     "city": "New York",
     "state": "NY",
     "zip": "10011",
     "lat": 40.740352,
     "lon": -74.001761
   },
   "name": "Golden Crepes",
   "payment_meta": Object,
   "pending": false,
   "pending_transaction_id": null,
   "account_owner": null,
   "transaction_id": "4WPD9vV5A1cogJwyQ5kVFB3vPEmpXPS3qvjXQ",
   "transaction_type": "place"
 }];
  response.json(sample);
});

