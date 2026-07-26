"""CLI for the ElevenLabs voice tooling foundation.

Usage (from pipeline/):
    uv run voicelab models                 # models, rates, tiers, capabilities
    uv run voicelab models --live          # + reconcile capabilities vs /v1/models
    uv run voicelab rates                  # re-derive billing rate from /v1/history
    uv run voicelab account                # voices already on the account
    uv run voicelab browse --gender male --accent british --min-users 10000
    uv run voicelab browse ... --download --purpose cohost-candidate

All of the above are FREE — none call /v1/text-to-speech. Synthesis (which spends
credits) is a library call (`ElevenLabsClient.synthesize`), deliberately not wired to
a one-shot CLI flag so a render is always a considered action.
"""

from __future__ import annotations

import argparse
from collections import defaultdict

from rich.console import Console
from rich.table import Table

from .client import ElevenLabsClient
from .models import ACCOUNT_RATE_FACTOR, DEFAULT_TIER, MODELS, TIERS

console = Console()


def _require_key(client: ElevenLabsClient) -> bool:
    if not client.available():
        console.print("[red]ELEVENLABS_API_KEY not set.[/red]")
        return False
    return True


def cmd_models(args: argparse.Namespace) -> None:
    mt = Table(title="ElevenLabs models")
    for col in (
        "key",
        "model_id",
        "listed",
        "effective",
        "max chars",
        "style",
        "boost",
    ):
        mt.add_column(col)
    for key, m in MODELS.items():
        mt.add_row(
            key,
            m.model_id,
            f"{m.cost_multiplier}×",
            f"{m.cost_multiplier * ACCOUNT_RATE_FACTOR:.2f}×",
            f"{m.max_chars:,}",
            "yes" if m.can_use_style else "—",
            "yes" if m.can_use_speaker_boost else "—",
        )
    console.print(mt)
    console.print(
        f"[dim]effective = listed × {ACCOUNT_RATE_FACTOR} account discount; "
        f"style/boost from /v1/models capability flags; verify with `rates` / "
        f"`models --live`[/dim]\n"
    )

    tt = Table(title="Tiers — what each is for")
    for col in ("tier", "model", "output", "rationale"):
        tt.add_column(col, overflow="fold")
    for key, t in TIERS.items():
        marker = " (default)" if key == DEFAULT_TIER else ""
        tt.add_row(key + marker, t.model, t.output_format, t.why)
    console.print(tt)

    if args.live:
        client = ElevenLabsClient()
        if not _require_key(client):
            return
        drift = client.reconcile_capabilities()
        if drift:
            console.print("[yellow]Capability drift vs /v1/models:[/yellow]")
            for line in drift:
                console.print(f"  [yellow]{line}[/yellow]")
        else:
            console.print("[green]Static capability flags match /v1/models.[/green]")


def cmd_rates(args: argparse.Namespace) -> None:
    client = ElevenLabsClient()
    if not _require_key(client):
        return
    by_model: dict[str, list[dict]] = defaultdict(list)
    for row in client.recent_rates():
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
        obs = f"{billed / chars:.2f}×" if chars else "n/a (text not logged)"
        t.add_row(mid, str(len(rows)), f"{chars:,}", f"{billed:,}", obs, modeled)
    console.print(t)
    console.print(
        "[dim]If observed and modeled diverge, update ACCOUNT_RATE_FACTOR in "
        "core/models.py.[/dim]"
    )


def cmd_account(args: argparse.Namespace) -> None:
    client = ElevenLabsClient()
    if not _require_key(client):
        return
    voices = client.list_voices()
    t = Table(title=f"Account voices ({len(voices)})")
    for col in ("name", "voice_id", "category"):
        t.add_column(col)
    for v in voices:
        t.add_row(v.name, v.voice_id, v.category)
    console.print(t)


def cmd_browse(args: argparse.Namespace) -> None:
    client = ElevenLabsClient()
    if not _require_key(client):
        return
    voices = client.browse_shared(
        gender=args.gender,
        accent=args.accent,
        age=args.age,
        category=args.category,
        search=args.search,
        language=args.language,
        min_users=args.min_users,
        max_results=args.limit,
    )
    t = Table(title=f"Shared library — {len(voices)} match (sorted by adopters)")
    for col in ("name", "gender", "accent", "age", "adopters", "descriptive"):
        t.add_column(col)
    for v in voices:
        t.add_row(v.name, v.gender, v.accent, v.age, f"{v.users:,}", v.descriptive)
    console.print(t)

    if args.download:
        if not args.purpose:
            console.print(
                "[red]--download requires --purpose (self-describing names).[/red]"
            )
            return
        console.print(f"[dim]Downloading {len(voices)} free previews…[/dim]")
        for v in voices:
            try:
                out = client.download_preview(v, args.purpose)
                console.print(f"  [green]✓[/green] {out.name}")
            except Exception as exc:  # noqa: BLE001
                console.print(f"  [red]✗ {v.name}: {exc}[/red]")


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="voicelab", description="ElevenLabs voice tooling"
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_models = sub.add_parser("models", help="Show models, rates, tiers, capabilities")
    p_models.add_argument(
        "--live", action="store_true", help="Reconcile capability flags vs /v1/models"
    )
    p_models.set_defaults(func=cmd_models)

    sub.add_parser("rates", help="Re-derive billing from /v1/history").set_defaults(
        func=cmd_rates
    )
    sub.add_parser("account", help="List voices on the account").set_defaults(
        func=cmd_account
    )

    p_browse = sub.add_parser("browse", help="Browse the shared voice library")
    p_browse.add_argument("--gender")
    p_browse.add_argument("--accent")
    p_browse.add_argument("--age")
    p_browse.add_argument("--category")
    p_browse.add_argument("--search")
    p_browse.add_argument("--language", default="en")
    p_browse.add_argument("--min-users", type=int, default=0, dest="min_users")
    p_browse.add_argument("--limit", type=int, default=30)
    p_browse.add_argument(
        "--download", action="store_true", help="Download free previews of the matches"
    )
    p_browse.add_argument("--purpose", help="Required with --download; names the files")
    p_browse.set_defaults(func=cmd_browse)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
