import { addDataToItem } from './controllers/itemController';
import { verifyIdToken, addItemsToUser, updateUser } from './controllers/userController';
import * as plaidClient from './apiClients/plaidClient';

function exchangePublicToken(request, response) {
  const publicToken = request.body.publicToken;
  const idToken = request.body.idToken;
  const institutionName = request.body.institution;
  const webhook = request.body.webhook;
  let uniqueUserId;

  Promise.all([
    verifyIdToken(idToken),
    plaidClient.exchangePublicToken(publicToken)])
    .then((result) => {
      uniqueUserId = result[0];
      const payload = result[1];
      return Promise.all([
        addItemsToUser(uniqueUserId, payload.item_id, institutionName),
        addDataToItem(payload.item_id, { access_token: payload.access_token, webhook, uniqueUserId }),
        updateUser(uniqueUserId, { fetchingBanks: true })]);
    })
    .then(() => response.end())
    .catch(error => console.log(error));
}

export default exchangePublicToken;
