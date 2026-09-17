let currentProfileTab = "posts";
function showPrototypeView(id, btn){
  document.querySelectorAll(".profile-view").forEach(v=>v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".prototype-switcher button[data-view]").forEach(b=>b.classList.remove("active"));
  if(btn)btn.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}
function setProfileTab(tab, btn){
  currentProfileTab=tab;
  document.querySelectorAll(".profile-tab").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("postsPanel").style.display = tab==="posts" ? "block" : "none";
  document.getElementById("reblogsPanel").style.display = tab==="reblogs" ? "block" : "none";
  document.getElementById("savedPanel").style.display = tab==="saved" ? "block" : "none";
}

function toggleSupport(btn){
  const active=btn.getAttribute("aria-pressed")==="true";
  btn.setAttribute("aria-pressed",active?"false":"true");
  btn.textContent=active?"♥ Support":"✓ Supporting";
  btn.classList.toggle("supporting",!active);
}

function setVisitorTab(tab, btn){
  document.querySelectorAll("#otherProfile .profile-tab").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("otherPostsPanel").style.display = tab==="posts" ? "block" : "none";
  document.getElementById("otherReblogsPanel").style.display = tab==="reblogs" ? "block" : "none";
}
function showAboutSlide(i, root){
  const gallery=root.closest(".about-gallery") || root;
  const slides=[...gallery.querySelectorAll(".about-slide")];
  const dots=[...gallery.querySelectorAll(".about-dot")];
  if(!slides.length)return;

  const next=((i%slides.length)+slides.length)%slides.length;
  slides.forEach((slide,n)=>slide.classList.toggle("active",n===next));
  dots.forEach((dot,n)=>dot.classList.toggle("active",n===next));
  gallery.dataset.activeIndex=String(next);
}

function stepAboutGallery(root,delta){
  const gallery=root.closest(".about-gallery") || root;
  const slides=[...gallery.querySelectorAll(".about-slide")];
  if(slides.length<2)return;
  const current=slides.findIndex(slide=>slide.classList.contains("active"));
  showAboutSlide((current<0?0:current)+delta,gallery);
}

let aboutGallerySwipe=null;

function beginAboutGallerySwipe(event){
  if(event.target.closest(".about-gallery-arrow,.about-dot"))return;
  const gallery=event.currentTarget;
  aboutGallerySwipe={
    gallery,
    pointerId:event.pointerId,
    startX:event.clientX,
    lastX:event.clientX,
    moved:false
  };
  gallery.classList.add("is-dragging");
  gallery.setPointerCapture?.(event.pointerId);
}

document.addEventListener("pointermove",event=>{
  if(!aboutGallerySwipe || event.pointerId!==aboutGallerySwipe.pointerId)return;
  aboutGallerySwipe.lastX=event.clientX;
  if(Math.abs(event.clientX-aboutGallerySwipe.startX)>8)aboutGallerySwipe.moved=true;
});

document.addEventListener("pointerup",event=>{
  if(!aboutGallerySwipe || event.pointerId!==aboutGallerySwipe.pointerId)return;
  const {gallery,startX,lastX,moved}=aboutGallerySwipe;
  gallery.classList.remove("is-dragging");
  const dx=lastX-startX;
  if(moved && Math.abs(dx)>=38)stepAboutGallery(gallery,dx<0?1:-1);
  aboutGallerySwipe=null;
});

document.addEventListener("pointercancel",()=>{
  if(aboutGallerySwipe?.gallery)aboutGallerySwipe.gallery.classList.remove("is-dragging");
  aboutGallerySwipe=null;
});
function toggleAboutText(btn){
  const text=btn.previousElementSibling;
  const visitor=btn.closest("#otherProfile");
  const long=visitor
    ?"Photographer for 8 years, mostly self-taught. I shoot film because I love the delay — not knowing if I got it until weeks later. I am currently working on a small zine about abandoned greenhouses and teach beginner film workshops every spring."
    :"A little bit artist, a little bit gamer, fully committed to cozy chaos. I make spooky-cute art and crochet, collect too many Halloween things, and like making little corners of the internet feel welcoming. Currently obsessed with moss, vintage Halloween, and half-finished sketchbooks.";
  const short=visitor
    ?"Photographer for 8 years, mostly self-taught. I shoot film because I love the delay…"
    :"A little bit artist, a little bit gamer, fully committed to cozy chaos…";
  const open=btn.dataset.open==="true";
  btn.dataset.open=open?"false":"true";
  text.textContent=open?short:long;
  btn.textContent=open?"Read more":"Show less";
}
function toggleMoreLinks(btn){
  const section=btn.closest(".around-web-section");
  const more=section?.querySelector(".more-links");
  if(!more)return;

  const open=!more.classList.contains("open");
  more.classList.toggle("open",open);
  btn.setAttribute("aria-expanded",open?"true":"false");

  const parts=btn.querySelectorAll("span");
  const count=more.querySelectorAll(".web-link-card").length;
  if(parts[0])parts[0].textContent=open?"Show less":`See ${count} more`;
  if(parts[1])parts[1].textContent=open?"▴":"▾";
}
function setSideTab(name,btn){
  const card=btn.closest(".about-card");
  card.querySelectorAll(".side-tab").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  card.querySelectorAll(".side-panel").forEach(p=>p.classList.remove("active"));
  card.querySelector('[data-side-panel="'+name+'"]').classList.add("active");
}
function setSettingsTab(name,btn){
  document.querySelectorAll(".settings-nav button").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll("[data-settings-panel]").forEach(p=>p.hidden=true);
  if(btn)btn.classList.add("active");
  const panel=document.querySelector('[data-settings-panel="'+name+'"]');
  if(panel)panel.hidden=false;
}
function openProfileSettings(){
  showPrototypeView("settingsView",document.querySelector('[data-view="settingsView"]'));
  setSettingsTab("profile",document.querySelector('[data-settings-tab="profile"]'));
}
function previewProfileAvatar(input){
  const file=input.files && input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const preview=document.getElementById("settingsAvatarPreview");
    preview.style.backgroundImage='url("'+e.target.result+'")';
    preview.textContent="";
    preview.dataset.image=e.target.result;
  };
  reader.readAsDataURL(file);
}
function saveProfileInfo(){
  const name=document.getElementById("profileDisplayName").value.trim();
  const rawUser=document.getElementById("profileUsername").value.trim().replace(/^@+/,"");
  const bio=document.getElementById("profileShortBio").value.trim();
  const username=rawUser || "username";

  const display=document.querySelector("#myProfile .profile-display-name");
  const handle=document.querySelector("#myProfile .profile-handle-large");
  const bioEl=document.querySelector("#myProfile .profile-bio");
  if(display)display.textContent=name || username;
  if(handle)handle.textContent="@"+username;
  if(bioEl)bioEl.textContent=bio;

  document.querySelectorAll("#myProfile article.post .username").forEach(el=>el.textContent="@"+username);
  document.querySelectorAll("#myProfile .reply-author").forEach(el=>{
    if(el.textContent.trim()==="@SugarCrumbCo")el.textContent="@"+username;
  });

  const preview=document.getElementById("settingsAvatarPreview");
  if(preview && preview.dataset.image){
    const image=preview.dataset.image;
    const avatar=document.querySelector("#myProfile .profile-avatar");
    if(avatar){
      avatar.style.backgroundImage='url("'+image+'")';
      avatar.style.backgroundSize="cover";
      avatar.style.backgroundPosition="center";
      avatar.textContent="";
    }
    document.querySelectorAll("#myProfile article.post .profile-picture, #myProfile .comment-profile-picture").forEach(el=>{
      el.style.backgroundImage='url("'+image+'")';
      el.style.backgroundSize="cover";
      el.style.backgroundPosition="center";
    });
  }

  const status=document.getElementById("profileSaveStatus");
  status.classList.add("show");
  setTimeout(()=>status.classList.remove("show"),1800);
}
function cancelProfileEdits(){
  const display=document.querySelector("#myProfile .profile-display-name");
  const handle=document.querySelector("#myProfile .profile-handle-large");
  const bio=document.querySelector("#myProfile .profile-bio");
  document.getElementById("profileDisplayName").value=display?display.textContent:"";
  document.getElementById("profileUsername").value=handle?handle.textContent.replace(/^@/,""):"";
  document.getElementById("profileShortBio").value=bio?bio.textContent:"";
  showPrototypeView("myProfile",document.querySelector('[data-view="myProfile"]'));
}
function legacyToggleFakeToggle1(btn){
  if(btn.disabled)return;
  btn.classList.toggle("on");
  btn.setAttribute("aria-pressed",btn.classList.contains("on")?"true":"false");

  if(btn.dataset.setting==="about"){
    syncAboutDependentSettings();
  }

  applyProfileVisibility();
}

