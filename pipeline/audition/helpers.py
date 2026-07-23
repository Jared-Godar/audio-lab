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
import shutil
import subprocess
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
# Playback + caching
# --------------------------------------------------------------------------- #

def play(path: Path) -> None:
    """Blocking playback via macOS afplay. Ctrl-C skips cleanly."""
    try:
        subprocess.run(["afplay", str(path)], check=False)
    except KeyboardInterrupt:
        pass


def sample_path(voice: Voice, text: str) -> Path:
    digest = hashlib.sha1(text.encode()).hexdigest()[:12]
    p = SAMPLES_DIR / voice.engine / voice.voice_id / f"{digest}.mp3"
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


# --------------------------------------------------------------------------- #
# Engines
# --------------------------------------------------------------------------- #

class EdgeTTS:
    name = "edge-tts"
    free = True

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
    MODEL = "eleven_multilingual_v2"

    def _key(self) -> str | None:
        return os.environ.get("ELEVENLABS_API_KEY")

    def available(self) -> bool:
        return bool(self._key())

    def list_voices(self, locale_prefix: str = "en") -> list[Voice]:
        r = requests.get(
            f"{self.API}/voices", headers={"xi-api-key": self._key()}, timeout=15
        )
        r.raise_for_status()
        out = []
        for v in r.json()["voices"]:
            # Free tier: only premade voices are usable via API (library voices 402).
            if v.get("category") != "premade":
                continue
            out.append(
                Voice(
                    engine=self.name,
                    voice_id=v["voice_id"],
                    name=v["name"].split(" - ")[0],
                    locale="en",
                    meta={"description": v["name"]},
                )
            )
        return sorted(out, key=lambda v: v.name)

    def estimate_credits(self, text: str) -> int:
        return len(text)  # 1 credit ~= 1 character

    def synthesize(self, voice: Voice, text: str, out_path: Path) -> Path:
        r = requests.post(
            f"{self.API}/text-to-speech/{voice.voice_id}",
            headers={"xi-api-key": self._key(), "Content-Type": "application/json"},
            json={"text": text, "model_id": self.MODEL},
            timeout=60,
        )
        if r.status_code != 200:
            raise RuntimeError(f"ElevenLabs {r.status_code}: {r.text[:200]}")
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
    DEFAULT_VOICES = [
        ("af_heart", "Heart", "en-US"), ("af_bella", "Bella", "en-US"),
        ("af_nicole", "Nicole", "en-US"), ("af_sky", "Sky", "en-US"),
        ("am_adam", "Adam", "en-US"), ("am_michael", "Michael", "en-US"),
        ("bf_emma", "Emma", "en-GB"), ("bf_isabella", "Isabella", "en-GB"),
        ("bm_george", "George", "en-GB"), ("bm_lewis", "Lewis", "en-GB"),
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
