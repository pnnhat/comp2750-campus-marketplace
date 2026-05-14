# COMP2750/6750 Campus Marketplace — Team Schedule & Collaboration Plan
**4 Members | Week 9–13 | Submission + Live Presentation in Week 13**

> **Current status:** End of Week 9 — architecture decided, tasks split, GitHub repo created.
> **Mandatory meeting:** Every week, after tutorial, physical, 5:00 PM – 7:00 PM.

---

## SECTION 1 — OVERALL STRATEGY

### Development Philosophy

**"Ship small, integrate early, never surprise your team."**

The single biggest failure mode for student group projects is everyone building in isolation for 3 weeks then trying to glue it together the night before the demo. This schedule is designed to prevent exactly that.

Three principles drive everything:

1. **Individual work happens between meetings.** The weekly 2-hour meeting is NOT a coding session — it is a sync, demo, merge, and test session. Code gets written alone, on your own time, between meetings.

2. **Integration happens on a schedule, not ad hoc.** There are two planned integration checkpoints (Week 10 and Week 11). After Week 11 the codebase is frozen for new features — only bug fixes.

3. **Every member must be able to explain every shared module.** `firebase-config.js` and `auth-guard.js` affect every page. By Week 11 everyone must be able to answer tutor questions about them, not just Member 1.

### How to Avoid Last-Minute Disasters

The schedule is structured so that by the **end of Week 11**:
- All features are complete
- All features are integrated and working together
- All members have reviewed each other's code
- At least one full run-through has happened

Week 12 and Week 13 are reserved exclusively for polishing, rehearsal, and contingency. If everything goes right, Week 12 is relaxed. If something breaks, you have two weeks to fix it — not two hours.

### Balancing Individual and Group Work

Each member has a clear solo task list (see PROJECT_PLAN.md). The meetings exist to:
- Unblock each other (30 min max per blocker)
- Merge branches and test integration
- Rehearse the demo
- Share knowledge so everyone can explain the full app

**Expectation per member per week (non-meeting time):**
- Week 10: ~4–6 hours solo coding
- Week 11: ~3–4 hours solo coding + reviewing others' code
- Week 12: ~1–2 hours polishing + rehearsal prep
- Week 13: ~1 hour prep before presentation

This is realistic for students with other commitments. The scope is intentionally small.

---

## SECTION 2 — WEEK-BY-WEEK PLAN

---

### WEEK 9 — Planning & Setup
**Status: Completing now**

