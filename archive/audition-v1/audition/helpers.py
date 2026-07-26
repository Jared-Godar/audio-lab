"""Engine adapters and shared utilities for the voice audition tool.

Engines implement a tiny common interface:
    name          -> str
    available()   -> bool
    list_voices() -> list[Voice]
    synthesize(voice, text, out_path) -> Path   (raises on failure)

Adding a backend = adding a class here and registering it in ENGINES.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import shutil
import subprocess
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path

import requests

# Repo-relative output home: pipeline/audition/helpers.py -> repo root is parents[2]
REPO_ROOT = Path(__file__).resolve().parents[2]
AUDITION_DIR = REPO_ROOT / "output" / "auditions"
SAMPLES_DIR = AUDITION_DIR / "samples"
RESULTS_PATH = AUDITION_DIR / "voices.json"


@dataclass
class Voice:
    engine: str
    voice_id: str
    name: str
    locale: str = ""
    meta: dict = field(default_factory=dict)

    @property
    def label(self) -> str:
        loc = f" ({self.locale})" if self.locale else ""
        return f"{self.engine} · {self.name}{loc}"

    def key(self) -> str:
        return f"{self.engine}:{self.voice_id}"


# --------------------------------------------------------------------------- #
# Models and cost tiers
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class Model:
    """An ElevenLabs TTS model and what it costs to run.

    cost_multiplier is credits charged per character, straight from
    /v1/models -> model_rates.character_cost_multiplier.
    """

    model_id: str
    label: str
    cost_multiplier: float
    max_chars: int
    supports_style: bool = False


MODELS = {
    "v3": Model(
        "eleven_v3",
        "Eleven v3 — most expressive, audio-tag driven",
        cost_multiplier=1.0,
        max_chars=5_000,
    ),
    "multilingual_v2": Model(
        "eleven_multilingual_v2",
        "Multilingual v2 — voiceover/audiobook workhorse",
        cost_multiplier=1.0,
        max_chars=10_000,
        supports_style=True,
    ),
    "turbo_v2_5": Model(
        "eleven_turbo_v2_5",
        "Turbo v2.5 — half price, 32 languages",
        cost_multiplier=0.5,
        max_chars=40_000,
    ),
    "flash_v2": Model(
        "eleven_flash_v2",
        "Flash v2 — half price, English only, lowest latency",
        cost_multiplier=0.5,
        max_chars=30_000,
    ),
}


@dataclass(frozen=True)
class Tier:
    """A task-pinned quality/cost preset.

    The point is to spend cheaply where the output is thrown away and dearly
    where it ships — without having to remember model ids at the call site.
    """

    name: str
    model: str  # key into MODELS
    output_format: str  # ElevenLabs output_format code
    why: str


TIERS = {
    "draft": Tier(
        "draft",
        "turbo_v2_5",
        "mp3_44100_128",
        "half-price read-throughs — timing, pacing, does-this-line-land. Turbo "
        "over Flash: same price, better quality, 40k chars (a whole episode in "
        "one request); Flash only wins on realtime latency, which batch work "
        "never needs",
    ),
    "cast": Tier(
        "cast",
        "multilingual_v2",
        "mp3_44100_192",
        "auditions render at production quality; casting on draft output means "
        "judging a voice you will never actually ship",
    ),
    "production": Tier(
        "production",
        "multilingual_v2",
        "mp3_44100_192",
        "final master — swap to v3 with --model to A/B expressiveness at identical cost",
    ),
}

DEFAULT_TIER = "cast"

# Every model on this account bills at ~0.55x its advertised multiplier.
# Measured 2026-07-26 from /v1/history (character_count_change deltas):
#   multilingual_v2 0.55  v3 0.55  flash_v2 0.27  turbo_v2_5 0.27
# against listed rates of 1.0 / 1.0 / 0.5 / 0.5 — a uniform Creator-tier discount.
# Re-measure with:  uv run audition --check-rates
# If the discount lapses, estimates become conservative (over-quoted), never under.
ACCOUNT_RATE_FACTOR = 0.55


# --------------------------------------------------------------------------- #
# Network resilience
# --------------------------------------------------------------------------- #

TRANSIENT_STATUS = {408, 429, 500, 502, 503, 504}

PERMANENT_HINTS = {
    401: "API key rejected — check ELEVENLABS_API_KEY in your environment.",
    402: "Out of credits for this billing cycle.",
    403: "That voice or model isn't available on your plan.",
    404: "Voice or model not found — the id may be stale.",
    422: "Request rejected — text may exceed the model's per-request limit.",
}


class ExternalServiceError(RuntimeError):
    """A network or provider condition — not a defect in this code or your setup."""


def request_with_retry(method: str, url: str, *, attempts: int = 3, **kw):
    """HTTP with bounded exponential backoff on transient failures only.

    Permanent failures (auth, quota, not-found) fail fast — retrying a 401 only
    wastes time. Callers that spend credits should pass attempts=2: a timeout may
    land after the provider already billed, so every retry risks a second charge.
    """
    last = ""
    for attempt in range(1, attempts + 1):
        try:
            r = requests.request(method, url, **kw)
        except (requests.Timeout, requests.ConnectionError) as exc:
            last = f"{type(exc).__name__}: {exc}"
        else:
            if r.status_code == 200:
                return r
            if r.status_code not in TRANSIENT_STATUS:
                hint = PERMANENT_HINTS.get(r.status_code) or r.text[:200]
                raise ExternalServiceError(f"ElevenLabs {r.status_code}: {hint}")
            last = f"HTTP {r.status_code}"
        if attempt < attempts:
            time.sleep(1.5**attempt)
    raise ExternalServiceError(
        f"ElevenLabs unreachable after {attempts} attempts ({last}). This is a "
        "connectivity or service condition, not a problem with your setup — check "
        "status.elevenlabs.io and retry. Cached samples still play offline."
    )


# --------------------------------------------------------------------------- #
# Playback + caching
# --------------------------------------------------------------------------- #


def play(path: Path) -> None:
    """Blocking playback via macOS afplay. Ctrl-C skips cleanly."""
    try:
        subprocess.run(["afplay", str(path)], check=False)
    except KeyboardInterrupt:
        pass


def slug(s: str, limit: int = 40) -> str:
    """Lowercase, hyphenated, filesystem-safe fragment of a string."""
    s = re.sub(r"[^\w\s-]", "", s).strip().lower()
    return re.sub(r"[\s_]+", "-", s)[:limit].strip("-")


def voice_dir(voice: Voice) -> Path:
    """Readable per-voice folder: `Daniel-onwK4e9Z`, not a raw 20-char id.

    Name for the human, short id suffix for uniqueness — library voice names
    are not guaranteed distinct.
    """
    return SAMPLES_DIR / voice.engine / f"{slug(voice.name, 24)}-{voice.voice_id[:8]}"


def _manifest_path(voice: Voice) -> Path:
    return voice_dir(voice) / "manifest.json"


def sample_path(voice: Voice, text: str, variant: str = "", purpose: str = "") -> Path:
    """Cache location for one rendered sample.

    Filenames are DESCRIPTIVE and must stay that way:

        20260726-multilingual_v2-Daniel-ep01-h25-model-ab.mp3

    Never name a listenable artifact with a bare hash. A person has to find
    these in a folder and know what they are without opening every one.

    Exact cache identity still needs the full parameter set (text, model,
    bitrate, voice settings), so that lives in a sibling manifest.json keyed by
    digest. The filename is for humans; the manifest is for lookups. If two
    different keys would produce the same readable name, a numeric suffix
    disambiguates rather than falling back to a hash.
    """
    digest = hashlib.sha1(f"{text}\x00{variant}".encode()).hexdigest()[:12]
    folder = voice_dir(voice)
    folder.mkdir(parents=True, exist_ok=True)

    manifest = _load_manifest(voice)
    if digest in manifest:
        return folder / manifest[digest]["file"]

    model = variant.split("|")[0].replace("eleven_", "")
    fmt = variant.split("|")[1].replace("mp3_44100_", "") if "|" in variant else ""
    parts = [
        datetime.now().strftime("%Y%m%d"),
        slug(voice.engine, 16),  # vendor first — whose engine made this, at a glance
        # Verbatim so it matches MODELS keys. Empty for vendors with no model
        # concept (edge-tts, kokoro); the join below drops empty parts.
        model,
        slug(voice.name, 24),
        slug(purpose or text, 40),
    ]
    if fmt:
        parts.append(f"{fmt}k")
    base = "-".join(p for p in parts if p)

    name, n = f"{base}.mp3", 2
    taken = {v["file"] for v in manifest.values()}
    while name in taken:
        name, n = f"{base}-{n}.mp3", n + 1

    manifest[digest] = {
        "file": name,
        "text": text[:200],
        "variant": variant,
        "purpose": purpose,
    }
    _save_manifest(voice, manifest)
    return folder / name


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


# --------------------------------------------------------------------------- #
# Engines
# --------------------------------------------------------------------------- #


class EdgeTTS:
    name = "edge-tts"
    free = True
    variant = ""  # single fixed quality; nothing to discriminate in the cache

    def available(self) -> bool:
        try:
            import edge_tts  # noqa: F401

            return True
        except ImportError:
            return False

    def list_voices(self, locale_prefix: str = "en") -> list[Voice]:
        import edge_tts

        async def _voices():
            return await edge_tts.list_voices()

        raw = asyncio.run(_voices())
        out = []
        for v in raw:
            if not v["Locale"].startswith(locale_prefix):
                continue
            short = v["ShortName"]
            out.append(
                Voice(
                    engine=self.name,
                    voice_id=short,
                    name=short.split("-")[-1].replace("Neural", ""),
                    locale=v["Locale"],
                    meta={"gender": v.get("Gender", "")},
                )
            )
        return sorted(out, key=lambda v: (v.locale, v.name))

    def synthesize(self, voice: Voice, text: str, out_path: Path) -> Path:
        import edge_tts

        async def _run():
            comm = edge_tts.Communicate(text, voice.voice_id)
            await comm.save(str(out_path))

        asyncio.run(_run())
        return out_path


class ElevenLabs:
    name = "elevenlabs"
    free = False  # burns account credits; audition layer guards each call
    API = "https://api.elevenlabs.io/v1"

    def __init__(self, tier: str = DEFAULT_TIER) -> None:
        self.apply_tier(tier)

    # -- tier / model wiring ------------------------------------------------ #

    def apply_tier(self, tier_name: str) -> None:
        tier = TIERS[tier_name]
        self.tier = tier
        self.model = MODELS[tier.model]
        self.output_format = tier.output_format

    def override_model(self, model_key: str) -> None:
        """Keep the tier's bitrate, swap the model — for A/B tests at equal cost."""
        self.model = MODELS[model_key]

    @property
    def variant(self) -> str:
        return f"{self.model.model_id}|{self.output_format}"

    # -- account ------------------------------------------------------------ #

    def _key(self) -> str | None:
        return os.environ.get("ELEVENLABS_API_KEY")

    def available(self) -> bool:
        return bool(self._key())

    def credits_remaining(self) -> tuple[int, int]:
        """(remaining, monthly_limit) for the current billing cycle."""
        r = request_with_retry(
            "GET",
            f"{self.API}/user/subscription",
            headers={"xi-api-key": self._key()},
            timeout=15,
        )
        d = r.json()
        limit = d.get("character_limit", 0)
        return limit - d.get("character_count", 0), limit

    def list_voices(self, locale_prefix: str = "en") -> list[Voice]:
        r = request_with_retry(
            "GET",
            f"{self.API}/voices",
            headers={"xi-api-key": self._key()},
            timeout=15,
        )
        out = []
        for v in r.json()["voices"]:
            # Every category on this account is usable on Creator and above —
            # premade, plus anything cloned or added from the shared library.
            out.append(
                Voice(
                    engine=self.name,
                    voice_id=v["voice_id"],
                    name=v["name"].split(" - ")[0],
                    locale="en",
                    meta={
                        "description": v["name"],
                        "category": v.get("category", ""),
                    },
                )
            )
        return sorted(out, key=lambda v: v.name)

    def estimate_credits(self, text: str) -> int:
        return round(len(text) * self.effective_rate)

    @property
    def effective_rate(self) -> float:
        """Credits actually billed per character, discount included."""
        return self.model.cost_multiplier * ACCOUNT_RATE_FACTOR

    def recent_rates(self, limit: int = 40) -> list[dict]:
        """Per-generation billing straight from history — the source of truth.

        The /v1/user/subscription counter lags by tens of seconds and cannot be
        used to attribute cost to an individual request; this can.
        """
        r = request_with_retry(
            "GET",
            f"{self.API}/history",
            headers={"xi-api-key": self._key()},
            params={"page_size": limit},
            timeout=20,
        )
        rows = []
        for h in r.json().get("history", []):
            billed = h.get("character_count_change_to", 0) - h.get(
                "character_count_change_from", 0
            )
            rows.append(
                {
                    "model_id": h.get("model_id") or "?",
                    "chars": len(h.get("text") or ""),  # 0 for models that omit text
                    "billed": billed,
                }
            )
        return rows

    def synthesize(self, voice: Voice, text: str, out_path: Path) -> Path:
        if len(text) > self.model.max_chars:
            raise ExternalServiceError(
                f"{len(text):,} chars exceeds the {self.model.max_chars:,} limit for "
                f"{self.model.label}. Render chapter by chapter and concatenate."
            )
        r = request_with_retry(
            "POST",
            f"{self.API}/text-to-speech/{voice.voice_id}",
            attempts=2,  # a retry can re-bill; keep the blast radius to one
            headers={"xi-api-key": self._key(), "Content-Type": "application/json"},
            params={"output_format": self.output_format},
            json={"text": text, "model_id": self.model.model_id},
            timeout=120,
        )
        out_path.write_bytes(r.content)
        return out_path


