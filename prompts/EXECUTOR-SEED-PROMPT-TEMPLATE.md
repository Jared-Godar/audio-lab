# Executor Launch Block: Issue #⟨N⟩ — ⟨short title⟩

**This file is the copy-from template, not a launch record.** Copy it to
`prompts/YYYYMMDD-issue-⟨N⟩-⟨slug⟩.md`, fill every ⟨slot⟩, and delete this banner.

> **Ported from `macos-system-health/prompts/2026-07-21-issue-45-executor-seed.md`**
> (2,756 bytes, read 2026-07-27) under issue #34. Section structure and ordering are
> preserved; places where this repo differs are marked **⟨audio-lab adaptation⟩** inline.
>
> Note the difference in kind: in the reference repo this file *is* the prompt. Here the
> spec at `artifacts/specs/` carries the detail, and this file carries the **launch
> block** — the thing the maintainer pastes. The six required blocks live in
> `docs/PM-WORKFLOW.md` § 5, and the full spec structure in `artifacts/specs/TEMPLATE.md`.

---

## Launch block (one fence — the maintainer copies this once)

**⟨audio-lab adaptation, and the two rules that make this block different from the
reference:⟩**

1. **The `gh issue comment` launch record ships INSIDE the same fence as the `claude`
   invocation.** One paste does both. Shipped as two separate steps, the comment can
   succeed while the launch never runs — and the issue then claims a launch that did not
   happen. That is the failure this shape exists to prevent, because "no PR, no branch,
   clean tree" is otherwise indistinguishable between *never started* and *running,
   hasn't committed yet*. Absence of artifacts is ambiguity, not a finding.
2. **The model is pinned by full id** — `claude-opus-5` / `claude-sonnet-5`, never the
   `opus`/`sonnet` alias, which silently resolves to whatever is latest for the account.
   With an alias, the same spec run twice can run on two different models and the record
   of which one did the work is gone.

Also mandatory: `env AUDIO_LAB_EXECUTOR=1`. Without it the PM-lane guard denies every git
mutation, PR write, and in-repo file write outside `artifacts/`, and the executor stalls
on its first commit.

```fish
gh issue comment ⟨N⟩ -R Jared-Godar/audio-lab \
  --body "Launched — spec: artifacts/specs/⟨YYYYMMDD-issue-N-slug⟩.md · "(date -u +%Y-%m-%dT%H:%M:%SZ)
env AUDIO_LAB_EXECUTOR=1 claude --model ⟨claude-opus-5|claude-sonnet-5⟩ --effort ⟨low|medium|high⟩ \
  "Read and execute artifacts/specs/⟨YYYYMMDD-issue-N-slug⟩.md in full."
```

Everything below this line is context **for the maintainer**. It is deliberately outside
the fence and must never contain an instruction the executor needs — anything the executor
must know goes in the spec, and anything it must **not** do goes in the spec's first
lines, not its conclusion.

---

## Why this task matters

⟨Two to five bullets: the concrete consequence of the current state, and what changes when
this lands. Name the issues and work that depend on it. Write it so the maintainer can
decide whether to launch now or later without re-reading the issue.⟩

- ⟨…⟩

## Model & effort rationale

⟨Name the rung on `AGENTS.md` § "Model and effort sizing" and the single most-demanding
motion in the spec that puts it there. If recommending one rung up or down, say what
specific risk or ease justifies it — the maintainer decides on honest reasoning, not on a
default.⟩

- **Model — ⟨claude-opus-5|claude-sonnet-5⟩:** ⟨why. "Mechanical" argues down; ambiguity,
  irreversibility, blast radius, or anything touching the harness argues up.⟩
- **Effort — ⟨low|medium|high⟩:** ⟨why. Number of phases, judgment required, breadth of
  verification.⟩

Optimize for quality and issue-closure, not token conservation.

## Blast radius and rollback

⟨What could this break, and how is it undone? Required whenever the change touches hooks,
CI, branch protection, credentials, published audio, or anything outward-facing. State the
rollback as a command or an exact edit, so recovery does not require reading the code
first.⟩

## Cost, if it spends anything

⟨ElevenLabs credits estimated **before** the run, with the actual reported after. Anything
above ~2,000 credits, or any full episode render, is **gated** — quote the estimate and
wait for the maintainer. Write "zero credits" explicitly when nothing is spent, rather than
leaving it unsaid.⟩

## Ready to launch?

- [ ] Issue #⟨N⟩ exists, is written to the house standard, and has full metadata
- [ ] The spec exists at `artifacts/specs/⟨…⟩.md`, every ⟨slot⟩ filled, banner deleted
- [ ] The spec's § 8 marks each claim **PM-VERIFIED** or **PM-UNVERIFIED**
- [ ] The spec names what the executor must **not** do, in its opening section
- [ ] Labels verified to exist in `.github/labels.json` — never assumed
- [ ] Any gated action in scope (merge, >2,000 credits, protection change, visibility) is
      flagged here for the maintainer rather than left to the executor
- [ ] `main` is at ⟨SHA⟩ and the worktree is clean
