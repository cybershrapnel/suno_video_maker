# put this in the completed folder and run it to removed numbered order from file names. optional of course. just for ease of use and making sure filenames don't have duplicate names etc.

import re
from pathlib import Path

# Matches: "01 - ", "1 - ", "003 - " etc.
PREFIX_RE = re.compile(r"^\s*\d{1,4}\s*-\s+")

def unique_path(dest: Path) -> Path:
    """If dest exists, append (2), (3), ... before suffix."""
    if not dest.exists():
        return dest
    n = 2
    while True:
        candidate = dest.with_name(f"{dest.stem} ({n}){dest.suffix}")
        if not candidate.exists():
            return candidate
        n += 1

def main():
    folder = Path.cwd()
    script_name = Path(__file__).name

    files = [p for p in folder.iterdir() if p.is_file() and p.name != script_name]

    renamed = 0
    skipped = 0

    for p in sorted(files, key=lambda x: x.name.lower()):
        new_name = PREFIX_RE.sub("", p.name, count=1)

        # If no change, skip
        if new_name == p.name:
            skipped += 1
            continue

        dest = folder / new_name
        dest = unique_path(dest)

        print(f"RENAME: {p.name}  ->  {dest.name}")
        p.rename(dest)
        renamed += 1

    print(f"\nDone. Renamed {renamed} file(s). Skipped {skipped} file(s).")

if __name__ == "__main__":
    main()
