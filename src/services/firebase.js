// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDz7OAnQ0FP2mEjk0zvo_aL9rfK0GLF4cM",
  authDomain: "zadzaqr.firebaseapp.com",
  databaseURL: "https://zadzaqr-default-rtdb.firebaseio.com",
  projectId: "zadzaqr",
  storageBucket: "zadzaqr.firebasestorage.app",
  messagingSenderId: "1019651903370",
  appId: "1:1019651903370:web:e4ed3838d1c5ce4655c273",
  measurementId: "G-R2CJSQZE9M"
};

const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export services and auth functions
export { 
  auth, 
  db, 
  storage,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
};
export default app;