import firebase from 'firebase';
import creds from './creds.json';

// Initialize Firebase
const config = {
  apiKey: creds.REACT_APP_FIREBASE_API_KEY,
  authDomain: creds.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: creds.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: creds.REACT_APP_FIREBASE_PROJECT_ID,
};

firebase.initializeApp(config);
export const provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar');
export const auth = firebase.auth();
export default firebase;
