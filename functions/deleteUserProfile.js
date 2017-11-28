const user = require('./controllers/userController');
const item = require('./controllers/itemController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

function deleteUserProfile(request, response) {
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
}

const deleteBankItems = (uniqueUserId) => {
  user.getUserItems(uniqueUserId)
    .then((itemsObj) => {
      if (itemsObj !== null) {
        const allItems = Object.keys(itemsObj);
        allItems.forEach((currentItem) => {
          item.getItemFromDB(currentItem)
            .then((itemData) => {
              const config = {
                url: `${process.env.HOST}deleteItem`,
                payload: {
                  itemToDelete: currentItem,
                  access_token: itemData.access_token,
                },
              };
              axios.post(config.url, config.payload)
                .then(plaidRes => console.log('29', plaidRes.data));
            });
        });
      }
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

