#!/usr/bin/env bash
# Contract re-injection — UserPromptSubmit hook (issue #33).
#
# Re-injects a GENERATED digest of the durable contracts on every turn, and escalates to
# the changed text when one of them changes mid-session. The failure it exists to remove:
# on 2026-07-26 a PM session spent half an hour citing an AGENTS.md that had been
# rewritten thirty minutes earlier, in that same session, by a PR the session had itself
# verified. AGENTS.md forbids exactly that in two clauses, and neither had a mechanism
# behind it.
#
# THIS FILE'S ONE JOB IS TO FAIL OPEN.
#
# A UserPromptSubmit hook runs before every prompt in this repository. If it errors,
# hangs, or emits garbage, it degrades every turn of every session here. So: any error,
# any missing interpreter, any unexpected output — exit 0 and inject nothing. This script
# never exits non-zero, and in particular never exits 2, which per the Claude Code hook
# contract would BLOCK the prompt and erase it.
#
#   Event:   UserPromptSubmit — fires when a prompt is submitted, before Claude
#            processes it. It takes no matcher; it always fires.
#   Output:  {"hookSpecificOutput": {"hookEventName": "UserPromptSubmit",
#                                    "additionalContext": "..."}}
#   Source:  https://code.claude.com/docs/en/hooks — verified 2026-07-27, per the
#            acceptance criterion in #33 that the event be confirmed against current
#            documentation rather than assumed. Naming an event that does not exist
#            yields a hook that silently never fires.
#
# What it does NOT do: it cannot make an agent read what it injects. It removes the
# excuse, not the possibility. Calling it a fix for stale-contract citation would be the
# artifact-is-not-the-behavior failure it was built in response to.
#
# To disable: delete the "UserPromptSubmit" key from .claude/settings.json. Nothing else
# references this file.

# Deliberately no `set -e` / `set -o pipefail`: a non-zero exit anywhere inside must be
# absorbed, not propagated. `set -u` is safe and catches typos in this script itself.
set -u

# Drain stdin unconditionally, so an early exit never leaves the caller writing into a
# closed pipe.
payload="$(cat 2>/dev/null)" || exit 0

command -v python3 >/dev/null 2>&1 || exit 0

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" || exit 0
digest="${here}/contract_digest.py"
[ -r "$digest" ] || exit 0

output="$(printf '%s' "$payload" | python3 "$digest" 2>/dev/null)" || exit 0

# Emit only well-formed JSON. Anything else is treated as a failure and swallowed: a
# malformed hook response is worse than no hook response.
if [ -n "$output" ] && printf '%s' "$output" | python3 -c 'import json,sys; json.load(sys.stdin)' 2>/dev/null; then
  printf '%s' "$output"
fi

exit 0