function syncAboutDependentSettings(){
  const aboutToggle=document.querySelector('.fake-toggle[data-setting="about"]');
  if(!aboutToggle)return;

  const aboutEnabled=aboutToggle.classList.contains("on");
  const note=document.getElementById("aboutDependentNote");
  const dependentNames=["people","pockets","communities"];

  dependentNames.forEach(name=>{
    const toggle=document.querySelector('.fake-toggle[data-setting="'+name+'"]');
    if(!toggle)return;

    const row=toggle.closest(".about-dependent-setting");

    if(!aboutEnabled){
      toggle.classList.remove("on");
      toggle.setAttribute("aria-pressed","false");
      toggle.disabled=true;
      row?.classList.add("locked");
    }else{
      toggle.disabled=false;
      row?.classList.remove("locked");
    }
  });

  note?.classList.toggle("show",!aboutEnabled);
}
function legacyApplyProfileVisibility1(){
  const states={};
  document.querySelectorAll(".fake-toggle[data-setting]").forEach(btn=>{
    states[btn.dataset.setting]=btn.classList.contains("on");
  });

  const about=document.querySelector("#myProfile .about-card");
  const grid=document.querySelector("#myProfile .profile-grid");
  const shell=document.querySelector("#myProfile .profile-shell");
  const panelOff=states.about===false;

  if(about)about.style.display=panelOff?"none":"block";
  if(grid)grid.classList.toggle("panel-off",panelOff);
  if(shell)shell.classList.toggle("panel-off-shell",panelOff);

  const following=document.querySelector("#myProfile .private-stat");
  if(following)following.style.display=states["following-private"]===false?"none":"inline-flex";

  if(about){
    ["people","pockets","communities"].forEach(name=>{
      const tab=about.querySelector('.side-tab[onclick*="\''+name+'\'"]');
      const panel=about.querySelector('[data-side-panel="'+name+'"]');
      const visible=states[name]!==false;
      if(tab)tab.style.display=visible?"":"none";
      if(panel && !visible)panel.classList.remove("active");
    });

    const activeVisible=about.querySelector(".side-tab.active:not([style*='display: none'])");
    if(!activeVisible){
      const first=[...about.querySelectorAll(".side-tab")].find(b=>b.style.display!=="none");
      if(first){
        const match=first.getAttribute("onclick").match(/'([^']+)'/);
        if(match)setSideTab(match[1],first);
      }
    }

    const discovery=about.querySelector(".profile-discovery-section");
    if(discovery){
      const any=["people","pockets","communities"].some(name=>states[name]!==false);
      discovery.style.display=any?"":"none";
    }
  }
}

/* Profile-post prototype interactions.
   These are page-local on purpose; we are not loading the Home JS into Profile. */
document.addEventListener("click",function(e){
  if(e.target.closest(".post.regular-post")) return;
  const like=e.target.closest(".like-button");
  if(like){
    const heart=like.querySelector(".like-heart");
    const count=like.querySelector(".like-count");
    const liked=like.classList.toggle("liked");
    if(count)count.textContent=Math.max(0,Number(count.textContent||0)+(liked?1:-1));
    if(heart)heart.textContent=liked?"♥":"♡";
    return;
  }

  const commentLike=e.target.closest(".comment-like");
  if(commentLike){
    const count=commentLike.querySelector("span");
    const liked=commentLike.classList.toggle("liked");
    commentLike.dataset.liked=liked?"true":"false";
    if(count)count.textContent=Math.max(0,Number(count.textContent||0)+(liked?1:-1));
    commentLike.firstChild.nodeValue=liked?"♥ ":"♡ ";
    return;
  }

  const hashtags=e.target.closest(".hashtag-link");
  if(hashtags){
    const post=hashtags.closest(".post");
    const box=post.querySelector(".post-hashtags");
    if(box)box.classList.toggle("active");
    return;
  }

  const hashtagDone=e.target.closest(".post-hashtag-done");
  if(hashtagDone){
    hashtagDone.closest(".post-hashtags").classList.remove("active");
    return;
  }

  const more=e.target.closest(".more-comments");
  if(more){
    const post=more.closest(".post");
    const section=post.querySelector(".comments-section");
    if(section){
      const open=section.classList.toggle("active");
      if(!more.dataset.closedLabel)more.dataset.closedLabel=more.textContent;
      more.textContent=open?"💬 Hide comments":more.dataset.closedLabel;
    }
    return;
  }

  const commentBtn=e.target.closest(".comment-button");
  if(commentBtn){
    const composer=commentBtn.closest(".post").querySelector(".comment-composer");
    if(composer){
      const open=composer.classList.toggle("active");
      commentBtn.classList.toggle("active",open);
      if(open)composer.querySelector("textarea")?.focus();
    }
    return;
  }

  const replyBtn=e.target.closest(".reply-button");
  if(replyBtn){
    const item=replyBtn.closest(".comment-item,.reply-item");
    const composer=item?.querySelector(":scope > .reply-composer");
    if(composer){
      composer.classList.toggle("active");
      if(composer.classList.contains("active"))composer.querySelector("textarea")?.focus();
    }
    return;
  }

  const menuBtn=e.target.closest(".post-menu-button");
  if(menuBtn){
    const menu=menuBtn.parentElement.querySelector(".post-menu-dropdown");
    document.querySelectorAll(".post-menu-dropdown.active").forEach(m=>{if(m!==menu)m.classList.remove("active")});
    menu?.classList.toggle("active");
    return;
  }

  const reblog=e.target.closest(".reblog-counter");
  if(reblog){
    const match=reblog.textContent.match(/(\d+)/);
    const current=match?Number(match[1]):0;
    const active=reblog.classList.toggle("reblogged");
    reblog.innerHTML='<span class="reblog-icon" aria-hidden="true">↻</span> '+Math.max(0,current+(active?1:-1))+' · '+(active?"Reblogged":"Reblog");
    return;
  }

  const share=e.target.closest(".interactions .interaction:not(.reblog-counter)");
  if(share && share.textContent.includes("Share")){
    const old=share.textContent;
    const done=()=>{share.textContent="✓ Copied";setTimeout(()=>share.textContent=old,1300)};
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(location.href).then(done).catch(done);
    else done();
    return;
  }

  const pocket=e.target.closest(".pocket-action");
  if(pocket){
    showPrototypeActionNote(pocket,"Pocket chooser will use your real Pockets.");
    return;
  }

  const community=e.target.closest(".community-action");
  if(community){
    showPrototypeActionNote(community,"Community chooser will use your Communities.");
    return;
  }
});

document.addEventListener("click",function(e){
  if(!e.target.closest(".post-menu")){
    document.querySelectorAll(".post-menu-dropdown.active").forEach(m=>m.classList.remove("active"));
  }
});

document.addEventListener("click",function(e){
  if(e.target.closest(".post.regular-post")) return;
  const postButton=e.target.closest(".comment-post-button");
  if(postButton){
    const composer=postButton.closest(".comment-composer");
    const textarea=composer?.querySelector(".comment-text-area");
    const value=textarea?.value.trim();
    if(!value)return;
    const post=postButton.closest(".post");
    const section=post.querySelector(".comments-section");
    const item=document.createElement("div");
    item.className="comment-item";
    item.innerHTML='<div class="comment-author">@yourusername</div><div class="comment-content"></div><div class="comment-actions"><button class="comment-like" data-liked="false">♡ <span>0</span></button><button class="reply-button">Reply</button></div><div class="reply-composer"><textarea class="reply-input" placeholder="Reply…"></textarea><div class="reply-submit"><button class="reply-post-button">POST</button></div></div>';
    item.querySelector(".comment-content").textContent=value;
    section.prepend(item);
    section.classList.add("active");
    post.querySelector(".latest-comment").innerHTML='<span class="comment-username">@yourusername:</span> '+escapeHTML(value);
    textarea.value="";
    composer.classList.remove("active");
    post.querySelector(".comment-button")?.classList.remove("active");
    return;
  }

  const replyPost=e.target.closest(".reply-post-button");
  if(replyPost){
    const composer=replyPost.closest(".reply-composer");
    const textarea=composer?.querySelector(".reply-input");
    const value=textarea?.value.trim();
    if(!value)return;
    const host=composer.parentElement;
    let list=host.querySelector(":scope > .reply-list");
    if(!list){
      list=document.createElement("div");
      list.className="reply-list";
      host.insertBefore(list,composer);
    }
    const reply=document.createElement("div");
    reply.className="reply-item";
    reply.innerHTML='<div class="reply-author">@yourusername</div><div class="reply-content"></div><div class="comment-actions"><button class="comment-like" data-liked="false">♡ <span>0</span></button><button class="reply-button">Reply</button></div><div class="reply-composer"><textarea class="reply-input" placeholder="Reply…"></textarea><div class="reply-submit"><button class="reply-post-button">POST</button></div></div>';
    reply.querySelector(".reply-content").textContent=value;
    list.appendChild(reply);
    textarea.value="";
    composer.classList.remove("active");
  }
});

