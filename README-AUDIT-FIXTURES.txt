ALL MEDIA — AUDIT FIXTURES V1
September 19, 2026

PURPOSE
This is the pre-audit cleanup pass only.

It DOES:
- Keep the existing Home sample Post, Blog, Video and Byte.
- Keep only two seeded Pockets:
  • Halloween — owned
  • Halloween Inspo — followed
- Preserve any Pocket you create through the real UI.
- Keep only two seeded Communities:
  • Spooky Cozy — owned, joined, pinned
  • Book Club — joined, not pinned
- Hide Artists, Turtle Rescue, Crochet Corner and Garden & Nature.
- Preserve user-created Communities.
- Trim Discover to at most one Post, Blog, Video and Byte per active mode.
- Remove Discover Community labels that point to removed/nonexistent sample Communities.
- Remove visible Prototype/Master/testing language.
- Remove the Pocket page's visible PROTOTYPE VIEW Owner/Visitor switch.
- Keep internal filenames/storage keys unchanged for safety.

It DOES NOT:
- Change the Interest system yet.
- Change hashtag behavior yet.
- Fix Pocket/Community feed buttons on Discover, Profile, Pocket or Community.
- Repair any unrelated bugs.

Those remain separate audit/setup work.

============================================================
FILES
============================================================

1. audit-fixtures.txt
   Rename this to:
   audit-fixtures.js

2. README-AUDIT-FIXTURES.txt
   This file.

============================================================
UPLOAD
============================================================

Upload audit-fixtures.js to the ROOT of the All Media repo,
beside index.html, home.js, discover.js, etc.

Then load it LAST on the pages below.

Immediately BEFORE </body>, add:

<script src="audit-fixtures.js"></script>

Add that exact line to:

- index.html
- discover.html
- profile.html
- community.html
- manage-communities.html
- create-community.html
- community-notifications.html
- notifications.html
- pocket-page-prototype.html

You do NOT need to rename any existing production files.

============================================================
IMPORTANT FIRST LOAD
============================================================

The first page you open after installing this script may refresh itself ONCE.

That is intentional.

The refresh lets the existing Community scripts reload using the cleaned
shared localStorage state.

It should not enter a refresh loop.

============================================================
WHAT TO EXPECT AFTER INSTALL
============================================================

HOME
- Four existing sample feed cards remain.
- Halloween remains as the sample owned Pocket.
- Halloween Inspo remains as the sample followed Pocket.
- Other seeded Pockets disappear.
- Spooky Cozy is pinned.
- Book Club remains available through the joined Community system.
- The four removed sample Communities should no longer behave as joined Communities.

DISCOVER
- Suggested / Adventure should each show at most one card of each active content type.
- Filters still work.
- Existing Discover behavior is otherwise unchanged.

POCKET
- The visible PROTOTYPE VIEW Owner / Visitor tester switch disappears.
- Owner/visitor mode still comes from the real page route/query state.

PROFILE / NOTIFICATIONS / CREATE COMMUNITY
- User-visible Prototype/Master/testing copy is removed where present.

============================================================
KNOWN AUDIT ITEMS — DELIBERATELY NOT FIXED HERE
============================================================

The Pocket / Community feed actions are not yet consistently functional on:

- Discover
- Profile
- Pocket
- Community

Do not treat their continued failure after this install as a failure of
audit-fixtures.js. We intentionally left those for the real bug audit.

============================================================
COMMIT MESSAGE
============================================================

Prepare clean audit fixture environment
