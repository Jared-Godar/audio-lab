"""CLI for the ElevenLabs voice tooling foundation.

Usage (from pipeline/):
    uv run voicelab models                 # models, rates, tiers, capabilities
    uv run voicelab models --live          # + reconcile capabilities vs /v1/models
    uv run voicelab rates                  # re-derive billing rate from /v1/history
    uv run voicelab account                # voices already on the account
    uv run voicelab browse --gender male --accent british --min-users 10000
    uv run voicelab browse ... --download --purpose cohost-candidate
    uv run voicelab screentest                 # dry-run: quote + ledger, no spend
    uv run voicelab screentest --confirm-spend # render the shortlist (spends credits)

`models`/`rates`/`account`/`browse` are FREE — none call /v1/text-to-speech.
`screentest` is the one subcommand that can spend, and only with `--confirm-spend`; it
defaults to a dry-run that quotes the cost and refuses to render. General synthesis stays
a library call (`ElevenLabsClient.synthesize` / `screentest.render_screentest`) so a
credit spend is always a considered action.
"""

from __future__ import annotations

import argparse
from collections import defaultdict

from rich.console import Console
from rich.table import Table

from .client import ElevenLabsClient
from .models import ACCOUNT_RATE_FACTOR, DEFAULT_TIER, MODELS, TIERS
from .screentest import (
    LINES,
    SCREENTEST_VOICES,
    SELF_SERVE_MAX_CREDITS,
    estimate,
    render_screentest,
    set_measured_credits,
)

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


def _ledger(client: ElevenLabsClient, when: str) -> None:
    remaining, limit = client.credits_remaining()
    used = limit - remaining
    colour = "green" if remaining > limit * 0.2 else "yellow"
    console.print(
        f"[dim]Ledger ({when}):[/dim] "
        f"[{colour}]{remaining:,}[/{colour}] of {limit:,} credits remaining "
        f"({used:,} used this cycle)"
    )


def cmd_screentest(args: argparse.Namespace) -> None:
    """Render the co-host shortlist on real Ep01 dialogue (#38).

    Dry-run by default: prints the quote and the ledger and refuses to spend. Renders
    only with ``--confirm-spend``, then reconciles the actual spend from /v1/history.
    """
    # eleven_v3 at 192 kbps: the production tier's bitrate, model swapped to v3 at equal
    # cost (docs/elevenlabs.md § Tiers) — casting at production quality on purpose.
    client = ElevenLabsClient(tier="production")
    client.override_model("v3")
    if not _require_key(client):
        return

    voices, lines = SCREENTEST_VOICES, LINES
    est = estimate(client, voices, lines)

    console.print(
        f"[bold]Screen test[/bold] — {len(voices)} voices × {len(lines)} lines = "
        f"{est['n_renders']} renders on [cyan]{client.model.model_id}[/cyan] @ "
        f"{client.output_format}"
    )
    q = Table(title="Quote (before)")
    for col in ("chars/voice", "voices", "total chars", "× rate", "≈ credits"):
        q.add_column(col)
    q.add_row(
        f"{est['per_voice_chars']:,}",
        str(len(voices)),
        f"{est['total_chars']:,}",
        f"{est['rate']:.2f}×",
        f"{est['credits']:,}",
    )
    console.print(q)
    _ledger(client, "before")

    # Pre-flight spend gate: never spend past the self-serve threshold on this spec's
    # word alone (spec §4). Estimate is ~1,762; this is the hard stop if that ever grows.
    if est["credits"] > SELF_SERVE_MAX_CREDITS:
        console.print(
            f"[red]STOP:[/red] estimate {est['credits']:,} credits exceeds the "
            f"{SELF_SERVE_MAX_CREDITS:,}-credit self-serve threshold. Hand this to the "
            "maintainer before spending — do not proceed on a spec-quoted lower number."
        )
        return

    planned = Table(title="Planned renders")
    for col in ("#", "voice", "voice_id", "line", "chars", "≈ credits"):
        planned.add_column(col)
    for i, v in enumerate(voices):
        for ln in lines:
            planned.add_row(
                str(i),
                v.name,
                v.voice_id[:8] + "…",
                ln.slug,
                f"{len(ln.text):,}",
                f"{round(len(ln.text) * est['rate']):,}",
            )
    console.print(planned)

    if not args.confirm_spend:
        console.print(
            "[yellow]DRY RUN[/yellow] — nothing rendered, zero credits spent. "
            "Re-run with [bold]--confirm-spend[/bold] to render."
        )
        return

    # --- spend path ---------------------------------------------------------- #
    console.print("[bold]Rendering…[/bold] (a retry can re-bill; attempts capped at 2)")
    before_ids = {r["id"] for r in client.history_rows()}
    result = render_screentest(
        client, voices, lines, purpose=args.purpose, console=console
    )

    # Reconcile from /v1/history — the authoritative per-generation record, NOT
    # /v1/user/subscription (which lags and misattributes back-to-back calls).
    after = client.history_rows()
    new_v3 = [
        r for r in after if r["id"] not in before_ids and r["model_id"] == "eleven_v3"
    ]
    actual = sum(r["billed"] for r in new_v3)

    # Attribute per-render measured credits by zipping the new history rows (oldest
    # first) to the renders in call order. v3 omits text in history, so this order-based
    # attribution is the only per-call measurement available; it is 1:1 only when the
    # counts match, otherwise we keep the estimate and flag it.
    rendered = result.rendered
    if len(new_v3) == len(rendered) and rendered:
        for rec, row in zip(rendered, list(reversed(new_v3)), strict=True):
            set_measured_credits(rec.voice, rec.digest, row["billed"])
        attribution = "per-render measured (history rows matched 1:1)"
    else:
        attribution = (
            f"batch-total only — {len(new_v3)} new v3 history rows vs "
            f"{len(rendered)} rendered; per-render credits left as estimate"
        )

    _ledger(client, "after")
    delta = actual - est["credits"]
    console.print(
        f"[bold]Reconciliation (from /v1/history):[/bold] measured "
        f"[cyan]{actual:,}[/cyan] credits vs estimate {est['credits']:,} "
        f"(Δ {delta:+,}); {attribution}"
    )
    if result.failures:
        console.print(f"[red]{len(result.failures)} render(s) failed:[/red]")
        for rec in result.failures:
            console.print(
                f"  [red]✗ {rec.voice.name} · {rec.line.slug}: {rec.error}[/red]"
            )
    console.print(
        f"[green]{len(result.rendered)} rendered, "
        f"{sum(1 for r in result.records if r.cached)} cached, "
        f"{len(result.failures)} failed.[/green] "
        "Listen: [dim]find output/auditions/samples/elevenlabs -name '*screentest*'[/dim]"
    )


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

    p_screen = sub.add_parser(
        "screentest",
        help="Render the co-host shortlist on real Ep01 dialogue (#38). Dry-run by "
        "default; spends only with --confirm-spend.",
    )
    p_screen.add_argument(
        "--confirm-spend",
        action="store_true",
        dest="confirm_spend",
        help="Actually render and spend credits. Without it this is a dry run.",
    )
    p_screen.add_argument(
        "--purpose",
        default="ep01",
        help="Names what the batch is for; becomes part of every filename.",
    )
    p_screen.set_defaults(func=cmd_screentest)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
