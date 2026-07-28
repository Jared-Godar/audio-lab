"""Self-describing artifact paths and caches.

Two rules, both hard (see ``CLAUDE.md``):

1. Never name a listenable file with a bare hash. Filenames are DESCRIPTIVE —
   ``YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE[-BITRATE].mp3`` — so a person can find them
   in a folder without opening each one. Exact cache identity (text + model + bitrate)
   lives in a sibling ``manifest.json`` keyed by digest; the filename is for humans,
   the manifest is for lookups.
2. The sample cache key includes model AND bitrate. Anything that adds a render
   parameter must extend the key, or samples collide across tiers/models — a real bug
   this cache was built to fix.
"""

from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

from .models import VENDOR
from .voice import SharedVoice, Voice

# core/naming.py -> parents[2] is the repo root (pipeline/core/naming.py).
REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = REPO_ROOT / "output"
AUDITION_DIR = OUTPUT_DIR / "auditions"
SAMPLES_DIR = AUDITION_DIR / "samples"
RESULTS_PATH = AUDITION_DIR / "voices.json"
# New shared-library previews land here. The hand-built sweep is authoritative and is
# never written to by this tool; its manifest is tracked at
# pipeline/tests/fixtures/voice-preview-sweep-manifest.json (#68) and its preview mp3s
# remain gitignored under artifacts/voice-previews/.
PREVIEWS_DIR = OUTPUT_DIR / "shared-previews"
# Assembled episodes (per-turn stems + master) land here (#43).
EPISODES_DIR = OUTPUT_DIR / "episodes"


def slug(s: str, limit: int = 40) -> str:
    """Lowercase, hyphenated, filesystem-safe fragment of a string."""
    s = re.sub(r"[^\w\s-]", "", s).strip().lower()
    return re.sub(r"[\s_]+", "-", s)[:limit].strip("-")


# --------------------------------------------------------------------------- #
# Rendered-sample cache (per-voice folder + digest-keyed manifest)
# --------------------------------------------------------------------------- #


def voice_dir(voice: Voice) -> Path:
    """Readable per-voice folder: ``Daniel-onwK4e9Z``, not a raw 20-char id.

    Name for the human, short id suffix for uniqueness — library voice names are not
    guaranteed distinct.
    """
    return SAMPLES_DIR / VENDOR / f"{slug(voice.name, 24)}-{voice.voice_id[:8]}"


def render_digest(text: str, variant: str) -> str:
    """The cache key for one rendered sample: text + variant (model|format).

    Both text and variant are in the key so a draft render and a master render of the
    same line never collide — the exact bug the manifest cache was built to fix. Shared
    by :func:`sample_path` and the screen-test recorder so there is one cache identity,
    not two.
    """
    return hashlib.sha1(f"{text}\x00{variant}".encode()).hexdigest()[:12]


def descriptive_render_name(
    voice: Voice, variant: str, purpose: str, text: str, taken: set[str]
) -> str:
    """Mint the human-readable filename for a render, avoiding ``taken`` collisions.

    Shape: ``YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE[-BITRATE]k.mp3`` (``CLAUDE.md``). A
    readable-name collision gets a numeric suffix, never a hash fallback. Reused by
    both the sample cache and the screen test so the naming rule lives in one place.
    """
    model = variant.split("|")[0].replace("eleven_", "")
    fmt = variant.split("|")[1].replace("mp3_44100_", "") if "|" in variant else ""
    parts = [
        datetime.now().strftime("%Y%m%d"),
        VENDOR,  # vendor first — whose engine made this, at a glance
        model,
        slug(voice.name, 24),
        slug(purpose or text, 40),
    ]
    if fmt:
        parts.append(f"{fmt}k")
    base = "-".join(p for p in parts if p)

    name, n = f"{base}.mp3", 2
    while name in taken:
        name, n = f"{base}-{n}.mp3", n + 1
    return name


# --------------------------------------------------------------------------- #
# Per-turn episode stems (#43)
#
# Unlike the sample cache above (one folder per voice, digest = text+variant), an
# episode is an *ordered* thing: two turns can carry identical text (e.g. "Double."),
# and the host and expert can read the same words. So the episode cache key includes
# the turn index AND the voice id — a turn is its own cache slot, and a re-run of the
# same turn re-bills nothing while never colliding two turns onto one file.
# --------------------------------------------------------------------------- #


def episode_render_digest(
    turn_index: int, voice_id: str, text: str, variant: str
) -> str:
    """Cache key for one episode stem: turn index + voice + text + variant.

    Turn index and ``voice_id`` join the key precisely because episode dialogue is not
    unique the way a screen-test line is — without them, two turns with the same words
    would share one file, and the assembly would play a stem twice.
    """
    raw = f"{turn_index}\x00{voice_id}\x00{text}\x00{variant}"
    return hashlib.sha1(raw.encode()).hexdigest()[:12]


