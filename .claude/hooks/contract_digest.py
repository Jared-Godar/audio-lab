#!/usr/bin/env python3
"""Generate the per-turn durable-contract digest injected by the UserPromptSubmit hook.

Issue #33: sessions read the durable contracts once at session start and then run on
recall for hours. On 2026-07-26 a PM session quoted an ``AGENTS.md`` that had been
rewritten thirty minutes earlier, in the same session, by a PR that session had itself
verified. ``AGENTS.md`` already forbids this in two clauses; neither had anything behind
it.

What this does, and what it deliberately does not do:

* Every turn it emits a **generated** digest — the contract files' section headings and
  their SHAs, computed from the files at hook time. Nothing here is hand-maintained.
  A hand-written digest is one more artifact that can lie, which is the defect #33
  exists to remove.
* When a SHA differs from what this session last saw, it says so explicitly and
  escalates: the changed sections' full text, bounded, plus an unmistakable instruction
  to re-read the file before citing it. **Change is what should be salient, not
  volume** — #33 § 7 names injection fatigue as the second risk.
* It cannot make an agent *use* what is injected. It removes the excuse, not the
  possibility. Described any other way it becomes the thing ``AGENTS.md`` § "The
  artifact is not the behavior" warns about.

Invoked by ``contract-reinjection.sh``, which guarantees the fail-open contract: any
error, missing file or unexpected state exits 0 and injects nothing. A hook that errors
or hangs degrades every prompt in this repository, so it must never be the reason a
prompt fails.

Prints one JSON object on stdout, or nothing at all.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
import time
from pathlib import Path

# Escalation budgets, in bytes of injected text. A changed file smaller than the
# per-file budget is injected whole; anything larger degrades to its changed sections,
# truncated at the total budget. AGENTS.md alone is ~26 KB, so "changed sections" is the
# normal escalation path here, not the exception.
FULL_TEXT_BUDGET = 8_000
TOTAL_ESCALATION_BUDGET = 16_000

# Session state older than this is pruned on the way past. Best-effort; never fatal.
STATE_TTL_SECONDS = 7 * 24 * 60 * 60

SHA_LEN = 12


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", "replace")).hexdigest()[:SHA_LEN]


def split_sections(text: str) -> list[tuple[str, str]]:
    """Split on ``## `` headings, returning (heading, body-including-heading) pairs.

    Everything before the first ``## `` is returned under the ``(preamble)`` heading so
    a change to the file's opening lines is still attributable to something.
    """
    sections: list[tuple[str, list[str]]] = [("(preamble)", [])]
    for line in text.splitlines(keepends=True):
        if line.startswith("## "):
            sections.append((line[3:].strip(), [line]))
        else:
            sections[-1][1].append(line)
    if not sections[0][1]:
        sections.pop(0)
    return [(head, "".join(body)) for head, body in sections]


def describe(path: Path) -> dict | None:
    """Read one contract file into a comparable description, or None if unreadable."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    sections = split_sections(text)
    return {
        "sha": sha(text),
        "bytes": len(text.encode("utf-8")),
        "lines": text.count("\n") + 1,
        "order": [head for head, _ in sections],
        "sections": {head: sha(body) for head, body in sections},
        "bodies": {head: body for head, body in sections},
    }


def state_path(project_dir: Path, session_id: str) -> Path:
    """Per-session state file.

    Named so it explains itself in a directory listing rather than being a bare opaque
    token — ``CLAUDE.md`` § "Generated artifacts must be self-describing". The session id
    is the key, so it stays in the name, but it is not the *whole* name.
    """
    safe = "".join(c if c.isalnum() or c in "-_" else "-" for c in session_id)[:64]
    return (
        project_dir
        / ".claude"
        / "contract-state"
        / f"contract-digest-state-{safe}.json"
    )


def prune_old_state(directory: Path) -> None:
    cutoff = time.time() - STATE_TTL_SECONDS
    try:
        entries = list(directory.glob("contract-digest-state-*.json"))
    except OSError:
        return
    for entry in entries:
        try:
            if entry.stat().st_mtime < cutoff:
                entry.unlink()
        except OSError:
            pass


