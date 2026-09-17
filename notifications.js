/* =========================================================
   NOTIFICATIONS SCRIPT BLOCK 1
   Split from Notifications-Master-V1.html
========================================================= */
(function(){
  "use strict";

  const tabs=[...document.querySelectorAll(".notification-tab")];
  const notifications=[...document.querySelectorAll(".notification-item")];
  const groups=[...document.querySelectorAll(".notification-group")];
  const emptyState=document.getElementById("notificationEmpty");
  const markAll=document.getElementById("markAllReadButton");
  const headerCount=document.getElementById("headerUnreadCount");
  const headerBell=document.querySelector(".header-notifications");

  function updateCounts(){
    const unread=notifications.filter(item=>item.classList.contains("unread")).length;
    const interactions=notifications.filter(item=>item.dataset.category==="interaction").length;
    const communities=notifications.filter(item=>item.dataset.category==="community").length;

    document.getElementById("allCount").textContent=`(${notifications.length})`;
    document.getElementById("interactionCount").textContent=`(${interactions})`;
    document.getElementById("communityCount").textContent=`(${communities})`;

    headerCount.textContent=unread;
    headerCount.style.display=unread ? "flex" : "none";
    markAll.disabled=unread===0;
  }

  function applyFilter(filter){
    notifications.forEach(item=>{
      const show=filter==="all" || item.dataset.category===filter;
      item.classList.toggle("is-filtered",!show);
    });

    groups.forEach(group=>{
      const visible=group.querySelectorAll(".notification-item:not(.is-filtered)").length;
      group.hidden=visible===0;
    });

    emptyState.classList.toggle(
      "show",
      notifications.every(item=>item.classList.contains("is-filtered"))
    );
  }

  tabs.forEach(tab=>{
    tab.addEventListener("click",()=>{
      tabs.forEach(other=>{
        const active=other===tab;
        other.classList.toggle("active",active);
        other.setAttribute("aria-selected",String(active));
      });
      applyFilter(tab.dataset.filter);
    });
  });

  notifications.forEach(item=>{
    item.addEventListener("keydown",event=>{
      if((event.key==="Enter" || event.key===" ") && !event.target.closest("button, textarea")){
        event.preventDefault();
        item.classList.remove("unread");
        updateCounts();
      }
    });
  });

  notifications.forEach(item=>{
    item.addEventListener("click",event=>{
      if(event.target.closest("button, textarea")) return;
      item.classList.remove("unread");
      updateCounts();
    });
  });

  document.querySelectorAll(".like-notification").forEach(button=>{
    button.addEventListener("click",event=>{
      event.stopPropagation();
      const liked=!button.classList.contains("liked");
      button.classList.toggle("liked",liked);
      button.setAttribute("aria-pressed",String(liked));
      button.querySelector(".heart").textContent=liked ? "♥" : "♡";
      button.querySelector("span:last-child").textContent=liked ? "Liked" : "Like";
      button.closest(".notification-item").classList.remove("unread");
      updateCounts();
    });
  });

  document.querySelectorAll(".reply-notification, .quick-reply-prompt").forEach(trigger=>{
    trigger.addEventListener("click",event=>{
      event.stopPropagation();
      const item=trigger.closest(".notification-item");
      const composer=item.querySelector(".quick-reply");
      const opening=!composer.classList.contains("open");

      document.querySelectorAll(".quick-reply.open").forEach(openComposer=>{
        if(openComposer!==composer){
          openComposer.classList.remove("open");
          openComposer.closest(".notification-item")
            .querySelectorAll(".reply-notification, .quick-reply-prompt")
            .forEach(otherTrigger=>otherTrigger.setAttribute("aria-expanded","false"));
        }
      });

      composer.classList.toggle("open",opening);
      item.querySelectorAll(".reply-notification, .quick-reply-prompt")
        .forEach(itemTrigger=>itemTrigger.setAttribute("aria-expanded",String(opening)));

      item.classList.remove("unread");
      updateCounts();

      if(opening) composer.querySelector("textarea").focus();
    });
  });

  document.querySelectorAll(".quick-reply").forEach(composer=>{
    const textarea=composer.querySelector("textarea");
    const postButton=composer.querySelector(".quick-reply-post");
    const cancelButton=composer.querySelector(".quick-reply-cancel");
    const status=composer.querySelector(".quick-reply-status");

    textarea.addEventListener("input",()=>{
      postButton.disabled=!textarea.value.trim();
      status.textContent="";
    });

    cancelButton.addEventListener("click",event=>{
      event.stopPropagation();
      textarea.value="";
      postButton.disabled=true;
      status.textContent="";
      composer.classList.remove("open");
      composer.closest(".notification-item")
        .querySelectorAll(".reply-notification, .quick-reply-prompt")
        .forEach(trigger=>trigger.setAttribute("aria-expanded","false"));
    });

    postButton.addEventListener("click",event=>{
      event.stopPropagation();
      const reply=textarea.value.trim();
      if(!reply) return;

      const item=composer.closest(".notification-item");
      const afterReply=item.querySelector(".notification-after-reply");
      const prompt=item.querySelector(".quick-reply-prompt");
      const replyAction=item.querySelector(".reply-notification");

      item.dataset.lastReply=reply;

      status.textContent="Reply posted.";
      textarea.value="";
      postButton.disabled=true;

      setTimeout(()=>{
        composer.classList.remove("open");
        item.querySelectorAll(".reply-notification, .quick-reply-prompt")
          .forEach(trigger=>trigger.setAttribute("aria-expanded","false"));
        if(prompt) prompt.style.display="none";
        if(replyAction) replyAction.style.display="none";
        if(afterReply) afterReply.classList.add("show");
        status.textContent="";
      },700);
    });

    textarea.addEventListener("click",event=>event.stopPropagation());
  });


  document.querySelectorAll(".reply-again-link").forEach(button=>{
    button.addEventListener("click",event=>{
      event.stopPropagation();
      const item=button.closest(".notification-item");
      const composer=item.querySelector(".quick-reply");
      const afterReply=item.querySelector(".notification-after-reply");
      const thread=item.querySelector(".notification-inline-thread");
      if(!composer) return;
      thread?.classList.remove("open");
      const viewButton=item.querySelector(".view-comments-link");
      if(viewButton) viewButton.textContent="View comments";
      afterReply?.classList.remove("show");
      composer.classList.add("open");
      composer.querySelector("textarea")?.focus();
    });
  });

  function buildNotificationInlineThread(item){
    let thread=item.querySelector(".notification-inline-thread");
    if(thread) return thread;

    const message=item.querySelector(".notification-message")?.textContent || "";
    const preview=item.querySelector(".notification-preview")?.textContent || "";
    const authorMatch=message.match(/(@[\w.-]+)/);
    const author=authorMatch ? authorMatch[1] : "Commenter";
    const initial=(author.replace("@","").charAt(0) || "C").toUpperCase();

    thread=document.createElement("div");
    thread.className="notification-inline-thread";

    const title=document.createElement("div");
    title.className="notification-inline-thread-title";
    title.textContent="Comment thread";

    const original=document.createElement("div");
    original.className="notification-inline-comment";
    original.innerHTML=`
      <div class="notification-inline-comment-avatar">${initial}</div>
      <div class="notification-inline-comment-copy">
        <div class="notification-inline-comment-author">${author}</div>
        <div class="notification-inline-comment-text"></div>
      </div>`;
    original.querySelector(".notification-inline-comment-text").textContent=
      preview.replace(/^["“]|["”]$/g,"");

    thread.append(title,original);

    const lastReply=item.dataset.lastReply;
    if(lastReply){
      const yours=document.createElement("div");
      yours.className="notification-inline-comment";
      yours.innerHTML=`
        <div class="notification-inline-comment-avatar">H</div>
        <div class="notification-inline-comment-copy">
          <div class="notification-inline-comment-author">@SugarCrumbCo</div>
          <div class="notification-inline-comment-text"></div>
        </div>`;
      yours.querySelector(".notification-inline-comment-text").textContent=lastReply;
      thread.append(yours);
    }

    const footer=document.createElement("div");
    footer.className="notification-inline-thread-footer";
    footer.innerHTML=`
      <span>Continue the conversation here or open the full post.</span>
      <button type="button" class="notification-thread-reply">Reply again</button>`;
    thread.append(footer);

    item.querySelector(".notification-copy")?.append(thread);

    footer.querySelector(".notification-thread-reply")?.addEventListener("click",event=>{
      event.stopPropagation();
      const composer=item.querySelector(".quick-reply");
      const afterReply=item.querySelector(".notification-after-reply");
      if(!composer) return;
      thread.classList.remove("open");
      const viewButton=item.querySelector(".view-comments-link");
      if(viewButton) viewButton.textContent="View comments";
      afterReply?.classList.remove("show");
      composer.classList.add("open");
      composer.querySelector("textarea")?.focus();
    });

    return thread;
  }

  document.querySelectorAll(".view-comments-link").forEach(link=>{
    link.addEventListener("click",event=>{
      event.stopPropagation();
      const item=link.closest(".notification-item");
      if(!item) return;

      item.classList.remove("unread");
      updateCounts();

      const thread=buildNotificationInlineThread(item);
      const opening=!thread.classList.contains("open");
      thread.classList.toggle("open",opening);
      link.textContent=opening ? "Hide comments" : "View comments";
    });
  });

  document.querySelectorAll(".notification-summary-cta").forEach(link=>{
    link.addEventListener("click",event=>{
      event.stopPropagation();
      const item=link.closest(".notification-item");
      item?.classList.remove("unread");
      updateCounts();
      link.textContent="Opening post…";
      setTimeout(()=>{link.textContent="View your post →";},800);
    });
  });

  markAll.addEventListener("click",()=>{
    notifications.forEach(item=>item.classList.remove("unread"));
    updateCounts();
  });

  const moreButton=document.getElementById("communityMoreButton");
  const communityDropdown=document.getElementById("communityDropdown");
  const pinnedCommunities=document.getElementById("pinnedCommunities");

  /* Pin state and activity state are deliberately separate.
     Unpinning a Community must NEVER erase its bell or unread count. */
  const notificationCommunityCatalog=[
    {name:"Spooky Cozy",icon:"🎃",pinned:true},
    {name:"Artists",icon:"🎨",pinned:true},
    {name:"Turtle Rescue",icon:"🐢",pinned:true},
    {name:"Book Club",icon:"📚",pinned:false},
    {name:"Crochet Corner",icon:"🧶",pinned:false},
    {name:"Garden & Nature",icon:"🌿",pinned:false}
  ];

  const notificationCommunityActivityCounts={
    "Spooky Cozy":5,
    "Artists":2,
    "Turtle Rescue":1,
    "Book Club":0,
    "Crochet Corner":0,
    "Garden & Nature":0
  };

  function closeCommunityDropdown(){
    communityDropdown?.classList.remove("open");
    moreButton?.setAttribute("aria-expanded","false");
  }

  function communityBellHTML(name){
    const count=Number(notificationCommunityActivityCounts[name] || 0);
    const hidden=count===0;
    return `
      <span class="activity-bell"
            data-community-bell="${name}"
            title="${hidden ? "No new community activity" : `${count} new community ${count===1?"activity":"activities"}`}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
          <path d="M10 21h4"></path>
        </svg>
        <span class="activity-count${hidden ? " hidden" : ""}">${count}</span>
      </span>`;
  }

  function renderNotificationCommunities(){
    if(!pinnedCommunities || !communityDropdown) return;

    pinnedCommunities.innerHTML=notificationCommunityCatalog
      .filter(community=>community.pinned)
      .map(community=>`
        <button class="community-chip"
                type="button"
                data-community="${community.name}">
          <span>${community.icon} ${community.name}</span>
          ${communityBellHTML(community.name)}
        </button>
      `).join("");

    communityDropdown.innerHTML=notificationCommunityCatalog
      .map((community,index)=>`
        <div class="community-more-row" data-community="${community.name}">
          <span class="community-more-name">
            <span>${community.icon}</span>${community.name}
          </span>
          <button class="community-pin ${community.pinned ? "pinned" : ""}"
                  type="button"
                  data-community-index="${index}">
            ${community.pinned ? "Pinned" : "Pin"}
          </button>
        </div>
      `).join("");
  }

  moreButton?.addEventListener("click",event=>{
    event.stopPropagation();
    const opening=!communityDropdown.classList.contains("open");
    communityDropdown.classList.toggle("open",opening);
    moreButton.setAttribute("aria-expanded",String(opening));
  });

  communityDropdown?.addEventListener("click",event=>{
    event.stopPropagation();

    const pinButton=event.target.closest(".community-pin");
    if(!pinButton) return;

    const index=Number(pinButton.dataset.communityIndex);
    const community=notificationCommunityCatalog[index];
    if(!community) return;

    /* Only the pinned flag changes. Bell/count data stays untouched. */
    community.pinned=!community.pinned;
    renderNotificationCommunities();

    /* Keep More open after a pin/unpin so the user can keep editing. */
    communityDropdown.classList.add("open");
    moreButton?.setAttribute("aria-expanded","true");
  });

  pinnedCommunities?.addEventListener("click",event=>{
    const bell=event.target.closest(".activity-bell");
    if(bell){
      event.stopPropagation();
      /* Community Recent Activity page will be wired later.
         For now the bell remains visible and preserves its count. */
      return;
    }
  });

  document.addEventListener("click",closeCommunityDropdown);

  document.addEventListener("keydown",event=>{
    if(event.key==="Escape") closeCommunityDropdown();
  });

  renderNotificationCommunities();

  try{
    const image=localStorage.getItem("allMediaProfileAvatar");
    if(image){
      const avatar=document.getElementById("headerAvatar");
      avatar.style.backgroundImage=`url("${image}")`;
    }
  }catch(err){}


  const postActivityData={
    "pumpkin-shelf":{
      icon:"🎃",
      views:186,
      totalLikes:24,
      unanswered:1,
      log:[
        "<strong>@CozyCatCreates</strong> commented 21 min ago",
        "<strong>3 people</strong> liked this post today",
        "Shown in <strong>Discover</strong> 2 hr ago",
        "Saved to a Pocket 3 hr ago"
      ],
      locations:[
        ["◉","Your Profile"],
        ["♧","Spooky Cozy"],
        ["▱","4 Pockets"],
        ["✦","Discover · last shown today"]
      ],
      note:"This newer post is still getting steady activity."
    },
    "haunted-house":{
      icon:"🏚️",
      views:742,
      totalLikes:91,
      unanswered:1,
      log:[
        "<strong>@NightshadeArt</strong> commented 37 min ago",
        "<strong>@PixelWitch</strong> reblogged it 1 hr ago",
        "Shown in <strong>Discover</strong> today",
        "Saved to another Pocket last week"
      ],
      locations:[
        ["◉","Your Profile"],
        ["♧","Artists"],
        ["▱","6 Pockets"],
        ["✦","Discover · resurfaced today"]
      ],
      note:"This post is getting new activity 8 months after you shared it."
    },
    "crochet-ghost":{
      icon:"👻",
      views:96,
      totalLikes:13,
      unanswered:0,
      log:[
        "Saved to a Pocket 4 days ago",
        "Last comment was 1 week ago"
      ],
      locations:[
        ["◉","Your Profile"],
        ["▱","3 Pockets"],
        ["✦","Discover · last shown 6 days ago"]
      ],
      note:"Quiet right now — but still available to be rediscovered."
    },
    "cozy-games":{
      icon:"🎮",
      views:1280,
      totalLikes:147,
      unanswered:1,
      log:[
        "<strong>2 people</strong> liked this post today",
        "Shown in <strong>Discover</strong> this morning",
        "Reblogged last month"
      ],
      locations:[
        ["◉","Your Profile"],
        ["♧","Cozy Gaming"],
        ["▱","5 Pockets"],
        ["✦","Discover · resurfaced today"]
      ],
      note:"A year-old post is finding people again."
    },
    "autumn-sketch":{
      icon:"🍂",
      views:154,
      totalLikes:31,
      unanswered:0,
      log:[
        "Saved to a Pocket yesterday",
        "Shown in <strong>Discover</strong> 2 days ago"
      ],
      locations:[
        ["◉","Your Profile"],
        ["♧","Artists"],
        ["▱","2 Pockets"],
        ["✦","Discover · last shown 2 days ago"]
      ],
      note:"No new conversation right now, but the post is still circulating."
    }
  };

  const postActivityCards=[...document.querySelectorAll(".post-activity-card")];
  const postActivityDetail=document.getElementById("postActivityDetail");
  const postActivityClose=document.getElementById("postActivityClose");

  function openPostActivity(card){
    const data=postActivityData[card.dataset.postId];
    if(!data || !postActivityDetail) return;

    const isAlreadyOpen=card.classList.contains("active") && !postActivityDetail.hidden;

    if(isAlreadyOpen){
      postActivityDetail.hidden=true;
      card.classList.remove("active");
      return;
    }

    postActivityCards.forEach(other=>other.classList.toggle("active",other===card));

    document.getElementById("postActivityDetailPreview").textContent=data.icon;
    document.getElementById("postActivityDetailTitle").textContent=card.dataset.title;
    document.getElementById("postActivityDetailType").textContent=card.dataset.type;
    document.getElementById("postActivityDetailAge").textContent=card.dataset.age;
    document.getElementById("postActivityNote").textContent=data.note;
    document.getElementById("postActivityViews").textContent=`◉ ${data.views.toLocaleString()} views`;
    document.getElementById("postActivityLikes").textContent=`♥ ${data.totalLikes.toLocaleString()} likes`;
    document.getElementById("postActivityUnanswered").textContent=
      data.unanswered===1 ? "💬 1 unanswered" : `💬 ${data.unanswered} unanswered`;

    document.getElementById("postActivityLog").innerHTML=data.log.map(row=>
      `<div class="post-activity-log-row"><span class="post-activity-log-dot"></span><span>${row}</span></div>`
    ).join("");

    document.getElementById("postActivityLocations").innerHTML=data.locations.map(([icon,label])=>
      `<div class="post-activity-location-row"><span class="post-activity-location-icon">${icon}</span><span>${label}</span></div>`
    ).join("");

    postActivityDetail.hidden=false;
    card.classList.remove("has-new");
  }

  postActivityCards.forEach(card=>{
    card.addEventListener("click",()=>openPostActivity(card));
  });

  postActivityClose?.addEventListener("click",()=>{
    postActivityDetail.hidden=true;
    postActivityCards.forEach(card=>card.classList.remove("active"));
  });



  /* =========================================================
     POST ACTIVITY CATCH-UP TRAYS
  ========================================================= */
  const unansweredToggle=document.getElementById("unansweredToggle");
  const missedLikesToggle=document.getElementById("missedLikesToggle");
  const unansweredTray=document.getElementById("unansweredTray");
  const missedLikesTray=document.getElementById("missedLikesTray");
  const unansweredCount=document.getElementById("unansweredCount");
  const missedLikesCount=document.getElementById("missedLikesCount");
  const unansweredEmpty=document.getElementById("unansweredEmpty");
  const missedLikesEmpty=document.getElementById("missedLikesEmpty");

  function setCatchupTray(toggle,tray,open){
    if(!toggle || !tray) return;
    tray.hidden=!open;
    toggle.setAttribute("aria-expanded",String(open));
  }

  function closeOtherCatchupTray(activeToggle){
    if(activeToggle!==unansweredToggle) setCatchupTray(unansweredToggle,unansweredTray,false);
    if(activeToggle!==missedLikesToggle) setCatchupTray(missedLikesToggle,missedLikesTray,false);
  }

  unansweredToggle?.addEventListener("click",()=>{
    const opening=unansweredToggle.getAttribute("aria-expanded")!=="true";
    closeOtherCatchupTray(unansweredToggle);
    setCatchupTray(unansweredToggle,unansweredTray,opening);
  });

  missedLikesToggle?.addEventListener("click",()=>{
    const opening=missedLikesToggle.getAttribute("aria-expanded")!=="true";
    closeOtherCatchupTray(missedLikesToggle);
    setCatchupTray(missedLikesToggle,missedLikesTray,opening);
  });

  function refreshCatchupCounts(){
    const unanswered=document.querySelectorAll("#unansweredList .unanswered-item:not(.resolved)").length;
    const missed=document.querySelectorAll("#missedLikesList .missed-like-item:not(.resolved)").length;

    if(unansweredCount) unansweredCount.textContent=unanswered;
    if(missedLikesCount) missedLikesCount.textContent=missed;

    if(unansweredEmpty) unansweredEmpty.hidden=unanswered!==0;
    if(missedLikesEmpty) missedLikesEmpty.hidden=missed!==0;

    if(unansweredToggle){
      unansweredToggle.querySelector("span:nth-child(2)").lastChild.textContent=
        unanswered===1 ? " unanswered comment" : " unanswered comments";
    }

    if(missedLikesToggle){
      missedLikesToggle.querySelector("span:nth-child(2)").lastChild.textContent=
        missed===1 ? " missed like" : " missed likes";
    }
  }

  document.querySelectorAll(".catchup-like-comment").forEach(button=>{
    button.addEventListener("click",()=>{
      const liked=button.getAttribute("aria-pressed")!=="true";
      button.setAttribute("aria-pressed",String(liked));
      button.textContent=liked ? "♥ Liked" : "♡ Like";
    });
  });

  document.querySelectorAll(".catchup-reply-open").forEach(button=>{
    button.addEventListener("click",()=>{
      const item=button.closest(".catchup-item");
      const box=item?.querySelector(".catchup-reply-box");
      if(!box) return;

      document.querySelectorAll(".catchup-reply-box.open").forEach(other=>{
        if(other!==box) other.classList.remove("open");
      });

      const opening=!box.classList.contains("open");
      box.classList.toggle("open",opening);
      if(opening) box.querySelector("textarea")?.focus();
    });
  });

  document.querySelectorAll(".catchup-reply-box").forEach(box=>{
    const textarea=box.querySelector("textarea");
    const send=box.querySelector(".catchup-send");
    const cancel=box.querySelector(".catchup-cancel");
    const status=box.querySelector(".catchup-status");
    const item=box.closest(".catchup-item");

    textarea?.addEventListener("input",()=>{
      send.disabled=!textarea.value.trim();
      if(status) status.textContent="";
    });

    cancel?.addEventListener("click",()=>{
      if(textarea) textarea.value="";
      if(send) send.disabled=true;
      if(status) status.textContent="";
      box.classList.remove("open");
    });

    send?.addEventListener("click",()=>{
      const reply=textarea?.value.trim();
      if(!reply || !item) return;
      if(status) status.textContent="Reply posted.";
      setTimeout(()=>{
        item.classList.add("resolved");
        setTimeout(()=>{
          item.remove();
          refreshCatchupCounts();
        },280);
      },500);
    });
  });

  document.querySelectorAll(".catchup-like-back").forEach(button=>{
    button.addEventListener("click",()=>{
      const item=button.closest(".missed-like-item");
      const liked=button.getAttribute("aria-pressed")!=="true";
      button.setAttribute("aria-pressed",String(liked));
      button.textContent=liked ? "♥ Liked back" : "♡ Like back";

      if(liked && item){
        setTimeout(()=>{
          item.classList.add("resolved");
          setTimeout(()=>{
            item.remove();
            refreshCatchupCounts();
          },280);
        },450);
      }
    });
  });

  refreshCatchupCounts();


  updateCounts();
  applyFilter("all");
})();

