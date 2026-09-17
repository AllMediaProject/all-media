/* =========================================================
   DISCOVER-ONLY JAVASCRIPT
   No all-media.js is loaded on this page.
========================================================= */

let activeTab = "suggested";
let activeAdventureInterest = "all";
let activeTypes = ["post","blog","video","byte"];

const followedInterests = new Set(["Art","Halloween","Crochet","Nature"]);

let savedDiscoverFilters = [];
let selectedSavedFilterIndex = null;

const communityCatalog = [
  {name:"Spooky Cozy",icon:"🎃",pinned:true},
  {name:"Artists",icon:"🎨",pinned:true},
  {name:"Turtle Rescue",icon:"🐢",pinned:true},
  {name:"Book Club",icon:"📚",pinned:false},
  {name:"Crochet Corner",icon:"🧶",pinned:false},
  {name:"Garden & Nature",icon:"🌿",pinned:false}
];

/* Notification/activity counts are separate from pin state.
   Pinning or unpinning must never erase them. */
const communityActivityCounts = {
  "Spooky Cozy": 5,
  "Artists": 2,
  "Turtle Rescue": 1,
  "Book Club": 0,
  "Crochet Corner": 0,
  "Garden & Nature": 0
};

/* The data is temporary sample content.
   The HTML generated below deliberately uses the SAME Home
   class names/structure so all-media.css renders the same cards. */

const suggestedPosts = [
  {
    type:"post", user:"@moonlitmoth", time:"12m ago",
    emoji:"🎨", interest:"Art", community:"",
    icon:"🌙", media:"short",
    caption:"Finally finished this little piece tonight. 🌙 I wanted it to feel like something you might find tucked away in an old haunted house!",
    likes:24, reblogs:14, comments:8,
    latestUser:"@cryptidcorner", latest:"I LOVE this! The little details are perfect and the whole thing has such a beautiful haunted-house feeling to it!",
    hashtags:["#halloweenart","#acrylicpainting","#spookyart"]
  },
  {
    type:"blog", user:"@paperlantern", time:"54m ago",
    emoji:"📚", interest:"Books", community:"📚 Book Club",
    title:"Why I Keep a Tiny Autumn Sketchbook", icon:"📖", media:"tall",
    caption:"I started carrying a tiny sketchbook this fall because I wanted somewhere to put all the little ideas that never felt big enough for a full project. It has slowly become one of my favorite creative habits…",
    likes:17, reblogs:5, comments:6,
    latestUser:"@quietpages", latest:"This makes me want to start carrying a tiny sketchbook too.",
    hashtags:["#books","#sketchbook","#creativehabits"]
  },
  {
    type:"video", user:"@littletrails", time:"12d ago",
    emoji:"🌲", interest:"Nature", community:"🌿 Garden & Nature",
    title:"A rainy trail morning", icon:"🌲", media:"tall",
    caption:"A slow walk through one of the trails near me after a rainy morning.",
    likes:31, reblogs:8, comments:5,
    latestUser:"@mossyboots", latest:"The rain sounds in this are ridiculously calming.",
    hashtags:["#nature","#walking","#rain"]
  },
  {
    type:"byte", user:"@threadorbit", time:"6d ago",
    emoji:"🧶", interest:"Crochet", community:"🧶 Crochet Corner",
    icon:"🧶", media:"tall",
    caption:"Thirty seconds of watching this tiny mushroom finally get its face.",
    likes:42, reblogs:11, comments:11,
    latestUser:"@softloops", latest:"THE LITTLE FACE 😭",
    hashtags:["#crochet","#amigurumi","#crafts"]
  },
  {
    type:"post", user:"@fernfriend", time:"2mo ago",
    emoji:"🪴", interest:"Plants", community:"🌿 Garden & Nature",
    icon:"🪴", media:"tall",
    caption:"This corner used to get ignored completely. Moving two shelves around changed the whole room.",
    likes:12, reblogs:2, comments:3,
    latestUser:"@sunroom", latest:"This makes me want to redo my windowsill.",
    hashtags:["#plants","#homedecor","#greenery"]
  },
  {
    type:"post", user:"@roadsideoddities", time:"18d ago",
    emoji:"🚙", interest:"Vehicles", community:"🚗 Weekend Garage",
    icon:"🚙", media:"short",
    caption:"Found this little beauty parked outside a roadside diner. I know almost nothing about it, but the color stopped me in my tracks.",
    likes:9, reblogs:3, comments:7,
    latestUser:"@oldsteel", latest:"That body shape is fantastic.",
    hashtags:["#vehicles","#cars","#roadtrip"]
  }
];

