# Contributing

audio-lab is a personal, single-maintainer project (Jared Godar). There are no
external contributors and no expectation of outside pull requests. This document exists
so the workflow is legible from the outside and so every agent session — PM thread, CLI
executor, cloud, or fresh clone — follows the same rails.

## Read the durable contracts first

Before any change, read, in order: [`AGENTS.md`](AGENTS.md) (the standing contract),
[`CLAUDE.md`](CLAUDE.md) (session modes and the PM/executor lane), `~/.claude/CLAUDE.md`
(the maintainer's global rules), and the memory files. **A durable contract outranks any
prompt or plan** — if they conflict, stop and surface it rather than resolving it
quietly.

## The PM / executor lane

Work is split into two session modes, enforced by
`.claude/hooks/pm-lane-guard.sh` (a tracked `PreToolUse` hook), not merely remembered:

- **PM thread** — plans, writes issues and labels, authors executor specs under
  `artifacts/specs/`, and verifies output read-only. It does not commit, push, open PRs,
  or merge.
- **Executor** — launched with `AUDIO_LAB_EXECUTOR=1`, implements a spec exactly:
  commits, pushes, and opens PRs with full metadata. **It never merges.**

## Local setup

```fish
cd pipeline
uv sync --locked
```

Install the git hooks — a configured hook that is not installed does nothing:

```fish
pre-commit install
```

## Making a change

1. **Sync, then branch.** `git fetch`; confirm `git log --oneline main..origin/main`
   is empty; cut a topic branch before editing.
2. **Gate every commit.** `pre-commit run --all-files` must be green *before* each
   commit, not after.
3. **Update `CHANGELOG.md` in the same PR.** This is a merge gate
   (`.github/workflows/changelog.yml`); `skip-changelog` is the escape hatch for
   genuinely trivial changes, not a routine bypass. Things learned about external
   services go under **Findings**.
4. **Open the PR with full metadata:** assignee `Jared-Godar`, at least one `type:` and
   one `area:` label from `.github/labels.json` (verify the name exists — do not
   assume), a milestone where the linked issue has one, and `Closes #N`. Disclose in the
   body what was deliberately excluded.
5. **Verify by read-back** (`gh pr checks`, `gh pr view --json`), never by inferring
   success from the create command. **The maintainer merges** via the GUI on an
   announced GREEN LIGHT.

## Issues

Issues follow the house standard in `AGENTS.md` § "Issues are written to the house
standard": a briefing with measured evidence (pasted command output), maintainer-choice
resolution options, non-goals, and checkbox acceptance criteria ending in a CHANGELOG
entry — not a to-do line.

## Licensing of contributions

Code, tooling, and configuration in this repo are MIT-licensed (`LICENSE`); any code
contribution is offered under MIT. Episode **content** under `episodes/` is all rights
reserved (`episodes/LICENSE`) — this project does not invite content contributions.

## What never gets committed

Secrets (`ELEVENLABS_API_KEY` lives in the shell environment only), heavy media, and
anything under the gitignored `output/` or the ignored parts of `artifacts/`. See
[`SECURITY.md`](SECURITY.md).
