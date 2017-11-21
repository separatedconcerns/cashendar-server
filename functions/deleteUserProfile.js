const user = require('./controllers/userController');
const item = require('./controllers/itemController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const axios = require('axios');

function deleteUserProfile(request, response) {
  const idToken = request.body.idToken;
  let uniqueUserId;

  verifyIdToken(idToken).then((result) => {
    uniqueUserId = result;
    return Promise.all([
      deleteBankItems(uniqueUserId),
      deleteCalendar(uniqueUserId),
      user.deleteUserInAuth(uniqueUserId)]);
  })
    .then(() => user.deleteUserFromDB(uniqueUserId))
    .then(() => response.end('Profile Deleted'))
    .catch(e => console.log(e));
}

const deleteBankItems = uniqueUserId => user.getUserItems(uniqueUserId)
  .then((itemsObj) => {
    const allItems = Object.keys(itemsObj);
    const allItemsPromiseArr = allItems.map(currentItem => item.getItemFromDB(currentItem)
      .then((itemData) => {
        const config = {
          url: `${process.env.HOST}deleteItem`,
          payload: {
            itemToDelete: currentItem,
            access_token: itemData.access_token,
          },
        };
        return axios.post(config.url, config.payload);
      })
      .then(plaidRes => console.log(plaidRes.data)));
    return Promise.all(allItemsPromiseArr);
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
    return axios.post(config.url, config.payload);
  })
  .then(response => console.log('62 Gcal Deletion Response', response.data));

module.exports = deleteUserProfile;

