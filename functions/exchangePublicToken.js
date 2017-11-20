const user = require('./controllers/userController');
const item = require('./controllers/itemController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const plaidClient = require('./apiClients/plaidClient.js');

function exchangePublicToken(request, response) {
  const publicToken = request.body.publicToken;
  const idToken = request.body.idToken;
  const institutionName = request.body.institution;
  const webhook = request.body.webhook;

  Promise.all([verifyIdToken(idToken), plaidClient.exchangePublicToken(publicToken)])
    .then((results) => {
      const uniqueUserId = results[0];
      const itemId = results[1].item_id;
      const accessToken = results[1].access_token;
      return Promise.all([
        user.addItemsToUser(uniqueUserId, itemId, institutionName),
        item.addDataToItem(itemId, { accessToken, uniqueUserId, webhook }),
        user.updateUser(uniqueUserId, { fetchingBanks: true })]);
    })
    .then(response.end())
    .catch(error => console.log(error));
}

module.exports = exchangePublicToken;
