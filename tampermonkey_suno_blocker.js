// ==UserScript==
// @name         Suno.com — Hide posts from selected users
// @namespace    https://suno.com/
// @version      1.0.0
// @description  Removes chat/comment/feed items authored by usernames you list.
// @match        https://suno.com/*
// @match        https://www.suno.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  // ------------------------------------------------------------
  // EDIT THIS LIST (usernames WITHOUT the @)
  // ------------------------------------------------------------
  const BLOCKED_USERS = [
    "dj_who","user2"
    // "some_other_user",
    // "anotherone",
  ];

  // Normalize once
  const blocked = new Set(BLOCKED_USERS.map(u => String(u).trim().toLowerCase()).filter(Boolean));

  // How often to do a full sweep (helps with virtualized/rehydrated lists)
  const SWEEP_EVERY_MS = 1500;

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  function parseUserFromHref(href) {
    if (!href) return null;
    // supports: "/@dj_who", "https://suno.com/@dj_who", etc.
    const m = String(href).match(/\/@([A-Za-z0-9_\.]+)/);
    return m ? m[1].toLowerCase() : null;
  }

  function findPostRoot(fromEl) {
    if (!fromEl || fromEl.nodeType !== 1) return null;

    // Best match for your provided DOM snippet
    let root =
      fromEl.closest("div.group") ||
      fromEl.closest('div[role="listitem"]') ||
      fromEl.closest("article") ||
      fromEl.closest("li");

    if (root) return root;

    // Heuristic fallback: climb a bit, pick the smallest ancestor that
    // still contains an author link and some message text.
    let el = fromEl;
    for (let i = 0; i < 12 && el; i++) {
      if (el.querySelector && el.querySelector('a[href*="/@"]')) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function removeIfBlocked(authorNode) {
    // authorNode could be <a href="/@user"> or <img alt="user">
    let user = null;

    if (authorNode.tagName === "A") {
      user = parseUserFromHref(authorNode.getAttribute("href"));
    } else if (authorNode.tagName === "IMG") {
      const alt = authorNode.getAttribute("alt");
      user = alt ? String(alt).trim().toLowerCase() : null;
    } else {
      // Try to find a nearby author link if this isn't directly one
      const a = authorNode.querySelector?.('a[href*="/@"]') || authorNode.closest?.('a[href*="/@"]');
      if (a) user = parseUserFromHref(a.getAttribute("href"));
    }

    if (!user || !blocked.has(user)) return false;

    const root = findPostRoot(authorNode);
    if (!root) return false;

    // Safety: verify the root actually contains that author link somewhere
    const hasAuthorLink = !!root.querySelector?.(`a[href="/@${user}"], a[href$="/@${user}"], a[href*="/@${user}"]`);
    const hasAuthorImg  = !!root.querySelector?.(`img[alt="${user}"]`);

    if (!hasAuthorLink && !hasAuthorImg) return false;

    root.remove();
    return true;
  }

  function sweep(root = document) {
    // Find candidate author markers inside root
    const candidates = root.querySelectorAll
      ? root.querySelectorAll('a[href*="/@"], img[alt]')
      : [];

    for (const node of candidates) {
      // Fast skip for imgs that clearly aren't usernames (optional)
      if (node.tagName === "IMG") {
        const alt = node.getAttribute("alt");
        if (!alt) continue;
        const maybe = alt.trim().toLowerCase();
        if (!blocked.has(maybe)) continue;
      }
      removeIfBlocked(node);
    }
  }

  // ------------------------------------------------------------
  // Start
  // ------------------------------------------------------------
  sweep();

  // Observe DOM changes (new messages)
  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n && n.nodeType === 1) sweep(n);
      }
    }
  });

  obs.observe(document.body, { childList: true, subtree: true });

  // Periodic sweep (handles re-render / virtualization)
  const interval = setInterval(() => sweep(), SWEEP_EVERY_MS);

  // Optional: stop hook (console)
  window.__SUNO_BLOCK_USERS__ = {
    stop() {
      obs.disconnect();
      clearInterval(interval);
      console.log("[SunoBlock] stopped");
    },
    list() {
      return [...blocked.values()];
    }
  };

  console.log(`[SunoBlock] active. Blocking: ${[...blocked].join(", ")}`);
})();
