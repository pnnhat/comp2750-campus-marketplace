// shortlist.js
// Controls the shortlist page (shortlist.html).
// Loads the signed-in user's shortlisted items from Firestore,
// fetches live listing data so status and price are always current,
// renders item cards with a remove button, and handles a full-screen
// image modal when a card is clicked.

import { requireAuth, handleSignOut } from "./auth-guard.js";
import { db } from "./firebase-config.js";
import {
  collection, getDocs, deleteDoc, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Track the images array and current index for the open modal.
let modalImages = [];
let modalCurrentIndex = 0;

// Require authentication before showing the page
requireAuth(async (user) => {
  // Display the signed-in user's email in the navbar
  const emailEl = document.getElementById("user-email");
  if (emailEl) emailEl.textContent = user.email;

  // Wire up sign out button
  document.getElementById("signout-btn")?.addEventListener("click", handleSignOut);

  // Load the user's shortlisted items from Firestore
  await loadShortlist(user.uid);

  document.getElementById("modal-close")
    .addEventListener("click", closeModal);
  document.getElementById("item-modal")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("item-modal")) {
        closeModal();
      }
    });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});

// Load all items the user has shortlisted.
// For each shortlist entry, fetch the live listing document from Firestore
// so the card always shows the current price and status.
// Falls back to the saved snapshot if the listing no longer exists.
async function loadShortlist(userUID) {
  const grid = document.getElementById("shortlist-grid");
  grid.innerHTML = "";

  // Get all shortlisted item IDs for this user
  const snapshot = await getDocs(
    collection(db, "shortlists", userUID, "items")
  );

  if (snapshot.empty) {
    showEmptyState();
    return;
  }

  grid.style.display = "";
  document.getElementById("empty-state").style.display = "none";

  // For each shortlisted item, fetch the live listing from Firestore
  for (const docSnap of snapshot.docs) {
    const listingId = docSnap.id;
    try {
      // Get live data from listings collection
      const listingDoc = await getDoc(
        doc(db, "listings", listingId)
      );
      if (listingDoc.exists()) {
        // Use live listing data so status/price are always current
        renderCard(listingId, listingDoc.data(), userUID);
      } else {
        // Listing was deleted — use saved snapshot data
        renderCard(listingId, docSnap.data(), userUID);
      }
    } catch (err) {
      // Fall back to saved snapshot if live fetch fails
      renderCard(listingId, docSnap.data(), userUID);
    }
  }
}

// Build and inject a card for a single shortlisted item.
// Shows the item image, category, title, description, price,
// seller email, status (if not Active), and a Remove button.
// Clicking the card (outside the Remove button) opens the detail modal.
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
      ${data.status && data.status !== "Active"
        ? `<span class="status-${(data.status).toLowerCase()}">${data.status}</span>`
        : ""}
      <button class="remove-btn" id="remove-btn-${id}">Remove</button>
    </div>
  `;

  // Wire up remove button for this card
  card.querySelector(`#remove-btn-${id}`).addEventListener("click", () => {
    removeFromShortlist(userUID, id);
  });

  card.style.cursor = "pointer";
  card.addEventListener("click", (e) => {
    if (e.target.closest(".remove-btn")) return;
    openModal(id, data, userUID);
  });

  grid.appendChild(card);
}

// Remove an item from the user's shortlist in Firestore.
// Deletes the document at shortlists/{userUID}/items/{listingId}.
// Removes the card from the DOM and shows the empty state if needed.
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

// Hide the grid and show the empty state message.
function showEmptyState() {
  document.getElementById("shortlist-grid").style.display = "none";
  document.getElementById("empty-state").style.display = "";
}

// Open the full-screen detail modal for a shortlisted item.
// Builds the image gallery from imageURLs array or falls back
// to single imageURL for backwards compatibility with older listings.
function openModal(id, data, userUID) {
  if (data.imageURLs && data.imageURLs.length > 0) {
    modalImages = data.imageURLs;
  } else if (data.imageURL) {
    modalImages = [data.imageURL];
  } else {
    modalImages = [];
  }
  modalCurrentIndex = 0;

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

  const showArrows = modalImages.length > 1;
  document.getElementById("modal-prev").style.display =
    showArrows ? "flex" : "none";
  document.getElementById("modal-next").style.display =
    showArrows ? "flex" : "none";

  document.getElementById("modal-prev").onclick = () => {
    modalCurrentIndex =
      (modalCurrentIndex - 1 + modalImages.length) % modalImages.length;
    showModalImage(modalCurrentIndex);
  };
  document.getElementById("modal-next").onclick = () => {
    modalCurrentIndex = (modalCurrentIndex + 1) % modalImages.length;
    showModalImage(modalCurrentIndex);
  };

  buildThumbnails();

  document.getElementById("item-modal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

// Display a specific image in the modal gallery by index.
// Updates the active thumbnail highlight.
function showModalImage(index) {
  if (modalImages.length === 0) return;
  modalCurrentIndex = (index + modalImages.length) % modalImages.length;
  const mainImg = document.getElementById("modal-main-img");
  mainImg.src = modalImages[modalCurrentIndex];
  document.querySelectorAll(".modal-thumb").forEach((t, i) => {
    t.classList.toggle("active", i === modalCurrentIndex);
  });
}

// Build the thumbnail strip below the main image.
// Only shown when there are 2 or more images.
function buildThumbnails() {
  const strip = document.getElementById("modal-thumbnails");
  strip.innerHTML = "";
  if (modalImages.length <= 1) {
    strip.style.display = "none";
    return;
  }
  strip.style.display = "flex";
  modalImages.forEach((url, i) => {
    const img = document.createElement("img");
    img.src = url;
    img.className = `modal-thumb${i === 0 ? " active" : ""}`;
    img.addEventListener("click", () => showModalImage(i));
    strip.appendChild(img);
  });
}

// Close the modal and restore page scrolling.
function closeModal() {
  document.getElementById("item-modal").style.display = "none";
  document.body.style.overflow = "";
  modalImages = [];
  modalCurrentIndex = 0;
}

