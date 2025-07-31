import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyARm7TZJNih9r7eGnkuvAHouSK3clw0ibk",
  authDomain: "mealmuse-f74k5.firebaseapp.com",
  projectId: "mealmuse-f74k5",
  storageBucket: "mealmuse-f74k5.firebasestorage.app",
  messagingSenderId: "833047350413",
  appId: "1:833047350413:web:ad67bd70df93bf5403e6c4",
  measurementId: ""
};

// Initialize Firebase
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
}

export { firebaseApp };
