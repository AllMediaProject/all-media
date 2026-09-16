
const allInterests=[
{name:"Art",emoji:"🎨"},{name:"Halloween",emoji:"🎃"},{name:"Horror",emoji:"👻"},{name:"Nature",emoji:"🌲"},
{name:"Gaming",emoji:"🎮"},{name:"Music",emoji:"🎵"},{name:"Books",emoji:"📚"},{name:"Cozy",emoji:"✨"},{name:"Food",emoji:"🍔"},
{name:"Photography",emoji:"📷"},{name:"Movies & TV",emoji:"🎬"},{name:"Fashion",emoji:"👗"},{name:"Technology",emoji:"💻"},
{name:"Lifestyle",emoji:"🧘"},{name:"Home & Decor",emoji:"🏠"},{name:"Travel",emoji:"✈️"},{name:"Animals",emoji:"🐾"},{name:"Spiders",emoji:"🕷️"}
];
let followedInterests=["Art","Halloween","Horror","Nature","Books","Cozy"],quickInterests=["Art","Halloween","Horror","Nature","Books","Cozy"],draggedInterest=null;
function interestData(n){return allInterests.find(i=>i.name===n)}
function renderSidebarInterests(){
 const list=document.getElementById("interestList");
 list.innerHTML=quickInterests.slice(0,6).map(n=>`<span class="interest-tag" draggable="true" data-interest="${n}">${n}</span>`).join("");
 list.querySelectorAll(".interest-tag").forEach(t=>{
  t.ondragstart=()=>{draggedInterest=t.dataset.interest;t.classList.add("dragging")};
  t.ondragend=()=>{t.classList.remove("dragging");draggedInterest=null};
  t.ondragover=e=>e.preventDefault();
  t.ondrop=e=>{e.preventDefault();promoteQuickInterest(draggedInterest,quickInterests.indexOf(t.dataset.interest))}
 });
 list.ondragover=e=>{e.preventDefault();list.classList.add("drag-target")};
 list.ondragleave=()=>list.classList.remove("drag-target");
 list.ondrop=e=>{e.preventDefault();list.classList.remove("drag-target");if(draggedInterest)promoteQuickInterest(draggedInterest,quickInterests.length)}
}
function promoteQuickInterest(n,pos=0){if(!n||!followedInterests.includes(n))return;quickInterests=quickInterests.filter(x=>x!==n);quickInterests.splice(Math.min(pos,quickInterests.length),0,n);quickInterests=quickInterests.slice(0,6);renderSidebarInterests()}
function toggleInterestSearch(e){e.stopPropagation();const p=document.getElementById("interestSearchPanel");p.classList.toggle("open");if(p.classList.contains("open")){document.getElementById("interestSearchInput").focus();renderInterestSearch(document.getElementById("interestSearchInput").value)}}
function renderInterestSearch(q=""){q=q.trim().toLowerCase();const r=allInterests.filter(i=>!q||i.name.toLowerCase().includes(q)),b=document.getElementById("interestSearchResults");b.innerHTML=r.length?r.map(i=>{const following=followedInterests.includes(i.name);return `<button class="interest-result ${following?"selected":""}" onclick="followInterestFromSearch('${i.name.replace(/'/g,"\\'")}')" ${following?'aria-label="Already following '+i.name+'"':''}>${i.name}</button>`}).join(""):`<span class="interest-search-empty">No matching Interests</span>`}
function followInterestFromSearch(n){if(followedInterests.includes(n))return;followedInterests.unshift(n);renderSidebarInterests();renderInterestSearch(document.getElementById("interestSearchInput").value);renderManageInterests()}
function toggleManageInterests(){const p=document.getElementById("interestManagePanel"),b=document.getElementById("manageInterestsButton");p.classList.toggle("open");const open=p.classList.contains("open");b.classList.toggle("active",open);b.textContent=open?"Cancel":"Manage Hashtag Collections";renderHashtagCollections()}
function toggleYourInterests(){const b=document.getElementById("manageInterestBody"),c=document.getElementById("manageInterestChevron");b.classList.toggle("open");const open=b.classList.contains("open");c.textContent=open?"▴":"▾";if(!open)cancelInterestUnfollow()}
let pendingInterestUnfollow=null,interestWasDragged=false;
function renderManageInterests(){const b=document.getElementById("interestManageList");b.innerHTML=followedInterests.length?followedInterests.map(n=>`<button class="manage-interest-chip ${pendingInterestUnfollow===n?"pending-unfollow":""}" draggable="true" data-interest="${n}" onclick="requestInterestUnfollow('${n.replace(/'/g,"\\'")}')">${n}</button>`).join(""):`<span class="interest-search-empty">You aren't following any Interests yet.</span>`;b.querySelectorAll(".manage-interest-chip").forEach(c=>{c.ondragstart=e=>{interestWasDragged=true;draggedInterest=c.dataset.interest;e.stopPropagation()};c.ondragend=()=>{draggedInterest=null;setTimeout(()=>interestWasDragged=false,0)}})}
function requestInterestUnfollow(n){if(interestWasDragged||!followedInterests.includes(n))return;pendingInterestUnfollow=n;renderManageInterests();const box=document.getElementById("interestUnfollowConfirm");document.getElementById("interestUnfollowMessage").textContent=`Are you sure you want to unfollow ${n}?`;box.classList.add("open")}
function cancelInterestUnfollow(){pendingInterestUnfollow=null;document.getElementById("interestUnfollowConfirm")?.classList.remove("open");renderManageInterests()}
function confirmInterestUnfollow(){if(!pendingInterestUnfollow)return;const n=pendingInterestUnfollow;followedInterests=followedInterests.filter(i=>i!==n);quickInterests=quickInterests.filter(i=>i!==n);cancelInterestUnfollow();renderSidebarInterests();renderManageInterests();renderInterestSearch(document.getElementById("interestSearchInput").value)}

const collectionTags=["#halloweenart","#acrylicpainting","#spookyart","#ghostart","#spookydecor","#homedecor","#wallart","#halloween","#artist","#painting","#darkart","#cozyart","#fallart","#autumn","#illustration","#handmade","#smallartist","#creepycozy","#pumpkinart","#natureart","#crochet","#photography"];
let hashtagCollections=[{name:"Halloween",emoji:"🎃",tags:["#halloweenart","#spookyart","#ghostart"]},{name:"Art",emoji:"🎨",tags:["#acrylicpainting","#artist","#painting"]},{name:"Home Decor",emoji:"🏠",tags:["#spookydecor","#homedecor","#wallart"]}],newTags=[],editIndex=null,editTags=[];
function collectionCountText(n){return `${n} hashtag${n===1?"":"s"} selected`}
function setCollectionValidation(id,message="",success=false){const el=document.getElementById(id);if(!el)return;el.textContent=message;el.classList.toggle("success",!!success)}
function resetCollectionBuilder(){newTags=[];document.getElementById("newCollectionName").value="";document.getElementById("newCollectionSearch").value="";setCollectionValidation("newCollectionValidation");renderNewCollectionTags("")}
function toggleCollectionBuilder(){const b=document.getElementById("collectionBuilder"),opening=!b.classList.contains("open");if(!opening){closeCollectionBuilder();return}cancelEditingCollection();resetCollectionBuilder();b.classList.add("open");document.getElementById("newCollectionName").focus()}
function closeCollectionBuilder(){document.getElementById("collectionBuilder").classList.remove("open");resetCollectionBuilder()}
function tagChoices(id,q,selected,fn){q=q.trim().toLowerCase();let tags=collectionTags.filter(t=>!q||t.includes(q));if(q.startsWith("#")&&!collectionTags.includes(q))tags=[q,...tags];document.getElementById(id).innerHTML=tags.map(t=>`<button type="button" class="collection-hashtag-option ${selected.includes(t)?"selected":""}" onclick="${fn}('${t}')">${t}</button>`).join("")}
function renderNewCollectionTags(q=""){tagChoices("newCollectionHashtags",q,newTags,"toggleNewTag");document.getElementById("newCollectionCount").textContent=collectionCountText(newTags.length)}
function toggleNewTag(t){const i=newTags.indexOf(t);i>=0?newTags.splice(i,1):newTags.push(t);setCollectionValidation("newCollectionValidation");renderNewCollectionTags(document.getElementById("newCollectionSearch").value)}
function createHashtagCollection(){const n=document.getElementById("newCollectionName").value.trim();setCollectionValidation("newCollectionValidation");if(!n){setCollectionValidation("newCollectionValidation","Add a collection name.");return}if(hashtagCollections.some(c=>c.name.toLowerCase()===n.toLowerCase())){setCollectionValidation("newCollectionValidation","That name is already in use.");return}if(!newTags.length){setCollectionValidation("newCollectionValidation","Select at least one hashtag.");return}hashtagCollections.push({name:n,emoji:"🏷️",tags:[...newTags]});closeCollectionBuilder();renderHashtagCollections()}
function renderHashtagCollections(){const b=document.getElementById("hashtagCollectionList");if(b)b.innerHTML=hashtagCollections.map((c,i)=>`<div class="hashtag-collection-row ${editIndex===i?"active":""}" onclick="openCollectionEditor(${i})" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openCollectionEditor(${i})}"><div class="hashtag-collection-name"><div class="collection-row-main"><span class="collection-row-copy">${c.emoji} ${c.name}</span><span class="collection-meta">${c.tags.length} hashtag${c.tags.length===1?"":"s"}</span><span class="collection-edit-label">Edit</span></div></div></div>`).join("");renderComposerHashtagCollections()}
function openCollectionEditor(i){if(!hashtagCollections[i])return;closeCollectionBuilder();editIndex=i;editTags=[...hashtagCollections[i].tags];document.getElementById("collectionEditorTitle").textContent=`Edit ${hashtagCollections[i].emoji} ${hashtagCollections[i].name}`;document.getElementById("editCollectionName").value=hashtagCollections[i].name;document.getElementById("editCollectionSearch").value="";setCollectionValidation("editCollectionValidation");document.getElementById("collectionEditor").classList.add("open");renderEditCollectionTags("");renderHashtagCollections()}
function renderEditCollectionTags(q=""){tagChoices("editCollectionHashtags",q,editTags,"toggleEditTag");document.getElementById("editCollectionCount").textContent=collectionCountText(editTags.length)}
function toggleEditTag(t){const i=editTags.indexOf(t);i>=0?editTags.splice(i,1):editTags.push(t);setCollectionValidation("editCollectionValidation");renderEditCollectionTags(document.getElementById("editCollectionSearch").value)}
function cancelEditingCollection(){editIndex=null;editTags=[];document.getElementById("collectionEditor").classList.remove("open");document.getElementById("editCollectionName").value="";document.getElementById("editCollectionSearch").value="";setCollectionValidation("editCollectionValidation");renderHashtagCollections()}
function saveEditingCollection(){if(editIndex===null)return;const n=document.getElementById("editCollectionName").value.trim();setCollectionValidation("editCollectionValidation");if(!n){setCollectionValidation("editCollectionValidation","Add a collection name.");return}if(hashtagCollections.some((c,i)=>i!==editIndex&&c.name.toLowerCase()===n.toLowerCase())){setCollectionValidation("editCollectionValidation","That name is already in use.");return}if(!editTags.length){setCollectionValidation("editCollectionValidation","Select at least one hashtag.");return}hashtagCollections[editIndex].name=n;hashtagCollections[editIndex].tags=[...editTags];cancelEditingCollection()}
function deleteEditingCollection(){if(editIndex===null)return;const c=hashtagCollections[editIndex];if(!confirm(`Delete the ${c.name} hashtag collection?`))return;hashtagCollections.splice(editIndex,1);cancelEditingCollection()}
document.addEventListener("click",()=>document.getElementById("interestSearchPanel")?.classList.remove("open"));
renderSidebarInterests();renderManageInterests();renderHashtagCollections();

let liked=false; let likeCount=24;
function ensureLikeHeart(button){
    let heart=button.querySelector(":scope > .like-heart");
    if(heart)return heart;
    heart=document.createElement("span");
    heart.className="like-heart";
    heart.setAttribute("aria-hidden","true");
    const textNode=[...button.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&/[♡♥]/.test(node.textContent));
    if(textNode)textNode.textContent=textNode.textContent.replace(/[♡♥]\s*/,"");
    button.insertBefore(heart,button.firstChild);
    return heart;
}
function setLikeState(button,active){
    if(!button)return;
    button.dataset.liked=active?"true":"false";
    ensureLikeHeart(button).textContent=active?"♥":"♡";
}
function prepareLikeButtons(root=document){
    const buttons=[];
    if(root.matches?.(".like-button,.comment-like"))buttons.push(root);
    root.querySelectorAll?.(".like-button,.comment-like").forEach(button=>buttons.push(button));
    buttons.forEach(button=>setLikeState(button,button.dataset.liked==="true"));
}
function toggleLike(){ const b=document.getElementById("likeButton"), c=document.getElementById("likeCount"); liked=!liked; likeCount+=liked?1:-1; setLikeState(b,liked); c.textContent=likeCount; }
function toggleLikeNew(btn){ const s=btn.querySelector(".like-count"); let n=parseInt(s.textContent); const active=btn.dataset.liked!=="true"; setLikeState(btn,active); s.textContent=n+(active?1:-1); }
function toggleCommentLike(b){ const s=b.querySelector("span:not(.like-heart)"); let n=parseInt(s.textContent); const active=b.dataset.liked!=="true"; setLikeState(b,active); s.textContent=n+(active?1:-1); }
prepareLikeButtons();
const feedLikeObserver=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===Node.ELEMENT_NODE)prepareLikeButtons(node)})));
const observedFeed=document.getElementById("feed");if(observedFeed)feedLikeObserver.observe(observedFeed,{childList:true,subtree:true});

/* --- NEW: Counts comments + replies --- */
function getTotalCount(post){
    return post.querySelectorAll(".comments-section .comment-item").length;
}
function updateMoreLink(post){
    // Regular Post V11 owns its own comments toggle text/layout.
    if(post?.classList.contains("regular-post") || post?.classList.contains("blog-post-v11") || post?.classList.contains("video-post-v11")) return;
    const link = post.querySelector(".more-comments");
    if(!link) return;
    const total = getTotalCount(post);
    const isOpen = post.querySelector(".comments-section").classList.contains("active");
    if(isOpen){
        link.textContent = "Hide comments";
    } else {
        link.textContent = `💬 View ${total} more comments`;
    }
}
function toggleComments(button){
    const post = button.closest(".post");
    const cs = post.querySelector(".comments-section");
    cs.classList.toggle("active");
    updateMoreLink(post);
}

function toggleCommentComposerForPost(post){ const c=post.querySelector(".comment-composer"), q=post.querySelector(".comment-button"), b=document.getElementById("addPostButton"), open=c.classList.contains("active"); document.querySelectorAll(".comment-composer.active").forEach(o=>{ o.classList.remove("active"); const p=o.closest(".post"), qb=p&&p.querySelector(".comment-button"); if(qb){ qb.textContent="Leave your opinion…"; qb.classList.remove("active"); } }); if(!open){ c.classList.add("active"); if(q){ q.textContent="Changed my mind…"; q.classList.add("active"); } b.classList.add("open"); b.textContent="−"; c.scrollIntoView({behavior:"smooth",block:"nearest"}); } else { if(q){ q.textContent="Leave your opinion…"; q.classList.remove("active"); } b.classList.remove("open"); b.textContent="+"; } }
function toggleCommentComposer(){ toggleCommentComposerForPost(document.querySelector(".post")); }

