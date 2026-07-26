"""Audition session logic: voice selection, listen/verdict loop, casting."""

from __future__ import annotations

from pathlib import Path

import questionary
from rich.console import Console
from rich.table import Table

from .helpers import (
    ENGINES,
    ExternalServiceError,
    Voice,
    load_results,
    play,
    sample_path,
    save_results,
    voice_record,
)

console = Console()

CANNED = (
    "The quick brown fox jumps over the lazy dog. "
    "Good morning — here's what's on deck for Wednesday, July 23rd: "
    "three meetings, one deadline, and a 40 percent chance of rain."
)

ROLES = ["host", "guest", "ancillary", "undecided"]


# --------------------------------------------------------------------------- #
# Synthesis with cache + ElevenLabs credit guard
# --------------------------------------------------------------------------- #


def get_sample(voice: Voice, text: str, engine, purpose: str = "") -> Path | None:
    path = sample_path(voice, text, engine.variant, purpose)
    if path.exists():
        return path
    if not engine.free:
        est = engine.estimate_credits(text)
        rate = engine.model.cost_multiplier
        if not questionary.confirm(
            f"{voice.name} on {engine.model.label} ≈ {est:,} credits "
            f"({len(text):,} chars × {rate}). Spend them?",
            default=True,
        ).ask():
            return None
    try:
        with console.status(f"Synthesizing {voice.label}…"):
            return engine.synthesize(voice, text, path)
    except ExternalServiceError as exc:
        console.print(f"[red]✗ {voice.label}[/red] — {exc}")
        path.unlink(missing_ok=True)
        return None
    except Exception as exc:  # noqa: BLE001
        console.print(f"[red]✗ {voice.label}: {exc}[/red]")
        path.unlink(missing_ok=True)
        return None


def show_budget(label: str) -> None:
    """Print the ElevenLabs credit ledger. Never fatal — this is a readout."""
    engine = ENGINES["elevenlabs"]
    if not engine.available():
        return
    try:
        remaining, limit = engine.credits_remaining()
    except ExternalServiceError as exc:
        console.print(f"[yellow]Credit check unavailable: {exc}[/yellow]")
        return
    pct = (remaining / limit * 100) if limit else 0
    colour = "green" if pct > 40 else "yellow" if pct > 15 else "red"
    console.print(
        f"[{colour}]{label}: {remaining:,} of {limit:,} credits "
        f"({pct:.0f}%)[/{colour}]  [dim]tier={engine.tier.name} "
        f"model={engine.model.model_id} fmt={engine.output_format}[/dim]"
    )


# --------------------------------------------------------------------------- #
# Selection
# --------------------------------------------------------------------------- #


def gather_voices(engine_names: list[str], locale: str) -> list[Voice]:
    voices: list[Voice] = []
    for name in engine_names:
        engine = ENGINES.get(name)
        if engine is None:
            console.print(f"[yellow]Unknown engine: {name}[/yellow]")
            continue
        if not engine.available():
            console.print(f"[yellow]{name}: unavailable, skipping[/yellow]")
            continue
        found = engine.list_voices(locale)
        console.print(f"[dim]{name}: {len(found)} voices[/dim]")
        voices.extend(found)
    return voices


def select_voices(voices: list[Voice]) -> list[Voice]:
    by_label = {v.label: v for v in voices}
    picked = questionary.checkbox(
        "Select voices to audition (space to mark, enter to confirm):",
        choices=sorted(by_label),
    ).ask()
    return [by_label[p] for p in (picked or [])]


# --------------------------------------------------------------------------- #
# Verdict loop
# --------------------------------------------------------------------------- #


def judge(voice: Voice, engine, text: str, purpose: str = "audition") -> bool | None:
    """Audition one voice. True=pass, False=fail, None=quit session."""
    current_text = text
    current_purpose = purpose
    while True:
        path = get_sample(voice, current_text, engine, current_purpose)
        if path is None:
            return False
        play(path)
        verdict = questionary.select(
            f"{voice.label}:",
            choices=["pass", "fail", "repeat", "custom text", "quit session"],
        ).ask()
        match verdict:
            case "pass":
                return True
            case "fail":
                return False
            case "repeat":
                continue
            case "custom text":
                new = questionary.text("Text to read:").ask()
                if new:
                    current_text = new
                    label = questionary.text(
                        "Label this sample (used in the filename):", default="custom"
                    ).ask()
                    current_purpose = label or "custom"
            case "quit session" | None:
                return None


def run_audition(engine_names: list[str], locale: str, text: str | None) -> None:
    script = text or CANNED
    if "elevenlabs" in engine_names:
        show_budget("Starting budget")
    voices = gather_voices(engine_names, locale)
    if not voices:
        console.print("[red]No voices available.[/red]")
        return

    results = load_results()
    seen = {
        r["engine"] + ":" + r["voice_id"] for r in results["passed"] + results["failed"]
    }

    while True:
        picks = select_voices(voices)
        if not picks:
            break
        for voice in picks:
            engine = ENGINES[voice.engine]
            outcome = judge(voice, engine, script)
            if outcome is None:
                picks = []
                break
            bucket = results["passed"] if outcome else results["failed"]
            if voice.key() not in seen:
                bucket.append(voice_record(voice))
                seen.add(voice.key())
            console.print(
                "  [green]✓ passed[/green]" if outcome else "  [red]✗ failed[/red]"
            )
        if not questionary.confirm("Back to the picker?", default=True).ask():
            break

    finish(results)


def run_shortlist(engine_names: list[str], text: str | None) -> None:
    """Replay previously passed voices head-to-head and re-verdict."""
    results = load_results()
    if not results["passed"]:
        console.print(
            "[yellow]No passed voices yet — run a full audition first.[/yellow]"
        )
        return
    script = text or CANNED
    if "elevenlabs" in engine_names:
        show_budget("Starting budget")
    keep, cut = [], []
    for rec in results["passed"]:
        voice = Voice(
            rec["engine"], rec["voice_id"], rec["name"], rec.get("locale", "")
        )
        engine = ENGINES[voice.engine]
        outcome = judge(voice, engine, script)
        if outcome is None:
            keep.extend(results["passed"][len(keep) + len(cut) :])  # rest unchanged
            break
        (keep if outcome else cut).append(rec)
    results["passed"] = keep
    results["failed"].extend(cut)
    finish(results)


def run_casting() -> None:
    """Assign roles to the passed list — separate pass, per design."""
    results = load_results()
    if not results["passed"]:
        console.print("[yellow]Nothing to cast — the passed list is empty.[/yellow]")
        return
    for rec in results["passed"]:
        role = questionary.select(
            f"{rec['engine']} · {rec['name']} — role:",
            choices=ROLES,
            default=rec.get("role", "undecided"),
        ).ask()
        if role is None:
            break
        rec["role"] = role
    finish(results)


# --------------------------------------------------------------------------- #
# Output
# --------------------------------------------------------------------------- #


def finish(results: dict) -> None:
    path = save_results(results)
    table = Table(title="Passed voices")
    for col in ("engine", "voice_id", "name", "locale", "role"):
        table.add_column(col)
    for r in results["passed"]:
        table.add_row(
            r["engine"],
            r["voice_id"],
            r["name"],
            r.get("locale", ""),
            r.get("role", "undecided"),
        )
    console.print(table)
    console.print(f"[dim]Saved -> {path}[/dim]")
    show_budget("Remaining")
    if results["passed"]:
        line = ", ".join(f"{r['engine']}:{r['voice_id']}" for r in results["passed"])
        console.print(f"\nClaude-ready: Use these voices: {line}")
