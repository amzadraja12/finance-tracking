import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';

// TODO: Replace these with your Firebase project config from:
// https://console.firebase.google.com/u/2/project/rajshree-tracker/settings/general
const firebaseConfig = {
  apiKey: "AIzaSyDwsd57oK4CWZKNrdDIctn8VS-8nuxGbi0",
  authDomain: "rajshree-tracker.firebaseapp.com",
  projectId: "rajshree-tracker",
  storageBucket: "rajshree-tracker.firebasestorage.app",
  messagingSenderId: "278036492751",
  appId: "1:278036492751:web:e2110bad300bb221b6a2ba",
  measurementId: "G-2B6TM1XG9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();