function toggleReplyComposer(button){
    const parent = button.closest(".comment-item, .reply-item");
    const composer = parent.querySelector(":scope > .reply-composer");
    const isOpen = composer.classList.contains("active");
    document.querySelectorAll(".reply-composer.active").forEach(o=>o.classList.remove("active"));
    if(!isOpen){ composer.classList.add("active"); composer.querySelector(".reply-input").focus(); }
}
function postReply(button){
    const composer = button.closest(".reply-composer");
    const parent = composer.parentElement;
    const input = composer.querySelector(".reply-input");
    const text = input.value.trim(); if(!text) return;
    let rl = parent.querySelector(":scope > .reply-list");
    if(!rl){ rl=document.createElement("div"); rl.className="reply-list"; parent.insertBefore(rl,composer); }
    const r=document.createElement("div"); r.className="reply-item";
    r.innerHTML=`<div class="reply-author">@yourusername</div><div class="reply-content">${escapeHTML(text)}</div><div class="comment-actions"><button class="comment-like" data-liked="false" onclick="toggleCommentLike(this)">♡ <span>0</span></button><button class="reply-button" onclick="toggleReplyComposer(this)">Reply</button></div><div class="reply-composer"><textarea class="reply-input" placeholder="Reply…"></textarea><div class="reply-submit"><button class="reply-post-button" onclick="postReply(this)">POST</button></div></div>`;
    rl.appendChild(r); input.value=""; composer.classList.remove("active");
    updateMoreLink(parent.closest(".post"));
}
function postComment(){
    const post=document.querySelector(".post"), t=post.querySelector("#commentText"), lc=post.querySelector("#latestComment"), cs=post.querySelector(".comments-section"), text=t.value.trim(); if(!text) return;
    lc.dataset.time="Just now";lc.innerHTML='<span class="comment-username">@yourusername:</span> '+escapeHTML(text);
    const nc=document.createElement("div"); nc.className="comment-item";
    nc.innerHTML=`<div class="comment-author">@yourusername</div><div class="comment-content">${escapeHTML(text)}</div><div class="comment-actions"><button class="comment-like" data-liked="false" onclick="toggleCommentLike(this)">♡ <span>0</span></button><button class="reply-button" onclick="toggleReplyComposer(this)">Reply</button></div><div class="reply-composer"><textarea class="reply-input" placeholder="Reply…"></textarea><div class="reply-submit"><button class="reply-post-button" onclick="postReply(this)">POST</button></div></div>`;
    cs.appendChild(nc); cs.classList.remove("active"); t.value=""; toggleCommentComposerForPost(post);
    updateMoreLink(post);
}
function escapeHTML(text){ const d=document.createElement("div"); d.textContent=text; return d.innerHTML; }
let selectedHashtags=[];
function closeCreatorTools(except=""){if(except!=="topic")document.getElementById("topicPicker")?.classList.remove("open");if(except!=="hashtags")document.getElementById("hashtagPicker")?.classList.remove("open");if(except!=="communities")document.getElementById("communityPicker")?.classList.remove("open");if(except!=="link")document.getElementById("postLinkPanel")?.classList.remove("open")}
function toggleHashtagPicker(){const p=document.getElementById("hashtagPicker"),opening=!p.classList.contains("open");closeCreatorTools("hashtags");p.classList.toggle("open",opening)}
function selectHashtag(b){const t=b.textContent.trim(),i=selectedHashtags.indexOf(t);if(i>=0){selectedHashtags.splice(i,1);b.classList.remove("selected")}else if(selectedHashtags.length<20){selectedHashtags.push(t);b.classList.add("selected")}document.getElementById("hashtagCount").textContent=selectedHashtags.length;document.getElementById("hashtagSummary").textContent=selectedHashtags.length?`${selectedHashtags.length}/20`:"";if(selectedHashtags.length===20)setTimeout(()=>document.getElementById("hashtagPicker").classList.remove("open"),160)}
function filterHashtags(q){q=q.toLowerCase();document.querySelectorAll("#hashtagOptions .hashtag-option").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?"":"none")}
function renderComposerHashtagCollections(){const b=document.getElementById("composerHashtagCollections");if(!b)return;b.innerHTML=hashtagCollections.map((c,i)=>`<button type="button" class="hashtag-option" onclick="applyHashtagCollection(${i})">${c.emoji} ${c.name}</button>`).join("")}
function ensureHashtagOption(tag){const box=document.getElementById("hashtagOptions");let btn=[...box.querySelectorAll(".hashtag-option")].find(b=>b.textContent.trim()===tag);if(!btn){btn=document.createElement("button");btn.type="button";btn.className="hashtag-option";btn.dataset.groups="";btn.textContent=tag;btn.onclick=()=>selectHashtag(btn);box.appendChild(btn)}return btn}
function syncHashtagSelectionUI(){document.querySelectorAll("#hashtagOptions .hashtag-option").forEach(b=>b.classList.toggle("selected",selectedHashtags.includes(b.textContent.trim())));document.getElementById("hashtagCount").textContent=selectedHashtags.length;document.getElementById("hashtagSummary").textContent=selectedHashtags.length?`${selectedHashtags.length}/20`:""}
function applyHashtagCollection(i){const c=hashtagCollections[i];if(!c)return;c.tags.forEach(t=>{ensureHashtagOption(t);if(selectedHashtags.length<20&&!selectedHashtags.includes(t))selectedHashtags.push(t)});const search=document.getElementById("hashtagSearch");if(search)search.value="";document.querySelectorAll("#hashtagOptions .hashtag-option").forEach(b=>b.style.display="");syncHashtagSelectionUI();const p=document.getElementById("hashtagPicker");p.classList.add("open");if(selectedHashtags.length===20)setTimeout(()=>p.classList.remove("open"),160)}
function filterHashtagCollection(g){document.querySelectorAll("#hashtagOptions .hashtag-option").forEach(b=>b.style.display=b.dataset.groups.includes(g)?"":"none")}
function togglePostHashtags(el){const box=el.closest(".post").querySelector(".post-hashtags");box.classList.toggle("active")}
function closePostHashtags(e,btn){e.stopPropagation();btn.closest(".post-hashtags").classList.remove("active")}
function toggleTopicPicker(){const p=document.getElementById("topicPicker"),opening=!p.classList.contains("open");closeCreatorTools("topic");p.classList.toggle("open",opening)}
function selectTopic(btn){const p=document.getElementById("topicPicker"),t=btn.dataset.topic;p.dataset.topic=t;document.getElementById("topicLabel").textContent=btn.textContent.trim();p.querySelectorAll(".topic-option").forEach(b=>b.classList.toggle("selected",b.dataset.topic===t));p.classList.remove("open")}
function filterTopics(q){q=q.toLowerCase();document.querySelectorAll("#topicPicker .topic-option").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?"":"none")}
function toggleCommunityPicker(){const p=document.getElementById("communityPicker"),opening=!p.classList.contains("open");closeCreatorTools("communities");p.classList.toggle("open",opening)}
function selectCommunity(btn){const p=document.getElementById("communityPicker"),on=btn.classList.contains("selected"),sel=[...p.querySelectorAll(".community-picker-option.selected")];if(on)btn.classList.remove("selected");else if(sel.length<2)btn.classList.add("selected");else{const m=document.getElementById("communityLimit");m.classList.add("show");clearTimeout(window.communityLimitTimer);window.communityLimitTimer=setTimeout(()=>m.classList.remove("show"),3000);return}const now=[...p.querySelectorAll(".community-picker-option.selected")];p.dataset.communities=JSON.stringify(now.map(b=>({name:b.dataset.community,label:b.dataset.label})));document.getElementById("communityPickerLabel").textContent=now.length===2?"2 selected":now.length?now[0].dataset.label:"None";document.getElementById("communityLimit").classList.remove("show");if(now.length===2)setTimeout(()=>p.classList.remove("open"),160)}
function filterCommunityPicker(q){q=q.toLowerCase();document.querySelectorAll("#communityPicker .community-picker-option").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?"":"none")}
function showPostWarning(){const w=document.getElementById("postWarning");w.classList.add("show");clearTimeout(window.postWarningTimer);window.postWarningTimer=setTimeout(()=>w.classList.remove("show"),3500)}
let selectedPostMedia=[],composerMediaIndex=0,lightboxItems=[],lightboxIndex=0;
let selectedPostVideo=null;
let editingPost=null,editingPreservedMediaHTML="";
let selectedBlogInlineImage=null,blogInlineDrag=null;
function inferVideoType(file){const n=(file?.name||"").toLowerCase();if(file?.type)return file.type;if(n.endsWith(".mp4")||n.endsWith(".m4v"))return "video/mp4";if(n.endsWith(".webm"))return "video/webm";if(n.endsWith(".mov"))return "video/quicktime";return "video/mp4"}
function setVideoWarning(message=""){const w=document.getElementById("videoPlaybackWarning");if(!w)return;w.textContent=message;w.classList.toggle("show",!!message)}
function handleVideoDrop(event){event.preventDefault();const label=document.getElementById("videoUploadButton"),input=document.getElementById("videoUploadInput");label?.classList.remove("dragging");if(!input||!event.dataTransfer?.files?.length)return;try{input.files=event.dataTransfer.files;previewPostVideo(input)}catch(error){setVideoWarning("That video could not be added. Try clicking the upload area instead.")}}
function previewPostVideo(input){const file=input.files&&input.files[0];if(!file)return;const type=inferVideoType(file);if(!type.startsWith("video/"))return;if(selectedPostVideo?.previewUrl)URL.revokeObjectURL(selectedPostVideo.previewUrl);const blob=file.type===type?file:new Blob([file],{type});const previewUrl=URL.createObjectURL(blob);selectedPostVideo={previewUrl,name:file.name,file,blob,type,duration:0};const p=document.getElementById("videoPreviewPlayer");wireVideoPlaybackControl(p,true);p.pause();p.removeAttribute("src");p.src=previewUrl;p.preload="metadata";p.muted=false;p.currentTime=0;setVideoWarning("");p.onerror=()=>setVideoWarning("This video format/codec cannot be played by this browser. Try MP4 (H.264) or WebM.");p.onloadedmetadata=()=>{selectedPostVideo.duration=p.duration||0;const mode=document.querySelector(".creator-type-tab.active")?.dataset.type||"post";if(mode==="byte"&&p.duration>180.01){setVideoWarning("Bytes can be up to 3 minutes long. Choose a shorter video.");removeByteGeneratedPreview();document.getElementById("byteFramePicker").classList.remove("active");return}setVideoWarning("");p.currentTime=0;if(mode==="byte")setupByteFramePicker(p)};p.load();document.getElementById("videoFileNote").textContent=file.name;document.getElementById("videoPreview").classList.add("active");const shell=p.closest(".video-preview-stage");shell.querySelector(".video-play-toggle").textContent="▶";shell.querySelector(".video-mute-toggle").textContent="🔊";input.value="";}
function removePostVideo(){if(selectedPostVideo?.previewUrl&&!selectedPostVideo.existing)URL.revokeObjectURL(selectedPostVideo.previewUrl);selectedPostVideo=null;const p=document.getElementById("videoPreviewPlayer");p.pause();p.removeAttribute("src");p.load();document.getElementById("videoPreview").classList.remove("active");document.getElementById("videoFileNote").textContent="";setVideoWarning("");document.getElementById("videoUploadInput").value="";document.getElementById("byteFramePicker").classList.remove("active");removeByteGeneratedPreview();}
function byteTime(t){t=Math.max(0,Number(t)||0);const m=Math.floor(t/60),sec=(t-m*60).toFixed(2).padStart(5,"0");return `${m}:${sec}`}
function setupByteFramePicker(video){if(!video||!Number.isFinite(video.duration))return;const picker=document.getElementById("byteFramePicker"),range=document.getElementById("byteFrameRange"),t=Math.min(Number(range.value)||0,Math.max(0,video.duration-.001));picker.classList.add("active");range.max=Math.max(0,video.duration-.001);range.value=t;updateByteFrameTime();if(video.readyState>=2)captureByteFrame(t);else video.addEventListener("loadeddata",()=>captureByteFrame(t),{once:true})}
function updateByteFrameTime(){const r=document.getElementById("byteFrameRange"),d=selectedPostVideo?.duration||0;document.getElementById("byteFrameTime").textContent=`${byteTime(r.value)} / ${byteTime(d)}`}
function seekByteFrame(value){const p=document.getElementById("videoPreviewPlayer");if(!selectedPostVideo||!Number.isFinite(p.duration))return;p.pause();const t=Math.max(0,Math.min(Number(value)||0,Math.max(0,p.duration-.001)));document.getElementById("byteFrameRange").value=t;updateByteFrameTime();captureByteFrame(t)}
function stepByteFrame(dir){const r=document.getElementById("byteFrameRange"),fpsStep=1/30;seekByteFrame((Number(r.value)||0)+(dir*fpsStep))}
function captureByteFrame(time){const p=document.getElementById("videoPreviewPlayer");if(!selectedPostVideo||!p.videoWidth)return;const draw=()=>{try{const c=document.createElement("canvas");c.width=p.videoWidth;c.height=p.videoHeight;const x=c.getContext("2d");x.drawImage(p,0,0,c.width,c.height);const url=c.toDataURL("image/jpeg",.92),old=selectedPostMedia[0];selectedPostMedia=[{url,x:old?.x??50,y:old?.y??50,zoom:old?.zoom??100,mode:"byte",generated:true}];composerMediaIndex=0;renderComposerMedia()}catch(e){console.error("Could not capture Byte preview frame",e)}};if(Math.abs(p.currentTime-time)<.002){if(p.readyState>=2)draw();else p.addEventListener("loadeddata",draw,{once:true});return}const done=()=>draw();p.addEventListener("seeked",done,{once:true});try{p.currentTime=time}catch{}}
function removeByteGeneratedPreview(){if(selectedPostMedia[0]?.generated){selectedPostMedia=[];composerMediaIndex=0;renderComposerMedia()}}
function setVideoPlayState(button,playing){if(!button)return;if(button.classList.contains("video-control-play"))button.innerHTML=videoControlIcon(playing?"pause":"play");else button.textContent=playing?"❚❚":"▶";button.classList.toggle("playing",playing);button.setAttribute("aria-label",playing?"Pause video":"Play video");button.title=playing?"Pause":"Play"}
async function toggleVideoPlayback(video,event){if(!video)return;if(event){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.()}const now=Date.now(),last=Number(video.dataset.lastPlaybackRequest||0);if(now-last<700)return;video.dataset.lastPlaybackRequest=String(now);const shell=video.closest(".video-preview-stage,.video-feed-player"),play=shell?.querySelector(".video-control-play")||shell?.querySelector(".video-play-toggle"),poster=shell?.querySelector(".video-feed-poster"),wantsPlay=video.dataset.requestedPlaying!=="true";video.dataset.requestedPlaying=String(wantsPlay);try{if(wantsPlay){if(video.ended||(Number.isFinite(video.duration)&&video.duration>0&&video.currentTime>=video.duration-.08))video.currentTime=0;await video.play();if(poster)poster.classList.add("hidden");setVideoPlayState(play,true)}else{video.pause();setVideoPlayState(play,false)}}catch(err){video.dataset.requestedPlaying="false";console.error("Video playback failed:",err);setVideoPlayState(play,false);const warning=shell?.querySelector(".video-playback-warning");if(warning){warning.textContent="This browser cannot play this video file.";warning.classList.add("show")}}}
function wireVideoPlaybackControl(video,includeVideo=false){if(!video)return;const shell=video.closest(".video-preview-stage,.video-feed-player"),button=shell?.querySelector(".video-control-play")||shell?.querySelector(".video-play-toggle"),poster=shell?.querySelector(".video-feed-poster");if(button&&button.dataset.playWired!=="true"){button.dataset.playWired="true";button.addEventListener("click",event=>toggleVideoPlayback(video,event))}if(poster&&poster.dataset.playWired!=="true"){poster.dataset.playWired="true";poster.addEventListener("click",event=>{toggleVideoPlayback(video,event);showVideoControls(shell);scheduleVideoControlsHide(shell)})}if(includeVideo&&!shell?.querySelector(".video-control-overlay")&&video.dataset.playWired!=="true"){video.dataset.playWired="true";video.addEventListener("click",event=>toggleVideoPlayback(video,event))}if(video.dataset.playStateWired!=="true"){video.dataset.playStateWired="true";video.addEventListener("pause",()=>{if(video.dataset.requestedPlaying==="true"&&!video.ended){window.setTimeout(()=>{if(video.dataset.requestedPlaying==="true"&&video.paused)video.play().catch(()=>{})},0)}});video.addEventListener("ended",()=>{video.dataset.requestedPlaying="false"})}}
function syncCreatorVideoControls(video){const shell=video?.closest(".video-preview-stage");if(!shell)return;if(!shell.querySelector(".video-control-overlay"))shell.insertAdjacentHTML("beforeend",videoControlHTML());wireVideoPlaybackControl(video);if(shell.dataset.controlsWired==="true")return;shell.dataset.controlsWired="true";const play=shell.querySelector(".video-control-play");play.addEventListener("pointerdown",()=>{showVideoControls(shell);scheduleVideoControlsHide(shell)});video.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();toggleVideoPlayback(video,event);showVideoControls(shell);scheduleVideoControlsHide(shell)});shell.addEventListener("click",event=>{if(event.target.closest("button,input,video"))return;showVideoControls(shell);scheduleVideoControlsHide(shell)});shell.addEventListener("mouseenter",()=>{showVideoControls(shell);scheduleVideoControlsHide(shell)});shell.addEventListener("mousemove",()=>{showVideoControls(shell);scheduleVideoControlsHide(shell)});shell.addEventListener("mouseleave",()=>scheduleVideoControlsHide(shell,250));shell.querySelector(".video-control-scrubber")?.addEventListener("input",event=>{seekFeedVideo(event.target);scheduleVideoControlsHide(shell)});video.addEventListener("loadedmetadata",()=>updateFeedVideoProgress(video));video.addEventListener("durationchange",()=>updateFeedVideoProgress(video));video.addEventListener("timeupdate",()=>updateFeedVideoProgress(video));video.addEventListener("play",()=>setVideoPlayState(play,true));video.addEventListener("pause",()=>{if(!video.ended&&video.dataset.requestedPlaying!=="true"){setVideoPlayState(play,false);showVideoControls(shell)}});video.addEventListener("ended",()=>{video.currentTime=0;setVideoPlayState(play,false);showVideoControls(shell)});video.addEventListener("volumechange",()=>{const mute=shell.querySelector(".video-control-mute");if(mute){mute.innerHTML=videoControlIcon(video.muted?"muted":"volume");mute.setAttribute("aria-label",video.muted?"Unmute video":"Mute video")}})}
function syncFeedVideoControls(video){const shell=video?.closest(".video-feed-player");if(!shell)return;const poster=shell.querySelector(".video-feed-poster"),warning=shell.querySelector(".video-playback-warning"),feedOverlay=!!shell.closest(".post.video-post,.post.byte-post,.post.video-post-v11");if(feedOverlay&&!shell.querySelector(".video-control-overlay")){shell.insertAdjacentHTML("beforeend",videoControlHTML())}const overlayPlay=shell.querySelector(".video-control-play")||shell.querySelector(".video-play-toggle");wireVideoPlaybackControl(video);setVideoPlayState(overlayPlay,false);if(feedOverlay){overlayPlay?.addEventListener("pointerdown",()=>{showVideoControls(shell);scheduleVideoControlsHide(shell)});video.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();toggleVideoPlayback(video,event);showVideoControls(shell);scheduleVideoControlsHide(shell)});shell.addEventListener("click",event=>{if(event.target.closest("button,input,video"))return;showVideoControls(shell);scheduleVideoControlsHide(shell)});shell.addEventListener("mouseenter",()=>{showVideoControls(shell);scheduleVideoControlsHide(shell)});shell.addEventListener("mousemove",()=>{showVideoControls(shell);scheduleVideoControlsHide(shell)});shell.addEventListener("mouseleave",()=>scheduleVideoControlsHide(shell,250));shell.querySelector(".video-control-scrubber")?.addEventListener("input",event=>{seekFeedVideo(event.target);scheduleVideoControlsHide(shell)})}video.addEventListener("loadedmetadata",()=>updateFeedVideoProgress(video));video.addEventListener("durationchange",()=>updateFeedVideoProgress(video));video.addEventListener("timeupdate",()=>updateFeedVideoProgress(video));video.addEventListener("play",()=>{if(poster)poster.classList.add("hidden");setVideoPlayState(overlayPlay,true)});video.addEventListener("pause",()=>{if(!video.ended&&video.dataset.requestedPlaying!=="true"){setVideoPlayState(overlayPlay,false);showVideoControls(shell)}});video.addEventListener("ended",()=>{video.currentTime=0;setVideoPlayState(overlayPlay,false);showVideoControls(shell)});video.addEventListener("volumechange",()=>{const mute=shell.querySelector(".video-control-mute");if(mute){mute.innerHTML=videoControlIcon(video.muted?"muted":"volume");mute.setAttribute("aria-label",video.muted?"Unmute video":"Mute video")}if(feedOverlay){showVideoControls(shell);scheduleVideoControlsHide(shell)}});video.addEventListener("error",()=>{setVideoPlayState(overlayPlay,false);if(warning){warning.textContent="This video format/codec cannot be played by this browser. Try MP4 (H.264) or WebM.";warning.classList.add("show")}});video.load()}
function videoControlIcon(name){const icons={play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>',volume:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h4l5 4V6L9 10H5zM17 9c1.4 1.6 1.4 4.4 0 6"/></svg>',muted:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h4l5 4V6L9 10H5zM17 10l4 4M21 10l-4 4"/></svg>',fullscreen:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"/></svg>'};return icons[name]||""}
function videoControlHTML(){return `<div class="video-control-overlay"><div class="video-control-row"><button type="button" class="video-control-button video-control-play" aria-label="Play video">${videoControlIcon("play")}</button><button type="button" class="video-control-button video-control-mute" onclick="event.stopPropagation();toggleVideoMute(this)" aria-label="Mute video">${videoControlIcon("volume")}</button><span class="video-control-time video-elapsed">0:00</span><input class="video-control-scrubber" type="range" min="0" max="100" step="0.1" value="0" aria-label="Video timeline"><span class="video-control-time video-total">0:00</span><button type="button" class="video-control-button video-control-fullscreen" onclick="event.stopPropagation();toggleVideoFullscreen(this)" aria-label="Enter fullscreen">${videoControlIcon("fullscreen")}</button></div></div>`}
function formatVideoTime(seconds){seconds=Math.max(0,Number(seconds)||0);const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),secs=Math.floor(seconds%60).toString().padStart(2,"0");return hours?`${hours}:${minutes.toString().padStart(2,"0")}:${secs}`:`${minutes}:${secs}`}
function updateFeedVideoProgress(video){const shell=video.closest(".video-feed-player,.video-preview-stage"),scrubber=shell?.querySelector(".video-control-scrubber"),elapsed=shell?.querySelector(".video-elapsed"),total=shell?.querySelector(".video-total"),duration=Number.isFinite(video.duration)?video.duration:0,progress=duration?video.currentTime/duration*100:0;if(scrubber){scrubber.value=progress;scrubber.style.setProperty("--video-progress",`${progress}%`)}if(elapsed)elapsed.textContent=formatVideoTime(video.currentTime);if(total)total.textContent=formatVideoTime(duration)}
function seekFeedVideo(scrubber){const shell=scrubber.closest(".video-feed-player,.video-preview-stage"),video=shell?.querySelector("video");if(!video||!Number.isFinite(video.duration))return;video.currentTime=video.duration*(Number(scrubber.value)||0)/100;updateFeedVideoProgress(video);showVideoControls(shell)}
function showVideoControls(shell){if(!shell)return;clearTimeout(shell._videoControlsTimer);shell.classList.add("controls-visible")}
function scheduleVideoControlsHide(shell,delay=700){if(!shell)return;clearTimeout(shell._videoControlsTimer);shell._videoControlsTimer=setTimeout(()=>shell.classList.remove("controls-visible"),delay)}
function toggleVideoFullscreen(button){const shell=button.closest(".video-feed-player,.video-preview-stage");if(!shell)return;if(document.fullscreenElement||document.webkitFullscreenElement){(document.exitFullscreen||document.webkitExitFullscreen)?.call(document)}else{(shell.requestFullscreen||shell.webkitRequestFullscreen)?.call(shell)}showVideoControls(shell);scheduleVideoControlsHide(shell)}
function toggleVideoMute(btn){const shell=btn.closest(".video-preview-stage,.video-feed-player"),video=shell?.querySelector("video");if(!video)return;video.muted=!video.muted;if(btn.classList.contains("video-control-mute"))btn.innerHTML=videoControlIcon(video.muted?"muted":"volume");else btn.textContent=video.muted?"🔇":"🔊";btn.setAttribute("aria-label",video.muted?"Unmute video":"Mute video");if(btn.classList.contains("video-control-mute")){showVideoControls(shell);scheduleVideoControlsHide(shell)}}
function updatePreviewSizeNote(){const note=document.getElementById("previewSizeNote");if(!note)return;const mode=document.querySelector(".creator-type-tab.active")?.dataset.type||"post";if(mode==="video"){note.textContent="Preview image: 1280 × 720 px (16:9) fits exactly.";return}if(mode==="byte"){note.textContent="Optional Byte preview: 1080 × 1920 px (9:16) fits exactly.";return}if(mode==="blog"){note.textContent="Home preview: 1280 × 720 px (16:9) fits exactly.";return}note.textContent=""}
let postMediaWarningTimer=null;
function clearPostMediaWarning(){const warning=document.getElementById("postMediaWarning");if(!warning)return;clearTimeout(postMediaWarningTimer);warning.classList.remove("show");warning.textContent="Up to 6 images per Post."}
function showPostMediaWarning(addedCount,existingCount){const warning=document.getElementById("postMediaWarning");if(!warning)return;clearTimeout(postMediaWarningTimer);warning.textContent=addedCount>0?existingCount?`Posts can include up to 6 images. Only ${addedCount} more ${addedCount===1?"image was":"images were"} added.`:`Posts can include up to 6 images. Only the first ${addedCount} images were added.`:"Posts can include up to 6 images. Remove one before adding another.";warning.classList.add("show");postMediaWarningTimer=setTimeout(()=>clearPostMediaWarning(),6000)}
function handlePostMediaDrop(event){event.preventDefault();const zone=document.getElementById("mediaEmptyUpload"),input=document.getElementById("postMediaInput");zone?.classList.remove("dragging");if(!input||!event.dataTransfer?.files?.length)return;try{input.files=event.dataTransfer.files;previewPostMedia(input)}catch(error){showPostMediaWarning(0,selectedPostMedia.length)}}
function previewPostMedia(input){const files=[...(input.files||[])].filter(f=>f.type.startsWith("image/"));if(!files.length)return;const mode=document.querySelector(".creator-type-tab.active")?.dataset.type||"post",max=(mode==="blog"||mode==="video"||mode==="byte")?1:6,existingCount=selectedPostMedia.length,room=max-existingCount,added=files.slice(0,Math.max(0,room));added.forEach(f=>selectedPostMedia.push({url:URL.createObjectURL(f),x:50,y:50,zoom:100,mode:mode==="video"||mode==="blog"?"landscape":mode==="byte"?"byte":"fit",expand:true}));input.value="";composerMediaIndex=Math.max(0,selectedPostMedia.length-added.length);renderComposerMedia();if(mode==="post"&&files.length>added.length)showPostMediaWarning(added.length,existingCount);else clearPostMediaWarning()}
function composerImageStyle(m){const fit=m.mode==="fit"?"contain":"cover",zoom=(m.zoom||100)/100,panRatio=Math.max(0,(zoom-1)/zoom),usesTransformPan=m.mode==="fit"||m.mode==="square"||m.mode==="byte",positionTransform=usesTransformPan?`translate(${(50-(Number(m.x)??50))*panRatio}%,${(50-(Number(m.y)??50))*panRatio}%) `:"",position=usesTransformPan?"50% 50%":`${m.x}% ${m.y}%`;return `object-fit:${fit};object-position:${position};transform:${positionTransform}scale(${zoom})`}
function composerStageClass(m){return `composer-media-stage ${m.mode||"fit"}`}
function renderComposerMedia(){const box=document.getElementById("postMediaPreview"),track=document.getElementById("composerMediaTrack"),dots=document.getElementById("composerMediaDots"),thumbs=document.getElementById("composerMediaThumbs"),summary=document.getElementById("postMediaSummary"),note=document.getElementById("postMediaCountNote"),reorderHint=document.getElementById("mediaReorderHint"),n=selectedPostMedia.length;if(!n){box.classList.remove("active");track.innerHTML="";dots.innerHTML="";thumbs.innerHTML="";summary.textContent="";note.textContent="";reorderHint.classList.remove("show");document.getElementById("cropPanel").classList.remove("open");syncCropToggleLabel();return}composerMediaIndex=Math.min(composerMediaIndex,n-1);box.classList.add("active");const editing=document.getElementById("cropPanel").classList.contains("open"),creatorMode=document.querySelector(".creator-type-tab.active")?.dataset.type||"post",maxMedia=(creatorMode==="blog"||creatorMode==="video"||creatorMode==="byte")?1:6;track.innerHTML=selectedPostMedia.map((m,i)=>`<div class="media-slide"><div class="${composerStageClass(m)} ${editing&&i===composerMediaIndex?"drag-enabled":""}" data-media-index="${i}"><img src="${m.url}" alt="Selected image ${i+1} of ${n}" style="${composerImageStyle(m)}"></div></div>`).join("");track.style.transform=`translateX(-${composerMediaIndex*100}%)`;dots.innerHTML=n>1?selectedPostMedia.map((_,i)=>`<button type="button" class="carousel-dot ${i===composerMediaIndex?"active":""}" onclick="goComposerMedia(${i})" aria-label="View photo ${i+1}"></button>`).join(""):"";thumbs.innerHTML=selectedPostMedia.map((m,i)=>`<div class="media-thumb-wrap"><button type="button" class="media-thumb ${i===composerMediaIndex?"active":""}" onclick="goComposerMedia(${i})" aria-label="Select photo ${i+1}"><img src="${m.url}" alt="Thumbnail ${i+1}"></button><button type="button" class="media-thumb-remove" onclick="removePostMediaAt(${i},event)" aria-label="Remove photo ${i+1}" title="Remove photo ${i+1}">×</button></div>`).join("")+(creatorMode==="post"&&n<maxMedia?`<button type="button" class="media-add-tile" onclick="document.getElementById('postMediaInput').click()" aria-label="Add another image" title="Add another image">＋</button>`:"");document.getElementById("composerMediaPrev").hidden=n<2;document.getElementById("composerMediaNext").hidden=n<2;summary.textContent=creatorMode==="byte"?"":`${n}/${maxMedia}`;note.textContent=creatorMode==="blog"?"Home preview image":creatorMode==="video"?"Video preview image":creatorMode==="byte"?"":`${composerMediaIndex+1} of ${n} photos`;reorderHint.classList.toggle("show",creatorMode==="post"&&n>1);syncCropToggleLabel();syncCropControls();wireComposerDrag();wireComposerMediaReorder();updatePreviewSizeNote()}
function moveComposerMedia(d){const n=selectedPostMedia.length;if(n<2)return;composerMediaIndex=(composerMediaIndex+d+n)%n;renderComposerMedia()}
function goComposerMedia(i){composerMediaIndex=i;renderComposerMedia()}
function removeCurrentPostMedia(){if(!selectedPostMedia.length)return;URL.revokeObjectURL(selectedPostMedia[composerMediaIndex].url);selectedPostMedia.splice(composerMediaIndex,1);if(composerMediaIndex>=selectedPostMedia.length)composerMediaIndex=Math.max(0,selectedPostMedia.length-1);renderComposerMedia()}
function removePostMediaAt(index,event){event?.stopPropagation();if(index<0||index>=selectedPostMedia.length)return;const media=selectedPostMedia[index];if(!media.existing&&media.url&&!media.url.startsWith("data:"))URL.revokeObjectURL(media.url);selectedPostMedia.splice(index,1);if(index<composerMediaIndex)composerMediaIndex--;else if(composerMediaIndex>=selectedPostMedia.length)composerMediaIndex=Math.max(0,selectedPostMedia.length-1);renderComposerMedia()}
function removePostMedia(){selectedPostMedia.forEach(m=>URL.revokeObjectURL(m.url));selectedPostMedia=[];composerMediaIndex=0;document.getElementById("postMediaInput").value="";renderComposerMedia()}
function syncCropToggleLabel(){const panel=document.getElementById("cropPanel"),button=document.getElementById("cropToggle"),open=panel?.classList.contains("open");if(!button)return;button.textContent=open?"← Cancel adjustment":"✦ Adjust thumbnail";button.classList.toggle("cancel-adjustment",!!open);button.setAttribute("aria-expanded",String(!!open))}
function toggleCropPanel(force){if(!selectedPostMedia.length)return;const p=document.getElementById("cropPanel"),opening=force===false?false:!p.classList.contains("open"),creatorMode=document.querySelector(".creator-type-tab.active")?.dataset.type||"post";if(opening&&creatorMode==="byte"&&(selectedPostMedia[composerMediaIndex].zoom||100)<=100)selectedPostMedia[composerMediaIndex].zoom=110;if(force===false)p.classList.remove("open");else p.classList.toggle("open");syncCropToggleLabel();renderComposerMedia()}
function syncSwitchStatus(input){if(!input)return;const status=input.closest(".setting-switch")?.querySelector(".switch-status");if(status)status.textContent=input.checked?"On":"Off"}
function syncCropControls(){if(!selectedPostMedia.length)return;const m=selectedPostMedia[composerMediaIndex];const z=document.getElementById("cropZoom");z.value=m.zoom||100;document.getElementById("cropZoomVal").textContent=`${m.zoom||100}%`;document.querySelectorAll("#thumbModes .thumb-mode").forEach(b=>b.classList.toggle("active",b.dataset.mode===(m.mode||"fit")))}
function setThumbMode(mode){if(!selectedPostMedia.length)return;const creatorMode=document.querySelector(".creator-type-tab.active")?.dataset.type||"post";if(creatorMode==="video")mode="landscape";if(creatorMode==="byte")mode="byte";const m=selectedPostMedia[composerMediaIndex];m.mode=mode;m.x=50;m.y=50;if(!m.zoom)m.zoom=100;document.getElementById("cropPanel").classList.add("open");renderComposerMedia()}
function updateCurrentZoom(){if(!selectedPostMedia.length)return;const m=selectedPostMedia[composerMediaIndex];m.zoom=Number(document.getElementById("cropZoom").value);document.getElementById("cropZoomVal").textContent=`${m.zoom}%`;applyComposerMediaStyle()}
function applyComposerMediaStyle(){const m=selectedPostMedia[composerMediaIndex],img=document.querySelector(`#composerMediaTrack .media-slide:nth-child(${composerMediaIndex+1}) img`);if(img)img.style.cssText=composerImageStyle(m)}
function wireComposerDrag(){const stage=document.querySelector(`#composerMediaTrack .media-slide:nth-child(${composerMediaIndex+1}) .composer-media-stage.drag-enabled`);if(!stage)return;let sx=0,sy=0,startX=0,startY=0,dragging=false;stage.onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;dragging=true;sx=e.clientX;sy=e.clientY;const m=selectedPostMedia[composerMediaIndex];startX=m.x;startY=m.y;stage.classList.add("dragging");stage.setPointerCapture?.(e.pointerId);e.preventDefault()};stage.onpointermove=e=>{if(!dragging)return;const m=selectedPostMedia[composerMediaIndex],r=stage.getBoundingClientRect(),dx=e.clientX-sx,dy=e.clientY-sy;m.x=Math.max(0,Math.min(100,startX-(dx/Math.max(r.width,1))*100));m.y=Math.max(0,Math.min(100,startY-(dy/Math.max(r.height,1))*100));applyComposerMediaStyle()};const stop=e=>{if(!dragging)return;dragging=false;stage.classList.remove("dragging");try{stage.releasePointerCapture?.(e.pointerId)}catch{}};stage.onpointerup=stop;stage.onpointercancel=stop}
let composerMediaReorderIndex=null;
function wireComposerMediaReorder(){const mode=document.querySelector(".creator-type-tab.active")?.dataset.type||"post",wraps=[...document.querySelectorAll("#composerMediaThumbs .media-thumb-wrap")];if(mode!=="post"||wraps.length<2)return;wraps.forEach((wrap,index)=>{wrap.draggable=true;wrap.dataset.mediaIndex=index;wrap.addEventListener("dragstart",event=>{if(event.target.closest(".media-thumb-remove")){event.preventDefault();return}composerMediaReorderIndex=index;wrap.classList.add("dragging");event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",String(index))});wrap.addEventListener("dragover",event=>{event.preventDefault();event.dataTransfer.dropEffect="move";wraps.forEach(item=>item.classList.remove("reorder-target"));if(index!==composerMediaReorderIndex)wrap.classList.add("reorder-target")});wrap.addEventListener("drop",event=>{event.preventDefault();if(composerMediaReorderIndex===null||composerMediaReorderIndex===index)return;const selected=selectedPostMedia[composerMediaIndex],moved=selectedPostMedia.splice(composerMediaReorderIndex,1)[0];selectedPostMedia.splice(index,0,moved);composerMediaIndex=selectedPostMedia.indexOf(selected);composerMediaReorderIndex=null;renderComposerMedia()});wrap.addEventListener("dragend",()=>{composerMediaReorderIndex=null;wraps.forEach(item=>item.classList.remove("dragging","reorder-target"))})})}
function resetCurrentCrop(){if(!selectedPostMedia.length)return;const creatorMode=document.querySelector(".creator-type-tab.active")?.dataset.type||"post";Object.assign(selectedPostMedia[composerMediaIndex],{x:50,y:50,zoom:100,mode:creatorMode==="video"||creatorMode==="blog"?"landscape":creatorMode==="byte"?"byte":"fit"});document.getElementById("cropPanel").classList.add("open");renderComposerMedia()}
function movePostCarousel(btn,d){const c=btn.closest(".media-carousel"),track=c.querySelector(".media-carousel-track"),slides=c.querySelectorAll(".media-slide"),dots=c.parentElement.querySelectorAll(".carousel-dot");if(slides.length<2)return;let i=Number(c.dataset.index||0);i=(i+d+slides.length)%slides.length;c.dataset.index=i;track.style.transform=`translateX(-${i*100}%)`;dots.forEach((dot,j)=>dot.classList.toggle("active",j===i))}
function goPostCarousel(dot,i){const wrap=dot.closest(".post-image"),c=wrap.querySelector(".media-carousel"),track=c.querySelector(".media-carousel-track");c.dataset.index=i;track.style.transform=`translateX(-${i*100}%)`;wrap.querySelectorAll(".carousel-dot").forEach((d,j)=>d.classList.toggle("active",j===i))}
function wirePostCarouselSwipe(carousel){if(carousel.dataset.swipeWired==="true")return;carousel.dataset.swipeWired="true";let startX=null;carousel.addEventListener("touchstart",e=>{startX=e.touches[0].clientX},{passive:true});carousel.addEventListener("touchend",e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX;startX=null;if(Math.abs(dx)>45){const btn=carousel.querySelector(dx<0?".carousel-arrow.next":".carousel-arrow.prev");if(btn)movePostCarousel(btn,dx<0?1:-1)}},{passive:true});const post=carousel.closest(".post"),regularPost=post&&!post.classList.contains("blog-post")&&!post.classList.contains("video-post")&&!post.classList.contains("byte-post");if(!regularPost||carousel.querySelectorAll(".media-slide").length<2)return;carousel.classList.add("drag-ready");let pointerId=null,pointerStart=0,startIndex=0,dragged=false;carousel.addEventListener("pointerdown",event=>{if(event.pointerType!=="mouse"||event.button!==0||event.target.closest("button"))return;pointerId=event.pointerId;pointerStart=event.clientX;startIndex=Number(carousel.dataset.index||0);dragged=false;carousel.setPointerCapture?.(pointerId)});carousel.addEventListener("pointermove",event=>{if(event.pointerId!==pointerId)return;const dx=event.clientX-pointerStart;if(Math.abs(dx)>6){dragged=true;carousel.classList.add("dragging");event.preventDefault()}if(dragged){const track=carousel.querySelector(".media-carousel-track");track.style.transform=`translateX(calc(-${startIndex*100}% + ${dx}px))`}});const finish=event=>{if(event.pointerId!==pointerId)return;const dx=event.clientX-pointerStart;try{carousel.releasePointerCapture?.(pointerId)}catch{}pointerId=null;carousel.classList.remove("dragging");if(dragged&&Math.abs(dx)>45){carousel.dataset.suppressClick="true";const btn=carousel.querySelector(dx<0?".carousel-arrow.next":".carousel-arrow.prev");if(btn)movePostCarousel(btn,dx<0?1:-1)}else carousel.querySelector(".media-carousel-track").style.transform=`translateX(-${startIndex*100}%)`;if(dragged)setTimeout(()=>delete carousel.dataset.suppressClick,0);dragged=false};carousel.addEventListener("pointerup",finish);carousel.addEventListener("pointercancel",finish)}
function openPostImage(frame,event){if(event)event.stopPropagation();const carousel=frame.closest(".feed-carousel");if(carousel.dataset.suppressClick==="true"){delete carousel.dataset.suppressClick;return}const slides=[...carousel.querySelectorAll(".feed-media-frame")];lightboxItems=slides.map(x=>x.dataset.full);lightboxIndex=slides.indexOf(frame);renderLightbox();document.getElementById("imageLightbox").classList.add("open")}
function renderLightbox(){if(!lightboxItems.length)return;document.getElementById("lightboxImage").src=lightboxItems[lightboxIndex];document.getElementById("lightboxPrev").hidden=lightboxItems.length<2;document.getElementById("lightboxNext").hidden=lightboxItems.length<2;document.getElementById("lightboxDots").innerHTML=lightboxItems.length>1?lightboxItems.map((_,i)=>`<button type="button" class="lightbox-dot ${i===lightboxIndex?"active":""}" onclick="goLightbox(${i})" aria-label="View full photo ${i+1}"></button>`).join(""):""}
function moveLightbox(d){if(lightboxItems.length<2)return;lightboxIndex=(lightboxIndex+d+lightboxItems.length)%lightboxItems.length;renderLightbox()}
function goLightbox(i){lightboxIndex=i;renderLightbox()}
function closeImageLightbox(){document.getElementById("imageLightbox").classList.remove("open");document.getElementById("lightboxImage").src="";lightboxItems=[]}
function lightboxBackdropClose(e){if(e.target===document.getElementById("imageLightbox"))closeImageLightbox()}
document.addEventListener("keydown",e=>{if(!document.getElementById("imageLightbox").classList.contains("open"))return;if(e.key==="Escape")closeImageLightbox();if(e.key==="ArrowLeft")moveLightbox(-1);if(e.key==="ArrowRight")moveLightbox(1)});
document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll(".media-carousel.feed-carousel").forEach(wirePostCarouselSwipe));
function togglePostLink(){const p=document.getElementById("postLinkPanel"),opening=!p.classList.contains("open");closeCreatorTools("link");p.classList.toggle("open",opening);if(opening)document.getElementById("postLinkInput").focus()}
function updatePostLinkSummary(){const v=document.getElementById("postLinkInput").value.trim(),shown=v?displayAttachedLink(v):"";document.getElementById("postLinkSummary").textContent=shown;document.getElementById("postLinkDisplay").textContent=v?v:"Your link will appear here."}
function completePostLink(){const input=document.getElementById("postLinkInput"),url=normalizeAttachedLink(input.value);if(!url)return;input.value=url;updatePostLinkSummary();setTimeout(()=>document.getElementById("postLinkPanel").classList.remove("open"),160)}
function removePostLink(){document.getElementById("postLinkInput").value="";document.getElementById("postLinkPanel").classList.remove("open");updatePostLinkSummary()}
function normalizeAttachedLink(v){v=v.trim();if(!v)return "";try{return new URL(/^https?:\/\//i.test(v)?v:"https://"+v).href}catch{return ""}}
function displayAttachedLink(v){return v.replace(/^https?:\/\//i,"").replace(/\/$/,"")}
function updatePostCharCount(){const ta=document.getElementById("mainPostText"),counter=document.getElementById("postCharCount");if(!ta||!counter)return;const limit=ta.maxLength||500,n=ta.value.length;counter.textContent=`${n} / ${limit.toLocaleString()}`;const near=Math.floor(limit*.9);counter.classList.toggle("near",n>=near&&n<limit);counter.classList.toggle("limit",n>=limit)}
function blogPlainText(){const e=document.getElementById("blogBodyEditor");return e?(e.innerText||"").replace(/\n{3,}/g,"\n\n").trim():""}
function blogMeaningfulLength(){const e=document.getElementById("blogBodyEditor");return e?(e.innerText||"").replace(/\s+/g," ").trim().length:0}
function updateBlogBodyCount(){const e=document.getElementById("blogBodyEditor"),c=document.getElementById("blogBodyCount");if(!e||!c)return;let text=e.innerText||"";if(text.length>35000){const sel=window.getSelection();e.innerText=text.slice(0,35000);text=e.innerText||"";try{sel.selectAllChildren(e);sel.collapseToEnd()}catch{}}const n=text.length,meaningful=blogMeaningfulLength(),belowMinimum=meaningful<1000;c.textContent=belowMinimum?`${meaningful.toLocaleString()} / 1,000 minimum`:`${n.toLocaleString()} characters`;c.classList.toggle("minimum",belowMinimum);c.classList.toggle("near",n>=31500&&n<35000);c.classList.toggle("limit",n>=35000)}
function makeBlogInlineFigure(img){const figure=document.createElement("figure");figure.className="blog-inline-media layout-full crop-original";figure.contentEditable="false";figure.dataset.layout="full";figure.dataset.crop="original";figure.dataset.x="50";figure.dataset.y="50";figure.dataset.zoom="100";img.alt=img.alt||"Blog image";figure.appendChild(img);applyBlogInlineImageStyle(figure);return figure}
function prepareBlogInlineImages(){const editor=document.getElementById("blogBodyEditor");[...editor.querySelectorAll("img")].forEach(img=>{let figure=img.closest(".blog-inline-media");if(!figure){const parent=img.parentNode,next=img.nextSibling;figure=makeBlogInlineFigure(img);parent.insertBefore(figure,next)}else{figure.contentEditable="false";figure.dataset.layout=figure.dataset.layout||(["left","right","full"].find(x=>figure.classList.contains("layout-"+x))||"full");figure.dataset.crop=figure.dataset.crop||(["landscape","portrait","square","original"].find(x=>figure.classList.contains("crop-"+x))||"original");figure.dataset.x=figure.dataset.x||"50";figure.dataset.y=figure.dataset.y||"50";figure.dataset.zoom=figure.dataset.zoom||"100";applyBlogInlineImageStyle(figure)}})}
function applyBlogInlineImageStyle(figure){if(!figure)return;const img=figure.querySelector("img"),x=Number(figure.dataset.x||50),y=Number(figure.dataset.y||50),zoom=Number(figure.dataset.zoom||100),scale=zoom/100,panRatio=Math.max(0,(scale-1)/scale),cropped=figure.dataset.crop!=="original",positionTransform=cropped?`translate(${(50-x)*panRatio}%,${(50-y)*panRatio}%) `:"";if(img){img.style.objectPosition=`${x}% ${y}%`;img.style.transform=`${positionTransform}scale(${scale})`}}
function selectBlogInlineImage(target){const figure=target?.closest?.(".blog-inline-media");if(!figure)return;document.querySelectorAll("#blogBodyEditor .blog-inline-media.selected").forEach(x=>x.classList.remove("selected"));selectedBlogInlineImage=figure;figure.classList.add("selected");syncBlogInlineControls()}
function clearBlogImageSelection(){document.querySelectorAll("#blogBodyEditor .blog-inline-media.selected").forEach(x=>x.classList.remove("selected"));selectedBlogInlineImage=null;document.getElementById("blogInlineControls")?.classList.remove("active")}
function syncBlogInlineControls(){const figure=selectedBlogInlineImage,controls=document.getElementById("blogInlineControls");if(!figure||!figure.isConnected){clearBlogImageSelection();return}controls.classList.add("active");controls.querySelectorAll("[data-layout]").forEach(b=>b.classList.toggle("active",b.dataset.layout===figure.dataset.layout));controls.querySelectorAll("[data-crop]").forEach(b=>b.classList.toggle("active",b.dataset.crop===figure.dataset.crop));const zoom=document.getElementById("blogInlineZoom"),original=figure.dataset.crop==="original";zoom.value=figure.dataset.zoom||100;zoom.disabled=original;document.getElementById("blogInlineZoomValue").textContent=`${zoom.value}%`;document.getElementById("blogInlineHint").textContent=original?"Choose a cropped frame to enable zoom and drag-to-reposition.":"Drag the image itself to reposition the crop."}
function setBlogImageLayout(layout){if(!selectedBlogInlineImage)return;selectedBlogInlineImage.classList.remove("layout-full","layout-left","layout-right");selectedBlogInlineImage.classList.add("layout-"+layout);selectedBlogInlineImage.dataset.layout=layout;syncBlogInlineControls()}
function setBlogImageCrop(crop){if(!selectedBlogInlineImage)return;selectedBlogInlineImage.classList.remove("crop-original","crop-landscape","crop-portrait","crop-square");selectedBlogInlineImage.classList.add("crop-"+crop);selectedBlogInlineImage.dataset.crop=crop;applyBlogInlineImageStyle(selectedBlogInlineImage);syncBlogInlineControls()}
function setBlogImageZoom(value){if(!selectedBlogInlineImage||selectedBlogInlineImage.dataset.crop==="original")return;selectedBlogInlineImage.dataset.zoom=String(value);applyBlogInlineImageStyle(selectedBlogInlineImage);document.getElementById("blogInlineZoomValue").textContent=`${value}%`}
function insertBlogImage(input){const f=input.files?.[0];if(!f)return;const url=URL.createObjectURL(f),editor=document.getElementById("blogBodyEditor"),img=document.createElement("img"),figure=makeBlogInlineFigure(img),after=document.createElement("p");img.src=url;after.innerHTML="<br>";editor.focus();const sel=window.getSelection();if(sel&&sel.rangeCount&&editor.contains(sel.anchorNode)){const r=sel.getRangeAt(0);r.deleteContents();r.insertNode(figure)}else editor.appendChild(figure);figure.after(after);const range=document.createRange();range.selectNodeContents(after);range.collapse(true);sel?.removeAllRanges();sel?.addRange(range);input.value="";selectBlogInlineImage(figure);updateBlogBodyCount()}
function setupBlogResizeField(){
    const editor=document.getElementById("blogBodyEditor");
    if(!editor||editor.closest(".blog-writing-field"))return;
    const field=document.createElement("div");
    field.className="blog-writing-field";
    editor.parentNode.insertBefore(field,editor);
    field.appendChild(editor);
    const hint=document.createElement("span");
    hint.className="textarea-resize-hint blog-resize-hint";
    hint.setAttribute("aria-hidden","true");
    hint.textContent="Drag to expand ↘";
    field.appendChild(hint);
}
setupBlogResizeField();
const blogEditorElement=document.getElementById("blogBodyEditor");
blogEditorElement.addEventListener("pointerdown",e=>{const figure=e.target.closest?.(".blog-inline-media");if(!figure)return;selectBlogInlineImage(figure);if(figure.dataset.crop==="original"||e.target.tagName!=="IMG")return;blogInlineDrag={figure,pointerId:e.pointerId,startClientX:e.clientX,startClientY:e.clientY,startX:Number(figure.dataset.x||50),startY:Number(figure.dataset.y||50)};e.target.setPointerCapture?.(e.pointerId);e.preventDefault()});
blogEditorElement.addEventListener("pointermove",e=>{if(!blogInlineDrag||blogInlineDrag.pointerId!==e.pointerId)return;const {figure,startClientX,startClientY,startX,startY}=blogInlineDrag,r=figure.getBoundingClientRect();figure.dataset.x=String(Math.max(0,Math.min(100,startX-(e.clientX-startClientX)/Math.max(r.width,1)*100)));figure.dataset.y=String(Math.max(0,Math.min(100,startY-(e.clientY-startClientY)/Math.max(r.height,1)*100)));applyBlogInlineImageStyle(figure)});
const endBlogInlineDrag=e=>{if(blogInlineDrag?.pointerId===e.pointerId)blogInlineDrag=null};blogEditorElement.addEventListener("pointerup",endBlogInlineDrag);blogEditorElement.addEventListener("pointercancel",endBlogInlineDrag);blogEditorElement.addEventListener("click",e=>{const figure=e.target.closest?.(".blog-inline-media");if(figure)selectBlogInlineImage(figure)});
function insertBlogLink(){const editor=document.getElementById("blogBodyEditor"),sel=window.getSelection();if(!sel||!sel.rangeCount||!editor.contains(sel.anchorNode)||sel.isCollapsed){alert("Highlight the words you want to link first.");return}let url=prompt("Paste the link:","https://");if(!url)return;url=normalizeAttachedLink(url);if(!url)return;const range=sel.getRangeAt(0),a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=range.toString();range.deleteContents();range.insertNode(a);sel.removeAllRanges();updateBlogBodyCount()}
function setupByteCaption(post){const caption=post?.querySelector(".byte-caption"),btn=post?.querySelector(".byte-caption-more");if(!caption||!btn)return;requestAnimationFrame(()=>{if(caption.scrollHeight>caption.clientHeight+2)btn.classList.add("show")})}
function toggleByteCaption(btn){const caption=btn.closest(".byte-caption-row")?.querySelector(".byte-caption");if(!caption)return;const open=caption.classList.toggle("expanded");btn.textContent=open?"Less":"More"}
function toggleBlogBody(btn){const post=btn.closest(".post"),body=post.querySelector(".blog-full-body"),excerpt=post.querySelector(".blog-feed-excerpt");if(!body)return;const open=body.classList.toggle("active");if(excerpt)excerpt.style.display=open?"none":"";btn.textContent=open?"Close Blog":"Read Blog"}
function updateBlogTitleCount(){const input=document.getElementById("blogTitle"),counter=document.getElementById("blogTitleCount");if(!input||!counter)return;const n=input.value.length;counter.textContent=`${n} / 120`;counter.classList.toggle("near",n>=108&&n<120);counter.classList.toggle("limit",n>=120)}
function resetPostComposerSelections(){
    const topic=document.getElementById("topicPicker");
    if(topic){delete topic.dataset.topic;topic.classList.remove("open");topic.querySelectorAll(".topic-option.selected").forEach(b=>b.classList.remove("selected"));}
    const topicLabel=document.getElementById("topicLabel");if(topicLabel)topicLabel.textContent="Select";
    const topicSearch=document.getElementById("topicSearch");if(topicSearch){topicSearch.value="";filterTopics("");}

    selectedHashtags.length=0;
    document.querySelectorAll("#hashtagPicker .hashtag-option.selected").forEach(b=>b.classList.remove("selected"));
    const hp=document.getElementById("hashtagPicker");if(hp)hp.classList.remove("open");
    const hs=document.getElementById("hashtagSearch");if(hs){hs.value="";filterHashtags("");}
    syncHashtagSelectionUI();

    const cp=document.getElementById("communityPicker");
    if(cp){cp.dataset.communities="[]";cp.classList.remove("open");cp.querySelectorAll(".community-picker-option.selected").forEach(b=>b.classList.remove("selected"));}
    const cl=document.getElementById("communityPickerLabel");if(cl)cl.textContent="None";
    const cs=cp?.querySelector(".community-picker-search");if(cs){cs.value="";filterCommunityPicker("");}
    document.getElementById("communityLimit")?.classList.remove("show");

    const profileToggle=document.getElementById("profileToggle");
    if(profileToggle){profileToggle.checked=true;syncSwitchStatus(profileToggle);}
    const imageExpansionToggle=document.getElementById("imageExpansionToggle");
    if(imageExpansionToggle){imageExpansionToggle.checked=true;syncSwitchStatus(imageExpansionToggle);}
}
function setCreatorTypeLocked(locked){const tabs=document.querySelector(".creator-type-tabs"),note=document.getElementById("creatorTypeLockNote");tabs?.classList.toggle("type-locked",locked);note?.classList.toggle("show",locked);document.querySelectorAll(".creator-type-tab").forEach(tab=>{tab.disabled=locked;tab.setAttribute("aria-disabled",String(locked))})}
function closeComposerAfterPublish(){const composer=document.getElementById("composer"),feed=document.getElementById("feed"),button=document.getElementById("sidebarCreateButton");setCreatorTypeLocked(false);if(composer)composer.classList.remove("active");if(feed)feed.style.display="block";if(button){button.textContent="CREATE POST";button.classList.remove("cancel");}}
function formatMediaDuration(seconds){const total=Math.max(0,Math.floor(Number(seconds)||0)),m=Math.floor(total/60),sec=String(total%60).padStart(2,"0");return `${m}:${sec}`;}
function createPost(){
    const mode=document.querySelector(".creator-type-tab.active")?.dataset.type||"post";
    if(!["post","blog","video","byte"].includes(mode))return;
    if(mode==="blog")clearBlogImageSelection();
    const postBeingEdited=editingPost;
    const ta=document.getElementById("mainPostText"),blogEditor=document.getElementById("blogBodyEditor"),text=mode==="blog"?blogPlainText():ta.value.trim(),blogHTML=mode==="blog"?blogEditor.innerHTML:"",title=document.getElementById("blogTitle").value.trim(),selectedTopic=document.getElementById("topicPicker").dataset.topic||"Art",cp=document.getElementById("communityPicker"),selectedCommunities=JSON.parse(cp.dataset.communities||"[]"),attachedLink=(mode==="post"||mode==="video"||mode==="byte")?normalizeAttachedLink(document.getElementById("postLinkInput").value):"",mediaItems=selectedPostMedia.map(m=>({...m})),videoItem=(mode==="video"||mode==="byte")&&selectedPostVideo?{...selectedPostVideo,feedUrl:selectedPostVideo.existing?(selectedPostVideo.feedUrl||selectedPostVideo.previewUrl):URL.createObjectURL(selectedPostVideo.blob),type:selectedPostVideo.type||"video/mp4"}:null;
    const warning=document.getElementById("postWarning");
    if(mode==="blog"&&(!title||!text)){if(warning)warning.textContent=!title?"Your blog needs a title…":"Looks like your blog is missing some context…";showPostWarning();return;}
    if(mode==="blog"&&blogMeaningfulLength()<1000){if(warning)warning.textContent="Blogs need at least 1,000 characters.";showPostWarning();return;}
    if(mode==="video"&&(!title||!videoItem||!text)){if(warning)warning.textContent=!title?"Your video needs a title…":!videoItem?"Add a video before publishing…":"Your video needs a description…";showPostWarning();return;}
    if(mode==="byte"&&(!videoItem||!text)){if(warning)warning.textContent=!videoItem?"Add a Byte video before posting…":"Your Byte needs a caption…";showPostWarning();return;}
    if(mode==="byte"&&selectedPostVideo?.duration>180.01){if(warning)warning.textContent="Bytes can be up to 3 minutes long.";showPostWarning();return;}
    if(mode==="post"&&!text){if(warning)warning.textContent="Looks like your post is missing some context…";showPostWarning();return;}
    const feed=document.getElementById("feed"),np=document.createElement("article");np.className=mode==="blog"?"post blog-post":mode==="video"?"post video-post":mode==="byte"?"post byte-post":"post";
    const topicEmoji=({"Art":"🎨","Halloween":"🎃","Nature":"🌲","Gaming":"🎮","Music":"🎵","Books":"📚","Food":"🍔","Photography":"📷","Movies & TV":"🎬","Fashion":"👗","Technology":"💻","Lifestyle":"🧘","Home & Decor":"🏠","Travel":"✈️","Animals":"🐾","Other":"🎲"}[selectedTopic]||"🏷️");
    const allowImageExpansion=document.getElementById("imageExpansionToggle")?.checked!==false;
    const imageHTML=mediaItems.length?`<div class="post-image has-upload"><div class="media-carousel feed-carousel" data-index="0"><div class="media-carousel-track">${mediaItems.map((m,i)=>`<div class="media-slide"><div class="feed-media-stage"><div class="feed-media-frame ${m.mode||"fit"}${mode==="post"&&!allowImageExpansion?" no-expand":""}" data-full="${m.url}" data-expand="${allowImageExpansion}" ${mode==="post"&&allowImageExpansion?'onclick="openPostImage(this,event)"':""}><img src="${m.url}" alt="${mode==="blog"?"Blog":"Post"} image ${i+1} of ${mediaItems.length}" style="${composerImageStyle(m)}">${mode==="post"&&allowImageExpansion?'<button type="button" class="feed-expand" onclick="openPostImage(this.parentElement,event)" aria-label="Expand full image">⤢</button>':""}</div></div></div>`).join("")}</div>${mediaItems.length>1?`<button type="button" class="carousel-arrow prev" onclick="movePostCarousel(this,-1)" aria-label="Previous photo">‹</button><button type="button" class="carousel-arrow next" onclick="movePostCarousel(this,1)" aria-label="Next photo">›</button>`:""}</div>${mediaItems.length>1?`<div class="carousel-dots">${mediaItems.map((_,i)=>`<button type="button" class="carousel-dot ${i===0?"active":""}" onclick="goPostCarousel(this,${i})" aria-label="View photo ${i+1}"></button>`).join("")}</div>`:""}</div>`:editingPreservedMediaHTML;
    const videoPoster=(mode==="video"||mode==="byte")&&mediaItems.length?mediaItems[0]:null;
    const videoHTML=videoItem?`<div class="video-feed-player ${mode==="byte"?"byte-feed-player":""}">${videoPoster?`<div class="video-feed-poster"><img src="${videoPoster.url}" alt="Video preview image" style="${composerImageStyle(videoPoster)}"></div>`:""}<video preload="metadata" playsinline src="${videoItem.feedUrl}" data-video-type="${escapeHTML(videoItem.type||'')}" onclick="showVideoControls(this.closest('.video-feed-player'))"></video><div class="video-playback-warning">This browser cannot play this video file.</div>${videoControlHTML()}</div>`:"";
    const contentHTML=mode==="blog"?`<div class="blog-feed-title">${escapeHTML(title)}</div>${imageHTML?`<div class="blog-home-preview">${imageHTML}</div>`:""}<div class="caption blog-feed-excerpt">${escapeHTML(text.length>420?text.slice(0,420).trim()+"…":text)}</div><button type="button" class="blog-read-button" onclick="toggleBlogBody(this)">Read Blog</button><div class="blog-full-body">${blogHTML}</div>`:mode==="video"?`<div class="video-feed-title">${escapeHTML(title)}</div>${videoHTML}<div class="video-caption-row"><div class="caption video-caption">${escapeHTML(text)}</div><button type="button" class="video-caption-more" onclick="toggleVideoDescription(this)">More</button></div>`:mode==="byte"?`<div class="byte-home-media-stage">${videoHTML}</div><div class="byte-caption-row"><div class="caption byte-caption">${escapeHTML(text)}</div><button type="button" class="byte-caption-more" onclick="toggleByteCaption(this)">More</button></div>`:`${imageHTML}<div class="caption">${escapeHTML(text)}</div>`;
    np.innerHTML=`<div class="post-header"><div class="profile-picture"></div><div class="post-author-copy"><div class="post-author-line"><div class="username">@yourusername</div>${mode!=="post"?`<div class="content-type-label ${mode}">${mode==="blog"?"BLOG":mode==="video"?"VIDEO":"BYTE"}</div>`:""}<span class="post-time">Just now</span></div><div class="post-meta-line"><div class="topic">${topicEmoji} ${selectedTopic}</div>${selectedCommunities.map(c=>`<div class="post-community" title="Open ${c.name}">· in ${c.label}</div>`).join("")}</div></div><div class="post-menu"><button class="post-menu-button" onclick="togglePostMenu(event,this)">⋯</button><div class="post-menu-dropdown"><button onclick="editPost(this)">Edit</button><button class="delete-option" onclick="deletePost(this)">Delete</button></div></div></div>${contentHTML}<div class="interactions">
<button class="interaction like-button" data-liked="false" onclick="toggleLikeNew(this)">♡ <span class="like-count">0</span></button>
<button class="quick-action pocket-action" type="button"><svg class="quick-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.5h6l2 2h9v9.25a1.75 1.75 0 0 1-1.75 1.75H5.25a1.75 1.75 0 0 1-1.75-1.75Z"></path><path d="M3.5 9.5V6.75A1.75 1.75 0 0 1 5.25 5h4.2l2 2h3.3"></path></svg><span>Pocket</span></button>
<button class="quick-action community-action" type="button"><svg class="quick-action-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9.5" r="2.5"></circle><path d="M3.5 19c.4-3.3 2.3-5 5.5-5s5.1 1.7 5.5 5"></path><path d="M14 15c.8-.7 1.9-1 3.2-1 2.2 0 3.5 1.3 3.8 3.8"></path></svg><span>Community</span></button>
<div class="interaction reblog-counter"><span class="reblog-icon" aria-hidden="true">↻</span> 0 · Reblog</div>
<button class="interaction share share-action" type="button">↗ Share</button>
</div><div class="latest-comment-label">Latest comment</div><div class="latest-comment empty-comment" data-time="">No comments yet</div><div class="post-footer"><button class="comment-button" onclick="toggleCommentComposerForPost(this.closest('.post'))">Leave your opinion…</button><div class="footer-link more-comments" onclick="toggleComments(this)">💬 View 0 more comments</div><div class="post-footer-actions">${attachedLink?`<a class="feed-link-pill" href="${attachedLink}" target="_blank" rel="noopener noreferrer" title="${escapeHTML(attachedLink)}"><span class="feed-link-icon">🔗</span><span class="feed-link-text">${escapeHTML(displayAttachedLink(attachedLink))}</span></a>`:""}<div class="hashtag-link" onclick="togglePostHashtags(this)"><div class="hashtag-icon">#</div><span>Hashtags</span></div></div><div class="post-hashtags">${selectedHashtags.length?selectedHashtags.map(h=>`<span class="post-hashtag">${h}</span>`).join(""):`<span class="post-hashtag">No hashtags used</span>`}<button type="button" class="post-hashtag-done" onclick="closePostHashtags(event,this)">Done</button></div></div><div class="comments-section"></div><div class="comment-composer"><div class="comment-user"><div class="comment-profile-picture"></div><div class="comment-username-display">@yourusername</div></div><textarea class="comment-text-area" placeholder="Say hi…"></textarea><div class="comment-post-actions"><button class="comment-post-button" onclick="postCommentNew(this)">POST</button></div></div>`;
    if(postBeingEdited){const oldUser=postBeingEdited.querySelector(".username")?.textContent,oldTime=postBeingEdited.querySelector(".post-time")?.textContent,oldAvatar=postBeingEdited.querySelector(".profile-picture"),newAvatar=np.querySelector(".profile-picture"),newTime=np.querySelector(".post-time");if(oldUser)np.querySelector(".username").textContent=oldUser;if(oldTime&&newTime)newTime.textContent=oldTime;if(oldAvatar&&newAvatar)newAvatar.replaceWith(oldAvatar);[".interactions",".latest-comment-label",".latest-comment",".comments-section",".comment-composer"].forEach(s=>{const oldNode=postBeingEdited.querySelector(s),newNode=np.querySelector(s);if(oldNode&&newNode)newNode.replaceWith(oldNode)});postBeingEdited.replaceWith(np);updateMoreLink(np)}else feed.prepend(np);editingPost=null;editingPreservedMediaHTML="";closeComposerAfterPublish();const newCarousel=np.querySelector(".media-carousel.feed-carousel");if(newCarousel)wirePostCarouselSwipe(newCarousel);const newFeedVideo=np.querySelector(".video-feed-player video");if(newFeedVideo)syncFeedVideoControls(newFeedVideo);if(mode==="byte")setupByteCaption(np);if(mode==="video")setupVideoDescription(np);ta.value="";document.getElementById("blogTitle").value="";document.getElementById("blogBodyEditor").innerHTML="";selectedPostMedia=[];composerMediaIndex=0;if(selectedPostVideo?.previewUrl&&!selectedPostVideo.existing)URL.revokeObjectURL(selectedPostVideo.previewUrl);selectedPostVideo=null;document.getElementById("videoPreviewPlayer").removeAttribute("src");document.getElementById("videoPreviewPlayer").load();document.getElementById("videoPreview").classList.remove("active");document.getElementById("videoFileNote").textContent="";document.getElementById("videoUploadInput").value="";document.getElementById("byteFramePicker").classList.remove("active");document.getElementById("postMediaInput").value="";document.getElementById("cropPanel").classList.remove("open");renderComposerMedia();removePostLink();resetPostComposerSelections();updatePostCharCount();updateBlogTitleCount();updateBlogBodyCount();requestAnimationFrame(()=>np.scrollIntoView({behavior:"smooth",block:"start"}));
}
function postCommentNew(button){ const post=button.closest(".post"), ct=post.querySelector(".comment-text-area"), lc=post.querySelector(".latest-comment"), cs=post.querySelector(".comments-section"), text=ct.value.trim(); if(!text) return; lc.classList.remove("empty-comment");lc.dataset.time="Just now";lc.innerHTML='<span class="comment-username">@yourusername:</span> '+escapeHTML(text); const nc=document.createElement("div"); nc.className="comment-item"; nc.innerHTML=`<div class="comment-author">@yourusername</div><div class="comment-content">${escapeHTML(text)}</div><div class="comment-actions"><button class="comment-like" data-liked="false" onclick="toggleCommentLike(this)">♡ <span>0</span></button><button class="reply-button" onclick="toggleReplyComposer(this)">Reply</button></div><div class="reply-composer"><textarea class="reply-input" placeholder="Reply…"></textarea><div class="reply-submit"><button class="reply-post-button" onclick="postReply(this)">POST</button></div></div>`; cs.appendChild(nc); cs.classList.remove("active"); ct.value=""; toggleCommentComposerForPost(post); updateMoreLink(post); }
function toggleMainButton(){ const c=document.getElementById("composer"), f=document.getElementById("feed"), cc=document.querySelector(".comment-composer.active"), rc=document.querySelector(".reply-composer.active"), b=document.getElementById("addPostButton"); if(cc){ cc.classList.remove("active"); b.textContent="+"; return; } if(rc){ rc.classList.remove("active"); b.textContent="+"; return; } c.classList.toggle("active"); b.classList.toggle("open"); if(c.classList.contains("active")){ f.style.display="none"; b.textContent="−"; } else { f.style.display="block"; b.textContent="+"; } }
function toggleCommunityDropdown(){ document.getElementById("communityDropdown").classList.toggle("active"); }
function togglePostMenu(event,button){ event.stopPropagation(); const menu=button.nextElementSibling, wasOpen=menu.classList.contains("active"); document.querySelectorAll(".post-menu-dropdown.active").forEach(m=>m.classList.remove("active")); if(!wasOpen) menu.classList.add("active"); }
document.addEventListener("click",()=>document.querySelectorAll(".post-menu-dropdown.active").forEach(m=>m.classList.remove("active")));
function editPost(button){
    const post=button.closest(".post"),mode=post.classList.contains("blog-post")?"blog":post.classList.contains("video-post")?"video":post.classList.contains("byte-post")?"byte":"post",tab=document.querySelector(`.creator-type-tab[data-type="${mode}"]`),composer=document.getElementById("composer"),feed=document.getElementById("feed"),sidebarButton=document.getElementById("sidebarCreateButton");
    editingPost=post;editingPreservedMediaHTML="";selectedPostMedia=[];composerMediaIndex=0;selectedPostVideo=null;resetPostComposerSelections();setCreatorTypeLocked(false);selectCreatorType(tab);setCreatorTypeLocked(true);
    const topicText=post.querySelector(".topic")?.textContent.trim()||"",topicButton=[...document.querySelectorAll("#topicPicker .topic-option")].find(b=>topicText.endsWith(b.dataset.topic));if(topicButton)selectTopic(topicButton);
    selectedHashtags=[...post.querySelectorAll(".post-hashtag")].map(x=>x.textContent.trim()).filter(x=>x.startsWith("#"));selectedHashtags.forEach(ensureHashtagOption);syncHashtagSelectionUI();
    const communities=[...post.querySelectorAll(".post-community")].map(x=>{const name=(x.title||"").replace(/^Open /,"")||x.textContent.replace(/^· in\s*/,"").replace(/^\S+\s*/,"").trim(),label=x.textContent.replace(/^· in\s*/,"").trim();return{name,label}});const cp=document.getElementById("communityPicker");cp.dataset.communities=JSON.stringify(communities);cp.querySelectorAll(".community-picker-option").forEach(b=>b.classList.toggle("selected",communities.some(c=>c.name===b.dataset.community)));document.getElementById("communityPickerLabel").textContent=communities.length===2?"2 selected":communities.length?communities[0].label:"None";
    const link=post.querySelector(".feed-link-pill")?.href||"";document.getElementById("postLinkInput").value=link;updatePostLinkSummary();
    const frames=[...post.querySelectorAll(mode==="blog"?".blog-home-preview .feed-media-frame":mode==="video"||mode==="byte"?".video-feed-poster":":scope > .post-image .feed-media-frame")];selectedPostMedia=frames.map(frame=>{const img=frame.querySelector("img"),position=(img?.style.objectPosition||"50% 50%").match(/[\d.]+/g)||[50,50],scale=(img?.style.transform||"").match(/scale\(([\d.]+)\)/);return{url:frame.dataset.full||img?.src||"",x:Number(position[0]),y:Number(position[1]),zoom:scale?Number(scale[1])*100:100,mode:["square","portrait","landscape","byte","fit"].find(c=>frame.classList.contains(c))||(mode==="video"?"landscape":mode==="byte"?"byte":"fit"),expand:frame.dataset.expand!=="false",existing:true}}).filter(m=>m.url);
    if(mode==="post"){const expansionToggle=document.getElementById("imageExpansionToggle");if(expansionToggle){expansionToggle.checked=!frames.length||frames[0].dataset.expand!=="false";syncSwitchStatus(expansionToggle)}}
    if(mode==="blog")selectedPostMedia.forEach(m=>m.mode="landscape");
    if(!selectedPostMedia.length){if(mode==="blog")editingPreservedMediaHTML=post.querySelector(".blog-home-preview")?.innerHTML||"";else if(mode==="post")editingPreservedMediaHTML=post.querySelector(":scope > .post-image")?.outerHTML||"";}
    if(mode==="blog"){document.getElementById("blogTitle").value=post.querySelector(".blog-feed-title")?.textContent.trim()||"";document.getElementById("blogBodyEditor").innerHTML=post.querySelector(".blog-full-body")?.innerHTML||"";prepareBlogInlineImages();}else document.getElementById("mainPostText").value=(post.querySelector(mode==="video"?".video-caption":mode==="byte"?".byte-caption":":scope > .caption")?.textContent||"").trim();
    if(mode==="video"||mode==="byte"){const video=post.querySelector("video");if(video){selectedPostVideo={previewUrl:video.currentSrc||video.src,feedUrl:video.currentSrc||video.src,type:video.dataset.videoType||"video/mp4",duration:video.duration||Number(post.querySelector(".feed-video-duration")?.textContent.split(":")[0])*60+Number(post.querySelector(".feed-video-duration")?.textContent.split(":")[1])||0,existing:true};const player=document.getElementById("videoPreviewPlayer");player.src=selectedPostVideo.previewUrl;player.load();document.getElementById("videoPreview").classList.add("active");document.getElementById("videoFileNote").textContent="Current video";}}
    renderComposerMedia();updatePostCharCount();updateBlogTitleCount();updateBlogBodyCount();setPublishButtonLabel("SAVE CHANGES");composer.classList.add("active");feed.style.display="none";sidebarButton.textContent="CANCEL POST";sidebarButton.classList.add("cancel");composer.scrollIntoView({behavior:"smooth",block:"start"});
}
function deletePost(button){ const post=button.closest(".post"); if(confirm("Delete this post?")) post.remove(); }
const hotbar=document.querySelector(".pinned-communities");
let draggedCommunity=null;
function wireCommunityChip(chip){
    chip.addEventListener("dragstart",()=>{draggedCommunity=chip;chip.classList.add("dragging")});
    chip.addEventListener("dragend",()=>{chip.classList.remove("dragging");draggedCommunity=null})
}
hotbar.querySelectorAll(".community-chip").forEach(wireCommunityChip);
function toggleCommunityPin(event,btn){
    event.stopPropagation();
    const row=btn.closest(".community-more-row"), name=row.dataset.community, icon=row.dataset.icon;
    const existing=[...hotbar.querySelectorAll(".community-chip")].find(c=>c.dataset.community===name);
    if(existing){
        const bell=existing.querySelector(".activity-bell"),count=bell?.querySelector(".activity-count");
        row.dataset.activityCount=count?count.textContent.trim():"0";
        row.dataset.activityHidden=count?.classList.contains("hidden")?"true":"false";
        existing.remove();
        btn.classList.remove("pinned");
        btn.innerHTML='<span class="pin-state">Pin</span><span class="pin-action">Pin</span>';
        btn.title="Pin to hotbar";
        btn.setAttribute("aria-label",`Pin ${name} to hotbar`);
    }else{
        const chip=document.createElement("button"),activityCount=row.dataset.activityCount||"0",hidden=row.dataset.activityHidden==="true"||activityCount==="0";
        chip.className="community-chip";
        chip.draggable=true;
        chip.dataset.community=name;
        chip.dataset.icon=icon;
        chip.innerHTML=`<span class="community-icon">${icon}</span>${name} <span class="activity-bell" onclick="openRecentActivity(event,this)" title="${hidden?'No new community activity':activityCount+' new community activities'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg><span class="activity-count${hidden?' hidden':''}">${activityCount}</span></span>`;
        wireCommunityChip(chip);
        hotbar.appendChild(chip);
        btn.classList.add("pinned");
        btn.innerHTML='<span class="pin-state">Pinned</span><span class="pin-action">Unpin</span>';
        btn.title="Unpin from hotbar";
        btn.setAttribute("aria-label",`Unpin ${name} from hotbar`);
        hotbar.scrollTo({left:hotbar.scrollWidth,behavior:"smooth"});
    }
}
hotbar.addEventListener("dragover",e=>{
    e.preventDefault();
    const after=[...hotbar.querySelectorAll(".community-chip:not(.dragging)")].find(el=>e.clientX<=el.getBoundingClientRect().left+el.offsetWidth/2);
    if(draggedCommunity) after?hotbar.insertBefore(draggedCommunity,after):hotbar.appendChild(draggedCommunity);
});
hotbar.addEventListener("wheel",e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();hotbar.scrollLeft+=e.deltaY}},{passive:false});
function openRecentActivity(event,bell){ event.stopPropagation(); const count=bell.querySelector(".activity-count"); if(count){ count.classList.add("hidden"); bell.title="No new community activity"; } }
function togglePocketList(button){ const list=document.getElementById("pocketList"), open=!list.classList.toggle("collapsed"); button.firstChild.textContent=open?"▾ Other Pockets":"▸ Other Pockets"; }
let pocketLimitTimer=null;
function updatePocketFavoriteCount(){const faves=document.getElementById("favesList"),count=document.getElementById("pocketFavoriteCount");if(faves&&count)count.textContent=`${faves.querySelectorAll(":scope > .pocket-item").length} of 6 favorites`}
function showPocketLimitMessage(){const message=document.getElementById("pocketLimitMessage");if(!message)return;clearTimeout(pocketLimitTimer);message.textContent="You can favorite up to 6 Pockets.";message.classList.add("show");pocketLimitTimer=setTimeout(()=>message.classList.remove("show"),3500)}
function togglePocketFavorite(button){const item=button.closest(".pocket-item"),faves=document.getElementById("favesList"),pockets=document.getElementById("pocketList"),isFav=button.textContent.trim()==="★",message=document.getElementById("pocketLimitMessage");if(isFav){button.textContent="☆";pockets.appendChild(item);if(message)message.classList.remove("show");updatePocketFavoriteCount();return}if(faves.querySelectorAll(":scope > .pocket-item").length>=6){showPocketLimitMessage();return}button.textContent="★";faves.appendChild(item);if(message)message.classList.remove("show");updatePocketFavoriteCount()}
updatePocketFavoriteCount();
function setPublishButtonLabel(label){const button=document.getElementById("publishButton"),text=button?.querySelector(".publish-label");if(text)text.textContent=label;else if(button)button.textContent=label}
function selectCreatorType(button){
    const type=button.dataset.type;if(type!=="blog")clearBlogImageSelection();if(type!=="post")clearPostMediaWarning();document.querySelectorAll(".creator-type-tab").forEach(tab=>tab.classList.remove("active"));button.classList.add("active");
    const composer=document.getElementById("composer");composer.classList.remove("mode-post","mode-blog","mode-video","mode-byte");composer.classList.add("mode-"+type);
    const titleWrap=document.getElementById("blogTitleWrap"),titleInput=document.getElementById("blogTitle"),postText=document.getElementById("postTextWrap"),blogEditor=document.getElementById("blogEditorWrap"),videoWrap=document.getElementById("videoUploadWrap"),videoUploadButton=document.getElementById("videoUploadButton"),byteFramePicker=document.getElementById("byteFramePicker"),ta=document.getElementById("mainPostText"),linkButton=document.getElementById("attachLinkButton"),linkPanel=document.getElementById("postLinkPanel"),publish=document.getElementById("publishButton"),warning=document.getElementById("postWarning"),mediaBtn=document.getElementById("mediaAddButton"),mediaPreview=document.getElementById("postMediaPreview"),previewLabel=document.getElementById("blogPreviewLabel"),mediaInput=document.getElementById("postMediaInput"),thumbModes=document.getElementById("thumbModes");
    videoWrap.classList.remove("active","byte-mode");byteFramePicker.classList.remove("active");videoUploadButton.textContent="Upload video";mediaBtn.style.display="inline-flex";mediaPreview.style.display="";thumbModes.style.display="grid";if(type!=="byte"&&selectedPostMedia[0]?.generated){selectedPostMedia=[];composerMediaIndex=0;}
    if(type==="blog"){
        titleWrap.classList.add("active");titleInput.placeholder="Give your blog a title…";postText.style.display="none";blogEditor.classList.add("active");linkButton.style.display="none";linkPanel.classList.remove("open");setPublishButtonLabel("PUBLISH BLOG");warning.textContent="Looks like your blog is missing some context…";document.getElementById("mediaAddLabel").textContent="Home preview image · optional";previewLabel.classList.add("active");previewLabel.textContent="HOME PREVIEW IMAGE · optional";mediaInput.multiple=false;thumbModes.style.display="none";if(selectedPostMedia.length>1){selectedPostMedia.slice(1).forEach(m=>URL.revokeObjectURL(m.url));selectedPostMedia=selectedPostMedia.slice(0,1);composerMediaIndex=0}if(selectedPostMedia[0])selectedPostMedia[0].mode="landscape";renderComposerMedia();updatePreviewSizeNote()
    }else if(type==="video"){
        titleWrap.classList.add("active");titleInput.placeholder="Give your video a title…";postText.style.display="block";blogEditor.classList.remove("active");videoWrap.classList.add("active");ta.maxLength=750;ta.placeholder="Describe your video… Use @ to tag your friends!";linkButton.style.display="inline-flex";setPublishButtonLabel("PUBLISH VIDEO");warning.textContent="Your video needs a title, video, and description…";mediaBtn.style.display="inline-flex";document.getElementById("mediaAddLabel").textContent="Video preview image · optional";mediaPreview.style.display="";previewLabel.classList.add("active");previewLabel.textContent="VIDEO PREVIEW IMAGE · optional";mediaInput.multiple=false;thumbModes.style.display="none";if(selectedPostMedia.length>1){selectedPostMedia.slice(1).forEach(m=>URL.revokeObjectURL(m.url));selectedPostMedia=selectedPostMedia.slice(0,1);composerMediaIndex=0}if(selectedPostMedia[0])selectedPostMedia[0].mode="landscape";renderComposerMedia();updatePreviewSizeNote();if(ta.value.length>750)ta.value=ta.value.slice(0,750);
    }else if(type==="post"){
        titleWrap.classList.remove("active");postText.style.display="block";blogEditor.classList.remove("active");ta.maxLength=500;ta.placeholder="What's on your mind? Use @ to tag your friends!";linkButton.style.display="inline-flex";setPublishButtonLabel("POST");warning.textContent="Looks like your post is missing some context…";document.getElementById("mediaAddLabel").textContent="Upload images";previewLabel.classList.remove("active");previewLabel.textContent="HOME PREVIEW IMAGE · optional";mediaInput.multiple=true;updatePreviewSizeNote();if(ta.value.length>500)ta.value=ta.value.slice(0,500);
    }else{
        titleWrap.classList.remove("active");postText.style.display="block";blogEditor.classList.remove("active");videoWrap.classList.add("active","byte-mode");videoUploadButton.textContent="Upload Byte";ta.maxLength=300;linkButton.style.display="inline-flex";setPublishButtonLabel("POST BYTE");warning.textContent="Your Byte needs a video and caption…";ta.placeholder="Add a caption… Use @ to tag your friends!";mediaBtn.style.display="none";previewLabel.classList.add("active");previewLabel.textContent="BYTE PREVIEW · optional";mediaInput.multiple=false;thumbModes.style.display="none";if(selectedPostMedia[0])selectedPostMedia[0].mode="byte";if(selectedPostVideo){if((selectedPostVideo.duration||0)>180.01)setVideoWarning("Bytes can be up to 3 minutes long. Choose a shorter video.");else setupByteFramePicker(document.getElementById("videoPreviewPlayer"))}renderComposerMedia();updatePreviewSizeNote();if(ta.value.length>300)ta.value=ta.value.slice(0,300);
    }
    renderComposerMedia();updatePostCharCount();updateBlogTitleCount();updateBlogBodyCount();
}
function toggleVideoDescription(button){
    const row=button.closest(".video-caption-row"),caption=row?.querySelector(".video-caption");
    if(!caption)return;
    const expanded=caption.classList.toggle("expanded");
    button.textContent=expanded?"Less":"More";
}
function setupVideoDescription(post){
    const caption=post.querySelector(".video-caption"),button=post.querySelector(".video-caption-more");
    if(!caption||!button)return;
    requestAnimationFrame(()=>{button.style.display=caption.scrollHeight>caption.clientHeight+2?"inline-flex":"none";});
}
function toggleCreatePost(){ const c=document.getElementById("composer"), f=document.getElementById("feed"), b=document.getElementById("sidebarCreateButton"), open=c.classList.contains("active"); if(open){ c.classList.remove("active"); f.style.display="block"; b.textContent="CREATE POST"; b.classList.remove("cancel"); setCreatorTypeLocked(false); if(editingPost){editingPost=null;editingPreservedMediaHTML="";document.getElementById("mainPostText").value="";document.getElementById("blogTitle").value="";document.getElementById("blogBodyEditor").innerHTML="";clearBlogImageSelection();selectedPostMedia=[];composerMediaIndex=0;selectedPostVideo=null;document.getElementById("videoPreviewPlayer").removeAttribute("src");document.getElementById("videoPreview").classList.remove("active");removePostLink();resetPostComposerSelections();renderComposerMedia();updatePostCharCount();updateBlogTitleCount();updateBlogBodyCount();} } else { setCreatorTypeLocked(false); selectCreatorType(document.querySelector('.creator-type-tab[data-type="post"]')); c.classList.add("active"); f.style.display="none"; b.textContent="CANCEL POST"; b.classList.add("cancel"); c.scrollIntoView({behavior:"smooth",block:"start"}); } }
function goHomeAndRefreshFeed(){const composer=document.getElementById("composer"),feed=document.getElementById("feed"),sidebar=document.querySelector(".sidebar-column");if(composer?.classList.contains("active"))toggleCreatePost();if(feed)feed.style.display="block";window.dispatchEvent(new CustomEvent("allmedia:refreshfeed"));sidebar?.scrollTo({top:0,behavior:"smooth"});requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"smooth"}))}

const desktopSidebar=document.querySelector(".sidebar-column");
function sizeDesktopSidebar(){if(!desktopSidebar)return;if(window.matchMedia("(max-width: 800px)").matches){desktopSidebar.style.removeProperty("height");return}const visibleTop=Math.max(24,desktopSidebar.getBoundingClientRect().top),available=Math.max(240,window.innerHeight-visibleTop-24);desktopSidebar.style.height=`${available}px`}
desktopSidebar?.addEventListener("wheel",event=>{if(window.matchMedia("(max-width: 800px)").matches||desktopSidebar.scrollHeight<=desktopSidebar.clientHeight)return;event.preventDefault();const maximum=desktopSidebar.scrollHeight-desktopSidebar.clientHeight;desktopSidebar.scrollTop=Math.max(0,Math.min(maximum,desktopSidebar.scrollTop+event.deltaY))},{passive:false,capture:true});
window.addEventListener("resize",sizeDesktopSidebar);
window.addEventListener("scroll",sizeDesktopSidebar,{passive:true});
requestAnimationFrame(sizeDesktopSidebar);

requestAnimationFrame(()=>{syncCreatorVideoControls(document.getElementById('videoPreviewPlayer'));document.querySelectorAll('.video-feed-player video').forEach(syncFeedVideoControls);document.querySelectorAll('.post.byte-post').forEach(setupByteCaption);document.querySelectorAll('.post.video-post').forEach(setupVideoDescription);document.querySelectorAll('.post').forEach(updateMoreLink)});


/* =========================================================
   REGULAR POST V11 TEST HANDLERS — isolated to .regular-post
   ========================================================= */
function regularToggleLike(btn){
  const count=btn.querySelector('.like-count');
  const liked=btn.classList.toggle('liked');
  if(count) count.textContent=String(Math.max(0,Number(count.textContent||0)+(liked?1:-1)));
}
function regularToggleSave(btn){
  const saved=btn.classList.toggle('saved');
  btn.setAttribute('aria-label',saved?'Remove saved post':'Save post');
}
function regularIncrementReblog(btn){
  const count=btn.querySelector('span');
  if(!count)return;
  const on=btn.dataset.reblogged==='true';
  count.textContent=String(Math.max(0,Number(count.textContent||0)+(on?-1:1)));
  btn.dataset.reblogged=on?'false':'true';
}
function regularTogglePostMenu(event,btn){
  event.stopPropagation();
  const menu=btn.nextElementSibling;
  document.querySelectorAll('.regular-post-menu.open').forEach(m=>{if(m!==menu)m.classList.remove('open')});
  menu?.classList.toggle('open');
}
document.addEventListener('click',()=>document.querySelectorAll('.regular-post-menu.open').forEach(m=>m.classList.remove('open')));
function regularOpenCommentComposer(el){
  const composer=el.closest('.comment-composer');
  const wrap=composer?.closest('.single-comment-composer');
  if(!composer)return;
  composer.classList.add('active');wrap?.classList.add('open');
  setTimeout(()=>composer.querySelector('.comment-text-area')?.focus(),0);
}
function regularCloseCommentComposer(el,event){
  event?.stopPropagation();
  const post=el.closest('.regular-post');
  post?.querySelector('.comment-composer')?.classList.remove('active');
  post?.querySelector('.single-comment-composer')?.classList.remove('open');
}
function regularSyncComments(post,open){
  const view=post.querySelector('.more-comments');
  const hide=post.querySelector('.hide-comments-inline');
  if(view)view.style.display=open?'none':'';
  hide?.classList.toggle('show',open);
}
function regularToggleComments(btn){
  const post=btn.closest('.regular-post');
  const section=post.querySelector('.comments-section');
  const open=section.classList.toggle('active');
  regularSyncComments(post,open);
}
function regularHideComments(btn){
  const post=btn.closest('.regular-post');
  post.querySelector('.comments-section')?.classList.remove('active');
  regularSyncComments(post,false);
}
function regularPostComment(btn,event){
  event?.stopPropagation();
  const post=btn.closest('.regular-post');
  const field=post.querySelector('.comment-text-area');
  const value=field?.value.trim();
  if(!value)return;
  const latest=post.querySelector('.latest-comment');
  if(latest) latest.innerHTML='<span class="comment-username">@yourusername:</span><span class="latest-comment-copy">'+escapeHTML(value)+'</span><span class="latest-comment-time">now</span>';
  const section=post.querySelector('.comments-section');
  const item=document.createElement('div');item.className='comment-item';
  item.innerHTML='<div class="comment-avatar" aria-hidden="true">y</div><div class="comment-body"><div class="comment-author">@yourusername</div><div>'+escapeHTML(value)+'</div><div class="comment-actions"><button class="comment-action comment-like-button" type="button" onclick="regularToggleCommentLike(this)"><svg class="comment-like-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><span>Like</span></button><button class="comment-action" type="button" onclick="regularReplyToTarget(this,\'@yourusername\')">Reply</button></div></div>';
  section?.appendChild(item);field.value='';section?.classList.add('active');regularSyncComments(post,true);regularCloseCommentComposer(btn);
}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.regular-post').forEach(post=>{
    const open=post.querySelector('.comments-section')?.classList.contains('active')||false;
    regularSyncComments(post,open);
  });
});
function regularToggleCommentLike(btn){btn.classList.toggle('liked')}
function regularToggleReplyLike(btn){btn.classList.toggle('liked')}
function regularReplyToTarget(btn,username){
  const post=btn.closest('.regular-post');
  const composer=post?.querySelector('.comment-composer');
  const field=composer?.querySelector('.comment-text-area');
  if(!composer||!field)return;
  regularOpenCommentComposer(composer);
  field.value=username+' ';
  field.focus();field.setSelectionRange(field.value.length,field.value.length);
}

