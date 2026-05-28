// shortlist.js
// Phase 1: Static remove button handler (no Firebase).
// Phase 2: uncomment Firebase block and remove static handler.

// ── TODO Phase 2: Firebase Integration ───────────────────────────────────
// import { auth, db } from "./firebase-config.js";
// import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
//
// onAuthStateChanged(auth, (user) => {
//   if (!user) { window.location.href = "login.html"; return; }
//   document.getElementById("nav-user-email").textContent = user.email;
//   loadShortlist(user.uid);
// });
//
// async function loadShortlist(userUID) {
//   const grid = document.getElementById("shortlist-grid");
//   grid.innerHTML = "";
//   const snapshot = await getDocs(collection(db, "shortlists", userUID, "items"));
//   if (snapshot.empty) { showEmptyState(); return; }
//   snapshot.forEach(docSnap => renderCard(docSnap.id, docSnap.data(), userUID));
// }
//
// async function removeFromShortlist(userUID, itemId) {
//   await deleteDoc(doc(db, "shortlists", userUID, "items", itemId));
//   document.getElementById(`card-${itemId}`)?.remove();
//   if (!document.querySelector("#shortlist-grid .item-card")) showEmptyState();
// }
// ─────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initRemoveButtons();
});

function initRemoveButtons() {
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = btn.dataset.id;
      const card = document.getElementById(`card-${id}`);
      // TODO Phase 2: await removeFromShortlist(userUID, id);
      card?.remove();
      if (!document.querySelector('#shortlist-grid .item-card')) {
        showEmptyState();
      }
    });
  });
}

function showEmptyState() {
  document.getElementById('shortlist-grid').style.display = 'none';
  document.getElementById('empty-state').style.display    = 'flex';
}

