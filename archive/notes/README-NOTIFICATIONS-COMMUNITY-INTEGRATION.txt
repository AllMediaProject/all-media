ALL MEDIA — COMMUNITIES PRODUCTION INTEGRATION: NOTIFICATIONS

This is the FOURTH and FINAL main-page Communities production integration pass.

ALREADY CONNECTED
- Home ✅
- Discover ✅
- Profile ✅

THIS PACKAGE CONNECTS
- Notifications ✅

UPLOAD THESE 3 FILES TO THE REPO ROOT

REPLACE:
1. notifications.html

ADD:
2. notifications-community-integration.js
3. notifications-community-integration.css

DO NOT REPLACE:
- notifications.js
- notifications.css
- Home files
- Discover files
- Profile files
- Community production files

WHAT NOTIFICATIONS NOW DOES

SHARED COMMUNITY HOTBAR
- Uses the SAME allMediaCommunityStateV1 state as Home, Discover, and Profile.
- Pin/Unpin state is shared.
- Pinned order is shared.
- Drag order is shared.

COMMUNITY CHIP
- Click a pinned Community -> opens production community.html.

INDIVIDUAL COMMUNITY BELLS
- Every pinned Community has its OWN unread count.
- Uses the SAME Community notification/read state as Home, Discover, and Profile.
- Click a bell -> quick notifications filtered to that Community only.
- Click a notification -> marks it read and opens that Community when the notification has a valid destination.
- Deleted-Community/system notifications can be marked read without opening a dead link.
- View all from this Community -> production community-notifications.html filtered to that Community.
- Quick popup text uses the larger readability sizing used on the later integrations.

MORE
- Shows all joined Communities.
- Click a Community -> opens it.
- Pin/Unpin persists to the shared Community state.
- Keeps More open after pin/unpin.

DRAGGING
- Reorder pinned Communities.
- Order persists across Home, Discover, Profile, and Notifications.

MANAGE COMMUNITIES
- Opens the finished narrow right-side drawer.
- Uses manage-communities.html?panel=1.
- Changes inside the drawer synchronize back to Notifications.

IMPORTANT PROTECTION
- notifications.js is untouched.
- notifications.css is untouched.
- The normal Notifications page is untouched:
  - Post Activity
  - unanswered comments
  - missed likes
  - notification tabs
  - mark all as read
  - like/reply flows
  - Replied ✓ · View comments · Reply again
  - normal header Quick Notifications
  - Profile avatar
- The old prototype Community-hotbar code inside notifications.js is not deleted.
  Instead, the old hotbar IDs are removed from notifications.html, so that old block safely does nothing.
  This avoids changing the locked Notifications logic.

TEST IN THIS ORDER
1. Upload all 3 files in one commit.
2. Wait for GitHub Pages.
3. Hard refresh Notifications with Ctrl + Shift + R.
4. Confirm the hotbar matches Home / Discover / Profile.
5. Click Spooky Cozy -> production Community opens.
6. Go back; click Spooky Cozy bell -> filtered Community quick notifications open.
7. Click View all from this Community -> filtered Community Notifications opens.
8. Go back; open More.
9. Pin/unpin Book Club -> hotbar updates.
10. Go to Home / Discover / Profile -> confirm the same pin state.
11. Back on Notifications, drag a pinned Community.
12. Refresh -> order remains.
13. Check another connected page -> same order appears there.
14. Open Manage Communities -> right-side drawer opens.
15. Pin/unpin in the drawer -> Notifications hotbar updates.
16. Confirm ALL normal Notifications features still work:
    - Post Activity
    - unanswered comments
    - missed likes
    - notification tabs
    - Mark all as read
    - Like
    - Reply
    - Replied ✓ · View comments · Reply again
    - normal top-right Quick Notifications

IF THIS PASSES
Home + Discover + Profile + Notifications are all connected to the finished Community system.
The main Communities production integration pass is complete.

COMMIT MESSAGE:
Connect Communities to Notifications
