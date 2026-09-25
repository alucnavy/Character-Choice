const firebaseConfig = {
  apiKey: "AIzaSyBjS2SAE4PvYfzji7LqHs890DgMI5f94O4",
  authDomain: "character-choice7.firebaseapp.com",
  projectId: "character-choice7",
  storageBucket: "character-choice7.firebasestorage.app",
  messagingSenderId: "843163995084",
  appId: "1:843163995084:web:ad2dcdf2a23cfd96632b69"
};

if (!window.firebaseApp) {
  window.firebaseApp = firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(firebaseConfig);
}

if (!window.db) {
  window.db = firebase.firestore(window.firebaseApp);
}

window.firestoreReady = !!window.db;
