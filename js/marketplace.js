// js/marketplace.js
// Loads marketplace listings from Firestore and handles shortlisting.

import { requireAuth, handleSignOut } from "./auth-guard.js";
import { db } from "./firebase-config.js";
import {
  collection, query, where, getDocs,
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Require authentication before showing the page
requireAuth(async (user) => {
  // Display the signed-in user's email in the navbar
  const emailEl = document.getElementById("user-email");
  if (emailEl) emailEl.textContent = user.email;

  // Wire up sign out button
  document.getElementById("signout-btn")?.addEventListener("click", handleSignOut);

  // Load marketplace listings from Firestore
  await loadMarketplaceItems(user);

  // Set up category filter chips after cards are rendered
  initFilterChips();
});

// ── Category filter chips ─────────────────────────────────────────────────


// ── Shortlist button toggling (static UI — Firebase write added in Phase 2) ─
// initShortlistButtons removed — handled by renderCard()</nfunction initShortlistButtons_REMOVED() {
  // TODO: Firebase — setDoc to shortlists/{uid}/items/{listingId}


// ── Sign out ──────────────────────────────────────────────────────────────
// Query listings where the seller is not the current user
async function loadMarketplaceItems(user) {
  const grid = document.getElementById("listings-grid");
  const q = query(
    collection(db, "listings"),
    where("sellerUID", "!=", user.uid)
  );
  const snapshot = await getDocs(q);
  grid.innerHTML = "";
  if (snapshot.empty) {
    grid.innerHTML = '<p class="empty-grid-msg">No items available right now.</p>';
    return;
  }
  for (const docSnap of snapshot.docs) {
    await renderCard(docSnap.id, docSnap.data(), user.uid);
  }
}

async function renderCard(id, data, userUID) {
  const grid = document.getElementById("listings-grid");
  const isShortlisted = await checkIfShortlisted(userUID, id);
  const priceHTML = data.price === "Trade"
    ? `<div class="item-card-price trade">Trade</div>`
    : `<div class="item-card-price">${data.price.startsWith("$") ? data.price : "$" + data.price}</div>`;
  const badgeClass = `badge-${(data.category || "").toLowerCase()}`;
  const card = document.createElement("div");
  card.className = "item-card";
  card.id = `card-${id}`;
  card.dataset.category = data.category || "";
  card.innerHTML = `
    ${data.imageURL ? `<img src="${data.imageURL}" class="item-card-img" alt="${data.title}" onerror="this.style.display='none'">` : ""}
    <div class="item-card-body">
      <span class="badge ${badgeClass}">${data.category}</span>
      <div class="item-card-name">${data.title}</div>
      <div class="item-card-desc">${data.description}</div>
      ${priceHTML}
      <div class="item-card-seller">${data.sellerEmail}</div>
      <button class="shortlist-btn ${isShortlisted ? "shortlisted" : ""}"
              id="shortlist-btn-${id}"
              ${isShortlisted ? "disabled" : ""}>
        ${isShortlisted ? "♥ Shortlisted" : "♡ Shortlist"}
      </button>
    </div>
  `;
  if (!isShortlisted) {
    card.querySelector(`#shortlist-btn-${id}`).addEventListener("click", () => {
      addToShortlist(userUID, id, data);
    });
  }
  grid.appendChild(card);
}

async function checkIfShortlisted(userUID, listingId) {
  const ref = doc(db, "shortlists", userUID, "items", listingId);
  const snap = await getDoc(ref);
  return snap.exists();
}

async function addToShortlist(userUID, listingId, data) {
  const ref = doc(db, "shortlists", userUID, "items", listingId);
  const existing = await getDoc(ref);
  if (existing.exists()) return;
  await setDoc(ref, {
    title: data.title, description: data.description, price: data.price,
    category: data.category, imageURL: data.imageURL || "",
    sellerEmail: data.sellerEmail, addedAt: serverTimestamp()
  });
  const btn = document.getElementById(`shortlist-btn-${listingId}`);
  if (btn) { btn.textContent = "♥ Shortlisted"; btn.classList.add("shortlisted"); btn.disabled = true; }
}

function initFilterChips() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const selected = btn.dataset.category;
      document.querySelectorAll(".item-card").forEach(card => {
        const match = selected === "all" || card.dataset.category === selected;
        card.style.display = match ? "" : "none";
      });
    });
  });
}
