
const admin = require('../apiClients/firebaseClient.js');
const axios = require('axios');
const google = require('googleapis');
const Promise = require('bluebird');
const googleClient = require('./apiClients/googleClient.js');

const deleteDuplicateEventsFlow = (uniqueUserId) => {
  admin.database()
    .ref(`users/${uniqueUserId}/datesToSchedule`)
    .once('value')
    .then((snapshot) => {
      return {
        url: `${process.env.HOST}getExistingEvents`,
        payload: {
          datesToSchedule: snapshot.val(),
          uniqueUserId,
        },
      };
    })
    .then((config) => {
     return { axios.post(config.url, config.payload)
        .then((existingEvents) => {
          return existingEvents
        }), }
    });
};

module.exports = deleteDuplicateEventsFlow;