/* =========================================================
   BLOG V11 TEST HANDLERS — isolated to .blog-post-v11
   ========================================================= */
function blogV11ToggleBlog(btn){
  const post=btn.closest('.blog-post-v11');
  const body=post?.querySelector('.blog-full-content');
  if(!body)return;
  const open=body.classList.toggle('active');
  btn.textContent=open?'Close Blog ↑':'Read Blog →';
}
function blogV11ToggleLike(btn){regularToggleLike(btn)}
function blogV11ToggleSave(btn){regularToggleSave(btn)}
function blogV11IncrementReblog(btn){regularIncrementReblog(btn)}
function blogV11TogglePostMenu(event,btn){
  event.stopPropagation();
  const menu=btn.nextElementSibling;
  document.querySelectorAll('.blog-v11-menu.open').forEach(m=>{if(m!==menu)m.classList.remove('open')});
  menu?.classList.toggle('open');
}
document.addEventListener('click',()=>document.querySelectorAll('.blog-v11-menu.open').forEach(m=>m.classList.remove('open')));
function blogV11OpenCommentComposer(el){
  const composer=el.closest('.comment-composer');
  const wrap=composer?.closest('.single-comment-composer');
  if(!composer)return;
  composer.classList.add('active');wrap?.classList.add('open');
  setTimeout(()=>composer.querySelector('.comment-text-area')?.focus(),0);
}
function blogV11CloseCommentComposer(el,event){
  event?.stopPropagation();
  const post=el.closest('.blog-post-v11');
  post?.querySelector('.comment-composer')?.classList.remove('active');
  post?.querySelector('.single-comment-composer')?.classList.remove('open');
}
function blogV11SyncComments(post,open){
  const view=post.querySelector('.more-comments');
  const hide=post.querySelector('.hide-comments-inline');
  if(view)view.style.display=open?'none':'';
  hide?.classList.toggle('show',open);
}
function blogV11ToggleComments(btn){
  const post=btn.closest('.blog-post-v11');
  const section=post?.querySelector('.comments-section');
  if(!section)return;
  const open=section.classList.toggle('active');
  blogV11SyncComments(post,open);
}
function blogV11HideComments(btn){
  const post=btn.closest('.blog-post-v11');
  post?.querySelector('.comments-section')?.classList.remove('active');
  if(post)blogV11SyncComments(post,false);
}
function blogV11PostComment(btn,event){
  event?.stopPropagation();
  const post=btn.closest('.blog-post-v11');
  const field=post?.querySelector('.comment-text-area');
  const value=field?.value.trim();
  if(!post||!value)return;
  const latest=post.querySelector('.latest-comment');
  if(latest)latest.innerHTML='<span class="comment-username">@yourusername:</span><span class="latest-comment-copy">'+escapeHTML(value)+'</span><span class="latest-comment-time">now</span>';
  const section=post.querySelector('.comments-section');
  const item=document.createElement('div');item.className='comment-item';
  item.innerHTML='<div class="comment-avatar" aria-hidden="true">y</div><div class="comment-body"><div class="comment-author">@yourusername</div><div>'+escapeHTML(value)+'</div><div class="comment-actions"><button class="comment-action comment-like-button" type="button" onclick="blogV11ToggleCommentLike(this)"><svg class="comment-like-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><span>Like</span></button><button class="comment-action" type="button" onclick="blogV11ReplyToTarget(this,\'@yourusername\')">Reply</button></div></div>';
  section?.appendChild(item);field.value='';section?.classList.add('active');blogV11SyncComments(post,true);blogV11CloseCommentComposer(btn);
}
function blogV11ToggleCommentLike(btn){btn.classList.toggle('liked')}
function blogV11ReplyToTarget(btn,username){
  const post=btn.closest('.blog-post-v11');
  const composer=post?.querySelector('.comment-composer');
  const field=composer?.querySelector('.comment-text-area');
  if(!composer||!field)return;
  blogV11OpenCommentComposer(composer);
  field.value=username+' ';field.focus();field.setSelectionRange(field.value.length,field.value.length);
}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.blog-post-v11').forEach(post=>{
    const open=post.querySelector('.comments-section')?.classList.contains('active')||false;
    blogV11SyncComments(post,open);
  });
});



