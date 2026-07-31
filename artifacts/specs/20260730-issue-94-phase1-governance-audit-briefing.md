# Issue #94 · Phase 1 — Governance audit briefing

Date: 2026-07-30 · Author: the #94 session, after reading every surface in full this session.
Status: **briefing for the interactive Phase 2 Q&A** — nothing here is a decision until Jared makes it.

---

## 1. Background: the surface hierarchy — what each is, how it reaches a session

| Surface | Tracked? | Who receives it | How it enters context | What belongs there |
| --- | --- | --- | --- | --- |
| **`AGENTS.md`** (repo root) | yes | **every** session type — local, cold-start, cloud, fresh clone, other vendors' agents | loaded as project instructions at session start | the binding contract for work in THIS repo |
| **`CLAUDE.md`** (repo root) | yes | every Claude session in this repo | loaded at session start alongside AGENTS.md | repo mechanics: shape, tool specifics, naming — Claude-specific operational notes |
| **`~/.claude/CLAUDE.md`** (global) | no (machine-local) | only sessions on **this machine** under this user | loaded at session start for all projects | cross-project personal rules and machine facts |
| **Auto-memory** (`~/.claude/projects/<proj>/memory/`) | no | only this machine, this project | `MEMORY.md` index loaded each session; bodies read on demand | facts and preferences that must not or need not be public |
| **`.claude/settings.json`** (project) | yes | every session in this repo | harness config — permissions, hooks | mechanical harness behavior, not prose rules |
| **`~/.claude/settings.json`** (global) | no | this machine | harness config | personal harness defaults |
| **(until this PR) two hooks** | yes | every session in this repo | pm-lane-guard on every tool call; contract-reinjection ~645–1,010 tokens **every turn** | being removed per #94 §4 decision 1 |

**The load-bearing constraint:** a rule in the global file or memory binds only this machine. Only tracked repo files reach a cloud session or a fresh clone. Any rule that must bind *every* session has exactly one viable home: the repo's own tracked files.

**Default agent-side handling (honest version):** these files are injected as instructions, not enforced. An agent "follows" them to the degree it reads and weights them — which is precisely why volume is not neutral: 82 KB of rules competes with itself for attention, and the observed failure mode (rules read, then broken) worsens as the set grows and repeats.

## 2. Current state, per surface

**`~/.claude/CLAUDE.md` — 36,411 B, 19 rules + preamble.** Accreted 2026-07-13 → 07-29, one rule per incident. Long origin stories with verbatim quotes make up roughly half the bytes. One rule (VSCode permissions auto-approval) now asserts a settings state that is false (claims categorical-only allow rules; the live file has 160 accreted entries). One rule (PM/governance model tier) presumes a standing-PM model that Experiment A retired.

**`AGENTS.md` — 32,309 B, 19 sections.** The repo contract. **~12 of the global file's 19 rules are restated here** in different words (authority, artifact≠behavior, done-means-done, CHANGELOG, promises, both walkthroughs, receipts/seed, issues standard, parity, GUI, defensive calls, artifact naming). Also carries the genuinely repo-specific material: do-automatically / hold-for-maintainer lists, canonical workflow, definition of done, recorded divergences — the parts that are NOT duplicated anywhere and mostly earn their keep.

**`CLAUDE.md` (project) — 13,662 B, 9 sections.** Roughly 60% describes the two hooks and the PM/executor lane — all of it deleted or obsoleted by #94 decision 1 + Experiment A. The artifact-naming rule appears here as a *third* copy. Survivors: repo shape, ElevenLabs specifics, changelog pointer.

**Memory — 21 files + index, 64,964 B.** Two populations:
- **~13 conduct-rule files** (receipts, never-descope, disclose-first, corrections-canonical, nothing-needs-evidence, authorization-granted, post-closure protocol, mood-tracking, cite-reference, inspect-artifact, hedge-first, warnings-at-point-of-use, log-discrepancies) — each a well-written incident report whose *rule content* overlaps the contract files or belongs there. Fourth copy of artifact-naming lives here too.
- **~8 project/reference facts** (Bitdefender config, Bash-cwd trap, episode-artwork workflow, episodes-are-drafts, synthetic-cast policy, Experiment A, squash-commit bodies, drop-paths) — genuinely memory-shaped: machine-local, project-factual, or **deliberately non-public** (synthetic-cast must never enter the tracked repo).

**Settings.** Project: hooks block (goes) + 19 allow rules (mostly fine). Global: 160 allow rules, dozens dead one-offs from other repos; plus sane harness prefs.

## 3. The redundancy decision brief — helpful or harmful?

**Within one project: harmful, with evidence.** The artifact-naming rule exists in FOUR places (global, AGENTS.md, CLAUDE.md, memory) in four wordings. The receipts rule in three. Every copy is a drift surface — #33 (the reinjection hook) exists *because* copies drifted mid-session, i.e., the cost of redundancy was already high enough that a per-turn tax was bought to manage it. Redundancy did not produce compliance (63% remediation share); it produced maintenance burden and the ability to cite whichever copy suits.

**Across repos: a small duplicated core is a forced cost, not a choice.** Because only tracked repo files reach every session type, any rule binding all four repos must exist in four AGENTS.md files. The mitigation is minimizing the *size* of what is duplicated — a compact conduct core (say ≤3 KB) duplicates cheaply and drifts visibly; 30 KB does neither.

**Recommendation: one home per rule inside a project — other surfaces may POINT, never restate.** Across repos, duplicate only a deliberately small core, each copy stamped with its sync date.

