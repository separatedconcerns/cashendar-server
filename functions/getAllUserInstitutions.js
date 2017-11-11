const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');

const getAllUserInstitutions = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  const allInstitutions = {};
  let counter = 0;
  let total;

  // listen whether Plaid data is being fetched
  admin.database()
    .ref(`users/${uniqueUserId}/fetchingBanks`)
    .on('value', (snapshot) => {
      // if not fecthing from Plaid
      if (!snapshot.val()) {
        admin.database()
          .ref(`users/${uniqueUserId}/items`)
          .once('value')
          .then((chSnapShot) => {
            total = Object.keys(chSnapShot.val()).length;
            snapshot.forEach((childSnap) => {
              admin.database()
                .ref(`items/${childSnap.key}/institutionName`)
                .once('value')
                .then((chSnapshot2) => {
                  const institution = chSnapshot2.val();
                  allInstitutions[institution] = true;
                  counter += 1;
                  if (counter === total) { response.json(allInstitutions); }
                });
            });
          });
      }
    });
});

module.exports = getAllUserInstitutions;
