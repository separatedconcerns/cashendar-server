const user = require('./controllers/userController');
const item = require('./controllers/itemController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

function deleteUserProfile(request, response) {
  const idToken = request.body.idToken;

  verifyIdToken(idToken).then((result) => {
    const uniqueUserId = result;
    return Promise.all([
      deleteBankItems(uniqueUserId),
      deleteCalendar(uniqueUserId),
      user.deleteUserInAuth(uniqueUserId)]);
  }).then(response.end('Profile Deleted'))
    .catch(e => console.log(e));
}

const deleteBankItems = uniqueUserId => user.getUserItems(uniqueUserId)
  .then((itemsObj) => {
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
            .then(plaidRes => console.log(plaidRes.data));
        });
    });
  });

const deleteCalendar = uniqueUserId => user.getUserFromDB(uniqueUserId)
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

module.exports = deleteUserProfile;

