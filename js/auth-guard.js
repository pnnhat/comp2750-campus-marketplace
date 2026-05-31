// auth-guard.js
// Shared authentication utility used by all protected pages.
// Exports two functions:
//   requireAuth(callback) - checks if a user is signed in,
//     redirects to login.html if not, or calls callback with the user object
//   handleSignOut() - signs the user out and redirects to login.html

import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Check authentication state on page load.
// If no user is signed in, redirect immediately to login.
// If signed in, pass the user object to the page's callback function.
export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    callback(user);
  });
}

// Sign the current user out of Firebase Auth.
// On success, redirect to the login page.
// On error, log the error to the console.
export function handleSignOut() {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
}
