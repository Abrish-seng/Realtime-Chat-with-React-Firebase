// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU-1GtSK3Nno-3n75eBZuIc_XPs41433s",
  authDomain: "smart-chat-a23ae.firebaseapp.com",
  projectId: "smart-chat-a23ae",
  storageBucket: "smart-chat-a23ae.firebasestorage.app",
  messagingSenderId: "15011136160",
  appId: "1:15011136160:web:e55bf69ad01d860c673fc5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth()
export const db =getFirestore()
export const storage =getStorage()