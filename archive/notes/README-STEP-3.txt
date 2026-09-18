ALL MEDIA — COMMUNITY REBUILD STEP 3

UPLOAD THESE THREE HTML FILES TO THE REPO ROOT:

1. Communities-Master-V3.html
   New Community front page architecture:
   - Home / Community Guide / Members navigation.
   - Owner gets Edit + Moderators directly in Community navigation.
   - Moderator gets Mod Chat instead of owner Edit.
   - Pin button removed from the Community page. Pinning stays in More + Manage Communities.
   - Announcement carousel restored: maximum 3, manual arrows/dots, no autoplay.
   - Pinned Posts rebuilt as square preview cards with POST / BLOG / VIDEO labels.
   - About + Community Basics + Official Links are combined into one cohesive Community Information card.
   - Old Active Conversation / New Here dashboard cards removed from Home.
   - Top of Home uses two balanced columns.
   - After the overview, post cards continue in a two-column Community feed.
   - Existing locked post-card markup is preserved.
   - Community search remains connected to Community content / members.
   - Community Guide no longer has redundant navigation shortcut buttons.
   - A simple integrated Moderators / Mod Chat view replaces the separate Studio idea.

2. Manage-Communities-Master-V2.html
   - Community View links now open Communities-Master-V3.html.

3. Create-Community-Master-V2.html
   - Community front-page routing now points to Communities-Master-V3.html.

IMPORTANT:
- Keep Communities-Master-V2.html. It remains the pre-rebuild reference.
- Do not touch Home / Discover / Profile / Notifications yet.
- The Community post creator itself is still the next functional rebuild pass. This step is the page architecture/layout pass.

TEST:
- Open Communities-Master-V3.html.
- Check Home at desktop width.
- Confirm no Pin button appears in the Community hero.
- Confirm Home / Community Guide / Members / Edit / Moderators are easy to understand.
- Confirm announcements change only with arrows/dots.
- Confirm pinned previews are square with type labels.
- Confirm Edit opens Create-Community-Master-V2.html in edit mode.
- Confirm the post feed flows in two columns.
- Confirm Community Guide and Members still work.
- Confirm Moderators opens from the owner view.

COMMIT MESSAGE:
Rebuild Community front page architecture
