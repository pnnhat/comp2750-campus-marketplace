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

  // Wire edit modal buttons
  document.getElementById("edit-modal-close")
    .addEventListener("click", closeEditModal);
  document.getElementById("edit-cancel-btn")
    .addEventListener("click", closeEditModal);
  document.getElementById("edit-save-btn")
    .addEventListener("click", () => {
      if (editingId) saveEdit(editingId, editingData, editingUID);
    });
  document.getElementById("edit-modal")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("edit-modal")) {
        closeEditModal();
      }
    });
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

// Build and inject a grid card for a single listing
function renderRow(id, data, userUID) {
  const container = document.getElementById("listings-tbody");
  const card = document.createElement("div");
  card.className = "my-listing-card";
  card.id = `row-${id}`;

  const status = data.status || "Active";
  const statusClass = {
    "Active":  "status-active",
    "Pending": "status-pending",
    "Sold":    "status-sold"
  }[status] || "status-active";

  // Get first image — handle both imageURLs array and single imageURL
  const firstImage = (data.imageURLs && data.imageURLs.length > 0)
    ? data.imageURLs[0]
    : (data.imageURL || "");

  card.innerHTML = `
    <div class="my-listing-img-wrap">
      ${firstImage
        ? `<img src="${firstImage}" class="my-listing-img" alt="${data.title}"
               onerror="this.style.display='none';
               this.nextElementSibling.style.display='flex';">
           <div class="my-listing-img-placeholder" style="display:none;">📦</div>`
        : `<div class="my-listing-img-placeholder">📦</div>`}
    </div>
    <div class="my-listing-body">
      <div class="my-listing-title">${data.title}</div>
      <div class="my-listing-price">${data.price || "—"}</div>
      <span class="${statusClass}">${status}</span>
      <div class="my-listing-meta">Listed to Marketplace</div>
    </div>
    <div class="my-listing-actions">
      <button class="my-listing-mark-sold ${status === "Sold" ? "mark-sold-disabled" : ''}"
              id="mark-sold-btn-${id}"
              ${status === "Sold" ? "disabled" : ""}>
        ✓ ${status === "Sold" ? "Sold" : "Mark as Sold"}
      </button>
      <div class="my-listing-dots-wrap">
        <button class="my-listing-dots-btn" id="dots-btn-${id}">•••</button>
        <div class="my-listing-dropdown"
             id="dropdown-${id}" style="display:none;">
          <button class="dropdown-item" id="pending-btn-${id}">
            ${status === "Pending" ? "▶ Mark as Active" : "⏸ Mark as Pending"}
          </button>
          <button class="dropdown-item" id="edit-btn-${id}">
            ✎ Edit Listing
          </button>
          <button class="dropdown-item dropdown-item-danger"
                  id="delete-btn-${id}">
            🗑 Delete Listing
          </button>
        </div>
      </div>
    </div>
  `;

  card.querySelector(`#mark-sold-btn-${id}`)
    .addEventListener("click", () => markAsSold(id, data, userUID));

  // Wire dots button — toggle dropdown
  card.querySelector(`#dots-btn-${id}`)
    .addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".my-listing-dropdown").forEach(d => {
        if (d.id !== `dropdown-${id}`) d.style.display = "none";
      });
      const dd = document.getElementById(`dropdown-${id}`);
      dd.style.display = dd.style.display === "block" ? "none" : "block";
    });

  // Wire dropdown items
  card.querySelector(`#pending-btn-${id}`)
    .addEventListener("click", () => {
      document.getElementById(`dropdown-${id}`).style.display = "none";
      togglePending(id, data, userUID);
    });

  card.querySelector(`#edit-btn-${id}`)
    .addEventListener("click", () => {
      document.getElementById(`dropdown-${id}`).style.display = "none";
      openEditModal(id, data, userUID);
    });

  card.querySelector(`#delete-btn-${id}`)
    .addEventListener("click", () => {
      document.getElementById(`dropdown-${id}`).style.display = "none";
      deleteListing(id, userUID);
    });

  container.appendChild(card);
}

// Close all dropdowns when clicking outside
document.addEventListener("click", () => {
  document.querySelectorAll(".my-listing-dropdown")
    .forEach(d => d.style.display = "none");
});

// Mark listing as Sold
async function markAsSold(id, data, userUID) {
  try {
    await updateDoc(doc(db, "listings", id), { status: "Sold" });
    data.status = "Sold";
    document.getElementById(`row-${id}`)?.remove();
    renderRow(id, data, userUID);
  } catch (err) {
    console.error("Error marking as sold:", err);
    alert("Failed to update. Please try again.");
  }
}

// Toggle between Pending and Active
async function togglePending(id, data, userUID) {
  const newStatus = (data.status === "Pending") ? "Active" : "Pending";
  try {
    await updateDoc(doc(db, "listings", id), { status: newStatus });
    data.status = newStatus;
    document.getElementById(`row-${id}`)?.remove();
    renderRow(id, data, userUID);
  } catch (err) {
    console.error("Error updating status:", err);
    alert("Failed to update. Please try again.");
  }
}

