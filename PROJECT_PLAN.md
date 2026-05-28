# COMP2750/6750 Campus Marketplace — Group Project Plan
**4 Members | Session 1 2026 | 30% of Unit Grade**

---

## SECTION 1 — SYSTEM ARCHITECTURE

### Architecture Overview

```
campus-marketplace/
├── index.html              ← Welcome page (Member 1)
├── login.html              ← Auth page (Member 1)
├── marketplace.html        ← Browse listings (Member 2)
├── mylistings.html         ← User's own listings (Member 3)
├── shortlist.html          ← Saved items (Member 4)
├── css/
│   └── style.css           ← Custom overrides on Bootstrap (Member 4)
├── js/
│   ├── firebase-config.js  ← Firebase init — shared (Member 1 owns)
│   ├── auth-guard.js       ← Redirect unauthenticated users (Member 1 owns)
│   ├── marketplace.js      ← Marketplace logic (Member 2)
│   ├── mylistings.js       ← Listings CRUD (Member 3)
│   └── shortlist.js        ← Shortlist logic (Member 4)
├── assets/
│   └── images/             ← Any local fallback images
└── README.md
```
  
### Shared JS Modules

**`firebase-config.js`** — imported by every page. Contains only:
```js
// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
import { getAuth } from "...";
import { getFirestore } from "...";

const firebaseConfig = { /* config object */ };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**`auth-guard.js`** — imported by index, marketplace, mylistings, shortlist:
```js
// auth-guard.js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "...";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

export function getCurrentUser() {
  return auth.currentUser;
}
```

> **Rule:** Every page JS file imports `auth-guard.js` first. This is Member 1's responsibility to document and enforce.

---

### Firestore Collections Design

#### Collection: `listings`
```
listings/
  {auto-id}/
    title:        string
    description:  string
    price:        string   ("$20" or "Trade for textbook")
    category:     string   ("Textbooks" | "Electronics" | "Furniture" | ...)
    imageURL:     string   (external URL or placeholder)
    sellerEmail:  string
    sellerUID:    string   ← used to filter out own items
    createdAt:    timestamp
```

#### Collection: `shortlists`
```
shortlists/
  {userUID}/          ← document ID = the logged-in user's UID
    items/            ← subcollection
      {listingID}/    ← document ID = the listing's Firestore ID
        title:        string   (denormalised copy for display)
        description:  string
        price:        string
        category:     string
        imageURL:     string
        sellerEmail:  string
        addedAt:      timestamp