def episode_stem_name(
    turn_index: int,
    voice: Voice,
    role: str,
    variant: str,
    purpose: str,
    taken: set[str],
) -> str:
    """Descriptive stem filename that ALSO sorts into playback order.

    Shape: ``tNN-YYYYMMDD-VENDOR-MODEL-ROLE-VOICE-PURPOSE[-BITRATE]k.mp3``. The
    zero-padded ``tNN`` leads so a plain lexical sort of the folder is turn order (#43
    §4.C); everything after it is the usual DATE-VENDOR-MODEL-VOICE-PURPOSE the naming
    rule wants (``CLAUDE.md``). ``role`` (host/expert) and the voice both appear, so the
    file says *who plays whom* at a glance. Collisions get a numeric suffix, never a
    hash fallback.
    """
    model = variant.split("|")[0].replace("eleven_", "")
    fmt = variant.split("|")[1].replace("mp3_44100_", "") if "|" in variant else ""
    # First word of the voice name — "Jofra – Expressive…" → "jofra", "Daniel" → "daniel".
    voice_short = slug(voice.name.split()[0], 16) if voice.name.split() else "voice"
    parts = [
        f"t{turn_index:02d}",
        datetime.now().strftime("%Y%m%d"),
        VENDOR,
        model,
        slug(role, 12),
        voice_short,
        slug(purpose, 24),
    ]
    if fmt:
        parts.append(f"{fmt}k")
    base = "-".join(p for p in parts if p)

    name, n = f"{base}.mp3", 2
    while name in taken:
        name, n = f"{base}-{n}.mp3", n + 1
    return name


def _manifest_path(voice: Voice) -> Path:
    return voice_dir(voice) / "manifest.json"


def _load_manifest(voice: Voice) -> dict:
    p = _manifest_path(voice)
    if p.exists():
        try:
            return json.loads(p.read_text())
        except json.JSONDecodeError:
            return {}  # corrupt index just means we re-render, never a crash
    return {}


def _save_manifest(voice: Voice, manifest: dict) -> None:
    p = _manifest_path(voice)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")


def sample_path(voice: Voice, text: str, variant: str = "", purpose: str = "") -> Path:
    """Cache location for one rendered sample.

    ``variant`` is ``"{model_id}|{output_format}"`` — both must be in the key so a
    draft render and a master render of the same text do not collide. Returns the
    cached path if this exact (text, variant) was rendered before; otherwise mints a
    fresh descriptive name and records it in the sibling manifest.
    """
    digest = render_digest(text, variant)
    folder = voice_dir(voice)
    folder.mkdir(parents=True, exist_ok=True)

    manifest = _load_manifest(voice)
    if digest in manifest:
        return folder / manifest[digest]["file"]

    taken = {v["file"] for v in manifest.values()}
    name = descriptive_render_name(voice, variant, purpose, text, taken)

    manifest[digest] = {
        "file": name,
        "text": text[:200],
        "variant": variant,
        "purpose": purpose,
    }
    _save_manifest(voice, manifest)
    return folder / name


# --------------------------------------------------------------------------- #
# Shared-library preview names (#7)
# --------------------------------------------------------------------------- #

PREVIEW_MANIFEST = PREVIEWS_DIR / "manifest.json"


def preview_filename(sv: SharedVoice, purpose: str) -> str:
    """Descriptive name for a downloaded library preview.

    Shape matches the authoritative sweep, e.g.
    ``20260726-elevenlabs-preview-adam-greene-clear-friendly-e-cohost-candidate.mp3``:
    ``{date}-{vendor}-preview-{name-slug}-{purpose}.mp3``.
    """
    if not purpose:
        raise ValueError(
            "preview download needs a purpose — a caller that cannot name what a "
            "sample is for is a design smell (CLAUDE.md, self-describing artifacts)."
        )
    parts = [
        datetime.now().strftime("%Y%m%d"),
        VENDOR,
        "preview",
        slug(sv.name, 40),
        slug(purpose, 40),
    ]
    return "-".join(p for p in parts if p) + ".mp3"


def load_preview_manifest() -> list[dict]:
    if PREVIEW_MANIFEST.exists():
        try:
            return json.loads(PREVIEW_MANIFEST.read_text())
        except json.JSONDecodeError:
            return []
    return []


def save_preview_manifest(rows: list[dict]) -> Path:
    PREVIEW_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    PREVIEW_MANIFEST.write_text(json.dumps(rows, indent=2) + "\n")
    return PREVIEW_MANIFEST
