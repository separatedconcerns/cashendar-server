const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');
const axios = require('axios');

const plaidWebHook = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const itemId = request.body.item_id;
  const webHookCode = request.body.webhook_code;
  const newTransactions = request.body.new_transactions;
  console.log('WEBHOOK HIT:', itemId, webHookCode, newTransactions);

  if (webHookCode === 'INITIAL_UPDATE') {
    response.end();
  } else {
    const ref = admin.database().ref(`items/${itemId}`);
    ref.once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          const config = {
            url: `${process.env.HOST}getTransactionsFromPlaid`,
            payload: {
              access_token: snapshot.val().access_token,
              uniqueUserId: snapshot.val().uniqueUserId,
              newTransactions,
            },
          };
          axios.post(config.url, config.payload)
            .then((datesToSchedule) => {
              admin.database()
                .ref(`users/${config.payload.uniqueUserId}/scheduledEvents`)
                .once('value')
                .then((userSnapshot) => {
                  if (userSnapshot.exists()) {
                    const scheduledEvents = userSnapshot.val().scheduledEvents;
                    const eventsToDelete = [];

                    for (let i = 0; i < datesToSchedule.length; i += 1) {
                      const date = datesToSchedule[i];
                      if (scheduledEvents[date]) {
                        eventsToDelete.push(scheduledEvents[date]);
                      }
                      if (i === datesToSchedule.length - 1) {
                        return eventsToDelete;
                      }
                    }
                  }
                })

            })
            .then(() => {
              axios.post(`${process.env.HOST}addCalendarEvents`, config.payload)
                .then(response.end());
            });
        } else {
          response.end();
        }
      });
  }
});

module.exports = plaidWebHook;