// Track which listing is being edited
let editingId   = null;
let editingData = null;
let editingUID  = null;
let imagesToDelete = [];

function openEditModal(id, data, userUID) {
  editingId   = id;
  editingData = data;
  editingUID  = userUID;
  imagesToDelete = [];

  document.getElementById("edit-price-input").value  = data.price  || "";
  document.getElementById("edit-status-input").value = data.status || "Active";
  document.getElementById("edit-form-error").textContent = "";

  document.getElementById("edit-new-preview").innerHTML = "";
  document.getElementById("edit-new-images").value = "";

  const currentImagesEl = document.getElementById("edit-current-images");
  currentImagesEl.innerHTML = "";

  const images = (data.imageURLs && data.imageURLs.length > 0)
    ? data.imageURLs
    : (data.imageURL ? [data.imageURL] : []);

  if (images.length === 0) {
    currentImagesEl.innerHTML =
      '<p style="font-size:13px;color:var(--color-text-muted);">No images yet.</p>';
  } else {
    images.forEach((url, i) => {
      const wrap = document.createElement("div");
      wrap.className = "edit-img-wrap";
      wrap.innerHTML = `
        <img src="${url}" class="edit-thumb" alt="Image ${i+1}">
        <button class="edit-img-delete" data-url="${url}">✕</button>
      `;
      wrap.querySelector(".edit-img-delete")
        .addEventListener("click", (e) => {
          const urlToDelete = e.currentTarget.dataset.url;
          imagesToDelete.push(urlToDelete);
          wrap.style.opacity = "0.3";
          wrap.style.pointerEvents = "none";
          e.currentTarget.textContent = "✓";
          e.currentTarget.style.background = "#009174";
        });
      currentImagesEl.appendChild(wrap);
    });
  }

  // Wire new-image file picker (replace listener each open)
  const newImagesInput = document.getElementById("edit-new-images");
  const newInputClone  = newImagesInput.cloneNode(true);
  newImagesInput.parentNode.replaceChild(newInputClone, newImagesInput);
  newInputClone.addEventListener("change", (e) => {
    const files   = Array.from(e.target.files);
    const preview = document.getElementById("edit-new-preview");
    preview.innerHTML = "";
    preview.style.display = files.length ? "flex" : "none";
    files.forEach(file => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.cssText =
        "width:72px;height:72px;object-fit:cover;" +
        "border-radius:6px;border:2px solid var(--color-border);";
      preview.appendChild(img);
    });
  });

  document.getElementById("edit-modal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

// Save edits (price, status, images) to Firestore
async function saveEdit(id, data, userUID) {
  const newPrice  = document.getElementById("edit-price-input").value.trim();
  const newStatus = document.getElementById("edit-status-input").value;
  const newFiles  = Array.from(document.getElementById("edit-new-images").files);
  const errorDiv  = document.getElementById("edit-form-error");
  const saveBtn   = document.getElementById("edit-save-btn");

  if (!newPrice) {
    errorDiv.textContent = "Price cannot be empty.";
    return;
  }
  errorDiv.textContent = "";

  saveBtn.textContent = "Saving...";
  saveBtn.disabled    = true;

  try {
    let currentImages = (data.imageURLs && data.imageURLs.length > 0)
      ? [...data.imageURLs]
      : (data.imageURL ? [data.imageURL] : []);

    currentImages = currentImages.filter(url => !imagesToDelete.includes(url));

    for (const file of newFiles) {
      const filename   = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `listings/${userUID}/${filename}`);
      const snap = await uploadBytes(storageRef, file);
      const url  = await getDownloadURL(snap.ref);
      currentImages.push(url);
    }

    await updateDoc(doc(db, "listings", id), {
      price:     newPrice,
      status:    newStatus,
      imageURLs: currentImages,
      imageURL:  currentImages[0] || ""
    });

    data.price     = newPrice;
    data.status    = newStatus;
    data.imageURLs = currentImages;
    data.imageURL  = currentImages[0] || "";

    closeEditModal();
    document.getElementById(`row-${id}`)?.remove();
    renderRow(id, data, userUID);

  } catch (err) {
    console.error("Error saving edit:", err);
    errorDiv.textContent = "Failed to save. Please try again.";
  } finally {
    saveBtn.textContent = "Save changes →";
    saveBtn.disabled    = false;
  }
}

function closeEditModal() {
  document.getElementById("edit-modal").style.display = "none";
  document.body.style.overflow = "";
  editingId      = null;
  editingData    = null;
  editingUID     = null;
  imagesToDelete = [];
}

// Delete a listing document from Firestore and remove its card
async function deleteListing(id, userUID) {
  await deleteDoc(doc(db, "listings", id));

  document.getElementById(`row-${id}`)?.remove();

  // Show empty state if no cards remain
  const container = document.getElementById("listings-tbody");
  if (!container.querySelector(".my-listing-card")) {
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
