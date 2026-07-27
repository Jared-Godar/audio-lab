#!/usr/bin/env bash
# PM-lane guard — PreToolUse hook.
#
# Enforces the PM/executor split from CLAUDE.md as a MECHANISM rather than a rule
# an agent has to remember. A rule with no gate behind it is a hope.
#
# The lane, made structural instead of mode-detected:
#   PM sessions       may write ONLY under artifacts/ (gitignored scratch).
#                     Issue and label operations ARE allowed: writing issues is
#                     the PM's job here, as it is in every other project. Git
#                     mutations, PR create/merge, repo edits and `gh api -X`
#                     remain executor-only.
#   Executor sessions set AUDIO_LAB_EXECUTOR=1 and may do everything.
#
# A hook cannot tell a PM chat from an executor CLI by inspection, so the executor
# declares itself with an environment variable. That makes the boundary explicit and
# auditable: if the variable is absent, the session is PM by definition.
#
# Launch an executor with:
#     env AUDIO_LAB_EXECUTOR=1 claude
#
# Reads the PreToolUse payload on stdin; prints a deny decision or stays silent.
set -euo pipefail

payload="$(cat)"
tool="$(printf '%s' "$payload" | jq -r '.tool_name // ""')"

# Executor sessions are unrestricted.
if [ "${AUDIO_LAB_EXECUTOR:-}" = "1" ]; then
  exit 0
fi

deny() {
  # jq -Rs safely JSON-encodes the reason, including quotes and newlines.
  printf '%s' "$1" | jq -Rs '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: .
    }
  }'
  exit 0
}

case "$tool" in
  Write|Edit|NotebookEdit)
    path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // ""')"
    repo="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
    case "$path" in
      # PM scratch inside the repo — always allowed.
      "$repo"/artifacts/*|artifacts/*) exit 0 ;;
      "") exit 0 ;;
      # Outside the repo is not this guard's business. Governing the maintainer's
      # global files caused a deadlock: PM could not persist a standing rule in the
      # same turn it was made, as the global contract requires.
      "$repo"/*)
        deny "BLOCKED by the PM-lane guard (.claude/hooks/pm-lane-guard.sh).

This session is running as PM: it may write only under artifacts/.
Editing tracked files is executor work.

Path refused: ${path}

Do this instead: write the spec to artifacts/specs/<dated-slug>.md and hand it to a
CLI executor. The executor copies it into prompts/ and does the implementation.

If this IS the executor session, it was launched without its flag. Relaunch with:
    env AUDIO_LAB_EXECUTOR=1 claude"
        ;;
      *) exit 0 ;;
    esac
    ;;

  Bash)
    cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')"
    # Match the command VERBS, not the raw line. Quoted arguments — a grep
    # search pattern, an issue body that happens to name commands — must not
    # trip the guard, so strip single- and double-quoted spans before matching.
    # A verb that is quoted cannot actually execute as a verb, so stripping
    # never hides a real mutation. (KNOWN HOLE, stated plainly: a deliberate
    # `bash -c "git push"` wrapper evades this, exactly like the printf/tee
    # in-repo write hole documented in CLAUDE.md. The guard is a lane marker
    # against accidental PM freelancing, not a sandbox against a determined
    # bypass.)
    verbs="$(printf '%s' "$cmd" | sed "s/'[^']*'//g; s/\"[^\"]*\"//g")"
    # Mutating verbs only. Read-only git/gh (log, diff, status, view, checks,
    # ls-remote, list, and the merge-base/merge-tree/merge-file family) stays
    # available to PM — verification is the PM's job. Two fixes over the naive
    # matcher (issue #35):
    #   * Each simple verb is anchored on a trailing word boundary
    #     ([[:space:]]|$), so `merge` matches `git merge` but NOT the read-only
    #     `git merge-base`.
    #   * The gh api clause matches BOTH the short `-X` and the long `--method`
    #     flag (and `=`-joined values), so a ref-deleting DELETE cannot slip
    #     through the long form.
    if printf '%s' "$verbs" | grep -Eq \
      '(^|[;&|[:space:]])(git[[:space:]]+((commit|push|merge|rebase|reset|revert|cherry-pick|tag)([[:space:]]|$)|(branch[[:space:]]+-[dD]|switch[[:space:]]+-c|checkout[[:space:]]+-b))|gh[[:space:]]+(pr[[:space:]]+(create|merge|edit|close|ready)|release[[:space:]]+(create|edit|delete)|repo[[:space:]]+(create|edit|delete)|api[[:space:]]+.*(-X|--method)[[:space:]=]*(POST|PUT|PATCH|DELETE)))'; then
      deny "BLOCKED by the PM-lane guard (.claude/hooks/pm-lane-guard.sh).

This session is running as PM: it decides, documents, verifies and gates.
It does not mutate repository or GitHub state.

Command refused:
    ${cmd}

Issues and labels are yours (gh issue/label create|edit). Read-only git and gh remain available — log, diff, status, pr view, pr checks,
issue view, ls-remote — because verifying the executor's work is the PM's job.

Do this instead: write the spec to artifacts/specs/<dated-slug>.md and hand it to a
CLI executor.

If this IS the executor session, it was launched without its flag. Relaunch with:
    env AUDIO_LAB_EXECUTOR=1 claude"
    fi
    ;;
esac

exit 0
