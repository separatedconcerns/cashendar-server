const dotenv = require('dotenv');
dotenv.config();
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
const axios = require('axios');
const plaid = require('plaid');
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

// end point that requires unique USER ID
  // returns an integer representing dollar amount spent

// end point that requires USER ID
  // returns "Profile deleted" message

// end point that requires USER ID and Auth Token
  // return "bank relationship deleted" message

// end point that requires USER ID
  // returns all accounts for that user