```

> **Why subcollection?** Shortlists per user are isolated. No cross-user reads. Removal is a single `deleteDoc`. No compound queries needed.

#### Firestore Security Rules (Member 1 sets up)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone authenticated can read listings
    match /listings/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.sellerUID;
      allow create: if request.auth != null;
    }
    // Users can only read/write their own shortlist
    match /shortlists/{userId}/items/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## SECTION 2 — TEAM ROLE SPLIT

---

### MEMBER 1 — Authentication & Infrastructure Lead

**Role Title:** Auth & Infrastructure Lead

**Files Owned:**
- `login.html`
- `index.html`
- `js/firebase-config.js`
- `js/auth-guard.js`
- `README.md`

**Exact Responsibilities:**
- Set up the Firebase project (1 person does this to avoid config conflicts)
- Create the Firebase project in the console, enable Email/Password auth
- Write `firebase-config.js` and share the config object with the team via a private Discord/group chat message (never commit API keys to public repos)
- Write `auth-guard.js` — the redirect logic used on every page
- Build `login.html`: sign-in form with Firebase `signInWithEmailAndPassword`, sign-up form with `createUserWithEmailAndPassword`, error message display
- Build `index.html`: show `auth.currentUser.email`, nav links to all pages, sign-out button using `signOut(auth)`
- Set up the GitHub repository, branch strategy, `.gitignore`
- Create at least 3 test user accounts in Firebase Auth console
- Seed Firestore with at least 8 listings (minimum 3 categories) using the Firebase console or a one-time seed script
- Write and enforce Firestore security rules
- Coordinate integration between members (owns the `dev` branch merge process)

**Firebase Responsibilities:**
- Firebase project creation and configuration
- Firebase Auth setup (Email/Password provider)
- Firestore security rules
- Test user accounts
- Firestore seed data

**UI Responsibilities:**
- login.html: Bootstrap card-based login/register form, error alert display
- index.html: Bootstrap navbar, welcome message, nav cards/links, sign-out button

**Testing Responsibilities:**
- Test: unauthenticated users on all pages redirect to login.html
- Test: sign-up creates a new Firebase Auth user
- Test: login redirects to index.html
- Test: sign-out redirects to login.html
- Test: Firestore security rules block unauthorised access

**Presentation Responsibilities:**
- Explain Firebase project setup and auth flow
- Walk through `firebase-config.js` and `auth-guard.js` code live
- Explain why security rules are structured this way
- Demo: sign in, show index.html, sign out

**Estimated Workload: ~25%**

**Why Fair:** This member handles the most critical shared infrastructure. Every other member depends on their `firebase-config.js` output. The Firebase project setup, security rules, auth logic, and seeding are time-intensive but bounded tasks.

---

### MEMBER 2 — Marketplace Page Lead

**Role Title:** Marketplace & Firestore Query Lead

**Files Owned:**
- `marketplace.html`
- `js/marketplace.js`

**Exact Responsibilities:**
- Build `marketplace.html`: page layout with Bootstrap grid/cards
- Load all listings from Firestore in real-time using `onSnapshot` or `getDocs`
- **Filter out the signed-in user's own listings** using `where("sellerUID", "!=", auth.currentUser.uid)` — this is a key rubric point
- Render each listing card dynamically showing: title, description, price, category, image, seller email
- Implement the **shortlist button** on each card:
  - Check if item already shortlisted (`getDoc` on shortlist subcollection)
  - Prevent duplicates — disable or change button text if already shortlisted
  - Prevent shortlisting own items (button hidden or disabled)
  - On click: write to `shortlists/{uid}/items/{listingId}`
- Display category badges on cards
- Add optional category filter UI (dropdown to filter by category)

**Firebase Responsibilities:**
- Firestore query: `collection(db, "listings")` with `where` filter
- Firestore write: `setDoc(doc(db, "shortlists", uid, "items", listingId), data)`
- Firestore read: `getDoc(doc(db, "shortlists", uid, "items", listingId))` for duplicate check

**UI Responsibilities:**
- Bootstrap card grid for listings (responsive: 1-col mobile, 2-col tablet, 3-col desktop)
- "Add to Shortlist" button on each card with dynamic state
- Category badge/pill display

**Testing Responsibilities:**
- Test: own items do not appear in the marketplace
- Test: shortlist button is absent/disabled for own items
- Test: clicking shortlist adds item to Firestore shortlist subcollection
- Test: clicking shortlist again does NOT create duplicate
- Test: marketplace loads with at least 8 items for a test user with no listings

**Presentation Responsibilities:**
- Explain the Firestore query and why the `where` filter is used
- Walk through the shortlist button logic (duplicate prevention code)
- Explain how `onSnapshot` vs `getDocs` works (use whichever you implement)
- Demo: browse marketplace, shortlist an item, show button changes state

**Estimated Workload: ~25%**

**Why Fair:** The marketplace has the most complex Firebase logic in the project — filtered queries, duplicate-check reads, and shortlist writes. This is the highest-value page for rubric marks.

---

### MEMBER 3 — My Listings Page Lead

**Role Title:** Listings Management Lead

**Files Owned:**
- `mylistings.html`
- `js/mylistings.js`

**Exact Responsibilities:**
- Build `mylistings.html`: page layout, "Add Listing" form, listing table/cards
- Implement "Add New Listing" form: inputs for title, description, price, category, image URL
- On form submit: write to Firestore `listings` collection with `addDoc`, including `sellerUID: auth.currentUser.uid` and `sellerEmail: auth.currentUser.email`
- Load and display **only the current user's listings** using `where("sellerUID", "==", auth.currentUser.uid)`
- Implement **delete listing** functionality: `deleteDoc(doc(db, "listings", listingId))`
- Implement **edit listing** (optional but recommended for HD): pre-populate form, use `updateDoc`
- Validate form inputs (title not empty, price not empty, category selected)

**Firebase Responsibilities:**
- Firestore write: `addDoc(collection(db, "listings"), data)`
- Firestore read: `getDocs` with `where("sellerUID", "==", uid)`
- Firestore delete: `deleteDoc(doc(db, "listings", id))`
- Optionally: `updateDoc` for editing

**UI Responsibilities:**
- Bootstrap form for adding listings (modal or inline section)
- Table or card grid showing current user's own listings
- Delete button per listing
- Form validation feedback using Bootstrap's validation classes

**Testing Responsibilities:**
- Test: form submission creates a new Firestore document with correct sellerUID
- Test: only current user's listings appear (not other users' listings)
- Test: delete removes listing from Firestore and UI updates
- Test: blank form submission shows validation error, does not write to Firestore
- Test: new listing appears in marketplace for other users

**Presentation Responsibilities:**
- Explain the Firestore `addDoc` and `where` query code
- Explain why `sellerUID` is stored and why it matters for filtering
- Demo: add a new listing, show it appears in marketplace (switch user to verify), delete it

**Estimated Workload: ~25%**

**Why Fair:** My Listings involves full CRUD on Firestore, form handling, and input validation. It directly feeds the marketplace — Member 3's work is visibly testable end-to-end.

---

### MEMBER 4 — Shortlist Page & UI Consistency Lead

**Role Title:** Shortlist & Frontend Consistency Lead

**Files Owned:**
- `shortlist.html`
- `js/shortlist.js`
- `css/style.css`

**Exact Responsibilities:**
- Build `shortlist.html`: display all shortlisted items for the current user
- Load shortlist from Firestore: `collection(db, "shortlists", uid, "items")`
- Render each shortlisted item: title, description, price, category, image, seller email
- Implement **Remove from Shortlist** button: `deleteDoc(doc(db, "shortlists", uid, "items", itemId))`
- Show empty state message if shortlist is empty
- **Ensure UI consistency across all pages**: shared Bootstrap navbar on all 4 pages, consistent card styles, colour scheme, responsive behaviour
- Write `css/style.css` with any custom overrides applied consistently
- Write and maintain the shared `<nav>` HTML snippet — copy-paste into all pages, inform other members of updates

**Firebase Responsibilities:**
- Firestore read: `getDocs` or `onSnapshot` on `shortlists/{uid}/items`
- Firestore delete: `deleteDoc(doc(db, "shortlists", uid, "items", itemId))`

**UI Responsibilities:**
- shortlist.html card/table layout
- Shared navbar HTML (give final snippet to all members)
- `style.css` — Bootstrap variable overrides, consistent colours, card shadows
- Responsive layout verification across all pages (check in Chrome DevTools)
- Empty state UI ("Your shortlist is empty. Browse the marketplace!")

**Testing Responsibilities:**
- Test: shortlisted items appear correctly on shortlist.html
- Test: remove button deletes item from Firestore and removes card from UI
- Test: shortlist is empty for new user (empty state message shows)
- Test: shortlist persists after sign-out and sign-in again (Firestore persistence)
- Test: all pages display correctly on mobile (375px), tablet (768px), desktop (1280px)

**Presentation Responsibilities:**
- Explain the shortlist subcollection structure and the remove logic
- Explain the Firestore persistence — why data survives sign-out
- Walk through the UI consistency decisions (Bootstrap, colour choices)
- Demo: view shortlist, remove an item, show empty state

**Estimated Workload: ~25%**

**Why Fair:** Shortlist requires Firestore subcollection reads/deletes and full page build. The UI consistency role adds cross-cutting value that benefits the whole group's presentation quality and rubric marks.

---

## SECTION 3 — GIT/GITHUB WORKFLOW

### Branch Strategy
```
main          ← demo-ready only. Never commit directly to main.
dev           ← integration branch. All features merge here first.
feature/auth             ← Member 1
feature/marketplace      ← Member 2
feature/listings         ← Member 3
feature/shortlist        ← Member 4
```

### Merge Strategy
1. Each member works on their `feature/` branch only.
2. When a feature is complete and tested locally, open a Pull Request into `dev`.
3. **One other member** must review and approve before merge (rotate reviewers).
4. After all features merged into `dev` and integration-tested, one final PR from `dev` → `main`.
5. Never rebase published branches. Use `git merge` only.

### Commit Naming Conventions
```
feat: add shortlist remove button
feat: implement marketplace Firestore query
fix: correct auth redirect on login
fix: prevent duplicate shortlist add
style: apply consistent Bootstrap navbar
docs: add README setup instructions
```

### Pull Request Process
- PR title = commit message format above
- PR description must include: "What does this do?" + "How to test?"
- At least 1 approval required
- Resolve merge conflicts on the feature branch **before** requesting review

### Integration Process
- Member 1 shares `firebase-config.js` via Discord **by Day 3**
- All members copy-paste the config into their local `firebase-config.js`
- **Never commit `firebase-config.js` to a public repo** — add to `.gitignore` if repo is public, or keep repo private
- Member 4 shares the final `<nav>` HTML and `style.css` link by **Day 5**
- Integration checkpoint merges happen on **Day 7** and **Day 12** (see timeline)

### `.gitignore`
```
node_modules/
.env
firebase-config.js    ← only if repo is public
.DS_Store
```

---

## SECTION 4 — DEVELOPMENT TIMELINE

> **Assumption:** ~2 weeks of active development before submission/presentation.
> Adjust "Day X" to your actual calendar dates.

| Day | Milestone | Owner |
|-----|-----------|-------|
| **Day 1** | Project kickoff. Member 1 creates GitHub repo, invites all. Agree on Bootstrap theme/colours. Share assignment rubric breakdown. | All |
| **Day 2** | Member 1: Firebase project created, config shared via DM. All members clone repo, confirm Firebase config works. | M1 priority |
| **Day 3** | Member 1: `auth-guard.js`, `login.html`, `index.html` done. Member 4: `style.css` skeleton + navbar HTML shared. | M1, M4 |
| **Day 4-5** | Member 2: marketplace page layout + Firestore read. Member 3: mylistings form + Firestore write. Member 4: shortlist page layout. | M2, M3, M4 |
| **Day 6** | **Integration Checkpoint 1**: All members merge feature branches → `dev`. Resolve conflicts. Test: login → index → marketplace flow works. | All |
| **Day 7-8** | Member 2: shortlist button + duplicate prevention. Member 3: delete listing + validation. Member 4: remove shortlist + empty state. Member 1: Firestore security rules + seed 8 listings. | All |
| **Day 9** | Internal demo run. Every member presents their page in a video call. Identify broken links, UI inconsistencies. Write down what each person will say. | All |
| **Day 10** | **Integration Checkpoint 2**: Merge all into `dev`. Full end-to-end test with 3 test users. Fix any remaining bugs. | All |
| **Day 11** | Bug fixes only. No new features. Each member writes their code comments. Member 1 finalises README. | All |
| **Day 12** | Final merge `dev` → `main`. Tag release `v1.0`. Each member does a full walkthrough of their own code. | All |
| **Day 13** | **Dress rehearsal** — full presentation run-through in correct order. Time it. Aim for under the time limit. Fix awkward transitions. | All |
| **Day 14** | Buffer / last-minute fixes only. Rest before demo. | All |
| **Presentation Day** | Demo from `main` branch. Use Member 1's Firebase project (one live instance). Each member logs in as a different test user. | All |

---

## SECTION 5 — RISK MANAGEMENT

### Merge Conflict Prevention
- Each member owns **separate files**. Conflicts should only happen in `index.html` navbar or shared CSS.
- Rule: Only Member 4 edits `style.css`. Others request changes via Discord.
- Rule: Navbar HTML is copy-pasted — changes announced in group chat before editing.
- If a conflict occurs: the person who created the conflict resolves it on their branch before merging.

### Firebase Configuration Risks
- **Risk:** Two members initialise Firebase separately → two projects, two databases.
- **Mitigation:** Member 1 is the SOLE person who creates the Firebase project and shares the config.
- **Risk:** Firebase API keys accidentally committed to a public GitHub repo.
- **Mitigation:** Keep repo **private**. If public, add `firebase-config.js` to `.gitignore` and share config via private message only.
- **Risk:** Firestore security rules are too open or too restrictive.
- **Mitigation:** Member 1 tests rules with the Firebase Rules Playground before Day 7.

### Authentication Risks
- **Risk:** `auth.currentUser` is `null` on page load due to async Firebase initialisation.
- **Mitigation:** Always wrap page logic inside `onAuthStateChanged(auth, (user) => { ... })` — never access `auth.currentUser` directly outside this callback.
- **Risk:** Test users get deleted or passwords forgotten.
- **Mitigation:** Document 3 test accounts (email + password) in a private shared note (not in the repo).

### Demo-Day Failure Prevention
- Demo from a **single laptop** (Member 1's, which has the Firebase project set up).
- Test the demo on that exact laptop the day before.
- Have the Firebase console open in a browser tab to show Firestore data live.
- Prepare a **backup video recording** of the full demo workflow (use OBS/Loom). If live demo fails, play the video.
- Ensure the laptop is charged, and have a phone hotspot ready if the venue WiFi is unreliable.

### What If a Member Disappears
- **Before Day 7:** Redistribute their feature page. Each remaining member adds ~8% extra work. Prioritise: marketplace (highest rubric marks) and shortlist (second highest). Login and mylistings can be simplified.
- **After Day 7:** If their code exists on the `dev` branch, other members complete it. Inform the tutor honestly.
- **Contingency:** Each member should understand the full Firebase flow (reading/writing Firestore), not just their own page. Integration Checkpoint 1 on Day 6 ensures cross-knowledge.

---

## SECTION 6 — PRESENTATION STRATEGY

### Exact Speaking Allocation (assume 15-20 min total)

| Segment | Duration | Speaker |
|---------|----------|---------|
| Introduction — what the app is, team roles | 1 min | Member 1 |
| Demo: Sign up / Sign in flow, index.html | 2 min | Member 1 |
| Demo: Marketplace — loading, filtering, shortlisting | 3 min | Member 2 |
| Demo: My Listings — add, display, delete | 3 min | Member 3 |
| Demo: Shortlist — view, remove, persistence | 2 min | Member 4 |
| Code walkthrough: auth-guard + firebase-config | 2 min | Member 1 |
| Code walkthrough: Firestore query + shortlist button | 2 min | Member 2 |
| Code walkthrough: addDoc + delete + filter | 2 min | Member 3 |
| Code walkthrough: shortlist subcollection + CSS | 1 min | Member 4 |
| Q&A / wrap-up | remaining | All |

### Demo Sequence (critical — follow this order)
1. Open app as **User A** (who has listings in Firestore already)
2. Sign in as **User B**
3. Show index.html — User B's email displayed, nav links visible
4. Go to marketplace — User A's items visible, User B's own items absent
5. Shortlist an item — button changes, Firestore console shows write
6. Go to shortlist.html — item appears
7. Remove item from shortlist — item disappears
8. Go to mylistings.html — add a new listing, it appears in the list
9. Go to marketplace as User A (open incognito tab) — User B's new listing now visible
10. Sign out — redirect to login.html

### Who Explains Which Code
- **Member 1:** `onAuthStateChanged` callback, `signInWithEmailAndPassword`, the redirect logic in `auth-guard.js`, Firestore security rules
- **Member 2:** `where("sellerUID", "!=", currentUser.uid)` query, the shortlist duplicate check `getDoc`, `setDoc` to the shortlist subcollection
- **Member 3:** `addDoc` with `sellerUID` and `sellerEmail` fields, `where("sellerUID", "==", uid)` for mylistings, `deleteDoc` for listing removal
- **Member 4:** Subcollection path `shortlists/{uid}/items`, `deleteDoc` for shortlist removal, Bootstrap responsive grid classes used, `onSnapshot` vs `getDocs` choice

### Likely Tutor Questions and How to Answer

| Question | Who Answers | Answer |
|----------|-------------|--------|
| "What happens if an unauthenticated user goes to marketplace.html?" | Member 1 | `auth-guard.js` uses `onAuthStateChanged` — if no user, redirect to login.html immediately |
| "Why did you use a subcollection for shortlists?" | Member 4 | Each user's shortlist is isolated. Reads are scoped to `shortlists/{uid}/items` — no cross-user data exposure. Deletion is a single `deleteDoc`. |
| "How do you prevent a user from seeing their own items in the marketplace?" | Member 2 | Firestore query uses `where("sellerUID", "!=", auth.currentUser.uid)` to exclude them |
| "How do you prevent duplicate shortlisting?" | Member 2 | Before adding, `getDoc` checks if the listing already exists in `shortlists/{uid}/items/{listingId}`. If doc exists, the button is disabled/hidden. |
| "How is Firestore data structured?" | Member 1 | Two collections: `listings` (flat) and `shortlists` (per-user subcollection). Each listing stores `sellerUID` for filtering. |
| "What security rules did you implement?" | Member 1 | Users can only read/write their own shortlist subcollection. Listings are readable by any authenticated user but only writable by the seller. |
| "Could this app be improved?" | Any | Yes — image upload via Firebase Storage instead of URLs, real-time `onSnapshot` listeners instead of one-time reads, pagination for large datasets. |

---

## SECTION 7 — HIGH DISTINCTION STRATEGY

### What Separates HD from Distinction

| Factor | Distinction | High Distinction |
|--------|-------------|-----------------|
| Firestore filtering | Uses `where` correctly | Correct `where` + duplicate check + own-item prevention all work flawlessly |
| Auth | Redirects work | Redirects work + `onAuthStateChanged` used properly everywhere + no race conditions |
| Shortlist | Add works | Add + remove + Firestore persistence verified + empty state shown |
| Code quality | Works but messy | Commented, structured, no dead code, consistent naming |
| Presentation | Explains what the code does | Explains **why** each technical decision was made |
| UI | Functional | Consistent Bootstrap theme, responsive, polished empty states |
| Live demo | Works with one user | Demo shows 2+ users, proves cross-user isolation, shows Firestore console |

### Common Mistakes Groups Make
1. **Using `auth.currentUser` outside `onAuthStateChanged`** — returns `null` on page load, breaking all logic. Wrap everything.
2. **Not filtering own items from marketplace** — most visible rubric fail.
3. **Shortlist duplicates allowed** — easy to forget the duplicate check.
4. **All members explain only their own page, can't answer about the shared modules** — tutors probe this. Every member must understand `auth-guard.js` and the Firestore data structure.
5. **Demo crashes on presentation day** — no backup. Always have a recorded video.
6. **No seed data for other users** — marketplace looks empty. Pre-seed 8 items from 3 different UIDs.
7. **Security rules left as "allow all"** — trivial to fix, costs marks if ignored.

### How to Maximise Marks Efficiently

**Highest rubric ROI (do these first, perfectly):**
1. Auth redirects on every page — easy, high marks
2. Marketplace filter (own items excluded) — core requirement
3. Shortlist add + duplicate prevention — explicitly in rubric
4. Shortlist remove + Firestore persistence — explicitly in rubric

**Medium ROI (do after the above):**
5. Clean, commented code — fast to add at the end
6. Consistent UI — Member 4 handles, minimal extra work
7. Firestore security rules — 30-minute task, high signal

**Lower ROI (only if time allows):**
8. Edit listing functionality
9. Category filter dropdown on marketplace
10. Real-time `onSnapshot` instead of `getDocs`

### Features That Deserve the Most Attention
- **`auth-guard.js`**: Used on every page. If it breaks, everything breaks. Test it obsessively.
- **Marketplace filter query**: The `where("sellerUID", "!=", ...)` query requires a Firestore composite index in some configurations. Test this early — index creation takes a few minutes and Firebase will give you a console link to create it.
- **Shortlist duplicate prevention**: This is explicitly called out in the spec. A 5-line check earns significant marks.

---

## SECTION 8 — FINAL RECOMMENDED TASK SPLIT TABLE

| Member | Role | Files Owned | Core Firebase Skill | Presentation Part |
|--------|------|-------------|--------------------|--------------------|
| **Member 1** | Auth & Infrastructure Lead | `login.html`, `index.html`, `firebase-config.js`, `auth-guard.js` | Firebase project setup, Auth (`signIn`, `signOut`, `onAuthStateChanged`), security rules, seed data | Sign-in flow demo + auth code walkthrough |
| **Member 2** | Marketplace Lead | `marketplace.html`, `marketplace.js` | Firestore filtered query (`where !=`), shortlist write (`setDoc`), duplicate check (`getDoc`) | Marketplace demo + filtered query + shortlist button code |
| **Member 3** | Listings Management Lead | `mylistings.html`, `mylistings.js` | Firestore `addDoc`, `where ==` query, `deleteDoc` | My Listings demo + CRUD code walkthrough |
| **Member 4** | Shortlist & UI Lead | `shortlist.html`, `shortlist.js`, `style.css` | Firestore subcollection read, `deleteDoc`, UI persistence | Shortlist demo + subcollection structure + CSS/Bootstrap explanation |

---

## APPENDIX — Quick Firebase Code Reference

### Auth guard pattern (use on every protected page)
```js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  // All page logic goes here, inside this callback
  loadPageContent(user);
});
```

### Load marketplace items (excluding own)
```js
import { db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://...firebase-firestore.js";

async function loadMarketplace(currentUID) {
  const q = query(
    collection(db, "listings"),
    where("sellerUID", "!=", currentUID)
  );
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => renderCard(doc.id, doc.data()));
}
```

### Add to shortlist with duplicate check
```js
import { db } from "./firebase-config.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://...firebase-firestore.js";

async function addToShortlist(userUID, listingId, listingData) {
  const shortlistRef = doc(db, "shortlists", userUID, "items", listingId);
  const existing = await getDoc(shortlistRef);
  if (existing.exists()) {
    alert("Already in your shortlist.");
    return;
  }
  await setDoc(shortlistRef, { ...listingData, addedAt: serverTimestamp() });
}
```

### Load and display shortlist
```js
async function loadShortlist(userUID) {
  const itemsRef = collection(db, "shortlists", userUID, "items");
  const snapshot = await getDocs(itemsRef);
  if (snapshot.empty) {
    document.getElementById("empty-msg").style.display = "block";
    return;
  }
  snapshot.forEach(doc => renderShortlistCard(doc.id, doc.data()));
}
```

### Remove from shortlist
```js
import { db } from "./firebase-config.js";
import { doc, deleteDoc } from "https://...firebase-firestore.js";

async function removeFromShortlist(userUID, listingId) {
  await deleteDoc(doc(db, "shortlists", userUID, "items", listingId));
  document.getElementById(`card-${listingId}`).remove();
}
```

---

*Last updated: Session 1 2026 — COMP2750/6750 Campus Marketplace*
