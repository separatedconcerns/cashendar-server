import { post } from 'axios';
import { verifyIdToken, getUserItems, getUserFromDB, deleteUserFromDB } from './controllers/userController';
import { getItemFromDB } from './controllers/itemController';
import { HOST } from './creds.json';
import deleteGoogleCalendar from './deleteCalendar';


const deleteBankItems = async (uniqueUserId) => {
  try {
    const itemsObj = await getUserItems(uniqueUserId);
    if (itemsObj !== 'null') {
      const allItems = Object.keys(itemsObj);
      allItems.forEach((currentItem) => {
        getItemFromDB(currentItem)
          .then((itemData) => {
            const config = {
              url: `${HOST}deleteItem`,
              payload: {
                itemToDelete: currentItem,
                accessToken: itemData.access_token,
              },
            };
            post(config.url, config.payload)
              .then(plaidRes => console.log('29', plaidRes.data));
          });
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteCalendar = async (uniqueUserId) => {
  const userData = await getUserFromDB(uniqueUserId).catch(error => console.log(error));
  const calendarId = userData.calendarId;
  const OAuthToken = userData.OAuthToken;
  deleteGoogleCalendar(OAuthToken, calendarId);
};

export default async function deleteUserProfile(request, response) {
  const idToken = request.body.idToken;
  let uniqueUserId;
  try {
    uniqueUserId = await verifyIdToken(idToken);
    await deleteBankItems(uniqueUserId);
    await deleteCalendar(uniqueUserId);
    await deleteUserFromDB(uniqueUserId);
  } catch (error) {
    console.log(error);
  }
  response.end('Profile Deleted');
}
