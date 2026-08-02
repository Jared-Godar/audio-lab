#!/usr/bin/env python3
"""Generate ``brand/fonts-manifest.json`` from the maintainer's synced Adobe faces.

Why this exists (#204): the maintainer's standing constraint is *every face in the
final design is in the ``audio-lab`` Adobe library; anything absent is definitionally
wrong*. That constraint was stated repeatedly and never applied as a check, so
``ArialNarrow-Bold`` reached ``main`` inside a builder marked **IN FORCE** and was
caught by the maintainer two merges later (#202). The manifest is the machine-readable
form of the constraint; ``scripts/check_brand_fonts.py`` is the gate that reads it.

The manifest is **generated, never hand-listed** — a hand-listed manifest is a claim,
and a claim is exactly what #204 says the repo already has too many of. Regenerate on
any machine where the library is synced::

    python3 scripts/generate_fonts_manifest.py

Deliberately zero-dependency: it parses the OpenType ``name`` table directly rather
than importing ``fontTools``. A gate whose regeneration needs a network install is a
gate that gets skipped, and skipping is the failure mode this whole issue is about.

What is read: the Adobe CoreSync livetype store, where Creative Cloud puts activated
Adobe Fonts as ``.otf`` files under obfuscated numeric names. Only ``name``-table
metadata is read — family, style, full name, PostScript name, and (for provenance)
version. **No glyph data is extracted or committed**, so nothing here redistributes a
licensed face; the manifest records only that a name is available on the maintainer's
machine.
"""

from __future__ import annotations

import argparse
import json
import struct
import sys
from pathlib import Path

# The Creative Cloud desktop app syncs activated Adobe Fonts here. The leading-dot
# directories are Adobe's, not ours; the filenames are numeric IDs with no relation to
# the face inside, which is precisely why the name table has to be read.
LIVETYPE_ROOT = (
    Path.home()
    / "Library"
    / "Application Support"
    / "Adobe"
    / "CoreSync"
    / "plugins"
    / "livetype"
)

MANIFEST_PATH = Path(__file__).resolve().parent.parent / "brand" / "fonts-manifest.json"

# OpenType name IDs worth keeping. 16/17 (typographic family/subfamily) are the ones
# that group a large family correctly: without them, every optical or width cut of
# Univers Next Pro reports as its own four-style family, which is how a 34-family
# library reads as 120 families.
NAME_IDS = {
    1: "family",
    2: "subfamily",
    4: "full_name",
    5: "version",
    6: "postscript_name",
    16: "typographic_family",
    17: "typographic_subfamily",
}

WINDOWS_PLATFORM = 3
MAC_PLATFORM = 1
ENGLISH_US = 0x409


class FontParseError(RuntimeError):
    """Raised when a file under the livetype root is not a parseable sfnt."""


def _decode(platform_id: int, raw: bytes) -> str:
    """Decode a name-table string per its platform's encoding.

    Windows records are UTF-16BE; Macintosh records are MacRoman. Getting this wrong
    is not a cosmetic problem — a UTF-16 string read as Latin-1 yields NUL-separated
    characters that will never match anything the gate compares against.
    """
    if platform_id == WINDOWS_PLATFORM:
        return raw.decode("utf-16-be", errors="replace").strip()
    if platform_id == MAC_PLATFORM:
        return raw.decode("mac-roman", errors="replace").strip()
    return raw.decode("utf-8", errors="replace").strip()


def read_name_table(blob: bytes, base: int = 0) -> dict[str, str]:
    """Return the interesting ``name``-table records of the sfnt font at ``base``."""
    if len(blob) < base + 12:
        raise FontParseError("truncated sfnt header")
    (num_tables,) = struct.unpack_from(">H", blob, base + 4)
    name_offset = None
    for index in range(num_tables):
        record = base + 12 + index * 16
        if len(blob) < record + 16:
            raise FontParseError("truncated table directory")
        tag, _checksum, offset, _length = struct.unpack_from(">4sIII", blob, record)
        if tag == b"name":
            name_offset = offset
            break
    if name_offset is None:
        raise FontParseError("no name table")

    _format, count, string_offset = struct.unpack_from(">HHH", blob, name_offset)
    names: dict[str, str] = {}
    # Records are not ordered by preference, so track whether the value we already
    # hold came from a Windows/English record; only those may be overwritten by
    # nothing, and anything else is overwritten by them.
    preferred: set[str] = set()
    for index in range(count):
        p_id, _e_id, lang_id, name_id, length, offset = struct.unpack_from(
            ">HHHHHH", blob, name_offset + 6 + index * 12
        )
        key = NAME_IDS.get(name_id)
        if key is None:
            continue
        start = name_offset + string_offset + offset
        value = _decode(p_id, blob[start : start + length])
        if not value:
            continue
        is_preferred = p_id == WINDOWS_PLATFORM and lang_id == ENGLISH_US
        if key in preferred and not is_preferred:
            continue
        names[key] = value
        if is_preferred:
            preferred.add(key)
    return names