/* =========================================================
   VIDEO V11 TEST HANDLERS — isolated to .video-post-v11
   Player behavior is intentionally not rebuilt here.
   ========================================================= */
function videoV11ToggleLike(btn){regularToggleLike(btn)}
function videoV11ToggleSave(btn){regularToggleSave(btn)}
function videoV11IncrementReblog(btn){regularIncrementReblog(btn)}
function videoV11TogglePostMenu(event,btn){
  event.stopPropagation();
  const menu=btn.nextElementSibling;
  document.querySelectorAll('.video-v11-menu.open').forEach(m=>{if(m!==menu)m.classList.remove('open')});
  menu?.classList.toggle('open');
}
document.addEventListener('click',()=>document.querySelectorAll('.video-v11-menu.open').forEach(m=>m.classList.remove('open')));
function videoV11EditPost(btn){
  const post=btn.closest('.video-post-v11');
  const menu=post?.querySelector('.video-v11-menu');
  menu?.classList.remove('open');
  const desc=post?.querySelector('.video-description');
  if(!desc)return;
  const updated=window.prompt('Edit video description:',desc.textContent);
  if(updated!==null && updated.trim()) desc.textContent=updated.trim();
}
function videoV11DeletePost(btn){
  const post=btn.closest('.video-post-v11');
  post?.querySelector('.video-v11-menu')?.classList.remove('open');
  if(post && window.confirm('Delete this post?')) post.remove();
}

