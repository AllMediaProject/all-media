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

function demoMedia(post){
  if(!post.media) return "";
  const art=`<div class="discover-demo-art ${post.media}">${post.icon||"✦"}</div>`;

  if(post.type==="blog"){
    return `<div class="blog-home-preview"><div class="post-image">${art}</div></div>`;
  }

  if(post.type==="video"){
    return `<div class="sample-video-shell">${art}</div>`;
  }

  if(post.type==="byte"){
    return `<div class="byte-home-media-stage"><div class="sample-byte-shell">${art}</div></div>`;
  }

  return `<div class="post-image">${art}</div>`;
}

function mainContent(post){
  if(post.type==="blog"){
    return `
      <div class="blog-feed-title">${escapeHTML(post.title)}</div>
      ${demoMedia(post)}
      <div class="caption blog-feed-excerpt">${escapeHTML(post.caption)}</div>

      <div class="discover-blog-full">
        <p>
          ${escapeHTML(post.caption)}
          This is sample expanded blog content for the Discover prototype.
          In the finished version, this area would display the full published blog body,
          including its normal formatting, images, and links.
        </p>
      </div>

      <button type="button"
              class="blog-read-button"
              onclick="toggleDiscoverBlog(this)">
        Read Blog
      </button>
    `;
  }

  if(post.type==="video"){
    return `
      <div class="video-feed-title">${escapeHTML(post.title)}</div>
      ${demoMedia(post)}
      <div class="video-caption-row"><div class="caption video-caption">${escapeHTML(post.caption)}</div></div>
    `;
  }

  if(post.type==="byte"){
    return `
      ${demoMedia(post)}
      <div class="byte-caption-row"><div class="caption byte-caption">${escapeHTML(post.caption)}</div></div>
    `;
  }

  return `${demoMedia(post)}<div class="caption">${escapeHTML(post.caption)}</div>`;
}

