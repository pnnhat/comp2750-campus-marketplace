// js/index.js
// Home page logic — requires auth, displays user info, handles sign out.

import { requireAuth, handleSignOut } from "./auth-guard.js";

// Require authentication before showing the page
requireAuth((user) => {
  // Display full email in navbar
  const emailEl = document.getElementById("user-email");
  if (emailEl) emailEl.textContent = user.email;

  // Display name portion of email as greeting
  const greetingEl = document.getElementById("user-greeting");
  if (greetingEl) greetingEl.textContent = `Hey, ${user.email.split("@")[0]}`;
});

// Sign out on button click
document.getElementById("signout-btn")?.addEventListener("click", handleSignOut);