def render(
    current: dict[str, dict | None], previous: dict, labels: dict[str, str]
) -> str:
    """Build the injected text. Digest always; escalation only on a changed SHA."""
    changed: list[tuple[str, dict, dict]] = []
    lines: list[str] = [
        "DURABLE CONTRACTS — generated at hook time, not hand-maintained (#33).",
        "",
    ]

    for key, desc in current.items():
        label = labels[key]
        if desc is None:
            lines.append(
                f"- `{label}` — **not readable in this environment**; nothing to report on it."
            )
            continue
        prior = previous.get(key)
        marker = ""
        if prior and prior.get("sha") != desc["sha"]:
            marker = "  ⚠️ **CHANGED SINCE THIS SESSION LAST LOOKED**"
            changed.append((label, prior, desc))
        lines.append(
            f"- `{label}` — sha `{desc['sha']}`, {desc['bytes']:,} bytes, "
            f"{desc['lines']} lines, {len(desc['order'])} sections{marker}"
        )
        lines.append("  " + " · ".join(f"§ {head}" for head in desc["order"]))

    if not previous:
        lines += [
            "",
            "First injection of this session. These files are the binding contract; the",
            "headings above are a map, **not** a substitute for the text. Read them before",
            "citing them — a rule you remember is not a rule you have read.",
        ]

    if changed:
        lines += ["", "---", ""]
        budget = TOTAL_ESCALATION_BUDGET
        for label, prior, desc in changed:
            prior_sections = prior.get("sections", {})
            added = [h for h in desc["order"] if h not in prior_sections]
            modified = [
                h
                for h in desc["order"]
                if h in prior_sections and prior_sections[h] != desc["sections"][h]
            ]
            removed = [h for h in prior.get("order", []) if h not in desc["sections"]]

            lines.append(
                f"**`{label}` CHANGED** — sha `{prior.get('sha', '?')}` → `{desc['sha']}`. "
                "Anything you recall about this file may now be wrong."
            )
            if added:
                lines.append("- Sections added: " + ", ".join(f"§ {h}" for h in added))
            if modified:
                lines.append(
                    "- Sections modified: " + ", ".join(f"§ {h}" for h in modified)
                )
            if removed:
                lines.append(
                    "- Sections removed: "
                    + ", ".join(f"§ {h}" for h in removed)
                    + " — **do not cite these; they no longer exist.**"
                )
            if not (added or modified or removed):
                lines.append(
                    "- No section-level change detected; the difference is elsewhere in the file."
                )
            lines.append("")

            whole = "".join(desc["bodies"][h] for h in desc["order"])
            if len(whole) <= FULL_TEXT_BUDGET and len(whole) <= budget:
                payload, truncated = whole, False
            else:
                parts, used, truncated = [], 0, False
                for head in added + modified:
                    body = desc["bodies"].get(head, "")
                    if used + len(body) > budget:
                        truncated = True
                        break
                    parts.append(body)
                    used += len(body)
                payload = "".join(parts)
                if not payload:
                    truncated = True
            budget -= len(payload)

            if payload:
                lines += [
                    f"Full text of what changed in `{label}`:",
                    "",
                    "```markdown",
                    payload.rstrip("\n"),
                    "```",
                    "",
                ]
            if truncated:
                lines.append(
                    f"⚠️ The change to `{label}` exceeds the injection budget "
                    f"({TOTAL_ESCALATION_BUDGET:,} bytes) and is shown only in part. "
                    f"**Read `{label}` in full before citing it.**"
                )
                lines.append("")

        lines.append(
            "This is an escalation, not a summary. Re-read the changed file itself before "
            "quoting, paraphrasing, or acting on any rule it contains."
        )

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else {}
    except (ValueError, TypeError):
        payload = {}
    if not isinstance(payload, dict):
        payload = {}

    project_dir = Path(
        os.environ.get("CLAUDE_PROJECT_DIR")
        or payload.get("cwd")
        or Path(__file__).resolve().parents[2]
    ).resolve()

    home = Path.home()
    labels = {
        "agents": "AGENTS.md",
        "claude": "CLAUDE.md",
        "global": "~/.claude/CLAUDE.md",
    }
    paths = {
        "agents": project_dir / "AGENTS.md",
        "claude": project_dir / "CLAUDE.md",
        "global": home / ".claude" / "CLAUDE.md",
    }

    # AGENTS.md is the repository's binding contract. If it is not readable, this is not
    # the state this hook was written for — say nothing rather than guess.
    current = {key: describe(path) for key, path in paths.items()}
    if current["agents"] is None:
        return 0

    session_id = str(payload.get("session_id") or "unknown-session")
    store = state_path(project_dir, session_id)

    previous: dict = {}
    try:
        previous = json.loads(store.read_text(encoding="utf-8"))
        if not isinstance(previous, dict):
            previous = {}
    except (OSError, ValueError, TypeError):
        # A corrupt or absent state file means "this session has seen nothing yet",
        # which injects the digest without escalating. It never means failing.
        previous = {}

    context = render(current, previous, labels)

    try:
        store.parent.mkdir(parents=True, exist_ok=True)
        prune_old_state(store.parent)
        store.write_text(
            json.dumps(
                {
                    key: {k: v for k, v in desc.items() if k != "bodies"}
                    for key, desc in current.items()
                    if desc is not None
                },
                indent=1,
            ),
            encoding="utf-8",
        )
    except OSError:
        # Unable to persist state: the digest is still worth injecting, the session
        # simply cannot detect a change on the next turn. Degrade, never fail.
        pass

    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": context,
            }
        },
        sys.stdout,
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:  # noqa: BLE001 — fail open: never break a prompt.
        sys.exit(0)
