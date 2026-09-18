ALL MEDIA — COMMUNITY MASTER V3.2

Replace only:
Communities-Master-V3.html

Changes:
- Restores Spooky Cozy announcements even if Spooky Cozy was previously edited/saved in the prototype.
- Spooky Cozy has 3 announcement samples: Welcome, Community Update, Announcement.
- Keeps the new combined About / Community Basics / Official Links panel unchanged.
- Replaces the Community feed's CSS columns with the SAME basic layout strategy as Discover:
  two explicit columns, 18px gap, odd posts left / even posts right.
- Posts stack independently in each column so different post heights can mix naturally.
- The empty "Spooky Cozy is ready" state remains full width after setup when there are no posts.
- Once the first post exists, the empty state disappears automatically.
- With posts present, the feed moves slightly closer to the important Community information above it.
- Quick Thought posts now use the current Community name/icon/Interest instead of hard-coded Spooky Cozy values.
- Quick Thought posts automatically enter the two-column Community wall.

This does NOT yet rebuild the full Community creator. The reusable feed layout is now ready for that next functional pass.

Commit message:
Restore announcements and match Community feed to Discover