const adventurePosts = [
  {
    type:"video", user:"@belowblue", time:"9d ago",
    emoji:"🐋", interest:"Marine Life", community:"🌊 Ocean Watch",
    title:"After the storm", icon:"🐋", media:"tall",
    caption:"A few quiet minutes from a shoreline survey. The tide pools looked completely different after the storm.",
    likes:26, reblogs:6, comments:9,
    latestUser:"@shorebird", latest:"I never knew how quickly those little pools could change.",
    hashtags:["#ocean","#marinelife","#science"]
  },
  {
    type:"post", user:"@oddmotors", time:"5w ago",
    emoji:"🚗", interest:"Vehicles", community:"🚗 Weekend Garage",
    icon:"🚗", media:"short",
    caption:"One of my favorite forgotten dashboard designs. Everything is chunky, mechanical, and weirdly charming.",
    likes:18, reblogs:4, comments:4,
    latestUser:"@switchgear", latest:"Older dashboards had so much personality.",
    hashtags:["#vehicles","#design","#cars"]
  },
  {
    type:"blog", user:"@smallhistories", time:"3mo ago",
    emoji:"🗝", interest:"History", community:"🏛 History Nook",
    title:"The tiny stories hidden inside ordinary objects", icon:"🗝", media:"short",
    caption:"Museum collections are full of objects that look mundane until someone tells you who carried them, repaired them, wrote on them, or refused to throw them away.",
    likes:21, reblogs:7, comments:19,
    latestUser:"@archivemouse", latest:"This is exactly why I can spend hours reading exhibit labels.",
    hashtags:["#history","#museums","#objects"]
  },
  {
    type:"byte", user:"@kitchenscience", time:"13d ago",
    emoji:"🔬", interest:"Science", community:"🔬 Curious Minds",
    icon:"🔬", media:"tall",
    caption:"A tiny experiment with surface tension that looks much more dramatic than it has any right to.",
    likes:37, reblogs:10, comments:12,
    latestUser:"@microscopeclub", latest:"I am absolutely trying this.",
    hashtags:["#science","#experiment","#learning"]
  },
  {
    type:"post", user:"@lookuparchive", time:"7w ago",
    emoji:"🏛", interest:"Architecture", community:"🏛 Built Places",
    icon:"🏛", media:"tall",
    caption:"A staircase I nearly walked past. The railings curve differently on every landing.",
    likes:15, reblogs:4, comments:6,
    latestUser:"@brickandglass", latest:"That railing detail is gorgeous.",
    hashtags:["#architecture","#design","#buildings"]
  },
  {
    type:"video", user:"@northofhere", time:"22d ago",
    emoji:"🏕", interest:"Outdoors", community:"🏕 Outside Somewhere",
    title:"Camp dinner", icon:"🏕", media:"short",
    caption:"Cooking something extremely basic outside somehow makes it taste ten times better.",
    likes:29, reblogs:9, comments:15,
    latestUser:"@trailmug", latest:"Camp food operates under different laws.",
    hashtags:["#outdoors","#camping","#food"]
  }
];

function escapeHTML(text){
  const d=document.createElement("div");
  d.textContent=String(text ?? "");
  return d.innerHTML;
}

function contentTypeLabel(post){
  if(post.type==="post") return "";
  return `<div class="content-type-label ${post.type}">${post.type.toUpperCase()}</div>`;
}

function topicHTML(post){
  const followed=followedInterests.has(post.interest);
  return `<div class="topic ${followed?"":"discover-quick-follow"}"
              data-interest="${escapeHTML(post.interest)}"
              ${followed?"":`onclick="followDiscoverInterest(this,'${escapeHTML(post.interest)}')"`}>
            ${followed ? "" : "+ "}${post.emoji} ${escapeHTML(post.interest)}
          </div>`;
}


function cardClass(post){
  if(post.type==="blog") return "post blog-post blog-post-v11";
  if(post.type==="video") return "post video-post-v11";
  if(post.type==="byte") return "post byte-post-v11";
  return "post regular-post";
}

function menuClass(post){
  if(post.type==="blog") return "blog-v11-menu";
  if(post.type==="video") return "video-v11-menu";
  if(post.type==="byte") return "byte-v11-menu";
  return "regular-post-menu";
}

