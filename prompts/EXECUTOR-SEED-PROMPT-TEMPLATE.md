# Executor Launch Block: Issue #⟨N⟩ — ⟨short title⟩

**This file is the copy-from template, not a launch record.** Copy it to
`docs/⟨YYYYMMDDHHmmss⟩-issue-⟨N⟩-⟨slug⟩.md`, fill every ⟨slot⟩, and delete this banner.

> **Rewritten 2026-08-02.** The previous version was built on machinery removed three days
> earlier and cited two files that do not exist. What changed, and why none of it comes
> back:
>
> - **`AUDIO_LAB_EXECUTOR=1` is gone.** The PM-lane `PreToolUse` guard it unlocked was
>   removed with the governance consolidation (#94, 2026-07-30). The variable now does
>   nothing, but it read as a hard requirement to anyone pasting the block. **An inert
>   instruction is worse than an absent one** — it teaches the reader the file cannot be
>   trusted, and they stop reading the parts that are still true.
> - **No hooks.** The per-turn contract-reinjection hook went at the same time. Re-adding
>   any hook is a fresh maintainer decision, never a silent re-add.
> - **`docs/PM-WORKFLOW.md` and `artifacts/specs/TEMPLATE.md` do not exist.** The previous
>   version pointed at both for the required sections. The binding text is `AGENTS.md`
>   § "Issues — tiered house standard" and § "Scoping: decompose before filing".
> - **Specs live in `docs/` with a 14-digit timestamp prefix**, not in `artifacts/specs/`
>   with a bare date. `artifacts/` is retired by the M10 reorganisation, and
>   [ADR 0021](../docs/adr/0021-timestamp-prefix-is-mandatory-and-second-granular.md) made
>   second-granular timestamps mandatory.
>
> Originally ported from `macos-system-health/prompts/2026-07-21-issue-45-executor-seed.md`
> (2,756 bytes, read 2026-07-27) under issue #34. The difference in kind still holds: in the
> reference repo that file *is* the prompt; here the spec carries the detail and this file
> carries the **launch block** — the thing the maintainer pastes.

---

## Launch block (one fence — the maintainer copies this once)

**The `gh issue comment` launch record ships INSIDE the same fence as the `claude`
invocation.** One paste does both. Shipped as two steps, the comment can succeed while the
launch never runs, and the issue then claims a launch that did not happen. That matters
because "no PR, no branch, clean tree" is otherwise indistinguishable between *never
started* and *running, hasn't committed yet* — absence of artifacts is ambiguity, not a
finding.

**The model is pinned by full id** — `claude-opus-5` / `claude-sonnet-5`, never the
`opus`/`sonnet` alias, which silently resolves to whatever is latest for the account. With
an alias, the same spec run twice can run on two different models, and the record of which
one did the work is gone.

```fish
gh issue comment ⟨N⟩ -R Jared-Godar/audio-lab \
  --body "Launched — spec: docs/⟨YYYYMMDDHHmmss-issue-N-slug⟩.md · "(date -u +%Y-%m-%dT%H:%M:%SZ)
claude --model ⟨claude-opus-5|claude-sonnet-5⟩ --effort ⟨low|medium|high⟩ \
  "Read and execute docs/⟨YYYYMMDDHHmmss-issue-N-slug⟩.md in full."
```

Everything below this line is context **for the maintainer**. It is deliberately outside
the fence and must never contain an instruction the executor needs — anything the executor
must know goes in the spec, and anything it must **not** do goes in the spec's first lines,
not its conclusion.

---

## Why this task matters

⟨Two to five bullets: the concrete consequence of the current state, and what changes when
this lands. Name the issues and work that depend on it. Write it so the maintainer can
decide whether to launch now or later without re-reading the issue.⟩

- ⟨…⟩

## Model & effort rationale

⟨Name the single most-demanding motion in the spec and let it set the rung. If recommending
one rung up or down, say what specific risk or ease justifies it — the maintainer decides on
honest reasoning, not on a default.⟩

- **Model — ⟨claude-opus-5|claude-sonnet-5⟩:** ⟨why. "Mechanical" argues down; ambiguity,
  irreversibility, blast radius, or anything touching CI or the live deploy argues up.⟩
- **Effort — ⟨low|medium|high⟩:** ⟨why. Number of phases, judgment required, breadth of
  verification.⟩

Optimize for quality and issue-closure, not token conservation.

## Blast radius and rollback

⟨What could this break, and how is it undone? Required whenever the change touches CI,
branch protection, credentials, published audio or video, or anything outward-facing. State
the rollback as a command or an exact edit, so recovery does not require reading the code
first.⟩

**Name the silent failures separately from the loud ones.** A loud break is a scheduling
nuisance; a reference that stops matching and leaves its check reporting success is the one
that costs days. If the change touches a glob, a `paths:` filter, a `files:` pattern or a
path filter inside a script, say which — and say what **count** proves it still resolves.
`scripts/check_path_references.py` exists for exactly this and should be named in the
acceptance criteria.

## Cost, if it spends anything

⟨ElevenLabs credits estimated **before** the run, with the actual reported after. Anything
above ~2,000 credits, or any full episode render, is **gated** — quote the estimate and wait
for the maintainer. Write "zero credits" explicitly when nothing is spent, rather than
leaving it unsaid.⟩

## Ready to launch?

- [ ] Issue #⟨N⟩ exists, is written to the house standard, and has full metadata
- [ ] The spec exists at `docs/⟨YYYYMMDDHHmmss-issue-N-slug⟩.md`, every ⟨slot⟩ filled,
      banner deleted
- [ ] The spec marks each claim **PM-VERIFIED** or **PM-UNVERIFIED** — an unmarked claim is
      treated as unverified
- [ ] The spec names what the executor must **not** do, in its opening section
- [ ] **The spec is honestly scoped.** If it is expected to be difficult, it says so and
      proposes the split — filing work you already expect to struggle with, without saying
      so, is the violation (`AGENTS.md` § Scoping)
- [ ] Acceptance criteria each name the command that proves them, and anything that could
      pass vacuously carries a **before/after count**, not a status
- [ ] Labels verified to exist in `.github/labels.json` — never assumed
- [ ] Any gated action in scope (merge, >2,000 credits, protection change, visibility,
      force-push) is flagged here for the maintainer rather than left to the executor
- [ ] `main` is at ⟨SHA⟩ and the worktree is clean