function escapeHTML(value){
  const div=document.createElement("div");
  div.textContent=value;
  return div.innerHTML;
}
function showPrototypeActionNote(button,message){
  const post=button.closest(".post");
  post.querySelector(".prototype-action-note")?.remove();
  const note=document.createElement("div");
  note.className="prototype-action-note";
  note.textContent=message;
  note.style.top=(button.offsetTop+button.offsetHeight+8)+"px";
  note.style.left=button.offsetLeft+"px";
  post.appendChild(note);
  button.classList.add("prototype-active");
  setTimeout(()=>{note.remove();button.classList.remove("prototype-active")},1800);
}



/* =========================
   V15 PROFILE SETTINGS
   ========================= */

let avatarDraft={src:"",croppedSrc:"",zoom:1,offsetX:0,offsetY:0};
const galleryDraft=[null,null,null];
let cropState={
  type:null,index:null,src:"",zoom:1,offsetX:0,offsetY:0,
  dragging:false,lastX:0,lastY:0,naturalW:0,naturalH:0
};

const profileLinks=[
  {id:"1",label:"My Art Shop",url:"https://ko-fi.com/sugarcrumbco",icon:"☕",iconMode:"auto"},
  {id:"2",label:"YouTube",url:"https://youtube.com/",icon:"▶",iconMode:"auto"},
  {id:"3",label:"Instagram",url:"https://instagram.com/",icon:"◎",iconMode:"auto"},
  {id:"4",label:"Threads",url:"https://threads.net/",icon:"＠",iconMode:"auto"},
  {id:"5",label:"Pinterest",url:"https://pinterest.com/",icon:"P",iconMode:"auto"},
  {id:"6",label:"Portfolio",url:"https://yourwebsite.com/",icon:"🌐",iconMode:"auto"},
  {id:"7",label:"My Newsletter",url:"https://newsletter.example/",icon:"✉",iconMode:"auto"}
];

const profileLinkIconChoices=["☕","▶","◎","P","𝕏","♪","＠","f","in","👽","🦋","♫","🌐","✉","✦","★","♥","🎨","📷","🛍️","🎮","📚","🧶","🎃"];
function detectProfileLinkIcon(url,label=""){
  const hay=((url||"")+" "+(label||"")).toLowerCase();
  if(hay.includes("ko-fi"))return "☕";
  if(hay.includes("youtube") || hay.includes("youtu.be"))return "▶";
  if(hay.includes("instagram"))return "◎";
  if(hay.includes("pinterest"))return "P";
  if(hay.includes("tiktok"))return "♪";
  if(hay.includes("twitter") || hay.includes("x.com"))return "𝕏";
  if(hay.includes("threads"))return "＠";
  if(hay.includes("facebook"))return "f";
  if(hay.includes("linkedin"))return "in";
  if(hay.includes("reddit"))return "👽";
  if(hay.includes("bluesky") || hay.includes("bsky"))return "🦋";
  if(hay.includes("spotify"))return "♫";
  if(hay.includes("twitch"))return "🎮";
  if(hay.includes("newsletter") || hay.includes("substack"))return "✉";
  if(hay.includes("shop") || hay.includes("store"))return "🛍️";
  return "🌐";
}
let draggedProfileLinkId=null;

const interestCatalog=[
  {name:"Art",emoji:"🎨"},
  {name:"Halloween",emoji:"🎃"},
  {name:"Crochet",emoji:"🧶"},
  {name:"Horror",emoji:"👻"},
  {name:"Cozy",emoji:"✨"},
  {name:"Illustration",emoji:"✏️"},
  {name:"Small Business",emoji:"🛍️"},
  {name:"DIY",emoji:"🛠️"},
  {name:"Gaming",emoji:"🎮"},
  {name:"Nature",emoji:"🌿"},
  {name:"Photography",emoji:"📷"},
  {name:"Film",emoji:"🎞️"},
  {name:"Books",emoji:"📚"},
  {name:"Writing",emoji:"📝"},
  {name:"Music",emoji:"🎵"},
  {name:"Travel",emoji:"✈️"},
  {name:"Food",emoji:"🍜"},
  {name:"Gardening",emoji:"🌱"}
];
const suggestedInterestNames=["Art","Halloween","Crochet","Horror","Cozy","Illustration","Small Business","DIY","Gaming","Nature"];
const selectedInterests=new Set(["Art","Halloween","Crochet","Horror","Cozy"]);

function setSettingsTab(name,btn){
  document.querySelectorAll(".settings-nav button").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll("[data-settings-panel]").forEach(p=>p.hidden=true);
  if(btn)btn.classList.add("active");
  const panel=document.querySelector('[data-settings-panel="'+name+'"]');
  if(panel)panel.hidden=false;
  if(name==="links")renderLinksEditor();

  const status=document.getElementById("settingsSaveStatus");
  if(status)status.classList.remove("show");
}

function openProfileSettingsTab(name){
  showPrototypeView("settingsView",document.querySelector('[data-view="settingsView"]'));
  const btn=document.querySelector('[data-settings-tab="'+name+'"]');
  setSettingsTab(name,btn);
}

function closeProfileSettings(){
  closeImageCropper();
  showPrototypeView("myProfile",document.querySelector('[data-view="myProfile"]'));
}

function legacyToggleFakeToggle2(btn){
  btn.classList.toggle("on");
  btn.setAttribute("aria-pressed",btn.classList.contains("on")?"true":"false");
}

function flashSettingsSaved(){
  const status=document.getElementById("settingsSaveStatus");
  if(!status)return;
  status.classList.add("show");
  clearTimeout(flashSettingsSaved.timer);
  flashSettingsSaved.timer=setTimeout(()=>status.classList.remove("show"),1700);
}

function saveCurrentSettings(){
  const active=document.querySelector(".settings-nav button.active");
  const tab=active?.dataset.settingsTab || "profile";

  if(tab==="profile")saveProfileInfo();
  if(tab==="about")saveAboutMe();
  if(tab==="gallery")saveGallery();
  if(tab==="links")saveProfileLinks();
  if(tab==="interests")saveInterests();
  if(tab==="privacy")applyProfileVisibility();

  flashSettingsSaved();
}

/* ----- About Me count ----- */
function updateAboutCount(){
  const field=document.getElementById("aboutMeText");
  const count=document.getElementById("aboutCharCount");
  if(field && count)count.textContent=field.value.length+" / 1000";
}

/* ----- Profile image + Gallery image loading ----- */

function previewProfileAvatar(input){
  const file=input.files && input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    avatarDraft={src:e.target.result,croppedSrc:"",zoom:1,offsetX:0,offsetY:0};
    openImageCropper("avatar");
  };
  reader.readAsDataURL(file);
}

function renderAvatarDraft(){
  const preview=document.getElementById("settingsAvatarPreview");
  if(!preview)return;
  const src=avatarDraft.croppedSrc || avatarDraft.src;
  if(!src)return;
  preview.style.backgroundImage='url("'+src+'")';
  preview.style.backgroundPosition="center";
  preview.style.backgroundSize="cover";
  preview.textContent="";
}

function adjustProfileImage(){
  if(!avatarDraft.src){
    document.getElementById("profileAvatarInput")?.click();
    return;
  }
  openImageCropper("avatar");
}

function chooseGalleryImage(index){
  document.getElementById("galleryInput"+index)?.click();
}

function loadGalleryImage(index,input){
  const file=input.files && input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    galleryDraft[index]={src:e.target.result,croppedSrc:"",zoom:1,offsetX:0,offsetY:0};
    openImageCropper("gallery",index);
  };
  reader.readAsDataURL(file);
}

function deleteGalleryImage(index){
  galleryDraft[index]=null;
  const input=document.getElementById("galleryInput"+index);
  if(input)input.value="";
  renderGallerySlots();
}

function adjustGalleryImage(index){
  if(!galleryDraft[index]){
    chooseGalleryImage(index);
    return;
  }
  openImageCropper("gallery",index);
}

let draggedGalleryIndex=null;

function renderGallerySlots(){
  document.querySelectorAll("[data-gallery-slot]").forEach(slot=>{
    const index=Number(slot.dataset.gallerySlot);
    const data=galleryDraft[index];
    const main=slot.querySelector(".gallery-slot-main");
    const plus=slot.querySelector(".gallery-plus");

    slot.classList.toggle("empty",!data);
    slot.draggable=!!data;
    slot.classList.remove("dragging","drag-target");

    if(data){
      main.style.backgroundImage='url("'+(data.croppedSrc || data.src)+'")';
      main.style.backgroundPosition="center";
      main.style.backgroundSize="cover";
      if(plus)plus.textContent="";
    }else{
      main.style.backgroundImage="";
      main.style.backgroundPosition="50% 50%";
      if(plus)plus.textContent="+";
    }
  });
}

function galleryDragStart(event,index){
  if(!galleryDraft[index]){
    event.preventDefault();
    return;
  }
  draggedGalleryIndex=index;
  event.currentTarget.classList.add("dragging");
  if(event.dataTransfer){
    event.dataTransfer.effectAllowed="move";
    event.dataTransfer.setData("text/plain",String(index));
  }
}

