// js/mylistings.js
// Manages the current user's listings — load, add, and delete.

import { requireAuth, handleSignOut } from "./auth-guard.js";
import { db, storage } from "./firebase-config.js";
import {
  collection, query, where, getDocs,
  addDoc, deleteDoc, doc, serverTimestamp, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
  const status = data.status || "Active";
  const statusClass = {
    "Active":  "status-active",
    "Pending": "status-pending",
    "Sold":    "status-sold"
  }[status] || "status-active";
  tr.innerHTML = `
    <td>
      <div class="table-item-title">${data.title}</div>
      <div class="table-item-desc">${data.description}</div>
    </td>
    <td><span class="badge ${badgeClass}">${data.category || "\u2014"}</span></td>
    <td class="table-price" id="price-cell-${id}">${data.price || "\u2014"}</td>
    <td id="status-cell-${id}"><span class="${statusClass}">${status}</span></td>
    <td class="action-btns">
      <button class="btn-edit" id="edit-btn-${id}">Edit</button>
      <button class="btn-delete" id="delete-btn-${id}">Delete</button>
    </td>
  `;
  tr.querySelector(`#delete-btn-${id}`)
    .addEventListener("click", () => deleteListing(id, userUID));
  tr.querySelector(`#edit-btn-${id}`)
    .addEventListener("click", () => openEditRow(id, data, userUID));
  tbody.appendChild(tr);
}

// Open inline edit mode for a listing row
function openEditRow(id, data, userUID) {
  const priceCell  = document.getElementById(`price-cell-${id}`);
  const statusCell = document.getElementById(`status-cell-${id}`);
  const editBtn    = document.getElementById(`edit-btn-${id}`);
  if (!priceCell || !statusCell || !editBtn) return;
  const currentPrice  = data.price  || "";
  const currentStatus = data.status || "Active";
  priceCell.innerHTML = `<input class="edit-input" id="edit-price-${id}" type="text" value="${currentPrice}" placeholder='$20 or Trade'>`;
  statusCell.innerHTML = `
    <select class="edit-select" id="edit-status-${id}">
      <option value="Active"  ${currentStatus === "Active"  ? "selected" : ""}>Active</option>
      <option value="Pending" ${currentStatus === "Pending" ? "selected" : ""}>Pending</option>
      <option value="Sold"    ${currentStatus === "Sold"    ? "selected" : ""}>Sold</option>
    </select>
  `;
  const newBtn = document.createElement("button");
  newBtn.textContent = "Save";
  newBtn.className = "btn-save";
  newBtn.id = `edit-btn-${id}`;
  newBtn.addEventListener("click", () => saveEdit(id, data, userUID));
  editBtn.replaceWith(newBtn);
}

// Save the edited price and status to Firestore
async function saveEdit(id, data, userUID) {
  const priceInput  = document.getElementById(`edit-price-${id}`);
  const statusInput = document.getElementById(`edit-status-${id}`);
  if (!priceInput || !statusInput) return;
  const newPrice  = priceInput.value.trim();
  const newStatus = statusInput.value;
  if (!newPrice) { alert("Price cannot be empty."); return; }
  try {
    await updateDoc(doc(db, "listings", id), { price: newPrice, status: newStatus });
    data.price  = newPrice;
    data.status = newStatus;
    const tr = document.getElementById(`row-${id}`);
    if (tr) tr.remove();
    renderRow(id, data, userUID);
  } catch (err) {
    console.error("Error saving edit:", err);
    alert("Failed to save. Please try again.");
  }
}

// Delete a listing document from Firestore and remove its table row
async function deleteListing(id, userUID) {
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

  const formPanel = document.getElementById("add-listing-form");

  // Show thumbnails when user selects files
  document.getElementById("field-image")
    .addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      const strip = document.getElementById("image-preview-strip");
      strip.innerHTML = "";
      if (files.length === 0) { strip.style.display = "none"; return; }
      strip.style.display = "flex";
      files.forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.cssText = "width:80px;height:80px;object-fit:cover;border-radius:6px;border:2px solid var(--color-border);";
        strip.appendChild(img);
      });
    });

  document.getElementById("submit-listing-btn").addEventListener("click", async () => {
    console.log("Form submitted");

    const title       = document.getElementById("field-title").value.trim();
    const description = document.getElementById("field-description").value.trim();
    const price       = document.getElementById("field-price").value.trim();
    const category    = document.getElementById("field-category").value;
    const imageFiles = Array.from(document.getElementById("field-image").files);
    const errorDiv    = document.getElementById("form-error");
    const submitBtn   = document.getElementById("submit-listing-btn");

    // Validate all required fields before submitting
    if (!title || !description || !price || !category) {
      errorDiv.textContent = "Please fill in all required fields.";
      errorDiv.classList.add("visible");
      return;
    }
    errorDiv.classList.remove("visible");

    // Show loading state on submit button
    submitBtn.textContent = "Uploading...";
    submitBtn.disabled = true;

    try {
      let imageURLs = [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const filename = `${Date.now()}_${file.name}`;
          const storageRef = ref(storage, `listings/${user.uid}/${filename}`);
          const snap = await uploadBytes(storageRef, file);
          const url  = await getDownloadURL(snap.ref);
          imageURLs.push(url);
        }
      }

      console.log("Adding doc:", title, price, category);
      // Write the new listing document to Firestore
      await addDoc(collection(db, "listings"), {
        title:       title,
        description: description,
        price:       price,
        category:    category,
        imageURLs:   imageURLs,
        imageURL:    imageURLs[0] || "",
        sellerUID:   user.uid,
        sellerEmail: user.email,
        createdAt:   serverTimestamp()
      });
      console.log("Doc added successfully");

      // Reset button state
      submitBtn.textContent = "Post listing →";
      submitBtn.disabled = false;

      // Hide form, reset fields, refresh table
      formPanel.style.display = "none";
      clearForm();
      await loadMyListings(user.uid);
    } catch (err) {
      console.error("Error adding doc:", err);
      errorDiv.textContent = "Failed to post listing. Please try again.";
      errorDiv.classList.add("visible");
      // Reset button state on error
      submitBtn.textContent = "Post listing →";
      submitBtn.disabled = false;
    }
  });
}

function clearForm() {
  ["field-title", "field-description", "field-price"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const cat = document.getElementById("field-category");
  if (cat) cat.value = "";
  const imageInput = document.getElementById("field-image");
  if (imageInput) imageInput.value = "";
  const strip = document.getElementById("image-preview-strip");
  if (strip) { strip.innerHTML = ""; strip.style.display = "none"; }
  const errorDiv = document.getElementById("form-error");
  if (errorDiv) errorDiv.classList.remove("visible");
}
