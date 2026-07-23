"""CLI wrapper for the voice audition tool.

Usage (from pipeline/):
    uv run audition                          # full audition, all engines
    uv run audition --engines edge-tts       # one engine only
    uv run audition --locale en-GB           # narrow the voice list
    uv run audition --shortlist              # replay passed voices head-to-head
    uv run audition --cast                   # assign host/guest/ancillary roles
    uv run audition --text "Custom script"   # override the canned sentence
"""

from __future__ import annotations

import argparse

from .audition import run_audition, run_casting, run_shortlist
from .helpers import ENGINES


def main() -> None:
    parser = argparse.ArgumentParser(prog="audition", description="TTS voice audition tool")
    parser.add_argument(
        "--engines",
        default=",".join(ENGINES),
        help=f"Comma-separated engines (default: {','.join(ENGINES)})",
    )
    parser.add_argument("--locale", default="en", help="Locale prefix filter (default: en)")
    parser.add_argument("--text", default=None, help="Override the canned audition script")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--shortlist", action="store_true", help="Re-judge previously passed voices")
    mode.add_argument("--cast", action="store_true", help="Assign roles to passed voices")
    args = parser.parse_args()

    engines = [e.strip() for e in args.engines.split(",") if e.strip()]

    if args.cast:
        run_casting()
    elif args.shortlist:
        run_shortlist(engines, args.text)
    else:
        run_audition(engines, args.locale, args.text)


if __name__ == "__main__":
    main()
