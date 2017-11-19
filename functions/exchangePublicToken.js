const user = require('./controllers/userController');
const item = require('./controllers/itemController');
const verifyIdToken = require('./utils/verifyIdToken.js');
const plaidClient = require('./apiClients/plaidClient.js');

function exchangePublicToken(request, response) {
  const publicToken = request.body.publicToken;
  const idToken = request.body.idToken;
  const institutionName = request.body.institution;

  Promise.all([verifyIdToken(idToken), plaidClient.exchangePublicToken(publicToken)])
    .then((results) => {
      const uniqueUserId = results[0];
      const plaidResponse = results[1];
      return Promise.all([
        user.addItemsToUser(uniqueUserId, plaidResponse.item_id, institutionName),
        item.addDataToItem(plaidResponse.item_id, { access_token: plaidResponse.access_token, uniqueUserId }),
        user.updateUser(uniqueUserId, { fetchingBanks: true })]);
    })
    .then(response.end())
    .catch(error => console.log(error));
}

module.exports = exchangePublicToken;
