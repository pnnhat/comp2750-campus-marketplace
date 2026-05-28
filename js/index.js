import { requireAuth, handleSignOut } from "./auth-guard.js";

// Wait for auth state — redirect to login if not signed in
requireAuth((user) => {
  // Display full email in navbar
  document.getElementById("user-email").textContent = user.email;

  // Display name (part before @) in hero greeting
  const name = user.email.split("@")[0];
  document.getElementById("user-greeting").textContent = `Hey, ${name} 👋`;

  // Wire sign out button
  document.getElementById("signout-btn").addEventListener("click", handleSignOut);
});
