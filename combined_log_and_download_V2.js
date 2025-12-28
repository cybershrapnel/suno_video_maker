//this is both scripts combined as one so you don't have to run two scripts or modify anything. just let it finishing walking a playlist, navigate back to playlist if it malfunctions to continue, and then after it downloads the list it makes it will auto download all the files.

// SUNO PLAYLIST → SCRAPE URLs → DOWNLOAD TSV (for records) → BLOB DOWNLOAD MP3/MP4
// Run from a playlist page on suno.com (logged in).
// After it finishes scraping, it will (1) download suno_songs.txt AND (2) immediately blob-download the mp3/mp4s
// using the in-memory scraped data (NOT the downloaded txt).

//final version is all in one minus the python script and has indexing to choose start and end index for playlist position.

(async () => {
  // -----------------------------------------------------------------
  // SETTINGS
  // -----------------------------------------------------------------
  const BEFORE_CLICK_DELAY = 1000;
  const AFTER_SONG_LOAD_DELAY = 2000;
  const BEFORE_BACK_DELAY = 2000;
  const AFTER_LIST_LOAD_DELAY = 3000;
  const POLL_INTERVAL = 250;
  const PAGE_TIMEOUT = 15000;

  // Download behavior
  const DOWNLOAD_TSV_RECORD = true; // downloads suno_songs.txt for your records
  const DOWNLOAD_MP3 = true;
  const DOWNLOAD_MP4 = true;

  // Blob-download pacing / filenames
  const DELAY_MS = 900;
  const MAX_NAME_LEN = 90;
  const PREFIX_INDEX = false; // set true if you want "01 - Title.mp3" etc.

  // Optional: try to load more rows first (only helps if the playlist uses infinite scroll)
  const AUTO_SCROLL_TO_LOAD_MORE = false;
  const AUTO_SCROLL_PAUSE_MS = 800;
  const AUTO_SCROLL_MAX_PASSES = 40;

  // -----------------------------------------------------------------
  // HELPERS
  // -----------------------------------------------------------------
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  async function autoScrollToLoadMore() {
    let lastHeight = -1;
    let stableCount = 0;

    for (let pass = 0; pass < AUTO_SCROLL_MAX_PASSES; pass++) {
      window.scrollTo(0, document.body.scrollHeight);
      await delay(AUTO_SCROLL_PAUSE_MS);

      const h = document.body.scrollHeight;
      if (h === lastHeight) stableCount++;
      else stableCount = 0;

      lastHeight = h;
      if (stableCount >= 3) break;
    }

    window.scrollTo(0, 0);
    await delay(500);
  }

  function collectSongPaths() {
    const links = Array.from(
      document.querySelectorAll(
        '[data-testid="song-row"] span.line-clamp-1.font-sans.text-base.font-medium.break-all.text-foreground-primary > a[href^="/song/"]'
      )
    );
    return Array.from(new Set(links.map((a) => a.getAttribute("href"))));
  }

  async function findSongLink(path, timeoutMs = PAGE_TIMEOUT) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      const links = Array.from(
        document.querySelectorAll(
          '[data-testid="song-row"] span.line-clamp-1.font-sans.text-base.font-medium.break-all.text-foreground-primary > a[href^="/song/"]'
        )
      );
      const match = links.find((a) => a.getAttribute("href") === path);
      if (match) return match;
      await delay(POLL_INTERVAL);
    }
    return null;
  }

  async function waitForSongPage(timeoutMs = PAGE_TIMEOUT) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      const ogAudio = document.querySelector('meta[property="og:audio"]');
      const titleInput = document.querySelector('input[type="text"]');
      if (ogAudio || titleInput) return true;
      await delay(POLL_INTERVAL);
    }
    return false;
  }

  async function waitForListPage(timeoutMs = PAGE_TIMEOUT) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      if (document.querySelector('[data-testid="song-row"]')) return true;
      await delay(POLL_INTERVAL);
    }
    return false;
  }

  function extractSongData() {
    const titleInput = document.querySelector('input[type="text"]');
    const title = titleInput ? titleInput.value.trim() : "";

    let author = "";
    const mainAuthorLink =
      document.querySelector(
        'a.hover\\:underline.line-clamp-1.max-w-fit.break-all[href^="/@"]'
      ) || document.querySelector('a[href^="/@"]');
    if (mainAuthorLink) author = mainAuthorLink.textContent.trim();

    const ogAudio = document.querySelector('meta[property="og:audio"]');
    const mp3Url = ogAudio ? ogAudio.content : "";

    const videoEl = document.querySelector('video[src*="suno.ai"], video source[src*="suno.ai"]');
    let videoUrl = "";
    if (videoEl) {
      // handle <video> or <source>
      const el = videoEl.tagName.toLowerCase() === "source" ? videoEl : videoEl;
      videoUrl = el.currentSrc || el.src || "";
    } else {
      // fallback: try any <video> currentSrc
      const v = document.querySelector("video");
      videoUrl = v ? (v.currentSrc || v.src || "") : "";
    }

    const info = {
      pageUrl: location.href,
      title,
      mp3Url,
      videoUrl,
      author,
    };

    console.log("Extracted:", info);
    return info;
  }

  function safeLine(v) {
    return v == null ? "" : String(v).replace(/\r?\n/g, " ");
  }

  function sanitizeFilename(title) {
    let s = (title ?? "").toString().trim();

    try { s = s.normalize("NFKD"); } catch (_) {}
    try { s = s.replace(/\p{Extended_Pictographic}+/gu, ""); } catch (_) {}
    try { s = s.replace(/\p{M}+/gu, ""); } catch (_) {}

    s = s.replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "");
    s = s.replace(/[^\w\s\-\(\)]+/g, "");
    s = s.replace(/\s+/g, " ").trim();
    s = s.replace(/[. ]+$/g, "");

    if (s.length > MAX_NAME_LEN) s = s.slice(0, MAX_NAME_LEN).trim();
    return s || "untitled";
  }

  function uniqueBase(base, used) {
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) name = `${base} (${n++})`;
    used.add(name.toLowerCase());
    return name;
  }

  async function blobDownload(url, filename) {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(objUrl);
  }

  function askRange1Based(total) {
    const startStr = prompt(
      `Found ${total} items.\nEnter START index (1-${total}).\nLeave blank for 1:`,
      "1"
    );
    const endStr = prompt(
      `Enter END index (1-${total}).\nLeave blank for ${total}:`,
      String(total)
    );

    let start1 = startStr == null || startStr.trim() === "" ? 1 : parseInt(startStr.trim(), 10);
    let end1 = endStr == null || endStr.trim() === "" ? total : parseInt(endStr.trim(), 10);

    if (!Number.isFinite(start1) || !Number.isFinite(end1) || Number.isNaN(start1) || Number.isNaN(end1)) {
      alert("Invalid start/end index. Aborting.");
      return null;
    }

    start1 = Math.max(1, Math.min(total, start1));
    end1 = Math.max(1, Math.min(total, end1));

    if (end1 < start1) {
      alert(`End index must be >= start index.\nYou entered: start=${start1}, end=${end1}\nAborting.`);
      return null;
    }

    return { start1, end1, start0: start1 - 1, end0: end1 - 1 };
  }

  // -----------------------------------------------------------------
  // SCRAPE
  // -----------------------------------------------------------------
  if (AUTO_SCROLL_TO_LOAD_MORE) {
    console.log("Auto-scrolling to load more rows...");
    await autoScrollToLoadMore();
  }

  const results = [];
  const songPaths = collectSongPaths();
  console.log("Found song paths (title links only):", songPaths);

  if (!songPaths.length) {
    console.warn("No songs found on this page.");
    return;
  }

  // ✅ PROMPT FOR RANGE (1-based, inclusive)
  const range = askRange1Based(songPaths.length);
  if (!range) return;

  const { start1, end1, start0, end0 } = range;
  const rangeCount = end1 - start1 + 1;

  console.log(`\nProcessing range: ${start1}..${end1} (total ${rangeCount} items)\n`);

  for (let i = start0; i <= end0 && i < songPaths.length; i++) {
    const path = songPaths[i];

    const globalIdx = i + 1;                 // 1-based in the full list
    const localIdx = globalIdx - start1 + 1; // 1-based within your chosen range

    console.log(`\n=== ${localIdx} / ${rangeCount} :: item ${globalIdx} / ${songPaths.length} :: ${path} ===`);

    const link = await findSongLink(path);
    if (!link) {
      console.warn("Could not find title link for path, skipping:", path);
      continue;
    }

    await delay(BEFORE_CLICK_DELAY);
    link.click();

    const songReady = await waitForSongPage();
    if (!songReady) {
      console.warn("Timed out waiting for song page:", path);
      continue;
    }

    await delay(AFTER_SONG_LOAD_DELAY);
    results.push(extractSongData());

    await delay(BEFORE_BACK_DELAY);
    history.back();

    const listReady = await waitForListPage();
    if (!listReady) {
      console.warn("Timed out waiting to return to list page. Stopping.");
      break;
    }

    await delay(AFTER_LIST_LOAD_DELAY);
  }

  console.log("\n=== ALL RESULTS ===");
  console.table(results);

  // -----------------------------------------------------------------
  // DOWNLOAD TSV (RECORD) + THEN BLOB DOWNLOADS (IN-MEMORY)
  // -----------------------------------------------------------------
  if (DOWNLOAD_TSV_RECORD) {
    const lines = results.map((r) =>
      [safeLine(r.title), safeLine(r.mp3Url), safeLine(r.videoUrl), safeLine(r.author)].join("\t")
    );

    const text = lines.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "suno_songs.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    console.log("Downloaded suno_songs.txt (record).");
  }

  const items = results
    .map((r) => ({
      title: (r.title || "").trim(),
      mp3: (r.mp3Url || "").trim(),
      mp4: (r.videoUrl || "").trim(),
    }))
    .filter((x) => x.mp3 || x.mp4);

  console.log(`Starting blob downloads for ${items.length} items...`);
  console.log("If Chrome blocks it, allow multiple downloads for suno.com in the address bar prompt.");

  const used = new Set();

  for (let i = 0; i < items.length; i++) {
    const idx = String(i + 1).padStart(2, "0");
    const clean = sanitizeFilename(items[i].title);
    const base0 = PREFIX_INDEX ? `${idx} - ${clean}` : clean;
    const base = uniqueBase(base0, used);

    if (DOWNLOAD_MP3 && items[i].mp3) {
      const mp3Name = `${base}.mp3`;
      console.log(`[${i + 1}/${items.length}] blob → ${mp3Name}`);
      try {
        await blobDownload(items[i].mp3, mp3Name);
      } catch (e) {
        console.error(`MP3 FAILED: ${mp3Name}`, e);
      }
      await delay(DELAY_MS);
    }

    if (DOWNLOAD_MP4 && items[i].mp4) {
      const mp4Name = `${base}.mp4`;
      console.log(`[${i + 1}/${items.length}] blob → ${mp4Name}`);
      try {
        await blobDownload(items[i].mp4, mp4Name);
      } catch (e) {
        console.error(`MP4 FAILED: ${mp4Name}`, e);
      }
      await delay(DELAY_MS);
    }
  }

  console.log("Done.");
})();