**Goals:**
- Architecture and role split agreed (done)
- GitHub repository created with correct branch structure
- Firebase project created by Member 1
- Firebase config shared privately with all members
- All members can run the project locally (even if it's just a blank HTML page with Firebase connected)

**Deliverables by end of Week 9 meeting:**
- [ ] GitHub repo exists, all 4 members have push access
- [ ] Branch structure: `main`, `dev`, `feature/auth`, `feature/marketplace`, `feature/listings`, `feature/shortlist`
- [ ] `firebase-config.js` working and shared with all members via private message
- [ ] All members have cloned the repo, checked out their feature branch, confirmed no Firebase errors in browser console
- [ ] `.gitignore` includes `firebase-config.js` (if repo is public)
- [ ] File structure scaffolded: empty HTML files exist for all 5 pages
- [ ] Shared `<nav>` HTML agreed (Member 4 provides a draft)
- [ ] 3 test user accounts created in Firebase Auth console (emails + passwords noted privately)

**Meeting Objectives (Week 9, 5–7pm):**
- Member 1 shares Firebase config live (everyone pastes it in, tests it works)
- Walk through the folder structure and agreed file names
- Each member confirms their feature branch is set up
- Agree on Bootstrap theme/colour — 10 minutes, make a decision and move on
- Member 4 shares nav HTML snippet — everyone adds it to their HTML file before leaving
- Agree on commit naming convention (`feat:`, `fix:`, `style:`, `docs:`)

**Coding Milestones to Complete BEFORE Week 10 meeting:**
- Member 1: `login.html` functional (sign in + sign up working with Firebase Auth)
- Member 1: `index.html` shows logged-in user's email, has sign-out button
- Member 1: `auth-guard.js` written and working
- Member 2: `marketplace.html` skeleton layout (Bootstrap grid, cards — no Firebase yet)
- Member 3: `mylistings.html` skeleton + form layout (no Firebase yet)
- Member 4: `shortlist.html` skeleton, `style.css` with consistent Bootstrap theme

**Risk Level: LOW** — Planning only, no integration yet.

---

### WEEK 10 — Core Features + First Integration Checkpoint
**Status: Active development week — most important week**

**Goals:**
- All 4 pages have their core feature working
- Firestore data is live (seed data in place)
- **First integration merge into `dev` branch by mid-week**
- Cross-page navigation working end-to-end

**Deliverables by end of Week 10 meeting:**
- [ ] Member 1: `auth-guard.js` imported and working on ALL 4 protected pages
- [ ] Member 2: Marketplace loads listings from Firestore (correct `where` filter — own items excluded)
- [ ] Member 3: `mylistings.html` loads current user's listings from Firestore, add form writes to Firestore
- [ ] Member 4: `shortlist.html` loads shortlist items from Firestore
- [ ] **All 4 feature branches merged into `dev`** (integration checkpoint 1)
- [ ] Full user flow tested: login → index → marketplace → shortlist → mylistings → logout
- [ ] Member 1 seeds at least 8 Firestore listing documents across 3 categories and 3 test UIDs

**Mid-week task (before the meeting, ~Wednesday/Thursday):**
Each member merges their `feature/` branch into `dev` independently:
1. Pull latest `dev`
2. Merge your feature branch into `dev` locally
3. Resolve any conflicts (should be minimal — separate files)
4. Push to `dev`
5. Post in group chat: "Merged ✓"
6. Everyone pulls `dev` and tests their page still works

**Meeting Objectives (Week 10, 5–7pm):**

| Time | Activity |
|------|----------|
| 5:00–5:15 | Status check — each member: "done / stuck / blocked on X" (1 min each) |
| 5:15–5:45 | Live demo on one laptop: click through the full user flow. Find what's broken. |
| 5:45–6:15 | Fix the top 2–3 bugs together (live coding if needed) |
| 6:15–6:45 | Member 2 adds shortlist button logic; Member 3 adds delete listing; review together |
| 6:45–7:00 | Agree on exactly what each person finishes before Week 11 |

**What MUST be working before leaving the Week 10 meeting:**
- Login and sign-out
- Marketplace loads data (even if shortlist button not yet working)
- My Listings shows the current user's data

**Coding Milestones to Complete BEFORE Week 11 meeting:**
- Member 2: Shortlist button fully working (add to shortlist, duplicate prevention, own-item prevention)
- Member 3: Delete listing working; form validation done
- Member 4: Remove from shortlist working; empty state shown; shortlist persistence verified
- Member 1: Firestore security rules live; confirm all auth-guards work correctly
- All members: Code has inline comments explaining the Firebase calls

**Risk Level: HIGH** — First integration. Most likely point for things to break.

---

### WEEK 11 — Feature Complete + Code Review + Second Integration
**Status: Polish and lock down**

**Goals:**
- Every feature from the spec is complete
- Full end-to-end test with 3 different test users
- **All code reviewed by at least one other member**
- **Feature freeze** — no new features after the Week 11 meeting
- `dev` merged to `main` at the end of this week

**Deliverables by end of Week 11 meeting:**
- [ ] All features complete and working (see full checklist in Appendix)
- [ ] Code is commented — every Firebase call has a one-line comment explaining what it does
- [ ] Every member has read through at least one other member's JS file
- [ ] 3-user end-to-end test completed (User A's items hidden from User A, shortlist persists, etc.)
- [ ] `dev` → `main` PR created and merged
- [ ] README.md complete with setup instructions
- [ ] Figma designs in progress (individual component — separate deliverable)

**Mid-week task (before the meeting, ~Wednesday/Thursday):**
Cross-review session — each member reads one other member's JS file for 30 minutes:
- Member 1 reviews Member 4's `shortlist.js`
- Member 2 reviews Member 3's `mylistings.js`
- Member 3 reviews Member 1's `auth-guard.js`
- Member 4 reviews Member 2's `marketplace.js`

Post a comment in the group chat: "Reviewed M2's code — understood the `where !=` query, the duplicate check flow."

**Meeting Objectives (Week 11, 5–7pm):**

| Time | Activity |
|------|----------|
| 5:00–5:10 | Each member: "My feature is complete / incomplete — here's what's left" |
| 5:10–5:40 | Full 3-user demo: User A adds listings, User B shortlists them, User A can't see their own items, User B removes from shortlist |
| 5:40–6:00 | Code review feedback — each person explains what they learned from reading another member's code |
| 6:00–6:30 | Fix any remaining bugs. Hard stop: no new features after this meeting. |
| 6:30–6:45 | Merge `dev` → `main` together (one person shares screen, everyone watches) |
| 6:45–7:00 | **First presentation run-through** — each member explains their feature in 60 seconds |

**What MUST be working before leaving the Week 11 meeting:**
- Full spec is complete
- `main` branch has a fully working application
- Every member can articulate what their code does in 60 seconds

**Risk Level: MEDIUM** — If something is still broken after this meeting, you have all of Week 12 to fix it.

---

### WEEK 12 — Presentation Rehearsal + Bug Fixes
**Status: No new code. Polish and practice only.**

**Goals:**
- Two full dress rehearsals of the presentation
- Every member knows exactly what they will say and in what order
- Demo sequence practiced until it is muscle memory
- Figma individual component complete (or very close)
- All test user credentials verified and noted

**Deliverables by end of Week 12 meeting:**
- [ ] Full presentation rehearsal done in meeting (timed — should fit within the time limit)
- [ ] Demo laptop identified (who presents from which machine)
- [ ] Backup video recorded (OBS/Loom — full demo walkthrough, saved locally AND in group chat)
- [ ] Each member can answer the 7 tutor questions from PROJECT_PLAN.md Section 6
- [ ] Test user credentials (3 accounts) confirmed and working
- [ ] Figma individual component: at minimum 80% done

**Coding work this week:** Bug fixes ONLY. If it requires adding new code beyond a single function, defer it and present what works.

**Meeting Objectives (Week 12, 5–7pm):**

| Time | Activity |
|------|----------|
| 5:00–5:10 | Quick check: any new bugs since last week? Assign fixes (15 min cap). |
| 5:10–6:00 | **Full presentation rehearsal #1** — everyone presents as if it's the real thing. Time it. |
| 6:00–6:10 | Debrief: what was unclear? What transitions were awkward? What needs more confidence? |
| 6:10–6:50 | **Full presentation rehearsal #2** — fix the issues from debrief. |
| 6:50–7:00 | Record the backup demo video. Assign: who brings which laptop on presentation day. |

**What MUST be done before leaving the Week 12 meeting:**
- Two full rehearsals completed
- Backup video recorded
- Demo laptop confirmed

**Risk Level: LOW** — Code is frozen. Only rehearsal and polish.

---

### WEEK 13 — Final Submission + Live Presentation
**Status: Execution only. Trust the preparation.**

**Goals:**
- Submit on time
- Deliver a confident, smooth live demo
- Every member explains their own contribution clearly

**Pre-presentation day (day before or morning of):**
- Pull `main` branch on the demo laptop
- Run through the demo sequence once (not twice — avoid over-rehearsing and creating anxiety)
- Confirm Firebase is live (check Firebase console)
- Confirm all 3 test user logins work
- Charge the laptop. Have phone hotspot as backup internet.
- Have the backup video accessible (locally saved, not relying on internet to stream)

**On presentation day:**
- Arrive early
- Set up on the demo laptop
- Do NOT make any code changes on the day
- If something breaks that didn't break yesterday: use the backup video
- Each member introduces themselves, explains their role, then demos their feature

**After presentation:**
- Push any final cleanup to `main` if required by submission
- Submit all required files (check exact submission requirements in the unit outline)

**Risk Level: LOW if Week 11–12 were done well. HIGH if they weren't.**

---

## SECTION 3 — MANDATORY WEEKLY MEETING PLAN (5:00–7:00 PM)

This is the template for every post-tutorial meeting. Adapt based on the week.

### Meeting Template (2 Hours)

```
5:00 – 5:10  │ STATUS CHECK (10 min)
5:10 – 5:50  │ LIVE DEMO & INTEGRATION (40 min)
5:50 – 6:20  │ BLOCKED ISSUES / DEBUGGING (30 min)
6:20 – 6:50  │ WEEK 11+: REHEARSAL BLOCK (30 min)
6:50 – 7:00  │ NEXT WEEK COMMITMENTS (10 min)
```

---

#### 5:00–5:10 — Status Check (10 min)
**Purpose:** Quickly surface what's done, what's not, and what's blocking people.

Each member answers in 60 seconds or less:
1. "I completed: [list]"
2. "I'm stuck on: [one specific thing, or 'nothing']"
3. "I need: [help from a specific person, or 'nothing']"

**Rule:** No long explanations during status check. If it takes more than 60 seconds, it goes into the next block.

**Who speaks:** All 4 members, Member 1 goes first (as infrastructure lead).

---

#### 5:10–5:50 — Live Demo & Integration (40 min)
**Purpose:** See the actual state of the app. Find problems before they become emergencies.

- One laptop, one browser, one person drives the demo
- Rotate who drives each week
- Everyone watches — call out bugs as they appear
- Week 9: just check Firebase config works
- Week 10: click through full user flow (even if broken)
- Week 11: full 3-user demo
- Week 12+: presentation rehearsal (this block becomes the rehearsal)

**What must be demonstrated each week:**
- Week 9: Firebase connected, nav works, login page loads
- Week 10: Auth flow + marketplace loading from Firestore
- Week 11: Complete spec — all 5 pages, 3 users, shortlist persistence
- Week 12: Full rehearsal run-through

**Who drives:** Rotate each week. Suggested: M1 (W9) → M2 (W10) → M3 (W11) → M4 (W12).

---

#### 5:50–6:20 — Blocked Issues / Debugging (30 min)
**Purpose:** Resolve technical blockers as a group.

**Rules:**
- Maximum 15 minutes per problem. If unsolved after 15 min, assign it as solo homework.
- The person with the problem explains it first (2 min). Others suggest solutions.
- Use this time for: merge conflicts, Firebase query errors, auth issues, UI problems.
- Do NOT use this time for: adding new features, redesigning things that work.

**Week 12 onward:** Replace this block with **Rehearsal Debrief** — 30 min of "what was unclear in the run-through" and targeted practice for weak spots.

---

#### 6:20–6:50 — Rehearsal Block (30 min) [WEEK 11 ONWARD]

**Week 10:** Use this time to do the mid-week merge together if it wasn't done beforehand.

**Week 11:** First spoken presentation run-through. Each person has 3–4 minutes. No slides needed — just speak to the code.

**Week 12:** Full timed rehearsal. Practice transitions between speakers. Practice the demo sequence.

**Week 13 meeting (if there is one before the presentation):** Single run-through of the demo sequence only — no full presentation.

---

#### 6:50–7:00 — Next Week Commitments (10 min)
**Purpose:** Leave with a specific, written list of what each person will do before the next meeting.

Each member states out loud:
- "Before next meeting I will complete: [specific task]"
- "I will have it done by: [day of week]"

Someone writes this in the group chat **immediately** after the meeting so it's documented.

**Example commitment format:**
> M2: "Shortlist button working with duplicate check — done by Thursday."
> M3: "Delete listing + form validation — done by Wednesday."

**Rule:** If you said you'd do it and you don't — post in the group chat by the next day saying "not done yet, here's why, here's the new ETA." No surprises at the next meeting.

---

## SECTION 4 — ADDITIONAL MEETINGS

Beyond the mandatory weekly meeting, recommend only what's actually needed.

### Recommended Additional Sessions

---

#### Week 10 — Mid-Week Integration Sync (Online, ~45 min)
**When:** Wednesday or Thursday (2–3 days after the Week 10 mandatory meeting)
**Format:** Discord/Teams voice call — optional to turn on camera
**Duration:** 45 minutes maximum
**Purpose:** First integration merge into `dev`. Everyone merges their branch, pulls `dev`, tests their page still works.

**Agenda:**
- 0:00–0:10: Each member confirms their feature branch is ready to merge
- 0:10–0:30: Everyone merges simultaneously (share screen if confused)
- 0:30–0:45: Each member tests the integrated `dev` branch locally — report any broken pages

**Who must attend:** All 4 (this is the most important session of the whole project)
**Who can skip:** No one

---

#### Week 11 — Code Review Exchange (Async, ~30 min each)
**When:** Tuesday–Wednesday (before the Week 11 mandatory meeting)
**Format:** Async — read on your own time, post in group chat
**Duration:** 30 minutes per person
**Purpose:** Each member reads one other member's JS file so they can answer tutor questions about shared modules

Pairs:
- M1 reads `shortlist.js` (M4's)
- M2 reads `mylistings.js` (M3's)
- M3 reads `auth-guard.js` (M1's)
- M4 reads `marketplace.js` (M2's)

**Deliverable:** Post one sentence in the group chat: "I read [file] and I understand [key logic]. Question for [member]: [one question if any]."

---

#### Week 12 — Second Rehearsal (Online, 1 hour)
**When:** 2–3 days after the Week 12 mandatory meeting
**Format:** Video call with screen sharing
**Duration:** 1 hour
**Purpose:** Second full rehearsal to lock in the demo sequence and individual explanations

**Agenda:**
- Full run-through of the presentation (all 4 members speak)
- Practice answering the 7 tutor questions (see PROJECT_PLAN.md Section 6)
- Time the whole thing — if over the limit, cut content now

**Who must attend:** All 4
**Who can skip:** No one — this is the second-to-last rehearsal

---

#### Week 13 — Pre-Presentation Sanity Check (Online or in-person, 30 min)
**When:** The day before presentation OR morning of (2+ hours before)
**Format:** Video call or physical
**Duration:** 30 minutes
**Purpose:** One final demo run on the exact laptop being used for presentation

**Agenda:**
- Pull `main` on demo laptop
- Run through demo sequence once (not a rehearsal — just confirm it works)
- Confirm all 3 test user logins work
- Confirm Firebase console is accessible
- Confirm backup video is downloaded locally

**Who must attend:** All 4 (or at minimum, the person running the demo laptop)

---

#### Emergency Debugging Session (As-needed)
**When:** Any time a major blocker appears (e.g., Firebase queries returning no data, auth redirect infinite loop)
**Format:** Whoever is available hops on a call immediately
**Duration:** 30–45 min — if unresolved, post in group chat and move on to other work
**Trigger:** A member posts in group chat "I'm completely stuck on X and can't proceed." Within 24 hours, at least one other member responds.

**Rule:** Don't silently stay stuck for 2 days. Post in the group chat within 12 hours of being blocked.

---

## SECTION 5 — GITHUB + INTEGRATION STRATEGY

### Branch Structure

```
main          ← live demo branch. Only touched in Week 11 (final merge) and Week 13 (hotfixes only)
dev           ← integration branch. Features merge here.
feature/auth             ← Member 1
feature/marketplace      ← Member 2
feature/listings         ← Member 3
feature/shortlist        ← Member 4
```

### Merge Timing

| When | What | Who |
|------|------|-----|
| End of Week 9 | Scaffold files pushed to each feature branch | Each member |
| Mid-Week 10 (Wed/Thu) | All feature branches → `dev` (Integration Checkpoint 1) | All, simultaneously |
| End of Week 10 meeting | `dev` tested and stable | All |
| Mid-Week 11 (Wed/Thu) | Updated feature branches → `dev` (Integration Checkpoint 2) | All |
| Week 11 meeting | `dev` → `main` (final merge) | M1 (shares screen) |
| Week 13 only | Hotfix directly to `main` if absolutely necessary | M1 only |

### When NOT to Merge

- **Do not merge to `dev` if your feature is broken.** Broken code on `dev` blocks everyone. If your feature is incomplete, wait until it works on your local machine first.
- **Do not merge to `main` before the Week 11 meeting.** `main` stays clean until the final integration.
- **Do not merge to `main` on presentation day.** The version on `main` the day before is the version you present.

### Integration Freeze

**After the Week 11 meeting: feature freeze.**

- No new pages, no new Firestore collections, no new features.
- Only bug fixes are permitted.
- If a feature isn't working by the Week 11 meeting: scope it out of the presentation. Present what works confidently rather than presenting broken features apologetically.

### Backup Strategy

- Each member keeps their feature branch alive even after merging to `dev`. If `dev` breaks, you can roll back.
- `main` is never touched except at the Week 11 merge and Week 13 hotfixes.
- Every member has a local copy of the repo cloned. If GitHub goes down, you can still demo locally.
- Backup video recorded in Week 12 meeting is the last line of defence.

### Firebase Collaboration Strategy

- **One Firebase project, one config.** Member 1 creates it. Everyone else uses the same config.
- **Never create a second Firebase project.** It will have a different Firestore database and your data won't be shared.
- **Test data is in the shared Firebase project.** If you accidentally delete seed data, Member 1 re-seeds it.
- **Firestore security rules** are edited only by Member 1. Changes are announced in group chat before applying.
- **Firebase console access:** Member 1 shares the Firebase project with other members as "Viewer" role — they can see Firestore data but can't break the config.

---

## SECTION 6 — PRESENTATION PREPARATION

### Rehearsal Schedule

| Rehearsal | When | Format | Duration | Goal |
|-----------|------|--------|----------|------|
| **Run-through #1** | Week 11 meeting (6:20–6:50) | Physical | 30 min | Everyone speaks, find gaps in knowledge |
| **Run-through #2** | Week 12 meeting (5:10–6:10) | Physical | 60 min | Full timed rehearsal, fix awkward transitions |
| **Run-through #3** | 2–3 days after Week 12 meeting | Online | 60 min | Lock in the demo sequence, answer tutor questions |
| **Sanity check** | Day before or morning of presentation | Physical or online | 30 min | Confirm everything still works |

**4 rehearsals total.** This sounds like a lot — it isn't. Each run-through is 20–30 minutes of actual speaking time. The rest is debrief and fixes.

### Demo Sequence

Practice this exact sequence until everyone knows it by heart:

```
1. Open app as User A (who already has listings seeded in Firestore)
2. Sign in as User B
3. Show index.html — User B's email displayed, all nav links visible
4. Go to marketplace.html
   → User A's items appear
   → User B's own items are NOT shown (point this out explicitly)
   → Click "Add to Shortlist" on one item → button changes state
   → Try clicking again → show duplicate prevention
5. Go to shortlist.html
   → Item appears
   → Open Firebase console on another tab — show the Firestore document live
   → Click "Remove" → item disappears
6. Go to mylistings.html
   → Current user's listings only
   → Add a new listing via the form
   → New listing appears in the list
7. Open an incognito tab, sign in as User A
   → Go to marketplace → User B's new listing now visible
   → Try to see User B's shortlist (fails — Firestore rules block it)
8. Sign out as User B → redirect to login.html
```

**Total demo time: ~5–7 minutes.** Practice until it takes consistently less than 7 minutes.

### Who Demos Which Feature

| Segment | Speaker | What they show |
|---------|---------|----------------|
| Introduction (1 min) | Member 1 | App overview, Firebase project in console |
| Login + Index demo (2 min) | Member 1 | Sign in, show email on index, auth redirect |
| Marketplace demo (3 min) | Member 2 | Listings load, own-item filter, shortlist button |
| My Listings demo (2 min) | Member 3 | Add listing, list appears, delete listing |
| Shortlist demo (2 min) | Member 4 | View shortlist, remove item, empty state |
| Code walkthrough — auth (1.5 min) | Member 1 | `auth-guard.js` — `onAuthStateChanged`, redirect logic |
| Code walkthrough — query + shortlist (1.5 min) | Member 2 | `where !=` filter, duplicate check code |
| Code walkthrough — CRUD (1.5 min) | Member 3 | `addDoc`, `where ==`, `deleteDoc` |
| Code walkthrough — subcollection (1 min) | Member 4 | Shortlist subcollection path, remove logic |

### How to Prepare for Tutor Questions

Every member must be able to answer these 7 questions **without looking at notes**:

1. "What happens if an unauthenticated user goes directly to marketplace.html?"
   → `auth-guard.js` detects no user in `onAuthStateChanged` and redirects to `login.html` immediately.

2. "How do you prevent a user from seeing their own items?"
   → Firestore query uses `where("sellerUID", "!=", auth.currentUser.uid)`. Only documents from other users are returned.

3. "How do you prevent duplicate shortlisting?"
   → Before writing to Firestore, `getDoc` checks if the document already exists at `shortlists/{uid}/items/{listingId}`. If it exists, the write is skipped.

4. "Why did you use a subcollection for shortlists?"
   → Each user's shortlist is isolated under their own UID. Reads are scoped to only their data. Deletion is a single `deleteDoc`. No other user's data is ever returned.

5. "What are your Firestore security rules?"
   → Listings: authenticated users can read all, only the seller (matching `sellerUID`) can update/delete. Shortlists: only the user whose UID matches the document path can read or write.

6. "How does Firebase Authentication work in your app?"
   → `signInWithEmailAndPassword` returns a user object. `onAuthStateChanged` fires whenever auth state changes — on every page, if no user is detected, we redirect to login.

7. "What would you improve if you had more time?"
   → Firebase Storage for real image uploads, `onSnapshot` for real-time updates, pagination for large item lists.

### If the Demo Fails Live

**In order of preference:**

1. **Refresh the page.** Most Firebase issues resolve on reload.
2. **Sign out and sign back in.** Clears any stale auth state.
3. **Switch to the backup laptop** (if the team has one).
4. **Play the backup video.** "We recorded a demo video as a backup in case of connectivity issues." This is not a failure — it's preparation. Tutors know the demo environment can be unreliable.
5. **Walk through the code without a live demo.** "Our demo isn't loading right now, but let us walk you through the code." Then do the code walkthrough section.

**The worst outcome:** Panic, stay silent, and run out of time. Keep talking. If the demo breaks, narrate what you were about to show.

---

## SECTION 7 — RISK MANAGEMENT

### Risk 1: Inactive Teammate

**Signs:** Not responding in group chat for 48+ hours during an active week. Missed a meeting without notice. Committed nothing after Week 9.

**Response by timeline:**

- **Before mid-Week 10:** Ask them directly (phone call, not just message). If no response in 24 hours, redistribute their tasks. Each remaining member picks up one sub-task. The page can be simplified (e.g., no edit functionality on mylistings).
- **After Week 11 meeting:** Their code is already merged. Other members fill in during presentation. Inform the tutor honestly — do not try to fake their contribution.
- **Day of presentation:** They don't show up. Redistribute their speaking time. Do not leave a dead silence slot.

**Prevention:** After Week 9 meeting, everyone states out loud their phone number and the group confirms a response-time expectation (e.g., "reply within 24 hours during active weeks").

---

### Risk 2: Broken Firebase Config

**Symptom:** App works for one member, not for others.

**Most common cause:** Different members using different Firebase projects, or the `firebase-config.js` file has a typo.

**Fix:** Member 1 shares the exact `firebase-config.js` content again. All other members delete their local version and re-paste from the shared message. Test in browser console — no red Firebase errors means it's working.

**Prevention:** In Week 9 meeting, everyone tests Firebase connection before leaving. If you see `FirebaseError: auth/invalid-api-key`, your config is wrong — fix it before you leave.

---

### Risk 3: Merge Conflicts

**Most likely location:** `index.html` (nav changes), `style.css`, `firebase-config.js`

**Prevention:**
- Member 4 is the only person who edits `style.css`. Changes to nav go through Member 4.
- `firebase-config.js` is never committed if repo is public; only one version exists.
- Each member owns completely separate JS files — conflicts in JS should not happen.

**If conflict occurs:**
1. Don't panic. Open the file and look at the `<<<<<<<` markers.
2. Keep BOTH changes (usually) — one person added a feature, another didn't touch it.
3. If confused, call the other member and resolve it together in 10 minutes.
4. Never use `git reset --hard` without first checking with the group.

---

### Risk 4: Unfinished Features at Week 11

**Response:** Scope it out. Do not try to rush-implement a broken feature the night before presentation.

**Prioritisation (if time runs out):**
1. Must work: auth redirects, marketplace loads, shortlist add/remove
2. Should work: mylistings add + delete
3. Nice to have: edit listing, category filter, real-time `onSnapshot`

If mylistings delete is broken, don't show it in the demo. Show what works. Tutors respect a confident presentation of 80% over a crashing presentation of 100%.

---

### Risk 5: Poor Communication

**Symptom:** People don't know what others are doing. Integration fails because no one told Member 2 that the Firestore schema changed.

**Prevention:**
- Group chat is active. Any schema or API change is announced immediately.
- Commit messages are meaningful (`feat: add sellerUID field to listings addDoc` — not `update`).
- The Week 10 mid-week integration sync exists specifically to force communication before problems compound.

**Rule:** If you change anything that other pages depend on (Firestore field names, auth-guard behaviour, navbar HTML), post in the group chat immediately.

---

### Risk 6: Member Can't Explain Merged Code During Presentation

**Symptom:** Tutor asks Member 3 about `auth-guard.js` and Member 3 says "I didn't write that."

**Prevention:** The cross-review in Week 11 and the 4 rehearsals exist to prevent this. Every member must read at least one other member's file.

**Floor standard every member must meet:**
- Know what `onAuthStateChanged` does and why it's used on every page
- Know the Firestore data structure (two collections, what fields are in each)
- Know why `sellerUID` exists and how it's used in two different `where` queries

---

### Risk 7: One Member Doing Too Much Work

**Signs:** Member 1 is fixing bugs on other pages. One person wrote 80% of the code.

**Prevention:** The role split in PROJECT_PLAN.md gives each member exactly one page and one JS file. No one should be touching another member's files without explicit agreement.

**If it happens:** Name it in the Week 10 meeting. "I ended up writing the shortlist logic for M4 — M4, please take over from here so you can explain it." Better to address it at Week 10 than at Week 13.

---

## SECTION 8 — IDEAL FINAL TIMELINE TABLE

| Week | Main Goal | Meeting Focus | Key Deliverable | Risk Level |
|------|-----------|---------------|-----------------|------------|
| **9** | Setup & planning | Firebase config works for everyone; branch structure created; nav agreed | All members on the same Firebase project; file structure scaffolded | Low |
| **10** | Core features + Integration #1 | Live demo of full user flow; fix top bugs; agree on what M2/M3/M4 complete before W11 | All features at least partially working; `feature/*` → `dev` merge done | High |
| **11** | Feature complete + Code review + Final merge | 3-user full demo; code review exchange; first spoken run-through; `dev` → `main` | Feature freeze; `main` is live and complete; every member has read one other member's code | Medium |
| **12** | Rehearsal + polish | Two full timed rehearsals; backup video recorded; demo laptop confirmed | Everyone confident presenting their section; backup video saved; tutor questions rehearsed | Low |
| **13** | Submission + Presentation | Sanity check demo on presentation day | Submitted; presented; every member explained their contribution | Low (if W11–12 done) |

---

## APPENDIX — Feature Completion Checklist

Use this at the Week 11 meeting to confirm everything is done.

### Authentication (Member 1)
- [ ] `login.html`: sign in with email/password works
- [ ] `login.html`: sign up creates new Firebase Auth user
- [ ] `login.html`: error messages display (wrong password, user not found)
- [ ] `index.html`: shows signed-in user's email
- [ ] `index.html`: sign out button works, redirects to login.html
- [ ] `auth-guard.js`: unauthenticated users redirected from all 4 pages
- [ ] `auth-guard.js`: authenticated users on login.html redirected to index.html
- [ ] Firestore security rules: live and tested
- [ ] 8 seed listings: across 3 categories, 3 different seller UIDs

### Marketplace (Member 2)
- [ ] Loads all listings from Firestore
- [ ] Current user's own listings NOT shown
- [ ] Each card shows: title, description, price, category, image, seller email
- [ ] "Add to Shortlist" button present on each card
- [ ] Own items: shortlist button absent or disabled
- [ ] Duplicate prevention: clicking shortlist on already-shortlisted item blocked
- [ ] Successful shortlist: writes to `shortlists/{uid}/items/{listingId}`

### My Listings (Member 3)
- [ ] Shows only current user's listings
- [ ] Add listing form: submits to Firestore with correct `sellerUID` and `sellerEmail`
- [ ] New listing appears in the list after submission
- [ ] Delete button removes listing from Firestore and from UI
- [ ] Form validation: empty title/price/category blocked
- [ ] New listing appears in marketplace for other users

### Shortlist (Member 4)
- [ ] Loads all shortlisted items for current user
- [ ] Each card shows: title, description, price, category, image, seller email
- [ ] Remove button deletes from `shortlists/{uid}/items/{listingId}`
- [ ] Removed item disappears from UI immediately
- [ ] Empty state message shown when shortlist is empty
- [ ] Shortlist persists after sign-out and sign-in
- [ ] All pages: consistent Bootstrap navbar
- [ ] All pages: consistent colour theme and card style
- [ ] All pages: responsive on mobile (375px), tablet (768px), desktop (1280px)

---

*Last updated: Session 1 2026 — COMP2750/6750 Campus Marketplace*
