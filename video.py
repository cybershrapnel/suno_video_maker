# place this script in the same directoy as the downloaded files from the other 2 scripts. this will make youtube short style videos for every song. just run python video.py from command line, optionally run the rename script to remove the numbered order in file names.

import shutil
import subprocess
from pathlib import Path

# -----------------------
# SETTINGS
# -----------------------
FFMPEG = "ffmpeg"          # or full path like r"C:\ffmpeg\bin\ffmpeg.exe"
TARGET_W = 1080
TARGET_H = 1920
MAX_SECONDS = 179          # 2:59 cap
FPS = 30

PROCESSED_DIRNAME = "processed"
COMPLETED_DIRNAME = "completed"


def unique_dest(dest: Path) -> Path:
    """If dest exists, append (2), (3), ..."""
    if not dest.exists():
        return dest
    n = 2
    while True:
        candidate = dest.with_name(f"{dest.stem} ({n}){dest.suffix}")
        if not candidate.exists():
            return candidate
        n += 1


def ffmpeg_make_vertical(video_path: Path, audio_path: Path, out_path: Path) -> None:
    # Scale to fit inside 1080x1920, then pad (NO crop)
    vf = (
        f"scale={TARGET_W}:{TARGET_H}:force_original_aspect_ratio=decrease,"
        f"pad={TARGET_W}:{TARGET_H}:(ow-iw)/2:(oh-ih)/2,"
        f"setsar=1"
    )

    cmd = [
        FFMPEG, "-y",
        "-hide_banner",
        "-loglevel", "error",

        # Loop video so we always have enough frames to cover audio / -t cap
        "-stream_loop", "-1",
        "-i", str(video_path),

        "-i", str(audio_path),

        "-map", "0:v:0",
        "-map", "1:a:0",

        "-vf", vf,
        "-r", str(FPS),

        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-preset", "medium",

        "-c:a", "aac",
        "-b:a", "192k",

        "-movflags", "+faststart",

        # Hard cap at 2:59 max
        "-t", str(MAX_SECONDS),

        # If audio is shorter than 2:59, stop at audio end (don’t add silence)
        "-shortest",

        str(out_path),
    ]

    subprocess.run(cmd, check=True)


def main():
    cwd = Path.cwd()
    processed_dir = cwd / PROCESSED_DIRNAME
    completed_dir = cwd / COMPLETED_DIRNAME
    processed_dir.mkdir(exist_ok=True)
    completed_dir.mkdir(exist_ok=True)

    # Only scan the current folder (not subfolders)
    mp3s = {p.stem: p for p in cwd.glob("*.mp3") if p.is_file()}
    mp4s = {p.stem: p for p in cwd.glob("*.mp4") if p.is_file()}

    # Find exact stem matches
    stems = sorted(set(mp3s.keys()) & set(mp4s.keys()))

    if not stems:
        print("No matching NAME.mp3 + NAME.mp4 pairs found in this folder.")
        return

    print(f"Found {len(stems)} pairs. Output -> ./{COMPLETED_DIRNAME}/  Inputs -> ./{PROCESSED_DIRNAME}/")

    for i, stem in enumerate(stems, start=1):
        mp3_path = mp3s[stem]
        mp4_path = mp4s[stem]

        out_path = completed_dir / f"{stem}.mp4"

        print(f"\n[{i}/{len(stems)}] {stem}")
        if out_path.exists() and out_path.stat().st_size > 0:
            print(f"  SKIP: output already exists -> {out_path.name}")
            continue

        # Render to a temp file first, then move into place (avoids half-baked outputs)
        temp_out = completed_dir / f"{stem}.__tmp__.mp4"
        if temp_out.exists():
            try:
                temp_out.unlink()
            except Exception:
                pass

        try:
            print(f"  rendering (max {MAX_SECONDS}s) -> {out_path.name}")
            ffmpeg_make_vertical(mp4_path, mp3_path, temp_out)

            # Move temp into final output name
            if out_path.exists():
                out_path = unique_dest(out_path)
            temp_out.replace(out_path)
            print(f"  wrote -> {out_path}")

        except subprocess.CalledProcessError as e:
            print(f"  ERROR: ffmpeg failed for '{stem}' (leaving inputs in place).")
            # Clean temp if exists
            if temp_out.exists():
                try:
                    temp_out.unlink()
                except Exception:
                    pass
            continue

        # Only after success: move inputs into processed/
        try:
            dest_mp3 = unique_dest(processed_dir / mp3_path.name)
            dest_mp4 = unique_dest(processed_dir / mp4_path.name)

            shutil.move(str(mp3_path), str(dest_mp3))
            shutil.move(str(mp4_path), str(dest_mp4))

            print(f"  moved -> {dest_mp3.name}")
            print(f"  moved -> {dest_mp4.name}")

        except Exception as e:
            print(f"  WARNING: rendered ok, but moving inputs failed: {e}")
            print("           (your completed video is fine; inputs stayed where they are)")

    print("\nDone.")


if __name__ == "__main__":
    main()
