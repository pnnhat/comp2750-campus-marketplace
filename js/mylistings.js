// js/mylistings.js
// Manages the current user's listings â€” load, add, and delete.

import { requireAuth, handleSignOut } from "./auth-guard.js";
import { db, storage } from "./firebase-config.js";
import {
  collection, query, where, getDocs,
  addDoc, deleteDoc, doc, serverTimestamp
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

  const formPanel = document.getElementById("add-listing-form");

  // Show image preview when user selects a file
  document.getElementById("field-image")
    .addEventListener("change", (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById("image-preview");
      if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
      } else {
        preview.src = "";
        preview.style.display = "none";
      }
    });

  listingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const title       = document.getElementById("field-title").value.trim();
    const description = document.getElementById("field-description").value.trim();
    const price       = document.getElementById("field-price").value.trim();
    const category    = document.getElementById("field-category").value;
    const imageFile   = document.getElementById("field-image").files[0];
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
      let imageURL = "";
      if (imageFile) {
        console.log("Uploading image:", imageFile.name);
        // Upload image to Firebase Storage under listings/{userUID}/{timestamp}_{filename}
        const filename = `${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, `listings/${user.uid}/${filename}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        // Get the public download URL
        imageURL = await getDownloadURL(snapshot.ref);
        console.log("Image uploaded, URL:", imageURL);
      }

      console.log("Adding doc:", title, price, category);
      // Write the new listing document to Firestore
      await addDoc(collection(db, "listings"), {
        title:       title,
        description: description,
        price:       price,
        category:    category,
        imageURL:    imageURL,
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
  const preview = document.getElementById("image-preview");
  if (preview) { preview.src = ""; preview.style.display = "none"; }
  const errorDiv = document.getElementById("form-error");
  if (errorDiv) errorDiv.classList.remove("visible");
}
