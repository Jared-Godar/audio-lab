"""Ep01 v2.0 render path — per-turn stems, assembly, and the over-threshold gate (#43).

The screen test (:mod:`core.screentest`) rendered a *shortlist* of voices on three
lines to cast the co-host. This renders the *whole episode*: every turn of
``episodes/ToldStraight-Ep01/transcript.md`` as its own stem, one request per turn, then
concatenates the stems into a single master.

Why per-turn stems rather than one monolithic render (#43 §4A option 1, maintainer's
choice): the host track is a **placeholder** for the maintainer's own narration. Stems
mean swapping it later re-renders only the 27 host turns (~1,163 credits) instead of the
whole episode again. They also make a single bad turn cost ~40 credits to redo, not a
second full pass.

Everything billable reuses the existing machinery — ``ElevenLabsClient.synthesize``
(``attempts=2``; a retry can re-bill), the measured 0.55x account rate, and a
digest-manifest cache so a re-run after a mid-batch failure re-bills nothing. Nothing
here re-implements retry, cost, or naming.

The spend is gated twice: the library entry point spends only when called (the CLI
defaults to a dry-run and demands ``--confirm-spend``), and a batch whose estimate
exceeds the self-serve threshold hard-stops unless an explicit, auditable ceiling is
named (:class:`SpendGate`). A future unauthorised episode render still stops dead.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path

from .client import ElevenLabsClient
from .naming import EPISODES_DIR, episode_render_digest, episode_stem_name
from .net import ExternalServiceError
from .screentest import SELF_SERVE_MAX_CREDITS
from .voice import Voice

# The default working episode. Its transcript is the render's single source of dialogue.
EPISODE_SLUG = "ToldStraight-Ep01-v2"
TRANSCRIPT_MD = (
    Path(__file__).resolve().parents[2]
    / "episodes"
    / "ToldStraight-Ep01"
    / "transcript.md"
)

# The expert's character name in the transcript. PM-proposed, maintainer-confirmed
# (#43 §3). A single constant so a later change is one edit and one re-run, and so the
# name lives in exactly one place in code — never scattered as a magic string.
EXPERT_CHARACTER = "Owen"

# Which cast-record role reads each transcript speaker. The transcript names *roles*
# (HOST/EXPERT); the cast names *casting slots* (host/co-host). Daniel (host) reads the
# HOST turns; Jofra (co-host) reads the EXPERT turns — Jofra *is* the voice, Owen is the
# character (#43 §1).
SPEAKER_CAST_ROLE = {"HOST": "host", "EXPERT": "co-host"}

# Measured 2026-07-27 from the tracked transcript (spec §2). The parse must reproduce
# these exactly, or it has drifted and would misquote the spend (#43 §4B, §7).
EXPECTED_TURNS = 54
EXPECTED_PER_SPEAKER = {"HOST": 27, "EXPERT": 27}
EXPECTED_CHARS = {"HOST": 2_115, "EXPERT": 7_110}

# One turn per line. The optional ``(…)`` is the parenthetical the label rewrite (§4E)
# leaves on EXPERT (the character, ``Owen``) but strips from HOST — so this matches both
# ``**HOST:** text`` and ``**EXPERT (Owen):** text`` (and the pre-rewrite forms). The
# spoken text is group 3, unaffected by the label, so the §2 character counts hold.
_TURN_RE = re.compile(r"^\*\*(HOST|EXPERT)(?: \(([^)]*)\))?:\*\* (.*)$")
# A chapter heading, e.g. ``## [1:30] It's real, and it's in your DNA``.
_CHAPTER_RE = re.compile(r"^## \[")


# --------------------------------------------------------------------------- #
# Parsing
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class Turn:
    """One line of dialogue: its playback position, who speaks, and the words.

    ``chapter_start`` marks the first turn under a new ``## [x:xx]`` section — the
    mastering step gives those a longer inter-turn beat (#46).
    """

    index: int
    speaker: str  # "HOST" | "EXPERT"
    text: str
    chapter_start: bool = False

    @property
    def chars(self) -> int:
        return len(self.text)


class ParseError(RuntimeError):
    """The transcript did not parse to the shape spec §2 measured — never guessed past."""


def parse_turns(path: Path = TRANSCRIPT_MD) -> list[Turn]:
    """Ordered turns from a transcript markdown file.

    The text of a turn is everything after ``**SPEAKER (label):** `` on its line —
    chapter headings, the TL;DR, and the content note are not turns and are skipped. A
    turn that is the first after a ``## [x:xx]`` heading is flagged ``chapter_start``.
    """
    if not path.exists():
        raise ParseError(f"{path} does not exist — nothing to render.")
    turns: list[Turn] = []
    pending_chapter = False
    for line in path.read_text().splitlines():
        if _CHAPTER_RE.match(line):
            pending_chapter = True
            continue
        m = _TURN_RE.match(line)
        if m:
            turns.append(
                Turn(
                    index=len(turns),
                    speaker=m.group(1),
                    text=m.group(3),
                    chapter_start=pending_chapter,
                )
            )
            pending_chapter = False
    return turns


def chapter_starts(turns: list[Turn]) -> list[int]:
    """Turn indices that begin a new chapter — 0/8/16/24/32/40 for Ep01."""
    return [t.index for t in turns if t.chapter_start]


def speaker_split(turns: list[Turn]) -> dict[str, dict[str, int]]:
    """Per-speaker turn count, character total, and longest turn — the §2 receipts."""
    out: dict[str, dict[str, int]] = {}
    for t in turns:
        s = out.setdefault(t.speaker, {"turns": 0, "chars": 0, "longest": 0})
        s["turns"] += 1
        s["chars"] += t.chars
        s["longest"] = max(s["longest"], t.chars)
    return out


def verify_parse(turns: list[Turn]) -> None:
    """Raise :class:`ParseError` if the parse disagrees with spec §2. Silence == match.

    A drifted parse would quietly misquote a 5,000-credit spend, so the counts are a
    hard gate, not incidental output (#43 §7).
    """
    if len(turns) != EXPECTED_TURNS:
        raise ParseError(f"parsed {len(turns)} turns, expected {EXPECTED_TURNS}")
    split = speaker_split(turns)
    for spk, n in EXPECTED_PER_SPEAKER.items():
        got = split.get(spk, {}).get("turns", 0)
        if got != n:
            raise ParseError(f"{spk}: parsed {got} turns, expected {n}")
    for spk, c in EXPECTED_CHARS.items():
        got = split.get(spk, {}).get("chars", 0)
        if got != c:
            raise ParseError(f"{spk}: parsed {got:,} chars, expected {c:,}")


# --------------------------------------------------------------------------- #
# Quote / estimate
# --------------------------------------------------------------------------- #


def estimate(client: ElevenLabsClient, turns: list[Turn]) -> dict:
    """Pre-flight quote for the whole episode at the client's model/format.

    ``credits`` is rounded once on the character total (the gate number), matching
    :func:`core.screentest.estimate`. Per-speaker credits are reported for the host-swap
    math (~1,163 to redo the host later) but derived so they sum to the total.
    """
    per_speaker_chars = {
        spk: sum(t.chars for t in turns if t.speaker == spk)
        for spk in EXPECTED_PER_SPEAKER
    }
    total_chars = sum(t.chars for t in turns)
    rate = client.effective_rate
    total_credits = round(total_chars * rate)
    host_credits = round(per_speaker_chars.get("HOST", 0) * rate)
    return {
        "n_turns": len(turns),
        "per_speaker_chars": per_speaker_chars,
        "total_chars": total_chars,
        "rate": rate,
        "credits": total_credits,
        "host_credits": host_credits,  # cost to re-render the host stems later
        "expert_credits": total_credits - host_credits,
    }


# --------------------------------------------------------------------------- #
# The over-threshold spend gate
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class SpendGate:
    """Decides whether a batch may spend, and says why — auditable, never silent.

    A batch at or under the self-serve threshold spends on ``--confirm-spend`` alone. A
    batch *over* it (this episode is ~5,074) must name an explicit ceiling that both
    authorises the spend and caps it: the estimate has to be ≤ the ceiling. No ceiling,
    or an estimate above it, is a hard stop — the exact refusal a future unauthorised
    episode render must still hit (#43 §4C, §5 negative test). The threshold is never
    lowered and the override is never silent.
    """

    credits_est: int
    authorize_ceiling: int | None = None
    self_serve_max: int = SELF_SERVE_MAX_CREDITS

    @property
    def over_threshold(self) -> bool:
        return self.credits_est > self.self_serve_max

    def decision(self) -> tuple[bool, str]:
        if not self.over_threshold:
            return True, (
                f"{self.credits_est:,} credits within the self-serve "
                f"{self.self_serve_max:,} threshold — no ceiling needed"
            )
        if self.authorize_ceiling is None:
            return False, (
                f"STOP: estimate {self.credits_est:,} exceeds the self-serve "
                f"{self.self_serve_max:,} threshold and no authorised ceiling was "
                "given. Hand this to the maintainer — do not spend."
            )
        if self.credits_est > self.authorize_ceiling:
            return False, (
                f"STOP: estimate {self.credits_est:,} exceeds the authorised ceiling "
                f"{self.authorize_ceiling:,}. A quote this far off means the parse "
                "drifted; the authorisation was given against a smaller number."
            )
        return True, (
            f"authorised: {self.credits_est:,} ≤ ceiling {self.authorize_ceiling:,} "
            f"(over the {self.self_serve_max:,} self-serve threshold, override logged)"
        )

    @property
    def allowed(self) -> bool:
        return self.decision()[0]


# --------------------------------------------------------------------------- #
# Per-turn render records
# --------------------------------------------------------------------------- #


@dataclass
class TurnRecord:
    turn: Turn
    voice: Voice
    role: str  # "host" | "expert" — for the filename and manifest
    path: Path
    credits_est: int
    digest: str
    cached: bool = False
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None


@dataclass
class EpisodeResult:
    records: list[TurnRecord] = field(default_factory=list)
    stems_dir: Path | None = None
    manifest_path: Path | None = None

    @property
    def rendered(self) -> list[TurnRecord]:
        return [r for r in self.records if r.ok and not r.cached]

    @property
    def cached(self) -> list[TurnRecord]:
        return [r for r in self.records if r.cached]

    @property
    def failures(self) -> list[TurnRecord]:
        return [r for r in self.records if r.error]

    def ordered_stems(self) -> list[Path]:
        """Stem paths in turn order — playback order — for assembly."""
        return [
            r.path for r in sorted(self.records, key=lambda r: r.turn.index) if r.ok
        ]


# --------------------------------------------------------------------------- #
# Manifest (sibling to the stems)
# --------------------------------------------------------------------------- #


def stems_dir_for(episode_slug: str = EPISODE_SLUG) -> Path:
    return EPISODES_DIR / episode_slug / "stems"


def _manifest_path(stems_dir: Path) -> Path:
    return stems_dir / "manifest.json"


def load_episode_manifest(stems_dir: Path) -> dict:
    p = _manifest_path(stems_dir)
    if p.exists():
        try:
            return json.loads(p.read_text())
        except json.JSONDecodeError:
            return {}  # a corrupt index just means re-render, never a crash
    return {}


def _save_episode_manifest(stems_dir: Path, manifest: dict) -> None:
    stems_dir.mkdir(parents=True, exist_ok=True)
    _manifest_path(stems_dir).write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    )


def set_measured_credits(stems_dir: Path, digest: str, credits: int) -> None:
    """Patch a manifest entry with credits reconciled from /v1/history."""
    manifest = load_episode_manifest(stems_dir)
    if digest in manifest:
        manifest[digest]["credits_measured"] = credits
        _save_episode_manifest(stems_dir, manifest)


# --------------------------------------------------------------------------- #
# The render (spends credits)
# --------------------------------------------------------------------------- #


def render_episode(
    client: ElevenLabsClient,
    turns: list[Turn],
    speaker_voices: dict[str, Voice],
    *,
    purpose: str,
    episode_slug: str = EPISODE_SLUG,
    pause_s: float = 0.0,
    console=None,
) -> EpisodeResult:
    """Render every turn as its own stem. **Spends credits.**

    The caller confirms the spend and passes the gate before calling — the CLI does this
    via ``--confirm-spend`` and :class:`SpendGate`. ``purpose`` is mandatory (it names
    the batch and rides into every filename). Each turn is cached by
    :func:`~core.naming.episode_render_digest` (turn index + voice + text + variant), so
    a re-run after a mid-batch failure re-renders nothing already on disk. A single turn
    failing (e.g. a transient error) is recorded and the batch continues.

    ``pause_s`` sleeps that many seconds after each *billed* synthesis (not cached turns,
    not failures). ElevenLabs' abuse detection returns a **401** — not a 429 — when a
    burst of rapid v3 generations trips it, temporarily disabling TTS while account GETs
    still succeed; observed at ~25 back-to-back calls (#43). Pacing keeps the batch under
    that radar. 401 stays fail-fast (never retried — it can be a genuine bad key), so
    pacing, not retry, is the right defence.
    """
    if not purpose:
        raise ValueError(
            "render_episode needs a purpose — a caller that cannot name what a batch is "
            "for is a design smell (CLAUDE.md, self-describing artifacts)."
        )

    def emit(msg: str) -> None:
        if console is not None:
            console.print(msg)

    variant = client.variant
    stems_dir = stems_dir_for(episode_slug)
    manifest = load_episode_manifest(stems_dir)
    result = EpisodeResult(stems_dir=stems_dir, manifest_path=_manifest_path(stems_dir))

    for turn in turns:
        voice = speaker_voices[turn.speaker]
        role = turn.speaker.lower()  # host | expert (for the human-readable filename)
        credits_est = round(turn.chars * client.effective_rate)
        digest = episode_render_digest(turn.index, voice.voice_id, turn.text, variant)

        if digest in manifest and (stems_dir / manifest[digest]["file"]).exists():
            path = stems_dir / manifest[digest]["file"]
            emit(
                f"  [dim]cached[/dim] t{turn.index:02d} {role} · {voice.name} → {path.name}"
            )
            result.records.append(
                TurnRecord(turn, voice, role, path, credits_est, digest, cached=True)
            )
            continue

        taken = {v["file"] for v in manifest.values()}
        name = episode_stem_name(turn.index, voice, role, variant, purpose, taken)
        out_path = stems_dir / name

        try:
            client.synthesize(voice, turn.text, out_path)
        except ExternalServiceError as exc:
            emit(f"  [red]✗[/red] t{turn.index:02d} {role} · {voice.name}: {exc}")
            result.records.append(
                TurnRecord(
                    turn, voice, role, out_path, credits_est, digest, error=str(exc)
                )
            )
            continue

        manifest[digest] = {
            "turn": turn.index,
            "speaker": turn.speaker,
            "role": role,
            "voice_id": voice.voice_id,
            "file": name,
            "chars": turn.chars,
            "variant": variant,
            "purpose": purpose,
            "credits_est": credits_est,
            "credits_measured": None,  # filled by reconciliation from /v1/history
            "digest": digest,
        }
        _save_episode_manifest(stems_dir, manifest)
        emit(f"  [green]✓[/green] t{turn.index:02d} {role} · {voice.name} → {name}")
        result.records.append(
            TurnRecord(turn, voice, role, out_path, credits_est, digest)
        )
        if pause_s > 0:
            time.sleep(pause_s)

    return result


# --------------------------------------------------------------------------- #
# Assembly (spends NO credits — local ffmpeg only)
# --------------------------------------------------------------------------- #


class AssemblyError(RuntimeError):
    """ffmpeg/ffprobe missing or a concat failed — a local-tool condition, named plainly."""


DEFAULT_GAP_MS = 350  # a conversational inter-turn beat (#43 §4D)


def _run(cmd: list[str]) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(cmd, capture_output=True, text=True, check=True)
    except FileNotFoundError as exc:
        raise AssemblyError(
            f"{cmd[0]} not found on PATH — install ffmpeg to assemble the master. "
            "This is a local-tool condition, not a defect in the render."
        ) from exc
    except subprocess.CalledProcessError as exc:
        raise AssemblyError(
            f"{cmd[0]} failed ({exc.returncode}): {(exc.stderr or '')[-500:]}"
        ) from exc


def _probe_channels(path: Path) -> int:
    if not shutil.which("ffprobe"):
        return 1
    proc = _run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=channels",
            "-of",
            "csv=p=0",
            str(path),
        ]
    )
    try:
        return int(proc.stdout.strip() or "1")
    except ValueError:
        return 1


def assemble_master(
    stems: list[Path],
    out_path: Path,
    *,
    gap_ms: int = DEFAULT_GAP_MS,
    bitrate: str = "192k",
    sample_rate: int = 44_100,
    console=None,
) -> Path:
    """Concatenate ``stems`` in order into one master, with ``gap_ms`` of silence between.

    Works from stems alone, so it can be re-run after a host swap without touching the
    guest track (#43 §4D). Spends no credits. The output is re-encoded once at
    ``bitrate`` so the concatenation is clean regardless of per-stem frame boundaries —
    correct for a master. Demonstrable on synthetic/silent input: it only needs mp3
    files on disk, not a real render.
    """
    if not stems:
        raise AssemblyError("no stems to assemble.")
    if not shutil.which("ffmpeg"):
        raise AssemblyError(
            "ffmpeg not found on PATH — cannot assemble. Local-tool condition, not a "
            "render defect."
        )
    for s in stems:
        if not Path(s).exists():
            raise AssemblyError(f"stem missing: {s}")

    channels = _probe_channels(Path(stems[0]))
    layout = "mono" if channels == 1 else "stereo"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        gap = tmp / "gap.mp3"
        _run(
            [
                "ffmpeg",
                "-v",
                "error",
                "-y",
                "-f",
                "lavfi",
                "-i",
                f"anullsrc=r={sample_rate}:cl={layout}",
                "-t",
                f"{gap_ms / 1000:.3f}",
                "-c:a",
                "libmp3lame",
                "-b:a",
                bitrate,
                str(gap),
            ]
        )
        # Interleave: stem, gap, stem, gap, …, stem — gaps only *between* turns.
        lines: list[str] = []
        for i, s in enumerate(stems):
            if i > 0:
                lines.append(f"file '{gap}'")
            lines.append(f"file '{Path(s).resolve()}'")
        list_txt = tmp / "concat.txt"
        list_txt.write_text("\n".join(lines) + "\n")

        _run(
            [
                "ffmpeg",
                "-v",
                "error",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(list_txt),
                "-c:a",
                "libmp3lame",
                "-b:a",
                bitrate,
                "-ar",
                str(sample_rate),
                str(out_path),
            ]
        )
    if console is not None:
        console.print(
            f"  [green]✓[/green] assembled {len(stems)} stems "
            f"(+{gap_ms} ms gaps) → {out_path.name}"
        )
    return out_path


# --------------------------------------------------------------------------- #
# Mastering (#46) — the post-production chain the maintainer approved for Ep01 v2.
#
# The signal-chain order is fixed by physics and preserved here: per-speaker level
# match (before concat — two voices can't be re-separated once glued) → concat with
# structure-aware gaps → polish (high-pass, gentle compression) → loudness-normalize
# LAST (compression shifts loudness, so normalize is always the terminal link). Spends
# no credits; local ffmpeg only. Demonstrable on synthetic input.
# --------------------------------------------------------------------------- #

DEFAULT_TEMPO = 1.08
DEFAULT_LOUDNORM_I = -16.0  # LUFS delivery target (podcast standard)
_LOUDNORM_TP, _LOUDNORM_LRA = -1.5, 11.0
_TRIM_DB = "-50dB"  # only near-silence; won't eat consonants/breaths
CHAPTER_GAP_MS, QUICK_GAP_MS, NORMAL_GAP_MS = 500, 180, 300
SHORT_TURN_CHARS = 25  # a turn this short is an interjection ("Ah.", "Double.")


def smart_gap_ms(
    turns: list[Turn],
    i: int,
    *,
    chapter: int = CHAPTER_GAP_MS,
    quick: int = QUICK_GAP_MS,
    normal: int = NORMAL_GAP_MS,
    short_turn: int = SHORT_TURN_CHARS,
) -> int:
    """Inter-turn gap *before* turn ``i``, aware of episode structure (#46).

    A chapter start gets a section beat; a turn adjacent to a short interjection snaps
    back quickly; everything else is a normal handoff. (This episode is strict
    HOST/EXPERT alternation, so speaker-change alone would be uniform — structure, not
    speaker, is what varies the pace here.)
    """
    if turns[i].chapter_start:
        return chapter
    if turns[i - 1].chars < short_turn or turns[i].chars < short_turn:
        return quick
    return normal


def _measure_lufs(path: Path) -> float:
    """Integrated loudness (LUFS) of an audio file, via loudnorm's analysis JSON."""
    proc = subprocess.run(
        [
            "ffmpeg",
            "-i",
            str(path),
            "-af",
            "loudnorm=print_format=json",
            "-f",
            "null",
            "-",
        ],
        capture_output=True,
        text=True,
    )
    m = re.search(r'\{[^{}]*"input_i"[^{}]*\}', proc.stderr, re.S)
    if not m:
        raise AssemblyError(
            "could not measure loudness — ffmpeg loudnorm analysis produced no JSON."
        )
    return float(json.loads(m.group(0))["input_i"])


def _decode_stem(src: Path, dst: Path, *, trim: bool, sample_rate: int) -> None:
    """Decode a stem to mono PCM wav, optionally trimming head/tail silence."""
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(src)]
    if trim:
        edge = (
            f"silenceremove=start_periods=1:start_threshold={_TRIM_DB}:detection=peak"
        )
        cmd += ["-af", f"{edge},areverse,{edge},areverse"]
    cmd += ["-ar", str(sample_rate), "-ac", "1", "-c:a", "pcm_s16le", str(dst)]
    _run(cmd)


def _silence_wav(ms: int, dst: Path, sample_rate: int) -> None:
    _run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"anullsrc=r={sample_rate}:cl=mono",
            "-t",
            f"{ms / 1000:.3f}",
            "-c:a",
            "pcm_s16le",
            str(dst),
        ]
    )


def _concat_wavs(paths: list[Path], dst: Path, tmp: Path) -> None:
    lst = tmp / f"{dst.stem}-list.txt"
    lst.write_text("\n".join(f"file '{p.resolve()}'" for p in paths) + "\n")
    _run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(lst),
            "-c",
            "copy",
            str(dst),
        ]
    )


@dataclass
class MasterResult:
    path: Path
    speaker_lufs_before: dict[str, float]  # per-speaker loudness pre-match
    speaker_lufs_after: dict[str, float]  # per-speaker loudness post-match
    final_lufs: float | None  # measured integrated loudness of the master

    @staticmethod
    def _gap(d: dict[str, float]) -> float:
        v = list(d.values())
        return max(v) - min(v) if len(v) > 1 else 0.0

    @property
    def speaker_gap_before(self) -> float:
        return self._gap(self.speaker_lufs_before)

    @property
    def speaker_gap_after(self) -> float:
        return self._gap(self.speaker_lufs_after)


def master_from_stems(
    stems: list[tuple[Turn, Path]],
    out_path: Path,
    *,
    tempo: float = DEFAULT_TEMPO,
    trim: bool = True,
    smart_gaps: bool = True,
    gap_ms: int = DEFAULT_GAP_MS,
    loudnorm_i: float | None = DEFAULT_LOUDNORM_I,
    polish: bool = True,
    bitrate: str = "192k",
    sample_rate: int = 44_100,
    console=None,
) -> MasterResult:
    """Master ordered ``(turn, stem)`` pairs into one finished episode file (#46).

    Chain: per-stem trim → per-speaker loudness match → concat with structure-aware
    gaps → high-pass + gentle compression (polish) → tempo → loudness-normalize. Every
    step is optional via its argument; the defaults are the approved Ep01 v2 recipe.
    Returns a :class:`MasterResult` carrying the per-speaker loudness measured *before*
    matching and the final master loudness, so callers can prove the match closed the
    gap and the target was hit — not merely that ffmpeg exited 0.
    """
    if not stems:
        raise AssemblyError("no stems to master.")
    if not shutil.which("ffmpeg"):
        raise AssemblyError(
            "ffmpeg not found on PATH — cannot master. Local-tool condition, not a "
            "render defect."
        )
    for _, p in stems:
        if not Path(p).exists():
            raise AssemblyError(f"stem missing: {p}")
    turns = [t for t, _ in stems]
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        # 1) decode (+ trim) each stem to PCM
        decoded: list[Path] = []
        for n, (_, src) in enumerate(stems):
            d = tmp / f"stem{n:03d}.wav"
            _decode_stem(Path(src), d, trim=trim, sample_rate=sample_rate)
            decoded.append(d)

        # 2) per-speaker loudness match (only when normalizing) — bring every speaker to
        #    the same level *before* concat, since two voices can't be re-separated later.
        speaker_lufs: dict[str, float] = {}
        speaker_lufs_after: dict[str, float] = {}
        gained = decoded
        if loudnorm_i is not None:
            speaker_idx = {
                spk: [n for n, t in enumerate(turns) if t.speaker == spk]
                for spk in sorted({t.speaker for t in turns})
            }
            gain: dict[str, float] = {}
            for spk, idx in speaker_idx.items():
                joined = tmp / f"spk-{spk}-before.wav"
                _concat_wavs([decoded[n] for n in idx], joined, tmp)
                lufs = _measure_lufs(joined)
                speaker_lufs[spk] = lufs
                gain[spk] = loudnorm_i - lufs  # match each speaker to the target
            gained = []
            for n, t in enumerate(turns):
                g = tmp / f"gain{n:03d}.wav"
                _run(
                    [
                        "ffmpeg",
                        "-v",
                        "error",
                        "-y",
                        "-i",
                        str(decoded[n]),
                        "-af",
                        f"volume={gain[t.speaker]:.2f}dB",
                        "-c:a",
                        "pcm_s16le",
                        str(g),
                    ]
                )
                gained.append(g)
            # re-measure each speaker after the gain — a receipt that the match closed
            # the gap, not merely that a gain was applied.
            for spk, idx in speaker_idx.items():
                joined = tmp / f"spk-{spk}-after.wav"
                _concat_wavs([gained[n] for n in idx], joined, tmp)
                speaker_lufs_after[spk] = _measure_lufs(joined)

        # 3) concat with structure-aware (or uniform) gaps
        gaps: dict[int, Path] = {}
        seq: list[Path] = []
        for n in range(len(gained)):
            if n > 0:
                ms = smart_gap_ms(turns, n) if smart_gaps else gap_ms
                if ms not in gaps:
                    gp = tmp / f"gap{ms}.wav"
                    _silence_wav(ms, gp, sample_rate)
                    gaps[ms] = gp
                seq.append(gaps[ms])
            seq.append(gained[n])
        joined = tmp / "joined.wav"
        _concat_wavs(seq, joined, tmp)

        # 4) master bus: polish → tempo → loudness-normalize (in that order)
        chain: list[str] = []
        if polish:
            chain.append("highpass=f=80")
            chain.append(
                "acompressor=threshold=-18dB:ratio=2:attack=20:release=250:makeup=2"
            )
        if tempo and tempo != 1.0:
            chain.append(f"atempo={tempo}")
        if loudnorm_i is not None:
            chain.append(
                f"loudnorm=I={loudnorm_i}:TP={_LOUDNORM_TP}:LRA={_LOUDNORM_LRA}"
            )
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(joined)]
        if chain:
            cmd += ["-af", ",".join(chain)]
        cmd += [
            "-c:a",
            "libmp3lame",
            "-b:a",
            bitrate,
            "-ar",
            str(sample_rate),
            str(out_path),
        ]
        _run(cmd)

    final_lufs = _measure_lufs(out_path) if loudnorm_i is not None else None
    result = MasterResult(out_path, speaker_lufs, speaker_lufs_after, final_lufs)
    if console is not None:
        parts = [f"{len(stems)} stems"]
        if trim:
            parts.append("trimmed")
        if smart_gaps:
            parts.append("structure gaps")
        if loudnorm_i is not None:
            parts.append(
                f"matched ({result.speaker_gap_before:.1f}→"
                f"{result.speaker_gap_after:.1f} dB gap)"
            )
        if polish:
            parts.append("polished")
        if tempo != 1.0:
            parts.append(f"{tempo}×")
        if final_lufs is not None:
            parts.append(f"{final_lufs:.1f} LUFS")
        console.print(
            f"  [green]✓[/green] mastered ({', '.join(parts)}) → {out_path.name}"
        )
    return result
