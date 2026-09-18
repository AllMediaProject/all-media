ALL MEDIA — COMMUNITY REBUILD STEP 4

Replace only:
Communities-Master-V3.html

COMMUNITY CREATOR FUNCTIONAL PASS

Now working:
- POST / BLOG / VIDEO / BYTE selection.
- Required text/context on every content type.
- Community Interests are limited to the Interests allowed by the current Community.
- At least one Community Interest is required to publish.
- Multiple allowed Community Interests can be selected.
- Hashtags are separate from Interests, optional, and support up to 20.
- Hashtags can be typed manually or chosen from Community/Interest suggestions.
- One external link can be attached when that Community allows links.
- The Community selector is locked to the Community you are already inside.
- POST: optional image upload, up to 6 images.
- BLOG: required title, 1,000–35,000 character body, optional preview image.
- VIDEO: required title + video, title/description combined max 500 characters.
- BYTE: required video, 300 character caption, 3 minute video limit.
- Media previews work before publishing.
- Published image posts support a simple multi-image carousel.
- Published posts are inserted into the adaptive two-column Community wall immediately.
- The empty “[Community] is ready” state disappears automatically after the first post.
- New cards use the existing All Media post/card action classes and hashtag/comment areas.
- Creator resets cleanly after publishing.

Still intentionally deferred:
- Full Home-grade crop/rearrange editor parity for Community image uploads.
- Database persistence after browser refresh.
- Real backend moderation / approval queue.

TEST:
1. Open Communities-Master-V3.html.
2. Press Create Post.
3. Open Interest — only the current Community’s allowed Interests should appear.
4. Open Hashtags — add/remove a few; these should not affect Interests.
5. Publish a normal Post and confirm it enters the two-column wall.
6. Try Blog / Video / Byte validation.
7. Try a Community whose link settings disallow links and confirm Link is disabled.

COMMIT MESSAGE:
Make Community post creator functional
