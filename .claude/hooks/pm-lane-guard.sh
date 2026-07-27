#!/usr/bin/env bash
# PM-lane guard — PreToolUse hook.
#
# Enforces the PM/executor split from CLAUDE.md as a MECHANISM rather than a rule
# an agent has to remember. A rule with no gate behind it is a hope.
#
# The lane, made structural instead of mode-detected:
#   PM sessions       may write ONLY under artifacts/ — by the Write/Edit tools AND
#                     by shelling out. Issue and label operations ARE allowed: writing
#                     issues is the PM's job here, as it is in every other project.
#                     Git mutations, PR create/merge, repo edits and `gh api -X` remain
#                     executor-only.
#   Executor sessions set AUDIO_LAB_EXECUTOR=1 and may do everything EXCEPT write
#                     credential files (see below) — that one rule binds every session.
#
# A hook cannot tell a PM chat from an executor CLI by inspection, so the executor
# declares itself with an environment variable. That makes the boundary explicit and
# auditable: if the variable is absent, the session is PM by definition.
#
# Launch an executor with:
#     env AUDIO_LAB_EXECUTOR=1 claude
#
# ─────────────────────────────────────────────────────────────────────────────
# THIS IS A LANE MARKER, NOT A SANDBOX. What remains open, stated plainly (#48):
#
#   * `bash -c "printf x > AGENTS.md"` — the wrapper hides the redirect from the
#     matcher, which only ever sees the outer command line.
#   * A script file: `./do-it.sh`, `fish script.fish`, `make target`. The guard reads
#     one command line; it does not read what that command line executes.
#   * Any interpreter: `python3 -c "open('AGENTS.md','w')"`, `perl -e`, `ruby -e`,
#     `node -e`, `awk` with a redirect, `uv run` a script, an editor.
#   * Anything that reaches the filesystem through a tool this hook does not match.
#
# None of these are closed here, and no reachable amount of pattern-matching would
# close them — a determined bypass always wins against a command-line matcher. What
# this raises is the bar from "trivially bypassed by the obvious method" to "requires
# deliberate circumvention", which is what a lane marker is for. Anyone reading this
# file should conclude it constrains accident and convenience, NOT an adversary.
#
# The single exception is the credential gate below, which binds executors too — not
# because it cannot be bypassed the same ways, but because no agent-authored workflow
# in this repository has any reason to write those paths at all.
# ─────────────────────────────────────────────────────────────────────────────
#
# Reads the PreToolUse payload on stdin; prints a deny decision or stays silent.
set -euo pipefail

payload="$(cat)"
tool="$(printf '%s' "$payload" | jq -r '.tool_name // ""')"

repo="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

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

