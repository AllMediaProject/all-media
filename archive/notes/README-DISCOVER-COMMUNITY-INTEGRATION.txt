ALL MEDIA — COMMUNITIES PRODUCTION INTEGRATION: DISCOVER

This is the SECOND production-page integration pass.
Home is already connected and is NOT changed by this package.

UPLOAD THESE 3 FILES TO THE REPO ROOT

REPLACE:
1. discover.html

ADD:
2. discover-community-integration.js
3. discover-community-integration.css

DO NOT REPLACE:
- discover.js
- discover.css
- Home files
- Community production files

WHAT DISCOVER NOW DOES

COMMUNITY CHIP
- Click a pinned Community -> opens the production Community page.
- Uses the SAME shared Community state as Home.

INDIVIDUAL HOTBAR BELLS
- Each pinned Community bell has its OWN unread count.
- Counts use the same Community notification/read state as Home.
- Click a bell -> quick popup filtered to only that Community.
- Click a notification -> marks it read and opens that Community.
- "View all from this Community →" -> full Community Notifications filtered to that Community.
- The popup text is intentionally a little larger than the first Home version because the Home popup was reported as slightly hard to read.

MORE / PIN STATE
- More shows all joined Communities.
- Pin/Unpin persists to allMediaCommunityStateV1.
- It uses the SAME pin-order key as Home.
- If you pinned Book Club on Home, Discover reflects it.
- Dragging the hotbar on Discover updates the shared order.

MANAGE COMMUNITIES
- Opens the finished right-side Manage Communities drawer.
- Pin/Unpin inside the drawer synchronizes to Discover automatically.

IMPORTANT
- discover.js is untouched.
- discover.css is untouched.
- Suggested / Adventure, filters, saved filters, cards, comments, and Discover layout are untouched.
- The existing old prototype Community functions inside discover.js are left alone, but the new production hotbar renders AFTER discover.js and replaces that hotbar behavior safely.

TEST IN THIS ORDER
1. Upload all 3 files in one commit.
2. Wait for GitHub Pages.
3. Hard refresh Discover with Ctrl + Shift + R.
4. Confirm the pinned Communities match Home.
5. Click Spooky Cozy -> Community page opens.
6. Go back and click Spooky Cozy's bell -> filtered quick popup opens.
7. Click View all from this Community -> filtered Community Notifications opens.
8. Go back and open More.
9. Pin or unpin Book Club -> hotbar updates.
10. Go Home -> confirm the same pin state/order appears there.
11. Back on Discover, drag a pinned Community -> refresh -> order should stay.
12. Open Manage Communities -> drawer opens.
13. Pin/Unpin in the drawer -> Discover hotbar updates.
14. Confirm Suggested / Adventure / Filter still work normally.

IF DISCOVER PASSES
Next production integration page is Profile.

COMMIT MESSAGE:
Connect Communities to Discover