function videoV11OpenCommentComposer(el){
  const composer=el.closest('.comment-composer');
  const wrap=composer?.closest('.single-comment-composer');
  if(!composer)return;
  composer.classList.add('active');wrap?.classList.add('open');
  setTimeout(()=>composer.querySelector('.comment-text-area')?.focus(),0);
}
function videoV11CloseCommentComposer(el,event){
  event?.stopPropagation();
  const post=el.closest('.video-post-v11');
  post?.querySelector('.comment-composer')?.classList.remove('active');
  post?.querySelector('.single-comment-composer')?.classList.remove('open');
}
function videoV11SyncComments(post,open){
  const view=post.querySelector('.more-comments');
  const hide=post.querySelector('.hide-comments-inline');
  if(view)view.style.display=open?'none':'';
  hide?.classList.toggle('show',open);
}
function videoV11ToggleComments(btn){
  const post=btn.closest('.video-post-v11');
  const section=post?.querySelector('.comments-section');
  if(!section)return;
  const open=section.classList.toggle('active');
  videoV11SyncComments(post,open);
}
function videoV11HideComments(btn){
  const post=btn.closest('.video-post-v11');
  post?.querySelector('.comments-section')?.classList.remove('active');
  if(post)videoV11SyncComments(post,false);
}
function videoV11PostComment(btn,event){
  event?.stopPropagation();
  const post=btn.closest('.video-post-v11');
  const field=post?.querySelector('.comment-text-area');
  const value=field?.value.trim();
  if(!post||!value)return;
  const latest=post.querySelector('.latest-comment');
  if(latest)latest.innerHTML='<span class="comment-username">@yourusername:</span><span class="latest-comment-copy">'+escapeHTML(value)+'</span><span class="latest-comment-time">now</span>';
  const section=post.querySelector('.comments-section');
  const item=document.createElement('div');item.className='comment-item';
  item.innerHTML='<div class="comment-avatar" aria-hidden="true">y</div><div class="comment-body"><div class="comment-author">@yourusername</div><div>'+escapeHTML(value)+'</div><div class="comment-actions"><button class="comment-action comment-like-button" type="button" onclick="videoV11ToggleCommentLike(this)"><svg class="comment-like-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><span>Like</span></button><button class="comment-action" type="button" onclick="videoV11ReplyToTarget(this,\'@yourusername\')">Reply</button></div></div>';
  section?.appendChild(item);field.value='';section?.classList.add('active');videoV11SyncComments(post,true);videoV11CloseCommentComposer(btn);
}
function videoV11ToggleCommentLike(btn){btn.classList.toggle('liked')}
function videoV11ReplyToTarget(btn,username){
  const post=btn.closest('.video-post-v11');
  const composer=post?.querySelector('.comment-composer');
  const field=composer?.querySelector('.comment-text-area');
  if(!composer||!field)return;
  videoV11OpenCommentComposer(composer);
  field.value=username+' ';field.focus();field.setSelectionRange(field.value.length,field.value.length);
}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.video-post-v11').forEach(post=>{
    const open=post.querySelector('.comments-section')?.classList.contains('active')||false;
    videoV11SyncComments(post,open);
  });
});

