const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');

const getAllUserInstitutions = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  const allInstitutions = {};
  let counter = 0;
  let total;

  admin.database()
    .ref(`users/${uniqueUserId}/items`)
    .once('value')
    .then((snapshot) => {
      total = Object.keys(snapshot.val()).length;
      snapshot.forEach((childSnap) => {
        admin.database()
          .ref(`items/${childSnap.key}/institutionName`)
          .once('value')
          .then((snap) => {
            const institution = snap.val();
            allInstitutions[institution] = true;
            counter++;
            if (counter === total) { response.json(allInstitutions); }
          });
      });
    });
});

module.exports = getAllUserInstitutions;
