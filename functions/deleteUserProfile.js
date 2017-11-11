const functions = require('firebase-functions');
const user = require('./controllers/userController');
const item = require('./controllers/itemController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

const deleteUserProfile = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const idToken = request.body.idToken;
  let uniqueUserId;

  verifyIdToken(idToken).then((result) => {
    uniqueUserId = result;
  })
    .then(() => {
      deleteBankItems(uniqueUserId);
    })
    .then(() => {
      deleteCalendar(uniqueUserId);
    })
    .then(() => {
      user.deleteUserInAuth(uniqueUserId)
        .then(response.end('Profile Deleted'));
    })
    .catch(e => console.log(e));
});

const deleteBankItems = (uniqueUserId) => {
  user.getUserItems(uniqueUserId)
    .then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        item.getItemFromDB(childSnapshot.val())
          .then((itemData) => {
            const config = {
              url: `${process.env.HOST}deleteItem`,
              payload: {
                access_token: itemData.access_token,
              },
            };
            axios.post(config.url, config.payload)
              .then(plaidRes => console.log('29', plaidRes.data));
          })
          .then(() => item.deleteItemFromDB(childSnapshot.val()));
      });
    });
};

const deleteCalendar = (uniqueUserId) => {
  user.getUserFromDB(uniqueUserId)
    .then((userData) => {
      const config = {
        url: `${process.env.HOST}deleteCalendar`,
        payload: {
          calendarId: userData.calendarId,
          OAuthToken: userData.OAuthToken,
        },
      };
      axios.post(config.url, config.payload)
        .then(response => console.log('62 Gcal Deletion Response', response.data))
        .then(user.deleteUserFromDB(uniqueUserId));
    });
};


module.exports = deleteUserProfile;
