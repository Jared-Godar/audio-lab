#!/usr/bin/env python3
"""Sync repository labels from .github/labels.json and detect drift.

Subcommands:
  sync   Create or update every label declared in labels.json via
         `gh label create --force` (idempotent). ADDITIVE: it never deletes a
         live label.
  check  Compare the declared label-name set against the live set and exit
         non-zero if they differ. Read-only; the label-drift gate runs this.

The sync is deliberately additive: audio-lab retains GitHub's stock labels by
maintainer decision (issue #21), so a delete-authoritative sync would strip
them. A live label absent from labels.json is reported as drift, never removed
-- remediation is a human decision.

Exit codes: 0 success / no drift, 1 drift detected, 2 a gh CLI failure.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

# Resolve paths from this file's location, not the cwd, so it runs the same
# from anywhere.
ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / ".github" / "labels.json"


def load_declared(path: Path) -> list[dict[str, str]]:
    """Load and validate the declared labels from the manifest."""
    data = json.loads(path.read_text(encoding="utf-8"))
    labels = data.get("labels")
    if not isinstance(labels, list):
        raise ValueError("labels.json must contain a 'labels' array")
    out: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in labels:
        name = item.get("name") if isinstance(item, dict) else None
        color = item.get("color") if isinstance(item, dict) else None
        desc = item.get("description", "") if isinstance(item, dict) else ""
        if not name or not color:
            raise ValueError(f"each label needs a name and color: {item!r}")
        if name in seen:
            raise ValueError(f"duplicate label in manifest: {name}")
        seen.add(name)
        out.append({"name": name, "color": color, "description": desc})
    return out


def live_label_names(repo: str | None) -> set[str]:
    """Return the set of label names currently live on the repository."""
    args = ["gh", "label", "list", "--limit", "200", "--json", "name"]
    if repo:
        args += ["--repo", repo]
    result = subprocess.run(args, check=True, capture_output=True, text=True)
    return {row["name"] for row in json.loads(result.stdout)}


def cmd_sync(declared: list[dict[str, str]], repo: str | None, dry_run: bool) -> int:
    """Create or update each declared label. Additive: never deletes."""
    for label in declared:
        args = [
            "gh",
            "label",
            "create",
            label["name"],
            "--color",
            label["color"],
            "--description",
            label["description"],
            "--force",
        ]
        if repo:
            args += ["--repo", repo]
        if dry_run:
            print(" ".join(args))
            continue
        subprocess.run(args, check=True)
    if not dry_run:
        print(f"Synced {len(declared)} labels (additive; nothing deleted).")
    return 0


def cmd_check(declared: list[dict[str, str]], repo: str | None) -> int:
    """Compare declared vs live label names; exit 1 on any drift."""
    declared_names = {label["name"] for label in declared}
    live_names = live_label_names(repo)
    missing = sorted(declared_names - live_names)  # declared but not live
    extra = sorted(live_names - declared_names)  # live but not declared
    if not missing and not extra:
        print(
            f"No label drift: {len(declared_names)} declared labels match the live set."
        )
        return 0
    if missing:
        print(
            "Declared in labels.json but MISSING on GitHub (fix: sync):",
            file=sys.stderr,
        )
        for name in missing:
            print(f"  - {name}", file=sys.stderr)
    if extra:
        print(
            "Live on GitHub but NOT declared in labels.json "
            "(drift; not auto-deleted -- reconcile by hand):",
            file=sys.stderr,
        )
        for name in extra:
            print(f"  - {name}", file=sys.stderr)
    print(
        "\nLabel drift detected. Reconcile labels.json and the live set.",
        file=sys.stderr,
    )
    return 1


def main(argv: list[str] | None = None) -> int:
    """Parse arguments and dispatch the requested subcommand."""
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("command", choices=["sync", "check"])
    parser.add_argument("--repo", help="OWNER/REPO; defaults to the current repository")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="sync only: print the gh commands without changing labels",
    )
    args = parser.parse_args(argv)
    declared = load_declared(MANIFEST)
    try:
        if args.command == "sync":
            return cmd_sync(declared, args.repo, args.dry_run)
        return cmd_check(declared, args.repo)
    except subprocess.CalledProcessError as error:
        print(f"gh CLI failed: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
