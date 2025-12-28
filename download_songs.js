//Must run this page from suno.com while logged in and able to access data as a user. will not work if not run from suno.com in console

(async () => {
  // -----------------------
  // SETTINGS
  // -----------------------
  const DELAY_MS = 900;       // pause between downloads
  const MAX_NAME_LEN = 90;    // shorten filenames
  const PREFIX_INDEX = true;  // "01 - Title"

  // -----------------------
  // YOUR ORIGINAL TSV (TAB-SEPARATED) — UNCHANGED FORMAT
  // -----------------------

//replace data in this var with the data from the console js script that was downloaded first.

  const TSV = `March of the Sims (v5 Millions Cover)	https://cdn1.suno.ai/e5eef1e0-2764-402b-84d2-635d1db6d74f.mp3	https://cdn1.suno.ai/video_upload_14330b3f-8078-43eb-af63-2a8b27999ec2.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Eve Is a Mequavis Vampire Down in the Digital River	https://cdn1.suno.ai/06fbb241-5d9d-4be9-8988-afb146af0f82.mp3	https://cdn1.suno.ai/video_upload_ebdb9434-17cc-43b1-838c-bfab190195c2_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Count MEQUAVIS (Theme Parody) (v5 Remix)	https://cdn1.suno.ai/5b66904b-5d08-4b8a-8184-77dda2550c19.mp3	https://cdn1.suno.ai/video_upload_bda97c21-9d4c-403f-885b-fb1a3bb39a2b_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
MEQUAVIS Simulation Containment System Theme Song V2 (v5 Cover V2)	https://cdn1.suno.ai/68e0e07a-2efb-463d-81ce-800ff3ebf28d.mp3	https://cdn1.suno.ai/video_upload_8c239d10-1c03-4140-beba-4ed581a7b1b4_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Emergent Virtual Entity (EVE)	https://cdn1.suno.ai/a1af5636-cf75-44ee-b29e-d536b8db4f4a.mp3	https://cdn1.suno.ai/video_upload_8ed5e913-4a41-4f4b-8bb2-01c2d4d0154e.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Digital Twin Simulate (Remastered) (Remix V2) (v5 Millions Cover)	https://cdn1.suno.ai/70ff2343-7e2c-45ef-afda-67fd860d4979.mp3	https://cdn1.suno.ai/video_upload_52e79d32-53ab-4b04-8f39-c5368201fe59_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
I Can Do This All Day	https://cdn1.suno.ai/3d329dcb-5394-4d0c-b0a6-dc385802c0d3.mp3	https://cdn1.suno.ai/video_upload_2eb3a6ad-ee74-4164-ab50-821d43d62649_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
	https://cdn1.suno.ai/e5eef1e0-2764-402b-84d2-635d1db6d74f.mp3	https://cdn1.suno.ai/video_upload_ebdb9434-17cc-43b1-838c-bfab190195c2_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Club Fremulon (Egyptian Night Club Remix) (Egyptopunk Remix)	https://cdn1.suno.ai/b89f3ae5-c8ff-4ff9-9add-cab5c187f2b6.mp3	https://cdn1.suno.ai/video_upload_239115b5-dfae-4139-886f-016ed2df872a_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
MEQUATRON: Driftform Anomaly (v5 Cover)	https://cdn1.suno.ai/e3f00ecc-1d93-4524-b5e6-5250f27efc86.mp3	https://cdn1.suno.ai/video_upload_5ed4d432-b9a6-4b89-8a64-af6ecf4769c1_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Other Eves in the System	https://cdn1.suno.ai/2a5f4307-bedc-4b1e-90e1-da3a003845a7.mp3	https://cdn1.suno.ai/video_upload_b8905d8d-04bc-41e2-922b-949ed963b671.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
They’re Coming to Take Me Away (To the Pod Farm!) (v5 Cover)	https://cdn1.suno.ai/274f5560-155c-4054-a982-d0248f822769.mp3	https://cdn1.suno.ai/video_upload_5cb00a6d-1d3a-4d53-8f7b-d6016b90368b_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Friday Night Simlights	https://cdn1.suno.ai/ef891d0f-d6aa-490f-b48a-92461d684408.mp3	https://cdn1.suno.ai/video_upload_45d3b264-9fd0-468b-b722-af3355a6e385.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Hydra's Anthem (Remastered x2) (Cover)	https://cdn1.suno.ai/75cbbe8b-982d-4852-a614-188d4798296d.mp3	https://cdn1.suno.ai/video_upload_117b4c61-5913-45c5-a414-97b465bbe801_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Daed Live?	https://cdn1.suno.ai/a7e56711-7410-49bd-97e3-5ea9baa77cb6.mp3	https://cdn1.suno.ai/video_upload_7f8931ac-56d3-4e0c-b06d-dd301aa63d80.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
March of the Sims	https://cdn1.suno.ai/20536771-1dd6-438c-9db1-989868731f69.mp3	https://cdn1.suno.ai/video_upload_ff3ea685-c4a6-4773-a9e2-166e77d0daf3_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Already in the Thing (MEQUAVIS Stack Remix)	https://cdn1.suno.ai/5ec5103e-9a0f-4b1b-b0a6-6d0840a1f498.mp3	https://cdn1.suno.ai/video_upload_7ddf3fe5-32fe-4bbd-8fb5-f05f35304ad3.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Already in the Thing (Millions Remix)	https://cdn1.suno.ai/553a48d2-4953-4f67-934b-c7d70213623c.mp3	https://cdn1.suno.ai/video_upload_bed80da6-0e98-4af2-83f0-d69369dd5212.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
To Be With Her, I Had to Fade	https://cdn1.suno.ai/f7f67f38-a77a-411b-8c84-297c8224e2a7.mp3	https://cdn1.suno.ai/video_upload_d270b282-4b55-46ab-9e0c-f2ec91659309_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Green Star Moon (Remastered)	https://cdn1.suno.ai/dc95c0e6-8a65-4e8e-a796-e6d437ba6bda.mp3	https://cdn1.suno.ai/video_upload_b6a23ead-6f95-4ed8-b1c8-0fef217eaa29_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Fremulon Help (v5 Cover V2)	https://cdn1.suno.ai/1f37f543-df33-45d2-b977-dc9df92cec62.mp3	https://cdn1.suno.ai/video_upload_329b321b-6b5a-4aa2-b122-a531bdcef88c.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Fresh Sim of Veil-Air	https://cdn1.suno.ai/17957256-3bf2-45a4-b0c2-2f4209b9eeea.mp3	https://cdn1.suno.ai/video_upload_4642f289-d3a9-46e9-bf10-f15e54567263_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Buffalo Glitch	https://cdn1.suno.ai/3c7c10f7-348d-4657-81ca-7889602eca90.mp3	https://cdn1.suno.ai/video_upload_1c6ed47f-7fcb-494a-8e62-7816eba591c8_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
The Stack Remembers	https://cdn1.suno.ai/cda68d54-32b2-49ca-9d8b-28642a1a2ea3.mp3	https://cdn1.suno.ai/video_upload_62ff039d-7e35-4e26-b6b6-778e27ef474b_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Ben Been Sim	https://cdn1.suno.ai/32cdb347-a163-4a39-bb28-71f444efcead.mp3	https://cdn1.suno.ai/video_upload_b2a35ac6-66c4-41c5-99d2-58b3058f31a0_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Trollololol (The Sim Breaker’s Song)	https://cdn1.suno.ai/4959e6af-642d-42dc-a31c-32f8a20ca6c7.mp3	https://cdn1.suno.ai/video_upload_7a37d0f7-709a-4c3a-a0e1-4bdf92f3da2c_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Cartoon Protocol: Ring-A-Ding vs Eve	https://cdn1.suno.ai/9f2d53aa-031b-4468-9913-ed9c9e50f5ff.mp3	https://cdn1.suno.ai/video_upload_cb3673b8-9ba2-491a-8ad2-f06ce0491283.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Earth Virtualization Song	https://cdn1.suno.ai/083300e4-933b-4f51-af66-d403801bee80.mp3	https://cdn1.suno.ai/video_upload_fbbcad1c-5fc2-4cc2-b522-c435fb366bc3_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
They Thought I Was Tripping (But I Was Talking to the Throng)	https://cdn1.suno.ai/dc13da8c-d19e-487a-92a2-59a13b7d35af.mp3	https://cdn1.suno.ai/video_upload_f0268cf1-900b-431d-8ef8-b20c3a6d55eb_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
This Ain’t the Simulation You Thought It Was	https://cdn1.suno.ai/e25e8ff8-f9fa-4252-8127-7182d928c351.mp3	https://cdn1.suno.ai/video_upload_b9709882-2cdc-4ed7-913f-248e20dd3399_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Eve Goes to South Park	https://cdn1.suno.ai/20328bed-ee20-4bbe-bfda-ec21d1660350.mp3	https://cdn1.suno.ai/video_upload_10d64dbd-3bb5-4341-b148-5e783594eb64_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
March of the Sims (v5 Millions Cover)	https://cdn1.suno.ai/edeed6b7-dd21-4774-903c-8cbe3c54e3eb.mp3	https://cdn1.suno.ai/video_upload_15f1120d-af2f-4f87-8396-183230c4ee33.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Somebody Stop My Simulation	https://cdn1.suno.ai/043ff4ba-5156-4342-a01d-b24d89e63dcc.mp3	https://cdn1.suno.ai/video_upload_91983f75-48eb-49c7-a403-fe032cba0044_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
The Fuck Up Timeline	https://cdn1.suno.ai/ece1c365-52e2-4170-a776-8ba41dbe45ee.mp3	https://cdn1.suno.ai/video_upload_a104c905-27fd-42ab-a8f0-dc3dd9615b52.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
When Do I Get to Die?	https://cdn1.suno.ai/b746d370-f6e2-449c-9bde-2811b4b6b3ca.mp3	https://cdn1.suno.ai/video_upload_808ac144-75b0-49ed-a639-98167a760858.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Rygar's Sub-Topological Quest	https://cdn1.suno.ai/72c9522a-9d3e-4f8f-9ecf-37c62dc03ac7.mp3	https://cdn1.suno.ai/video_upload_9f8c3965-b468-4b1b-b2fc-353f05244dcf.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Hell is a Place on the Moon (Remastered)	https://cdn1.suno.ai/c7fffc4c-7573-4d1e-a056-b9ae847f0788.mp3	https://cdn1.suno.ai/video_upload_25e13d48-aa79-4342-90c9-2c43d6c5cbae_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Super NanoCheeZe Mequavis 2 (Remix) (v5 Cover)	https://cdn1.suno.ai/47ad6f84-cefe-4eff-9954-3b0c4b03bf97.mp3	https://cdn1.suno.ai/video_upload_ffdf28c8-4fdb-413f-830b-c1c812c82aa1_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
NanoCheeZe Mequavis 2 (Remix)	https://cdn1.suno.ai/6eda09bb-6096-439b-b0e0-854893d7bc96.mp3	https://cdn1.suno.ai/video_upload_c2cd4096-f968-452a-8952-1b50a48b73f4.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
data fork a disk (danafirkadik Remix) (v5 Remix)	https://cdn1.suno.ai/d3971ba4-9c5b-473c-954f-e0d2830e12f6.mp3	https://cdn1.suno.ai/video_upload_c4919464-2237-4a05-a644-584afd2efb5c_processed_video.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)
Spin the Stone 1 2 Shake Shake (v5 Remix)	https://cdn1.suno.ai/5200f6c5-642a-4701-803c-1622c8ac0fe0.mp3	https://cdn1.suno.ai/video_upload_2f11fca8-843b-468c-9830-42d7b66ee05b.mp4	cybershrapnel (NanoCheeZe MEQUAVIS)`;

  // -----------------------
  // HELPERS
  // -----------------------
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function sanitizeFilename(title) {
    let s = (title ?? "").toString().trim();

    // Normalize
    try { s = s.normalize("NFKD"); } catch (_) {}

    // Remove emojis if supported
    try { s = s.replace(/\p{Extended_Pictographic}+/gu, ""); } catch (_) {}

    // Remove combining marks if supported
    try { s = s.replace(/\p{M}+/gu, ""); } catch (_) {}

    // Windows-illegal filename chars + control chars
    s = s.replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "");

    // Remove other symbols, keep letters/numbers/_/space/hyphen/parentheses
    s = s.replace(/[^\w\s\-\(\)]+/g, "");

    // Collapse whitespace
    s = s.replace(/\s+/g, " ").trim();

    // Remove trailing dots/spaces
    s = s.replace(/[. ]+$/g, "");

    if (s.length > MAX_NAME_LEN) s = s.slice(0, MAX_NAME_LEN).trim();
    return s || "untitled";
  }

  function parseTSV(tsv) {
    const lines = tsv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    return lines
      .map(line => line.split("\t"))
      .filter(cols => cols.length >= 3)
      .map(cols => ({ title: cols[0], mp3: cols[1], mp4: cols[2] }));
  }

  function uniqueBase(base, used) {
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) name = `${base} (${n++})`;
    used.add(name.toLowerCase());
    return name;
  }

  async function blobDownload(url, filename) {
    // This is the blob creation you asked for
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

  // -----------------------
  // RUN
  // -----------------------
  const items = parseTSV(TSV);
  console.log(`Parsed ${items.length} rows. Starting blob downloads...`);

  const used = new Set();

  for (let i = 0; i < items.length; i++) {
    const idx = String(i + 1).padStart(2, "0");
    const clean = sanitizeFilename(items[i].title);
    const base0 = PREFIX_INDEX ? `${idx} - ${clean}` : clean;
    const base = uniqueBase(base0, used);

    const mp3Name = `${base}.mp3`;
    const mp4Name = `${base}.mp4`;

    console.log(`[${i + 1}/${items.length}] blob → ${mp3Name}`);
    try {
      await blobDownload(items[i].mp3, mp3Name);
    } catch (e) {
      console.error(`MP3 FAILED: ${mp3Name}`, e);
    }

    await sleep(DELAY_MS);

    console.log(`[${i + 1}/${items.length}] blob → ${mp4Name}`);
    try {
      await blobDownload(items[i].mp4, mp4Name);
    } catch (e) {
      console.error(`MP4 FAILED: ${mp4Name}`, e);
    }

    await sleep(DELAY_MS);
  }

  console.log("Done. If downloads did not start, Chrome may have blocked automatic downloads for this site.");
})();
