(() => {
"use strict";

/*
  ALL MEDIA — VISITOR PROFILE ROUTER

  The existing #otherProfile is the reusable public-user profile.
  No new profile page is created.

  profile.html
      -> existing owner profile

  profile.html?user=moonlitmoth
      -> existing visitor profile, populated for @moonlitmoth
*/

const params=new URLSearchParams(window.location.search);
const requested=params.get("user");

if(!requested)return;

function cleanHandle(value){
  return String(value||"")
    .trim()
    .replace(/^@+/,"")
    .trim();
}

function key(value){
  return cleanHandle(value).toLowerCase();
}

function prettyHandle(handle){
  return cleanHandle(handle)
    .replace(/[._-]+/g," ")
    .replace(/\b\w/g,char=>char.toUpperCase());
}

const ownerHandles=new Set([
  "sugarcrumbco",
  "yourusername"
]);

const profiles={
  "moonlitmoth":{
    displayName:"Moonlit Moth",
    bio:"Spooky little paintings, moonlit color palettes, and art that feels like it belongs in a tiny haunted cottage.",
    about:"I make cozy, slightly haunted art and collect the little details that make autumn feel like it lasts all year.",
    interests:[["🎨","Art"],["🎃","Halloween"],["🌙","Cozy"],["🏠","Home & Decor"]],
    topic:"🎨 Art",
    media:"MOONLIT ART PREVIEW",
    caption:"Finally finished this little piece tonight. 🌙 I wanted it to feel like something you might find tucked away in an old haunted house!"
  },
  "paperlantern":{
    displayName:"Paper Lantern",
    bio:"Sketchbooks, books, small creative habits, and quiet things worth writing down.",
    about:"I like tiny notebooks, marginal notes, old paper, and creative routines that do not need to become big projects to matter.",
    interests:[["📚","Books"],["📝","Writing"],["🎨","Art"],["🍂","Cozy"]],
    topic:"📚 Books",
    media:"AUTUMN SKETCHBOOK PREVIEW",
    caption:"I started carrying a tiny sketchbook this fall because I wanted somewhere to put all the little ideas that never felt big enough for a full project."
  },
  "littletrails":{
    displayName:"Little Trails",
    bio:"Rainy walks, quiet trails, and small outdoor moments.",
    about:"Mostly here for slow walks, trail sounds, wet leaves, and the kind of mornings that make you want to stay outside longer.",
    interests:[["🌲","Nature"],["🏕","Outdoors"],["📷","Photography"]],
    topic:"🌲 Nature",
    media:"RAINY TRAIL PREVIEW",
    caption:"A slow walk through one of the trails near me after a rainy morning."
  },
  "threadorbit":{
    displayName:"Thread Orbit",
    bio:"Crochet, tiny creatures, yarn experiments, and things with faces.",
    about:"I make small crochet projects, test weird little ideas, and usually end up giving everything a face.",
    interests:[["🧶","Crochet"],["✨","DIY"],["🎨","Art"]],
    topic:"🧶 Crochet",
    media:"CROCHET PREVIEW",
    caption:"Thirty seconds of watching this tiny mushroom finally get its face."
  },
  "fernfriend":{
    displayName:"Fern Friend",
    bio:"Plants, soft rooms, sunny windows, and small changes that make a space feel better.",
    about:"I like moving plants around until a room finally feels right and documenting the tiny changes along the way.",
    interests:[["🪴","Plants"],["🏠","Home & Decor"],["🌿","Nature"]],
    topic:"🪴 Plants",
    media:"PLANT CORNER PREVIEW",
    caption:"This corner used to get ignored completely. Moving two shelves around changed the whole room."
  },
  "roadsideoddities":{
    displayName:"Roadside Oddities",
    bio:"Old cars, roadside finds, diners, signs, and things worth stopping for.",
    about:"I notice the things on road trips that make everybody else ask why we are pulling over.",
    interests:[["🚙","Vehicles"],["📷","Photography"],["✈️","Travel"]],
    topic:"🚙 Vehicles",
    media:"ROADSIDE PHOTO PREVIEW",
    caption:"Found this little beauty parked outside a roadside diner. I know almost nothing about it, but the color stopped me in my tracks."
  },
  "belowblue":{
    displayName:"Below Blue",
    bio:"Shorelines, tide pools, marine life, and quiet field notes.",
    about:"I share small observations from the shoreline and the things that change when weather, tides, and wildlife move through.",
    interests:[["🐋","Marine Life"],["🔬","Science"],["🌊","Nature"]],
    topic:"🐋 Marine Life",
    media:"SHORELINE PREVIEW",
    caption:"A few quiet minutes from a shoreline survey. The tide pools looked completely different after the storm."
  },
  "oddmotors":{
    displayName:"Odd Motors",
    bio:"Forgotten dashboards, strange details, old machines, and design with personality.",
    about:"I am here for mechanical details that are too chunky, too weird, or too charming to disappear.",
    interests:[["🚗","Vehicles"],["⚙️","Design"],["📷","Photography"]],
    topic:"🚗 Vehicles",
    media:"DASHBOARD PREVIEW",
    caption:"One of my favorite forgotten dashboard designs. Everything is chunky, mechanical, and weirdly charming."
  },
  "smallhistories":{
    displayName:"Small Histories",
    bio:"Ordinary objects, museum labels, archives, and the tiny stories hiding inside them.",
    about:"I love the moment an everyday object stops being ordinary because somebody tells you who carried it, repaired it, or refused to throw it away.",
    interests:[["🗝","History"],["🏛","Museums"],["📚","Books"]],
    topic:"🗝 History",
    media:"HISTORY NOTE PREVIEW",
    caption:"Museum collections are full of objects that look mundane until someone tells you who carried them, repaired them, wrote on them, or refused to throw them away."
  },
  "kitchenscience":{
    displayName:"Kitchen Science",
    bio:"Tiny experiments, everyday science, and dramatic results from ordinary things.",
    about:"Simple experiments are my favorite way to make science feel less like a subject and more like something happening right in front of you.",
    interests:[["🔬","Science"],["✨","Learning"],["🍜","Food"]],
    topic:"🔬 Science",
    media:"EXPERIMENT PREVIEW",
    caption:"A tiny experiment with surface tension that looks much more dramatic than it has any right to."
  },
  "lookuparchive":{
    displayName:"Look Up Archive",
    bio:"Architecture, overlooked details, stairs, railings, windows, and the things above eye level.",
    about:"A running archive of building details I nearly walked past.",
    interests:[["🏛","Architecture"],["📷","Photography"],["🎨","Design"]],
    topic:"🏛 Architecture",
    media:"ARCHITECTURE PREVIEW",
    caption:"A staircase I nearly walked past. The railings curve differently on every landing."
  },
  "northofhere":{
    displayName:"North of Here",
    bio:"Camping, outdoor meals, trails, and uncomplicated days outside.",
    about:"Mostly camp food, trail notes, and reminders that simple things are somehow better outside.",
    interests:[["🏕","Outdoors"],["🌲","Nature"],["🍜","Food"]],
    topic:"🏕 Outdoors",
    media:"CAMP PREVIEW",
    caption:"Cooking something extremely basic outside somehow makes it taste ten times better."
  },
  "ravenandruins":{
    displayName:"Raven & Ruins",
    bio:"Painting process, spooky windows, old places, and art in the awkward middle stage.",
    about:"I like showing the whole process, especially the part before a painting has figured out what it wants to be.",
    interests:[["🎨","Art"],["🎃","Halloween"],["🏚️","Architecture"]],
    topic:"🎨 Art",
    media:"PAINTING PROCESS PREVIEW",
    caption:"A quiet full-process painting from the first background layer through the final little highlights."
  },
  "cozycryptid":{
    displayName:"Cozy Cryptid",
    bio:"Black cats, candles, pumpkins, cozy corners, and gently haunted nonsense.",
    about:"My favorite decorating style is somewhere between cozy evening and suspiciously haunted cottage.",
    interests:[["🎃","Halloween"],["🐈‍⬛","Animals"],["✨","Cozy"]],
    topic:"🎃 Halloween",
    media:"COZY CRYPTID PREVIEW",
    caption:"My familiar approves of tonight's candle-and-pumpkin setup. 🐈‍⬛🕯️"
  },
  "alexrivera.photo":{
    displayName:"Alex Rivera",
    bio:"Film photographer chasing light leaks, quiet streets, old greenhouses, and the little moments that feel like they belong in a zine.",
    about:"Photographer for 8 years, mostly self-taught. I shoot film because I love the delay — not knowing if I got it until weeks later.",
    interests:[["📷","Photography"],["🎞️","Film"],["🌿","Nature"],["✈️","Travel"],["📚","Zines"]],
    topic:"📷 Photography",
    media:"35MM PHOTO PREVIEW",
    caption:"A frame from an early-morning walk through an abandoned greenhouse. The fog did most of the work — I just happened to bring the camera."
  }
};

const rawHandle=cleanHandle(requested);
const requestedKey=key(rawHandle);

if(ownerHandles.has(requestedKey)){
  if(typeof showPrototypeView==="function"){
    showPrototypeView("myProfile");
  }else{
    document.querySelectorAll(".profile-view").forEach(view=>
      view.classList.toggle("active",view.id==="myProfile")
    );
  }
  return;
}

const data=profiles[requestedKey] || {
  displayName:prettyHandle(rawHandle) || "All Media User",
  bio:`Posts, conversations, and things shared by @${rawHandle}.`,
  about:`This is @${rawHandle}'s public All Media profile.`,
  interests:[["✨","Community"],["🔎","Discovery"]],
  topic:"✨ Community",
  media:"POST PREVIEW",
  caption:`A recent post shared by @${rawHandle}.`
};

if(typeof showPrototypeView==="function"){
  showPrototypeView("otherProfile");
}else{
  document.querySelectorAll(".profile-view").forEach(view=>
    view.classList.toggle("active",view.id==="otherProfile")
  );
  window.scrollTo({top:0});
}

const root=document.getElementById("otherProfile");
if(!root)return;

const displayName=root.querySelector(".profile-display-name");
const handle=root.querySelector(".profile-handle-large");
const bio=root.querySelector(".profile-bio");
const avatar=root.querySelector(".profile-avatar");
const interests=root.querySelector(".profile-interests");
const stats=root.querySelector(".profile-stats");
const aboutText=root.querySelector(".about-text");

if(displayName)displayName.textContent=data.displayName;
if(handle)handle.textContent=`@${rawHandle}`;
if(bio)bio.textContent=data.bio;

if(avatar){
  avatar.textContent=(data.displayName||rawHandle||"U")
    .trim()
    .charAt(0)
    .toUpperCase();
  avatar.style.backgroundImage="";
}

if(interests){
  interests.innerHTML=data.interests
    .map(([emoji,label])=>
      `<span class="profile-interest">${emoji} ${label}</span>`
    )
    .join("");
}

if(stats){
  stats.innerHTML=
    `<span><strong>1+</strong> Posts</span>`+
    `<span><strong>—</strong> Supporters</span>`;
}

if(aboutText){
  aboutText.textContent=data.about;
  aboutText.dataset.fullText=data.about;
  aboutText.dataset.shortText=
    data.about.length>96
      ?data.about.slice(0,93).trimEnd()+"…"
      :data.about;

  const readButton=aboutText.nextElementSibling;
  if(readButton?.classList.contains("about-read")){
    const needsToggle=data.about.length>96;
    readButton.style.display=needsToggle?"":"none";
    readButton.dataset.open="false";
    readButton.textContent="Read more";

    if(needsToggle){
      aboutText.textContent=aboutText.dataset.shortText;
    }
  }
}

/* Reuse the existing visitor-profile post card instead of creating
   a separate profile implementation for every sample account. */
root.querySelectorAll(".profile-feed .post .username")
  .forEach(el=>el.textContent=`@${rawHandle}`);

root.querySelectorAll(".profile-feed .post .profile-picture")
  .forEach(el=>{
    el.textContent=(data.displayName||rawHandle||"U")
      .trim()
      .charAt(0)
      .toLowerCase();
    el.style.backgroundImage="";
  });

const firstPost=root.querySelector("#otherPostsPanel .post");
if(firstPost){
  const topic=firstPost.querySelector(".topic");
  const preview=firstPost.querySelector(".profile-v11-media-placeholder");
  const caption=firstPost.querySelector(".caption");

  if(topic)topic.textContent=data.topic;
  if(preview)preview.textContent=data.media;
  if(caption)caption.textContent=data.caption;
}

/* Existing About gallery / public sections remain the same reusable
   visitor-profile structure. No second profile page is introduced. */

document.title=`${data.displayName} (@${rawHandle}) | All Media`;
})();
