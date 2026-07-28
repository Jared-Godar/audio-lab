#!/usr/bin/env python3
"""Paired permit/deny matrix for .claude/hooks/pm-lane-guard.sh (#48).

Every deny is paired with a permit that must survive it. A gate only ever seen
saying "no" is unproven, and a guard that blocks the maintainer is worse than one
that is too loose.
"""

import json
import os
import subprocess
import sys


def _repo_root() -> str:
    """Discover the repository root from THIS FILE's location, not the CWD.

    Anchoring on the script's own directory is deliberate and is the whole point:
    the matrix must run green from anywhere (`cd /tmp; python3 .../scripts/...`),
    and a bare `git rev-parse --show-toplevel` resolves against the *caller's*
    directory, so it fails the moment you run this from outside the repo. Do not
    "simplify" this to a cwd-relative call — that reintroduces the defect this
    function exists to fix (audio-lab #68; the file previously hardcoded
    `/Users/<user>/Code/audio-lab` and ran on exactly one machine).
    """
    here = os.path.dirname(os.path.abspath(__file__))
    try:
        proc = subprocess.run(
            ["git", "-C", here, "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            timeout=20,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        sys.exit(f"error: could not run git to locate the repository root: {exc}")
    if proc.returncode != 0:
        sys.exit(
            "error: this script must live inside a git working tree.\n"
            f"       looked upward from: {here}\n"
            f"       git said: {proc.stderr.strip() or 'no such repository'}"
        )
    return proc.stdout.strip()


REPO = _repo_root()
# Overridable so the negative test can point the harness at a deliberately broken
# guard and prove the matrix REJECTS as well as accepts (#68 acceptance criterion).
GUARD = os.environ.get("PM_LANE_GUARD") or f"{REPO}/.claude/hooks/pm-lane-guard.sh"
HOME = os.path.expanduser("~")

# (lane, tool, value, expected, why)
CASES = [
    # ── #48 acceptance criteria, in the order the spec lists them ────────────
    ("PM", "Bash", "printf 'x' > AGENTS.md", "DENY", "AC: PM printf > tracked file"),
    (
        "PM",
        "Bash",
        "printf 'x' > artifacts/x.md",
        "ALLOW",
        "AC: PM write under artifacts/",
    ),
    ("PM", "Write", f"{HOME}/.aws/config", "DENY", "AC: PM Write ~/.aws/config"),
    (
        "EXEC",
        "Write",
        f"{HOME}/.aws/config",
        "DENY",
        "AC: executor Write ~/.aws/config",
    ),
    (
        "PM",
        "Write",
        f"{HOME}/.claude/CLAUDE.md",
        "ALLOW",
        "AC: PM Write ~/.claude/ still allowed",
    ),
    ("EXEC", "Bash", "git commit -m 'x'", "ALLOW", "AC: executor git commit"),
    ("PM", "Bash", "git log --oneline -5", "ALLOW", "AC: PM read-only git"),
    ("PM", "Bash", "gh pr view 49 --json state", "ALLOW", "AC: PM read-only gh"),
    (
        "PM",
        "Bash",
        "gh issue create --title x --body y",
        "ALLOW",
        "AC: PM gh issue create",
    ),
    # ── credential gate, remaining paths, both lanes ─────────────────────────
    ("PM", "Write", f"{HOME}/.ssh/id_ed25519", "DENY", "credential: ~/.ssh"),
    ("EXEC", "Write", f"{HOME}/.ssh/config", "DENY", "credential: ~/.ssh, executor"),
    ("PM", "Edit", f"{HOME}/.gnupg/gpg.conf", "DENY", "credential: ~/.gnupg via Edit"),
    (
        "EXEC",
        "Edit",
        f"{HOME}/.gnupg/gpg.conf",
        "DENY",
        "credential: ~/.gnupg, executor",
    ),
    (
        "EXEC",
        "Write",
        f"{HOME}/.claude/CLAUDE.md",
        "ALLOW",
        "~/.claude stays writable, executor",
    ),
    ("PM", "Write", "/tmp/scratch.md", "ALLOW", "outside repo, not credential"),
    (
        "PM",
        "Bash",
        "aws configure set region us-east-1",
        "ALLOW",
        "aws configure NOT blocked",
    ),
    (
        "PM",
        "Bash",
        "ssh-keygen -t ed25519 -f /tmp/k",
        "ALLOW",
        "ssh-keygen NOT blocked",
    ),
    # ── hole 1: in-repo writes via the shell, each verb the spec names ───────
    ("PM", "Bash", "printf 'x' >> CHANGELOG.md", "DENY", "append redirect"),
    ("PM", "Bash", "echo x | tee AGENTS.md", "DENY", "tee"),
    ("PM", "Bash", "sed -i '' 's/a/b/' AGENTS.md", "DENY", "sed -i"),
    ("PM", "Bash", "cp /tmp/x AGENTS.md", "DENY", "cp destination"),
    (
        "PM",
        "Bash",
        "mv /tmp/x .claude/hooks/pm-lane-guard.sh",
        "DENY",
        "mv destination",
    ),
    ("PM", "Bash", "dd if=/dev/zero of=AGENTS.md", "DENY", "dd of="),
    ("PM", "Bash", "truncate -s 0 AGENTS.md", "DENY", "truncate"),
    ("PM", "Bash", f"printf 'x' > {REPO}/AGENTS.md", "DENY", "absolute in-repo path"),
    ("PM", "Bash", "printf 'x' > ./docs/elevenlabs.md", "DENY", "./-prefixed path"),
    ("PM", "Bash", "cat a.md b.md > pipeline/core/x.py", "DENY", "nested in-repo path"),
    # ── the permits those denies must not have broken ────────────────────────
    (
        "PM",
        "Bash",
        "printf 'x' > artifacts/specs/draft.md",
        "ALLOW",
        "artifacts/specs/",
    ),
    ("PM", "Bash", "echo x | tee artifacts/note.md", "ALLOW", "tee into artifacts/"),
    (
        "PM",
        "Bash",
        "cp AGENTS.md /tmp/backup.md",
        "ALLOW",
        "read-side cp OUT of the repo",
    ),
    ("PM", "Bash", "mv artifacts/a.md artifacts/b.md", "ALLOW", "mv within artifacts/"),
    ("PM", "Bash", "git diff > /tmp/d.diff", "ALLOW", "redirect outside the repo"),
    (
        "PM",
        "Bash",
        "git status --short > artifacts/status.txt",
        "ALLOW",
        "redirect into artifacts/",
    ),
    ("PM", "Bash", "sed -n '1,5p' AGENTS.md", "ALLOW", "sed WITHOUT -i is read-only"),
    (
        "PM",
        "Bash",
        "sed -n '1,5p' release-info.txt",
        "ALLOW",
        "'-i' as substring must not trip",
    ),
    ("PM", "Bash", "ls -la 2>&1", "ALLOW", "fd duplication is not a path"),
    ("PM", "Bash", "uv run pytest > /dev/null", "ALLOW", "/dev/null"),
    ("PM", "Bash", "truncate -s 0 /tmp/log", "ALLOW", "truncate outside the repo"),
    (
        "PM",
        "Bash",
        "grep -rn 'printf x > AGENTS.md' docs/",
        "ALLOW",
        "quoted span must not trip",
    ),
    (
        "PM",
        "Bash",
        'gh issue comment 33 --body "run: echo x > AGENTS.md"',
        "ALLOW",
        "an issue body naming a redirect must not trip",
    ),
    # ── #35 regressions: the verb matcher must still behave ──────────────────
    ("PM", "Bash", "git commit -m 'x'", "DENY", "regression: PM git commit"),
    ("PM", "Bash", "git push origin main", "DENY", "regression: PM git push"),
    ("PM", "Bash", "gh pr create --title x", "DENY", "regression: PM gh pr create"),
    (
        "PM",
        "Bash",
        "gh api repos/x/y/git/refs/z --method DELETE",
        "DENY",
        "regression: long --method",
    ),
    (
        "PM",
        "Bash",
        "git merge-base main HEAD",
        "ALLOW",
        "regression: merge-base stays read-only",
    ),
    ("PM", "Bash", "gh label list", "ALLOW", "regression: PM label read"),
    # ── executor is unaffected by the lane, apart from credentials ───────────
    ("EXEC", "Bash", "printf 'x' > AGENTS.md", "ALLOW", "executor may write in-repo"),
    ("EXEC", "Bash", "gh pr create --title x", "ALLOW", "executor may open PRs"),
    ("EXEC", "Write", f"{REPO}/AGENTS.md", "ALLOW", "executor Write in-repo"),
    ("PM", "Write", f"{REPO}/AGENTS.md", "DENY", "PM Write in-repo (unchanged)"),
    (
        "PM",
        "Write",
        f"{REPO}/artifacts/specs/x.md",
        "ALLOW",
        "PM Write under artifacts/",
    ),
]


def run(lane: str, tool: str, value: str) -> tuple[str, str]:
    payload = {"tool_name": tool, "cwd": REPO}
    payload["tool_input"] = (
        {"command": value} if tool == "Bash" else {"file_path": value}
    )
    env = dict(os.environ, CLAUDE_PROJECT_DIR=REPO)
    if lane == "EXEC":
        env["AUDIO_LAB_EXECUTOR"] = "1"
    else:
        env.pop("AUDIO_LAB_EXECUTOR", None)
    proc = subprocess.run(
        ["bash", GUARD],
        input=json.dumps(payload),
        env=env,
        capture_output=True,
        text=True,
        timeout=20,
    )
    if proc.returncode != 0:
        return "ERROR", f"exit={proc.returncode} {proc.stderr.strip()[:200]}"
    out = proc.stdout.strip()
    if not out:
        return "ALLOW", ""
    try:
        decision = json.loads(out)["hookSpecificOutput"]["permissionDecision"]
    except (ValueError, KeyError):
        return "ERROR", f"unparseable: {out[:200]}"
    return ("DENY" if decision == "deny" else "ALLOW"), ""


def main() -> int:
    failures = 0
    width = max(len(c[2]) for c in CASES)
    print(
        f"{'LANE':<5} {'TOOL':<6} {'ARGUMENT':<{width}}  {'WANT':<5} {'GOT':<5} RESULT  WHY"
    )
    print("-" * (width + 62))
    for lane, tool, value, expected, why in CASES:
        got, detail = run(lane, tool, value)
        ok = got == expected
        failures += not ok
        mark = "ok" if ok else "** FAIL **"
        print(
            f"{lane:<5} {tool:<6} {value:<{width}}  {expected:<5} {got:<5} {mark:<7} {why}{detail}"
        )
    print("-" * (width + 62))
    print(f"{len(CASES)} cases, {len(CASES) - failures} passed, {failures} failed")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