function galleryDragOver(event,index){
  if(draggedGalleryIndex===null || draggedGalleryIndex===index)return;
  event.preventDefault();
  event.currentTarget.classList.add("drag-target");
  if(event.dataTransfer)event.dataTransfer.dropEffect="move";
}

function galleryDragLeave(event){
  event.currentTarget.classList.remove("drag-target");
}

function galleryDrop(event,targetIndex){
  event.preventDefault();
  const from=draggedGalleryIndex;
  if(from===null || from===targetIndex)return;

  const [moved]=galleryDraft.splice(from,1);
  galleryDraft.splice(targetIndex,0,moved);

  draggedGalleryIndex=null;
  renderGallerySlots();
}

function galleryDragEnd(){
  draggedGalleryIndex=null;
  document.querySelectorAll("[data-gallery-slot]").forEach(slot=>slot.classList.remove("dragging","drag-target"));
}

/* ----- Shared cropper with drag + zoom ----- */

function openImageCropper(type,index=null){
  let data=type==="avatar" ? avatarDraft : galleryDraft[index];
  if(!data || !data.src)return;

  cropState={
    type,
    index,
    src:data.src,
    zoom:Number.isFinite(data.zoom)?data.zoom:1,
    offsetX:Number.isFinite(data.offsetX)?data.offsetX:0,
    offsetY:Number.isFinite(data.offsetY)?data.offsetY:0,
    dragging:false,
    lastX:0,
    lastY:0,
    naturalW:0,
    naturalH:0
  };

  const modal=document.getElementById("imageCropModal");
  const stage=document.getElementById("cropStage");
  const img=document.getElementById("cropStageImage");
  const title=document.getElementById("cropDialogTitle");
  const help=document.getElementById("cropDialogHelp");
  const zoom=document.getElementById("cropZoomInput");

  stage.classList.toggle("crop-circle",type==="avatar");
  stage.classList.toggle("crop-square",type==="gallery");
  title.textContent=type==="avatar"?"Adjust profile image":"Adjust gallery crop";
  help.textContent=type==="avatar"
    ?"Drag to reposition your image inside the circle, then use Zoom if needed."
    :"Drag to reposition your image inside the square, then use Zoom if needed.";

  img.onload=()=>{
    cropState.naturalW=img.naturalWidth;
    cropState.naturalH=img.naturalHeight;
    clampCropOffsets();
    updateCropStage();
  };
  img.src=cropState.src;

  zoom.value=String(cropState.zoom);
  document.getElementById("cropZoomValue").textContent=Math.round(cropState.zoom*100)+"%";

  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
}

function getCropGeometry(){
  const stage=document.getElementById("cropStage");
  if(!stage || !cropState.naturalW || !cropState.naturalH)return null;
  const w=stage.clientWidth;
  const h=stage.clientHeight;
  const baseScale=Math.max(w/cropState.naturalW,h/cropState.naturalH);
  const displayW=cropState.naturalW*baseScale*cropState.zoom;
  const displayH=cropState.naturalH*baseScale*cropState.zoom;
  return {w,h,baseScale,displayW,displayH};
}

function clampCropOffsets(){
  const g=getCropGeometry();
  if(!g)return;
  const maxX=Math.max(0,(g.displayW-g.w)/2);
  const maxY=Math.max(0,(g.displayH-g.h)/2);
  cropState.offsetX=Math.max(-maxX,Math.min(maxX,cropState.offsetX));
  cropState.offsetY=Math.max(-maxY,Math.min(maxY,cropState.offsetY));
}

function updateCropStage(){
  const img=document.getElementById("cropStageImage");
  if(!img)return;
  img.style.transform=
    'translate(-50%,-50%) translate('+cropState.offsetX+'px,'+cropState.offsetY+'px) scale('+cropState.zoom+')';
}

function setCropZoom(value){
  cropState.zoom=Math.max(1,Math.min(3,Number(value)||1));
  document.getElementById("cropZoomValue").textContent=Math.round(cropState.zoom*100)+"%";
  clampCropOffsets();
  updateCropStage();
}

