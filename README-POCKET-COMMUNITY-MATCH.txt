ALL MEDIA — POCKET + COMMUNITY MATCHED INTERACTION

These are FULL replacement integration files.
No manual code edits are required.

1. Rename pocket-integration.txt to pocket-integration.js
2. Rename community-integration.txt to community-integration.js
3. Replace the two existing files in the repository.
4. Do NOT change index.html.

POCKET
- Preserved exactly as the approved interaction.
- Add/remove by clicking a Pocket in the chooser.
- Multiple Pockets can be selected.
- Selected Pockets stay checked when the chooser is reopened.
- Feed Pocket button turns peach when saved to at least one Pocket.
- Matching Interests/hashtags first.
- Show all Pockets fallback.
- Scrollable list.

COMMUNITY
- Now intentionally mirrors Pocket.
- Click a Community once: share/add the post.
- Click it again: remove the post.
- Multiple Communities can be selected.
- Selected Communities stay checked when the chooser is reopened.
- Feed Community button turns peach when shared to at least one Community.
- Matching Interests/hashtags first.
- Show all Communities fallback.
- Scrollable list.
- No Create Community button.
- Choices are stored in localStorage under allMediaCommunitySharedPostsV1.

NOTE
This establishes the Home-side share state and stores a clean post snapshot.
Rendering those stored shared posts inside each Community page can be connected
as the next surgical step.

Suggested commit message:
Match Community button behavior to Pocket
