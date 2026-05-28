import { requireAuth, handleSignOut } from "./auth-guard.js";

// Wait for auth state — redirect to login if not signed in
requireAuth((user) => {
  // Display full email in navbar
  document.getElementById("user-email").textContent = user.email;

  // Display last name from email in hero greeting
  const emailPrefix = user.email.split("@")[0];
  const parts = emailPrefix.split(".");
  const lastName = parts.length > 1
    ? parts[parts.length - 1].charAt(0).toUpperCase()
      + parts[parts.length - 1].slice(1)
    : emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  document.getElementById("user-greeting").textContent =
    `Welcome back, ${lastName}.`;

  // Wire sign out button
  document.getElementById("signout-btn").addEventListener("click", handleSignOut);
});
