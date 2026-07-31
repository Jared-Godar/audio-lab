#!/usr/bin/env python3
"""Project #8 lifecycle automation (issues #115, #121).

Two subcommands, one per workflow trigger:

  add-issue --issue N        (#115) add a newly-opened issue to Project #8 and
                             set its Status to "Todo".
  pr-in-progress --pr N      (#121) for each issue a PR closes, set that issue's
                             Project #8 Status to "In Progress".

Stdlib + the `gh` CLI only, matching scripts/check_pr_metadata.py (no uv env).
`gh` authenticates from GH_TOKEN in CI, or the caller's stored auth locally.

Token reality (see the workflow header): setting a field on a USER-owned
Project v2 needs a token with `project` scope. Actions' default GITHUB_TOKEN
does NOT have it, so the workflow passes a PROJECT_AUTOMATION_TOKEN secret. Until
that secret exists this script **no-ops gracefully** (prints why, exits 0) rather
than failing — the workflow is advisory and must never be a red X. --dry-run
prints the mutations it would run without executing them and without needing the
token (reads still use ambient `gh` auth), which is how the behavior is validated
before the secret is minted.

Project #8 live IDs (queried 2026-07-31 via `gh project field-list 8`):
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys

PROJECT_ID = "PVT_kwHOAQEwMM4BehsR"
STATUS_FIELD_ID = "PVTSSF_lAHOAQEwMM4BehsRzhY7Mmw"
STATUS_TODO = "f75ad846"
STATUS_IN_PROGRESS = "47fc9ee4"


def _gh_graphql(query: str, variables: dict[str, str]) -> dict:
    """Run a GraphQL query/mutation through `gh api graphql`. Raises on failure."""
    cmd = ["gh", "api", "graphql", "-f", f"query={query}"]
    for key, value in variables.items():
        # -F does type inference (numbers/booleans); -f forces string. Node IDs
        # and option IDs must stay strings, so use -f for everything here.
        cmd += ["-f", f"{key}={value}"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"gh api graphql failed: {result.stderr.strip()}")
    return json.loads(result.stdout)


def _repo_owner_name() -> tuple[str, str]:
    repo = os.environ.get("GH_REPO") or ""
    if "/" not in repo:
        raise RuntimeError("GH_REPO must be set to 'owner/name'")
    owner, name = repo.split("/", 1)
    return owner, name


def _add_to_project(content_id: str, *, dry_run: bool) -> str | None:
    """addProjectV2ItemById is idempotent — returns the existing item if the
    content is already on the board. Returns the item id (or None in dry-run)."""
    mutation = (
        "mutation($project:ID!,$content:ID!){addProjectV2ItemById("
        "input:{projectId:$project,contentId:$content}){item{id}}}"
    )
    if dry_run:
        print(
            f"  [dry-run] addProjectV2ItemById(project={PROJECT_ID}, content={content_id})"
        )
        return None
    data = _gh_graphql(mutation, {"project": PROJECT_ID, "content": content_id})
    return data["data"]["addProjectV2ItemById"]["item"]["id"]


def _set_status(item_id: str | None, option_id: str, *, dry_run: bool) -> None:
    mutation = (
        "mutation($project:ID!,$item:ID!,$field:ID!,$opt:String!){"
        "updateProjectV2ItemFieldValue(input:{projectId:$project,itemId:$item,"
        "fieldId:$field,value:{singleSelectOptionId:$opt}}){projectV2Item{id}}}"
    )
    label = "Todo" if option_id == STATUS_TODO else "In Progress"
    if dry_run or item_id is None:
        print(
            f"  [dry-run] set Status={label} (field={STATUS_FIELD_ID}, opt={option_id})"
        )
        return
    _gh_graphql(
        mutation,
        {
            "project": PROJECT_ID,
            "item": item_id,
            "field": STATUS_FIELD_ID,
            "opt": option_id,
        },
    )
    print(f"  set Status={label}")


def _issue_node_id(number: str) -> str:
    owner, name = _repo_owner_name()
    query = "query($owner:String!,$name:String!,$n:Int!){repository(owner:$owner,name:$name){issue(number:$n){id}}}"
    cmd = [
        "gh",
        "api",
        "graphql",
        "-f",
        f"query={query}",
        "-f",
        f"owner={owner}",
        "-f",
        f"name={name}",
        "-F",
        f"n={number}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"issue lookup failed: {result.stderr.strip()}")
    node = json.loads(result.stdout)["data"]["repository"]["issue"]
    if node is None:
        raise RuntimeError(f"issue #{number} not found")
    return node["id"]


def _pr_closing_issue_ids(number: str) -> list[dict]:
    owner, name = _repo_owner_name()
    query = (
        "query($owner:String!,$name:String!,$n:Int!){repository(owner:$owner,name:$name)"
        "{pullRequest(number:$n){closingIssuesReferences(first:20){nodes{id number}}}}}"
    )
    cmd = [
        "gh",
        "api",
        "graphql",
        "-f",
        f"query={query}",
        "-f",
        f"owner={owner}",
        "-f",
        f"name={name}",
        "-F",
        f"n={number}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"PR lookup failed: {result.stderr.strip()}")
    pr = json.loads(result.stdout)["data"]["repository"]["pullRequest"]
    return pr["closingIssuesReferences"]["nodes"] if pr else []


def _token_present_or_noop(dry_run: bool) -> bool:
    """In CI, GH_TOKEN is the project secret. If it's absent (secret not yet
    minted, or a fork PR that GitHub withholds secrets from), no-op gracefully.
    --dry-run bypasses the guard because it makes no mutation and reads use
    ambient local auth."""
    if dry_run:
        return True
    if not os.environ.get("GH_TOKEN"):
        print(
            "PROJECT_AUTOMATION_TOKEN not set — skipping (advisory no-op). "
            "See .github/workflows/project-automation.yml for the one-time token setup."
        )
        return False
    return True


def cmd_add_issue(args: argparse.Namespace) -> int:
    if not _token_present_or_noop(args.dry_run):
        return 0
    content_id = _issue_node_id(args.issue)
    print(f"Add issue #{args.issue} to Project #8, Status=Todo")
    item_id = _add_to_project(content_id, dry_run=args.dry_run)
    _set_status(item_id, STATUS_TODO, dry_run=args.dry_run)
    return 0


def cmd_pr_in_progress(args: argparse.Namespace) -> int:
    if not _token_present_or_noop(args.dry_run):
        return 0
    issues = _pr_closing_issue_ids(args.pr)
    if not issues:
        print(f"PR #{args.pr} closes no issue — no-op.")
        return 0
    for issue in issues:
        print(f"Linked issue #{issue['number']} → In Progress")
        item_id = _add_to_project(issue["id"], dry_run=args.dry_run)  # ensure on board
        _set_status(item_id, STATUS_IN_PROGRESS, dry_run=args.dry_run)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Project #8 lifecycle automation")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="print mutations without executing; skips the token guard",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    p_add = sub.add_parser(
        "add-issue", help="#115: add issue to Project #8, Status=Todo"
    )
    p_add.add_argument("--issue", required=True)
    p_add.set_defaults(func=cmd_add_issue)
    p_pr = sub.add_parser("pr-in-progress", help="#121: linked issues → In Progress")
    p_pr.add_argument("--pr", required=True)
    p_pr.set_defaults(func=cmd_pr_in_progress)
    args = parser.parse_args()
    try:
        return args.func(args)
    except RuntimeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
