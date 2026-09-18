ALL MEDIA — COMMUNITY FUNCTION TOUCH-UPS

Replace:
1. Communities-Master-V3.html
2. Community-Notifications-Master-V1.html

CHANGES

1. PINNED POSTS
- The opened pinned post now has proper left/right inset around its note, title, and media.
- The media border no longer sits almost directly on the outer card border.

2. ADD ANNOUNCEMENT
- "+ Add Announcement" moved ABOVE the Announcement carousel.
- It is now COMMUNITY CREATOR / OWNER ONLY.
- Moderators no longer see or open the announcement manager.
- Saving announcements also checks the owner role.

3. VIDEO + BYTE PLAYERS
- Both sample Video and Byte cards now have the full All Media control row:
  Play/Pause · Mute/Unmute · Elapsed Time · Timeline · Duration · Fullscreen
- Controls now use the existing All Media "controls-visible" behavior, so they actually appear.
- They show on hover, movement, click, or keyboard focus and fade while playback continues.
- Play/Pause and Mute/Unmute icons visibly change state.
- Clicking the video area still toggles play/pause.
- Newly published Video and Byte posts continue using their real HTML video player.

4. COMMUNITY NOTIFICATIONS QUICK REPLY
- Switched the Community reply box to the exact same reply classes/flow used by normal Notifications.
- Compact "Write a quick reply…" opens the composer.
- "Changed my mind…" closes it.
- Reply briefly shows "Reply posted."
- Then it changes to the same:
  Replied ✓ · View comments · Reply again
- "Replied ✓" uses the exact existing Notifications styling.
- "Reply again" reopens the reply composer.
- "View comments" opens the Community destination.

COMMIT MESSAGE:
Polish final Community functions
