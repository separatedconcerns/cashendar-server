const user = require('./controllers/userController');
const item = require('./controllers/itemController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const plaidClient = require('./apiClients/plaidClient.js');

function exchangePublicToken(request, response) {
  const publicToken = request.body.publicToken;
  const idToken = request.body.idToken;
  const institutionName = request.body.institution;
  let uniqueUserId;

  verifyIdToken(idToken).then((result) => {
    uniqueUserId = result;
  });

  plaidClient.exchangePublicToken(publicToken)
    .then((successResponse) => {
      const payload = {
        itemId: successResponse.item_id,
        access_token: successResponse.access_token,
        request_id: successResponse.request_id,
      };
      user.addItemsToUser(uniqueUserId, payload.itemId, institutionName);
      item.addDataToItem(payload.itemId, { access_token: payload.access_token, uniqueUserId });
    })
    .then(() => {
      // set bool to indicate data is being fetched from Plaid
      user.updateUser(uniqueUserId, { fetchingBanks: true })
        .then(response.end());
    })
    .catch(error => console.log(error));
}

module.exports = exchangePublicToken;
