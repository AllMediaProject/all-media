(() => {
"use strict";

const STATE_KEY="allMediaCommunityStateV1";
const NOTIFICATION_KEY="allMediaCommunityNotificationsV1";
const READ_KEY="allMediaCommunityNotificationReadV1";
const PIN_ORDER_KEY="allMediaCommunityPinOrderV1";

const DEFAULTS={
  "spooky-cozy":{
    name:"Spooky Cozy",icon:"🎃",joined:true,pinned:true,notifications:true,
    role:"owner",
    description:"Halloween all year, spooky art, crafts, collecting and cozy haunted things."
  },
  "artists":{
    name:"Artists",icon:"🎨",joined:true,pinned:true,notifications:true,
    role:"moderator",
    description:"A shared space for artists across mediums."
  },
  "turtle-rescue":{
    name:"Turtle Rescue",icon:"🐢",joined:true,pinned:true,notifications:true,
    role:"member",
    description:"Rescue, care, rehabilitation and turtle appreciation."
  },
  "book-club":{
    name:"Book Club",icon:"📚",joined:true,pinned:false,notifications:true,
    role:"member",
    description:"Books, reading notes and ongoing group discussions."
  },
  "crochet-corner":{
    name:"Crochet Corner",icon:"🧶",joined:true,pinned:false,notifications:true,
    role:"member",
    description:"Crochet projects, questions, patterns and inspiration."
  },
  "garden-and-nature":{
    name:"Garden & Nature",icon:"🌿",joined:true,pinned:false,notifications:true,
    role:"member",
    description:"Gardening, plants, wildlife and outdoor discoveries."
  }
};

const bar=document.querySelector("[data-notifications-community-bar]");

function clone(value){
  return JSON.parse(JSON.stringify(value));
}

function loadState(){
  const next=clone(DEFAULTS);

  try{
    const saved=JSON.parse(localStorage.getItem(STATE_KEY)||"{}");
    Object.entries(saved).forEach(([slug,value])=>{
      next[slug]={...(next[slug]||{}),...value};
    });
  }catch(error){}

  Object.values(next).forEach(item=>{
    if(item.pinned){
      item.joined=true;
      item.notifications=true;
    }
    if(!item.joined)item.pinned=false;
  });

  return next;
}

let state=loadState();

function saveState(){
  localStorage.setItem(STATE_KEY,JSON.stringify(state));
}

function communityUrl(slug){
  return slug==="spooky-cozy"
    ?"community.html"
    :`community.html?community=${encodeURIComponent(slug)}`;
}

function openCommunity(slug){
  if(!state[slug]||state[slug].deleted)return;
  window.location.href=communityUrl(slug);
}

function joinedCommunities(){
  return Object.entries(state)
    .filter(([,item])=>item.joined&&!item.deleted)
    .sort((a,b)=>(a[1].name||"").localeCompare(b[1].name||""));
}

function loadPinOrder(){
  let savedOrder=[];

  try{
    const saved=JSON.parse(localStorage.getItem(PIN_ORDER_KEY)||"[]");
    if(Array.isArray(saved))savedOrder=saved;
  }catch(error){}

  const pinned=joinedCommunities()
    .filter(([,item])=>item.pinned)
    .map(([slug])=>slug);

  const normalized=savedOrder.filter(slug=>pinned.includes(slug));

  pinned.forEach(slug=>{
    if(!normalized.includes(slug))normalized.push(slug);
  });

  return normalized;
}

function savePinOrder(order){
  localStorage.setItem(PIN_ORDER_KEY,JSON.stringify(order));
}

function sampleNotifications(){
  const now=Date.now();

  return [
    {
      id:"sample-spooky-reply",
      communitySlug:"spooky-cozy",
      communityName:"Spooky Cozy",
      communityIcon:"🎃",
      title:"@LanternMoth replied in a discussion you follow.",
      preview:"“I was wondering the exact same thing — I tried it last year and it worked really well.”",
      timestamp:now-(18*60*1000),
      openable:true
    },
    {
      id:"sample-artists-announcement",
      communitySlug:"artists",
      communityName:"Artists",
      communityIcon:"🎨",
      title:"Artists posted a Community Update.",
      preview:"Monthly critique thread is open. Bring one piece you want thoughtful feedback on.",
      timestamp:now-(72*60*1000),
      openable:true
    },
    {
      id:"sample-turtle-mention",
      communitySlug:"turtle-rescue",
      communityName:"Turtle Rescue",
      communityIcon:"🐢",
      title:"@ShellKeeper mentioned you.",
      preview:"“@yourusername you might like the care resource that was added to this thread.”",
      timestamp:now-(3*60*60*1000),
      openable:true
    },
    {
      id:"sample-mod-mention",
      communitySlug:"spooky-cozy",
      communityName:"Spooky Cozy",
      communityIcon:"🎃",
      title:"@Raven mentioned you in Mod Chat.",
      preview:"“@yourusername can you take a quick look at the October exchange note before it goes live?”",
      recipient:"@yourusername",
      timestamp:now-(4*60*60*1000),
      openable:true
    },
    {
      id:"sample-spooky-mod",
      communitySlug:"spooky-cozy",
      communityName:"Spooky Cozy",
      communityIcon:"🎃",
      title:"A moderator note was added.",
      preview:"@Raven updated a resource note for the October Art Exchange.",
      timestamp:now-(6*60*60*1000),
      openable:true
    },
    {
      id:"sample-book-thread",
      communitySlug:"book-club",
      communityName:"Book Club",
      communityIcon:"📚",
      title:"@RainyDayReads replied in the monthly reading thread.",
      preview:"“Chapter six completely changed how I read the opening scene.”",
      timestamp:now-(28*60*60*1000),
      openable:true
    },
    {
      id:"sample-crochet-announcement",
      communitySlug:"crochet-corner",
      communityName:"Crochet Corner",
      communityIcon:"🧶",
      title:"Crochet Corner posted an announcement.",
      preview:"The work-in-progress thread is open for progress photos, questions, and gentle encouragement.",
      timestamp:now-(3*24*60*60*1000),
      openable:true
    }
  ];
}

function storedNotifications(){
  try{
    const value=JSON.parse(localStorage.getItem(NOTIFICATION_KEY)||"[]");
    if(!Array.isArray(value))return [];

    return value.map((item,index)=>({
      id:item.id||`stored-community-${index}`,
      communitySlug:item.communitySlug||"deleted-community",
      communityName:item.communityName||"Community",
      communityIcon:item.communityIcon||"◉",
      title:item.title||(item.type==="community-deleted"
        ?`${item.communityIcon||"◉"} ${item.communityName||"Community"} was deleted`
        :"Community update"),
      preview:item.message||item.preview||"",
      timestamp:Number(item.timestamp)||Date.now(),
      recipient:item.recipient||null,
      openable:item.deadLink?false:item.openable!==false,
      deadLink:Boolean(item.deadLink)
    }));
  }catch(error){
    return [];
  }
}

function allNotifications(){
  const seen=new Set();

  return [...storedNotifications(),...sampleNotifications()]
    .filter(item=>!item.recipient||item.recipient==="@yourusername")
    .filter(item=>{
      if(seen.has(item.id))return false;
      seen.add(item.id);
      return true;
    })
    .sort((a,b)=>b.timestamp-a.timestamp);
}

function readIds(){
  try{
    const value=JSON.parse(localStorage.getItem(READ_KEY)||"[]");
    return new Set(Array.isArray(value)?value:[]);
  }catch(error){
    return new Set();
  }
}

function saveReadIds(value){
  localStorage.setItem(READ_KEY,JSON.stringify([...value]));
}

function unreadCount(slug){
  const read=readIds();

  return allNotifications()
    .filter(item=>item.communitySlug===slug&&!read.has(item.id))
    .length;
}

function bellMarkup(slug){
  const count=unreadCount(slug);
  const title=count
    ?`${count} unread Community ${count===1?"notification":"notifications"}`
    :"No unread Community notifications";

  return `
    <span
      class="activity-bell"
      data-notifications-community-bell
      data-community-slug="${slug}"
      title="${title}">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
        <path d="M10 21h4"></path>
      </svg>
      <span class="activity-count${count?"":" hidden"}">${count}</span>
    </span>`;
}

let draggedCommunity=null;
let draggedHotbar=null;

function wireChipDrag(chip,hotbar){
  chip.addEventListener("dragstart",event=>{
    if(event.target.closest("[data-notifications-community-bell]")){
      event.preventDefault();
      return;
    }

    draggedCommunity=chip;
    draggedHotbar=hotbar;
    chip.classList.add("dragging");
  });

  chip.addEventListener("dragend",()=>{
    chip.classList.remove("dragging");

    if(draggedHotbar){
      const order=[...draggedHotbar.querySelectorAll(".community-chip")]
        .map(item=>item.dataset.slug);

      savePinOrder(order);
    }

    draggedCommunity=null;
    draggedHotbar=null;
    renderCommunityBar();
  });
}

function closeMore(){
  if(!bar)return;

  bar.querySelector("[data-notifications-community-dropdown]")
    ?.classList.remove("active");

  bar.querySelector("[data-notifications-community-more]")
    ?.setAttribute("aria-expanded","false");
}

function renderCommunityBar(){
  if(!bar)return;

  const hotbar=bar.querySelector("[data-notifications-pinned-communities]");
  const dropdown=bar.querySelector("[data-notifications-community-dropdown]");

  if(!hotbar||!dropdown)return;

  hotbar.innerHTML="";
  dropdown.innerHTML="";

  const joined=joinedCommunities();
  const pinnedOrder=loadPinOrder();
  const bySlug=new Map(joined);

  pinnedOrder.forEach(slug=>{
    const item=bySlug.get(slug);
    if(!item||!item.pinned)return;

    const chip=document.createElement("button");
    chip.type="button";
    chip.className="community-chip";
    chip.draggable=true;
    chip.dataset.slug=slug;

    chip.innerHTML=`
      <span class="community-icon"></span>
      <span class="notifications-community-chip-name"></span>
      ${bellMarkup(slug)}
    `;

    chip.querySelector(".community-icon").textContent=item.icon||"◉";
    chip.querySelector(".notifications-community-chip-name")
      .textContent=item.name||slug;

    chip.addEventListener("click",event=>{
      const bell=event.target.closest("[data-notifications-community-bell]");

      if(bell){
        event.stopPropagation();
        openQuickNotifications(slug,bell);
        return;
      }

      openCommunity(slug);
    });

    wireChipDrag(chip,hotbar);
    hotbar.appendChild(chip);
  });

  joined.forEach(([slug,item])=>{
    const row=document.createElement("div");
    row.className="community-more-row";
    row.tabIndex=0;
    row.setAttribute("role","link");

    const name=document.createElement("span");
    name.className="community-more-name";
    name.innerHTML=
      '<span class="community-icon"></span><span class="notifications-community-more-text"></span>';

    name.querySelector(".community-icon").textContent=item.icon||"◉";
    name.querySelector(".notifications-community-more-text")
      .textContent=item.name||slug;

    const pin=document.createElement("button");
    pin.type="button";
    pin.className="community-pin"+(item.pinned?" pinned":"");
    pin.innerHTML=item.pinned
      ?'<span class="pin-state">Pinned</span><span class="pin-action">Unpin</span>'
      :'<span class="pin-state">Pin</span><span class="pin-action">Pin</span>';

    pin.addEventListener("click",event=>{
      event.stopPropagation();

      item.pinned=!item.pinned;

      if(item.pinned){
        item.joined=true;
        item.notifications=true;
      }

      saveState();

      const order=loadPinOrder();

      if(item.pinned&&!order.includes(slug)){
        order.push(slug);
      }

      if(!item.pinned){
        const index=order.indexOf(slug);
        if(index>=0)order.splice(index,1);
      }

      savePinOrder(order);
      renderCommunityBar();

      bar.querySelector("[data-notifications-community-dropdown]")
        ?.classList.add("active");

      bar.querySelector("[data-notifications-community-more]")
        ?.setAttribute("aria-expanded","true");
    });

    row.addEventListener("click",event=>{
      if(event.target.closest(".community-pin"))return;
      openCommunity(slug);
    });

    row.addEventListener("keydown",event=>{
      if(
        (event.key==="Enter"||event.key===" ") &&
        !event.target.closest(".community-pin")
      ){
        event.preventDefault();
        openCommunity(slug);
      }
    });

    row.append(name,pin);
    dropdown.appendChild(row);
  });
}

const hotbar=bar?.querySelector("[data-notifications-pinned-communities]");
const moreButton=bar?.querySelector("[data-notifications-community-more]");
const manageButton=bar?.querySelector("[data-notifications-manage-communities]");

hotbar?.addEventListener("dragover",event=>{
  event.preventDefault();

  if(draggedHotbar!==hotbar)return;

  const after=[...hotbar.querySelectorAll(".community-chip:not(.dragging)")]
    .find(item=>
      event.clientX<=item.getBoundingClientRect().left+item.offsetWidth/2
    );

  if(draggedCommunity){
    after
      ?hotbar.insertBefore(draggedCommunity,after)
      :hotbar.appendChild(draggedCommunity);
  }
});

hotbar?.addEventListener("wheel",event=>{
  if(Math.abs(event.deltaY)>Math.abs(event.deltaX)){
    event.preventDefault();
    hotbar.scrollLeft+=event.deltaY;
  }
},{passive:false});

moreButton?.addEventListener("click",event=>{
  event.stopPropagation();

  const dropdown=bar.querySelector("[data-notifications-community-dropdown]");
  if(!dropdown)return;

  const opening=!dropdown.classList.contains("active");

  closeMore();
  dropdown.classList.toggle("active",opening);
  moreButton.setAttribute("aria-expanded",String(opening));
});

manageButton?.addEventListener("click",openManageDrawer);

function relativeTime(timestamp){
  const delta=Math.max(0,Date.now()-timestamp);
  const mins=Math.floor(delta/60000);

  if(mins<1)return "now";
  if(mins<60)return `${mins} min`;

  const hours=Math.floor(mins/60);
  if(hours<24)return `${hours} hr`;

  const days=Math.floor(hours/24);
  return days===1?"Yesterday":`${days} days`;
}

function openQuickNotifications(slug,anchor){
  const popup=document.getElementById("notificationsCommunityQuickPopup");
  const list=document.getElementById("notificationsCommunityQuickList");
  const itemState=state[slug];

  if(!popup||!list||!itemState)return;

  closeMore();

  document.getElementById("notificationsCommunityQuickTitle").textContent=
    `${itemState.icon||"◉"} ${itemState.name||slug}`;

  list.innerHTML="";

  const items=allNotifications()
    .filter(item=>item.communitySlug===slug)
    .slice(0,4);

  const read=readIds();

  if(!items.length){
    const empty=document.createElement("div");
    empty.className="notifications-community-quick-empty";
    empty.innerHTML=
      "<strong>You’re caught up.</strong><span>No recent notifications from this Community.</span>";

    list.appendChild(empty);
  }else{
    items.forEach(item=>{
      const row=document.createElement("button");
      row.type="button";
      row.className=
        "notifications-community-quick-item"+(read.has(item.id)?"":" unread");

      row.innerHTML=
        '<span class="notifications-community-quick-item-copy"><strong></strong><span></span></span><small></small>';

      row.querySelector("strong").textContent=item.title;
      row.querySelector(".notifications-community-quick-item-copy > span")
        .textContent=item.preview||"";
      row.querySelector("small").textContent=relativeTime(item.timestamp);

      row.addEventListener("click",()=>{
        read.add(item.id);
        saveReadIds(read);

        popup.hidden=true;
        renderCommunityBar();

        if(item.openable!==false&&!item.deadLink){
          openCommunity(slug);
        }
      });

      list.appendChild(row);
    });
  }

  document.getElementById("notificationsCommunityQuickFooter").href=
    `community-notifications.html?community=${encodeURIComponent(slug)}`;

  popup.hidden=false;

  const rect=anchor.getBoundingClientRect();
  const width=Math.min(410,window.innerWidth-24);
  const left=Math.min(
    window.innerWidth-width-12,
    Math.max(12,rect.right-width)
  );

  popup.style.left=`${left}px`;
  popup.style.top=`${Math.min(window.innerHeight-280,rect.bottom+10)}px`;
}

function closeQuickNotifications(){
  const popup=document.getElementById("notificationsCommunityQuickPopup");
  if(popup)popup.hidden=true;
}

document.getElementById("notificationsCommunityQuickClose")
  ?.addEventListener("click",closeQuickNotifications);

function openManageDrawer(){
  const layer=document.getElementById("notificationsManageDrawerLayer");
  const frame=document.getElementById("notificationsManageDrawerFrame");

  if(!layer||!frame)return;

  closeQuickNotifications();
  closeMore();

  if(!frame.src){
    frame.src="manage-communities.html?panel=1";
  }

  layer.hidden=false;
  document.body.style.overflow="hidden";
}

function closeManageDrawer(){
  const layer=document.getElementById("notificationsManageDrawerLayer");

  if(layer)layer.hidden=true;
  document.body.style.overflow="";
}

document.getElementById("notificationsManageDrawerClose")
  ?.addEventListener("click",closeManageDrawer);

document.getElementById("notificationsManageDrawerBackdrop")
  ?.addEventListener("click",closeManageDrawer);

document.addEventListener("click",event=>{
  if(!event.target.closest("[data-notifications-community-bar] .community-menu")){
    closeMore();
  }

  const popup=document.getElementById("notificationsCommunityQuickPopup");

  if(
    popup &&
    !popup.hidden &&
    !event.target.closest("#notificationsCommunityQuickPopup") &&
    !event.target.closest("[data-notifications-community-bell]")
  ){
    popup.hidden=true;
  }
});

document.addEventListener("keydown",event=>{
  if(event.key!=="Escape")return;

  closeQuickNotifications();
  closeMore();
  closeManageDrawer();
});

window.addEventListener("storage",event=>{
  if(event.key===STATE_KEY){
    state=loadState();
    renderCommunityBar();
  }

  if(
    event.key===NOTIFICATION_KEY ||
    event.key===READ_KEY ||
    event.key===PIN_ORDER_KEY
  ){
    renderCommunityBar();
  }
});

renderCommunityBar();
})();
