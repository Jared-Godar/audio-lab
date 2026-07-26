"""CLI wrapper for the voice audition tool.

Usage (from pipeline/):
    uv run audition                          # full audition, all engines
    uv run audition --engines edge-tts       # one engine only
    uv run audition --locale en-GB           # narrow the voice list
    uv run audition --shortlist              # replay passed voices head-to-head
    uv run audition --cast                   # assign host/guest/ancillary roles
    uv run audition --text "Custom script"   # override the canned sentence

Cost control (ElevenLabs only):
    uv run audition --tier draft             # half-price scratch renders
    uv run audition --tier production        # 192 kbps master quality
    uv run audition --model v3               # override the tier's model, same bitrate
    uv run audition --list-models            # models, rates and tiers, then exit
"""

from __future__ import annotations

import argparse

from .audition import run_audition, run_casting, run_shortlist
from .helpers import ACCOUNT_RATE_FACTOR, ENGINES, MODELS, TIERS, DEFAULT_TIER


def print_models() -> None:
    from rich.console import Console
    from rich.table import Table

    console = Console()

    mt = Table(title="ElevenLabs models")
    for col in ("key", "model_id", "listed", "effective", "max chars", "style"):
        mt.add_column(col)
    for key, m in MODELS.items():
        mt.add_row(
            key, m.model_id, f"{m.cost_multiplier}×",
            f"{m.cost_multiplier * ACCOUNT_RATE_FACTOR:.2f}×",
            f"{m.max_chars:,}", "yes" if m.supports_style else "—",
        )
    console.print(mt)
    console.print(
        f"[dim]effective = listed × {ACCOUNT_RATE_FACTOR} account discount; "
        f"verify with --check-rates[/dim]\n"
    )

    tt = Table(title="Tiers — what each is for")
    for col in ("tier", "model", "output", "rationale"):
        tt.add_column(col, overflow="fold")
    for key, t in TIERS.items():
        marker = " (default)" if key == DEFAULT_TIER else ""
        tt.add_row(key + marker, t.model, t.output_format, t.why)
    console.print(tt)


def check_rates() -> None:
    """Re-derive the billing rate per model from real generations."""
    from collections import defaultdict

    from rich.console import Console
    from rich.table import Table

    console = Console()
    engine = ENGINES["elevenlabs"]
    if not engine.available():
        console.print("[red]ELEVENLABS_API_KEY not set.[/red]")
        return

    by_model: dict[str, list[dict]] = defaultdict(list)
    for row in engine.recent_rates():
        by_model[row["model_id"]].append(row)

    t = Table(title="Observed billing (from /v1/history)")
    for col in ("model_id", "gens", "chars", "billed", "observed rate", "modeled"):
        t.add_column(col)
    known = {m.model_id: m for m in MODELS.values()}
    for mid, rows in sorted(by_model.items()):
        chars = sum(r["chars"] for r in rows)
        billed = sum(r["billed"] for r in rows)
        m = known.get(mid)
        modeled = f"{m.cost_multiplier * ACCOUNT_RATE_FACTOR:.2f}×" if m else "—"
        # Some models omit text from history, leaving chars at 0 — rate is then
        # unknowable from this endpoint alone, so say so rather than divide by zero.
        obs = f"{billed / chars:.2f}×" if chars else "n/a (text not logged)"
        t.add_row(mid, str(len(rows)), f"{chars:,}", f"{billed:,}", obs, modeled)
    console.print(t)
    console.print(
        "[dim]If observed and modeled diverge, update ACCOUNT_RATE_FACTOR in helpers.py.[/dim]"
    )


def main() -> None:
    parser = argparse.ArgumentParser(prog="audition", description="TTS voice audition tool")
    parser.add_argument(
        "--engines",
        default=",".join(ENGINES),
        help=f"Comma-separated engines (default: {','.join(ENGINES)})",
    )
    parser.add_argument("--locale", default="en", help="Locale prefix filter (default: en)")
    parser.add_argument("--text", default=None, help="Override the canned audition script")
    parser.add_argument(
        "--tier", default=DEFAULT_TIER, choices=sorted(TIERS),
        help=f"ElevenLabs cost/quality preset (default: {DEFAULT_TIER})",
    )
    parser.add_argument(
        "--model", default=None, choices=sorted(MODELS),
        help="Override the tier's model, keeping its bitrate (for A/B tests)",
    )
    parser.add_argument(
        "--list-models", action="store_true", help="Show models, rates and tiers, then exit"
    )
    parser.add_argument(
        "--check-rates", action="store_true",
        help="Re-derive billing rates from generation history, then exit",
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--shortlist", action="store_true", help="Re-judge previously passed voices")
    mode.add_argument("--cast", action="store_true", help="Assign roles to passed voices")
    args = parser.parse_args()

    if args.list_models:
        print_models()
        return

    if args.check_rates:
        check_rates()
        return

    engines = [e.strip() for e in args.engines.split(",") if e.strip()]

    eleven = ENGINES["elevenlabs"]
    eleven.apply_tier(args.tier)
    if args.model:
        eleven.override_model(args.model)

    if args.cast:
        run_casting()
    elif args.shortlist:
        run_shortlist(engines, args.text)
    else:
        run_audition(engines, args.locale, args.text)


if __name__ == "__main__":
    main()
