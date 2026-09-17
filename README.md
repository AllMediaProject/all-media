All Media

All Media is a social platform concept built around inclusive posting, community, and discovery without relying on popularity-first feeds.

The project is currently a front-end prototype hosted with GitHub Pages.

Live Pages

Home — index.html

Discover — discover.html

Profile — profile.html

Notifications — in development

Current Project Structure

Home

index.html

home.css

home.js

Discover

discover.html

discover.css

discover.js

all-media.css — currently still used by Discover for shared Home/feed styling

Profile

profile.html

profile.css

profile.js

Shared / Project Files

all-media-logo.png — All Media logo

README.md — project documentation

all-media.css — legacy/shared stylesheet still required by Discover

all-media.js — legacy script retained until its dependencies are fully audited

Development Workflow

Major pages are often developed first as a single master HTML file so the layout, styling, and interactions can be changed safely in one place.

Once a page is finished and tested:

Lock the approved design and behavior.

Split the master into HTML, CSS, and JavaScript files.

Test the split version.

Replace or connect the live page only after verification.

Preserve the original master or prototype in the archive when useful.

Current Status

✅ Home

✅ Discover

✅ Profile

🚧 Notifications

⬜ Pockets

⬜ Pocket settings / management

⬜ Communities

⬜ Community settings / management

⬜ Community notifications

⬜ Create Profile / onboarding

⬜ All Play

⬜ Account / site settings

⬜ Home widget refinement

⬜ Support Me panel item

⬜ Legal / policy pages

Core Product Ideas

Pockets

Pockets are the curation side of All Media. They let people organize, save, follow, and share collections of content.

Communities

Communities are the gathering side of All Media. They provide focused spaces for people around shared interests.

Discover

Discover is designed to surface overlooked posts and creators without ranking content primarily by popularity.

All Play

All Play is the planned unified video destination for both long-form Videos and short-form Bytes.

Design

Primary visual direction:

Page navy: #101a3a

Card navy: #182447

Primary peach: #ffc384

The interface uses the Outfit typeface and the All Media pocket-and-star logo.

Development Rules

Make one focused change at a time.

Preserve tested work.

Avoid unrelated redesigns while fixing a specific area.

Do not overwrite working pages until a replacement has been tested.

Prefer full-file replacement over risky manual edits when practical.

Keep temporary labs, prototypes, and master files separate from live production files.
