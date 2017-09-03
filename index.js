const axios = require('axios');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.addMessage = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const username = request.body.username;
  const currentItem = request.body.currentItem;
  admin.database()
  .ref('/items')
  .push({username: username, currentItem: currentItem})
  .then(() => {
    response.sendStatus(201);
  });
});

exports.returnMessages = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const itemsRef = admin.database().ref('items');
  itemsRef.on('value', (snapshot) => {
    let items = snapshot.val();
    let newState = [];
    for (let item in items) {
      newState.push({
        id: item,
        currentItem: items[item].currentItem,
        username: items[item].username
      });
    }
    response.status(201).send(newState);
  });
});
