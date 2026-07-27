"""Screen-test render path — render a shortlist of voices on the real script (#38).

M2 stage two: the free preview sweep (#7) judged candidates on ElevenLabs' marketing
copy. This renders a chosen set of ``(voice, line)`` pairs at production quality on real
"Told Straight" dialogue, so the co-host is cast on how a voice reads *this* show, not a
generic demo.

Design tension resolved here (PR #29 recorded "synthesis stays a library call, never a
one-shot flag, so a credit spend is always deliberate"): the render path IS a library
call (:func:`render_screentest`), and the ``screentest`` CLI wrapper defaults to a
dry-run and refuses to spend without ``--confirm-spend``. The subcommand exists for
ergonomics; the spend gate keeps it deliberate.

Everything billable reuses the existing machinery — the tier system, ``synthesize`` with
``attempts=2`` (a retry can re-bill), the descriptive-filename + digest-manifest cache.
Nothing here re-implements retry, cost, or naming.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from .client import ElevenLabsClient
from .naming import descriptive_render_name, render_digest, voice_dir
from .net import ExternalServiceError
from .voice import Voice

# The self-serve spend ceiling from AGENTS.md § "Do these automatically". A batch whose
# pre-flight estimate exceeds this must stop and be handed to the maintainer.
SELF_SERVE_MAX_CREDITS = 2_000


@dataclass(frozen=True)
class Line:
    """One script line to read, with a slug that names what failure mode it exposes."""

    slug: str
    text: str
    tests: str = ""


# --------------------------------------------------------------------------- #
# This screen test's data — the #38 §4 decisions, grounded in the transcript.
# --------------------------------------------------------------------------- #

# Control: the premade ElevenLabs "Daniel" the maintainer already heard in the #10
# bake-off. Its voice_id is NOT retyped from the spec — it was read from /v1/voices by
# the tracked folder prefix ``onwK4e9Z`` (the folder manifest.json carries no voice_id).
# Named "Daniel Premade" so its folder is ``daniel-premade-onwK4e9Z``, distinct from the
# shortlist's *other* Daniel (``daniel-young-deep-african-8dvhVJc8``).
CONTROL: Voice = Voice(
    voice_id="onwK4e9ZLuTAKqWW03F9",
    name="Daniel Premade Control",
    category="premade",
    description="Control — the #10 bake-off premade Daniel; validates the render path.",
)

# Shortlist: #38 §4 option 1 — top 5 by adopter count from artifacts/voice-previews/.
# Names are crafted so voice_dir() yields disambiguated, self-describing folders.
CANDIDATES: list[Voice] = [
    Voice(voice_id="1wzJ0Fr9SDexsF2IsKU4", name="Adam Greene"),
    Voice(voice_id="JxfH70f7jvYhi0DKD8Xs", name="Josh Midlands"),
    # Named "Daniel Deep African" (not the fuller "Young Deep African Narrative") so the
    # 24-char folder-slug cap keeps "african" intact instead of truncating to "africa";
    # its folder daniel-deep-african-8dvhVJc8 never collides with the control's.
    Voice(voice_id="8dvhVJc85Oy9HBPo11aI", name="Daniel Deep African"),
    Voice(voice_id="NuRyEq0OdD9mMOyd51UZ", name="Jofra"),
    Voice(voice_id="9GiYR5zXBWwc0khQNQA8", name="Sha"),
]

# Ordered control-first so the render loop and /v1/history rows line up predictably.
SCREENTEST_VOICES: list[Voice] = [CONTROL, *CANDIDATES]

# Three EXPERT turns, verbatim from episodes/ToldStraight-Ep01/transcript.md, chosen to
# expose distinct failure modes (#38 §4 item 4). Char counts verified 286/106/142 = 534.
LINES: list[Line] = [
    Line(
        slug="L1-dense-stat",
        tests="numbers, citations, a mortality figure read without flippancy",
        text=(
            "Dalsgaard and colleagues, 2015, in The Lancet. Nearly two million Danes. "
            "Twenty-five million person-years of data. ADHD was associated with roughly "
            "double the all-cause mortality rate - a mortality rate ratio of two point "
            "zero seven. And the leading cause of those deaths was accidents."
        ),
    ),
    Line(
        slug="L2-aside",
        tests="warmth and self-deprecation — can it be a person, not a reader",
        text=(
            "That's right. I read the meta-analyses, and I still lost my keys twice "
            "getting here. Both things are true."
        ),
    ),
    Line(
        slug="L3-handoff",
        tests="landing an emotional beat and handing back to the host",
        text=(
            "For decades. So if that's you - you're not new to ADHD. You just finally "
            "got the paperwork for the marathon you've been running without shoes."
        ),
    ),
]


# --------------------------------------------------------------------------- #
# Records + estimation
# --------------------------------------------------------------------------- #


@dataclass
class RenderRecord:
    """One (voice, line) render outcome."""

    voice: Voice
    line: Line
    path: Path
    chars: int
    credits_est: int
    digest: str
    cached: bool = False
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None


@dataclass
class ScreentestResult:
    records: list[RenderRecord] = field(default_factory=list)

    @property
    def rendered(self) -> list[RenderRecord]:
        """Records that spent credits this run (rendered, not cached, no error)."""
        return [r for r in self.records if r.ok and not r.cached]

    @property
    def failures(self) -> list[RenderRecord]:
        return [r for r in self.records if r.error]


def pairs(voices: list[Voice], lines: list[Line]) -> list[tuple[Voice, Line]]:
    """The ordered ``(voice, line)`` set — voice-major, so a folder fills in line order."""
    return [(v, ln) for v in voices for ln in lines]


def estimate(client: ElevenLabsClient, voices: list[Voice], lines: list[Line]) -> dict:
    """Pre-flight quote for the whole batch at the client's current model/format.

    Returns per-voice / total character counts and the credit estimate at the measured
    account rate — the number that gates against :data:`SELF_SERVE_MAX_CREDITS`.
    """
    per_voice_chars = sum(len(ln.text) for ln in lines)
    total_chars = per_voice_chars * len(voices)
    return {
        "per_voice_chars": per_voice_chars,
        "total_chars": total_chars,
        "n_renders": len(voices) * len(lines),
        "rate": client.effective_rate,
        "credits": round(total_chars * client.effective_rate),
    }


# --------------------------------------------------------------------------- #
# Rich per-folder manifest (extends the base cache schema with the fields §5.B
# requires: voice_id, line slug, char count, measured credits). Keyed by the same
# render_digest as the base cache, so the two share one cache identity.
# --------------------------------------------------------------------------- #


def _manifest_path(voice: Voice) -> Path:
    return voice_dir(voice) / "manifest.json"


def _load(voice: Voice) -> dict:
    p = _manifest_path(voice)
    if p.exists():
        try:
            return json.loads(p.read_text())
        except json.JSONDecodeError:
            return {}  # a corrupt index just means re-render, never a crash
    return {}


def _save(voice: Voice, manifest: dict) -> None:
    p = _manifest_path(voice)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")


def set_measured_credits(voice: Voice, digest: str, credits: int) -> None:
    """Patch a manifest entry with the credits reconciled from /v1/history."""
    manifest = _load(voice)
    if digest in manifest:
        manifest[digest]["credits_measured"] = credits
        _save(voice, manifest)


# --------------------------------------------------------------------------- #
# The library entry point (spends credits)
# --------------------------------------------------------------------------- #


def render_screentest(
    client: ElevenLabsClient,
    voices: list[Voice],
    lines: list[Line],
    *,
    purpose: str,
    console=None,
) -> ScreentestResult:
    """Render every ``(voice, line)`` pair at the client's current model/format.

    **Spends credits.** The caller is responsible for confirming the spend before
    calling — the ``screentest`` CLI does this via ``--confirm-spend``. ``purpose`` is
    mandatory (``CLAUDE.md`` § self-describing artifacts): it names what the batch is
    for and becomes part of every filename. Each pair is cached by
    :func:`~core.naming.render_digest`; a pair already on disk is skipped, so a re-run
    does not re-bill. A single voice failing (e.g. a stale library id) is recorded and
    the batch continues — the control still validates the path.
    """
    if not purpose:
        raise ValueError(
            "render_screentest needs a purpose — a caller that cannot name what a "
            "batch is for is a design smell (CLAUDE.md, self-describing artifacts)."
        )

    def emit(msg: str) -> None:
        if console is not None:
            console.print(msg)

    variant = client.variant
    result = ScreentestResult()

    for voice, line in pairs(voices, lines):
        chars = len(line.text)
        credits_est = round(chars * client.effective_rate)
        digest = render_digest(line.text, variant)
        folder = voice_dir(voice)
        file_purpose = f"{purpose}-{line.slug}-screentest"

        manifest = _load(voice)
        if digest in manifest and (folder / manifest[digest]["file"]).exists():
            path = folder / manifest[digest]["file"]
            emit(f"  [dim]cached[/dim] {voice.name} · {line.slug} → {path.name}")
            result.records.append(
                RenderRecord(voice, line, path, chars, credits_est, digest, cached=True)
            )
            continue

        taken = {v["file"] for v in manifest.values()}
        name = descriptive_render_name(voice, variant, file_purpose, line.text, taken)
        out_path = folder / name

        try:
            client.synthesize(voice, line.text, out_path)
        except ExternalServiceError as exc:
            emit(f"  [red]✗[/red] {voice.name} · {line.slug}: {exc}")
            result.records.append(
                RenderRecord(
                    voice, line, out_path, chars, credits_est, digest, error=str(exc)
                )
            )
            continue

        manifest[digest] = {
            "file": name,
            "voice_id": voice.voice_id,
            "line": line.slug,
            "chars": chars,
            "variant": variant,
            "purpose": file_purpose,
            "credits_est": credits_est,
            "credits_measured": None,  # filled by reconciliation from /v1/history
        }
        _save(voice, manifest)
        emit(f"  [green]✓[/green] {voice.name} · {line.slug} → {name}")
        result.records.append(
            RenderRecord(voice, line, out_path, chars, credits_est, digest)
        )

    return result
