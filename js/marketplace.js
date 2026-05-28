// marketplace.js
// Handles category filter chips and shortlist button toggling.
// Firebase integration (auth guard, Firestore queries) is added in Phase 2.

// ── TODO: Firebase Integration ────────────────────────────────────────────
// import { auth, db } from "./firebase-config.js";
// import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import {
//   collection, getDocs, query, where,
//   setDoc, getDoc, doc
// } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
//
// onAuthStateChanged(auth, (user) => {
//   if (!user) { window.location.href = "login.html"; return; }
//   document.getElementById("nav-user-email").textContent = user.email;
//   loadMarketplaceListings(user);
// });
//
// async function loadMarketplaceListings(user) {
//   // Query: all listings where sellerUID != user.uid
//   const q = query(collection(db, "listings"), where("sellerUID", "!=", user.uid));
//   const snapshot = await getDocs(q);
//   // Clear static HTML, render cards dynamically
// }
// ─────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initFilterChips();
  initShortlistButtons();
  initSignOut();
});

// ── Category filter chips ─────────────────────────────────────────────────
function initFilterChips() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterCards(chip.dataset.category);
    });
  });
}

function filterCards(category) {
  document.querySelectorAll('.item-card').forEach(card => {
    const match = category === 'all' || card.dataset.category === category;
    card.style.display = match ? '' : 'none';
  });
}

// ── Shortlist button toggling (static UI — Firebase write added in Phase 2) ─
function initShortlistButtons() {
  document.querySelectorAll('.shortlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // TODO: Firebase — setDoc to shortlists/{uid}/items/{listingId}
      btn.classList.add('shortlisted');
      btn.textContent = '♥ Shortlisted';
      btn.disabled = true;
    });
  });
}

// ── Sign out ──────────────────────────────────────────────────────────────
function initSignOut() {
  document.getElementById('sign-out-btn')?.addEventListener('click', () => {
    // TODO: import signOut from firebase-auth and call signOut(auth)
    window.location.href = 'login.html';
  });
}
