ALL MEDIA — COMMUNITIES FINAL FUNCTION PASS

Replace these three files:
1. Communities-Master-V3.html
2. Manage-Communities-Master-V2.html
3. Community-Notifications-Master-V1.html

FUNCTION FIXES INCLUDED

MANAGE COMMUNITIES
- Manage Communities from the hotbar now opens as a right-side drawer instead of taking over the whole page.
- The drawer uses the same Manage Communities organizer, so Pin/Unpin, Leave, Edit, Create, and View All Community Notifications remain available.
- Manage-Communities-Master-V2.html still works as a standalone fallback page.
- ?panel=1 switches it into the narrow drawer layout.

COMMUNITY NOTIFICATIONS
- Replyable Community notifications now have a visible "Write a quick reply…" box similar to normal Notifications.
- Clicking the box opens the inline reply editor.
- Mod Chat mention notification support is included.
- Manage Communities from this page also opens the right-side drawer.

COMMUNITY PAGE
- Removed the duplicate yellow Link Sharing badge from Community Basics.
- Fixed the Byte sample bug that displayed ${...} code in the post.
- Added functional sample Video/Byte controls: play/pause, scrubber, mute where available, and fullscreen.
- Uploaded Community Video/Byte posts keep their real HTML video player.

ANNOUNCEMENTS
- Owners and moderators get "+ Add Announcement" in the right Community information panel.
- Maximum 3 active announcements.
- Types: Welcome / Community Update / Announcement.
- Quick Summary appears in the carousel.
- Optional Full Announcement text creates a "Read more →" control.
- Read more opens the full announcement in a focused reader without forcing every announcement to become a separate page.
- Existing announcements can be removed from the same manager.

MOD CHAT
- Added an @ button.
- The @ menu lists the Community owner/moderators.
- Selecting someone inserts their @username into the Mod Chat message.
- Posting a tagged message stores a targeted Community notification record for that moderator.
- The record contains a recipient field for proper per-user delivery later when real accounts/backend replace the local prototype.
- Community Notifications contains a sample Mod Chat mention so the notification treatment can be reviewed now.

IMPORTANT
This is the FUNCTION pass only.
Do not judge final separators, emphasis, spacing, or visual hierarchy from this version.
That is intentionally the next appearance/polish pass.

SUGGESTED TEST ORDER
1. Click Manage Communities from the Community hotbar — the drawer should open on the right.
2. Pin/Unpin inside the drawer.
3. Open Community Notifications and test the visible quick-reply box.
4. Return to Spooky Cozy and confirm the yellow link-sharing badge is gone.
5. Check the Byte — no ${...} code should appear.
6. Test the sample Video and Byte controls.
7. Click + Add Announcement and add a quick announcement.
8. Add a full announcement with Full Announcement text and confirm Read more appears.
9. Open Moderators -> Mod Chat, click @, tag a moderator, and post the note.

COMMIT MESSAGE
Finish Community functionality pass
