ALL MEDIA — COMMUNITIES PRODUCTION INTEGRATION: HOME

This is the FIRST production-page integration pass.
Only Home is being connected right now. Discover, Profile, and the normal Notifications hotbars are NOT changed in this package.

UPLOAD ALL 8 FILES TO THE REPO ROOT

REPLACE:
1. index.html
2. home.js

ADD:
3. community-integration.js
4. community-integration.css
5. community.html
6. create-community.html
7. manage-communities.html
8. community-notifications.html

KEEP THE MASTER FILES.
Do not delete Communities-Master-V3.html, Create-Community-Master-V2.html,
Manage-Communities-Master-V2.html, or Community-Notifications-Master-V1.html.
They remain the finished development backups.

WHAT HOME NOW DOES

COMMUNITY CHIP
- Click the Community name/chip -> opens that Community's production page.

INDIVIDUAL HOTBAR BELL
- Each pinned Community bell has its OWN unread count.
- The count comes from that Community's Community Notifications.
- Click the bell -> opens a quick window filtered to ONLY that Community.
- The window shows the latest four notifications.
- Click one notification -> marks that notification read and opens the Community.
- The bell count updates after it is read.
- "View all from this Community →" opens the full Community Notifications page already filtered to that Community.

MORE
- Shows all joined Communities.
- Click a Community -> opens it.
- Pin / Unpin persists through allMediaCommunityStateV1.
- Home hotbar pin order is saved separately so dragging still works.

MANAGE COMMUNITIES
- Opens the finished narrow right-side drawer.
- It uses manage-communities.html?panel=1.
- Pin/Unpin changes inside the drawer synchronize back to Home automatically.

PRODUCTION COMMUNITY FILES
- The four finished Community masters are copied into clean production filenames.
- All internal Community-system links in those production copies point to the production filenames.
- The original master files are unchanged.

IMPORTANT
- Home's locked post cards, creators, sidebars, header, general notifications, and Home layout are NOT redesigned.
- home.css is NOT replaced.
- The new Community-specific Home CSS/JS is isolated in community-integration.css and community-integration.js.

TEST IN THIS ORDER
1. Upload all 8 files in ONE GitHub upload/commit.
2. Wait for GitHub Pages to update.
3. Hard refresh Home with Ctrl + Shift + R.
4. Click Spooky Cozy itself -> community.html should open.
5. Go back Home.
6. Click the bell beside Spooky Cozy -> quick Community notifications should open.
7. Click "View all from this Community →" -> Community Notifications should open filtered to Spooky Cozy.
8. Go back Home and open More.
9. Pin Book Club -> it should appear in the hotbar.
10. Unpin Book Club -> it should disappear.
11. Drag the pinned Community chips -> order should remain after refresh.
12. Click Manage Communities -> the right-side drawer should open.
13. Pin/Unpin inside the drawer -> Home hotbar should update.

IF HOME PASSES:
Next production integration page is Discover.

COMMIT MESSAGE:
Connect Communities to Home
