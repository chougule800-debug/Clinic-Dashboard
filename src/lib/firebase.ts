import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCzhL2zkIELm4nnZIUe5RGgUqxQoyFMjRc",
  authDomain: "ananyainfotech.firebaseapp.com",
  projectId: "ananyainfotech",
  storageBucket: "ananyainfotech.firebasestorage.app",
  messagingSenderId: "344860983480",
  appId: "1:344860983480:web:1feffdb17a99364dc6744d",
  measurementId: "G-ZN6WDXZQ39"
};

// Initialize Firebase safely (avoid re-initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore instance
export const db = getFirestore(app);