function beginCropDrag(event){
  if(!cropState.src)return;
  cropState.dragging=true;
  cropState.lastX=event.clientX;
  cropState.lastY=event.clientY;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

document.addEventListener("pointermove",event=>{
  if(!cropState.dragging)return;
  cropState.offsetX+=event.clientX-cropState.lastX;
  cropState.offsetY+=event.clientY-cropState.lastY;
  cropState.lastX=event.clientX;
  cropState.lastY=event.clientY;
  clampCropOffsets();
  updateCropStage();
});

document.addEventListener("pointerup",()=>{cropState.dragging=false;});
document.addEventListener("pointercancel",()=>{cropState.dragging=false;});

function makeCroppedDataURL(){
  const g=getCropGeometry();
  if(!g)return cropState.src;

  const img=document.getElementById("cropStageImage");
  const scale=g.baseScale*cropState.zoom;
  const left=g.w/2+cropState.offsetX-g.displayW/2;
  const top=g.h/2+cropState.offsetY-g.displayH/2;

  let sx=(0-left)/scale;
  let sy=(0-top)/scale;
  let sw=g.w/scale;
  let sh=g.h/scale;

  sx=Math.max(0,Math.min(img.naturalWidth-sw,sx));
  sy=Math.max(0,Math.min(img.naturalHeight-sh,sy));

  const canvas=document.createElement("canvas");
  const target=900;
  canvas.width=target;
  canvas.height=target;
  const ctx=canvas.getContext("2d");
  ctx.drawImage(img,sx,sy,sw,sh,0,0,target,target);
  return canvas.toDataURL("image/jpeg",0.92);
}

function confirmImageCrop(){
  const cropped=makeCroppedDataURL();

  if(cropState.type==="avatar"){
    avatarDraft={
      src:cropState.src,croppedSrc:cropped,zoom:cropState.zoom,
      offsetX:cropState.offsetX,offsetY:cropState.offsetY
    };
    renderAvatarDraft();
  }

  if(cropState.type==="gallery" && cropState.index!==null){
    galleryDraft[cropState.index]={
      src:cropState.src,croppedSrc:cropped,zoom:cropState.zoom,
      offsetX:cropState.offsetX,offsetY:cropState.offsetY
    };
    renderGallerySlots();
  }

  closeImageCropper();
}

function closeImageCropper(){
  const modal=document.getElementById("imageCropModal");
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden","true");
  cropState.dragging=false;
}

/* ----- Around the Web editor ----- */

function closeAllLinkIconPickers(except=null){
  document.querySelectorAll(".link-icon-picker.open").forEach(picker=>{
    if(picker===except)return;
    picker.classList.remove("open");
    picker.previousElementSibling?.classList.remove("active");
  });
}

function setProfileLinkIcon(link,icon,mode,button,picker){
  link.iconMode=mode;
  link.icon=mode==="auto" ? detectProfileLinkIcon(link.url,link.label) : icon;
  if(button)button.textContent=link.icon;
  if(picker){
    picker.querySelectorAll(".link-icon-choice").forEach(choice=>choice.classList.remove("selected"));
    const selected=mode==="auto"
      ? picker.querySelector(".link-icon-choice.auto")
      : [...picker.querySelectorAll(".link-icon-choice")].find(choice=>choice.dataset.icon===link.icon);
    selected?.classList.add("selected");
  }
}

function renderLinksEditor(){
  const list=document.getElementById("linksEditorList");
  const count=document.getElementById("linksCount");
  if(!list)return;
  list.innerHTML="";

  profileLinks.forEach((link,index)=>{
    if(!link.iconMode)link.iconMode="auto";
    if(link.iconMode==="auto")link.icon=detectProfileLinkIcon(link.url,link.label);

    const row=document.createElement("div");
    row.className="link-editor-row";
    row.draggable=true;
    row.dataset.linkId=link.id;

    const handle=document.createElement("span");
    handle.className="link-drag-handle";
    handle.textContent="⋮⋮";

    const badge=document.createElement("span");
    badge.className="link-feature-badge"+(index<3?"":" standard");
    badge.textContent=index<3?"TOP "+(index+1):"MORE";

    const iconControl=document.createElement("div");
    iconControl.className="link-icon-control";

    const iconButton=document.createElement("button");
    iconButton.type="button";
    iconButton.className="link-icon-button";
    iconButton.textContent=link.icon || "🌐";
    iconButton.title="Choose link icon";
    iconButton.setAttribute("aria-label","Choose icon for "+link.label);

    const iconPicker=document.createElement("div");
    iconPicker.className="link-icon-picker";

    const autoChoice=document.createElement("button");
    autoChoice.type="button";
    autoChoice.className="link-icon-choice auto"+(link.iconMode==="auto"?" selected":"");
    autoChoice.textContent="Auto";
    autoChoice.onclick=e=>{
      e.stopPropagation();
      setProfileLinkIcon(link,null,"auto",iconButton,iconPicker);
      closeAllLinkIconPickers();
    };
    iconPicker.appendChild(autoChoice);

    profileLinkIconChoices.forEach(icon=>{
      const choice=document.createElement("button");
      choice.type="button";
      choice.className="link-icon-choice"+(link.iconMode==="manual" && link.icon===icon?" selected":"");
      choice.dataset.icon=icon;
      choice.textContent=icon;
      choice.title="Use "+icon;
      choice.onclick=e=>{
        e.stopPropagation();
        setProfileLinkIcon(link,icon,"manual",iconButton,iconPicker);
        closeAllLinkIconPickers();
      };
      iconPicker.appendChild(choice);
    });

    iconButton.onclick=e=>{
      e.stopPropagation();
      const opening=!iconPicker.classList.contains("open");
      closeAllLinkIconPickers(iconPicker);
      iconPicker.classList.toggle("open",opening);
      iconButton.classList.toggle("active",opening);
    };

    iconControl.append(iconButton,iconPicker);

    const label=document.createElement("input");
    label.className="link-label-input";
    label.value=link.label;
    label.placeholder="Display name";
    label.maxLength=40;
    label.addEventListener("input",()=>{
      link.label=label.value;
      if(link.iconMode==="auto"){
        link.icon=detectProfileLinkIcon(link.url,link.label);
        iconButton.textContent=link.icon;
      }
    });

    const url=document.createElement("input");
    url.className="link-url-input";
    url.value=link.url;
    url.placeholder="https://…";
    url.addEventListener("input",()=>{
      link.url=url.value;
      if(link.iconMode==="auto"){
        link.icon=detectProfileLinkIcon(link.url,link.label);
        iconButton.textContent=link.icon;
      }
    });

    const remove=document.createElement("button");
    remove.type="button";
    remove.className="link-remove";
    remove.textContent="×";
    remove.setAttribute("aria-label","Remove "+link.label);
    remove.onclick=()=>removeProfileLink(link.id);

    row.append(handle,badge,iconControl,label,url,remove);

    row.addEventListener("dragstart",e=>{
      if(e.target.closest("button,input,.link-icon-control")){
        e.preventDefault();
        return;
      }
      draggedProfileLinkId=link.id;
      row.classList.add("dragging");
    });
    row.addEventListener("dragend",()=>{
      draggedProfileLinkId=null;
      document.querySelectorAll(".link-editor-row").forEach(r=>r.classList.remove("dragging","drag-target"));
    });
    row.addEventListener("dragover",e=>{
      e.preventDefault();
      if(draggedProfileLinkId && draggedProfileLinkId!==link.id)row.classList.add("drag-target");
    });
    row.addEventListener("dragleave",()=>row.classList.remove("drag-target"));
    row.addEventListener("drop",e=>{
      e.preventDefault();
      row.classList.remove("drag-target");
      reorderProfileLink(draggedProfileLinkId,link.id);
    });

    list.appendChild(row);
  });

  if(count)count.textContent=profileLinks.length;
}

function reorderProfileLink(fromId,toId){
  if(!fromId || fromId===toId)return;
  const from=profileLinks.findIndex(link=>link.id===fromId);
  const to=profileLinks.findIndex(link=>link.id===toId);
  if(from<0 || to<0)return;
  const [moved]=profileLinks.splice(from,1);
  profileLinks.splice(to,0,moved);
  renderLinksEditor();
}

function addProfileLink(){
  if(profileLinks.length>=12){
    flashSettingsSaved();
    const status=document.getElementById("settingsSaveStatus");
    if(status)status.textContent="12 link maximum";
    clearTimeout(addProfileLink.timer);
    addProfileLink.timer=setTimeout(()=>{status.textContent="Saved ✓";status.classList.remove("show");},1600);
    return;
  }
  const id=String(Date.now());
  profileLinks.push({id,label:"New Link",url:"https://",icon:"🌐",iconMode:"auto"});
  renderLinksEditor();
}

function removeProfileLink(id){
  const index=profileLinks.findIndex(link=>link.id===id);
  if(index<0)return;
  profileLinks.splice(index,1);
  renderLinksEditor();
}

function safeDomain(url){
  try{
    const value=/^https?:\/\//i.test(url)?url:"https://"+url;
    return new URL(value).hostname.replace(/^www\./,"");
  }catch{
    return "link";
  }
}

function saveProfileLinks(){
  const section=document.querySelector("#myProfile .around-web-section");
  if(!section)return;

  const shelf=section.querySelector(".link-shelf");
  const more=section.querySelector(".more-links");
  const toggle=section.querySelector(".view-more-links");
  if(!shelf || !more || !toggle)return;

  shelf.innerHTML="";
  more.innerHTML="";

  profileLinks.forEach((link,index)=>{
    const a=document.createElement("a");
    a.className="web-link-card"+(index<3?" featured":"");
    a.href=link.url || "#";
    a.target="_blank";
    a.rel="noopener noreferrer";

    const icon=document.createElement("span");
    icon.className="web-link-icon";
    icon.setAttribute("aria-hidden","true");
    icon.textContent=link.icon || "↗";

    const copy=document.createElement("span");
    copy.className="web-link-copy";

    const label=document.createElement("span");
    label.className="web-link-label";
    label.textContent=link.label || "Link";

    const domain=document.createElement("span");
    domain.className="web-link-domain";
    domain.textContent=safeDomain(link.url);

    const arrow=document.createElement("span");
    arrow.className="web-link-arrow";
    arrow.setAttribute("aria-hidden","true");
    arrow.textContent="↗";

    copy.append(label,domain);
    a.append(icon,copy,arrow);

    if(index<3)shelf.appendChild(a);
    else more.appendChild(a);
  });

  const remaining=Math.max(0,profileLinks.length-3);
  toggle.style.display=remaining?"":"none";
  const spans=toggle.querySelectorAll("span");
  if(spans[0])spans[0].textContent="See "+remaining+" more";
  if(spans[1])spans[1].textContent="▾";
  toggle.setAttribute("aria-expanded","false");
  more.classList.remove("open");
}

/* ----- Save individual settings categories ----- */

function saveProfileInfo(){
  const name=document.getElementById("profileDisplayName").value.trim();
  const rawUser=document.getElementById("profileUsername").value.trim().replace(/^@+/,"");
  const bio=document.getElementById("profileShortBio").value.trim();
  const username=rawUser || "username";

  const display=document.querySelector("#myProfile .profile-display-name");
  const handle=document.querySelector("#myProfile .profile-handle-large");
  const bioEl=document.querySelector("#myProfile .profile-bio");
  if(display)display.textContent=name || username;
  if(handle)handle.textContent="@"+username;
  if(bioEl)bioEl.textContent=bio;

  document.querySelectorAll("#myProfile article.post .username").forEach(el=>el.textContent="@"+username);

  if(avatarDraft.src){
    const image=avatarDraft.croppedSrc || avatarDraft.src;
    const avatar=document.querySelector("#myProfile .profile-avatar");
    if(avatar){
      avatar.style.backgroundImage='url("'+image+'")';
      avatar.style.backgroundSize="cover";
      avatar.style.backgroundPosition="center";
      avatar.textContent="";
    }

    document.querySelectorAll("#myProfile article.post .profile-picture, #myProfile .comment-profile-picture").forEach(el=>{
      el.style.backgroundImage='url("'+image+'")';
      el.style.backgroundSize="cover";
      el.style.backgroundPosition="center";
    });
  }
}

function saveAboutMe(){
  const field=document.getElementById("aboutMeText");
  const value=field?.value.trim() || "";
  const about=document.querySelector("#myProfile .about-text");
  const read=document.querySelector("#myProfile .about-read");
  if(!about || !read)return;

  const short=value.length>118 ? value.slice(0,115).trimEnd()+"…" : value;
  about.dataset.fullText=value;
  about.dataset.shortText=short;
  about.textContent=short;

  read.dataset.open="false";
  read.textContent="Read more";
  read.style.display=value.length>118?"":"none";
}

function saveGallery(){
  const slides=[...document.querySelectorAll("#myProfile .about-slide")];
  const dots=[...document.querySelectorAll("#myProfile .about-dot")];

  galleryDraft.forEach((data,index)=>{
    const slide=slides[index];
    const dot=dots[index];
    if(!slide)return;

    if(data){
      slide.style.backgroundImage='url("'+(data.croppedSrc || data.src)+'")';
      slide.style.backgroundSize="cover";
      slide.style.backgroundPosition="center";
      slide.textContent="";
      slide.dataset.hasImage="true";
      if(dot)dot.style.display="";
    }else{
      slide.style.backgroundImage="";
      slide.style.backgroundSize="";
      slide.style.backgroundPosition="";
      slide.textContent="ABOUT IMAGE "+(index+1);
      slide.dataset.hasImage="false";
      if(dot)dot.style.display="";
    }
  });

  slides.forEach((slide,index)=>slide.classList.toggle("active",index===0));
  dots.forEach((dot,index)=>dot.classList.toggle("active",index===0));
  const gallery=document.querySelector("#myProfile .about-gallery");
  if(gallery)gallery.dataset.activeIndex="0";
}

function saveInterests(){
  const enabled=document.getElementById("enableInterestsToggle")?.classList.contains("on");
  const wrap=document.querySelector("#myProfile .profile-interests");
  if(!wrap)return;

  wrap.style.display=enabled?"":"none";
  if(!enabled)return;

  wrap.innerHTML="";
  interestCatalog
    .filter(item=>selectedInterests.has(item.name))
    .slice(0,5)
    .forEach(item=>{
      const span=document.createElement("span");
      span.className="profile-interest";
      span.textContent=item.emoji+" "+item.name;
      wrap.appendChild(span);
    });
}

function legacyApplyProfileVisibility2(){
  const states={};
  document.querySelectorAll(".fake-toggle[data-setting]").forEach(btn=>{
    states[btn.dataset.setting]=btn.classList.contains("on");
  });

  const about=document.querySelector("#myProfile .about-card");
  if(about)about.style.display=states.about===false?"none":"block";

  const following=document.querySelector("#myProfile .private-stat");
  if(following)following.style.display=states["following-private"]===false?"none":"inline-flex";

  if(about){
    ["people","pockets","communities"].forEach(name=>{
      const tab=about.querySelector('.side-tab[onclick*="\''+name+'\'"]');
      const panel=about.querySelector('[data-side-panel="'+name+'"]');
      const visible=states[name]!==false;
      if(tab)tab.style.display=visible?"":"none";
      if(panel && !visible)panel.classList.remove("active");
    });

    const visibleTabs=[...about.querySelectorAll(".side-tab")].filter(b=>b.style.display!=="none");
    if(!visibleTabs.some(b=>b.classList.contains("active")) && visibleTabs[0]){
      const match=visibleTabs[0].getAttribute("onclick")?.match(/'([^']+)'/);
      if(match)setSideTab(match[1],visibleTabs[0]);
    }

    const discovery=about.querySelector(".profile-discovery-section");
    if(discovery){
      const any=["people","pockets","communities"].some(name=>states[name]!==false);
      discovery.style.display=any?"":"none";
    }
  }
}