/* =========================================================
   BYTE V11 TEST HANDLERS — isolated to .byte-post-v11
   Existing Home Byte-player behavior is intentionally not rebuilt here.
   ========================================================= */
function byteV11ToggleLike(btn){regularToggleLike(btn)}
function byteV11ToggleSave(btn){regularToggleSave(btn)}
function byteV11IncrementReblog(btn){regularIncrementReblog(btn)}
function byteV11TogglePostMenu(event,btn){
  event.stopPropagation();
  const menu=btn.nextElementSibling;
  document.querySelectorAll('.byte-v11-menu.open').forEach(m=>{if(m!==menu)m.classList.remove('open')});
  menu?.classList.toggle('open');
}
document.addEventListener('click',()=>document.querySelectorAll('.byte-v11-menu.open').forEach(m=>m.classList.remove('open')));
function byteV11EditPost(btn){
  const post=btn.closest('.byte-post-v11');
  post?.querySelector('.byte-v11-menu')?.classList.remove('open');
  const caption=post?.querySelector('.byte-caption');
  if(!caption)return;
  const updated=window.prompt('Edit Byte caption:',caption.textContent);
  if(updated!==null && updated.trim()) caption.textContent=updated.trim();
}
function byteV11DeletePost(btn){
  const post=btn.closest('.byte-post-v11');
  post?.querySelector('.byte-v11-menu')?.classList.remove('open');
  if(post && window.confirm('Delete this post?')) post.remove();
}
function byteV11OpenCommentComposer(el){
  const composer=el.closest('.comment-composer');
  const wrap=composer?.closest('.single-comment-composer');
  if(!composer)return;
  composer.classList.add('active');wrap?.classList.add('open');
  setTimeout(()=>composer.querySelector('.comment-text-area')?.focus(),0);
}
function byteV11CloseCommentComposer(el,event){
  event?.stopPropagation();
  const post=el.closest('.byte-post-v11');
  post?.querySelector('.comment-composer')?.classList.remove('active');
  post?.querySelector('.single-comment-composer')?.classList.remove('open');
}
function byteV11SyncComments(post,open){
  const view=post.querySelector('.more-comments');
  const hide=post.querySelector('.hide-comments-inline');
  if(view)view.style.display=open?'none':'';
  hide?.classList.toggle('show',open);
}
function byteV11ToggleComments(btn){
  const post=btn.closest('.byte-post-v11');
  const section=post?.querySelector('.comments-section');
  if(!section)return;
  const open=section.classList.toggle('active');
  byteV11SyncComments(post,open);
}
function byteV11HideComments(btn){
  const post=btn.closest('.byte-post-v11');
  post?.querySelector('.comments-section')?.classList.remove('active');
  if(post)byteV11SyncComments(post,false);
}
function byteV11PostComment(btn,event){
  event?.stopPropagation();
  const post=btn.closest('.byte-post-v11');
  const field=post?.querySelector('.comment-text-area');
  const value=field?.value.trim();
  if(!post||!value)return;
  const latest=post.querySelector('.latest-comment');
  if(latest)latest.innerHTML='<span class="comment-username">@yourusername:</span><span class="latest-comment-copy">'+escapeHTML(value)+'</span><span class="latest-comment-time">now</span>';
  const section=post.querySelector('.comments-section');
  const item=document.createElement('div');item.className='comment-item';
  item.innerHTML='<div class="comment-avatar" aria-hidden="true">y</div><div class="comment-body"><div class="comment-author">@yourusername</div><div>'+escapeHTML(value)+'</div><div class="comment-actions"><button class="comment-action comment-like-button" type="button" onclick="byteV11ToggleCommentLike(this)"><svg class="comment-like-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><span>Like</span></button><button class="comment-action" type="button" onclick="byteV11ReplyToTarget(this,\'@yourusername\')">Reply</button></div></div>';
  section?.appendChild(item);field.value='';section?.classList.add('active');byteV11SyncComments(post,true);byteV11CloseCommentComposer(btn);
}
function byteV11ToggleCommentLike(btn){btn.classList.toggle('liked')}
function byteV11ReplyToTarget(btn,username){
  const post=btn.closest('.byte-post-v11');
  const composer=post?.querySelector('.comment-composer');
  const field=composer?.querySelector('.comment-text-area');
  if(!composer||!field)return;
  byteV11OpenCommentComposer(composer);
  field.value=username+' ';field.focus();field.setSelectionRange(field.value.length,field.value.length);
}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.byte-post-v11').forEach(post=>{
    const open=post.querySelector('.comments-section')?.classList.contains('active')||false;
    byteV11SyncComments(post,open);
  });
});

