// js/mylistings.js
// Manages the current user's listings â€” load, add, and delete.

import { requireAuth, handleSignOut } from "./auth-guard.js";
import { db } from "./firebase-config.js";
import {
  collection, query, where, getDocs,
  addDoc, deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Require authentication before showing the page
requireAuth(async (user) => {
  // Display the signed-in user's email in the navbar
  const emailEl = document.getElementById("user-email");
  if (emailEl) emailEl.textContent = user.email;

  // Wire up sign out button
  document.getElementById("signout-btn")?.addEventListener("click", handleSignOut);

  // Load the user's own listings from Firestore
  await loadMyListings(user.uid);

  // Set up add-listing form and toggle
  initAddListingToggle();
  initAddListingForm(user);
});

// Query and render the current user's listings
async function loadMyListings(userUID) {
  // Fetch only listings belonging to the current user
  const q = query(
    collection(db, "listings"),
    where("sellerUID", "==", userUID)
  );
  const snapshot = await getDocs(q);

  const tbody = document.getElementById("listings-tbody");
  tbody.innerHTML = "";

  if (snapshot.empty) {
    showEmptyState();
    return;
  }

  // Show table, hide empty state
  document.getElementById("empty-state").style.display = "none";
  const tableContainer = document.getElementById("table-container");
  if (tableContainer) tableContainer.style.display = "";

  // Render a row for each listing document
  snapshot.forEach(docSnap => renderRow(docSnap.id, docSnap.data(), userUID));
}

// Build and inject a table row for a single listing
function renderRow(id, data, userUID) {
  const tbody = document.getElementById("listings-tbody");
  const tr = document.createElement("tr");
  tr.id = `row-${id}`;
  const badgeClass = `badge-${(data.category || "").toLowerCase()}`;

  tr.innerHTML = `
    <td>
      <div class="table-item-title">${data.title}</div>
      <div class="table-item-desc">${data.description}</div>
    </td>
    <td><span class="badge ${badgeClass}">${data.category}</span></td>
    <td class="table-price">${data.price}</td>
    <td><span class="table-status-active">Active</span></td>
    <td><button class="btn-delete" id="delete-btn-${id}">Delete</button></td>
  `;

  // Wire up delete button for this row
  tr.querySelector(`#delete-btn-${id}`).addEventListener("click", () => {
    deleteListing(id, userUID);
  });

  tbody.appendChild(tr);
}

// Delete a listing document from Firestore and remove its table row
async function deleteListing(id, userUID) {
  // Remove the document from the listings collection
  await deleteDoc(doc(db, "listings", id));

  // Remove the row from the DOM
  document.getElementById(`row-${id}`)?.remove();

  // Show empty state if no rows remain in the table
  const tbody = document.getElementById("listings-tbody");
  if (!tbody.querySelector("tr")) {
    showEmptyState();
  }
}

function showEmptyState() {
  document.getElementById("empty-state").style.display = "";
  const tableContainer = document.getElementById("table-container");
  if (tableContainer) tableContainer.style.display = "none";
}

// Toggle the add-listing panel open/closed
function initAddListingToggle() {
  const toggleBtn = document.getElementById("add-listing-toggle");
  const panel     = document.getElementById("add-listing-form");
  const cancelBtn = document.getElementById("cancel-listing-btn");

  toggleBtn?.addEventListener("click", () => {
    panel.style.display = panel.style.display === "block" ? "none" : "block";
  });
  cancelBtn?.addEventListener("click", () => {
    panel.style.display = "none";
    clearForm();
  });
}

// Handle add-listing form submission
function initAddListingForm(user) {
  const listingForm = document.getElementById("listing-form");
  if (!listingForm) return;

  listingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title       = document.getElementById("field-title").value.trim();
    const description = document.getElementById("field-description").value.trim();
    const price       = document.getElementById("field-price").value.trim();
    const category    = document.getElementById("field-category").value;
    const imageURL    = document.getElementById("field-imageURL").value.trim();
    const errorDiv    = document.getElementById("form-error");

    // Validate all required fields before submitting
    if (!title || !description || !price || !category) {
      errorDiv.textContent = "Please fill in all required fields.";
      errorDiv.classList.add("visible");
      return;
    }
    errorDiv.classList.remove("visible");

    // Write the new listing document to Firestore
    await addDoc(collection(db, "listings"), {
      title,
      description,
      price,
      category,
      imageURL:    imageURL || "",
      sellerUID:   user.uid,
      sellerEmail: user.email,
      createdAt:   serverTimestamp()
    });

    // Close form and reload listings after successful submission
    document.getElementById("add-listing-form").style.display = "none";
    clearForm();
    await loadMyListings(user.uid);
  });
}

function clearForm() {
  ["field-title", "field-description", "field-price", "field-imageURL"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const cat = document.getElementById("field-category");
  if (cat) cat.value = "";
  const errorDiv = document.getElementById("form-error");
  if (errorDiv) errorDiv.classList.remove("visible");
}