/* ----- About read-more now uses the editable owner text ----- */

function toggleAboutText(btn){
  const text=btn.previousElementSibling;
  const visitor=btn.closest("#otherProfile");

  const fallbackLong=visitor
    ?"Photographer for 8 years, mostly self-taught. I shoot film because I love the delay — not knowing if I got it until weeks later. I am currently working on a small zine about abandoned greenhouses and teach beginner film workshops every spring."
    :"A little bit artist, a little bit gamer, fully committed to cozy chaos. I make spooky-cute art and crochet, collect too many Halloween things, and like making little corners of the internet feel welcoming. Currently obsessed with moss, vintage Halloween, and half-finished sketchbooks.";

  const fallbackShort=visitor
    ?"Photographer for 8 years, mostly self-taught. I shoot film because I love the delay…"
    :"A little bit artist, a little bit gamer, fully committed to cozy chaos…";

  const long=text.dataset.fullText || fallbackLong;
  const short=text.dataset.shortText || fallbackShort;
  const open=btn.dataset.open==="true";

  btn.dataset.open=open?"false":"true";
  text.textContent=open?short:long;
  btn.textContent=open?"Read more":"Show less";
}

/* ----- Interests ----- */

function createInterestChoice(item){
  const button=document.createElement("button");
  button.type="button";
  button.className="interest-choice"+(selectedInterests.has(item.name)?" selected":"");
  button.textContent=item.emoji+" "+item.name;
  button.onclick=()=>toggleInterestChoice(item.name);
  return button;
}

function renderInterestSuggestions(){
  const wrap=document.getElementById("interestSuggestedList");
  if(!wrap)return;
  wrap.innerHTML="";
  suggestedInterestNames
    .map(name=>interestCatalog.find(item=>item.name===name))
    .filter(Boolean)
    .forEach(item=>wrap.appendChild(createInterestChoice(item)));
}

function renderInterestSearch(query){
  const box=document.getElementById("interestSearchResults");
  const wrap=document.getElementById("interestResultsList");
  if(!box || !wrap)return;

  const q=(query||"").trim().toLowerCase();
  if(!q){
    box.hidden=true;
    wrap.innerHTML="";
    return;
  }

  const matches=interestCatalog.filter(item=>item.name.toLowerCase().includes(q));
  wrap.innerHTML="";
  matches.forEach(item=>wrap.appendChild(createInterestChoice(item)));

  if(!matches.length){
    const empty=document.createElement("span");
    empty.className="settings-help";
    empty.textContent="No matching Interests yet.";
    wrap.appendChild(empty);
  }
  box.hidden=false;
}

function updateInterestLimitStatus(){
  const count=document.getElementById("interestSelectedCount");
  const box=document.querySelector(".interest-limit-status");
  const total=selectedInterests.size;
  if(count)count.textContent=total+" / 5 selected";
  box?.classList.toggle("limit-hit",total>=5);
}

function toggleInterestChoice(name){
  if(selectedInterests.has(name)){
    selectedInterests.delete(name);
  }else{
    if(selectedInterests.size>=5){
      updateInterestLimitStatus();
      return;
    }
    selectedInterests.add(name);
  }

  updateInterestLimitStatus();
  renderInterestSuggestions();
  renderInterestSearch(document.getElementById("interestSearchInput")?.value || "");
}

/* Initialize draft UI */
document.addEventListener("click",event=>{
  if(!event.target.closest(".link-icon-control"))closeAllLinkIconPickers();
});

renderGallerySlots();
renderInterestSuggestions();
renderLinksEditor();
updateAboutCount();
updateInterestLimitStatus();
syncAboutDependentSettings();


/* =========================
   COMMUNITIES — WORKING HOME IMPLEMENTATION
   ========================= */
let draggedCommunity=null;

function wireCommunityChip(chip){
    if(!chip || chip.dataset.communityWired==="true")return;
    chip.dataset.communityWired="true";
    chip.draggable=true;
    chip.addEventListener("dragstart",()=>{draggedCommunity=chip;chip.classList.add("dragging")});
    chip.addEventListener("dragend",()=>{
        chip.classList.remove("dragging");
        const bar=chip.closest(".community-bar");
        draggedCommunity=null;
        if(bar)syncCommunityOrderFromBar(bar);
    });
}

function seedCommunityActivityState(bar){
    const hotbar=bar.querySelector(".pinned-communities");
    bar.querySelectorAll(".community-more-row").forEach(row=>{
        const chip=[...hotbar.querySelectorAll(".community-chip")].find(c=>c.dataset.community===row.dataset.community);
        if(chip){
            const count=chip.querySelector(".activity-count");
            row.dataset.activityCount=count?count.textContent.trim():"0";
            row.dataset.activityHidden=count?.classList.contains("hidden")?"true":"false";
        }else{
            row.dataset.activityCount=row.dataset.activityCount||"0";
            row.dataset.activityHidden=row.dataset.activityHidden||"true";
        }
    });
}

function wireCommunityHotbar(hotbar){
    if(!hotbar || hotbar.dataset.hotbarWired==="true")return;
    hotbar.dataset.hotbarWired="true";
    hotbar.querySelectorAll(".community-chip").forEach(wireCommunityChip);

    hotbar.addEventListener("dragover",event=>{
        event.preventDefault();
        const after=[...hotbar.querySelectorAll(".community-chip:not(.dragging)")].find(
            el=>event.clientX<=el.getBoundingClientRect().left+el.offsetWidth/2
        );
        if(draggedCommunity && draggedCommunity.closest(".pinned-communities")===hotbar){
            after?hotbar.insertBefore(draggedCommunity,after):hotbar.appendChild(draggedCommunity);
        }
    });

    hotbar.addEventListener("wheel",event=>{
        if(Math.abs(event.deltaY)>Math.abs(event.deltaX)){
            event.preventDefault();
            hotbar.scrollLeft+=event.deltaY;
        }
    },{passive:false});
}

function setCommunityPinButton(btn,name,pinned){
    if(!btn)return;
    btn.classList.toggle("pinned",pinned);
    btn.innerHTML=pinned
        ? '<span class="pin-state">Pinned</span><span class="pin-action">Unpin</span>'
        : '<span class="pin-state">Pin</span><span class="pin-action">Pin</span>';
    btn.title=pinned?"Unpin from hotbar":"Pin to hotbar";
    btn.setAttribute("aria-label",(pinned?"Unpin ":"Pin ")+name+(pinned?" from hotbar":" to hotbar"));
}

function buildCommunityChip(name,icon,activityCount="0",hidden=true){
    const chip=document.createElement("button");
    chip.className="community-chip";
    chip.draggable=true;
    chip.dataset.community=name;
    chip.dataset.icon=icon;
    chip.innerHTML=`<span class="community-icon">${icon}</span>${name} <span class="activity-bell" onclick="openRecentActivity(event,this)" title="${hidden?'No new community activity':activityCount+' new community activities'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg><span class="activity-count${hidden?' hidden':''}">${activityCount}</span></span>`;
    wireCommunityChip(chip);
    return chip;
}

