const user = require('./controllers/userController');
const item = require('./controllers/itemController');
const plaidClient = require('./apiClients/plaidClient.js');

function exchangePublicToken(request, response) {
  const publicToken = request.body.publicToken;
  const idToken = request.body.idToken;
  const institutionName = request.body.institution;
  const webhook = request.body.webhook;
  let uniqueUserId;

  Promise.all([
    user.verifyIdToken(idToken),
    plaidClient.exchangePublicToken(publicToken)])
    .then((result) => {
      uniqueUserId = result[0];
      const payload = result[1];
      return Promise.all([
        user.addItemsToUser(uniqueUserId, payload.item_id, institutionName),
        item.addDataToItem(payload.item_id, { access_token: payload.access_token, webhook, uniqueUserId }),
        user.updateUser(uniqueUserId, { fetchingBanks: true })]);
    })
    .then(() => response.end())
    .catch(error => console.log(error));
}

module.exports = exchangePublicToken;
