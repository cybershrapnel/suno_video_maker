(() => {
  const AUTHOR = "dj_who";

  // Things that identify the author inside a post
  const authorSelectors = [
    `a[href="/@${AUTHOR}"]`,
    `img[alt="${AUTHOR}"]`,
  ].join(",");

  // Given an element inside the post, find the post container and remove it
  function removePostFromChild(el) {
    if (!el || el.nodeType !== 1) return false;

    // In your snippet, the whole post row is a div with class "group ..."
    const post = el.closest("div.group");
    if (!post) return false;

    // Safety check: only remove if this post actually contains that author link
    if (!post.querySelector(`a[href="/@${AUTHOR}"]`)) return false;

    post.remove();
    return true;
  }

  function sweep(root = document) {
    root.querySelectorAll(authorSelectors).forEach(removePostFromChild);
  }

  // Initial pass
  sweep();

  // Keep removing future posts
  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n && n.nodeType === 1) sweep(n);
      }
    }
  });

  obs.observe(document.body, { childList: true, subtree: true });

  // Expose stop handle
  window.__MEQ_REMOVE_AUTHOR__ = {
    stop() { obs.disconnect(); },
    author: AUTHOR
  };

  console.log(`[MEQ] Removing posts by @${AUTHOR}. To stop: __MEQ_REMOVE_AUTHOR__.stop()`);
})();
