import { initializeApp, getApp } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDi1-AFsoyO_m1F4u46KGnKm0sdksg7bUM",
  projectId: "smartpaymoney-a725e",
  storageBucket: "smartpaymoney-a725e.firebasestorage.app",
  messagingSenderId: "75934719883",
  appId: "1:75934719883:android:089d215326cac52117998e",
};

const app = getApp() || initializeApp(firebaseConfig); // 