class Kokoro:
    """Local Kokoro adapter.

    Install shape varies; configure via KOKORO_CMD, a template with
    {text} {voice} {out} placeholders, e.g.:

        set -Ux KOKORO_CMD 'kokoro-tts --voice {voice} --text {text} --output {out}'

    Unset -> engine reports unavailable and is skipped.
    """

    name = "kokoro"
    free = True
    variant = ""
    DEFAULT_VOICES = [
        ("af_heart", "Heart", "en-US"),
        ("af_bella", "Bella", "en-US"),
        ("af_nicole", "Nicole", "en-US"),
        ("af_sky", "Sky", "en-US"),
        ("am_adam", "Adam", "en-US"),
        ("am_michael", "Michael", "en-US"),
        ("bf_emma", "Emma", "en-GB"),
        ("bf_isabella", "Isabella", "en-GB"),
        ("bm_george", "George", "en-GB"),
        ("bm_lewis", "Lewis", "en-GB"),
    ]

    def _cmd(self) -> str | None:
        return os.environ.get("KOKORO_CMD")

    def available(self) -> bool:
        cmd = self._cmd()
        return bool(cmd) and shutil.which(cmd.split()[0]) is not None

    def list_voices(self, locale_prefix: str = "en") -> list[Voice]:
        return [
            Voice(engine=self.name, voice_id=vid, name=name, locale=loc)
            for vid, name, loc in self.DEFAULT_VOICES
            if loc.startswith(locale_prefix)
        ]

    def synthesize(self, voice: Voice, text: str, out_path: Path) -> Path:
        cmd = self._cmd().format(text=text, voice=voice.voice_id, out=str(out_path))
        subprocess.run(cmd, shell=True, check=True, capture_output=True)
        if not out_path.exists():
            raise RuntimeError("Kokoro produced no output file")
        return out_path


ENGINES = {e.name: e for e in (EdgeTTS(), ElevenLabs(), Kokoro())}


# --------------------------------------------------------------------------- #
# Results persistence
# --------------------------------------------------------------------------- #


def load_results() -> dict:
    if RESULTS_PATH.exists():
        return json.loads(RESULTS_PATH.read_text())
    return {"auditioned_at": None, "passed": [], "failed": []}


def save_results(results: dict) -> Path:
    results["auditioned_at"] = datetime.now().isoformat(timespec="seconds")
    RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    RESULTS_PATH.write_text(json.dumps(results, indent=2) + "\n")
    return RESULTS_PATH


def voice_record(voice: Voice, role: str = "undecided") -> dict:
    d = asdict(voice)
    d["role"] = role
    return d
