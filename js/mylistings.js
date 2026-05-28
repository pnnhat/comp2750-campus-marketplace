// mylistings.js
// Handles add-listing form, client-side validation, and delete from table.
// Firebase integration (auth guard, Firestore CRUD) is added in Phase 2.

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
