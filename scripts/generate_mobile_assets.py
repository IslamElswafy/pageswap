from __future__ import annotations

from pathlib import Path
import shutil
import sys

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "image"
MOBILE_DIR = SOURCE_DIR / "mobile"
DESKTOP_DIR = SOURCE_DIR / "desktop"
MOBILE_MAX_WIDTH = 1200
DESKTOP_MAX_WIDTH = 1600
MOBILE_QUALITY = 76
DESKTOP_QUALITY = 82
COPY_SIZE_THRESHOLD = 220 * 1024


def iter_source_images() -> list[Path]:
    return sorted(
        path
        for path in SOURCE_DIR.glob("*.webp")
        if path.is_file()
    )


def save_variant(
    source_path: Path,
    target_dir: Path,
    max_width: int,
    quality: int,
) -> tuple[str, int, int]:
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / source_path.name

    with Image.open(source_path) as original:
        image = ImageOps.exif_transpose(original)
        width, height = image.size

        if width <= max_width and source_path.stat().st_size <= COPY_SIZE_THRESHOLD:
            shutil.copy2(source_path, target_path)
            return source_path.name, width, height

        working = image.copy()
        working.thumbnail((max_width, max_width * 4), Image.Resampling.LANCZOS)
        working.save(
            target_path,
            format="WEBP",
            quality=quality,
            method=6,
        )
        return source_path.name, working.width, working.height


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    sources = iter_source_images()

    desktop = [
        save_variant(path, DESKTOP_DIR, DESKTOP_MAX_WIDTH, DESKTOP_QUALITY)
        for path in sources
    ]
    mobile = [
        save_variant(path, MOBILE_DIR, MOBILE_MAX_WIDTH, MOBILE_QUALITY)
        for path in sources
    ]

    print(f"Generated {len(desktop)} desktop assets in {DESKTOP_DIR}")
    for name, width, height in desktop:
        print(f"desktop {name}: {width}x{height}")

    print(f"Generated {len(mobile)} mobile assets in {MOBILE_DIR}")
    for name, width, height in mobile:
        print(f"mobile {name}: {width}x{height}")


if __name__ == "__main__":
    main()