function toggleCommunityDropdown(event,button){
    event?.stopPropagation();
    const dropdown=button?.closest(".community-menu")?.querySelector(".community-dropdown");
    if(!dropdown)return;
    const wasOpen=dropdown.classList.contains("active");
    document.querySelectorAll(".profile-view .community-dropdown.active").forEach(d=>d.classList.remove("active"));
    if(!wasOpen)dropdown.classList.add("active");
}

function toggleCommunityPin(event,btn){
    event.stopPropagation();
    const sourceBar=btn.closest(".community-bar");
    const sourceRow=btn.closest(".community-more-row");
    if(!sourceBar || !sourceRow)return;

    const name=sourceRow.dataset.community;
    const icon=sourceRow.dataset.icon;
    const sourceHotbar=sourceBar.querySelector(".pinned-communities");
    const existing=[...sourceHotbar.querySelectorAll(".community-chip")].find(c=>c.dataset.community===name);

    let activityCount=sourceRow.dataset.activityCount||"0";
    let hidden=sourceRow.dataset.activityHidden==="true"||activityCount==="0";

    if(existing){
        const bell=existing.querySelector(".activity-bell");
        const count=bell?.querySelector(".activity-count");
        activityCount=count?count.textContent.trim():"0";
        hidden=count?.classList.contains("hidden")||activityCount==="0";

        document.querySelectorAll(".profile-view .community-bar").forEach(bar=>{
            const hotbar=bar.querySelector(".pinned-communities");
            const chip=[...hotbar.querySelectorAll(".community-chip")].find(c=>c.dataset.community===name);
            chip?.remove();

            const row=[...bar.querySelectorAll(".community-more-row")].find(r=>r.dataset.community===name);
            if(row){
                row.dataset.activityCount=activityCount;
                row.dataset.activityHidden=hidden?"true":"false";
                setCommunityPinButton(row.querySelector(".community-pin"),name,false);
            }
        });
    }else{
        document.querySelectorAll(".profile-view .community-more-row").forEach(row=>{
            if(row.dataset.community===name && row.dataset.activityCount!==undefined){
                activityCount=row.dataset.activityCount;
                hidden=row.dataset.activityHidden==="true"||activityCount==="0";
            }
        });

        document.querySelectorAll(".profile-view .community-bar").forEach(bar=>{
            const hotbar=bar.querySelector(".pinned-communities");
            const chip=[...hotbar.querySelectorAll(".community-chip")].find(c=>c.dataset.community===name);
            if(!chip)hotbar.appendChild(buildCommunityChip(name,icon,activityCount,hidden));

            const row=[...bar.querySelectorAll(".community-more-row")].find(r=>r.dataset.community===name);
            if(row){
                row.dataset.activityCount=activityCount;
                row.dataset.activityHidden=hidden?"true":"false";
                setCommunityPinButton(row.querySelector(".community-pin"),name,true);
            }
        });
    }
}

function openRecentActivity(event,bell){
    event.stopPropagation();
    const name=bell.closest(".community-chip")?.dataset.community;
    if(!name)return;

    document.querySelectorAll(".profile-view .community-chip").forEach(chip=>{
        if(chip.dataset.community!==name)return;
        const otherBell=chip.querySelector(".activity-bell");
        const count=otherBell?.querySelector(".activity-count");
        if(count)count.classList.add("hidden");
        if(otherBell)otherBell.title="No new community activity";
    });

    const ownCount=bell.querySelector(".activity-count")?.textContent.trim()||"0";
    document.querySelectorAll(".profile-view .community-more-row").forEach(row=>{
        if(row.dataset.community===name){
            row.dataset.activityCount=ownCount;
            row.dataset.activityHidden="true";
        }
    });
}

function syncCommunityOrderFromBar(sourceBar){
    const order=[...sourceBar.querySelectorAll(".pinned-communities .community-chip")].map(chip=>chip.dataset.community);
    document.querySelectorAll(".profile-view .community-bar").forEach(bar=>{
        if(bar===sourceBar)return;
        const hotbar=bar.querySelector(".pinned-communities");
        order.forEach(name=>{
            const chip=[...hotbar.querySelectorAll(".community-chip")].find(c=>c.dataset.community===name);
            if(chip)hotbar.appendChild(chip);
        });
    });
}

document.querySelectorAll(".profile-view .community-bar").forEach(bar=>{
    seedCommunityActivityState(bar);
    wireCommunityHotbar(bar.querySelector(".pinned-communities"));
});

document.addEventListener("click",event=>{
    if(!event.target.closest(".profile-view .community-menu")){
        document.querySelectorAll(".profile-view .community-dropdown.active").forEach(d=>d.classList.remove("active"));
    }
});


/* =========================
   V26 — CANONICAL PROFILE VISIBILITY SETTINGS
   =========================
   Important: this intentionally lives LAST in the script.
   Older prototype versions accumulated duplicate function declarations;
   these final functions are now the single active behavior.
*/

function toggleFakeToggle(btn){
  if(!btn || btn.disabled)return;

  btn.classList.toggle("on");
  btn.setAttribute("aria-pressed",btn.classList.contains("on")?"true":"false");

  if(btn.dataset.setting==="about"){
    syncAboutDependentSettings();
  }

  applyProfileVisibility();
}

function syncAboutDependentSettings(){
  const aboutToggle=document.querySelector('#settingsView .fake-toggle[data-setting="about"]');
  if(!aboutToggle)return;

  const enabled=aboutToggle.classList.contains("on");
  const note=document.getElementById("aboutDependentNote");

  ["people","pockets","communities"].forEach(name=>{
    const toggle=document.querySelector('#settingsView .fake-toggle[data-setting="'+name+'"]');
    if(!toggle)return;

    const row=toggle.closest(".about-dependent-setting");

    if(!enabled){
      toggle.classList.remove("on");
      toggle.setAttribute("aria-pressed","false");
      toggle.disabled=true;
      row?.classList.add("locked");
    }else{
      toggle.disabled=false;
      row?.classList.remove("locked");
    }
  });

  note?.classList.toggle("show",!enabled);
}

function applyProfileVisibility(){
  const getState=name=>{
    const btn=document.querySelector('#settingsView .fake-toggle[data-setting="'+name+'"]');
    return !!btn?.classList.contains("on");
  };

  const aboutOn=getState("about");
  const peopleOn=aboutOn && getState("people");
  const pocketsOn=aboutOn && getState("pockets");
  const communitiesOn=aboutOn && getState("communities");
  const followingPrivate=getState("following-private");

  const profile=document.getElementById("myProfile");
  if(!profile)return;

  const shell=profile.querySelector(".profile-shell");
  const grid=profile.querySelector(".profile-grid");
  const side=profile.querySelector(".profile-side");
  const about=profile.querySelector(".about-card");

  // When the panel is off, remove the entire right column and center
  // the complete 824px profile column in the viewport.
  shell?.classList.toggle("panel-off-shell",!aboutOn);
  grid?.classList.toggle("panel-off",!aboutOn);

  if(side)side.style.display=aboutOn?"":"none";
  if(about)about.style.display=aboutOn?"":"none";

  // Owner-only following count.
  const following=profile.querySelector(".private-stat");
  if(following)following.style.display=followingPrivate?"inline-flex":"none";

  if(about){
    const states={
      people:peopleOn,
      pockets:pocketsOn,
      communities:communitiesOn
    };

    Object.entries(states).forEach(([name,visible])=>{
      const tab=about.querySelector('.side-tab[onclick*="\''+name+'\'"]');
      const panel=about.querySelector('[data-side-panel="'+name+'"]');
      if(tab)tab.style.display=visible?"":"none";
      if(panel && !visible)panel.classList.remove("active");
    });

    const visibleTabs=[...about.querySelectorAll(".side-tab")].filter(tab=>tab.style.display!=="none");
    const currentVisible=visibleTabs.find(tab=>tab.classList.contains("active"));

    if(!currentVisible && visibleTabs[0]){
      const match=visibleTabs[0].getAttribute("onclick")?.match(/'([^']+)'/);
      if(match)setSideTab(match[1],visibleTabs[0]);
    }

    const discovery=about.querySelector(".profile-discovery-section");
    if(discovery)discovery.style.display=visibleTabs.length?"":"none";
  }
}

// Initialize these dependencies once after the whole document is parsed.
syncAboutDependentSettings();
applyProfileVisibility();

