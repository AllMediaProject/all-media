(() => {
"use strict";

/*
  ALL MEDIA — POST AUTHOR PROFILE NAVIGATION

  One delegated handler covers:
  - static Home cards
  - dynamically-created Home cards
  - Discover cards rendered by discover.js
  - Community cards
  - Profile feed cards

  Only the post AUTHOR avatar + username are connected in this pass.
  Comment / reply usernames remain untouched on purpose.
*/

const OWNER_HANDLES=new Set([
  "sugarcrumbco",
  "yourusername"
]);

function normalizeHandle(value){
  return String(value||"")
    .trim()
    .replace(/^@+/,"")
    .trim();
}

function normalizedKey(value){
  return normalizeHandle(value).toLowerCase();
}

function postFromTarget(target){
  return target.closest(".post");
}

function handleFromPost(post){
  return normalizeHandle(
    post?.querySelector(".post-header .username")?.textContent
  );
}

function currentOwnerHandle(){
  const visibleOwnerHandle=
    document.querySelector("#myProfile .profile-handle-large")?.textContent;

  return normalizeHandle(visibleOwnerHandle);
}

function isOwnerPost(post,handle){
  if(!post)return false;

  if(
    post.dataset.owner==="current-user" ||
    post.classList.contains("own-post")
  ){
    return true;
  }

  const key=normalizedKey(handle);
  if(OWNER_HANDLES.has(key))return true;

  const ownerKey=normalizedKey(currentOwnerHandle());
  if(ownerKey && key===ownerKey)return true;

  return false;
}

function profileUrlForPost(post){
  const handle=handleFromPost(post);
  if(!handle)return null;

  if(isOwnerPost(post,handle)){
    return "profile.html";
  }

  return `profile.html?user=${encodeURIComponent(handle)}`;
}

function openAuthorProfile(target){
  const post=postFromTarget(target);
  const url=profileUrlForPost(post);
  if(!url)return;

  window.location.href=url;
}

function authorTargets(root=document){
  return root.querySelectorAll?.(
    ".post .post-header .profile-picture, .post .post-header .username"
  ) || [];
}

function decorateAuthorTarget(target){
  if(!(target instanceof Element))return;
  if(target.dataset.authorProfileLink==="true")return;

  const post=postFromTarget(target);
  const handle=handleFromPost(post);
  if(!post || !handle)return;

  target.dataset.authorProfileLink="true";
  target.setAttribute("role","link");
  target.setAttribute("tabindex","0");
  target.setAttribute(
    "aria-label",
    isOwnerPost(post,handle)
      ?"Open your profile"
      :`Open @${handle}'s profile`
  );
}

function decorate(root=document){
  authorTargets(root).forEach(decorateAuthorTarget);
}

document.addEventListener("click",event=>{
  const target=event.target.closest(
    '.post .post-header [data-author-profile-link="true"]'
  );

  if(!target)return;

  event.preventDefault();
  event.stopPropagation();
  openAuthorProfile(target);
});

document.addEventListener("keydown",event=>{
  const target=event.target.closest?.(
    '.post .post-header [data-author-profile-link="true"]'
  );

  if(!target)return;
  if(event.key!=="Enter" && event.key!==" ")return;

  event.preventDefault();
  event.stopPropagation();
  openAuthorProfile(target);
});


/* =========================================================
   AUD-010 — RENDER POSTS SHARED INTO A COMMUNITY
   The Community chooser already stores clean post snapshots in
   allMediaCommunitySharedPostsV1. On community.html only, render
   the selected Community's stored posts into the existing feed.
========================================================= */

const COMMUNITY_SHARED_POSTS_KEY="allMediaCommunitySharedPostsV1";
const COMMUNITY_STATE_KEY="allMediaCommunityStateV1";
const DEFAULT_COMMUNITY_SLUGS=new Set([
  "spooky-cozy",
  "artists",
  "turtle-rescue",
  "book-club",
  "crochet-corner",
  "garden-and-nature"
]);

function readSharedCommunityMap(){
  try{
    const value=JSON.parse(
      localStorage.getItem(COMMUNITY_SHARED_POSTS_KEY)||"{}"
    );
    return value && typeof value==="object" ? value : {};
  }catch(error){
    return {};
  }
}

function currentSharedCommunitySlug(){
  const requested=
    new URLSearchParams(window.location.search).get("community");

  if(!requested)return "spooky-cozy";
  if(DEFAULT_COMMUNITY_SLUGS.has(requested))return requested;

  try{
    const stored=JSON.parse(
      localStorage.getItem(COMMUNITY_STATE_KEY)||"{}"
    );

    if(stored && stored[requested]){
      return requested;
    }
  }catch(error){}

  return "spooky-cozy";
}

function sharedCommunityPostNode(record){
  if(!record?.html)return null;

  const template=document.createElement("template");
  template.innerHTML=String(record.html).trim();

  const post=
    template.content.querySelector(".post") ||
    template.content.firstElementChild;

  if(!(post instanceof Element))return null;

  post.dataset.communitySharedRendered="true";
  post.dataset.communitySharedPostId=record.id||"";
  post.dataset.communitySharedAt=String(Number(record.sharedAt)||0);

  return post;
}

function renderSharedCommunityPosts(){
  const left=document.getElementById("communityPostColumnLeft");
  const right=document.getElementById("communityPostColumnRight");

  // Strict page guard: do nothing on Home, Discover, Profile, etc.
  if(!left || !right)return;

  // Remove only previously-rendered shared snapshots before rebuilding.
  document.querySelectorAll(
    '.community-post-column > .post[data-community-shared-rendered="true"]'
  ).forEach(post=>post.remove());

  const slug=currentSharedCommunitySlug();
  const map=readSharedCommunityMap();

  const records=[...(map[slug]||[])]
    .filter(record=>record?.html)
    .sort(
      (a,b)=>
        (Number(b.sharedAt)||0)-
        (Number(a.sharedAt)||0)
    );

  const sharedPosts=
    records.map(sharedCommunityPostNode).filter(Boolean);

  if(
    typeof window.currentCommunityFeedPosts==="function" &&
    typeof window.rebuildCommunityFeedLayout==="function"
  ){
    const existing=
      window.currentCommunityFeedPosts()
        .filter(
          post=>
            post.dataset.communitySharedRendered!=="true"
        );

    window.rebuildCommunityFeedLayout([
      ...sharedPosts,
      ...existing
    ]);

    return;
  }

  // Fallback only if the Community page's normal layout helpers
  // are unavailable for some reason.
  sharedPosts.forEach((post,index)=>{
    (index%2===0 ? left : right).appendChild(post);
  });

  const empty=document.getElementById("communityEmptyFeedWrap");
  if(empty && sharedPosts.length){
    empty.hidden=true;
  }
}


/* =========================================================
   AUD-011 — REAL REBLOG STORAGE + PROFILE REBLOGS
   One shared Reblog system for Home, Discover, Community, and
   Profile cards. Reblog is a toggle and persists in localStorage.
========================================================= */

const PROFILE_REBLOGS_KEY="allMediaProfileReblogsV1";

function readProfileReblogs(){
  try{
    const value=JSON.parse(
      localStorage.getItem(PROFILE_REBLOGS_KEY)||"[]"
    );
    return Array.isArray(value)?value:[];
  }catch(error){
    return [];
  }
}

function writeProfileReblogs(records){
  try{
    localStorage.setItem(
      PROFILE_REBLOGS_KEY,
      JSON.stringify(records)
    );
  }catch(error){}
}

function reblogPostHash(text){
  let h=2166136261;

  for(let i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,16777619);
  }

  return (h>>>0).toString(36);
}

function reblogPostId(post){
  if(!post)return "";

  if(post.dataset.profileReblogId){
    return post.dataset.profileReblogId;
  }

  const id="r_"+reblogPostHash([
    post.querySelector(".username")?.textContent||"",
    post.querySelector(".blog-title,.video-title")?.textContent||"",
    post.querySelector(
      ".caption,.blog-excerpt,.video-description,.byte-caption"
    )?.textContent||"",
    post.querySelector("img")?.src||"",
    post.querySelector("video")?.src||""
  ].join("|"));

  post.dataset.profileReblogId=id;
  return id;
}

function snapshotReblogPost(post){
  const clone=post.cloneNode(true);

  clone.removeAttribute("data-profile-reblog-rendered");

  [clone,...clone.querySelectorAll("*")].forEach(el=>{
    if(el.id)el.removeAttribute("id");
  });

  clone.querySelectorAll(
    ".active,.open,.show,.saved,.shared,.pocketed,.community-shared"
  ).forEach(el=>{
    el.classList.remove(
      "active",
      "open",
      "show",
      "saved",
      "shared",
      "pocketed",
      "community-shared"
    );
  });

  clone.querySelectorAll(".comments-section").forEach(el=>{
    el.classList.remove("active");
    el.style.display="";
  });

  clone.querySelectorAll(
    ".comment-composer,.single-comment-composer"
  ).forEach(el=>{
    el.classList.remove("active","open");
  });

  const reblog=clone.querySelector(".reblog-counter");
  if(reblog){
    reblog.dataset.reblogged="true";
    reblog.classList.add("reblogged");
  }

  return clone.outerHTML;
}

function reblogRecordForId(id,records=readProfileReblogs()){
  return records.find(record=>record.id===id)||null;
}

function setReblogButtonState(button,on,count){
  if(!button)return;

  button.dataset.reblogged=on?"true":"false";
  button.classList.toggle("reblogged",on);
  button.classList.toggle("active",on);
  button.setAttribute("aria-pressed",String(on));

  const countEl=button.querySelector("span");
  if(countEl && Number.isFinite(Number(count))){
    countEl.textContent=String(
      Math.max(0,Number(count))
    );
  }
}

function syncReblogButtons(){
  const records=readProfileReblogs();
  const byId=new Map(records.map(record=>[record.id,record]));

  document.querySelectorAll(".post .reblog-counter").forEach(button=>{
    const post=button.closest(".post");
    if(!post)return;

    const record=byId.get(reblogPostId(post));

    if(record){
      setReblogButtonState(
        button,
        true,
        Number(record.count)
      );
    }else{
      button.dataset.reblogged="false";
      button.classList.remove("reblogged","active");
      button.setAttribute("aria-pressed","false");
    }
  });
}

function profileReblogPostNode(record){
  if(!record?.html)return null;

  const template=document.createElement("template");
  template.innerHTML=String(record.html).trim();

  const post=
    template.content.querySelector(".post")||
    template.content.firstElementChild;

  if(!(post instanceof Element))return null;

  post.dataset.profileReblogRendered="true";
  post.dataset.profileReblogId=record.id||"";

  const reblog=post.querySelector(".reblog-counter");
  if(reblog){
    setReblogButtonState(
      reblog,
      true,
      Number(record.count)
    );
  }

  return post;
}

function renderProfileReblogs(){
  const panel=document.getElementById("reblogsPanel");
  if(!panel)return;

  const records=readProfileReblogs()
    .slice()
    .sort(
      (a,b)=>
        (Number(b.rebloggedAt)||0)-
        (Number(a.rebloggedAt)||0)
    );

  panel.classList.add("profile-feed");
  panel.innerHTML="";

  if(!records.length){
    const note=document.createElement("div");
    note.className="reblog-note";
    note.innerHTML=
      '<strong style="color:white">Reblogs</strong><br>'+
      "Posts you reblog will appear here.";
    panel.appendChild(note);
    return;
  }

  const feed=document.createElement("section");
  feed.className="feed am-profile-reblogs-feed";

  records.forEach(record=>{
    const post=profileReblogPostNode(record);
    if(post)feed.appendChild(post);
  });

  panel.appendChild(feed);
  decorate(panel);
}

function toggleStoredReblog(button,post){
  const id=reblogPostId(post);
  if(!id)return;

  const records=readProfileReblogs();
  const index=records.findIndex(record=>record.id===id);
  const countEl=button.querySelector("span");
  const visibleCount=Math.max(
    0,
    Number(countEl?.textContent||0)
  );

  if(index>=0){
    const nextCount=Math.max(0,visibleCount-1);
    records.splice(index,1);
    writeProfileReblogs(records);

    document.querySelectorAll(".post").forEach(otherPost=>{
      if(reblogPostId(otherPost)!==id)return;
      setReblogButtonState(
        otherPost.querySelector(".reblog-counter"),
        false,
        nextCount
      );
    });

    renderProfileReblogs();
    return;
  }

  const nextCount=visibleCount+1;
  setReblogButtonState(button,true,nextCount);

  const record={
    id,
    html:snapshotReblogPost(post),
    rebloggedAt:Date.now(),
    count:nextCount
  };

  records.unshift(record);
  writeProfileReblogs(records);

  document.querySelectorAll(".post").forEach(otherPost=>{
    if(reblogPostId(otherPost)!==id)return;
    setReblogButtonState(
      otherPost.querySelector(".reblog-counter"),
      true,
      nextCount
    );
  });

  renderProfileReblogs();
}

/*
  Capture phase intentionally owns Reblog before the older page-local
  inline handlers run. This prevents double increments and gives all
  four surfaces one consistent toggle behavior.
*/
document.addEventListener("click",event=>{
  const button=event.target.closest?.(
    ".post .reblog-counter"
  );

  if(!button)return;

  const post=button.closest(".post");
  if(!post)return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  toggleStoredReblog(button,post);
},true);

renderProfileReblogs();
syncReblogButtons();


/* =========================================================
   AUD-013 — REAL SAVED POSTS + PROFILE SAVED TAB
   Saved is private to the current user. One persistent toggle
   works across Home, Discover, Community, Profile, and copied cards.
========================================================= */

const PROFILE_SAVED_POSTS_KEY="allMediaProfileSavedPostsV1";

function readProfileSavedPosts(){
  try{
    const value=JSON.parse(
      localStorage.getItem(PROFILE_SAVED_POSTS_KEY)||"[]"
    );
    return Array.isArray(value)?value:[];
  }catch(error){
    return [];
  }
}

function writeProfileSavedPosts(records){
  try{
    localStorage.setItem(
      PROFILE_SAVED_POSTS_KEY,
      JSON.stringify(records)
    );
  }catch(error){}
}

function profileSavedPostId(post){
  if(!post)return "";

  if(post.dataset.profileSavedPostId){
    return post.dataset.profileSavedPostId;
  }

  const id="s_"+reblogPostHash([
    post.querySelector(".username")?.textContent||"",
    post.querySelector(".blog-title,.video-title")?.textContent||"",
    post.querySelector(
      ".caption,.blog-excerpt,.video-description,.byte-caption"
    )?.textContent||"",
    post.querySelector("img")?.src||"",
    post.querySelector("video")?.src||""
  ].join("|"));

  post.dataset.profileSavedPostId=id;
  return id;
}

function setSavedButtonState(button,on){
  if(!button)return;

  button.classList.toggle("saved",on);
  button.setAttribute(
    "aria-label",
    on?"Remove saved post":"Save post"
  );
  button.setAttribute("aria-pressed",String(on));

  const label=button.querySelector("span");
  if(label){
    label.textContent=on?"Saved":"Save";
  }
}

function snapshotSavedPost(post){
  const clone=post.cloneNode(true);

  clone.removeAttribute("data-profile-saved-rendered");

  [clone,...clone.querySelectorAll("*")].forEach(el=>{
    if(el.id)el.removeAttribute("id");
  });

  clone.querySelectorAll(
    ".active,.open,.show,.shared,.pocketed,.community-shared"
  ).forEach(el=>{
    el.classList.remove(
      "active",
      "open",
      "show",
      "shared",
      "pocketed",
      "community-shared"
    );
  });

  clone.querySelectorAll(".comments-section").forEach(el=>{
    el.classList.remove("active");
    el.style.display="";
  });

  clone.querySelectorAll(
    ".comment-composer,.single-comment-composer"
  ).forEach(el=>{
    el.classList.remove("active","open");
  });

  setSavedButtonState(
    clone.querySelector(".save-action"),
    true
  );

  return clone.outerHTML;
}

function syncSavedButtons(){
  const records=readProfileSavedPosts();
  const ids=new Set(records.map(record=>record.id));

  document.querySelectorAll(".post .save-action").forEach(button=>{
    const post=button.closest(".post");
    if(!post)return;

    setSavedButtonState(
      button,
      ids.has(profileSavedPostId(post))
    );
  });
}

function profileSavedPostNode(record){
  if(!record?.html)return null;

  const template=document.createElement("template");
  template.innerHTML=String(record.html).trim();

  const post=
    template.content.querySelector(".post")||
    template.content.firstElementChild;

  if(!(post instanceof Element))return null;

  post.dataset.profileSavedRendered="true";
  post.dataset.profileSavedPostId=record.id||"";

  setSavedButtonState(
    post.querySelector(".save-action"),
    true
  );

  return post;
}

function renderProfileSavedPosts(){
  const panel=document.getElementById("savedPanel");
  if(!panel)return;

  const records=readProfileSavedPosts()
    .slice()
    .sort(
      (a,b)=>
        (Number(b.savedAt)||0)-
        (Number(a.savedAt)||0)
    );

  panel.classList.add("profile-feed");
  panel.innerHTML="";

  if(!records.length){
    const note=document.createElement("div");
    note.className="saved-note";
    note.innerHTML=
      '<strong style="color:white">Saved — private</strong><br>'+
      "Only you can see this tab and the posts you save for later.";
    panel.appendChild(note);
    return;
  }

  const feed=document.createElement("section");
  feed.className="feed am-profile-saved-feed";

  records.forEach(record=>{
    const post=profileSavedPostNode(record);
    if(post)feed.appendChild(post);
  });

  panel.appendChild(feed);
  decorate(panel);
}

function toggleStoredSavedPost(button,post){
  const id=profileSavedPostId(post);
  if(!id)return;

  const records=readProfileSavedPosts();
  const index=records.findIndex(record=>record.id===id);

  if(index>=0){
    records.splice(index,1);
    writeProfileSavedPosts(records);

    document.querySelectorAll(".post").forEach(otherPost=>{
      if(profileSavedPostId(otherPost)!==id)return;
      setSavedButtonState(
        otherPost.querySelector(".save-action"),
        false
      );
    });

    renderProfileSavedPosts();
    return;
  }

  setSavedButtonState(button,true);

  records.unshift({
    id,
    html:snapshotSavedPost(post),
    savedAt:Date.now()
  });

  writeProfileSavedPosts(records);

  document.querySelectorAll(".post").forEach(otherPost=>{
    if(profileSavedPostId(otherPost)!==id)return;
    setSavedButtonState(
      otherPost.querySelector(".save-action"),
      true
    );
  });

  renderProfileSavedPosts();
}

/*
  Capture phase owns Save before older page-local visual-only handlers.
  This prevents double toggles and gives every supported surface the
  same persistent Saved behavior.
*/
document.addEventListener("click",event=>{
  const button=event.target.closest?.(
    ".post .save-action"
  );

  if(!button)return;

  const post=button.closest(".post");
  if(!post)return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  toggleStoredSavedPost(button,post);
},true);

renderProfileSavedPosts();
syncSavedButtons();


/* =========================================================
   AUD-014 — WORKING POCKET ACTION OUTSIDE HOME
   Home keeps using pocket-integration.js. Discover, Profile,
   and Community reuse the same Pocket storage + chooser design.
========================================================= */

const CROSS_PAGE_POCKET_CREATED_KEY="allMediaPocketPrototypeV1";
const CROSS_PAGE_POCKET_SAVED_KEY="allMediaPocketSavedPostsV1";
const CROSS_PAGE_POCKET_REGISTRY_KEY="allMediaPocketRegistryV1";

const CROSS_PAGE_POCKET_DEFAULTS=[
  {name:"Halloween",emoji:"🎃",type:"owned"},
  {name:"Art",emoji:"🎨",type:"owned"},
  {name:"Crochet",emoji:"🧶",type:"owned"},
  {name:"Home Decor",emoji:"🏠",type:"owned"},
  {name:"Recipes",emoji:"🍲",type:"owned"},
  {name:"Future Projects",emoji:"⭐",type:"owned"}
];

function crossPagePocketReadJSON(key,fallback){
  try{
    return JSON.parse(
      localStorage.getItem(key)||
      JSON.stringify(fallback)
    );
  }catch(error){
    return fallback;
  }
}

function crossPagePocketWriteJSON(key,value){
  try{
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  }catch(error){}
}

function crossPagePocketKey(name){
  return String(name||"").trim().toLowerCase();
}

function crossPagePocketPostId(post){
  if(!post)return "";

  if(post.dataset.pocketPostId){
    return post.dataset.pocketPostId;
  }

  const id="p_"+reblogPostHash([
    post.querySelector(".username")?.textContent||"",
    post.querySelector(".blog-title,.video-title")?.textContent||"",
    post.querySelector(
      ".caption,.blog-excerpt,.video-description,.byte-caption"
    )?.textContent||"",
    post.querySelector("img")?.src||"",
    post.querySelector("video")?.src||""
  ].join("|"));

  post.dataset.pocketPostId=id;
  return id;
}

function crossPagePocketSavedMap(){
  return crossPagePocketReadJSON(
    CROSS_PAGE_POCKET_SAVED_KEY,
    {}
  );
}

function crossPagePocketIsSavedAnywhere(id){
  return Object.values(
    crossPagePocketSavedMap()
  ).some(
    list=>(list||[]).some(
      record=>record.id===id
    )
  );
}

function crossPagePocketSnapshot(post){
  const clone=post.cloneNode(true);

  [clone,...clone.querySelectorAll("*")].forEach(el=>{
    [...el.attributes].forEach(attribute=>{
      if(/^on/i.test(attribute.name)){
        el.removeAttribute(attribute.name);
      }
    });

    if(el.id){
      el.removeAttribute("id");
    }
  });

  clone.querySelectorAll(
    ".active,.open,.show,.shared,.saved,.pocketed,.community-shared"
  ).forEach(el=>{
    el.classList.remove(
      "active",
      "open",
      "show",
      "shared",
      "saved",
      "pocketed",
      "community-shared"
    );
  });

  return clone.outerHTML;
}

function crossPagePocketIsIn(name,post){
  const id=crossPagePocketPostId(post);
  const map=crossPagePocketSavedMap();

  return (
    map[crossPagePocketKey(name)]||[]
  ).some(record=>record.id===id);
}

function crossPagePocketAdd(name,post){
  const map=crossPagePocketSavedMap();
  const key=crossPagePocketKey(name);
  const id=crossPagePocketPostId(post);
  const list=map[key]||[];

  if(!list.some(record=>record.id===id)){
    list.unshift({
      id,
      html:crossPagePocketSnapshot(post),
      addedAt:Date.now()
    });
  }

  map[key]=list;
  crossPagePocketWriteJSON(
    CROSS_PAGE_POCKET_SAVED_KEY,
    map
  );
}

function crossPagePocketRemove(name,post){
  const map=crossPagePocketSavedMap();
  const key=crossPagePocketKey(name);
  const id=crossPagePocketPostId(post);

  map[key]=(map[key]||[])
    .filter(record=>record.id!==id);

  crossPagePocketWriteJSON(
    CROSS_PAGE_POCKET_SAVED_KEY,
    map
  );
}

function crossPageOwnedPockets(){
  const registry=crossPagePocketReadJSON(
    CROSS_PAGE_POCKET_REGISTRY_KEY,
    {}
  );

  const created=crossPagePocketReadJSON(
    CROSS_PAGE_POCKET_CREATED_KEY,
    null
  );

  const seen=new Set();
  const result=[];

  if(created?.name){
    const key=crossPagePocketKey(created.name);

    seen.add(key);
    result.push({
      name:created.name,
      emoji:created.emoji||created.icon||"▱"
    });
  }

  Object.entries(registry).forEach(([registryKey,item])=>{
    if(!item || item.type!=="owned" || !item.name)return;

    const key=crossPagePocketKey(
      item.name||registryKey
    );

    if(seen.has(key))return;
    seen.add(key);

    result.push({
      name:item.name,
      emoji:item.emoji||item.icon||"▱"
    });
  });

  /*
    Direct-load fallback: if the Home registry has never been written
    in this browser, mirror Home's six built-in owned Pockets.
  */
  if(!Object.keys(registry).length){
    CROSS_PAGE_POCKET_DEFAULTS.forEach(item=>{
      const key=crossPagePocketKey(item.name);
      if(seen.has(key))return;
      seen.add(key);
      result.push({
        name:item.name,
        emoji:item.emoji
      });
    });
  }

  return result;
}

function crossPagePocketSignalWords(value){
  const words=String(value||"")
    .toLowerCase()
    .replace(/^#/,"")
    .match(/[a-z0-9]+/g)||[];

  const whole=words.join("");

  return [...new Set(
    [...words,whole].filter(Boolean)
  )];
}

function crossPagePocketHashtagSignal(value){
  return String(value||"")
    .toLowerCase()
    .replace(/^#/,"")
    .replace(/[^a-z0-9]+/g,"");
}

function crossPagePostPocketMatchData(post){
  const topics=new Set();
  const hashtags=new Set();

  post.querySelectorAll(".topic").forEach(el=>{
    crossPagePocketSignalWords(el.textContent)
      .forEach(signal=>topics.add(signal));
  });

  post.querySelectorAll(
    ".post-hashtags .post-hashtag"
  ).forEach(el=>{
    const signal=
      crossPagePocketHashtagSignal(
        el.textContent
      );

    if(signal)hashtags.add(signal);
  });

  return {topics,hashtags};
}

function crossPagePocketMatchData(pocket){
  const registry=crossPagePocketReadJSON(
    CROSS_PAGE_POCKET_REGISTRY_KEY,
    {}
  );

  const meta=
    registry[crossPagePocketKey(pocket.name)]||
    {};

  const topics=new Set();
  const hashtags=new Set();

  crossPagePocketSignalWords(pocket.name)
    .forEach(signal=>topics.add(signal));

  (meta.interests||[]).forEach(item=>{
    const value=
      typeof item==="string"
        ?item
        :item?.name;

    crossPagePocketSignalWords(value)
      .forEach(signal=>topics.add(signal));
  });

  (meta.hashtags||[]).forEach(tag=>{
    const signal=
      crossPagePocketHashtagSignal(tag);

    if(signal)hashtags.add(signal);
  });

  return {topics,hashtags};
}

function crossPagePocketMatchesPost(pocket,post){
  const postData=
    crossPagePostPocketMatchData(post);

  const pocketData=
    crossPagePocketMatchData(pocket);

  const topicMatch=
    [...postData.topics].some(
      signal=>pocketData.topics.has(signal)
    );

  const hashtagMatch=
    [...postData.hashtags].some(
      signal=>pocketData.hashtags.has(signal)
    );

  return topicMatch||hashtagMatch;
}

function ensureCrossPagePocketStyles(){
  if(document.getElementById("pocketChooserStyles"))return;

  const style=document.createElement("style");
  style.id="pocketChooserStyles";
  style.textContent=`
    .am-pocket-chooser{
      position:fixed;z-index:10000;width:min(290px,calc(100vw - 24px));
      padding:10px;border:1px solid rgba(255,195,132,.35);border-radius:14px;
      background:linear-gradient(145deg,#182a53,#101e40);
      box-shadow:0 18px 42px rgba(0,0,0,.42);
      color:#f8f8f2;font-family:'Outfit',sans-serif
    }
    .am-pocket-chooser[hidden]{display:none!important}
    .am-pocket-head{display:flex;align-items:center;justify-content:space-between;padding:3px 3px 8px}
    .am-pocket-head strong{font-size:11px;letter-spacing:.08em;color:#ffc384}
    .am-pocket-close{width:25px;height:25px;border:0;border-radius:50%;background:rgba(255,255,255,.05);color:#aeb7cb;cursor:pointer}
    .am-pocket-list{
      display:grid;gap:5px;max-height:min(360px,55vh);
      overflow-y:auto;overflow-x:hidden;padding-right:4px;
      scrollbar-gutter:stable
    }
    .am-pocket-list::-webkit-scrollbar{width:6px}
    .am-pocket-list::-webkit-scrollbar-track{background:transparent}
    .am-pocket-list::-webkit-scrollbar-thumb{background:rgba(255,195,132,.28);border-radius:999px}
    .am-pocket-list::-webkit-scrollbar-thumb:hover{background:rgba(255,195,132,.48)}
    .am-pocket-show-all{
      width:100%;margin-top:7px;padding:7px 8px;border:0;
      background:transparent;color:#9aa7c2;
      font:700 9px 'Outfit',sans-serif;text-align:left;cursor:pointer
    }
    .am-pocket-show-all:hover{color:#ffc384}
    .am-pocket-show-all[hidden]{display:none!important}
    .am-pocket-choice{
      width:100%;min-height:42px;padding:7px 8px;
      display:grid;grid-template-columns:28px 1fr 18px;
      align-items:center;gap:8px;
      border:1px solid rgba(255,255,255,.08);border-radius:10px;
      background:rgba(255,255,255,.025);color:#eef2fb;
      text-align:left;cursor:pointer
    }
    .am-pocket-choice:hover{
      border-color:rgba(255,195,132,.38);
      background:rgba(255,195,132,.06)
    }
    .am-pocket-choice.selected{
      border-color:#ffc384;
      background:rgba(255,195,132,.10);
      color:#ffc384
    }
    .am-pocket-icon{
      width:28px;height:28px;display:grid;place-items:center;
      border-radius:50%;background:#26365f
    }
    .am-pocket-check{
      width:18px;height:18px;display:grid;place-items:center;
      border:1px solid rgba(255,255,255,.18);border-radius:50%;
      font-size:10px;color:transparent
    }
    .am-pocket-choice.selected .am-pocket-check{
      background:#ffc384;border-color:#ffc384;color:#101a3a
    }
    .am-pocket-note{
      min-height:15px;padding:6px 3px 0;
      color:#8f9dbd;font-size:9px
    }
    .feed .post .pocket-action.pocketed,
    .profile-feed .post .pocket-action.pocketed,
    .community-post-column .post .pocket-action.pocketed{
      border-color:#ffc384!important;
      background:rgba(255,195,132,.11)!important;
      color:#ffc384!important
    }
  `;

  document.head.appendChild(style);
}

function crossPagePocketChooser(){
  let panel=
    document.getElementById("amPocketChooser");

  if(panel)return panel;

  panel=document.createElement("div");
  panel.id="amPocketChooser";
  panel.className="am-pocket-chooser";
  panel.hidden=true;

  panel.innerHTML=`
    <div class="am-pocket-head">
      <strong>ADD TO POCKET</strong>
      <button
        class="am-pocket-close"
        type="button"
        aria-label="Close"
      >×</button>
    </div>

    <div class="am-pocket-list"></div>

    <button
      class="am-pocket-show-all"
      type="button"
      hidden
    >Show all Pockets</button>

    <div class="am-pocket-note"></div>
  `;

  document.body.appendChild(panel);

  panel.querySelector(".am-pocket-close")
    ?.addEventListener(
      "click",
      ()=>{panel.hidden=true;}
    );

  panel.addEventListener("click",event=>{
    const choice=
      event.target.closest(".am-pocket-choice");

    if(!choice)return;

    const post=panel._post;
    if(!post)return;

    const name=choice.dataset.name||"";

    if(crossPagePocketIsIn(name,post)){
      crossPagePocketRemove(name,post);

      choice.classList.remove("selected");

      const check=
        choice.querySelector(".am-pocket-check");

      if(check)check.textContent="";

      panel.querySelector(
        ".am-pocket-note"
      ).textContent=
        `Removed from ${name}.`;
    }else{
      crossPagePocketAdd(name,post);

      choice.classList.add("selected");

      const check=
        choice.querySelector(".am-pocket-check");

      if(check)check.textContent="✓";

      panel.querySelector(
        ".am-pocket-note"
      ).textContent=
        `Added to ${name}.`;
    }

    syncCrossPagePocketButtons();


/* =========================================================
   AUD-015 — DISCOVER REGULAR POST PEACH PREVIEW OUTLINE
   Discover-only final authority rule. Card layout and crop sizing
   stay untouched; this restores the approved peach frame/glow.
========================================================= */

function ensureDiscoverRegularPostPreviewOutline(){
  if(!document.querySelector(".discover-wall.feed"))return;
  if(document.getElementById("aud015DiscoverRegularPostOutline"))return;

  const style=document.createElement("style");
  style.id="aud015DiscoverRegularPostOutline";
  style.textContent=`
    .discover-wall.feed .post.regular-post > .post-image{
      border:1px solid rgba(255,195,132,.38)!important;
      border-radius:14px!important;
      box-shadow:
        0 0 0 1px rgba(255,195,132,.10),
        0 0 24px rgba(255,195,132,.17),
        0 10px 22px -17px rgba(0,0,0,.72),
        inset 0 0 18px rgba(255,195,132,.025)!important;
    }
  `;

  document.head.appendChild(style);
}

ensureDiscoverRegularPostPreviewOutline();


/* =========================================================
   AUD-016 — COMMUNITY PAGE HOTBAR STATE PERSISTENCE
   community.html has an older built-in hotbar. This adapter makes
   it consume the same shared Community state + pin order used by
   Home / Discover / Profile instead of snapping back to defaults.
========================================================= */

const COMMUNITY_PAGE_STATE_KEY="allMediaCommunityStateV1";
const COMMUNITY_PAGE_PIN_ORDER_KEY="allMediaCommunityPinOrderV1";

const COMMUNITY_PAGE_DEFAULT_STATE={
  "spooky-cozy":{
    name:"Spooky Cozy",
    icon:"🎃",
    joined:true,
    pinned:true,
    notifications:true,
    role:"owner"
  },
  "artists":{
    name:"Artists",
    icon:"🎨",
    joined:true,
    pinned:true,
    notifications:true,
    role:"moderator"
  },
  "turtle-rescue":{
    name:"Turtle Rescue",
    icon:"🐢",
    joined:true,
    pinned:true,
    notifications:true,
    role:"member"
  },
  "book-club":{
    name:"Book Club",
    icon:"📚",
    joined:true,
    pinned:false,
    notifications:true,
    role:"member"
  },
  "crochet-corner":{
    name:"Crochet Corner",
    icon:"🧶",
    joined:true,
    pinned:false,
    notifications:true,
    role:"member"
  },
  "garden-and-nature":{
    name:"Garden & Nature",
    icon:"🌿",
    joined:true,
    pinned:false,
    notifications:true,
    role:"member"
  }
};

function communityPageClone(value){
  return JSON.parse(JSON.stringify(value));
}

function communityPageReadState(){
  const state=communityPageClone(
    COMMUNITY_PAGE_DEFAULT_STATE
  );

  try{
    const saved=JSON.parse(
      localStorage.getItem(
        COMMUNITY_PAGE_STATE_KEY
      )||"{}"
    );

    Object.entries(saved).forEach(
      ([slug,value])=>{
        state[slug]={
          ...(state[slug]||{}),
          ...(value||{})
        };
      }
    );
  }catch(error){}

  Object.values(state).forEach(item=>{
    if(item.pinned){
      item.joined=true;
      item.notifications=true;
    }

    if(!item.joined){
      item.pinned=false;
    }
  });

  return state;
}

function communityPageWriteState(state){
  try{
    localStorage.setItem(
      COMMUNITY_PAGE_STATE_KEY,
      JSON.stringify(state)
    );
  }catch(error){}
}

function communityPageReadPinOrder(state){
  let stored=[];

  try{
    const value=JSON.parse(
      localStorage.getItem(
        COMMUNITY_PAGE_PIN_ORDER_KEY
      )||"[]"
    );

    if(Array.isArray(value)){
      stored=value;
    }
  }catch(error){}

  const pinned=Object.entries(state)
    .filter(
      ([,item])=>
        item?.joined &&
        item?.pinned &&
        !item?.deleted
    )
    .map(([slug])=>slug);

  const normalized=stored.filter(
    slug=>pinned.includes(slug)
  );

  pinned.forEach(slug=>{
    if(!normalized.includes(slug)){
      normalized.push(slug);
    }
  });

  return normalized;
}

function communityPageWritePinOrder(order){
  try{
    localStorage.setItem(
      COMMUNITY_PAGE_PIN_ORDER_KEY,
      JSON.stringify(order)
    );
  }catch(error){}
}

function communityPageSlugForName(name,state){
  const normalized=String(name||"")
    .trim()
    .toLowerCase();

  const match=Object.entries(state)
    .find(
      ([,item])=>
        String(item?.name||"")
          .trim()
          .toLowerCase()===normalized
    );

  if(match)return match[0];

  return normalized
    .replace(/&/g,"and")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"");
}

function communityPageUrl(slug){
  return slug==="spooky-cozy"
    ?"community.html"
    :`community.html?community=${encodeURIComponent(slug)}`;
}

function communityPageExistingBellMarkup(name){
  const bar=
    document.getElementById(
      "masterPinnedCommunities"
    );

  if(!bar)return "";

  const existing=[
    ...bar.querySelectorAll(".community-chip")
  ].find(
    chip=>
      String(chip.dataset.community||"")
        .trim()
        .toLowerCase()===
      String(name||"")
        .trim()
        .toLowerCase()
  );

  return existing
    ?.querySelector(".activity-bell")
    ?.outerHTML||"";
}

function communityPageDefaultBellMarkup(){
  return `
    <span
      class="activity-bell"
      title="No new community activities"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
        <path d="M10 21h4"></path>
      </svg>
      <span
        class="activity-count"
        style="display:none"
      >0</span>
    </span>
  `;
}

function communityPageMoreRowForSlug(slug,state){
  const dropdown=
    document.getElementById("communityDropdown");

  if(!dropdown)return null;

  return [...dropdown.querySelectorAll(
    ".community-more-row"
  )].find(row=>{
    const rowName=row.dataset.community||"";
    return communityPageSlugForName(
      rowName,
      state
    )===slug;
  });
}

function communityPageEnsureMoreRows(state){
  const dropdown=
    document.getElementById("communityDropdown");

  if(!dropdown)return;

  Object.entries(state)
    .filter(
      ([,item])=>
        item?.joined &&
        !item?.deleted
    )
    .sort(
      (a,b)=>
        String(a[1]?.name||"")
          .localeCompare(
            String(b[1]?.name||"")
          )
    )
    .forEach(([slug,item])=>{
      let row=
        communityPageMoreRowForSlug(
          slug,
          state
        );

      if(!row){
        row=document.createElement("div");
        row.className="community-more-row";
        row.dataset.community=
          item.name||slug;
        row.dataset.icon=
          item.icon||"◉";
        row.setAttribute("role","link");
        row.tabIndex=0;

        row.innerHTML=`
          <span class="community-more-name">
            <span class="community-icon"></span>
            <span class="community-more-text"></span>
          </span>
          <button
            class="community-pin"
            type="button"
          >
            <span class="pin-state">Pin</span>
            <span class="pin-action">Pin</span>
          </button>
        `;

        dropdown.appendChild(row);
      }

      row.dataset.community=
        item.name||slug;
      row.dataset.icon=
        item.icon||"◉";
      row.dataset.communitySlug=slug;

      const icon=
        row.querySelector(
          ".community-icon"
        );

      if(icon){
        icon.textContent=
          item.icon||"◉";
      }

      const text=
        row.querySelector(
          ".community-more-text"
        );

      if(text){
        text.textContent=
          item.name||slug;
      }else{
        const nameWrap=
          row.querySelector(
            ".community-more-name"
          );

        if(nameWrap){
          nameWrap.innerHTML=
            '<span class="community-icon"></span>'+
            '<span class="community-more-text"></span>';

          nameWrap.querySelector(
            ".community-icon"
          ).textContent=
            item.icon||"◉";

          nameWrap.querySelector(
            ".community-more-text"
          ).textContent=
            item.name||slug;
        }
      }

      const pin=
        row.querySelector(
          ".community-pin"
        );

      if(pin){
        pin.classList.toggle(
          "pinned",
          !!item.pinned
        );

        const stateLabel=
          pin.querySelector(
            ".pin-state"
          );

        const actionLabel=
          pin.querySelector(
            ".pin-action"
          );

        if(stateLabel){
          stateLabel.textContent=
            item.pinned
              ?"Pinned"
              :"Pin";
        }

        if(actionLabel){
          actionLabel.textContent=
            item.pinned
              ?"Unpin"
              :"Pin";
        }
      }
    });

  [...dropdown.querySelectorAll(
    ".community-more-row"
  )].forEach(row=>{
    const slug=
      row.dataset.communitySlug||
      communityPageSlugForName(
        row.dataset.community,
        state
      );

    const item=state[slug];

    if(
      !item ||
      !item.joined ||
      item.deleted
    ){
      row.remove();
    }
  });
}

let communityPageDraggedChip=null;

function communityPageWireChip(chip){
  if(
    !chip ||
    chip.dataset.aud016Wired==="true"
  ){
    return;
  }

  chip.dataset.aud016Wired="true";
  chip.draggable=true;

  chip.addEventListener(
    "dragstart",
    event=>{
      if(
        event.target.closest(
          ".activity-bell"
        )
      ){
        event.preventDefault();
        return;
      }

      communityPageDraggedChip=chip;
      chip.classList.add("dragging");
    }
  );

  chip.addEventListener(
    "dragend",
    ()=>{
      chip.classList.remove("dragging");

      const bar=
        document.getElementById(
          "masterPinnedCommunities"
        );

      if(bar){
        const order=[
          ...bar.querySelectorAll(
            ".community-chip"
          )
        ].map(
          item=>
            item.dataset.communitySlug
        ).filter(Boolean);

        communityPageWritePinOrder(
          order
        );
      }

      communityPageDraggedChip=null;
    }
  );
}

function syncCommunityPageHotbar(){
  const bar=
    document.getElementById(
      "masterPinnedCommunities"
    );

  const dropdown=
    document.getElementById(
      "communityDropdown"
    );

  if(!bar || !dropdown)return;

  const state=
    communityPageReadState();

  /*
    Capture the current bells before rebuilding so the Community
    page keeps its existing visible activity counts.
  */
  const bellByName=new Map();

  bar.querySelectorAll(
    ".community-chip"
  ).forEach(chip=>{
    const name=
      chip.dataset.community||
      chip.querySelector(
        ".community-chip-name"
      )?.textContent||
      chip.textContent;

    const bell=
      chip.querySelector(
        ".activity-bell"
      )?.outerHTML;

    if(name && bell){
      bellByName.set(
        String(name).trim().toLowerCase(),
        bell
      );
    }
  });

  communityPageEnsureMoreRows(state);

  const order=
    communityPageReadPinOrder(
      state
    );

  bar.innerHTML="";

  order.forEach(slug=>{
    const item=state[slug];

    if(
      !item ||
      !item.joined ||
      !item.pinned ||
      item.deleted
    ){
      return;
    }

    const chip=
      document.createElement("button");

    chip.type="button";
    chip.className="community-chip";
    chip.dataset.community=
      item.name||slug;
    chip.dataset.communitySlug=slug;
    chip.dataset.icon=
      item.icon||"◉";

    const bell=
      bellByName.get(
        String(item.name||slug)
          .trim()
          .toLowerCase()
      )||
      communityPageDefaultBellMarkup();

    chip.innerHTML=`
      <span class="community-icon"></span>
      <span class="community-chip-name"></span>
      ${bell}
    `;

    chip.querySelector(
      ".community-icon"
    ).textContent=
      item.icon||"◉";

    chip.querySelector(
      ".community-chip-name"
    ).textContent=
      item.name||slug;

    communityPageWireChip(chip);
    bar.appendChild(chip);
  });
}

function communityPageSetPinned(
  slug,
  pinned
){
  const state=
    communityPageReadState();

  if(!state[slug])return;

  /*
    Keep the Community page's own internal state synchronized too.
    updateCommunityState is defined by community.html itself.
  */
  if(
    typeof window.updateCommunityState===
    "function"
  ){
    window.updateCommunityState(
      slug,
      {
        pinned,
        joined:pinned
          ?true
          :state[slug].joined,
        notifications:pinned
          ?true
          :state[slug].notifications
      }
    );
  }else{
    state[slug]={
      ...state[slug],
      pinned,
      joined:pinned
        ?true
        :state[slug].joined,
      notifications:pinned
        ?true
        :state[slug].notifications
    };

    communityPageWriteState(
      state
    );
  }

  const latest=
    communityPageReadState();

  const order=
    communityPageReadPinOrder(
      latest
    );

  if(
    pinned &&
    !order.includes(slug)
  ){
    order.push(slug);
  }

  if(!pinned){
    const index=
      order.indexOf(slug);

    if(index>=0){
      order.splice(index,1);
    }
  }

  communityPageWritePinOrder(order);

  if(
    typeof window.syncSpookyCommunityUI===
    "function"
  ){
    try{
      window.syncSpookyCommunityUI();
    }catch(error){}
  }

  syncCommunityPageHotbar();


/* =========================================================
   AUD-017 — PROFILE REGULAR POST PEACH PREVIEW OUTLINE
   Profile-only final authority rule. This restores the approved
   peach edge/glow without changing card layout or uploaded-media
   crop framing.
========================================================= */

function ensureProfileRegularPostPreviewOutline(){
  if(!document.querySelector(".profile-feed"))return;
  if(document.getElementById("aud017ProfileRegularPostOutline"))return;

  const style=document.createElement("style");
  style.id="aud017ProfileRegularPostOutline";
  style.textContent=`
    .profile-feed .post.regular-post > .post-image:not(.has-upload){
      border:1px solid rgba(255,195,132,.38)!important;
      border-radius:14px!important;
      box-shadow:
        0 0 0 1px rgba(255,195,132,.10),
        0 0 24px rgba(255,195,132,.17),
        0 10px 22px -17px rgba(0,0,0,.72),
        inset 0 0 18px rgba(255,195,132,.025)!important;
    }
  `;

  document.head.appendChild(style);
}

ensureProfileRegularPostPreviewOutline();


}

/*
  Own Community-page hotbar interactions before the old inline
  handlers run. This prevents the legacy DOM-only Pin/Unpin code
  from diverging from shared state.
*/
document.addEventListener(
  "click",
  event=>{
    const bar=
      document.getElementById(
        "masterPinnedCommunities"
      );

    const dropdown=
      document.getElementById(
        "communityDropdown"
      );

    if(!bar || !dropdown)return;

    const pin=
      event.target.closest(
        "#communityDropdown .community-pin"
      );

    if(pin){
      const row=
        pin.closest(
          ".community-more-row"
        );

      if(!row)return;

      const state=
        communityPageReadState();

      const slug=
        row.dataset.communitySlug||
        communityPageSlugForName(
          row.dataset.community,
          state
        );

      if(!state[slug])return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      communityPageSetPinned(
        slug,
        !state[slug].pinned
      );

      dropdown.classList.add(
        "active"
      );

      dropdown.style.display="block";
      return;
    }

    const chip=
      event.target.closest(
        "#masterPinnedCommunities .community-chip"
      );

    if(chip){
      if(
        event.target.closest(
          ".activity-bell"
        )
      ){
        return;
      }

      const slug=
        chip.dataset.communitySlug;

      if(!slug)return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      window.location.href=
        communityPageUrl(slug);
    }
  },
  true
);

document.addEventListener(
  "keydown",
  event=>{
    const row=
      event.target.closest?.(
        "#communityDropdown .community-more-row"
      );

    if(
      !row ||
      event.target.closest(
        ".community-pin"
      ) ||
      !(
        event.key==="Enter" ||
        event.key===" "
      )
    ){
      return;
    }

    const state=
      communityPageReadState();

    const slug=
      row.dataset.communitySlug||
      communityPageSlugForName(
        row.dataset.community,
        state
      );

    if(!state[slug])return;

    event.preventDefault();

    window.location.href=
      communityPageUrl(slug);
  }
);

const communityPageHotbar=
  document.getElementById(
    "masterPinnedCommunities"
  );

communityPageHotbar?.addEventListener(
  "dragover",
  event=>{
    event.preventDefault();

    const after=[
      ...communityPageHotbar.querySelectorAll(
        ".community-chip:not(.dragging)"
      )
    ].find(
      item=>
        event.clientX<=
        item.getBoundingClientRect().left+
        item.offsetWidth/2
    );

    if(communityPageDraggedChip){
      after
        ?communityPageHotbar.insertBefore(
            communityPageDraggedChip,
            after
          )
        :communityPageHotbar.appendChild(
            communityPageDraggedChip
          );
    }
  }
);

communityPageHotbar?.addEventListener(
  "wheel",
  event=>{
    if(
      Math.abs(event.deltaY)>
      Math.abs(event.deltaX)
    ){
      event.preventDefault();
      communityPageHotbar.scrollLeft+=
        event.deltaY;
    }
  },
  {passive:false}
);

syncCommunityPageHotbar();

document.addEventListener(
  "allmedia:community-state-change",
  syncCommunityPageHotbar
);

document.addEventListener(
  "allmedia:community-state-refresh",
  syncCommunityPageHotbar
);

window.addEventListener(
  "storage",
  event=>{
    if(
      event.key===
        COMMUNITY_PAGE_STATE_KEY ||
      event.key===
        COMMUNITY_PAGE_PIN_ORDER_KEY
    ){
      syncCommunityPageHotbar();
    }
  }
);




  });

  return panel;
}

function syncCrossPagePocketButtons(){
  /*
    Home has its own canonical integration and owns this behavior there.
  */
  if(document.querySelector(".pockets-panel"))return;

  document.querySelectorAll(".post").forEach(post=>{
    const id=crossPagePocketPostId(post);

    post.querySelectorAll(
      ".pocket-action"
    ).forEach(button=>{
      const active=
        crossPagePocketIsSavedAnywhere(id);

      button.classList.toggle(
        "pocketed",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });
  });
}

function positionCrossPagePocketChooser(panel,button){
  panel.hidden=false;

  const rect=button.getBoundingClientRect();
  const width=panel.offsetWidth||290;
  const height=panel.offsetHeight||250;
  const pad=10;

  const left=Math.min(
    window.innerWidth-width-pad,
    Math.max(pad,rect.left)
  );

  let top=rect.bottom+7;

  if(top+height>window.innerHeight-pad){
    top=Math.max(
      pad,
      rect.top-height-7
    );
  }

  panel.style.left=`${left}px`;
  panel.style.top=`${top}px`;
}

function openCrossPagePocketChooser(button){
  if(document.querySelector(".pockets-panel"))return;

  ensureCrossPagePocketStyles();

  const post=button.closest(".post");
  if(!post)return;

  const panel=crossPagePocketChooser();
  const list=
    panel.querySelector(".am-pocket-list");
  const showAll=
    panel.querySelector(".am-pocket-show-all");
  const note=
    panel.querySelector(".am-pocket-note");

  const pockets=crossPageOwnedPockets();

  panel._post=post;
  note.textContent="";

  function renderChoices(items){
    list.innerHTML=items.map(pocket=>{
      const selected=
        crossPagePocketIsIn(
          pocket.name,
          post
        );

      const safeName=
        String(pocket.name)
          .replace(/&/g,"&amp;")
          .replace(/</g,"&lt;")
          .replace(/>/g,"&gt;")
          .replace(/"/g,"&quot;");

      return `
        <button
          class="am-pocket-choice${selected?" selected":""}"
          type="button"
          data-name="${safeName}"
        >
          <span class="am-pocket-icon">${pocket.emoji||"▱"}</span>
          <span>${safeName}</span>
          <span class="am-pocket-check">${selected?"✓":""}</span>
        </button>
      `;
    }).join("");
  }

  if(!pockets.length){
    list.innerHTML=
      '<div style="padding:12px 8px;color:#8995af;font-size:10px;text-align:center">You do not have any Pockets yet.</div>';

    showAll.hidden=true;
  }else{
    const matches=pockets.filter(
      pocket=>
        crossPagePocketMatchesPost(
          pocket,
          post
        )
    );

    if(
      matches.length &&
      matches.length<pockets.length
    ){
      renderChoices(matches);

      showAll.hidden=false;
      showAll.textContent=
        `Show all Pockets (${pockets.length})`;

      showAll.onclick=()=>{
        renderChoices(pockets);
        showAll.hidden=true;
      };
    }else{
      renderChoices(
        matches.length?matches:pockets
      );

      showAll.hidden=true;
    }
  }

  positionCrossPagePocketChooser(
    panel,
    button
  );
}

function closeCrossPagePocketChooser(){
  if(document.querySelector(".pockets-panel"))return;

  const panel=
    document.getElementById("amPocketChooser");

  if(panel)panel.hidden=true;
}

/*
  Capture phase replaces Discover/Profile prototype-only Pocket clicks.
  Home is excluded because pocket-integration.js remains canonical there.
*/
document.addEventListener("click",event=>{
  if(document.querySelector(".pockets-panel"))return;

  const button=event.target.closest?.(
    ".post .pocket-action"
  );

  if(button){
    const post=button.closest(".post");
    if(!post)return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    openCrossPagePocketChooser(button);
    return;
  }

  const panel=
    document.getElementById("amPocketChooser");

  if(
    panel &&
    !panel.hidden &&
    !event.target.closest("#amPocketChooser")
  ){
    closeCrossPagePocketChooser();
  }
},true);

/*
  Keep current Home parity for AUD-014.
  AUD-022 will separately change scroll-close behavior everywhere.
*/
window.addEventListener(
  "resize",
  closeCrossPagePocketChooser
);

window.addEventListener(
  "scroll",
  closeCrossPagePocketChooser,
  true
);

syncCrossPagePocketButtons();


/* =========================================================
   AUD-015 — DISCOVER REGULAR POST PEACH PREVIEW OUTLINE
   Discover-only final authority rule. Card layout and crop sizing
   stay untouched; this restores the approved peach frame/glow.
========================================================= */

function ensureDiscoverRegularPostPreviewOutline(){
  if(!document.querySelector(".discover-wall.feed"))return;
  if(document.getElementById("aud015DiscoverRegularPostOutline"))return;

  const style=document.createElement("style");
  style.id="aud015DiscoverRegularPostOutline";
  style.textContent=`
    .discover-wall.feed .post.regular-post > .post-image{
      border:1px solid rgba(255,195,132,.38)!important;
      border-radius:14px!important;
      box-shadow:
        0 0 0 1px rgba(255,195,132,.10),
        0 0 24px rgba(255,195,132,.17),
        0 10px 22px -17px rgba(0,0,0,.72),
        inset 0 0 18px rgba(255,195,132,.025)!important;
    }
  `;

  document.head.appendChild(style);
}

ensureDiscoverRegularPostPreviewOutline();


/* =========================================================
   AUD-016 — COMMUNITY PAGE HOTBAR STATE PERSISTENCE
   community.html has an older built-in hotbar. This adapter makes
   it consume the same shared Community state + pin order used by
   Home / Discover / Profile instead of snapping back to defaults.
========================================================= */

const COMMUNITY_PAGE_STATE_KEY="allMediaCommunityStateV1";
const COMMUNITY_PAGE_PIN_ORDER_KEY="allMediaCommunityPinOrderV1";

const COMMUNITY_PAGE_DEFAULT_STATE={
  "spooky-cozy":{
    name:"Spooky Cozy",
    icon:"🎃",
    joined:true,
    pinned:true,
    notifications:true,
    role:"owner"
  },
  "artists":{
    name:"Artists",
    icon:"🎨",
    joined:true,
    pinned:true,
    notifications:true,
    role:"moderator"
  },
  "turtle-rescue":{
    name:"Turtle Rescue",
    icon:"🐢",
    joined:true,
    pinned:true,
    notifications:true,
    role:"member"
  },
  "book-club":{
    name:"Book Club",
    icon:"📚",
    joined:true,
    pinned:false,
    notifications:true,
    role:"member"
  },
  "crochet-corner":{
    name:"Crochet Corner",
    icon:"🧶",
    joined:true,
    pinned:false,
    notifications:true,
    role:"member"
  },
  "garden-and-nature":{
    name:"Garden & Nature",
    icon:"🌿",
    joined:true,
    pinned:false,
    notifications:true,
    role:"member"
  }
};

function communityPageClone(value){
  return JSON.parse(JSON.stringify(value));
}

function communityPageReadState(){
  const state=communityPageClone(
    COMMUNITY_PAGE_DEFAULT_STATE
  );

  try{
    const saved=JSON.parse(
      localStorage.getItem(
        COMMUNITY_PAGE_STATE_KEY
      )||"{}"
    );

    Object.entries(saved).forEach(
      ([slug,value])=>{
        state[slug]={
          ...(state[slug]||{}),
          ...(value||{})
        };
      }
    );
  }catch(error){}

  Object.values(state).forEach(item=>{
    if(item.pinned){
      item.joined=true;
      item.notifications=true;
    }

    if(!item.joined){
      item.pinned=false;
    }
  });

  return state;
}

function communityPageWriteState(state){
  try{
    localStorage.setItem(
      COMMUNITY_PAGE_STATE_KEY,
      JSON.stringify(state)
    );
  }catch(error){}
}

function communityPageReadPinOrder(state){
  let stored=[];

  try{
    const value=JSON.parse(
      localStorage.getItem(
        COMMUNITY_PAGE_PIN_ORDER_KEY
      )||"[]"
    );

    if(Array.isArray(value)){
      stored=value;
    }
  }catch(error){}

  const pinned=Object.entries(state)
    .filter(
      ([,item])=>
        item?.joined &&
        item?.pinned &&
        !item?.deleted
    )
    .map(([slug])=>slug);

  const normalized=stored.filter(
    slug=>pinned.includes(slug)
  );

  pinned.forEach(slug=>{
    if(!normalized.includes(slug)){
      normalized.push(slug);
    }
  });

  return normalized;
}

function communityPageWritePinOrder(order){
  try{
    localStorage.setItem(
      COMMUNITY_PAGE_PIN_ORDER_KEY,
      JSON.stringify(order)
    );
  }catch(error){}
}

function communityPageSlugForName(name,state){
  const normalized=String(name||"")
    .trim()
    .toLowerCase();

  const match=Object.entries(state)
    .find(
      ([,item])=>
        String(item?.name||"")
          .trim()
          .toLowerCase()===normalized
    );

  if(match)return match[0];

  return normalized
    .replace(/&/g,"and")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"");
}

function communityPageUrl(slug){
  return slug==="spooky-cozy"
    ?"community.html"
    :`community.html?community=${encodeURIComponent(slug)}`;
}

function communityPageExistingBellMarkup(name){
  const bar=
    document.getElementById(
      "masterPinnedCommunities"
    );

  if(!bar)return "";

  const existing=[
    ...bar.querySelectorAll(".community-chip")
  ].find(
    chip=>
      String(chip.dataset.community||"")
        .trim()
        .toLowerCase()===
      String(name||"")
        .trim()
        .toLowerCase()
  );

  return existing
    ?.querySelector(".activity-bell")
    ?.outerHTML||"";
}

function communityPageDefaultBellMarkup(){
  return `
    <span
      class="activity-bell"
      title="No new community activities"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
        <path d="M10 21h4"></path>
      </svg>
      <span
        class="activity-count"
        style="display:none"
      >0</span>
    </span>
  `;
}

function communityPageMoreRowForSlug(slug,state){
  const dropdown=
    document.getElementById("communityDropdown");

  if(!dropdown)return null;

  return [...dropdown.querySelectorAll(
    ".community-more-row"
  )].find(row=>{
    const rowName=row.dataset.community||"";
    return communityPageSlugForName(
      rowName,
      state
    )===slug;
  });
}

function communityPageEnsureMoreRows(state){
  const dropdown=
    document.getElementById("communityDropdown");

  if(!dropdown)return;

  Object.entries(state)
    .filter(
      ([,item])=>
        item?.joined &&
        !item?.deleted
    )
    .sort(
      (a,b)=>
        String(a[1]?.name||"")
          .localeCompare(
            String(b[1]?.name||"")
          )
    )
    .forEach(([slug,item])=>{
      let row=
        communityPageMoreRowForSlug(
          slug,
          state
        );

      if(!row){
        row=document.createElement("div");
        row.className="community-more-row";
        row.dataset.community=
          item.name||slug;
        row.dataset.icon=
          item.icon||"◉";
        row.setAttribute("role","link");
        row.tabIndex=0;

        row.innerHTML=`
          <span class="community-more-name">
            <span class="community-icon"></span>
            <span class="community-more-text"></span>
          </span>
          <button
            class="community-pin"
            type="button"
          >
            <span class="pin-state">Pin</span>
            <span class="pin-action">Pin</span>
          </button>
        `;

        dropdown.appendChild(row);
      }

      row.dataset.community=
        item.name||slug;
      row.dataset.icon=
        item.icon||"◉";
      row.dataset.communitySlug=slug;

      const icon=
        row.querySelector(
          ".community-icon"
        );

      if(icon){
        icon.textContent=
          item.icon||"◉";
      }

      const text=
        row.querySelector(
          ".community-more-text"
        );

      if(text){
        text.textContent=
          item.name||slug;
      }else{
        const nameWrap=
          row.querySelector(
            ".community-more-name"
          );

        if(nameWrap){
          nameWrap.innerHTML=
            '<span class="community-icon"></span>'+
            '<span class="community-more-text"></span>';

          nameWrap.querySelector(
            ".community-icon"
          ).textContent=
            item.icon||"◉";

          nameWrap.querySelector(
            ".community-more-text"
          ).textContent=
            item.name||slug;
        }
      }

      const pin=
        row.querySelector(
          ".community-pin"
        );

      if(pin){
        pin.classList.toggle(
          "pinned",
          !!item.pinned
        );

        const stateLabel=
          pin.querySelector(
            ".pin-state"
          );

        const actionLabel=
          pin.querySelector(
            ".pin-action"
          );

        if(stateLabel){
          stateLabel.textContent=
            item.pinned
              ?"Pinned"
              :"Pin";
        }

        if(actionLabel){
          actionLabel.textContent=
            item.pinned
              ?"Unpin"
              :"Pin";
        }
      }
    });

  [...dropdown.querySelectorAll(
    ".community-more-row"
  )].forEach(row=>{
    const slug=
      row.dataset.communitySlug||
      communityPageSlugForName(
        row.dataset.community,
        state
      );

    const item=state[slug];

    if(
      !item ||
      !item.joined ||
      item.deleted
    ){
      row.remove();
    }
  });
}

let communityPageDraggedChip=null;

function communityPageWireChip(chip){
  if(
    !chip ||
    chip.dataset.aud016Wired==="true"
  ){
    return;
  }

  chip.dataset.aud016Wired="true";
  chip.draggable=true;

  chip.addEventListener(
    "dragstart",
    event=>{
      if(
        event.target.closest(
          ".activity-bell"
        )
      ){
        event.preventDefault();
        return;
      }

      communityPageDraggedChip=chip;
      chip.classList.add("dragging");
    }
  );

  chip.addEventListener(
    "dragend",
    ()=>{
      chip.classList.remove("dragging");

      const bar=
        document.getElementById(
          "masterPinnedCommunities"
        );

      if(bar){
        const order=[
          ...bar.querySelectorAll(
            ".community-chip"
          )
        ].map(
          item=>
            item.dataset.communitySlug
        ).filter(Boolean);

        communityPageWritePinOrder(
          order
        );
      }

      communityPageDraggedChip=null;
    }
  );
}

function syncCommunityPageHotbar(){
  const bar=
    document.getElementById(
      "masterPinnedCommunities"
    );

  const dropdown=
    document.getElementById(
      "communityDropdown"
    );

  if(!bar || !dropdown)return;

  const state=
    communityPageReadState();

  /*
    Capture the current bells before rebuilding so the Community
    page keeps its existing visible activity counts.
  */
  const bellByName=new Map();

  bar.querySelectorAll(
    ".community-chip"
  ).forEach(chip=>{
    const name=
      chip.dataset.community||
      chip.querySelector(
        ".community-chip-name"
      )?.textContent||
      chip.textContent;

    const bell=
      chip.querySelector(
        ".activity-bell"
      )?.outerHTML;

    if(name && bell){
      bellByName.set(
        String(name).trim().toLowerCase(),
        bell
      );
    }
  });

  communityPageEnsureMoreRows(state);

  const order=
    communityPageReadPinOrder(
      state
    );

  bar.innerHTML="";

  order.forEach(slug=>{
    const item=state[slug];

    if(
      !item ||
      !item.joined ||
      !item.pinned ||
      item.deleted
    ){
      return;
    }

    const chip=
      document.createElement("button");

    chip.type="button";
    chip.className="community-chip";
    chip.dataset.community=
      item.name||slug;
    chip.dataset.communitySlug=slug;
    chip.dataset.icon=
      item.icon||"◉";

    const bell=
      bellByName.get(
        String(item.name||slug)
          .trim()
          .toLowerCase()
      )||
      communityPageDefaultBellMarkup();

    chip.innerHTML=`
      <span class="community-icon"></span>
      <span class="community-chip-name"></span>
      ${bell}
    `;

    chip.querySelector(
      ".community-icon"
    ).textContent=
      item.icon||"◉";

    chip.querySelector(
      ".community-chip-name"
    ).textContent=
      item.name||slug;

    communityPageWireChip(chip);
    bar.appendChild(chip);
  });
}

function communityPageSetPinned(
  slug,
  pinned
){
  const state=
    communityPageReadState();

  if(!state[slug])return;

  /*
    Keep the Community page's own internal state synchronized too.
    updateCommunityState is defined by community.html itself.
  */
  if(
    typeof window.updateCommunityState===
    "function"
  ){
    window.updateCommunityState(
      slug,
      {
        pinned,
        joined:pinned
          ?true
          :state[slug].joined,
        notifications:pinned
          ?true
          :state[slug].notifications
      }
    );
  }else{
    state[slug]={
      ...state[slug],
      pinned,
      joined:pinned
        ?true
        :state[slug].joined,
      notifications:pinned
        ?true
        :state[slug].notifications
    };

    communityPageWriteState(
      state
    );
  }

  const latest=
    communityPageReadState();

  const order=
    communityPageReadPinOrder(
      latest
    );

  if(
    pinned &&
    !order.includes(slug)
  ){
    order.push(slug);
  }

  if(!pinned){
    const index=
      order.indexOf(slug);

    if(index>=0){
      order.splice(index,1);
    }
  }

  communityPageWritePinOrder(order);

  if(
    typeof window.syncSpookyCommunityUI===
    "function"
  ){
    try{
      window.syncSpookyCommunityUI();
    }catch(error){}
  }

  syncCommunityPageHotbar();
}

/*
  Own Community-page hotbar interactions before the old inline
  handlers run. This prevents the legacy DOM-only Pin/Unpin code
  from diverging from shared state.
*/
document.addEventListener(
  "click",
  event=>{
    const bar=
      document.getElementById(
        "masterPinnedCommunities"
      );

    const dropdown=
      document.getElementById(
        "communityDropdown"
      );

    if(!bar || !dropdown)return;

    const pin=
      event.target.closest(
        "#communityDropdown .community-pin"
      );

    if(pin){
      const row=
        pin.closest(
          ".community-more-row"
        );

      if(!row)return;

      const state=
        communityPageReadState();

      const slug=
        row.dataset.communitySlug||
        communityPageSlugForName(
          row.dataset.community,
          state
        );

      if(!state[slug])return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      communityPageSetPinned(
        slug,
        !state[slug].pinned
      );

      dropdown.classList.add(
        "active"
      );

      dropdown.style.display="block";
      return;
    }

    const chip=
      event.target.closest(
        "#masterPinnedCommunities .community-chip"
      );

    if(chip){
      if(
        event.target.closest(
          ".activity-bell"
        )
      ){
        return;
      }

      const slug=
        chip.dataset.communitySlug;

      if(!slug)return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      window.location.href=
        communityPageUrl(slug);
    }
  },
  true
);

document.addEventListener(
  "keydown",
  event=>{
    const row=
      event.target.closest?.(
        "#communityDropdown .community-more-row"
      );

    if(
      !row ||
      event.target.closest(
        ".community-pin"
      ) ||
      !(
        event.key==="Enter" ||
        event.key===" "
      )
    ){
      return;
    }

    const state=
      communityPageReadState();

    const slug=
      row.dataset.communitySlug||
      communityPageSlugForName(
        row.dataset.community,
        state
      );

    if(!state[slug])return;

    event.preventDefault();

    window.location.href=
      communityPageUrl(slug);
  }
);

const communityPageHotbar=
  document.getElementById(
    "masterPinnedCommunities"
  );

communityPageHotbar?.addEventListener(
  "dragover",
  event=>{
    event.preventDefault();

    const after=[
      ...communityPageHotbar.querySelectorAll(
        ".community-chip:not(.dragging)"
      )
    ].find(
      item=>
        event.clientX<=
        item.getBoundingClientRect().left+
        item.offsetWidth/2
    );

    if(communityPageDraggedChip){
      after
        ?communityPageHotbar.insertBefore(
            communityPageDraggedChip,
            after
          )
        :communityPageHotbar.appendChild(
            communityPageDraggedChip
          );
    }
  }
);

communityPageHotbar?.addEventListener(
  "wheel",
  event=>{
    if(
      Math.abs(event.deltaY)>
      Math.abs(event.deltaX)
    ){
      event.preventDefault();
      communityPageHotbar.scrollLeft+=
        event.deltaY;
    }
  },
  {passive:false}
);

syncCommunityPageHotbar();

document.addEventListener(
  "allmedia:community-state-change",
  syncCommunityPageHotbar
);

document.addEventListener(
  "allmedia:community-state-refresh",
  syncCommunityPageHotbar
);

window.addEventListener(
  "storage",
  event=>{
    if(
      event.key===
        COMMUNITY_PAGE_STATE_KEY ||
      event.key===
        COMMUNITY_PAGE_PIN_ORDER_KEY
    ){
      syncCommunityPageHotbar();
    }
  }
);





window.addEventListener("storage",event=>{
  if(
    event.key===CROSS_PAGE_POCKET_SAVED_KEY ||
    event.key===CROSS_PAGE_POCKET_REGISTRY_KEY ||
    event.key===CROSS_PAGE_POCKET_CREATED_KEY
  ){
    syncCrossPagePocketButtons();


/* =========================================================
   AUD-015 — DISCOVER REGULAR POST PEACH PREVIEW OUTLINE
   Discover-only final authority rule. Card layout and crop sizing
   stay untouched; this restores the approved peach frame/glow.
========================================================= */

function ensureDiscoverRegularPostPreviewOutline(){
  if(!document.querySelector(".discover-wall.feed"))return;
  if(document.getElementById("aud015DiscoverRegularPostOutline"))return;

  const style=document.createElement("style");
  style.id="aud015DiscoverRegularPostOutline";
  style.textContent=`
    .discover-wall.feed .post.regular-post > .post-image{
      border:1px solid rgba(255,195,132,.38)!important;
      border-radius:14px!important;
      box-shadow:
        0 0 0 1px rgba(255,195,132,.10),
        0 0 24px rgba(255,195,132,.17),
        0 10px 22px -17px rgba(0,0,0,.72),
        inset 0 0 18px rgba(255,195,132,.025)!important;
    }
  `;

  document.head.appendChild(style);
}

ensureDiscoverRegularPostPreviewOutline();


/* =========================================================
   AUD-016 — COMMUNITY PAGE HOTBAR STATE PERSISTENCE
   community.html has an older built-in hotbar. This adapter makes
   it consume the same shared Community state + pin order used by
   Home / Discover / Profile instead of snapping back to defaults.
========================================================= */

const COMMUNITY_PAGE_STATE_KEY="allMediaCommunityStateV1";
const COMMUNITY_PAGE_PIN_ORDER_KEY="allMediaCommunityPinOrderV1";

const COMMUNITY_PAGE_DEFAULT_STATE={
  "spooky-cozy":{
    name:"Spooky Cozy",
    icon:"🎃",
    joined:true,
    pinned:true,
    notifications:true,
    role:"owner"
  },
  "artists":{
    name:"Artists",
    icon:"🎨",
    joined:true,
    pinned:true,
    notifications:true,
    role:"moderator"
  },
  "turtle-rescue":{
    name:"Turtle Rescue",
    icon:"🐢",
    joined:true,
    pinned:true,
    notifications:true,
    role:"member"
  },
  "book-club":{
    name:"Book Club",
    icon:"📚",
    joined:true,
    pinned:false,
    notifications:true,
    role:"member"
  },
  "crochet-corner":{
    name:"Crochet Corner",
    icon:"🧶",
    joined:true,
    pinned:false,
    notifications:true,
    role:"member"
  },
  "garden-and-nature":{
    name:"Garden & Nature",
    icon:"🌿",
    joined:true,
    pinned:false,
    notifications:true,
    role:"member"
  }
};

function communityPageClone(value){
  return JSON.parse(JSON.stringify(value));
}

function communityPageReadState(){
  const state=communityPageClone(
    COMMUNITY_PAGE_DEFAULT_STATE
  );

  try{
    const saved=JSON.parse(
      localStorage.getItem(
        COMMUNITY_PAGE_STATE_KEY
      )||"{}"
    );

    Object.entries(saved).forEach(
      ([slug,value])=>{
        state[slug]={
          ...(state[slug]||{}),
          ...(value||{})
        };
      }
    );
  }catch(error){}

  Object.values(state).forEach(item=>{
    if(item.pinned){
      item.joined=true;
      item.notifications=true;
    }

    if(!item.joined){
      item.pinned=false;
    }
  });

  return state;
}

function communityPageWriteState(state){
  try{
    localStorage.setItem(
      COMMUNITY_PAGE_STATE_KEY,
      JSON.stringify(state)
    );
  }catch(error){}
}

function communityPageReadPinOrder(state){
  let stored=[];

  try{
    const value=JSON.parse(
      localStorage.getItem(
        COMMUNITY_PAGE_PIN_ORDER_KEY
      )||"[]"
    );

    if(Array.isArray(value)){
      stored=value;
    }
  }catch(error){}

  const pinned=Object.entries(state)
    .filter(
      ([,item])=>
        item?.joined &&
        item?.pinned &&
        !item?.deleted
    )
    .map(([slug])=>slug);

  const normalized=stored.filter(
    slug=>pinned.includes(slug)
  );

  pinned.forEach(slug=>{
    if(!normalized.includes(slug)){
      normalized.push(slug);
    }
  });

  return normalized;
}

function communityPageWritePinOrder(order){
  try{
    localStorage.setItem(
      COMMUNITY_PAGE_PIN_ORDER_KEY,
      JSON.stringify(order)
    );
  }catch(error){}
}

function communityPageSlugForName(name,state){
  const normalized=String(name||"")
    .trim()
    .toLowerCase();

  const match=Object.entries(state)
    .find(
      ([,item])=>
        String(item?.name||"")
          .trim()
          .toLowerCase()===normalized
    );

  if(match)return match[0];

  return normalized
    .replace(/&/g,"and")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"");
}

function communityPageUrl(slug){
  return slug==="spooky-cozy"
    ?"community.html"
    :`community.html?community=${encodeURIComponent(slug)}`;
}

function communityPageExistingBellMarkup(name){
  const bar=
    document.getElementById(
      "masterPinnedCommunities"
    );

  if(!bar)return "";

  const existing=[
    ...bar.querySelectorAll(".community-chip")
  ].find(
    chip=>
      String(chip.dataset.community||"")
        .trim()
        .toLowerCase()===
      String(name||"")
        .trim()
        .toLowerCase()
  );

  return existing
    ?.querySelector(".activity-bell")
    ?.outerHTML||"";
}

function communityPageDefaultBellMarkup(){
  return `
    <span
      class="activity-bell"
      title="No new community activities"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
        <path d="M10 21h4"></path>
      </svg>
      <span
        class="activity-count"
        style="display:none"
      >0</span>
    </span>
  `;
}

function communityPageMoreRowForSlug(slug,state){
  const dropdown=
    document.getElementById("communityDropdown");

  if(!dropdown)return null;

  return [...dropdown.querySelectorAll(
    ".community-more-row"
  )].find(row=>{
    const rowName=row.dataset.community||"";
    return communityPageSlugForName(
      rowName,
      state
    )===slug;
  });
}

function communityPageEnsureMoreRows(state){
  const dropdown=
    document.getElementById("communityDropdown");

  if(!dropdown)return;

  Object.entries(state)
    .filter(
      ([,item])=>
        item?.joined &&
        !item?.deleted
    )
    .sort(
      (a,b)=>
        String(a[1]?.name||"")
          .localeCompare(
            String(b[1]?.name||"")
          )
    )
    .forEach(([slug,item])=>{
      let row=
        communityPageMoreRowForSlug(
          slug,
          state
        );

      if(!row){
        row=document.createElement("div");
        row.className="community-more-row";
        row.dataset.community=
          item.name||slug;
        row.dataset.icon=
          item.icon||"◉";
        row.setAttribute("role","link");
        row.tabIndex=0;

        row.innerHTML=`
          <span class="community-more-name">
            <span class="community-icon"></span>
            <span class="community-more-text"></span>
          </span>
          <button
            class="community-pin"
            type="button"
          >
            <span class="pin-state">Pin</span>
            <span class="pin-action">Pin</span>
          </button>
        `;

        dropdown.appendChild(row);
      }

      row.dataset.community=
        item.name||slug;
      row.dataset.icon=
        item.icon||"◉";
      row.dataset.communitySlug=slug;

      const icon=
        row.querySelector(
          ".community-icon"
        );

      if(icon){
        icon.textContent=
          item.icon||"◉";
      }

      const text=
        row.querySelector(
          ".community-more-text"
        );

      if(text){
        text.textContent=
          item.name||slug;
      }else{
        const nameWrap=
          row.querySelector(
            ".community-more-name"
          );

        if(nameWrap){
          nameWrap.innerHTML=
            '<span class="community-icon"></span>'+
            '<span class="community-more-text"></span>';

          nameWrap.querySelector(
            ".community-icon"
          ).textContent=
            item.icon||"◉";

          nameWrap.querySelector(
            ".community-more-text"
          ).textContent=
            item.name||slug;
        }
      }

      const pin=
        row.querySelector(
          ".community-pin"
        );

      if(pin){
        pin.classList.toggle(
          "pinned",
          !!item.pinned
        );

        const stateLabel=
          pin.querySelector(
            ".pin-state"
          );

        const actionLabel=
          pin.querySelector(
            ".pin-action"
          );

        if(stateLabel){
          stateLabel.textContent=
            item.pinned
              ?"Pinned"
              :"Pin";
        }

        if(actionLabel){
          actionLabel.textContent=
            item.pinned
              ?"Unpin"
              :"Pin";
        }
      }
    });

  [...dropdown.querySelectorAll(
    ".community-more-row"
  )].forEach(row=>{
    const slug=
      row.dataset.communitySlug||
      communityPageSlugForName(
        row.dataset.community,
        state
      );

    const item=state[slug];

    if(
      !item ||
      !item.joined ||
      item.deleted
    ){
      row.remove();
    }
  });
}

let communityPageDraggedChip=null;

function communityPageWireChip(chip){
  if(
    !chip ||
    chip.dataset.aud016Wired==="true"
  ){
    return;
  }

  chip.dataset.aud016Wired="true";
  chip.draggable=true;

  chip.addEventListener(
    "dragstart",
    event=>{
      if(
        event.target.closest(
          ".activity-bell"
        )
      ){
        event.preventDefault();
        return;
      }

      communityPageDraggedChip=chip;
      chip.classList.add("dragging");
    }
  );

  chip.addEventListener(
    "dragend",
    ()=>{
      chip.classList.remove("dragging");

      const bar=
        document.getElementById(
          "masterPinnedCommunities"
        );

      if(bar){
        const order=[
          ...bar.querySelectorAll(
            ".community-chip"
          )
        ].map(
          item=>
            item.dataset.communitySlug
        ).filter(Boolean);

        communityPageWritePinOrder(
          order
        );
      }

      communityPageDraggedChip=null;
    }
  );
}

function syncCommunityPageHotbar(){
  const bar=
    document.getElementById(
      "masterPinnedCommunities"
    );

  const dropdown=
    document.getElementById(
      "communityDropdown"
    );

  if(!bar || !dropdown)return;

  const state=
    communityPageReadState();

  /*
    Capture the current bells before rebuilding so the Community
    page keeps its existing visible activity counts.
  */
  const bellByName=new Map();

  bar.querySelectorAll(
    ".community-chip"
  ).forEach(chip=>{
    const name=
      chip.dataset.community||
      chip.querySelector(
        ".community-chip-name"
      )?.textContent||
      chip.textContent;

    const bell=
      chip.querySelector(
        ".activity-bell"
      )?.outerHTML;

    if(name && bell){
      bellByName.set(
        String(name).trim().toLowerCase(),
        bell
      );
    }
  });

  communityPageEnsureMoreRows(state);

  const order=
    communityPageReadPinOrder(
      state
    );

  bar.innerHTML="";

  order.forEach(slug=>{
    const item=state[slug];

    if(
      !item ||
      !item.joined ||
      !item.pinned ||
      item.deleted
    ){
      return;
    }

    const chip=
      document.createElement("button");

    chip.type="button";
    chip.className="community-chip";
    chip.dataset.community=
      item.name||slug;
    chip.dataset.communitySlug=slug;
    chip.dataset.icon=
      item.icon||"◉";

    const bell=
      bellByName.get(
        String(item.name||slug)
          .trim()
          .toLowerCase()
      )||
      communityPageDefaultBellMarkup();

    chip.innerHTML=`
      <span class="community-icon"></span>
      <span class="community-chip-name"></span>
      ${bell}
    `;

    chip.querySelector(
      ".community-icon"
    ).textContent=
      item.icon||"◉";

    chip.querySelector(
      ".community-chip-name"
    ).textContent=
      item.name||slug;

    communityPageWireChip(chip);
    bar.appendChild(chip);
  });
}

function communityPageSetPinned(
  slug,
  pinned
){
  const state=
    communityPageReadState();

  if(!state[slug])return;

  /*
    Keep the Community page's own internal state synchronized too.
    updateCommunityState is defined by community.html itself.
  */
  if(
    typeof window.updateCommunityState===
    "function"
  ){
    window.updateCommunityState(
      slug,
      {
        pinned,
        joined:pinned
          ?true
          :state[slug].joined,
        notifications:pinned
          ?true
          :state[slug].notifications
      }
    );
  }else{
    state[slug]={
      ...state[slug],
      pinned,
      joined:pinned
        ?true
        :state[slug].joined,
      notifications:pinned
        ?true
        :state[slug].notifications
    };

    communityPageWriteState(
      state
    );
  }

  const latest=
    communityPageReadState();

  const order=
    communityPageReadPinOrder(
      latest
    );

  if(
    pinned &&
    !order.includes(slug)
  ){
    order.push(slug);
  }

  if(!pinned){
    const index=
      order.indexOf(slug);

    if(index>=0){
      order.splice(index,1);
    }
  }

  communityPageWritePinOrder(order);

  if(
    typeof window.syncSpookyCommunityUI===
    "function"
  ){
    try{
      window.syncSpookyCommunityUI();
    }catch(error){}
  }

  syncCommunityPageHotbar();
}

/*
  Own Community-page hotbar interactions before the old inline
  handlers run. This prevents the legacy DOM-only Pin/Unpin code
  from diverging from shared state.
*/
document.addEventListener(
  "click",
  event=>{
    const bar=
      document.getElementById(
        "masterPinnedCommunities"
      );

    const dropdown=
      document.getElementById(
        "communityDropdown"
      );

    if(!bar || !dropdown)return;

    const pin=
      event.target.closest(
        "#communityDropdown .community-pin"
      );

    if(pin){
      const row=
        pin.closest(
          ".community-more-row"
        );

      if(!row)return;

      const state=
        communityPageReadState();

      const slug=
        row.dataset.communitySlug||
        communityPageSlugForName(
          row.dataset.community,
          state
        );

      if(!state[slug])return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      communityPageSetPinned(
        slug,
        !state[slug].pinned
      );

      dropdown.classList.add(
        "active"
      );

      dropdown.style.display="block";
      return;
    }

    const chip=
      event.target.closest(
        "#masterPinnedCommunities .community-chip"
      );

    if(chip){
      if(
        event.target.closest(
          ".activity-bell"
        )
      ){
        return;
      }

      const slug=
        chip.dataset.communitySlug;

      if(!slug)return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      window.location.href=
        communityPageUrl(slug);
    }
  },
  true
);

document.addEventListener(
  "keydown",
  event=>{
    const row=
      event.target.closest?.(
        "#communityDropdown .community-more-row"
      );

    if(
      !row ||
      event.target.closest(
        ".community-pin"
      ) ||
      !(
        event.key==="Enter" ||
        event.key===" "
      )
    ){
      return;
    }

    const state=
      communityPageReadState();

    const slug=
      row.dataset.communitySlug||
      communityPageSlugForName(
        row.dataset.community,
        state
      );

    if(!state[slug])return;

    event.preventDefault();

    window.location.href=
      communityPageUrl(slug);
  }
);

const communityPageHotbar=
  document.getElementById(
    "masterPinnedCommunities"
  );

communityPageHotbar?.addEventListener(
  "dragover",
  event=>{
    event.preventDefault();

    const after=[
      ...communityPageHotbar.querySelectorAll(
        ".community-chip:not(.dragging)"
      )
    ].find(
      item=>
        event.clientX<=
        item.getBoundingClientRect().left+
        item.offsetWidth/2
    );

    if(communityPageDraggedChip){
      after
        ?communityPageHotbar.insertBefore(
            communityPageDraggedChip,
            after
          )
        :communityPageHotbar.appendChild(
            communityPageDraggedChip
          );
    }
  }
);

communityPageHotbar?.addEventListener(
  "wheel",
  event=>{
    if(
      Math.abs(event.deltaY)>
      Math.abs(event.deltaX)
    ){
      event.preventDefault();
      communityPageHotbar.scrollLeft+=
        event.deltaY;
    }
  },
  {passive:false}
);

syncCommunityPageHotbar();

document.addEventListener(
  "allmedia:community-state-change",
  syncCommunityPageHotbar
);

document.addEventListener(
  "allmedia:community-state-refresh",
  syncCommunityPageHotbar
);

window.addEventListener(
  "storage",
  event=>{
    if(
      event.key===
        COMMUNITY_PAGE_STATE_KEY ||
      event.key===
        COMMUNITY_PAGE_PIN_ORDER_KEY
    ){
      syncCommunityPageHotbar();
    }
  }
);




  }
});



window.addEventListener("storage",event=>{
  if(event.key!==PROFILE_SAVED_POSTS_KEY)return;
  renderProfileSavedPosts();
  syncSavedButtons();
});




/* =========================================================
   AUD-012 — WORKING SHARE ACTION
   Uses the browser/device share sheet when available.
   Otherwise copies useful post context + the current page link.
   Individual permanent post URLs do not exist yet.
========================================================= */

const shareFeedbackTimers=new WeakMap();

function postShareCopy(post){
  const author=
    post?.querySelector(".username")?.textContent?.trim()||
    "All Media";

  const title=
    post?.querySelector(".blog-title,.video-title")?.textContent?.trim()||
    "";

  const body=
    post?.querySelector(
      ".caption,.blog-excerpt,.video-description,.byte-caption"
    )?.textContent?.trim()||
    "";

  const mainText=[title,body]
    .filter(Boolean)
    .join(" — ")
    .replace(/\s+/g," ")
    .trim();

  const clipped=
    mainText.length>240
      ?mainText.slice(0,237).trimEnd()+"…"
      :mainText;

  return [author,clipped]
    .filter(Boolean)
    .join(": ");
}

function postShareTitle(post){
  const author=
    post?.querySelector(".username")?.textContent?.trim();

  const title=
    post?.querySelector(".blog-title,.video-title")?.textContent?.trim();

  if(title)return `${title} | All Media`;
  if(author)return `${author} on All Media`;
  return "All Media";
}

function flashShareButton(button,label){
  if(!button)return;

  const previousTimer=shareFeedbackTimers.get(button);
  if(previousTimer)clearTimeout(previousTimer);

  if(!button.dataset.shareOriginalText){
    button.dataset.shareOriginalText=button.textContent;
  }

  button.textContent=label;

  const timer=setTimeout(()=>{
    button.textContent=
      button.dataset.shareOriginalText||
      "↗ Share";
    shareFeedbackTimers.delete(button);
  },1400);

  shareFeedbackTimers.set(button,timer);
}

async function copyShareFallback(text){
  if(navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(text);
    return true;
  }

  const area=document.createElement("textarea");
  area.value=text;
  area.setAttribute("readonly","");
  area.style.position="fixed";
  area.style.opacity="0";
  area.style.pointerEvents="none";
  document.body.appendChild(area);
  area.select();

  let copied=false;
  try{
    copied=document.execCommand("copy");
  }catch(error){}

  area.remove();
  return copied;
}

async function sharePostFromCard(button,post){
  const pageUrl=window.location.href;
  const text=postShareCopy(post);
  const title=postShareTitle(post);

  if(typeof navigator.share==="function"){
    try{
      await navigator.share({
        title,
        text,
        url:pageUrl
      });
      flashShareButton(button,"✓ Shared");
      return;
    }catch(error){
      if(error?.name==="AbortError")return;
      // Fall through to clipboard if the device share sheet fails.
    }
  }

  try{
    const clipboardText=
      [text,pageUrl]
        .filter(Boolean)
        .join("\n");

    const copied=await copyShareFallback(clipboardText);

    flashShareButton(
      button,
      copied?"✓ Copied":"Share unavailable"
    );
  }catch(error){
    flashShareButton(button,"Share unavailable");
  }
}

/*
  Capture phase owns Share before older page-local prototype handlers.
  This keeps Home, Discover, Profile, Community, and Reblog copies
  consistent without changing any card markup.
*/
document.addEventListener("click",event=>{
  const button=event.target.closest?.(
    ".post .share-action"
  );

  if(!button)return;

  const post=button.closest(".post");
  if(!post)return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  sharePostFromCard(button,post);
},true);



window.addEventListener("storage",event=>{
  if(event.key!==PROFILE_REBLOGS_KEY)return;
  renderProfileReblogs();
  syncReblogButtons();
});


renderSharedCommunityPosts();
decorate();

window.addEventListener("storage",event=>{
  if(event.key===COMMUNITY_SHARED_POSTS_KEY){
    renderSharedCommunityPosts();
    decorate();
  }
});

new MutationObserver(records=>{
  records.forEach(record=>{
    record.addedNodes.forEach(node=>{
      if(!(node instanceof Element))return;

      if(
        node.matches?.(
          ".post .post-header .profile-picture, .post .post-header .username"
        )
      ){
        decorateAuthorTarget(node);
      }

      decorate(node);
    });
  });
}).observe(document.body,{
  childList:true,
  subtree:true
});
})();

