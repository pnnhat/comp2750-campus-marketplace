// auth-guard.js
// Redirects unauthenticated users to login.html on every protected page.
// Import this module on: index.html, marketplace.html, mylistings.html, shortlist.html

import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

/** Returns the currently signed-in Firebase user (may be null during init). */
export function getCurrentUser() {
  return auth.currentUser;
}
