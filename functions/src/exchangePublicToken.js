import { addDataToItem } from './controllers/itemController';
import { verifyIdToken, addItemsToUser, updateUser } from './controllers/userController';
import * as plaidClient from './apiClients/plaidClient';

async function exchangePublicToken(request, response) {
  const publicToken = request.body.publicToken;
  const idToken = request.body.idToken;
  const institutionName = request.body.institution;
  const webhook = request.body.webhook;

  try {
    const [uniqueUserId, payload] = await Promise.all([
      verifyIdToken(idToken),
      plaidClient.exchangePublicToken(publicToken),
    ]);
    await Promise.all([
      addItemsToUser(uniqueUserId, payload.item_id, institutionName),
      addDataToItem(payload.item_id, { access_token: payload.access_token, webhook, uniqueUserId }),
      updateUser(uniqueUserId, { fetchingBanks: true }),
    ]);
  } catch (error) {
    console.log(error);
  }
  response.end();
}

export default exchangePublicToken;
