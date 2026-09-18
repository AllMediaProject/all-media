ALL MEDIA — COMMUNITY REBUILD STEP 2

UPLOAD BOTH FILES TO THE REPO ROOT:

1. Create-Community-Master-V2.html
   - New unified Create / Edit Community page.
   - Removes the old Community Studio / Owned & Moderated dashboard.
   - Create mode starts as a fresh Community.
   - Edit mode loads the selected owned Community into the same five-step form.
   - Create mode uses Cancel + Create Community.
   - Edit mode uses Delete Community + Save Changes.
   - Delete requires typing the Community name.
   - Deletion stores a system Community notification intended for all current members.
   - Existing image upload/crop, Interests, access, posting, link sharing, rules, About, Welcome, and official link controls are preserved.

2. Manage-Communities-Master-V2.html
   - Create Community now opens Create-Community-Master-V2.html.
   - Edit is now active and opens the unified editor for the selected owned Community.
   - Community opening uses the stable Community slug.

TEST:
- Open Manage-Communities-Master-V2.html.
- Click Edit on Spooky Cozy.
- Confirm the editor says Edit Community and is filled with Spooky Cozy's data.
- Change one harmless field and Save Changes.
- Return to Manage Communities.
- Click + Create Community and confirm it opens a fresh/blank creator.
- Do NOT test Delete on anything you want to keep in your current browser state unless you are okay resetting that prototype state.

COMMIT MESSAGE:
Connect unified Create and Edit Community flow
