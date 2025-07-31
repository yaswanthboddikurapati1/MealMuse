import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  "projectId": "mealmuse-f74k5",
  "appId": "1:833047350413:web:ad67bd70df93bf5403e6c4",
  "storageBucket": "mealmuse-f74k5.firebasestorage.app",
  "apiKey": "AIzaSyARm7TZJNih9r7eGnkuvAHouSK3clw0ibk",
  "authDomain": "mealmuse-f74k5.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "833047350413"
};

// Initialize Firebase
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
}

export { firebaseApp };
