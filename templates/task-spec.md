# Task: ⟨TITLE⟩

<!-- Ported from github-portfolio-modernization/templates/task-spec.md (759 bytes, read
2026-07-27) under issue #34. Section structure and ordering preserved; audio-lab
adaptations are marked inline. Slot delimiters changed from <ANGLE> to ⟨…⟩ to match the
convention in artifacts/specs/TEMPLATE.md and to avoid inline-HTML ambiguity in Markdown.

WHICH TEMPLATE DO I WANT? This one is the lightweight brief for a single, well-understood
task where the content is already known. Anything with a tracked issue behind it, a
multi-step execution, a new gate, or any irreversible or outward-facing action uses
artifacts/specs/TEMPLATE.md instead — the full nine-section spec. When in doubt, use that
one: a six-word spec line that dropped a working config is exactly why #34 exists. -->

## Goal

⟨One sentence: what state the repository should be in when this is done. Write it so
"done" is checkable, not a judgment call.⟩

## Implementation

1. ⟨step⟩
2. ⟨step⟩

## Editorial Direction

Emphasize:

- ⟨point⟩

Avoid:

- Gimmicky widgets, badge walls, excessive emoji
- Claiming unfinished work is available, or presenting a written rule as an enforced one
- **⟨audio-lab adaptation⟩** Naming any generated artifact with a bare hash, UUID, or
  opaque token. Shape: `YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE[-BITRATE].mp3`. The vendor is
  mandatory and comes second.

## Verification

**⟨audio-lab adaptation — this section is added, not ported.⟩** The reference template has
no verification slot, and an unverified task brief is how "written" gets reported as
"done".

- ⟨command⟩ → ⟨expected output⟩
- `bash scripts/check` → `All checks passed.`
- CHANGELOG entry added in the same PR (enforced by `changelog.yml`)

## Commit Message

`⟨imperative subject line, ending in (#N) where an issue exists⟩`

⟨body — the rationale, not a restatement of the diff⟩

## Safety Rules

- Modify only ⟨explicit scope⟩. Preserve unrelated changes in the worktree; inspect
  `git status --short` before staging and stage only files belonging to this task.
- Do not rewrite history, force-push, or use destructive Git operations.
- Do not archive, delete, or change the visibility of any repository. Making a repo public
  or deleting one requires the maintainer's express, per-repo authorization at the time of
  the action — prior authorization never carries forward.
- **Never merge.** The maintainer merges via the GUI on an announced GREEN LIGHT.
- **⟨audio-lab adaptation⟩** Do not spend more than ~2,000 ElevenLabs credits in one
  action, and never run a full episode render or use the single professional voice-clone
  slot, without quoting the cost and waiting for the maintainer.
- **⟨audio-lab adaptation⟩** Do not overwrite or delete anything under `episodes/`,
  `prompts/`, or a published feed. `prompts/` seeds are immutable after handoff: revisions
  go to a new dated file, never an in-place edit.
- If a durable contract (`AGENTS.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`) conflicts with
  this brief, **the contract wins** — stop and report rather than resolving it yourself.
