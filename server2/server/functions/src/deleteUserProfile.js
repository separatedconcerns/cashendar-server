import { post } from 'axios';
import { verifyIdToken, getUserItems, getUserFromDB, deleteUserFromDB } from './controllers/userController';
import { getItemFromDB } from './controllers/itemController';
import { HOST } from './creds.json';
import deleteGoogleCalendar from './deleteCalendar';

function deleteUserProfile(request, response) {
  const idToken = request.body.idToken;
  let uniqueUserId;

  verifyIdToken(idToken)
    .then((result) => { uniqueUserId = result; })
    .then(() => deleteBankItems(uniqueUserId))
    .then(() => deleteCalendar(uniqueUserId))
    .then(() => response.end('Profile Deleted'))
    .catch(e => console.log(e));

  const deleteBankItems = (uniqueUserId) => {
    getUserItems(uniqueUserId)
      .then((itemsObj) => {
        if (itemsObj !== null) {
          const allItems = Object.keys(itemsObj);
          allItems.forEach((currentItem) => {
            getItemFromDB(currentItem)
              .then((itemData) => {
                const config = {
                  url: `${HOST}deleteItem`,
                  payload: {
                    itemToDelete: currentItem,
                    access_token: itemData.access_token,
                  },
                };
                post(config.url, config.payload)
                  .then(plaidRes => console.log('29', plaidRes.data));
              });
          });
        }
      });
  };

  const deleteCalendar = (uniqueUserId) => {
    getUserFromDB(uniqueUserId)
      .then((userData) => {
        const calendarId = userData.calendarId;
        const OAuthToken = userData.OAuthToken;
        deleteGoogleCalendar(OAuthToken, calendarId)
          .then(deleteUserFromDB(uniqueUserId));
      });
  };
}


export default deleteUserProfile;

