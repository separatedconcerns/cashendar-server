const functions = require('firebase-functions');
const admin = require('firebase-admin');
const plaid = require('plaid');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

admin.initializeApp(functions.config().firebase);

exports.exchangePublicToken = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const publicToken = request.body.publicToken;
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
        request_id: request_id,};

      admin.database()
      .ref('/users')
      .push(payload)
      .then(() => {
        response.end();
      });

    }).catch((error) => {
      console.log(error);
    });
});

exports.writeTransactions = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const access_token = 'access-sandbox-2c10cb64-9ead-4128-9dfa-fe851df9ac5a';
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
      // console.log('line 67: accounts', successResponse.accounts);
      // console.log('line 68: transactions', successResponse.transactions);
      // console.log('line 69: item', successResponse.item);
      // console.log('line 70: request id', successResponse.request_id);

      let item_id = successResponse.item.item_id;
      let accounts = successResponse.accounts;
      let request_id = successResponse.request_id;
      let transactions = successResponse.transactions;

      const ref = admin.database().ref('users');

      ref.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();
          console.log(childKey);
          console.log(childData.item_id);
          console.log(item_id);
          console.log(childData.item_id === item_id);

          admin.database()
          .ref(`users/-KtEAsQdDs4LehAJ2Q5p/${item_id}`)
          .push({transactions: transactions})
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

