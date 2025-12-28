//run this from a playlist page on Suno.com - This is script 1 to run!
//This script will walk through each song in the playlist and make a list of the paths to the mp3 and the mp4.
//when it has walked the whole playlist it will autodownload the list of songs tab separated. Use this list in the other script to download the files.

(async () => {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const results = [];

  // Tunable timing knobs
  const BEFORE_CLICK_DELAY = 1000;      // wait before clicking a title
  const AFTER_SONG_LOAD_DELAY = 2000;   // extra wait after song page is ready
  const BEFORE_BACK_DELAY = 2000;       // wait before calling history.back()
  const AFTER_LIST_LOAD_DELAY = 3000;   // wait after list page is back before next song
  const POLL_INTERVAL = 250;            // polling step for waits
  const PAGE_TIMEOUT = 15000;           // max wait for page changes

  // Grab all song paths from ONLY the main title link per row
  function collectSongPaths() {
    const links = Array.from(
      document.querySelectorAll(
        '[data-testid="song-row"] span.line-clamp-1.font-sans.text-base.font-medium.break-all.text-foreground-primary > a[href^="/song/"]'
      )
    );
    const paths = Array.from(new Set(links.map(a => a.getAttribute('href'))));
    return paths;
  }

  const songPaths = collectSongPaths();
  console.log("Found song paths (title links only):", songPaths);

  // Helper: after we go back, find the title link for a specific path
  async function findSongLink(path, timeoutMs = PAGE_TIMEOUT) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      const links = Array.from(
        document.querySelectorAll(
          '[data-testid="song-row"] span.line-clamp-1.font-sans.text-base.font-medium.break-all.text-foreground-primary > a[href^="/song/"]'
        )
      );
      const match = links.find(a => a.getAttribute('href') === path);
      if (match) return match;
      await delay(POLL_INTERVAL);
    }
    return null;
  }

  // Helper: wait for something that only exists on the song page
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

  // Helper: wait for list page to be visible again
  async function waitForListPage(timeoutMs = PAGE_TIMEOUT) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      if (document.querySelector('[data-testid="song-row"]')) return true;
      await delay(POLL_INTERVAL);
    }
    return false;
  }

  // Main extractor
  function extractSongData() {
    // Title (big input at the top)
    const titleInput = document.querySelector('input[type="text"]');
    const title = titleInput ? titleInput.value.trim() : null;

    // Author
    let author = null;
    const mainAuthorLink =
      document.querySelector(
        'a.hover\\:underline.line-clamp-1.max-w-fit.break-all[href^="/@"]'
      ) ||
      document.querySelector('a[href^="/@"]');

    if (mainAuthorLink) {
      author = mainAuthorLink.textContent.trim();
    }

    // MP3 URL from <meta property="og:audio" ...>
    const ogAudio = document.querySelector('meta[property="og:audio"]');
    const mp3Url = ogAudio ? ogAudio.content : null;

    // Video URL from the main preview <video>
    const videoEl = document.querySelector('video[src*="suno.ai"]');
    const videoUrl = videoEl ? (videoEl.currentSrc || videoEl.src || null) : null;

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

  // MAIN LOOP: click title -> wait -> scrape -> back -> wait -> next
  for (let i = 0; i < songPaths.length; i++) {
    const path = songPaths[i];
    console.log(`\n=== ${i + 1} / ${songPaths.length} :: ${path} ===`);

    // Ensure we are on the list page and get the *title* link
    const link = await findSongLink(path);
    if (!link) {
      console.warn("Could not find title link for path, skipping:", path);
      continue;
    }

    // Small pause before we click (let UI settle)
    await delay(BEFORE_CLICK_DELAY);

    // Click the song title to go to its page
    link.click();

    // Wait for song page to load
    const songReady = await waitForSongPage();
    if (!songReady) {
      console.warn("Timed out waiting for song page:", path);
      continue;
    }

    // Extra delay after navigation so React/metadata settle
    await delay(AFTER_SONG_LOAD_DELAY);

    // Run extractor on the song page
    const data = extractSongData();
    results.push(data);

    // Pause a bit before going back to avoid rapid history calls
    await delay(BEFORE_BACK_DELAY);

    // Go back to the list page
    history.back();

    // Wait for list page to show rows again
    const listReady = await waitForListPage();
    if (!listReady) {
      console.warn("Timed out waiting to return to list page. Stopping.");
      break;
    }

    // Extra delay on the list page before the next loop
    await delay(AFTER_LIST_LOAD_DELAY);
  }

  console.log("\n=== ALL RESULTS ===");
  console.table(results);

  // ---------- DOWNLOAD AS TXT ----------
  // Tab-separated: title, mp3Url, videoUrl, author
  const lines = results.map(r => {
    const safe = v => (v == null ? "" : String(v).replace(/\r?\n/g, " "));
    return [
      safe(r.title),
      safe(r.mp3Url),
      safe(r.videoUrl),
      safe(r.author),
    ].join("\t");
  });

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

  results; // still return the data to the console
})();