/* =========================================================
   AUD-017 CORRECTION — PROFILE PREVIEW OUTLINE EXECUTION
   The original AUD-017 block landed inside Community-only logic.
   This end-of-file adapter guarantees the Profile rule runs on load.
========================================================= */
(() => {
  const hasProfileFeed =
    document.querySelector(
      "#postsPanel.profile-feed, #otherPostsPanel.profile-feed"
    );

  if(!hasProfileFeed)return;

  let style =
    document.getElementById(
      "aud017ProfileRegularPostOutline"
    );

  if(style){
    style.remove();
  }

  style=document.createElement("style");
  style.id="aud017ProfileRegularPostOutline";
  style.textContent=`
    #postsPanel.profile-feed .feed > .post.regular-post > .post-image:not(.has-upload),
    #otherPostsPanel.profile-feed .feed > .post.regular-post > .post-image:not(.has-upload){
      border:1px solid rgba(255,195,132,.38)!important;
      border-radius:14px!important;
      box-shadow:
        0 0 0 1px rgba(255,195,132,.10),
        0 0 24px rgba(255,195,132,.17),
        0 10px 22px -17px rgba(0,0,0,.72),
        inset 0 0 18px rgba(255,195,132,.025)!important;
    }
  `;

  document.head.appendChild(style);
})();

