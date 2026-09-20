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
