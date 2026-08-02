# Repo file-structure — D4 decision record (approval gate 1)

**Issue:** [#181](https://github.com/Jared-Godar/audio-lab/issues/181) (D4 of epic
[#176](https://github.com/Jared-Godar/audio-lab/issues/176)) · **Date:** 2026-08-02
· **Status:** gate closed — decisions recorded, nothing moved.

**Input:** the D3 assessment report
([`20260801225106-repo-file-structure-d3-assessment-report.md`](20260801225106-repo-file-structure-d3-assessment-report.md)),
whose § 5 carried eleven open questions, each with options, a recommendation and a
reversal condition.

**Output:** every one of the eleven is decided. The revised structure that implements them
is D5
([`20260802001736-repo-file-structure-d5-revised-structure.md`](20260802001736-repo-file-structure-d5-revised-structure.md)).

---

## 1. The decision

The maintainer settled all eleven questions in one instruction, on 2026-08-02, declining
to re-litigate a set he considered already answered. **Yes to all eleven**, with the
reasoning that these were not new questions and re-presenting them as an open menu asked
him to decide the same thing twice.

**Reading applied:** *yes* = **accept the D3 recommendation as written**, for each of
Q1–Q11. No recommendation was modified, softened, or partially applied. Where a
recommendation was itself "defer" (Q5), the deferral is the decision.

**Attribution and reasoning.** The reasoning is his stated one: these were not new
questions. The structural direction was given in [#176](https://github.com/Jared-Godar/audio-lab/issues/176)
and the recommendations were built to match that direction, so re-presenting them as an
open menu asked him to decide the same thing twice. That is recorded here as the maintainer's
reasoning, not paraphrase of a preference — it is why there are no per-question vetoes or
redirects below.

## 2. The eleven, as decided

| Q | Question | **Decision** | Reversal condition (carried forward) |
| --- | --- | --- | --- |
| Q1 | `infra/` + `pipeline/` separate, add `tooling/`? | **Separate. `tooling/` created.** `pipeline/` is not moved. | Revisit if a second Python package appears |
| Q2 | `adr/` at root or under `docs/`? | **Stays `docs/adr/`.** | Trivial — one `git mv` at any time |
| Q3 | Are guides / reports / reference / specs / adr the right five? | **Yes**, and the sorting rule is stated in `docs/README.md` so review can enforce it | If filing a document ever means hesitating between two of the five, collapse to `guides/` + `reference/` + `adr/` |
| Q4 | Per-episode `cast/` or one shared home? | **One shared home: `podcast/portraits/`.** Episodes reference it | An episode-specific treatment of the same person may add `episodes/epNN/art/cast/` **as a documented exception**, never as a parallel default |
| Q5 | Social brand folder naming (`images/` vs `media/`, per-platform vs shared) | **Deferred.** No social sub-tree is created; nothing is populated | Decide when the second platform needs a distinct asset — the answer becomes evidence-based then |
| Q6 | `archive/`: keep or delete `spotify/`, `data/spotify-2022/`, `audition-v1/`? | **Keep, consolidated under `archive/`.** | If `archive/` is untouched by 2026-02-02 (six months), delete the whole directory in one decision |
| Q7 | `output/` at 132 MB | **Delete `_post-experiments/` (90 MB); leave the rest.** **Executed 2026-08-02** — see § 3 | Irreversible; the tempo experiment can be re-rendered from `pipeline/` if it reopens |
| Q8 | `.local/sessions/` inside the repo, or scratch outside it? | **Inside the repo, at `.local/sessions/`.** | Move it out if it exceeds ~50 MB, or if nothing in it is read for a month |
| Q9 | Episode `TEMPLATE/` enforced or advisory? | **Advisory first.** No CI check is written at D7 | Promote to a required check once two consecutive episodes conform with no exception |
| Q10 | The 4 non-duplicate `prompts/` files | **`EXECUTOR-SEED-PROMPT-TEMPLATE.md` → `tooling/templates/`; the three PM-era seeds → `archive/prompts-pm-era/`.** The other 23 are deleted as byte-identical duplicates | If Experiment A is reversed to a two-session PM/executor model, the seeds return from `archive/` |
| Q11 | Split `episodes/epNN/build/`? | **Split into `build/audio/` and `build/art/`.** | If `build/art/` only ever holds one file per episode, flatten it back |

**Q12** was decided on 2026-08-01, before this gate, and is recorded as
[ADR 0021](adr/0021-timestamp-prefix-is-mandatory-and-second-granular.md). It is not
re-opened here.

The structure these eleven produce is recorded as
[ADR 0022](adr/0022-approved-target-file-structure.md).

## 3. Actions taken under these decisions

Two actions were authorised by the same instruction and executed on 2026-08-02. Both are
outside git, so neither appears in this PR's diff and both are recorded here instead.

**Q7 — `output/episodes/ToldStraight-Ep01-v2/_post-experiments/` deleted.** Inspected
before deletion, per conduct rule 6: seven `.mp3` files dated 2026-07-27, the tempo
experiment settled that day (`tempo105-gap300`, `tempo108-gap250`, `tempo112-gap220`,
three FULL cuts and one SAMPLE). `git ls-files` over the directory returned nothing — no
file there had ever been committed, so nothing is recoverable from history and nothing is
lost from it either.

```text
output/ before: 132M
output/ after:   42M
```

**Stray worktree removed.** `.claude/worktrees/r1-claude-md-artifacts-truth` — created by
a prior session, never used, branch at `a15f075` with zero commits ahead of `main` and a
clean tree. Unlocked, removed, branch deleted. Worktree count 13 → 12. Not part of the
reorg; recorded because it was authorised in the same instruction.

## 4. Flagged: decisions that contradict an existing repo rule

`#181`'s acceptance criteria require this list. Measured, not recalled —
`grep -n` over `AGENTS.md` and `CLAUDE.md` for every path the approved structure retires:

**Nineteen lines across the two governance files name a path that moves.** They are not
cosmetic; several are inside literal commands an agent is told to run.

| File | Lines | What breaks |
| --- | --- | --- |
| `AGENTS.md` | 152, 164, 182 | `prompts/` is retired; `artifacts/` is retired as a write target (scratch becomes `.local/sessions/`) |
| `AGENTS.md` | 226, 228 | The closure-pass command `git status --porcelain --untracked-files=all -- artifacts/specs artifacts/issues` names two directories that become `docs/specs/`. **This is a literal command that will silently match nothing** — the worst failure mode, because it returns success |
| `AGENTS.md` | 185, 187, 205, 207, 233, 239, 250, 256, 277, 287 | Ten references to `site/`, including the rule-6 exception text and the `aws s3 sync site/ --delete` command |
| `AGENTS.md` | 253 | `scripts/preview-site.fish` → `tooling/preview-site.fish`, inside a fenced block the maintainer is told to paste |
| `CLAUDE.md` | 12, 15, 43 | § Repo shape describes `artifacts/`, `tools/brand/` and `artifacts/walkthroughs/` — all three move |

**Consequence for D7 (#184):** amending `AGENTS.md` and `CLAUDE.md` is not follow-up work,
it is part of the move. A fenced command in a governance file that points at a path which
no longer exists is a rule that fails quietly.

One of these is being corrected ahead of D7, because it is false **today** and independent
of the reorg: `CLAUDE.md` line 12 calls `artifacts/` a gitignored working zone where
"nothing here reaches a fresh clone", while 42 files under it are tracked (D3 § 2.1, R1).
That correction ships in this PR. It will be rewritten again at D7, when `artifacts/`
stops existing.

## 5. Not closed at this gate, and why

`#181` also asks for **"confirmation of the LFS decision's blast radius once D8 has real
numbers."** That confirmation cannot be given here, and is escalated rather than assumed.

D8 (#185) has not run, and the number it needs does not exist yet: D3 § 2.10 re-measured
the tree and found **141 `.mp3` files, 163.1 MB total, largest single file 15.3 MB, and
zero `.mp4` files.** The LFS premise in #185 was written against an assumed ~86 MB
episode; the real audio is a fifth of that and needs no LFS at all. Video is the open
variable and there is nothing to measure — **no exported `.mp4` exists in the tree.**

This item stays with **#185 (D8)**, which already owns it and whose stated first step is
to measure a real exported `.mp4` before concluding. Flagging it here rather than marking
it resolved: a gate cannot confirm a blast radius against a file that has not been
produced.

## 6. Provenance

- Decision instruction: maintainer, 2026-08-02, quoted verbatim in § 1.
- Options and recommendations the decision applies to:
  [D3 § 5](20260801225106-repo-file-structure-d3-assessment-report.md), measured against
  `main@0a8e88c`.
- Governance-file collision counts in § 4: `grep -n -E` over `AGENTS.md` and `CLAUDE.md`
  at `main@a15f075`, 2026-08-02.
- Q7 sizes in § 3: `du -sh output/` before and after, same session.
