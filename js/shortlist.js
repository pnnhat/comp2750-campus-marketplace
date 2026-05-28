// js/shortlist.js
// Loads the user's shortlisted items from Firestore and handles removal.

import { requireAuth, handleSignOut } from "./auth-guard.js";
import { db } from "./firebase-config.js";
import {
  collection, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Require authentication before showing the page
requireAuth(async (user) => {
  // Display the signed-in user's email in the navbar
  const emailEl = document.getElementById("user-email");
  if (emailEl) emailEl.textContent = user.email;

  // Wire up sign out button
  document.getElementById("signout-btn")?.addEventListener("click", handleSignOut);

  // Load the user's shortlisted items from Firestore
  await loadShortlist(user.uid);
});

// Query and render all items in the user's shortlist
async function loadShortlist(userUID) {
  const grid = document.getElementById("shortlist-grid");
  grid.innerHTML = "";

  // Get all docs from the user's shortlist subcollection
  const snapshot = await getDocs(collection(db, "shortlists", userUID, "items"));

  if (snapshot.empty) {
    showEmptyState();
    return;
  }

  // Hide empty state and render cards
  document.getElementById("empty-state").style.display = "none";
  grid.style.display = "";
  snapshot.forEach(docSnap => renderCard(docSnap.id, docSnap.data(), userUID));
}

// Build and inject a card for a shortlisted item
function renderCard(id, data, userUID) {
  const grid = document.getElementById("shortlist-grid");
  const badgeClass = `badge-${(data.category || "").toLowerCase()}`;

  const priceHTML = data.price === "Trade"
    ? `<div class="item-card-price trade">Trade</div>`
    : `<div class="item-card-price">${data.price.startsWith("$") ? data.price : "$" + data.price}</div>`;

  const card = document.createElement("div");
  card.className = "item-card";
  card.id = `card-${id}`;
  card.innerHTML = `
    ${data.imageURL
      ? `<img src="${data.imageURL}" class="item-card-img" alt="${data.title}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
         <div class="item-img-placeholder" style="display:none;"></div>`
      : `<div class="item-img-placeholder"></div>`}
    <div class="item-card-body">
      <span class="badge ${badgeClass}">${data.category}</span>
      <div class="item-card-name">${data.title}</div>
      <div class="item-card-desc">${data.description}</div>
      ${priceHTML}
      <div class="item-card-seller">${data.sellerEmail}</div>
      <button class="remove-btn" id="remove-btn-${id}">Remove</button>
    </div>
  `;

  // Wire up remove button for this card
  card.querySelector(`#remove-btn-${id}`).addEventListener("click", () => {
    removeFromShortlist(userUID, id);
  });

  grid.appendChild(card);
}

// Delete a shortlist entry from Firestore and update the DOM
async function removeFromShortlist(userUID, listingId) {
  // Delete the shortlist document from Firestore
  await deleteDoc(doc(db, "shortlists", userUID, "items", listingId));

  // Remove the card from the DOM
  document.getElementById(`card-${listingId}`)?.remove();

  // Show empty state if no cards remain in the grid
  const grid = document.getElementById("shortlist-grid");
  if (!grid.querySelector(".item-card")) {
    showEmptyState();
  }
}

function showEmptyState() {
  document.getElementById("shortlist-grid").style.display = "none";
  document.getElementById("empty-state").style.display = "";
}
