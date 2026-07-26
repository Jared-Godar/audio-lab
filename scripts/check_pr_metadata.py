#!/usr/bin/env python3
"""Check a pull request's metadata against audio-lab's rules (issue #21, Gap 9).

Enforced:
  - at least one `type:` label and at least one `area:` label;
  - every label on the PR is declared in .github/labels.json (no ad-hoc labels);
  - at least one assignee.

Deliberately NOT enforced, and why (an adaptation of the reference gates, not an
omission): a milestone is not required, because governance PRs here are
legitimately unmilestoned; and a `Closes #N` link is not required, because
Refs-only governance PRs are valid (PR #24 was one). The same-PR CHANGELOG rule
is already enforced by changelog.yml and is not duplicated here.

Exit codes: 0 pass, 1 metadata violation, 2 a gh CLI failure.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / ".github" / "labels.json"


def declared_label_names() -> set[str]:
    """Return the set of label names declared in the manifest."""
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    return {item["name"] for item in data["labels"]}


def pr_metadata(pr_number: str, repo: str | None) -> dict:
    """Fetch the PR's labels and assignees via gh."""
    args = ["gh", "pr", "view", pr_number, "--json", "labels,assignees"]
    if repo:
        args += ["--repo", repo]
    result = subprocess.run(args, check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def main(argv: list[str] | None = None) -> int:
    """Validate PR metadata; return a process exit code."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pr-number", required=True)
    parser.add_argument("--repo", help="OWNER/REPO; defaults to the current repository")
    args = parser.parse_args(argv)

    try:
        data = pr_metadata(args.pr_number, args.repo)
    except subprocess.CalledProcessError as error:
        print(f"gh CLI failed: {error}", file=sys.stderr)
        return 2

    labels = [label["name"] for label in data.get("labels", [])]
    assignees = [a["login"] for a in data.get("assignees", [])]
    declared = declared_label_names()

    problems: list[str] = []
    if not any(name.startswith("type:") for name in labels):
        problems.append("no `type:` label (add at least one from .github/labels.json)")
    if not any(name.startswith("area:") for name in labels):
        problems.append("no `area:` label (add at least one from .github/labels.json)")
    undeclared = sorted(set(labels) - declared)
    if undeclared:
        problems.append(f"labels not declared in labels.json: {', '.join(undeclared)}")
    if not assignees:
        problems.append("no assignee (set one, e.g. Jared-Godar)")

    if problems:
        print("PR metadata check failed:", file=sys.stderr)
        for problem in problems:
            print(f"  - {problem}", file=sys.stderr)
        return 1

    print(f"PR metadata OK: labels={labels} assignees={assignees}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
