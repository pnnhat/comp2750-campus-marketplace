// js/marketplace.js
// Loads marketplace listings from Firestore and handles shortlisting.

import { requireAuth, handleSignOut } from "./auth-guard.js";
import { db } from "./firebase-config.js";
import {
  collection, query, where, getDocs,
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Module-level state for the open modal
let currentModalId = null;
let currentModalData = null;
let modalImages = [];
let modalCurrentIndex = 0;

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

  // Close modal on X button click
  document.getElementById("modal-close")
    .addEventListener("click", closeModal);

  // Close modal when clicking outside the container
  document.getElementById("item-modal")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("item-modal")) {
        closeModal();
      }
    });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});

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
  // Open modal on card click (but not when clicking the shortlist button)
  card.style.cursor = "pointer";
  card.addEventListener("click", (e) => {
    if (e.target.closest(".shortlist-btn")) return;
    openModal(id, data, userUID);
  });
  grid.appendChild(card);
}

async function checkIfShortlisted(userUID, listingId) {
  const ref = doc(db, "shortlists", userUID, "items", listingId);
  const snap = await getDoc(ref);
  return snap.exists();
}

function openModal(id, data, userUID) {
  currentModalId   = id;
  currentModalData = data;

  // Build images array — handle both formats
  if (data.imageURLs && data.imageURLs.length > 0) {
    modalImages = data.imageURLs;
  } else if (data.imageURL) {
    modalImages = [data.imageURL];
  } else {
    modalImages = [];
  }
  modalCurrentIndex = 0;

  // Populate details panel
  const badgeClass = `badge-${(data.category || "").toLowerCase()}`;
  document.getElementById("modal-badge").className =
    `badge modal-badge ${badgeClass}`;
  document.getElementById("modal-badge").textContent  = data.category;
  document.getElementById("modal-title").textContent  = data.title;
  document.getElementById("modal-desc").textContent   = data.description;
  document.getElementById("modal-seller").textContent =
    "Listed by " + data.sellerEmail;

  const priceEl = document.getElementById("modal-price");
  if (data.price === "Trade") {
    priceEl.textContent = "Trade";
    priceEl.className   = "modal-price trade";
  } else {
    priceEl.textContent = data.price.startsWith("$")
      ? data.price : "$" + data.price;
    priceEl.className = "modal-price";
  }

  // Set up image gallery
  const mainImg     = document.getElementById("modal-main-img");
  const placeholder = document.getElementById("modal-img-placeholder");

  if (modalImages.length > 0) {
    mainImg.src           = modalImages[0];
    mainImg.style.display = "block";
    placeholder.style.display = "none";
  } else {
    mainImg.style.display     = "none";
    placeholder.style.display = "flex";
  }

  // Show/hide arrows
  const showArrows = modalImages.length > 1;
  document.getElementById("modal-prev").style.display =
    showArrows ? "flex" : "none";
  document.getElementById("modal-next").style.display =
    showArrows ? "flex" : "none";

  // Wire arrow buttons
  document.getElementById("modal-prev").onclick = () => {
    modalCurrentIndex =
      (modalCurrentIndex - 1 + modalImages.length) % modalImages.length;
    showModalImage(modalCurrentIndex);
  };
  document.getElementById("modal-next").onclick = () => {
    modalCurrentIndex = (modalCurrentIndex + 1) % modalImages.length;
    showModalImage(modalCurrentIndex);
  };

  // Build thumbnails
  buildThumbnails();

  // Shortlist button state
  const shortlistBtn = document.getElementById("modal-shortlist-btn");
  checkIfShortlisted(userUID, id).then(isShortlisted => {
    if (isShortlisted) {
      shortlistBtn.textContent = "♥ Shortlisted";
      shortlistBtn.classList.add("shortlisted");
      shortlistBtn.disabled = true;
    } else {
      shortlistBtn.textContent = "♡ Shortlist";
      shortlistBtn.classList.remove("shortlisted");
      shortlistBtn.disabled = false;
      shortlistBtn.onclick = () => {
        addToShortlist(userUID, id, data);
        shortlistBtn.textContent = "♥ Shortlisted";
        shortlistBtn.classList.add("shortlisted");
        shortlistBtn.disabled = true;
      };
    }
  });

  // Show modal
  document.getElementById("item-modal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("item-modal").style.display = "none";
  document.body.style.overflow = "";
  modalImages = [];
  modalCurrentIndex = 0;
}

function showModalImage(index) {
  if (modalImages.length === 0) return;
  modalCurrentIndex = (index + modalImages.length) % modalImages.length;
  const mainImg = document.getElementById("modal-main-img");
  mainImg.src = modalImages[modalCurrentIndex];
  // Update active thumbnail
  document.querySelectorAll(".modal-thumb").forEach((t, i) => {
    t.classList.toggle("active", i === modalCurrentIndex);
  });
}

function buildThumbnails() {
  const strip = document.getElementById("modal-thumbnails");
  strip.innerHTML = "";
  if (modalImages.length <= 1) { strip.style.display = "none"; return; }
  strip.style.display = "flex";
  modalImages.forEach((url, i) => {
    const img = document.createElement("img");
    img.src = url;
    img.className = `modal-thumb${i === 0 ? " active" : ""}`;
    img.addEventListener("click", () => showModalImage(i));
    strip.appendChild(img);
  });
}

async function addToShortlist(userUID, listingId, data) {
  const ref = doc(db, "shortlists", userUID, "items", listingId);
  const existing = await getDoc(ref);
  if (existing.exists()) return;
  await setDoc(ref, {
    title:       data.title,
    description: data.description,
    price:       data.price,
    category:    data.category,
    imageURL:    data.imageURL  || "",
    imageURLs:   data.imageURLs || (data.imageURL ? [data.imageURL] : []),
    sellerEmail: data.sellerEmail,
    addedAt:     serverTimestamp()
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
