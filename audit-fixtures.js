/* =========================================================
   ALL MEDIA — AUDIT FIXTURES V1
   September 19, 2026

   PURPOSE
   - Reduce seeded/demo content before the full-site audit.
   - Preserve user-created Pockets and Communities.
   - Remove user-visible Prototype/Master/testing language.
   - DO NOT repair unrelated product bugs.

   LOAD THIS FILE LAST, immediately before </body>.
========================================================= */

(() => {
  "use strict";

  const FIXTURE_VERSION = "all-media-audit-fixtures-v1-2026-09-19";
  const FIXTURE_MARKER = "allMediaAuditFixtureVersion";
  const RELOAD_MARKER = "allMediaAuditFixtureReloadedV1";

  const COMMUNITY_STATE_KEY = "allMediaCommunityStateV1";
  const COMMUNITY_PIN_ORDER_KEY = "allMediaCommunityPinOrderV1";
  const POCKET_CREATED_KEY = "allMediaPocketPrototypeV1";
  const POCKET_REGISTRY_KEY = "allMediaPocketRegistryV1";

  const BUILTIN_COMMUNITIES = {
    "spooky-cozy": "Spooky Cozy",
    "artists": "Artists",
    "turtle-rescue": "Turtle Rescue",
    "book-club": "Book Club",
    "crochet-corner": "Crochet Corner",
    "garden-and-nature": "Garden & Nature"
  };

  const REMOVED_COMMUNITY_SLUGS = new Set([
    "artists",
    "turtle-rescue",
    "crochet-corner",
    "garden-and-nature"
  ]);

  const SAMPLE_POCKET_NAMES = new Set([
    "Halloween",
    "Art",
    "Spooky Stuff",
    "Crochet",
    "Home Decor",
    "Recipes",
    "Future Projects",
    "Halloween Inspo",
    "Nature & Wildlife",
    "Cozy Gaming"
  ]);

  const KEPT_SAMPLE_POCKETS = new Set([
    "Halloween",
    "Halloween Inspo"
  ]);

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }

  function slugFromName(name) {
    return String(name || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* ---------------------------------------------------------
     ONE-TIME COMMUNITY FIXTURE STATE
     Keep:
       - Spooky Cozy = owned + joined + pinned
       - Book Club   = joined + unpinned
     Hide the four other seeded Communities.
     Preserve every non-built-in / user-created Community.
  --------------------------------------------------------- */

  function seedCommunityFixturesOnce() {
    if (localStorage.getItem(FIXTURE_MARKER) === FIXTURE_VERSION) {
      return false;
    }

    const state = readJSON(COMMUNITY_STATE_KEY, {});
    const next = { ...state };

    next["spooky-cozy"] = {
      ...(state["spooky-cozy"] || {}),
      name: state["spooky-cozy"]?.name || "Spooky Cozy",
      icon: state["spooky-cozy"]?.icon || "🎃",
      role: state["spooky-cozy"]?.role || "owner",
      joined: true,
      pinned: true,
      notifications: true,
      deleted: false
    };

    next["book-club"] = {
      ...(state["book-club"] || {}),
      name: state["book-club"]?.name || "Book Club",
      icon: state["book-club"]?.icon || "📚",
      role: state["book-club"]?.role || "member",
      joined: true,
      pinned: false,
      notifications: true,
      deleted: false
    };

    REMOVED_COMMUNITY_SLUGS.forEach(slug => {
      next[slug] = {
        ...(state[slug] || {}),
        name: state[slug]?.name || BUILTIN_COMMUNITIES[slug],
        joined: false,
        pinned: false,
        notifications: false,
        deleted: true
      };
    });

    writeJSON(COMMUNITY_STATE_KEY, next);

    const existingPinOrder = readJSON(COMMUNITY_PIN_ORDER_KEY, []);
    const customPinned = Array.isArray(existingPinOrder)
      ? existingPinOrder.filter(slug => !(slug in BUILTIN_COMMUNITIES))
      : [];

    writeJSON(
      COMMUNITY_PIN_ORDER_KEY,
      ["spooky-cozy", ...customPinned]
    );

    localStorage.setItem(FIXTURE_MARKER, FIXTURE_VERSION);
    return true;
  }

  /* ---------------------------------------------------------
     VISIBLE PROTOTYPE / TESTING LANGUAGE
     Internal filenames, CSS classes and storage keys are NOT renamed.
  --------------------------------------------------------- */

  function cleanVisibleTestingLanguage() {
    if (/prototype/i.test(document.title)) {
      document.title = document.title
        .replace(/\s*[—|-]?\s*Profile Prototype/gi, " — Profile")
        .replace(/\bPrototype\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    }

    document.querySelectorAll(".prototype-note").forEach(el => el.remove());

    document.querySelectorAll(".prototype-strip").forEach(el => {
      if (/prototype view/i.test(el.textContent || "")) {
        el.remove();
      }
    });

    document.querySelectorAll(".field-note").forEach(el => {
      const text = (el.textContent || "").trim();
      if (/for this prototype,\s*we['’]ll cap community rules at 10/i.test(text)) {
        el.textContent = "Community rules are capped at 10.";
      }
    });

    document.querySelectorAll(".reblog-note").forEach(el => {
      if (/sample reblog card|layout is locked/i.test(el.textContent || "")) {
        el.innerHTML =
          '<strong style="color:white">Reblogs</strong><br>Content you choose to reblog will appear here.';
      }
    });
  }

  /* ---------------------------------------------------------
     POCKET FIXTURES
     Keep only:
       - Halloween      (owned)
       - Halloween Inspo (followed)
     User-created Pockets are never removed.
  --------------------------------------------------------- */

  function cleanPocketSamples() {
    document.querySelectorAll(".pockets-panel .pocket-item").forEach(item => {
      const name =
        item.dataset.pocketName ||
        item.querySelector(".pocket-name")?.textContent?.trim() ||
        "";

      if (
        SAMPLE_POCKET_NAMES.has(name) &&
        !KEPT_SAMPLE_POCKETS.has(name)
      ) {
        item.remove();
      }
    });

    /* Rebuild registry from what remains while preserving custom metadata. */
    const oldRegistry = readJSON(POCKET_REGISTRY_KEY, {});
    const nextRegistry = {};

    Object.entries(oldRegistry || {}).forEach(([key, value]) => {
      const name = value?.name || "";
      if (!SAMPLE_POCKET_NAMES.has(name)) {
        nextRegistry[key] = value;
      }
    });

    document.querySelectorAll(".pockets-panel .pocket-item").forEach(item => {
      const name =
        item.dataset.pocketName ||
        item.querySelector(".pocket-name")?.textContent?.trim() ||
        "";

      if (!name) return;

      const key = name.toLowerCase().trim();
      const previous = oldRegistry?.[key] || {};

      nextRegistry[key] = {
        ...previous,
        name,
        type: item.dataset.pocketType || previous.type || "owned",
        creator: item.dataset.pocketCreator || previous.creator || "",
        emoji:
          item.querySelector(".pocket-icon")?.textContent?.trim() ||
          previous.emoji ||
          "▱"
      };
    });

    const created = readJSON(POCKET_CREATED_KEY, null);
    if (created?.name) {
      nextRegistry[created.name.toLowerCase().trim()] = {
        ...created,
        name: created.name,
        type: "owned"
      };
    }

    writeJSON(POCKET_REGISTRY_KEY, nextRegistry);
  }

  /* ---------------------------------------------------------
     COMMUNITY NAV / HOTBAR FIXTURES

     Some pages still contain their own hardcoded six-Community catalog.
     Remove rows that are no longer joined according to shared state.
     User-created Communities remain untouched.
  --------------------------------------------------------- */

  function communityIsJoined(name) {
    const slug = slugFromName(name);
    const state = readJSON(COMMUNITY_STATE_KEY, {});
    const item = state?.[slug];

    if (!(slug in BUILTIN_COMMUNITIES)) {
      return true;
    }

    if (REMOVED_COMMUNITY_SLUGS.has(slug)) {
      return false;
    }

    return item?.joined !== false && item?.deleted !== true;
  }

  function cleanCommunityNavigation() {
    const selectors = [
      ".community-chip",
      ".community-more-row"
    ].join(",");

    document.querySelectorAll(selectors).forEach(el => {
      const name =
        el.dataset.community ||
        el.querySelector(".community-more-name")?.textContent?.replace(/^[^\w@#]+/, "").trim() ||
        el.textContent?.trim() ||
        "";

      const builtinName = Object.values(BUILTIN_COMMUNITIES)
        .find(candidate => name.includes(candidate));

      if (builtinName && !communityIsJoined(builtinName)) {
        el.remove();
      }
    });
  }

  /* ---------------------------------------------------------
     COMMUNITY FEED SAMPLE CARDS
     When a Community page contains multiple seeded cards of one type,
     retain only the first Post / Blog / Video / Byte.
  --------------------------------------------------------- */

  function cleanCommunitySeedCards() {
    const cards = [
      ...document.querySelectorAll(
        '[data-community-seed-post="true"]'
      )
    ];

    if (!cards.length) return;

    const seen = new Set();

    cards.forEach(card => {
      let type = "post";
      if (card.classList.contains("blog-post-v11")) type = "blog";
      else if (card.classList.contains("video-post-v11")) type = "video";
      else if (card.classList.contains("byte-post-v11")) type = "byte";

      if (seen.has(type)) {
        card.remove();
      } else {
        seen.add(type);
      }
    });
  }

  /* ---------------------------------------------------------
     DISCOVER FIXTURES
     Keep at most one card of each type in the active mode.
     Remove Community labels that point to hidden/nonexistent fixtures.

     This intentionally does NOT change filters, Suggested/Adventure,
     Interest follow behavior, or card functionality.
  --------------------------------------------------------- */

  function patchDiscoverFixtureData() {
    if (
      typeof window.currentPosts !== "function" ||
      window.currentPosts.__allMediaAuditFixturePatched
    ) {
      return;
    }

    const originalCurrentPosts = window.currentPosts;

    const patched = function () {
      const source = originalCurrentPosts();
      const seen = new Set();
      const allowedCommunityNames = new Set([
        "Spooky Cozy",
        "Book Club"
      ]);

      return source
        .map(post => {
          const copy = { ...post };

          const communityText = String(copy.community || "");
          const hasAllowedCommunity = [...allowedCommunityNames]
            .some(name => communityText.includes(name));

          if (!hasAllowedCommunity) {
            copy.community = "";
          }

          return copy;
        })
        .filter(post => {
          const type = post.type || "post";
          if (seen.has(type)) return false;
          seen.add(type);
          return true;
        });
    };

    patched.__allMediaAuditFixturePatched = true;
    window.currentPosts = patched;

    if (typeof window.renderDiscover === "function") {
      window.renderDiscover();
    }
  }

  /* ---------------------------------------------------------
     FINAL PAGE CLEANUP
  --------------------------------------------------------- */

  let cleanupQueued = false;

  function cleanPage() {
    cleanupQueued = false;

    cleanVisibleTestingLanguage();
    cleanPocketSamples();
    cleanCommunityNavigation();
    cleanCommunitySeedCards();
  }

  function queueCleanup() {
    if (cleanupQueued) return;
    cleanupQueued = true;
    requestAnimationFrame(cleanPage);
  }

  const didSeed = seedCommunityFixturesOnce();

  /*
    The first page that installs this file may already have loaded old
    Community state into memory. Reload once after seeding so every existing
    page script reads the cleaned shared state from the beginning.
  */
  if (
    didSeed &&
    sessionStorage.getItem(RELOAD_MARKER) !== FIXTURE_VERSION
  ) {
    sessionStorage.setItem(RELOAD_MARKER, FIXTURE_VERSION);
    location.reload();
    return;
  }

  if (
    sessionStorage.getItem(RELOAD_MARKER) === FIXTURE_VERSION
  ) {
    sessionStorage.removeItem(RELOAD_MARKER);
  }

  function start() {
    patchDiscoverFixtureData();
    cleanPage();

    const observer = new MutationObserver(() => {
      patchDiscoverFixtureData();
      queueCleanup();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.addEventListener("storage", event => {
      if (
        event.key === COMMUNITY_STATE_KEY ||
        event.key === POCKET_REGISTRY_KEY ||
        event.key === POCKET_CREATED_KEY
      ) {
        queueCleanup();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
