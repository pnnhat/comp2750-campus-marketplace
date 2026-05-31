// index.js
// Controls the home page (index.html).
// Checks authentication, displays the signed-in user's name,
// and wires up the sign out button.

import { requireAuth, handleSignOut } from "./auth-guard.js";

// Wait for auth state — redirect to login if not signed in
requireAuth((user) => {
  // Display full email in navbar
  document.getElementById("user-email").textContent = user.email;

  // Extract the last name from the email address.
  // For example: ngocnhat.pham@students.mq.edu.au becomes "Pham"
  // If the email has no dot prefix, capitalise the whole prefix instead.
  const emailPrefix = user.email.split("@")[0];
  const parts = emailPrefix.split(".");
  const lastName = parts.length > 1
    ? parts[parts.length - 1].charAt(0).toUpperCase()
      + parts[parts.length - 1].slice(1)
    : emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  document.getElementById("user-greeting").textContent =
    `Welcome back, ${lastName}.`;

  // Wire the sign out button to the shared handleSignOut function.
  document.getElementById("signout-btn").addEventListener("click", handleSignOut);
});