function postHeader(post){
  const initial=escapeHTML((post.user||"@u").replace("@","").charAt(0).toLowerCase()||"u");
  return `
    <header class="post-header">
      <div aria-hidden="true" class="profile-picture">${initial}</div>
      <div class="post-author-copy">
        <div class="post-author-line">
          <span class="username">${escapeHTML(post.user)}</span>
          <span class="post-time">· ${escapeHTML(post.time)}</span>
          <span class="post-type-bubble">${post.type==="post"?"POST":post.type.toUpperCase()}</span>
        </div>
        <div class="post-meta-line">
          ${topicHTML(post)}
          ${post.community ? `<span class="post-community">· in ${escapeHTML(post.community)}</span>` : ""}
        </div>
      </div>
      <div class="post-header-right">
        <button aria-label="More options" class="post-menu-button" onclick="togglePostMenu(event,this)" type="button">•••</button>
        <div class="${menuClass(post)} discover-post-menu">
          <button class="post-menu-action" type="button">Not interested</button>
          <span class="post-menu-divider">|</span>
          <button class="post-menu-action post-menu-delete" type="button">Report</button>
        </div>
      </div>
    </header>`;
}

function demoMedia(post){
  if(!post.media) return "";
  const art=`<div class="discover-demo-art ${post.media}">${post.icon||"✦"}</div>`;

  if(post.type==="blog"){
    return `<div class="blog-preview-image blog-home-preview"><div class="sample-media-art sample-blog-cover">${art}</div></div>`;
  }

  if(post.type==="video"){
    return `
      <div class="video-feed-player video-v11-feed-player discover-demo-player" aria-label="Video preview">
        ${art}
        <div class="video-control-overlay discover-demo-controls">
          <div class="video-control-row">
            <button type="button" class="video-control-button video-control-play" aria-label="Play video">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>
            </button>
            <button type="button" class="video-control-button video-control-mute" aria-label="Mute video">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h4l5 4V6L9 10H5zM17 9c1.4 1.6 1.4 4.4 0 6"></path></svg>
            </button>
            <span class="video-control-time">0:00</span>
            <input class="video-control-scrubber" type="range" min="0" max="100" value="0" aria-label="Video timeline">
            <span class="video-control-time">0:42</span>
            <button type="button" class="video-control-button video-control-fullscreen" aria-label="Enter fullscreen">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"></path></svg>
            </button>
          </div>
        </div>
      </div>`;
  }

  if(post.type==="byte"){
    return `
      <div class="byte-stage">
        <div class="byte-preview video-feed-player byte-feed-player byte-v11-feed-player discover-demo-player" aria-label="Byte preview">
          ${art}
          <div class="video-control-overlay discover-demo-controls">
            <div class="video-control-row">
              <button type="button" class="video-control-button video-control-play" aria-label="Play Byte">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>
              </button>
              <button type="button" class="video-control-button video-control-mute" aria-label="Mute Byte">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h4l5 4V6L9 10H5zM17 9c1.4 1.6 1.4 4.4 0 6"></path></svg>
              </button>
              <span class="video-control-time">0:00</span>
              <input class="video-control-scrubber" type="range" min="0" max="100" value="0" aria-label="Byte timeline">
              <span class="video-control-time">0:24</span>
              <button type="button" class="video-control-button video-control-fullscreen" aria-label="Enter fullscreen">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }

  return `<div class="post-image crop-fit">${art}</div>`;
}

function mainContent(post){
  if(post.type==="blog"){
    return `
      <h2 class="blog-title blog-feed-title"><span aria-hidden="true" class="blog-title-star">✦</span>${escapeHTML(post.title)}</h2>
      ${demoMedia(post)}
      <p class="blog-excerpt blog-feed-excerpt">${escapeHTML(post.caption)}</p>
      <button type="button" class="read-blog blog-read-button" onclick="toggleDiscoverBlog(this)">Read Blog →</button>
      <div class="blog-full-content blog-full-body">
        <p>This is the next part of the article rather than a repeat of the preview. The finished Discover card will continue directly from whatever excerpt was shown above.</p>
        <p>Longer published Blogs can continue here with their normal paragraphs, formatting, images, and links.</p>
      </div>`;
  }

  if(post.type==="video"){
    return `
      <h2 class="video-title"><span aria-hidden="true" class="video-title-icon">▶</span>${escapeHTML(post.title)}</h2>
      ${demoMedia(post)}
      <p class="video-description caption">${escapeHTML(post.caption)}</p>`;
  }

  if(post.type==="byte"){
    return `<p class="byte-caption caption">${escapeHTML(post.caption)}</p>`;
  }

  return `${demoMedia(post)}<p class="caption">${escapeHTML(post.caption)}</p>`;
}

function interactionRow(post){
  const likeClass=post.type==="blog"?"blog-like-button":post.type==="video"?"video-like-button":post.type==="byte"?"byte-like-button":"regular-like-button";
  return `
    <div class="interactions">
      <button class="action-pill ${likeClass}" data-liked="false" onclick="toggleLikeNew(this)" type="button">
        <svg aria-hidden="true" class="like-heart" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg>
        <span class="like-count">${post.likes}</span>
      </button>
      <button class="action-pill pocket-action" type="button" onclick="toggleSimpleAction(this)">
        <svg aria-hidden="true" class="action-icon" viewBox="0 0 24 24"><path d="M4 7h6l2 2h8v10H4Z"></path><path d="M8 4v6"></path></svg><span>Pocket</span>
      </button>
      <button class="action-pill community-action" type="button" onclick="toggleSimpleAction(this)">
        <svg aria-hidden="true" class="action-icon" viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.5"></circle><path d="M3 19c.4-4 2.4-6 5-6s4.6 2 5 6"></path><path d="M13 18c.5-2.8 1.9-4.3 4-4.3 2 0 3.4 1.4 4 4.3"></path></svg><span>Community</span>
      </button>
      <button class="reblog-counter" onclick="incrementDiscoverReblog(this)" type="button">↻ <span>${post.reblogs}</span> · Reblog</button>
      <button class="share-action" type="button">↗ Share</button>
      <button aria-label="Save post" class="save-action" onclick="toggleDiscoverSave(this)" type="button">
        <svg aria-hidden="true" class="save-bookmark" viewBox="0 0 24 24"><path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.8L6 21Z"></path></svg><span>Save</span>
      </button>
    </div>`;
}

function commentsSection(post){
  return `
    <section class="comments-section">
      <div class="comment-item">
        <div aria-hidden="true" class="comment-avatar">${escapeHTML((post.latestUser||"@g").replace("@","").charAt(0).toLowerCase()||"g")}</div>
        <div class="comment-body">
          <div class="comment-author">${escapeHTML(post.latestUser)}</div>
          <div>${escapeHTML(post.latest)}</div>
          <div class="comment-actions">
            <button class="comment-action comment-like-button" data-liked="false" onclick="toggleCommentLike(this)" type="button">
              <svg aria-hidden="true" class="comment-like-icon" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><span>Like</span>
            </button>
            <button class="comment-action" type="button">Reply</button>
          </div>
        </div>
      </div>
      <div class="comment-item">
        <div aria-hidden="true" class="comment-avatar">w</div>
        <div class="comment-body">
          <div class="comment-author">@wanderingcloud</div>
          <div>This is exactly the sort of thing I like finding here.</div>
          <div class="comment-actions">
            <button class="comment-action comment-like-button" data-liked="false" onclick="toggleCommentLike(this)" type="button">
              <svg aria-hidden="true" class="comment-like-icon" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><span>Like</span>
            </button>
            <button class="comment-action" type="button">Reply</button>
          </div>
        </div>
      </div>
    </section>`;
}

function footerBlock(post){
  return `
    <div class="latest-comment">
      <span class="comment-username">${escapeHTML(post.latestUser)}:</span>
      <span class="latest-comment-copy">${escapeHTML(post.latest)}</span>
      <span class="latest-comment-time">2m ago</span>
    </div>
    <div class="post-footer">
      <div class="single-comment-composer">
        <div class="comment-composer" onclick="openDiscoverCommentComposer(this)">
          <div class="comment-compact-state"><span class="comment-mini-avatar"></span><span>Say hi... share what you feel</span></div>
          <div class="comment-expanded-state">
            <textarea class="comment-text-area" maxlength="500" onclick="event.stopPropagation()" placeholder="Say hi... share what you feel"></textarea>
            <div class="comment-post-actions">
              <button class="comment-post-button" onclick="postCommentNew(this,event)" type="button">POST</button>
              <button class="comment-close-button" onclick="closeDiscoverCommentComposer(this,event)" type="button">CLOSE</button>
            </div>
          </div>
        </div>
        <button class="hide-comments-inline" onclick="hideDiscoverComments(this)" type="button">Hide comments ↑</button>
        <div class="comment-helper"><span>Press Esc to close · ↵ to post</span></div>
      </div>
      <button class="more-comments" onclick="toggleComments(this)" type="button">View ${Math.max(post.comments-1,0)} more</button>
      <div class="post-footer-actions">
        <button class="hashtag-link" onclick="togglePostHashtags(this)" type="button"><span class="hashtag-icon">#</span><span>Hashtags</span></button>
      </div>
    </div>
    <div class="post-hashtags">${post.hashtags.map(h=>`<span class="post-hashtag">${escapeHTML(h)}</span>`).join("")}</div>
    ${commentsSection(post)}
    <div class="card-bottom-spacer" aria-hidden="true"></div>`;
}

function buildDiscoverCard(post){
  const byteFirst=post.type==="byte" ? demoMedia(post) : "";
  return `
    <article class="${cardClass(post)}" data-type="${post.type}" data-interest="${escapeHTML(post.interest)}">
      ${byteFirst}
      ${postHeader(post)}
      ${mainContent(post)}
      ${interactionRow(post)}
      ${footerBlock(post)}
    </article>`;
}

function currentPosts(){
  let posts = activeTab==="suggested" ? [...suggestedPosts] : [...adventurePosts];
  posts=posts.filter(p=>activeTypes.includes(p.type));

  if(activeTab==="adventure" && activeAdventureInterest!=="all"){
    const map={
      vehicles:"Vehicles",
      architecture:"Architecture",
      marine:"Marine Life",
      history:"History",
      science:"Science",
      outdoors:"Outdoors"
    };
    const chosen=map[activeAdventureInterest];
    const focused=posts.filter(p=>p.interest===chosen);
    const variety=posts.filter(p=>p.interest!==chosen);
    posts=[...focused,...variety];
  }
  return posts;
}

function renderDiscover(){
  const left=document.getElementById("discoverLeftColumn");
  const right=document.getElementById("discoverRightColumn");
  left.innerHTML="";
  right.innerHTML="";

  const posts=currentPosts();
  const single=window.innerWidth<=700;

  posts.forEach((post,index)=>{
    const target=single ? left : (index%2===0 ? left : right);
    target.insertAdjacentHTML("beforeend",buildDiscoverCard(post));
  });

  right.style.display=single?"none":"flex";
}

function switchDiscoverTab(tab){
  activeTab=tab;
  document.querySelectorAll(".discover-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));

  const desc=document.getElementById("discoverDescription");
  const interests=document.getElementById("discoverInterestRow");
  const saved=document.getElementById("savedFilterArea");

  if(tab==="suggested"){
    desc.textContent="Find more of what you enjoy—and a few things you may have missed.";
    interests.classList.remove("show");
    saved.style.display="";
  }else{
    desc.textContent="Step outside your usual feed and explore new topics, communities, people, and perspectives.";
    interests.classList.add("show");
    saved.style.display="none";
  }

  closeDiscoverFilter();
  renderDiscover();
  window.scrollTo({top:0,behavior:"smooth"});
}

function chooseAdventureInterest(button,key){
  activeAdventureInterest=key;
  document.querySelectorAll(".discover-interest-pill").forEach(b=>b.classList.remove("active"));
  button.classList.add("active");
  renderDiscover();
}

function followDiscoverInterest(el,interest){
  if(followedInterests.has(interest)) return;

  followedInterests.add(interest);

  document.querySelectorAll(`.topic[data-interest="${CSS.escape(interest)}"]`).forEach(topic=>{
    const matchingPost = [...suggestedPosts, ...adventurePosts].find(post => post.interest === interest);
    const icon = matchingPost ? matchingPost.emoji : "";

    topic.className = "topic";
    topic.removeAttribute("onclick");
    topic.textContent = `${icon} ${interest}`.trim();
  });
}


function renderCommunities(){
  const pinned=document.getElementById("pinnedCommunities");
  const menu=document.getElementById("communityDropdown");
  if(!pinned || !menu) return;

  pinned.innerHTML=communityCatalog
    .filter(c=>c.pinned)
    .map(c=>{
      const count=communityActivityCounts[c.name] || 0;
      const hidden=count===0;

      return `
        <button class="community-chip" type="button" draggable="true"
                data-community="${escapeHTML(c.name)}"
                data-icon="${c.icon}"
                data-activity-count="${count}"
                onclick="openDiscoverCommunity('${escapeHTML(c.name)}')">
          <span class="community-icon">${c.icon}</span>${escapeHTML(c.name)}
          <span class="activity-bell"
                onclick="openRecentCommunityActivity(event,this)"
                title="${hidden ? "No new community activity" : `${count} new community ${count===1?"activity":"activities"}`}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
              <path d="M10 21h4"></path>
            </svg>
            <span class="activity-count${hidden ? " hidden" : ""}">${count}</span>
          </span>
        </button>
      `;
    }).join("");

  menu.innerHTML=communityCatalog.map((c,index)=>`
    <div class="community-more-row">
      <span class="community-more-name">
        <span class="community-icon">${c.icon}</span>${escapeHTML(c.name)}
      </span>
      <button class="community-pin ${c.pinned?"pinned":""}" type="button" onclick="toggleCommunityPin(${index},event)">
        <span class="pin-state">${c.pinned?"Pinned":"Pin"}</span>
        <span class="pin-action">${c.pinned?"Unpin":"Pin"}</span>
      </button>
    </div>
  `).join("");
}

function toggleCommunityPin(index,event){
  event?.stopPropagation();

  const community=communityCatalog[index];
  if(!community) return;

  /* Only pin state changes here.
     Notification/activity counts live separately and are preserved. */
  community.pinned=!community.pinned;

  renderCommunities();
  document.getElementById("communityDropdown")?.classList.add("active");
}

function openDiscoverCommunity(name){
  document.querySelectorAll(".community-chip").forEach(chip=>{
    chip.classList.toggle("active", chip.dataset.community===name);
  });

  // Close the More menu after choosing a pinned community,
  // matching the feel of a normal navigation selection.
  document.getElementById("communityDropdown")?.classList.remove("active");
}

function openRecentCommunityActivity(event,bell){
  event.stopPropagation();

  const chip=bell.closest(".community-chip");
  const name=chip?.dataset.community;
  if(!name) return;

  communityActivityCounts[name]=0;

  const count=bell.querySelector(".activity-count");
  if(count){
    count.textContent="0";
    count.classList.add("hidden");
  }

  bell.title="No new community activity";
}


function renderSavedDiscoverFilters(){
  const list=document.getElementById("savedFilterList");
  const count=document.getElementById("savedFilterCount");
  const saveButton=document.getElementById("saveCurrentFilterButton");
  if(!list || !count || !saveButton) return;

  count.textContent=`${savedDiscoverFilters.length} / 3 saved`;
  saveButton.disabled=savedDiscoverFilters.length>=3;

  if(!savedDiscoverFilters.length){
    list.innerHTML=`<div class="saved-filter-empty">No saved filters yet.</div>`;
    return;
  }

  list.innerHTML=savedDiscoverFilters.map((filter,index)=>`
    <div class="saved-filter-row ${selectedSavedFilterIndex===index?"selected":""}" onclick="applySavedDiscoverFilter(${index})">
      <button class="saved-filter-name saved-filter-mini" type="button" onclick="event.stopPropagation(); applySavedDiscoverFilter(${index})">${escapeHTML(filter.name)}</button>
      <span class="saved-filter-types">${filter.types.map(t=>t[0].toUpperCase()+t.slice(1)).join(", ")}</span>

      <div class="saved-filter-gear-wrap">
        <button class="saved-filter-gear"
                type="button"
                aria-label="Manage saved filter"
                onclick="toggleSavedFilterGearMenu(event,this)">⋯</button>

        <div class="saved-filter-gear-menu">
          <button type="button" onclick="renameSavedDiscoverFilter(${index}); closeSavedFilterGearMenus()">Rename</button>
          <button class="delete" type="button" onclick="deleteSavedDiscoverFilter(${index}); closeSavedFilterGearMenus()">Delete</button>
        </div>
      </div>
    </div>
  `).join("");
}

function closeSavedFilterGearMenus(){
  document.querySelectorAll(".saved-filter-gear-menu.open").forEach(menu=>menu.classList.remove("open"));
}

function toggleSavedFilterGearMenu(event,button){
  event.stopPropagation();

  const menu=button.nextElementSibling;
  const shouldOpen=!menu.classList.contains("open");

  closeSavedFilterGearMenus();

  if(shouldOpen){
    menu.classList.add("open");
  }
}

let savedFilterWarningTimer;

function showSavedFilterDuplicateWarning(){
  const warning=document.getElementById("savedFilterWarning");
  if(!warning) return;

  clearTimeout(savedFilterWarningTimer);
  warning.classList.add("show");

  savedFilterWarningTimer=setTimeout(()=>{
    warning.classList.remove("show");
  },2200);
}

function saveCurrentDiscoverFilter(){
  if(savedDiscoverFilters.length>=3) return;

  const checked=[...document.querySelectorAll(".discover-filter-options input:checked")].map(i=>i.value);

  /* Nothing selected cannot be saved. */
  if(!checked.length) return;

  /* "Everything" is the default state, so it is not saveable. */
  if(checked.length===4) return;

  const signature=[...checked].sort().join("|");
  const duplicate=savedDiscoverFilters.some(filter=>
    [...filter.types].sort().join("|")===signature
  );

  if(duplicate){
    showSavedFilterDuplicateWarning();
    return;
  }

  const proposed=prompt("Name this saved filter:");
  const name=(proposed||"").trim();
  if(!name) return;

  savedDiscoverFilters.push({name,types:[...checked]});
  renderSavedDiscoverFilters();
}

function applySavedDiscoverFilter(index){
  const filter=savedDiscoverFilters[index];
  if(!filter) return;

  selectedSavedFilterIndex=index;

  document.querySelectorAll(".discover-filter-options input").forEach(input=>{
    input.checked=filter.types.includes(input.value);
  });

  activeTypes=[...filter.types];
  document.getElementById("discoverFilterButton").classList.toggle("restricted",activeTypes.length<4);
  renderSavedDiscoverFilters();
  renderDiscover();
}

function renameSavedDiscoverFilter(index){
  const filter=savedDiscoverFilters[index];
  if(!filter) return;

  const proposed=prompt("Rename this filter:",filter.name);
  const name=(proposed||"").trim();
  if(!name) return;

  filter.name=name;
  renderSavedDiscoverFilters();
}

function deleteSavedDiscoverFilter(index){
  savedDiscoverFilters.splice(index,1);
  if(selectedSavedFilterIndex===index){
    selectedSavedFilterIndex=null;
  }else if(selectedSavedFilterIndex!==null && selectedSavedFilterIndex>index){
    selectedSavedFilterIndex--;
  }
  renderSavedDiscoverFilters();
}

function toggleDiscoverFilter(event){
  event.stopPropagation();
  document.getElementById("discoverFilterPanel").classList.toggle("open");
}

function closeDiscoverFilter(){
  document.getElementById("discoverFilterPanel").classList.remove("open");
}

function applyDiscoverFilter(){
  const chosen=[...document.querySelectorAll(".discover-filter-options input:checked")].map(i=>i.value);
  if(!chosen.length) return;
  activeTypes=chosen;
  document.getElementById("discoverFilterButton").classList.toggle("restricted",chosen.length<4);
  renderDiscover();
  closeDiscoverFilter();
}

function clearDiscoverFilter(){
  selectedSavedFilterIndex=null;
  document.querySelectorAll(".discover-filter-options input").forEach(i=>i.checked=true);
  activeTypes=["post","blog","video","byte"];
  document.getElementById("discoverFilterButton").classList.remove("restricted");
  renderDiscover();
  closeDiscoverFilter();
  renderSavedDiscoverFilters();
}

/* Home-card interactions reproduced locally for Discover. */

function toggleDiscoverBlog(button){
  const post=button.closest(".post");
  const full=post?.querySelector(".blog-full-body");
  if(!full) return;
  const opening=!full.classList.contains("active");
  full.classList.toggle("active",opening);
  button.textContent=opening ? "Close Blog ↑" : "Read Blog →";
}

function toggleLikeNew(button){
  const liked=button.dataset.liked==="true";
  button.dataset.liked=String(!liked);
  button.classList.toggle("liked",!liked);
  const count=button.querySelector(".like-count");
  if(count) count.textContent=Math.max(0,Number(count.textContent||0)+(!liked?1:-1));
}

function toggleCommentLike(button){
  const liked=button.dataset.liked==="true";
  button.dataset.liked=String(!liked);
  button.classList.toggle("liked",!liked);
}

function toggleSimpleAction(button){
  button.classList.toggle("active");
}

function incrementDiscoverReblog(button){
  const count=button.querySelector("span");
  if(count) count.textContent=Number(count.textContent||0)+1;
  button.classList.add("active");
}

function toggleDiscoverSave(button){
  button.classList.toggle("saved");
}

function togglePostMenu(event,button){
  event.stopPropagation();
  const menu=button.nextElementSibling;
  document.querySelectorAll(".discover-post-menu").forEach(other=>{
    if(other!==menu) other.classList.remove("open");
  });
  menu?.classList.toggle("open");
}

function toggleComments(el){
  const post=el.closest(".post");
  const section=post?.querySelector(".comments-section");
  const hide=post?.querySelector(".hide-comments-inline");
  if(!section) return;
  const opening=!section.classList.contains("active");
  section.classList.toggle("active",opening);
  el.style.display=opening?"none":"";
  hide?.classList.toggle("show",opening);
}

function hideDiscoverComments(button){
  const post=button.closest(".post");
  post?.querySelector(".comments-section")?.classList.remove("active");
  button.classList.remove("show");
  const more=post?.querySelector(".more-comments");
  if(more) more.style.display="";
}

function openDiscoverCommentComposer(composer){
  const wrapper=composer.closest(".single-comment-composer");
  composer.classList.add("active");
  wrapper?.classList.add("open");
  composer.querySelector(".comment-text-area")?.focus();
}

function closeDiscoverCommentComposer(button,event){
  event?.stopPropagation();
  const composer=button.closest(".comment-composer");
  composer?.classList.remove("active");
  composer?.closest(".single-comment-composer")?.classList.remove("open");
}

function toggleReplyComposer(button){
  const item=button.closest(".comment-item,.reply-item");
  const composer=[...item.children].find(el=>el.classList?.contains("reply-composer"));
  composer?.classList.toggle("active");
  composer?.querySelector("textarea")?.focus();
}

function postReply(button){
  const composer=button.closest(".reply-composer");
  const input=composer?.querySelector(".reply-input");
  const text=input?.value.trim();
  if(!text) return;
  const reply=document.createElement("div");
  reply.className="reply-item";
  reply.innerHTML=`<div class="reply-author">@yourusername</div><div class="reply-content">${escapeHTML(text)}</div>`;
  const host=composer.closest(".comment-item")?.querySelector(".reply-list") || composer.parentElement;
  host.appendChild(reply);
  input.value="";
  composer.classList.remove("active");
}

function postCommentNew(button,event){
  event?.stopPropagation();
  const composer=button.closest(".comment-composer");
  const input=composer?.querySelector(".comment-text-area");
  const text=input?.value.trim();
  if(!text) return;

  const post=button.closest(".post");
  const section=post.querySelector(".comments-section");
  const item=document.createElement("div");
  item.className="comment-item";
  item.innerHTML=`<div aria-hidden="true" class="comment-avatar">y</div>
                  <div class="comment-body">
                    <div class="comment-author">@yourusername</div>
                    <div>${escapeHTML(text)}</div>
                    <div class="comment-actions">
                      <button class="comment-action comment-like-button" data-liked="false" onclick="toggleCommentLike(this)" type="button">
                        <svg aria-hidden="true" class="comment-like-icon" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><span>Like</span>
                      </button>
                      <button class="comment-action" type="button">Reply</button>
                    </div>
                  </div>`;
  section.prepend(item);
  section.classList.add("active");

  const latest=post.querySelector(".latest-comment");
  if(latest){
    latest.innerHTML=`<span class="comment-username">@yourusername:</span><span class="latest-comment-copy">${escapeHTML(text)}</span><span class="latest-comment-time">Just now</span>`;
  }

  const more=post.querySelector(".more-comments");
  if(more) more.style.display="none";
  post.querySelector(".hide-comments-inline")?.classList.add("show");

  input.value="";
  composer.classList.remove("active");
  composer.closest(".single-comment-composer")?.classList.remove("open");
}

function togglePostHashtags(el){
  const post=el.closest(".post");
  const box=post?.querySelector(".post-hashtags");
  const footer=post?.querySelector(".post-footer");
  if(!post || !box) return;

  if(footer && box.previousElementSibling!==footer){
    footer.insertAdjacentElement("afterend",box);
  }

  const open=!box.classList.contains("active");
  box.classList.toggle("active",open);
  el.classList.toggle("active",open);

  const set=(name,value)=>box.style.setProperty(name,value,"important");
  set("position","static");
  set("width","auto");
  set("max-width","none");
  set("margin","0 18px 12px");
  set("padding","10px 12px");
  set("gap","6px");
  set("box-sizing","border-box");
  set("flex-wrap","wrap");
  set("justify-content","flex-start");
  set("align-items","center");
  set("border","1px dotted rgba(255,207,159,.30)");
  set("border-radius","12px");
  set("background","rgba(255,207,159,.035)");
  set("display",open?"flex":"none");
}

function closePostHashtags(event,button){
  event.stopPropagation();
  button.closest(".post-hashtags")?.classList.remove("active");
}

function toggleCommunityDropdown(){
  document.getElementById("communityDropdown")?.classList.toggle("active");
}

function refreshDiscover(){
  renderDiscover();
  window.scrollTo({top:0,behavior:"smooth"});
}

document.addEventListener("click",()=>{
  closeDiscoverFilter();
  closeSavedFilterGearMenus();
  document.querySelectorAll(".discover-post-menu").forEach(menu=>menu.classList.remove("open"));
});

let resizeTimer;
window.addEventListener("resize",()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(renderDiscover,120);
});

renderCommunities();
renderSavedDiscoverFilters();
renderDiscover();
