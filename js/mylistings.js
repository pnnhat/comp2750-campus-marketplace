// js/mylistings.js
// Manages the current user's listings — load, add, and delete.

import { requireAuth, handleSignOut } from "./auth-guard.js";
import { db } from "./firebase-config.js";
import {
  collection, query, where, getDocs,
  addDoc, deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

  toggleBtn?.addEventListener("click", () => panel.classList.toggle("open"));
  cancelBtn?.addEventListener("click", () => {
    panel.classList.remove("open");
    clearForm();
  });
}

// Handle add-listing form submission
function initAddListingForm(user) {
  const submitBtn = document.getElementById("submit-listing-btn");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", async () => {
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
    document.getElementById("add-listing-form").classList.remove("open");
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

// ── TODO: Firebase Integration ────────────────────────────────────────────
// import { auth, db } from "./firebase-config.js";
// import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import {
//   collection, addDoc, deleteDoc,
//   getDocs, query, where, doc, serverTimestamp
// } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
//
// onAuthStateChanged(auth, (user) => {
//   if (!user) { window.location.href = "login.html"; return; }
//   document.getElementById("nav-user-email").textContent = user.email;
//   loadUserListings(user);
//   setupForm(user);
// });
//
// async function loadUserListings(user) {
//   const q = query(collection(db, "listings"), where("sellerUID", "==", user.uid));
//   const snapshot = await getDocs(q);
//   const tbody = document.getElementById("listings-tbody");
//   tbody.innerHTML = "";
//   if (snapshot.empty) { showEmptyState(); return; }
//   snapshot.forEach(docSnap => appendRow(docSnap.id, docSnap.data()));
// }
//
// async function setupForm(user) {
//   // same as current submitHandler but with real addDoc call and user.uid
// }
// ─────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initAddListingPanel();
  initAddListingForm();
  initDeleteButtons();
  initSignOut();
});

// ── Toggle add-listing panel ──────────────────────────────────────────────
function initAddListingPanel() {
  const addBtn   = document.getElementById('add-listing-btn');
  const panel    = document.getElementById('add-listing-panel');
  const cancelBtn = document.getElementById('cancel-btn');

  addBtn?.addEventListener('click', () => panel.classList.toggle('open'));
  cancelBtn?.addEventListener('click', () => {
    panel.classList.remove('open');
    document.getElementById('listing-form').reset();
    document.getElementById('form-error').classList.remove('visible');
  });
}

// ── Add listing form submission ───────────────────────────────────────────
function initAddListingForm() {
  const form = document.getElementById('listing-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv   = document.getElementById('form-error');
    const title       = document.getElementById('input-title').value.trim();
    const description = document.getElementById('input-description').value.trim();
    const price       = document.getElementById('input-price').value.trim();
    const category    = document.getElementById('input-category').value;
    const imageURL    = document.getElementById('input-image').value.trim();

    if (!title || !description || !price || !category) {
      errorDiv.textContent = 'Please fill in all required fields.';
      errorDiv.classList.add('visible');
      return;
    }
    errorDiv.classList.remove('visible');

    // TODO: Firebase Phase 2 — replace below with:
    // const docRef = await addDoc(collection(db, "listings"), {
    //   title, description, price, category,
    //   imageURL: imageURL || "",
    //   sellerEmail: user.email,
    //   sellerUID:   user.uid,
    //   createdAt:   serverTimestamp()
    // });
    // appendRow(docRef.id, { title, description, price, category, imageURL });

    // Static placeholder: append row directly
    appendRow(Date.now().toString(), { title, description, price, category, imageURL });
    form.reset();
    document.getElementById('add-listing-panel').classList.remove('open');
    document.getElementById('empty-state').style.display = 'none';
  });
}

// ── Append a row to the listings table ───────────────────────────────────
function appendRow(id, data) {
  const tbody = document.getElementById('listings-tbody');
  const tr = document.createElement('tr');
  tr.dataset.id = id;
  const badgeClass = badgeFor(data.category);
  tr.innerHTML = `
    <td>
      <div class="table-item-title">${escapeHtml(data.title)}</div>
      <div class="table-item-desc">${escapeHtml(data.description)}</div>
    </td>
    <td><span class="badge ${badgeClass}">${escapeHtml(data.category)}</span></td>
    <td class="table-price">${escapeHtml(data.price)}</td>
    <td><span class="table-status-active">Active</span></td>
    <td><button class="btn-delete">Delete</button></td>`;
  tbody.appendChild(tr);
}

// ── Delete row ────────────────────────────────────────────────────────────
function initDeleteButtons() {
  document.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('btn-delete')) return;
    const row = e.target.closest('tr');
    if (!row) return;
    if (!window.confirm('Delete this listing?')) return;

    // TODO: Firebase Phase 2 — await deleteDoc(doc(db, "listings", row.dataset.id));
    row.remove();

    const tbody = document.getElementById('listings-tbody');
    if (!tbody.querySelector('tr')) showEmptyState();
  });
}

// ── Empty state ───────────────────────────────────────────────────────────
function showEmptyState() {
  document.getElementById('empty-state').style.display = 'flex';
}

// ── Sign out ──────────────────────────────────────────────────────────────
function initSignOut() {
  document.getElementById('sign-out-btn')?.addEventListener('click', () => {
    // TODO: signOut(auth).then(() => window.location.href = 'login.html');
    window.location.href = 'login.html';
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────
function badgeFor(category) {
  const map = {
    'Electronics': 'badge-electronics',
    'Furniture':   'badge-furniture',
    'Clothing':    'badge-clothing',
    'Textbooks':   'badge-textbooks',
  };
  return map[category] || 'badge-textbooks';
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str ?? ''));
  return d.innerHTML;
}
