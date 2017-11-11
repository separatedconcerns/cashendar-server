const admin = require('../apiClients/firebaseClient');

// const itemRef = (itemId) => {
//   admin.database().ref(`items/${itemId}`);
// };

const deleteItemFromDB = itemId =>
  new Promise((resolve, reject) => {
    admin.database().ref(`items/${itemId}`).remove()
      .then(resolve())
      .catch(err => reject(err));
  });

// const getItemFromDB = itemId =>
//   new Promise((resolve, reject) => {
//     admin.database()
//       .ref(`items/${itemId}`)
//       .once('value')
//       .then((snapshot) => {
//         console.log('20', snapshot.val());
//         resolve(snapshot.val());
//       })
//       .catch(err => reject(err));
//   });


module.exports = {
  deleteItemFromDB,
};
