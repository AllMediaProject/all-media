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

decorate();

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
