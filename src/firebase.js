import firebase from 'firebase';

var config = {
  apiKey: "AIzaSyCERMzZpqxMJ_UVc7ZpSBfpFt_fxjGFLmA",
  authDomain: "ttp-fs-20c6a.firebaseapp.com",
  databaseURL: "https://ttp-fs-20c6a.firebaseio.com",
  projectId: "ttp-fs-20c6a",
  storageBucket: "ttp-fs-20c6a.appspot.com",
  messagingSenderId: "56718974801"
};

firebase.initializeApp(config);
export default firebase;