/* =========================================================
   NOTIFICATIONS SCRIPT BLOCK 2
   Split from Notifications-Master-V1.html
========================================================= */
(function(){
  const bell=document.getElementById("headerNotificationBell");
  const popup=document.getElementById("notificationQuickPopup");
  const seeMore=document.getElementById("quickPopupSeeMore");
  if(!bell || !popup) return;

  function setOpen(open){
    popup.hidden=!open;
    bell.setAttribute("aria-expanded",String(open));
  }

  function refreshUnread(){
    const badge=popup.querySelector("#quickPopupUnread");
    if(!badge) return;
    const count=popup.querySelectorAll(".quick-notification.unread").length;
    badge.textContent=count ? `${count} new` : "Caught up";
  }

  bell.addEventListener("click",function(event){
    event.preventDefault();
    event.stopPropagation();
    setOpen(popup.hidden);
    refreshUnread();
  });

  popup.addEventListener("click",function(event){
    event.stopPropagation();
  });

  popup.querySelectorAll(".quick-like").forEach(function(button){
    button.addEventListener("click",function(){
      const liked=button.getAttribute("aria-pressed")!=="true";
      button.setAttribute("aria-pressed",String(liked));
      button.textContent=liked ? "♥ Liked" : "♡ Like";
      if(liked) button.closest(".quick-notification")?.classList.remove("unread");
      refreshUnread();
    });
  });

  popup.querySelectorAll(".quick-popup-reply-action").forEach(function(button){
    button.addEventListener("click",function(){
      const item=button.closest(".quick-notification");
      const line=item?.querySelector(".quick-reply-line");
      if(!line) return;

      popup.querySelectorAll(".quick-reply-line.open").forEach(function(other){
        if(other!==line) other.classList.remove("open");
      });

      const opening=!line.classList.contains("open");
      line.classList.toggle("open",opening);
      if(opening) line.querySelector("input")?.focus();
    });
  });

  popup.querySelectorAll(".quick-reply-line").forEach(function(line){
    const input=line.querySelector("input");
    const send=line.querySelector(".quick-send");
    const item=line.closest(".quick-notification");
    const replyButton=item?.querySelector(".quick-popup-reply-action");

    input?.addEventListener("input",function(){
      if(send) send.disabled=!input.value.trim();
    });

    input?.addEventListener("keydown",function(event){
      if(event.key==="Enter" && !event.shiftKey && input.value.trim()){
        event.preventDefault();
        send?.click();
      }
    });

    send?.addEventListener("click",function(){
      const reply=input?.value.trim();
      if(!reply) return;

      item?.classList.remove("unread");
      if(replyButton) replyButton.textContent="Replied ✓";
      input.value="";
      send.disabled=true;
      line.classList.remove("open");
      refreshUnread();
    });
  });

  seeMore?.addEventListener("click",function(event){
    event.preventDefault();
    setOpen(false);
    document.getElementById("recentNotificationsTitle")
      ?.scrollIntoView({behavior:"smooth",block:"start"});
  });

  document.addEventListener("click",function(event){
    if(popup.hidden) return;
    if(bell.contains(event.target) || popup.contains(event.target)) return;
    setOpen(false);
  });

  document.addEventListener("keydown",function(event){
    if(event.key==="Escape") setOpen(false);
  });

  refreshUnread();
})();
