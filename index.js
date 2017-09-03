const axios = require('axios');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const cors = require('cors')({
	origin: true
});

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
exports.addMessage = functions.https.onRequest((req, res) => {
	// res.header("Access-Control-Allow-Origin", "*");
  // res.header('Access-Control-Allow-Methods', 'GET, POST');
	// res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
	cors((req, res, () => {
		const original = req.body;
		const title = req.body.title;
		const user = req.body.user;
		admin.database().ref('items').push({'title': title, 'user': user}).then(snapshot => {
			res.redirect(303, snapshot.ref);
		});
  }));
});

exports.returnMessages = functions.https.onRequest((request, response) => {
	response.set('Access-Control-Allow-Origin', "*");
  response.set('Access-Control-Allow-Methods', 'GET, POST');
	response.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
 	response.send('string from byeWorld');
});