/* V31 HEADER AVATAR PERSISTENCE */
function applyStoredProfileAvatar(){
  let image="";
  try{
    image=localStorage.getItem("allMediaProfileAvatar") || "";
  }catch(err){}
  if(!image)return;

  document.querySelectorAll(".header-avatar").forEach(avatar=>{
    avatar.style.backgroundImage='url("'+image+'")';
    avatar.style.backgroundSize="cover";
    avatar.style.backgroundPosition="center";
    avatar.style.backgroundRepeat="no-repeat";
    avatar.textContent="";
  });

  const profileAvatar=document.querySelector("#myProfile .profile-avatar");
  if(profileAvatar){
    profileAvatar.style.backgroundImage='url("'+image+'")';
    profileAvatar.style.backgroundSize="cover";
    profileAvatar.style.backgroundPosition="center";
    profileAvatar.textContent="";
  }

  document.querySelectorAll("#myProfile article.post .profile-picture, #myProfile .comment-profile-picture").forEach(el=>{
    el.style.backgroundImage='url("'+image+'")';
    el.style.backgroundSize="cover";
    el.style.backgroundPosition="center";
  });

  const preview=document.getElementById("settingsAvatarPreview");
  if(preview){
    preview.style.backgroundImage='url("'+image+'")';
    preview.style.backgroundSize="cover";
    preview.style.backgroundPosition="center";
    preview.textContent="";
  }

  if(typeof avatarDraft!=="undefined" && !avatarDraft.src){
    avatarDraft={src:image,croppedSrc:image,zoom:1,offsetX:0,offsetY:0};
  }
}

const originalSaveProfileInfoForAvatar=saveProfileInfo;
saveProfileInfo=function(){
  originalSaveProfileInfoForAvatar();

  if(typeof avatarDraft!=="undefined" && avatarDraft.src){
    const image=avatarDraft.croppedSrc || avatarDraft.src;
    try{
      localStorage.setItem("allMediaProfileAvatar",image);
    }catch(err){
      console.warn("Could not save profile image in this browser.",err);
    }
  }

  applyStoredProfileAvatar();
};

applyStoredProfileAvatar();

/* =========================================================
   PROFILE — HOME V11 REGULAR POST HANDLERS
   Kept page-local; Profile does not load Home's JavaScript.
========================================================= */
function regularToggleLike(btn){
  const count=btn.querySelector(".like-count");
  const liked=btn.classList.toggle("liked");
  if(count)count.textContent=String(Math.max(0,Number(count.textContent||0)+(liked?1:-1)));
}
function regularToggleSave(btn){
  const saved=btn.classList.toggle("saved");
  btn.setAttribute("aria-label",saved?"Remove saved post":"Save post");
}
function regularIncrementReblog(btn){
  const count=btn.querySelector("span");if(!count)return;
  const on=btn.dataset.reblogged==="true";
  count.textContent=String(Math.max(0,Number(count.textContent||0)+(on?-1:1)));
  btn.dataset.reblogged=on?"false":"true";
}
function regularTogglePostMenu(event,btn){
  event.stopPropagation();
  const menu=btn.nextElementSibling;
  document.querySelectorAll(".regular-post-menu.open").forEach(m=>{if(m!==menu)m.classList.remove("open")});
  menu?.classList.toggle("open");
}
function regularOpenCommentComposer(el){
  const composer=el.closest(".comment-composer"),wrap=composer?.closest(".single-comment-composer");
  if(!composer)return;composer.classList.add("active");wrap?.classList.add("open");
  setTimeout(()=>composer.querySelector(".comment-text-area")?.focus(),0);
}
function regularCloseCommentComposer(el,event){
  event?.stopPropagation();const post=el.closest(".regular-post");
  post?.querySelector(".comment-composer")?.classList.remove("active");
  post?.querySelector(".single-comment-composer")?.classList.remove("open");
}
function regularSyncComments(post,open){
  const view=post.querySelector(".more-comments"),hide=post.querySelector(".hide-comments-inline");
  if(view)view.style.display=open?"none":"";hide?.classList.toggle("show",open);
}
function regularToggleComments(btn){const post=btn.closest(".regular-post"),section=post?.querySelector(".comments-section");if(!post||!section)return;const open=section.classList.toggle("active");regularSyncComments(post,open);}
function regularHideComments(btn){const post=btn.closest(".regular-post");post?.querySelector(".comments-section")?.classList.remove("active");if(post)regularSyncComments(post,false);}
function regularUpdateCommentCount(post){const view=post?.querySelector(".more-comments");if(!view)return;const count=post.querySelectorAll(".comments-section .comment-item").length;view.textContent=`View ${count} more`;}
function regularPostComment(btn,event){
  event?.stopPropagation();const post=btn.closest(".regular-post"),field=post?.querySelector(".comment-text-area"),value=field?.value.trim();if(!post||!value)return;
  const latest=post.querySelector(".latest-comment");
  if(latest){latest.classList.remove("empty-comment");latest.innerHTML='<span class="comment-username">@yourusername:</span><span class="latest-comment-copy">'+escapeHTML(value)+'</span><span class="latest-comment-time">now</span>';}
  const section=post.querySelector(".comments-section"),item=document.createElement("div");item.className="comment-item";
  item.innerHTML='<div class="comment-avatar" aria-hidden="true">y</div><div class="comment-body"><div class="comment-author">@yourusername</div><div>'+escapeHTML(value)+'</div><div class="comment-actions"><button class="comment-action comment-like-button" type="button" onclick="regularToggleCommentLike(this)"><svg class="comment-like-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><span>Like</span></button><button class="comment-action" type="button" onclick="regularReplyToTarget(this,\'@yourusername\')">Reply</button></div></div>';
  section?.appendChild(item);field.value="";regularUpdateCommentCount(post);section?.classList.add("active");regularSyncComments(post,true);regularCloseCommentComposer(btn);
}
function regularToggleCommentLike(btn){btn.classList.toggle("liked");}
function regularReplyToTarget(btn,username){const post=btn.closest(".regular-post"),composer=post?.querySelector(".comment-composer"),field=composer?.querySelector(".comment-text-area");if(!composer||!field)return;regularOpenCommentComposer(composer);field.value=username+" ";field.focus();field.setSelectionRange(field.value.length,field.value.length);}
function togglePostHashtags(el){
  const post=el.closest(".post"),box=post?.querySelector(".post-hashtags"),footer=post?.querySelector(".post-footer");if(!post||!box)return;
  if(footer&&box.previousElementSibling!==footer)footer.insertAdjacentElement("afterend",box);
  const open=!box.classList.contains("active");box.classList.toggle("active",open);el.classList.toggle("active",open);
  const set=(name,value)=>box.style.setProperty(name,value,"important");
  set("position","static");set("width","auto");set("max-width","none");set("margin","0 18px 12px");set("padding","10px 12px");set("gap","6px");set("box-sizing","border-box");set("flex-wrap","wrap");set("justify-content","flex-start");set("align-items","center");set("border","1px dotted rgba(255,207,159,.30)");set("border-radius","12px");set("background","rgba(255,207,159,.035)");set("display",open?"flex":"none");
}
document.addEventListener("click",event=>{
  const shareButton=event.target.closest(".profile-feed .post.regular-post .share-action");
  if(shareButton){const active=shareButton.classList.toggle("shared");shareButton.setAttribute("aria-pressed",active?"true":"false");return;}
  if(!event.target.closest(".regular-post-menu")&&!event.target.closest(".post-menu-button"))document.querySelectorAll(".regular-post-menu.open").forEach(m=>m.classList.remove("open"));
});
document.addEventListener("keydown",event=>{
  const field=event.target.closest?.(".regular-post .comment-text-area");if(!field)return;const post=field.closest(".regular-post");
  if(event.key==="Escape"){event.preventDefault();regularCloseCommentComposer(field,event);return;}
  if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();const button=post?.querySelector(".comment-post-button");if(button)regularPostComment(button,event);}
});
requestAnimationFrame(()=>document.querySelectorAll(".profile-feed .post.regular-post").forEach(post=>regularSyncComments(post,post.querySelector(".comments-section")?.classList.contains("active")||false)));

/* =========================================================
   PROFILE POST VIEW COUNTER SAFETY NET
   Applies to every post type shown on a Profile.
========================================================= */
function profilePostBelongsToCurrentUser(post){
  if(!post) return false;
  if(post.dataset.owner==="current-user" || post.classList.contains("own-post")) return true;
  const handle=post.querySelector(".username")?.textContent.trim().toLowerCase();
  return handle==="@sugarcrumbco" || handle==="@yourusername";
}

function ensureProfilePostViewCounter(post){
  if(!post || !profilePostBelongsToCurrentUser(post) || post.querySelector(".post-view-count")) return;
  const line=post.querySelector(".post-author-line");
  const time=line?.querySelector(".post-time");
  if(!line || !time) return;
  const count=Number(post.dataset.views||0);
  const counter=document.createElement("span");
  counter.className="post-view-count creator-only-view-count";
  counter.textContent=`· ◉ ${count.toLocaleString()} views`;
  time.insertAdjacentElement("afterend",counter);
}

document.querySelectorAll(".profile-feed .post").forEach(ensureProfilePostViewCounter);

new MutationObserver(records=>{
  records.forEach(record=>{
    record.addedNodes.forEach(node=>{
      if(!(node instanceof Element)) return;
      if(node.matches?.(".profile-feed .post")) ensureProfilePostViewCounter(node);
      node.querySelectorAll?.(".profile-feed .post").forEach(ensureProfilePostViewCounter);
    });
  });
}).observe(document.body,{childList:true,subtree:true});