def read_font_file(path: Path) -> list[dict[str, str]]:
    """Return one record per face in ``path`` (collections carry several)."""
    blob = path.read_bytes()
    if blob[:4] == b"ttcf":
        (font_count,) = struct.unpack_from(">I", blob, 8)
        offsets = struct.unpack_from(f">{font_count}I", blob, 12)
    else:
        offsets = (0,)
    return [read_name_table(blob, offset) for offset in offsets]


def collect(root: Path) -> tuple[list[dict[str, str]], list[str]]:
    """Walk ``root`` and return (face records, warnings)."""
    warnings: list[str] = []
    faces: list[dict[str, str]] = []
    candidates = sorted(
        path
        for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in {".otf", ".ttf", ".ttc", ".otc"}
    )
    for path in candidates:
        try:
            records = read_font_file(path)
        except (FontParseError, struct.error, OSError) as exc:
            warnings.append(f"{path.name}: {exc}")
            continue
        for record in records:
            postscript = record.get("postscript_name")
            if not postscript:
                warnings.append(f"{path.name}: no PostScript name")
                continue
            faces.append(
                {
                    "postscript_name": postscript,
                    "family": record.get("typographic_family")
                    or record.get("family")
                    or "",
                    "style": record.get("typographic_subfamily")
                    or record.get("subfamily")
                    or "",
                    "full_name": record.get("full_name") or "",
                }
            )
    faces.sort(
        key=lambda face: (face["family"].lower(), face["postscript_name"].lower())
    )
    return faces, warnings


def build_manifest(faces: list[dict[str, str]], previous: dict | None) -> dict:
    """Assemble the manifest document, carrying forward the reviewed exemptions.

    ``exempt`` is *not* regenerated. It is the maintainer-reviewed list of names that
    may legitimately appear in a builder while being absent from the library — system
    fallbacks in the archived shootout, principally. Regenerating it would let a
    machine grant its own exceptions, which is the failure this issue exists to close.
    """
    families: dict[str, list[str]] = {}
    for face in faces:
        families.setdefault(face["family"], []).append(face["postscript_name"])

    carried = (previous or {}).get("exempt", [])
    return {
        "$comment": (
            "GENERATED by scripts/generate_fonts_manifest.py from the Adobe CoreSync "
            "livetype store. Do not hand-edit the 'families' or 'faces' blocks — "
            "regenerate. 'exempt' IS hand-maintained and is the only editable block; "
            "each entry needs a reason, and adding one is a visible diff the "
            "maintainer reviews. See #204."
        ),
        "source": "Adobe CoreSync livetype store (Creative Cloud activated fonts)",
        "family_count": len(families),
        "face_count": len(faces),
        "families": {
            family: sorted(names) for family, names in sorted(families.items())
        },
        "faces": faces,
        "exempt": carried,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=LIVETYPE_ROOT,
        help="Adobe livetype store to read (default: the Creative Cloud location).",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=MANIFEST_PATH,
        help="Manifest path to write (default: brand/fonts-manifest.json).",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit non-zero if the committed manifest differs from a fresh read, "
        "instead of writing. For use where the library is synced.",
    )
    args = parser.parse_args()

    if not args.root.is_dir():
        print(
            f"Adobe livetype store not found at {args.root}.\n"
            "This machine has no synced Creative Cloud fonts, so the manifest cannot "
            "be regenerated here. That is not a failure: the committed manifest is the "
            "record, and scripts/check_brand_fonts.py reads it without needing the "
            "fonts. Regenerate on the maintainer's machine.",
            file=sys.stderr,
        )
        return 69

    faces, warnings = collect(args.root)
    for warning in warnings:
        print(f"warning: {warning}", file=sys.stderr)
    if not faces:
        print(f"No parseable faces under {args.root}.", file=sys.stderr)
        return 1

    previous = None
    if args.out.exists():
        previous = json.loads(args.out.read_text())

    manifest = build_manifest(faces, previous)
    rendered = json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"

    if args.check:
        if not args.out.exists():
            print(f"{args.out} does not exist.", file=sys.stderr)
            return 1
        if args.out.read_text() != rendered:
            print(
                f"{args.out} is stale: the synced library no longer matches it.\n"
                "Run: python3 scripts/generate_fonts_manifest.py",
                file=sys.stderr,
            )
            return 1
        print(
            f"{args.out} matches the synced library "
            f"({manifest['family_count']} families / {manifest['face_count']} faces)."
        )
        return 0

    args.out.write_text(rendered)
    print(
        f"Wrote {args.out}: {manifest['family_count']} families / "
        f"{manifest['face_count']} faces, {len(manifest['exempt'])} exemptions carried."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
