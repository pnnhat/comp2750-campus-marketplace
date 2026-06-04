================================================================
COMP2750 - Applications Modelling and Development
Assessment Task 3 - Campus Marketplace
================================================================

HOW TO RUN THE APPLICATION
----------------------------------------------------------------
1. Unzip the project folder
2. Open the folder in VS Code
3. Right-click login.html and select "Open with Live Server"
4. The app will open in your browser at localhost:5500

================================================================
FIREBASE CONFIGURATION
----------------------------------------------------------------
js/firebase-config.js is included in this zip file.
The Firebase configuration is also listed below for reference:

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2TPi8Aa-J8vE49GZV620l0DZ1rRpcgJQ",
  authDomain: "comp2750-campus-marketpl-8fd5f.firebaseapp.com",
  projectId: "comp2750-campus-marketpl-8fd5f",
  storageBucket: "comp2750-campus-marketpl-8fd5f.firebasestorage.app",
  messagingSenderId: "683925480377",
  appId: "1:683925480377:web:7b4d085e0d9365b0944c68"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

================================================================
TEST USER ACCOUNTS
----------------------------------------------------------------
All accounts use the same password: Campus123!

Email: ngocnhat.pham@students.mq.edu.au
Password: Campus123!

Email: katrina.lopez@students.mq.edu.au
Password: Campus123!

Email: kathleen.obcemane@students.mq.edu.au
Password: Campus123!

Email: mia.credaro@students.mq.edu.au
Password: Campus123!

================================================================
PROJECT STRUCTURE
----------------------------------------------------------------
comp2750-campus-marketplace/
├── login.html          Sign in page
├── index.html          Home page (after sign in)
├── marketplace.html    Browse all listings
├── mylistings.html     View and manage own listings
├── shortlist.html      View shortlisted items
├── css/
│   └── style.css       All styles
├── js/
│   ├── firebase-config.js    Firebase setup
│   ├── auth-guard.js         Authentication utility
│   ├── theme.js              Light/dark/system theme toggle
│   ├── index.js              Home page logic
│   ├── marketplace.js        Marketplace logic
│   ├── mylistings.js         My Listings logic
│   └── shortlist.js          Shortlist logic
└── assets/             MQ logo and other assets

================================================================
NOTES
----------------------------------------------------------------
- js/firebase-config.js is included in this zip file.
  The Firebase configuration is also listed above
  for reference.
- The app requires an internet connection to connect
  to Firebase Authentication, Firestore, and Storage.
- All listing data is stored in Firebase Firestore.
- Item images uploaded via the app are stored in
  Firebase Storage.
================================================================