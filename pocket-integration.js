(() => {
  const POCKET_PAGE = "pocket-page-prototype.html";
  const CREATE_PAGE = "create-pocket-prototype.html";
  const POCKET_STORAGE_KEY = "allMediaPocketPrototypeV1";
  const SAVED_POSTS_KEY = "allMediaPocketSavedPostsV1";
  const REGISTRY_KEY = "allMediaPocketRegistryV1";

  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>[...root.querySelectorAll(s)];

  function readJSON(key,fallback){
    try{
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    }catch(e){
      return fallback;
    }
  }

  function writeJSON(key,value){
    try{ localStorage.setItem(key,JSON.stringify(value)); }catch(e){}
  }

  function normalizePocketKey(name){
    return String(name||"").trim().toLowerCase();
  }

  function storedCreatedPocket(){
    return readJSON(POCKET_STORAGE_KEY,null);
  }

  function syncStoredPocketIntoHome(){
    const list=$("#yourPocketList");
    if(!list)return;

    const data=storedCreatedPocket();
    if(!data?.name)return;

    let item=list.querySelector('[data-pocket-integrated="true"]');

    if(!item){
      item=document.createElement("div");
      item.className="pocket-item";
      item.dataset.pocketType="owned";
      item.dataset.pocketIntegrated="true";

      const label=document.createElement("span");
      label.className="pocket-label";

      const icon=document.createElement("span");
      icon.className="pocket-icon";

      const name=document.createElement("span");
      name.className="pocket-name";

      label.append(icon,name);

      const star=document.createElement("button");
      star.className="pocket-star";
      star.type="button";
      star.textContent="☆";
      star.title="Add to favorites";
      star.addEventListener("click",event=>{
        event.stopPropagation();
        window.togglePocketFavorite?.(star);
      });

      item.append(label,star);
      list.prepend(item);
    }

    item.dataset.pocketName=data.name;
    $(".pocket-name",item).textContent=data.name;

    const icon=$(".pocket-icon",item);
    icon.textContent="";
    icon.style.backgroundImage="";
    icon.style.backgroundSize="";
    icon.style.backgroundPosition="";
    icon.style.borderRadius="";

    const photo=data.photo||data.cover||"";
    if(data.identityType==="photo" && photo){
      icon.style.backgroundImage=`url("${photo}")`;
      icon.style.backgroundSize="cover";
      icon.style.backgroundPosition="center";
      icon.style.borderRadius="50%";
    }else{
      icon.textContent=data.emoji||data.icon||"▱";
    }

    const star=$(".pocket-star",item);
    const favorite=star?.textContent.trim()==="★";
    star?.setAttribute(
      "aria-label",
      favorite
        ? `Remove ${data.name} from favorites`
        : `Add ${data.name} to favorites`
    );

    window.ensurePocketMenus?.();
    window.updatePocketFavoriteCount?.();
  }

  function pocketRegistry(){
    const registry=readJSON(REGISTRY_KEY,{});

    $$(".pockets-panel .pocket-item").forEach(item=>{
      const name=item.dataset.pocketName||$(".pocket-name",item)?.textContent?.trim();
      if(!name)return;

      const icon=$(".pocket-icon",item);
      registry[normalizePocketKey(name)]={
        name,
        type:item.dataset.pocketType||"owned",
        creator:item.dataset.pocketCreator||"",
        emoji:icon?.textContent?.trim()||"▱"
      };
    });

    const created=storedCreatedPocket();
    if(created?.name){
      registry[normalizePocketKey(created.name)]={
        name:created.name,
        type:"owned",
        creator:"@yourusername",
        identityType:created.identityType||"emoji",
        emoji:created.emoji||created.icon||"▱",
        photo:created.photo||created.cover||"",
        description:created.description||"",
        privacy:created.privacy||created.privacyLabel||"Public",
        interests:created.interests||[],
        hashtags:created.hashtags||[],
        creators:created.creators||[]
      };
    }

    writeJSON(REGISTRY_KEY,registry);
    return registry;
  }

  function pocketPageUrl(item){
    const name=item?.dataset.pocketName||$(".pocket-name",item)?.textContent?.trim()||"Pocket";
    const query=new URLSearchParams();
    query.set("pocket",name);

    if(item?.dataset.pocketType==="followed"){
      query.set("visitor","1");
    }else{
      query.set("owner","1");
    }

    if(item?.dataset.pocketIntegrated==="true"){
      query.set("created","1");
    }

    return `${POCKET_PAGE}?${query.toString()}`;
  }

  function simpleHash(text){
    let hash=2166136261;
    for(let i=0;i<text.length;i++){
      hash^=text.charCodeAt(i);
      hash=Math.imul(hash,16777619);
    }
    return (hash>>>0).toString(36);
  }

  function postType(post){
    if(post.classList.contains("blog-post")||post.classList.contains("blog-post-v11"))return"blog";
    if(post.classList.contains("video-post")||post.classList.contains("video-post-v11"))return"video";
    if(post.classList.contains("byte-post")||post.classList.contains("byte-post-v11"))return"byte";
    return"post";
  }

  function postId(post){
    if(post.dataset.pocketPostId)return post.dataset.pocketPostId;

    const parts=[
      postType(post),
      $(".username",post)?.textContent?.trim()||"",
      $(".blog-title,.video-title",post)?.textContent?.trim()||"",
      $(".caption,.blog-excerpt,.video-description,.byte-caption",post)?.textContent?.trim()||"",
      $("img",post)?.src||$("video",post)?.src||""
    ];

    const id=`p_${simpleHash(parts.join("|"))}`;
    post.dataset.pocketPostId=id;
    return id;
  }

  function stripInlineHandlers(root){
    [root,...$$("*",root)].forEach(el=>{
      [...el.attributes].forEach(attr=>{
        if(/^on/i.test(attr.name))el.removeAttribute(attr.name);
      });
      if(el.id)el.removeAttribute("id");
    });
  }

  function makePocketCardSnapshot(post){
    const clone=post.cloneNode(true);

    stripInlineHandlers(clone);

    clone.classList.remove("sample-post","own-post");
    clone.querySelectorAll(
      ".post-header-right,.regular-post-menu,.blog-v11-menu,.video-v11-menu,.byte-v11-menu,.post-menu-dropdown,.post-menu"
    ).forEach(el=>el.remove());

    clone.querySelectorAll(".active,.open,.show,.shared,.saved").forEach(el=>{
      el.classList.remove("active","open","show","shared","saved");
    });

    const like=$(
      ".regular-like-button,.blog-like-button,.video-like-button,.byte-like-button,.like-button",
      clone
    );
    like?.classList.add("pocket-demo-like");

    const actionButtons=$$(".interactions button",clone);
    actionButtons.forEach(button=>{
      const text=button.textContent.trim().toLowerCase();

      if(text.includes("pocket")){
        button.classList.add("pocket-action","pocket-icon-only");
        button.setAttribute("aria-label","Add to Pocket");
        button.setAttribute("title","Add to Pocket");
        $$("span",button).forEach(span=>{
          if(span.textContent.trim().toLowerCase()==="pocket")span.remove();
        });
      }

      if(text.includes("community")){
        button.classList.add("community-action","pocket-icon-only");
        button.setAttribute("aria-label","Share to Community");
        button.setAttribute("title","Share to Community");
        $$("span",button).forEach(span=>{
          if(span.textContent.trim().toLowerCase()==="community")span.remove();
        });
      }
    });

    $(".more-comments",clone)?.classList.add("pocket-demo-more-comments");
    $(".hashtag-link",clone)?.classList.add("pocket-demo-hashtags");
    $(".comment-composer",clone)?.classList.add("pocket-demo-comment");
    $(".comment-post-button",clone)?.classList.add("pocket-demo-comment-post");
    $(".comment-close-button",clone)?.classList.add("pocket-demo-comment-close");
    $(".hide-comments-inline",clone)?.classList.add("pocket-demo-hide-comments");

    $$(".comment-like-button",clone).forEach(el=>el.classList.add("pocket-demo-comment-like"));
    $$(".comment-actions .comment-action:not(.comment-like-button)",clone).forEach(el=>el.classList.add("pocket-demo-reply"));

    $(".comments-section",clone)?.classList.remove("active");
    $(".post-hashtags",clone)?.classList.remove("active");
    $(".comment-composer",clone)?.classList.remove("active");
    $(".single-comment-composer",clone)?.classList.remove("open");

    return clone.outerHTML;
  }

  function savedMap(){
    return readJSON(SAVED_POSTS_KEY,{});
  }

  function saveMap(map){
    writeJSON(SAVED_POSTS_KEY,map);
  }

  function recordsForPocket(name){
    const map=savedMap();
    return map[normalizePocketKey(name)]||[];
  }

  function postSavedToPocket(name,id){
    return recordsForPocket(name).some(record=>record.id===id);
  }

  function addPostToPocket(name,post){
    const map=savedMap();
    const key=normalizePocketKey(name);
    const id=postId(post);
    const list=map[key]||[];

    if(!list.some(record=>record.id===id)){
      list.unshift({
        id,
        html:makePocketCardSnapshot(post),
        addedAt:Date.now()
      });
    }

    map[key]=list;
    saveMap(map);
  }

  function removePostFromPocket(name,id){
    const map=savedMap();
    const key=normalizePocketKey(name);
    map[key]=(map[key]||[]).filter(record=>record.id!==id);
    saveMap(map);
  }

  function ownedPockets(){
    pocketRegistry();

    const seen=new Set();
    const pockets=[];

    $$('.pockets-panel .pocket-item[data-pocket-type="owned"]').forEach(item=>{
      const name=item.dataset.pocketName||$(".pocket-name",item)?.textContent?.trim();
      if(!name)return;

      const key=normalizePocketKey(name);
      if(seen.has(key))return;
      seen.add(key);

      const icon=$(".pocket-icon",item);
      const style=icon?.style.backgroundImage||"";

      pockets.push({
        name,
        emoji:icon?.textContent?.trim()||"▱",
        photo:style&&style!=="none"?style.replace(/^url\(["']?|["']?\)$/g,""):""
      });
    });

    return pockets;
  }

  function ensureChooserStyles(){
    if($("#amPocketChooserStyles"))return;

    const style=document.createElement("style");
    style.id="amPocketChooserStyles";
    style.textContent=`
      .am-pocket-chooser{
        position:fixed;z-index:10000;width:min(292px,calc(100vw - 24px));
        padding:10px;border:1px solid rgba(255,195,132,.34);border-radius:14px;
        background:linear-gradient(145deg,#182a53,#101e40);
        box-shadow:0 18px 42px rgba(0,0,0,.42);color:#f8f8f2;
        font-family:'Outfit',sans-serif
      }
      .am-pocket-chooser[hidden]{display:none!important}
      .am-pocket-chooser-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:3px 4px 8px}
      .am-pocket-chooser-head strong{font-size:11px;letter-spacing:.08em;color:#ffc384}
      .am-pocket-chooser-close{width:25px;height:25px;border:0;border-radius:50%;background:rgba(255,255,255,.05);color:#aeb7cb;cursor:pointer}
      .am-pocket-chooser-close:hover{color:#ffc384;background:rgba(255,195,132,.08)}
      .am-pocket-chooser-list{display:grid;gap:5px;max-height:260px;overflow:auto}
      .am-pocket-choice{
        width:100%;min-height:42px;padding:7px 8px;display:grid;grid-template-columns:28px minmax(0,1fr) 20px;
        align-items:center;gap:8px;border:1px solid rgba(255,255,255,.07);border-radius:10px;
        background:rgba(255,255,255,.025);color:#e7ecf8;text-align:left;cursor:pointer
      }
      .am-pocket-choice:hover{border-color:rgba(255,195,132,.34);background:rgba(255,195,132,.055)}
      .am-pocket-choice.selected{border-color:rgba(255,195,132,.45);background:rgba(255,195,132,.08);color:#ffc384}
      .am-pocket-choice-icon{width:28px;height:28px;display:grid;place-items:center;border-radius:50%;background:#26365f;font-size:15px;background-size:cover;background-position:center}
      .am-pocket-choice-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:700}
      .am-pocket-choice-check{width:18px;height:18px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.16);border-radius:50%;font-size:10px;color:transparent}
      .am-pocket-choice.selected .am-pocket-choice-check{border-color:#ffc384;background:#ffc384;color:#101a3a}
      .am-pocket-chooser-empty{padding:12px 8px;color:#8995af;font-size:10px;text-align:center}
      .am-pocket-chooser-create{
        width:100%;margin-top:8px;padding:8px 10px;border:1px dashed rgba(255,195,132,.32);border-radius:9px;
        background:transparent;color:#ffc384;font:700 10px 'Outfit',sans-serif;text-align:left;cursor:pointer
      }
      .am-pocket-chooser-create:hover{background:rgba(255,195,132,.06)}
      .am-pocket-chooser-note{min-height:16px;margin-top:6px;padding:0 4px;color:#8f9dbd;font-size:9px}
      .feed .post .pocket-action.pocketed{border-color:#ffc384!important;background:rgba(255,195,132,.11)!important;color:#ffc384!important}
    `;
    document.head.appendChild(style);
  }

  function chooser(){
    let panel=$("#amPocketChooser");
    if(panel)return panel;

    panel=document.createElement("div");
    panel.id="amPocketChooser";
    panel.className="am-pocket-chooser";
    panel.hidden=true;
    panel.innerHTML=`
      <div class="am-pocket-chooser-head">
        <strong>ADD TO POCKET</strong>
        <button class="am-pocket-chooser-close" type="button" aria-label="Close">×</button>
      </div>
      <div class="am-pocket-chooser-list"></div>
      <button class="am-pocket-chooser-create" type="button">＋ Create New Pocket</button>
      <div class="am-pocket-chooser-note" aria-live="polite"></div>
    `;
    document.body.appendChild(panel);

    $(".am-pocket-chooser-close",panel).onclick=()=>closeChooser();
    $(".am-pocket-chooser-create",panel).onclick=()=>location.href=CREATE_PAGE;

    panel.addEventListener("click",event=>{
      const choice=event.target.closest(".am-pocket-choice");
      if(!choice)return;

      const post=panel._activePost;
      if(!post)return;

      const name=choice.dataset.pocketName;
      const id=postId(post);
      const selected=postSavedToPocket(name,id);

      if(selected){
        removePostFromPocket(name,id);
        choice.classList.remove("selected");
        $(".am-pocket-choice-check",choice).textContent="";
        $(".am-pocket-chooser-note",panel).textContent=`Removed from ${name}.`;
      }else{
        addPostToPocket(name,post);
        choice.classList.add("selected");
        $(".am-pocket-choice-check",choice).textContent="✓";
        $(".am-pocket-chooser-note",panel).textContent=`Added to ${name}.`;
      }

      syncPocketActionState(post);
    });

    return panel;
  }

  function positionChooser(panel,button){
    panel.hidden=false;

    const rect=button.getBoundingClientRect();
    const width=panel.offsetWidth||292;
    const height=panel.offsetHeight||260;
    const pad=10;

    let left=Math.min(window.innerWidth-width-pad,Math.max(pad,rect.left));
    let top=rect.bottom+7;

    if(top+height>window.innerHeight-pad){
      top=Math.max(pad,rect.top-height-7);
    }

    panel.style.left=`${left}px`;
    panel.style.top=`${top}px`;
  }

  function openChooser(button){
    const post=button.closest(".feed .post");
    if(!post)return;

    const panel=chooser();
    const list=$(".am-pocket-chooser-list",panel);
    const pockets=ownedPockets();
    const id=postId(post);

    panel._activePost=post;
    panel._activeButton=button;
    $(".am-pocket-chooser-note",panel).textContent="";

    if(!pockets.length){
      list.innerHTML='<div class="am-pocket-chooser-empty">Create a Pocket first, then you can add posts to it here.</div>';
    }else{
      list.innerHTML=pockets.map(pocket=>{
        const selected=postSavedToPocket(pocket.name,id);
        const photoStyle=pocket.photo?` style="background-image:url('${pocket.photo.replace(/'/g,"&#39;")}')"`:"";
        return `
          <button class="am-pocket-choice${selected?" selected":""}" type="button" data-pocket-name="${pocket.name.replace(/"/g,"&quot;")}">
            <span class="am-pocket-choice-icon"${photoStyle}>${pocket.photo?"":pocket.emoji}</span>
            <span class="am-pocket-choice-name">${pocket.name}</span>
            <span class="am-pocket-choice-check">${selected?"✓":""}</span>
          </button>
        `;
      }).join("");
    }

    positionChooser(panel,button);
  }

  function closeChooser(){
    const panel=$("#amPocketChooser");
    if(!panel)return;
    panel.hidden=true;
    panel._activePost=null;
    panel._activeButton=null;
  }

  function anyPocketHasPost(id){
    return Object.values(savedMap()).some(records=>(records||[]).some(record=>record.id===id));
  }

  function syncPocketActionState(post){
    if(!post)return;
    const id=postId(post);
    const saved=anyPocketHasPost(id);

    $$(".pocket-action",post).forEach(button=>{
      button.classList.toggle("pocketed",saved);
      button.setAttribute("aria-pressed",String(saved));
    });
  }

  function syncAllPocketActions(){
    $$(".feed .post").forEach(syncPocketActionState);
  }

  const originalEditOwnedPocket=window.editOwnedPocket;
  window.editOwnedPocket=function(item){
    if(item?.dataset.pocketIntegrated==="true"){
      location.href=CREATE_PAGE+"?edit=1";
      return;
    }
    if(typeof originalEditOwnedPocket==="function")originalEditOwnedPocket(item);
  };

  ensureChooserStyles();
  syncStoredPocketIntoHome();
  pocketRegistry();
  syncAllPocketActions();

  document.addEventListener("click",event=>{
    const pocketButton=event.target.closest?.(".feed .post .pocket-action");
    if(pocketButton){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openChooser(pocketButton);
      return;
    }

    const add=event.target.closest(".pockets-panel .add-pocket");
    if(add){
      event.preventDefault();
      event.stopPropagation();
      location.href=CREATE_PAGE;
      return;
    }

    const item=event.target.closest(".pockets-panel .pocket-item");
    if(item){
      if(event.target.closest(
        "button, a, input, textarea, select, .pocket-row-actions, .pocket-settings-menu"
      ))return;

      event.preventDefault();
      location.href=pocketPageUrl(item);
      return;
    }

    const panel=$("#amPocketChooser");
    if(panel && !panel.hidden && !event.target.closest("#amPocketChooser")){
      closeChooser();
    }
  },true);

  window.addEventListener("resize",closeChooser);
  window.addEventListener("scroll",closeChooser,true);

  new MutationObserver(records=>{
    let hasPosts=false;
    records.forEach(record=>{
      record.addedNodes.forEach(node=>{
        if(node.nodeType!==1)return;
        if(node.matches?.(".feed .post")||node.querySelector?.(".feed .post"))hasPosts=true;
      });
    });
    if(hasPosts)syncAllPocketActions();
  }).observe(document.body,{childList:true,subtree:true});
})();
