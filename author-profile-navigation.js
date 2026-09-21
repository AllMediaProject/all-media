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
