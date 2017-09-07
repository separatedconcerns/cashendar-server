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

      let access_token = successResponse.access_token;
      let request_id = successResponse.request_id;

      let payload = {
        access_token: access_token,
        request_id: request_id
      };

      admin.database()
      .ref(`/users/${uniqueUserId}/access_tokens`)
      .set(payload)
      .then(() => {
        axios.post('http://localhost:5000/testproject-6177f/us-central1/getTransactionsFromPlaid', {
          access_token: access_token,
          uniqueUserId: uniqueUserId
        })
        .then( () => response.end())
        .catch(error => {
          console.log(error);
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

exports.getTransactionsFromPlaid = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const access_token = request.body.access_token;
  const uniqueUserId = request.body.uniqueUserId;

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
          let childKey = childSnapshot.key;
          let childData = childSnapshot.val();

          admin.database()
          .ref(`users/${uniqueUserId}/access_tokens/itemId`)
          .set({transactions})
          .then(() => {
            response.end();
          });
        });
      });
    }).catch((error) => {
      console.log(error);
    });
});

exports.getTransactionsFromDatabase = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;

  admin.database()
    .ref(`users/${uniqueUserId}/access_tokens/itemId/transactions`)
    .once('value')
    .then(snapshot => response.json(snapshot.val()) );
});

