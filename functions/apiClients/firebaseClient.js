const admin = require('firebase-admin');
const creds = require('../creds.json');

admin.initializeApp({
  credential: admin.credential.cert({
    type: creds.FIREBASE_TYPE,
    project_id: creds.FIREBASE_PROJECT_ID,
    private_key_id: creds.FIREBASE_PRIVATE_KEY_ID,
    private_key: creds.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: creds.FIREBASE_CLIENT_EMAIL,
    client_id: creds.FIREBASE_CLIENT_ID,
    auth_uri: creds.FIREBASE_AUTH_URI,
    token_uri: creds.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: creds.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: creds.FIREBASE_CLIENT_X509_CERT_URL,
  }),
  databaseURL: creds.FIREBASE_DATABASE_URL,
});

module.exports = admin;
