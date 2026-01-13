import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCPy7waw3CgJobAYkkgjww02RyaR61u4KQ",
  authDomain: "studio-6574634930-513da.firebaseapp.com",
  projectId: "studio-6574634930-513da",
  storageBucket: "studio-6574634930-513da.firebasestorage.app",
  messagingSenderId: "514805444088",
  appId: "1:514805444088:web:72445471f4df1a233b7a0d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
