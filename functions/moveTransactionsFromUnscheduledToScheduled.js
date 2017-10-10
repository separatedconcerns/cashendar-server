const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');

const moveTransactionsFromUnscheduledToScheduled = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;

  admin.database()
    .ref(`users/${uniqueUserId}/items`)
    .once('value')
    .then(snapshot => Object.keys(snapshot.val()))
    .then((items) => {
      const numItems = items.length - 1;
      let counter = 0;
      items.forEach((item) => {
        const unscheduled = admin.database().ref(`items/${item}/unscheduled_transactions`);
        const scheduled = admin.database().ref(`items/${item}/scheduled_transactions`);
        unscheduled
          .once('value')
          .then((snapshot) => {
            const unscheduledObj = snapshot.val();
            scheduled
              .once('value')
              .then(unscheduledTransactions => unscheduledTransactions.exists())
              .then((exists) => {
                if (exists) {
                  const unscheduledKeys = Object.keys(unscheduledObj);
                  let insideCounter = unscheduledKeys.length;
                  unscheduledKeys.forEach((transactionId) => {
                    admin.database().ref(`items/${item}/scheduled_transactions/${transactionId}`)
                      .update(unscheduledObj[transactionId])
                      .then(insideCounter -= 1)
                      .catch(e => console.error(e));

                    if (insideCounter <= 0) {
                      unscheduled.remove()
                        .then(counter += 1)
                        .catch(e => console.error(e));
                    }
                  });
                } else {
                  scheduled
                    .set(unscheduledObj)
                    .then(unscheduled.remove())
                    .then(counter += 1)
                    .catch(e => console.error(e));
                }
              });
          });

        if (counter >= numItems) {
          response.end();
        }
      });
    });
});

module.exports = moveTransactionsFromUnscheduledToScheduled;