# ── Credential gate — EVERY session, PM and executor alike ───────────────────
# Deliberately placed BEFORE the executor early-exit. `~/.claude/` stays writable:
# the global contract requires a PM session to persist a standing rule in the same
# turn it is made, and governing that caused a deadlock once already.
#
# `aws configure`, `ssh-keygen` and `gpg` are unaffected — they are Bash commands
# managing their own config, and this clause matches file-writing TOOLS only.
case "$tool" in
  Write|Edit|NotebookEdit)
    cred_path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // ""')"
    # shellcheck disable=SC2088 # The quoted-tilde patterns are LITERAL on purpose:
    # the expanded "$HOME"/… patterns above cover the normal case, and these catch a
    # caller that passes an unexpanded "~/.aws/config" string. Letting the tilde
    # expand here would make them duplicates of the first six and reopen that path.
    case "$cred_path" in
      "$HOME"/.aws|"$HOME"/.aws/*|"$HOME"/.ssh|"$HOME"/.ssh/*|"$HOME"/.gnupg|"$HOME"/.gnupg/*|\
      '~/.aws'|'~/.aws/'*|'~/.ssh'|'~/.ssh/'*|'~/.gnupg'|'~/.gnupg/'*)
        deny "BLOCKED by the PM-lane guard (.claude/hooks/pm-lane-guard.sh).

Credential paths are not writable by ANY session — PM or executor. This is the one
rule in this guard that the AUDIO_LAB_EXECUTOR=1 flag does not lift.

Path refused: ${cred_path}

No agent-authored workflow in this repository needs to write ~/.aws, ~/.ssh or
~/.gnupg. The tools that own those files manage them themselves:
    aws configure          (writes ~/.aws/config and ~/.aws/credentials)
    ssh-keygen             (writes ~/.ssh)
    gpg --full-generate-key (writes ~/.gnupg)
None of those are blocked — they are Bash commands, and this clause matches
file-writing tools only.

~/.claude/ is deliberately still writable, so a standing rule can be persisted in
the same turn it is agreed.

If you genuinely need this, that is a conversation with the maintainer, not a
workaround to find."
        ;;
    esac
    ;;
esac

# Executor sessions are unrestricted from here on.
if [ "${AUDIO_LAB_EXECUTOR:-}" = "1" ]; then
  exit 0
fi

# ── Shared deny text for an in-repo write attempt by a PM session ────────────
in_repo_write_denial() {
  printf '%s' "BLOCKED by the PM-lane guard (.claude/hooks/pm-lane-guard.sh).

This session is running as PM: it may write only under artifacts/.
Editing tracked files is executor work.

$1

Do this instead: write the spec to artifacts/specs/<dated-slug>.md and hand it to a
CLI executor. The executor copies it into prompts/ and does the implementation.

If this IS the executor session, it was launched without its flag. Relaunch with:
    env AUDIO_LAB_EXECUTOR=1 claude"
}

case "$tool" in
  Write|Edit|NotebookEdit)
    path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // ""')"
    case "$path" in
      # PM scratch inside the repo — always allowed.
      "$repo"/artifacts/*|artifacts/*) exit 0 ;;
      "") exit 0 ;;
      # Outside the repo is not this guard's business, apart from the credential
      # gate above. Governing the maintainer's global files caused a deadlock: PM
      # could not persist a standing rule in the same turn it was made, as the
      # global contract requires.
      "$repo"/*)
        deny "$(in_repo_write_denial "Path refused: ${path}")"
        ;;
      *) exit 0 ;;
    esac
    ;;

  Bash)
    cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')"
    cwd="$(printf '%s' "$payload" | jq -r '.cwd // ""')"
    [ -n "$cwd" ] || cwd="$PWD"

    # Match the command VERBS, not the raw line. Quoted arguments — a grep
    # search pattern, an issue body that happens to name commands — must not
    # trip the guard, so strip single- and double-quoted spans before matching.
    # A verb that is quoted cannot actually execute as a verb, so stripping
    # never hides a real mutation. The same stripped text is reused for the
    # file-write detection below, so a path inside an issue body is equally safe.
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

    # ── In-repo file writes via the shell (#48, hole 1) ──────────────────────
    # The clause above matches git/gh verbs and nothing else, so for a whole
    # session `printf … > AGENTS.md` walked straight past it. Worse: the guard
    # was once NARROWED by using that very hole, which is documented history,
    # not a hypothetical. This closes the obvious methods. It does not — and
    # cannot — close the deliberate ones; see the header.
    #
    # Every candidate is tested against the SAME allow-list as the Write branch:
    # inside the repo and outside artifacts/ is refused, everything else passes.
    # A false deny here is the expensive failure (it taxes the maintainer's own
    # work), so the extraction below is deliberately narrow rather than greedy.
    is_guarded_path() {
      local candidate="$1" abs
      candidate="${candidate#of=}"          # dd's output operand
      case "$candidate" in
        ''|-*|'&'*|/dev/*) return 1 ;;      # flags, fd dups, the bit bucket
        '~'*|'$'*) return 1 ;;              # home paths and unexpanded variables
        *[!0-9KMGTkmgt]*) : ;;              # falls through: contains a real character
        *) return 1 ;;                      # a pure size operand like 0 or 100K
      esac
      case "$candidate" in
        /*) abs="$candidate" ;;
        *)  abs="$cwd/$candidate" ;;
      esac
      # Normalise `//`, `/./` and `a/../` so `./AGENTS.md` and `docs/../AGENTS.md`
      # resolve to the same guarded path a plain `AGENTS.md` does. Purely textual:
      # it does not follow symlinks, and a symlink out of the repo would defeat it
      # exactly like the interpreter bypasses named in the header.
      abs="$(printf '%s' "$abs" | sed -e 's|//*|/|g' -e ':a' -e 's|/\./|/|g' -e 'ta' \
                                      -e ':b' -e 's|/[^/][^/]*/\.\./|/|g' -e 'tb')"
      abs="${abs%/}"
      case "$abs" in
        "$repo"/artifacts|"$repo"/artifacts/*) return 1 ;;   # PM scratch — allowed
        "$repo"|"$repo"/*) return 0 ;;                       # in-repo — refused
        *) return 1 ;;
      esac
    }

    # 1. Redirections. `>`/`>>` followed by a path token. `>&1` and `>/dev/null`
    #    fall out for free: `&` is excluded from the token class, /dev/ above.
    redirect_targets="$(printf '%s' "$verbs" \
      | grep -oE '>{1,2}[[:space:]]*[^[:space:];&|<>()]+' \
      | sed -E 's/^>{1,2}[[:space:]]*//' || true)"

    # 2. Write commands, per segment, so `cp artifacts/a /tmp/b; cat AGENTS.md`
    #    tests only the cp. Which operands count differs per command, because
    #    testing all of them would deny `cp AGENTS.md /tmp/backup` — a perfectly
    #    legitimate read-side copy.
    #
    #    This lives in a FUNCTION rather than inline in the `$(…)` below on
    #    purpose: bash 3.2 (what macOS ships, and what runs this hook) scans a
    #    command substitution for its closing paren without understanding `case`,
    #    so the unbalanced `)` in a pattern like `tee)` silently truncates the
    #    substitution and yields a syntax error at run time that `bash -n` does
    #    not catch. A function body is parsed once, at definition, and is immune.
    collect_write_targets() {
      local segment verb arg last inplace skip
      set -f
      # The trailing newline matters: `read` discards a final line that has no
      # terminator, which silently dropped the LAST segment of every command —
      # so `echo x | tee AGENTS.md` was allowed because `tee AGENTS.md` was the
      # part thrown away.
      # shellcheck disable=SC2020 # Character-set translation is exactly what is wanted:
      # each of ; | & and newline becomes a newline. The repeated \n in set2 is the
      # deliberate one-to-one mapping, not an attempt to replace words.
      printf '%s\n' "$1" | tr ';|&\n' '\n\n\n\n' | while IFS= read -r segment; do
        # shellcheck disable=SC2086 # deliberate word splitting; globbing is off
        set -- $segment
        [ "$#" -gt 0 ] || continue
        verb="$1"
        shift
        case "$verb" in
          tee)
            for arg in "$@"; do
              case "$arg" in -*) ;; *) printf '%s\n' "$arg" ;; esac
            done
            ;;
          sed)
            # In-place only, and `-i` must be a FLAG token — matching it as a
            # substring would deny `sed -n 1,5p release-info.txt`.
            inplace=0
            for arg in "$@"; do
              case "$arg" in -i|-i*|--in-place|--in-place=*) inplace=1 ;; esac
            done
            [ "$inplace" -eq 1 ] || continue
            for arg in "$@"; do
              case "$arg" in -*) ;; *) printf '%s\n' "$arg" ;; esac
            done
            ;;
          cp|mv)
            # Only the final operand is a destination — testing every operand
            # would deny `cp AGENTS.md /tmp/backup`, a legitimate read-side copy.
            last=""
            for arg in "$@"; do
              case "$arg" in -*) ;; *) last="$arg" ;; esac
            done
            if [ -n "$last" ]; then printf '%s\n' "$last"; fi
            ;;
          dd)
            for arg in "$@"; do
              case "$arg" in of=*) printf '%s\n' "$arg" ;; esac
            done
            ;;
          truncate)
            skip=0
            for arg in "$@"; do
              if [ "$skip" -eq 1 ]; then skip=0; continue; fi
              case "$arg" in
                -s|--size) skip=1 ;;
                -*) ;;
                *) printf '%s\n' "$arg" ;;
              esac
            done
            ;;
        esac
      done
      set +f
    }
    command_targets="$(collect_write_targets "$verbs")" || true

    while IFS= read -r target; do
      [ -n "$target" ] || continue
      if is_guarded_path "$target"; then
        deny "$(in_repo_write_denial "Command refused:
    ${cmd}

It writes to a path inside the repository and outside artifacts/:
    ${target}")"
      fi
    done <<EOF
${redirect_targets}
${command_targets}
EOF
    ;;
esac

exit 0