## 4. Consolidation recommendation — the shorter list of slightly longer rules

Nineteen global rules + nine standing commitments + thirteen memory rules collapse into **eight consolidated rules** (working names; final text drafted in Phase 2 with Jared):

| # | Consolidated rule | Absorbs |
| --- | --- | --- |
| **1. Truth in reporting** | done-means-done · artifact-is-not-the-behavior · calibrated claims · "nothing" needs evidence · verify-with-a-control · uncertainty-leads (hedge) · measure-before-claiming · summaries-match-prose | 8 rules → 1 |
| **2. Authority & scope** | Jared-absolute-authority · seed-never-outranks · authorization-is-not-a-negotiation · never-descope · disclose-and-stop (never self-remediate) · a-question-is-a-request-for-an-answer · post-closure-stop · recommendations-carry-reversal-conditions | 8 → 1 |
| **3. Same-turn persistence** | promises-persisted · every-correction-canonical · log-discrepancies-as-issues-first | 3 → 1 |
| **4. Receipts vs. actions** | receipts/fences rule · announce-intent one-liner · plain language / expand jargon · Fish syntax · GUI click paths · drop-path status | 6 → 1 |
| **5. Artifacts & engineering** | self-describing filenames (ONE copy) · defensive external calls · 200-is-not-a-result · warnings-at-point-of-use · inspect-before-speccing · cite-the-reference | 6 → 1 |
| **6. Money & irreversibles** | hold-for-maintainer list · repo visibility/deletion · credit gates · feed protection | already coherent — kept nearly as-is |
| **7. Work-item workflow** | canonical workflow · CHANGELOG gate · metadata/DoD · merge green light · post-merge closure · squash bodies · issues house standard (slimmed) | consolidated mechanics |
| **8. New-repo parity** | parity checklist (slimmed) · issues-from-issue-one | 2 → 1 |

**Origin stories:** the single biggest byte-saver. Proposal: each consolidated rule keeps a one-line origin register ("2026-07-26: PM made 15 commits against its own split — see git history") instead of multi-paragraph verbatim reconstructions. The full stories remain forever in git history and the #84 corpus. *This is a Phase 2 question — the quotes have motivational value and cutting them is his call, not mine.*

## 5. Reorganization recommendation — right rule, right surface

| Surface | After consolidation |
| --- | --- |
| **`AGENTS.md`** | THE contract, sole binding home: conduct core (rules 1–6) + workflow (rule 7) + do/hold lists + recorded divergences. Target ~10–12 KB (from 32 KB) |
| **`CLAUDE.md`** (project) | mechanics only: repo shape, ElevenLabs, naming-rule *pointer*, changelog pointer. No conduct rules, no session-mode apparatus. Target ~3–4 KB (from 14 KB) |
| **`~/.claude/CLAUDE.md`** | machine/personal only: Fish/macOS facts, new-repo parity (rule 8 — for repos with no AGENTS.md yet), cross-repo core *reference copy* with sync-date stamps, pointer declaring each repo's AGENTS.md authoritative. Target ~5–6 KB (from 36 KB) |
| **Memory** | facts only: the ~8 project/reference files stay (synthetic-cast stays memory-only by design); the ~13 conduct-rule files are deleted **after** line-by-line confirmation their content is absorbed — each deletion listed in the Phase 3 memorandum with its absorption target |
| **Settings** | project: hooks block deleted, allow-list kept; global: allow-list collapsed to categorical rules (~15 entries from 160) |
| **Hooks** | none. `.claude/hooks/`, `.claude/contract-state/`, `scripts/pm_lane_guard_matrix.py` removed (harness disposition = Phase 2 question) |

## 6. Token-savings estimate (preliminary — final numbers in the PR)

| Component | Now | After | Saving |
| --- | --- | --- | --- |
| Resident contract prose (per session) | ~82.4 KB ≈ 20,600 tok | ~20 KB ≈ 5,000 tok | **~15,600 tok/session** |
| Contract reinjection (per turn) | 645–1,010 tok | 0 | **~650–1,000 × every turn** — a 40-turn session: ~26,000–40,000 tok |
| Memory index + bodies read | ~65 KB pool | ~25 KB pool | smaller recall surface |
| pm-lane-guard | ~0 tok (denies, doesn't inject) | 0 | time/friction only |

Order of magnitude: **roughly 40,000–60,000 tokens saved per working session**, before counting the second-order saving (#94's real target): fewer remediation issues consuming maintainer time.

## 7. What Phase 2 must decide (the Q&A queue)

1. Walkthrough rules — keep both / merge to wind-down-only / drop (they are the costliest per-session behaviors surviving hook removal)
2. PM/executor apparatus — retire wholesale in favor of Experiment A as the documented default? Fate of spec templates, spec-immutability, PM-thread-discipline, model-sizing sections
3. Origin stories — one-line register vs. keep verbatim quotes
4. Memory policy — approve the delete-after-absorption list
5. Global-file role — approve the "repo AGENTS.md is sole binding contract" architecture
6. Labels vocabulary (folded from #8) — the four axis decisions
7. README-staleness workflow (folded from #63) — build against new text, or retire
8. Guard-harness disposition — delete vs. archive (open option (a) from #94 §4)
9. Announce-intent & pre-flight — confirm survival (recommended keep: cheap, high-value)
10. Reinjection's job (stale-citation defense) — accept prose-only "re-read before citing," no replacement mechanism
