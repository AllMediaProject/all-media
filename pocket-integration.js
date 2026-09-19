(() => {
  const POCKET_PAGE = "pocket-page-prototype.html";
  const CREATE_PAGE = "create-pocket-prototype.html";
  const STORAGE_KEY = "allMediaPocketPrototypeV1";

  function readStoredPocket(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    }catch(e){
      return null;
    }
  }

  function pocketPageUrl(item){
    if(item?.dataset.pocketIntegrated === "true"){
      return POCKET_PAGE + "?created=1&owner=1";
    }
    return item?.dataset.pocketType === "followed"
      ? POCKET_PAGE + "?visitor=1"
      : POCKET_PAGE;
  }

  function makeIdentity(icon,data){
    if(!icon)return;

    icon.textContent = "";
    icon.style.backgroundImage = "";
    icon.style.backgroundSize = "";
    icon.style.backgroundPosition = "";
    icon.style.borderRadius = "";

    const photo = data?.photo || data?.cover || "";
    const usePhoto = data?.identityType === "photo" && photo;

    if(usePhoto){
      icon.style.backgroundImage = `url("${photo}")`;
      icon.style.backgroundSize = "cover";
      icon.style.backgroundPosition = "center";
      icon.style.borderRadius = "50%";
      return;
    }

    icon.textContent = data?.emoji || data?.icon || "▱";
  }

  function syncStoredPocketIntoHome(){
    const list = document.getElementById("yourPocketList");
    if(!list)return;

    const data = readStoredPocket();
    if(!data?.name)return;

    let item = list.querySelector('[data-pocket-integrated="true"]');

    if(!item){
      item = document.createElement("div");
      item.className = "pocket-item";
      item.dataset.pocketType = "owned";
      item.dataset.pocketIntegrated = "true";

      const label = document.createElement("span");
      label.className = "pocket-label";

      const icon = document.createElement("span");
      icon.className = "pocket-icon";

      const name = document.createElement("span");
      name.className = "pocket-name";

      label.append(icon,name);

      const star = document.createElement("button");
      star.className = "pocket-star";
      star.type = "button";
      star.textContent = "☆";
      star.title = "Add to favorites";
      star.addEventListener("click",event=>{
        event.stopPropagation();
        window.togglePocketFavorite?.(star);
      });

      item.append(label,star);
      list.prepend(item);
    }

    item.dataset.pocketName = data.name;
    item.querySelector(".pocket-name").textContent = data.name;
    makeIdentity(item.querySelector(".pocket-icon"),data);

    const star = item.querySelector(".pocket-star");
    const favorite = star?.textContent.trim() === "★";
    star?.setAttribute(
      "aria-label",
      favorite
        ? `Remove ${data.name} from favorites`
        : `Add ${data.name} to favorites`
    );

    window.ensurePocketMenus?.();
    window.updatePocketFavoriteCount?.();
  }

  const originalEditOwnedPocket = window.editOwnedPocket;

  window.editOwnedPocket = function(item){
    if(item?.dataset.pocketIntegrated === "true"){
      location.href = CREATE_PAGE + "?edit=1";
      return;
    }

    if(typeof originalEditOwnedPocket === "function"){
      originalEditOwnedPocket(item);
    }
  };

  document.addEventListener("click",event=>{
    const add = event.target.closest(".pockets-panel .add-pocket");

    if(add){
      event.preventDefault();
      event.stopPropagation();
      location.href = CREATE_PAGE;
      return;
    }

    const item = event.target.closest(".pockets-panel .pocket-item");
    if(!item)return;

    if(event.target.closest(
      "button, a, input, textarea, select, .pocket-row-actions, .pocket-settings-menu"
    )){
      return;
    }

    location.href = pocketPageUrl(item);
  });

  syncStoredPocketIntoHome();
})();
