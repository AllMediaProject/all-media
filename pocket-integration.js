(() => {
  const POCKET_PAGE = "pocket-page-prototype.html";
  const CREATE_PAGE = "create-pocket-prototype.html";
  const CREATED_KEY = "allMediaPocketPrototypeV1";
  const SAVED_KEY = "allMediaPocketSavedPostsV1";
  const REGISTRY_KEY = "allMediaPocketRegistryV1";

  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>[...root.querySelectorAll(s)];

  function readJSON(key,fallback){
    try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}
    catch{return fallback}
  }

  function writeJSON(key,value){
    try{localStorage.setItem(key,JSON.stringify(value))}catch{}
  }

  function key(name){
    return String(name||"").trim().toLowerCase();
  }

  function hash(text){
    let h=2166136261;
    for(let i=0;i<text.length;i++){
      h^=text.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return (h>>>0).toString(36);
  }

  function postId(post){
    if(post.dataset.pocketPostId)return post.dataset.pocketPostId;

    const id="p_"+hash([
      $(".username",post)?.textContent||"",
      $(".blog-title,.video-title",post)?.textContent||"",
      $(".caption,.blog-excerpt,.video-description,.byte-caption",post)?.textContent||"",
      $("img",post)?.src||"",
      $("video",post)?.src||""
    ].join("|"));

    post.dataset.pocketPostId=id;
    return id;
  }

  function savedMap(){
    return readJSON(SAVED_KEY,{});
  }

  function isSavedAnywhere(id){
    return Object.values(savedMap()).some(
      list=>(list||[]).some(x=>x.id===id)
    );
  }

  function snapshot(post){
    const clone=post.cloneNode(true);

    [clone,...$$("*",clone)].forEach(el=>{
      [...el.attributes].forEach(a=>{
        if(/^on/i.test(a.name))el.removeAttribute(a.name);
      });

      if(el.id)el.removeAttribute("id");
    });

    clone.querySelectorAll(
      ".active,.open,.show,.shared,.saved"
    ).forEach(el=>{
      el.classList.remove(
        "active",
        "open",
        "show",
        "shared",
        "saved"
      );
    });

    return clone.outerHTML;
  }

  function addToPocket(name,post){
    const map=savedMap();
    const k=key(name);
    const id=postId(post);
    const list=map[k]||[];

    if(!list.some(x=>x.id===id)){
      list.unshift({
        id,
        html:snapshot(post),
        addedAt:Date.now()
      });
    }

    map[k]=list;
    writeJSON(SAVED_KEY,map);
  }

  function removeFromPocket(name,post){
    const map=savedMap();
    const k=key(name);
    const id=postId(post);

    map[k]=(map[k]||[]).filter(x=>x.id!==id);

    writeJSON(SAVED_KEY,map);
  }

  function isInPocket(name,post){
    const id=postId(post);

    return (savedMap()[key(name)]||[]).some(
      x=>x.id===id
    );
  }
function isPocketButton(button){
  if(!button)return false;

  if(button.classList.contains("pocket-action")){
    return true;
  }

  return [...button.querySelectorAll("span")].some(
    span=>span.textContent.trim().toLowerCase()==="pocket"
  );
}

function normalizePocketButtons(root=document){
  root.querySelectorAll?.(
    ".feed .post .interactions button"
  ).forEach(button=>{
    if(isPocketButton(button)){
      button.classList.add("pocket-action");
    }
  });
}
  function syncButton(post){
    const active=isSavedAnywhere(postId(post));

    $$(".pocket-action",post).forEach(btn=>{
      btn.classList.toggle("pocketed",active);
      btn.setAttribute("aria-pressed",String(active));
    });
  }

  function ownedPockets(){
    const seen=new Set();
    const result=[];

    $$('.pockets-panel .pocket-item[data-pocket-type="owned"]')
      .forEach(item=>{

        const name=
          item.dataset.pocketName||
          $(".pocket-name",item)?.textContent?.trim();

        if(!name)return;

        const k=key(name);

        if(seen.has(k))return;

        seen.add(k);

        const icon=$(".pocket-icon",item);

        result.push({
          name,
          emoji:icon?.textContent?.trim()||"▱"
        });
      });

    const created=readJSON(CREATED_KEY,null);

    if(created?.name && !seen.has(key(created.name))){
      result.unshift({
        name:created.name,
        emoji:created.emoji||created.icon||"▱"
      });
    }

    return result;
  }
function pocketSignalWords(value){
  const words=String(value||"")
    .toLowerCase()
    .replace(/^#/,"")
    .match(/[a-z0-9]+/g)||[];

  const whole=words.join("");

  return [...new Set(
    [...words,whole].filter(Boolean)
  )];
}

function pocketHashtagSignal(value){
  return String(value||"")
    .toLowerCase()
    .replace(/^#/,"")
    .replace(/[^a-z0-9]+/g,"");
}

function postPocketMatchData(post){
  const topics=new Set();
  const hashtags=new Set();

  $$(".topic",post).forEach(el=>{
    pocketSignalWords(el.textContent)
      .forEach(signal=>topics.add(signal));
  });

  $$(".post-hashtags .post-hashtag",post)
    .forEach(el=>{
      const signal=
        pocketHashtagSignal(el.textContent);

      if(signal){
        hashtags.add(signal);
      }
    });

  return {topics,hashtags};
}

function pocketMatchData(pocket){
  const registry=
    readJSON(REGISTRY_KEY,{});

  const meta=
    registry[key(pocket.name)]||{};

  const topics=new Set();
  const hashtags=new Set();

  // Fallback for older prototype Pockets that
  // don't have saved Topic metadata yet.
  pocketSignalWords(pocket.name)
    .forEach(signal=>topics.add(signal));

  (meta.interests||[]).forEach(item=>{
    const value=
      typeof item==="string"
        ? item
        : item?.name;

    pocketSignalWords(value)
      .forEach(signal=>topics.add(signal));
  });

  (meta.hashtags||[]).forEach(tag=>{
    const signal=
      pocketHashtagSignal(tag);

    if(signal){
      hashtags.add(signal);
    }
  });

  return {topics,hashtags};
}

function pocketMatchesPost(pocket,post){
  const postData=
    postPocketMatchData(post);

  const pocketData=
    pocketMatchData(pocket);

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
  function ensureStyles(){
    if($("#pocketChooserStyles"))return;

    const style=document.createElement("style");

    style.id="pocketChooserStyles";

    style.textContent=`
      .am-pocket-chooser{
        position:fixed;
        z-index:10000;
        width:min(290px,calc(100vw - 24px));
        padding:10px;
        border:1px solid rgba(255,195,132,.35);
        border-radius:14px;
        background:linear-gradient(145deg,#182a53,#101e40);
        box-shadow:0 18px 42px rgba(0,0,0,.42);
        color:#f8f8f2;
        font-family:'Outfit',sans-serif;
      }

      .am-pocket-chooser[hidden]{
        display:none!important;
      }

      .am-pocket-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:3px 3px 8px;
      }

      .am-pocket-head strong{
        font-size:11px;
        letter-spacing:.08em;
        color:#ffc384;
      }

      .am-pocket-close{
        width:25px;
        height:25px;
        border:0;
        border-radius:50%;
        background:rgba(255,255,255,.05);
        color:#aeb7cb;
        cursor:pointer;
      }

      .am-pocket-list{
  display:grid;
  gap:5px;
  max-height:min(360px,55vh);
  overflow-y:auto;
  overflow-x:hidden;
  padding-right:4px;
  scrollbar-gutter:stable;
}

.am-pocket-list::-webkit-scrollbar{
  width:6px;
}

.am-pocket-list::-webkit-scrollbar-track{
  background:transparent;
}

.am-pocket-list::-webkit-scrollbar-thumb{
  background:rgba(255,195,132,.28);
  border-radius:999px;
}

.am-pocket-list::-webkit-scrollbar-thumb:hover{
  background:rgba(255,195,132,.48);
}
.am-pocket-show-all{
  width:100%;
  margin-top:7px;
  padding:7px 8px;
  border:0;
  background:transparent;
  color:#9aa7c2;
  font:700 9px 'Outfit',sans-serif;
  text-align:left;
  cursor:pointer;
}

.am-pocket-show-all:hover{
  color:#ffc384;
}

.am-pocket-show-all[hidden]{
  display:none!important;
}
      .am-pocket-choice{
        width:100%;
        min-height:42px;
        padding:7px 8px;
        display:grid;
        grid-template-columns:28px 1fr 18px;
        align-items:center;
        gap:8px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:10px;
        background:rgba(255,255,255,.025);
        color:#eef2fb;
        text-align:left;
        cursor:pointer;
      }

      .am-pocket-choice:hover{
        border-color:rgba(255,195,132,.38);
        background:rgba(255,195,132,.06);
      }

      .am-pocket-choice.selected{
        border-color:#ffc384;
        background:rgba(255,195,132,.10);
        color:#ffc384;
      }

      .am-pocket-icon{
        width:28px;
        height:28px;
        display:grid;
        place-items:center;
        border-radius:50%;
        background:#26365f;
      }

      .am-pocket-check{
        width:18px;
        height:18px;
        display:grid;
        place-items:center;
        border:1px solid rgba(255,255,255,.18);
        border-radius:50%;
        font-size:10px;
        color:transparent;
      }

      .am-pocket-choice.selected .am-pocket-check{
        background:#ffc384;
        border-color:#ffc384;
        color:#101a3a;
      }

      .am-pocket-create{
        width:100%;
        margin-top:8px;
        padding:8px 10px;
        border:1px dashed rgba(255,195,132,.35);
        border-radius:9px;
        background:transparent;
        color:#ffc384;
        font:700 10px 'Outfit',sans-serif;
        text-align:left;
        cursor:pointer;
      }

      .am-pocket-note{
        min-height:15px;
        padding:6px 3px 0;
        color:#8f9dbd;
        font-size:9px;
      }

      .feed .post .pocket-action.pocketed{
        border-color:#ffc384!important;
        background:rgba(255,195,132,.11)!important;
        color:#ffc384!important;
      }
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

    $(".am-pocket-close",panel).onclick=()=>{
      panel.hidden=true;
    };


    panel.addEventListener("click",e=>{
      const choice=e.target.closest(".am-pocket-choice");

      if(!choice)return;

      const post=panel._post;

      if(!post)return;

      const name=choice.dataset.name;

      if(isInPocket(name,post)){
        removeFromPocket(name,post);

        choice.classList.remove("selected");

        $(".am-pocket-check",choice).textContent="";

        $(".am-pocket-note",panel).textContent=
          `Removed from ${name}.`;
      }else{
        addToPocket(name,post);

        choice.classList.add("selected");

        $(".am-pocket-check",choice).textContent="✓";

        $(".am-pocket-note",panel).textContent=
          `Added to ${name}.`;
      }

      syncButton(post);
    });

    return panel;
  }

  function openChooser(button){
  ensureStyles();

  const post=
    button.closest(".feed .post");

  if(!post)return;

  try{
    syncRegistry();
  }catch(e){
    console.error(e);
  }

  const panel=chooser();
  const list=
    $(".am-pocket-list",panel);

  const showAll=
    $(".am-pocket-show-all",panel);

  const pockets=
    ownedPockets();

  panel._post=post;

  $(".am-pocket-note",panel)
    .textContent="";

  function renderChoices(items){
    list.innerHTML=items.map(p=>{

      const selected=
        isInPocket(p.name,post);

      return `
        <button
          class="am-pocket-choice${selected?" selected":""}"
          type="button"
          data-name="${p.name.replace(/"/g,"&quot;")}"
        >
          <span class="am-pocket-icon">${p.emoji}</span>
          <span>${p.name}</span>
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
    const matches=
      pockets.filter(
        pocket=>pocketMatchesPost(pocket,post)
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
      // If every Pocket matches OR nothing matches,
      // simply show the complete list.
      renderChoices(pockets);

      showAll.hidden=true;
    }
  }

  panel.hidden=false;

  const r=
    button.getBoundingClientRect();

  const w=
    panel.offsetWidth||290;

  const h=
    panel.offsetHeight||250;

  const pad=10;

  let left=Math.min(
    window.innerWidth-w-pad,
    Math.max(pad,r.left)
  );

  let top=r.bottom+7;

  if(
    top+h >
    window.innerHeight-pad
  ){
    top=Math.max(
      pad,
      r.top-h-7
    );
  }

  panel.style.left=`${left}px`;
  panel.style.top=`${top}px`;
}

  function syncRegistry(){
    const registry={};

    $$(".pockets-panel .pocket-item")
      .forEach(item=>{

        const name=
          item.dataset.pocketName||
          $(".pocket-name",item)?.textContent?.trim();

        if(!name)return;

        registry[key(name)]={
          name,
          type:item.dataset.pocketType||"owned",
          creator:item.dataset.pocketCreator||"",
          emoji:
            $(".pocket-icon",item)?.textContent?.trim()||
            "▱"
        };
      });

    const created=readJSON(CREATED_KEY,null);

    if(created?.name){
      registry[key(created.name)]={
        ...created,
        name:created.name,
        type:"owned"
      };
    }

    writeJSON(
      REGISTRY_KEY,
      registry
    );
  }

  /*
   * IMPORTANT:
   * Pocket click handling is registered BEFORE
   * any startup syncing happens.
   */
  document.addEventListener(
    "click",
    e=>{

      const pocketButton=
        e.target.closest?.(
          ".feed .post .pocket-action"
        );

      if(pocketButton){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        try{
          openChooser(pocketButton);
        }catch(error){
          console.error(
            "Pocket chooser error:",
            error
          );

          alert(
            "The Pocket chooser hit an error. Open DevTools Console to see the exact error."
          );
        }

        return;
      }

      const add=
        e.target.closest?.(
          ".pockets-panel .add-pocket"
        );

      if(add){
        e.preventDefault();
        e.stopPropagation();

        location.href=
          CREATE_PAGE;

        return;
      }

      const item=
        e.target.closest?.(
          ".pockets-panel .pocket-item"
        );

      if(
        item &&
        !e.target.closest(
          "button,a,input,textarea,select"
        )
      ){
        e.preventDefault();

        location.href=
          pocketUrl(item);

        return;
      }

      const panel=
        $("#amPocketChooser");

      if(
        panel &&
        !panel.hidden &&
        !e.target.closest(
          "#amPocketChooser"
        )
      ){
        panel.hidden=true;
      }
    },
    true
  );

  window.addEventListener(
    "resize",
    ()=>{
      $("#amPocketChooser")
        ?.setAttribute(
          "hidden",
          ""
        );
    }
  );

  window.addEventListener(
    "scroll",
    ()=>{
      $("#amPocketChooser")
        ?.setAttribute(
          "hidden",
          ""
        );
    },
    true
  );

  requestAnimationFrame(()=>{
  try{
    normalizePocketButtons();
  }catch(e){
    console.error(e);
  }

  try{
    ensureStyles();
    }catch(e){
      console.error(e);
    }

    try{
      syncCreatedPocket();
    }catch(e){
      console.error(e);
    }

    try{
      syncRegistry();
    }catch(e){
      console.error(e);
    }

    try{
      $$(".feed .post")
        .forEach(syncButton);
    }catch(e){
      console.error(e);
    }
  });

  new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){

        if(node.nodeType!==1){
          continue;
        }

        if(
          node.matches?.(
            ".feed .post"
          )
        ){
          syncButton(node);
        }

        node.querySelectorAll?.(
          ".feed .post"
        ).forEach(syncButton);
      }
    }
  }).observe(
    document.body,
    {
      childList:true,
      subtree:true
    }
  );
})();
