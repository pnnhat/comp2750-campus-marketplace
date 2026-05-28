// js/auth-guard.js
// Imported by every protected page (index, marketplace, mylistings, shortlist).
// Redirects unauthenticated users to login.html immediately.
// All page logic must go INSIDE the onAuthStateChanged callback — never outside it.

import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Redirect to login if not signed in
// Calls the provided callback with the user object if signed in
export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    callback(user);
  });
}

// Sign out and redirect to login
export function handleSignOut() {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
}
