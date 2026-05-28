import { auth, db } from "../firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadShortlist(user.uid);

});


async function loadShortlist(userUID) {

  const shortlistContainer =
    document.getElementById("shortlistContainer");

  shortlistContainer.innerHTML = "";

  const itemsRef =
    collection(db, "shortlists", userUID, "items");

  const snapshot = await getDocs(itemsRef);

  if (snapshot.empty) {

    shortlistContainer.innerHTML = `
      <p class="empty-message">
        Your shortlist is empty. Browse the marketplace!
      </p>
    `;

    return;
  }

  snapshot.forEach((docSnap) => {

    const item = docSnap.data();

    shortlistContainer.innerHTML += `

      <div class="listing-card" id="card-${docSnap.id}">

        <img
          src="${item.image}"
          class="listing-img"
          alt="${item.title}"
        >

        <div class="listing-details">

          <span class="category-badge">
            ${item.category}
          </span>

          <h3>${item.title}</h3>

          <p class="description">
            ${item.description}
          </p>

          <p class="price">
            $${item.price}
          </p>

          <p class="seller-email">
            ${item.email}
          </p>

          <button
            class="shortlist-btn"
            onclick="removeFromShortlist('${userUID}', '${docSnap.id}')"
          >
            Remove
          </button>

        </div>

      </div>
    `;
  });

}


window.removeFromShortlist =
async function(userUID, listingId) {

  await deleteDoc(
    doc(db, "shortlists", userUID, "items", listingId)
  );

  document
    .getElementById(`card-${listingId}`)
    .remove();

};
