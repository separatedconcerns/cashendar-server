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
	response.set('Access-Control-Allow-Origin', "*");
  response.set('Access-Control-Allow-Methods', 'GET, POST');
	response.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
 	response.send('string from byeWorld');
});