function buildDiscoverCard(post){
  return `
  <article class="post ${post.type==="blog"?"blog-post":post.type==="video"?"video-post":post.type==="byte"?"byte-post":""}"
           data-type="${post.type}"
           data-interest="${escapeHTML(post.interest)}">

    <div class="post-header">
      <div class="profile-picture"></div>

      <div class="post-author-copy">
        <div class="post-author-line">
          <div class="username">${escapeHTML(post.user)}</div>
          ${contentTypeLabel(post)}
          <span class="post-time">${escapeHTML(post.time)}</span>
        </div>

        <div class="post-meta-line">
          ${topicHTML(post)}
          ${post.community ? `<div class="post-community">· in ${escapeHTML(post.community)}</div>` : ""}
        </div>
      </div>

      <div class="post-menu">
        <button class="post-menu-button" onclick="togglePostMenu(event,this)">⋯</button>
        <div class="post-menu-dropdown">
          <button>Not interested</button>
          <button>Report</button>
        </div>
      </div>
    </div>

    ${mainContent(post)}

    <div class="interactions">
      <button class="interaction like-button" data-liked="false" onclick="toggleLikeNew(this)">
        <span class="like-heart">♡</span> <span class="like-count">${post.likes}</span>
      </button>

      <button class="quick-action pocket-action" type="button" onclick="toggleSimpleAction(this)">
        <svg class="quick-action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 7.5h6l2 2h9v9.25a1.75 1.75 0 0 1-1.75 1.75H5.25a1.75 1.75 0 0 1-1.75-1.75Z"></path>
          <path d="M3.5 9.5V6.75A1.75 1.75 0 0 1 5.25 5h4.2l2 2h3.3"></path>
        </svg>
        <span>Pocket</span>
      </button>

      <button class="quick-action community-action" type="button" onclick="toggleSimpleAction(this)">
        <svg class="quick-action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3"></circle>
          <circle cx="17" cy="9.5" r="2.5"></circle>
          <path d="M3.5 19c.4-3.3 2.3-5 5.5-5s5.1 1.7 5.5 5"></path>
          <path d="M14 15c.8-.7 1.9-1 3.2-1 2.2 0 3.5 1.3 3.8 3.8"></path>
        </svg>
        <span>Community</span>
      </button>

      <div class="interaction reblog-counter"><span class="reblog-icon">↻</span> ${post.reblogs} · Reblog</div>
      <button class="interaction share share-action" type="button">↗ Share</button>
    </div>

    <div class="latest-comment-label">Latest comment</div>
    <div class="latest-comment" data-time="2m ago">
      <span class="comment-username">${escapeHTML(post.latestUser)}:</span>
      ${escapeHTML(post.latest)}
    </div>

    <div class="post-footer">
      <button class="comment-button" onclick="toggleCommentComposerForPost(this.closest('.post'))">Leave your opinion…</button>
      <div class="footer-link more-comments" onclick="toggleComments(this)">💬 View ${Math.max(post.comments-1,0)} more comments</div>

      <div class="post-footer-actions">
        <div class="hashtag-link" onclick="togglePostHashtags(this)">
          <div class="hashtag-icon">#</div><span>Hashtags</span>
        </div>
      </div>

      <div class="post-hashtags">
        ${post.hashtags.map(h=>`<span class="post-hashtag">${escapeHTML(h)}</span>`).join("")}
        <button type="button" class="post-hashtag-done" onclick="closePostHashtags(event,this)">Done</button>
      </div>
    </div>

    <div class="comments-section">
      <div class="comment-item">
        <div class="comment-author">${escapeHTML(post.latestUser)}</div>
        <div class="comment-content">${escapeHTML(post.latest)}</div>
        <div class="comment-actions">
          <button class="comment-like" data-liked="false" onclick="toggleCommentLike(this)">
            <span class="like-heart">♡</span> <span>4</span>
          </button>
          <button class="reply-button" onclick="toggleReplyComposer(this)">Reply</button>
        </div>
        <div class="reply-list">
          <div class="reply-item">
            <div class="reply-author">${escapeHTML(post.user)}</div>
            <div class="reply-content">Thank you!!</div>
            <div class="comment-actions">
              <button class="comment-like" data-liked="false" onclick="toggleCommentLike(this)">
                <span class="like-heart">♡</span> <span>2</span>
              </button>
              <button class="reply-button" onclick="toggleReplyComposer(this)">Reply</button>
            </div>
            <div class="reply-composer">
              <textarea class="reply-input" placeholder="Reply…"></textarea>
              <div class="reply-submit"><button class="reply-post-button" onclick="postReply(this)">POST</button></div>
            </div>
          </div>
        </div>
        <div class="reply-composer">
          <textarea class="reply-input" placeholder="Reply…"></textarea>
          <div class="reply-submit"><button class="reply-post-button" onclick="postReply(this)">POST</button></div>
        </div>
      </div>

      <div class="comment-item">
        <div class="comment-author">@wanderingcloud</div>
        <div class="comment-content">This is exactly the sort of thing I like finding here.</div>
        <div class="comment-actions">
          <button class="comment-like" data-liked="false" onclick="toggleCommentLike(this)">
            <span class="like-heart">♡</span> <span>1</span>
          </button>
          <button class="reply-button" onclick="toggleReplyComposer(this)">Reply</button>
        </div>
        <div class="reply-composer">
          <textarea class="reply-input" placeholder="Reply…"></textarea>
          <div class="reply-submit"><button class="reply-post-button" onclick="postReply(this)">POST</button></div>
        </div>
      </div>
    </div>

    <div class="comment-composer">
      <div class="comment-user">
        <div class="comment-profile-picture"></div>
        <div class="comment-username-display">@yourusername</div>
      </div>
      <textarea class="comment-text-area" placeholder="Say hi…"></textarea>
      <div class="comment-post-actions">
        <button class="comment-post-button" onclick="postCommentNew(this)">POST</button>
      </div>
    </div>
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
  const full=post?.querySelector(".discover-blog-full");
  if(!full) return;

  const opening=!full.classList.contains("open");
  full.classList.toggle("open",opening);
  button.textContent=opening ? "Close Blog" : "Read Blog";
}

function toggleLikeNew(button){
  const liked=button.dataset.liked==="true";
  button.dataset.liked=String(!liked);
  const heart=button.querySelector(".like-heart");
  if(heart) heart.textContent=!liked?"♥":"♡";
  const count=button.querySelector(".like-count");
  if(count) count.textContent=Math.max(0,Number(count.textContent||0)+(!liked?1:-1));
}

function toggleCommentLike(button){
  const liked=button.dataset.liked==="true";
  button.dataset.liked=String(!liked);
  const heart=button.querySelector(".like-heart");
  if(heart) heart.textContent=!liked?"♥":"♡";
  const n=button.querySelector("span:not(.like-heart)");
  if(n) n.textContent=Math.max(0,Number(n.textContent||0)+(!liked?1:-1));
}

function toggleSimpleAction(button){
  button.classList.toggle("active");
}

function togglePostMenu(event,button){
  event.stopPropagation();
  document.querySelectorAll(".post-menu-dropdown").forEach(menu=>{
    if(menu!==button.nextElementSibling) menu.classList.remove("active");
  });
  button.nextElementSibling?.classList.toggle("active");
}

function toggleComments(el){
  const post=el.closest(".post");
  post.querySelector(".comments-section")?.classList.toggle("active");
}

function toggleCommentComposerForPost(post){
  post.querySelector(".comment-composer")?.classList.toggle("active");
  post.querySelector(".comment-text-area")?.focus();
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
  reply.innerHTML=`<div class="reply-author">@yourusername</div>
                   <div class="reply-content">${escapeHTML(text)}</div>
                   <div class="comment-actions">
                     <button class="comment-like" data-liked="false" onclick="toggleCommentLike(this)">
                       <span class="like-heart">♡</span> <span>0</span>
                     </button>
                     <button class="reply-button" onclick="toggleReplyComposer(this)">Reply</button>
                   </div>`;
  const host=composer.closest(".comment-item")?.querySelector(".reply-list") || composer.parentElement;
  host.appendChild(reply);
  input.value="";
  composer.classList.remove("active");
}

function postCommentNew(button){
  const composer=button.closest(".comment-composer");
  const input=composer?.querySelector(".comment-text-area");
  const text=input?.value.trim();
  if(!text) return;

  const post=button.closest(".post");
  const section=post.querySelector(".comments-section");
  const item=document.createElement("div");
  item.className="comment-item";
  item.innerHTML=`<div class="comment-author">@yourusername</div>
                  <div class="comment-content">${escapeHTML(text)}</div>
                  <div class="comment-actions">
                    <button class="comment-like" data-liked="false" onclick="toggleCommentLike(this)">
                      <span class="like-heart">♡</span> <span>0</span>
                    </button>
                    <button class="reply-button" onclick="toggleReplyComposer(this)">Reply</button>
                  </div>
                  <div class="reply-composer">
                    <textarea class="reply-input" placeholder="Reply…"></textarea>
                    <div class="reply-submit"><button class="reply-post-button" onclick="postReply(this)">POST</button></div>
                  </div>`;
  section.prepend(item);
  section.classList.add("active");

  const latest=post.querySelector(".latest-comment");
  if(latest){
    latest.classList.remove("empty-comment");
    latest.dataset.time="Just now";
    latest.innerHTML=`<span class="comment-username">@yourusername:</span> ${escapeHTML(text)}`;
  }

  input.value="";
  composer.classList.remove("active");
}

function togglePostHashtags(link){
  const post=link.closest(".post");
  post.querySelector(".post-hashtags")?.classList.toggle("active");
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
  document.querySelectorAll(".post-menu-dropdown").forEach(menu=>menu.classList.remove("active"));
});

let resizeTimer;
window.addEventListener("resize",()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(renderDiscover,120);
});

renderCommunities();
renderSavedDiscoverFilters();
renderDiscover();
