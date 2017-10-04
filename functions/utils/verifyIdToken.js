const admin = require('../apiClients/firebaseClient.js');

const verifyIdToken = (idToken) => {
  let uniqueUserId;
  return admin.auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      uniqueUserId = decodedToken.uid;
      return uniqueUserId;
    })
    .catch(error => console.log(error));
};

module.exports = verifyIdToken;
