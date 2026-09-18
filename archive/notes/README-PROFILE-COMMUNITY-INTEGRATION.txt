ALL MEDIA — COMMUNITIES PRODUCTION INTEGRATION: PROFILE

This is the THIRD production-page integration pass.

PASSED ALREADY
- Home ✅
- Discover ✅

THIS PACKAGE CONNECTS
- Your Profile
- Another user's Profile

Profile Settings does not have a Community hotbar, so it is intentionally left alone.

UPLOAD THESE 3 FILES TO THE REPO ROOT

REPLACE:
1. profile.html

ADD:
2. profile-community-integration.js
3. profile-community-integration.css

DO NOT REPLACE:
- profile.js
- profile.css
- Home files
- Discover files
- Community production files

WHAT PROFILE NOW DOES

SHARED HOTBAR STATE
- Both Profile views use the SAME Community state as Home and Discover.
- Pin/Unpin state matches across all connected pages.
- Pinned Community order matches across all connected pages.
- Both Profile hotbars stay synchronized with each other.

COMMUNITY CHIP
- Click a Community -> opens the production Community page.

INDIVIDUAL COMMUNITY BELLS
- Every pinned Community has its OWN unread count.
- Counts share the same read/unread state as Home and Discover.
- Click a bell -> quick notifications filtered to that Community only.
- Click a notification -> marks it read and opens that Community.
- View all from this Community -> opens Community Notifications already filtered to that Community.
- Popup text uses the larger readability sizing introduced on Discover.

MORE
- Shows all joined Communities.
- Click a Community -> opens it.
- Pin/Unpin updates both Profile hotbars immediately.
- Changes persist into Home and Discover.

DRAGGING
- Reorder pinned Communities on either Profile hotbar.
- The order is saved to the same shared pin-order state as Home and Discover.
- Both Profile views synchronize after the drag.

MANAGE COMMUNITIES
- Manage Communities opens the finished narrow right-side drawer.
- Uses manage-communities.html?panel=1.
- Pin/Unpin changes inside the drawer synchronize back to Profile.

IMPORTANT
- profile.js is untouched.
- profile.css is untouched.
- Profile cards are untouched.
- Your Profile / visitor Profile behavior is untouched.
- Edit Profile / Settings is untouched.
- About Me, Gallery, Interests, privacy controls, and Support are untouched.
- The normal header Quick Notifications system is untouched.

TEST IN THIS ORDER
1. Upload all 3 files in ONE commit.
2. Wait for GitHub Pages to update.
3. Hard refresh Profile with Ctrl + Shift + R.
4. Confirm your Profile hotbar matches Home and Discover.
5. Click Spooky Cozy itself -> community.html should open.
6. Go back and click Spooky Cozy's bell -> filtered quick Community notifications should open.
7. Click View all from this Community -> filtered Community Notifications should open.
8. Go back to Profile and open More.
9. Pin or unpin Book Club -> your Profile hotbar should update.
10. Switch to the other-user Profile view -> its hotbar should show the SAME state.
11. Change a pin from the other-user Profile view -> both Profile views should remain synchronized.
12. Go Home or Discover -> confirm the same pin state appears there.
13. Back on Profile, drag a pinned Community -> refresh -> order should remain.
14. Open Manage Communities -> right-side drawer should open.
15. Pin/Unpin inside the drawer -> Profile hotbar should update.
16. Confirm normal Profile systems still work:
    - Posts / Reblogs / Saved
    - visitor Posts / Reblogs
    - Support button
    - Edit Profile / Settings
    - About Me / Gallery
    - normal header Quick Notifications

IF PROFILE PASSES
The only remaining main All Media ↔ Communities production integration page is Notifications.

COMMIT MESSAGE:
Connect Communities to Profile
