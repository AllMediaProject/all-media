ALL MEDIA — POST AUTHOR → USER PROFILE CONNECTION

PURPOSE
This closes the missing Profile connection:
- The top-right header avatar already opens YOUR owner profile.
- Post author avatars/usernames now open the correct profile.
- Your own post author -> owner Profile.
- Somebody else's post author -> existing reusable visitor Profile.

NO PROFILE REBUILD WAS NEEDED.
The existing #otherProfile is reused.

UPLOAD ALL 7 FILES TO THE REPO ROOT

REPLACE:
1. index.html
2. discover.html
3. community.html
4. profile.html

ADD:
5. author-profile-navigation.js
6. author-profile-navigation.css
7. profile-user-routing.js

DO NOT REPLACE:
- home.js / home.css
- discover.js / discover.css
- profile.js / profile.css
- Community JavaScript / locked card systems
- any Notifications files

WHAT CHANGED

POST AUTHOR LINKS
On Home, Discover, Communities, and Profile feeds:
- click the post author's profile picture -> Profile
- click the post author's @username -> Profile
- Enter / Space works for keyboard navigation
- dynamically-created/rendered posts are covered too

OWNER ROUTING
Posts recognized as your own open:
  profile.html

This includes:
- data-owner="current-user"
- @SugarCrumbCo
- @yourusername
- the visible owner handle on the Profile page

OTHER USER ROUTING
Other authors open:
  profile.html?user=<username>

Example:
  profile.html?user=moonlitmoth

VISITOR PROFILE
profile-user-routing.js reads ?user=
and opens the EXISTING #otherProfile.

It updates:
- display name
- @handle
- profile initial
- bio
- Interests
- About text
- the existing visitor sample post's author/topic/preview/caption

There is a small prototype catalogue for the sample post authors already used around All Media:
- @moonlitmoth
- @paperlantern
- @littletrails
- @threadorbit
- @fernfriend
- @roadsideoddities
- @belowblue
- @oddmotors
- @smallhistories
- @kitchenscience
- @lookuparchive
- @northofhere
- @ravenandruins
- @cozycryptid
- @AlexRivera.Photo

Any author not in the catalogue still works through a generic fallback visitor profile.

IMPORTANT SCOPE
This pass connects POST AUTHORS only.
Comment usernames / reply usernames are intentionally NOT connected yet.
That keeps this surgical and avoids turning this into a much larger identity-linking pass.

PROTECTION
The four existing production HTML files were verified against their current GitHub blob SHAs first.

Apart from inserting the new CSS/JS includes:
- index.html is unchanged
- discover.html is unchanged
- community.html is unchanged
- profile.html is unchanged

No existing production JavaScript or CSS was rewritten.

TEST IN THIS ORDER

1. Upload all 7 files in one commit.
2. Wait for GitHub Pages.
3. Ctrl + Shift + R.

HOME
4. Click @moonlitmoth's avatar.
   -> Visitor profile should open as Moonlit Moth.
5. Go back and click @moonlitmoth username.
   -> Same visitor profile.
6. Create a new post as yourself and click your avatar/username.
   -> Owner Profile.

DISCOVER
7. Click @paperlantern.
   -> Paper Lantern visitor profile.
8. Click another author such as @littletrails.
   -> Different visitor identity.

COMMUNITY
9. Click @ravenandruins.
   -> Raven & Ruins visitor profile.
10. Click @cozycryptid.
   -> Cozy Cryptid visitor profile.

PROFILE
11. On the visitor profile's sample post, click the author.
   -> Same user's visitor profile.
12. Open your normal Profile from the header.
   -> Owner Profile still works.
13. Confirm Edit Profile / Settings still work.

REGRESSION CHECK
14. Confirm post menus still open.
15. Confirm Like / Pocket / Community / Reblog / Share / Save still work.
16. Confirm comments still work.
17. Confirm Community hotbars still work on all connected pages.

IF ALL PASS
The Owner Profile + User Profile system is now actually connected to post authors across All Media.

COMMIT MESSAGE:
Connect post authors to user profiles
