# Spec: Rewrite README.md for a listener and a developer, and fill the empty discovery fields (Issue #58)

**Closes:** #58 · **Labels:** `type: docs`, `area: governance`, `priority: medium` (verified
in `.github/labels.json`) · **Milestone:** none (#58 is unmilestoned; do not invent one) ·
**Assignee:** `Jared-Godar`
**Sizing:** `claude-opus-5` / `high` — pin the id, not the `opus` alias. This is public-facing
prose that has to be good *and* true simultaneously, which is the hard part.

---

## 0. Read the durable contracts first (non-negotiable)

`AGENTS.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`, memory files under
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`, `CHANGELOG.md` § Findings,
`ROADMAP.md` in full, and **the current `README.md` in full before changing a line of it.**

A durable contract outranks this spec. Conflict → stop and report. This spec is immutable
after handoff.

### 0a. THE THINGS YOU MUST NOT DO

- **Never imply the episode is listenable.** Ep01 v2 exists as a file in a gitignored
  directory. It is not published, not on a feed, not linked, and there is nothing to click.
  A README that reads as though someone can go hear it is the failure `AGENTS.md` § "The
  artifact is not the behavior" names, made outward for the first time.
- **Never state a fact you have not measured this session.** Every date, count and status in
  the README is verified by a command you ran — not copied from this spec, which is a
  snapshot and may already be stale.
- **Never delete the `pre-commit install` warning.** Move it; do not lose it. It is
  load-bearing and it explains a real failure mode.
- **Never set `homepage`.** `toldstraight.com` serves DNS and mail and no web content.
  Pointing at nothing is worse than pointing at nothing.
- **Never run `gh repo edit` with any flag other than `--description` and `--add-topic`.**
  Not visibility, not features, not merge settings. Nothing else.
- **Never add a badge that asserts something not mechanically true and self-updating.**
- **Never add a header image or logo** — that is #60, deliberately separate. The README must
  read well with no imagery at all.
- **Do not merge.**

## 0b. Progress tracking

Comment on #58 at: branch created · draft ready for review · PR opened. If §2's measured
state disagrees with what you find, stop and report rather than reconciling silently.

## 1. Intended outcome

`README.md` that a curious listener finishes and a curious developer respects, honest about
being five days old, with the repository's empty discovery fields filled and a **checkable**
rule that keeps the status section from rotting.

## 2. Current state and gap — re-measure, do not trust these numbers

The PM measured the following on 2026-07-27. **Re-run each one**; where yours differs, yours
is right and this spec is stale.

```
$ wc -l README.md                                  86
$ head -3 README.md        -> "Personal audio tooling: TTS voice auditioning, podcast
                              generation via the Save to Spotify CLI, and Spotify
                              listening-data analysis."
$ sed -n '6p' README.md    -> "## Setup (do this first in a fresh clone)"
$ gh api repos/Jared-Godar/audio-lab --jq '{topics,homepage,description,has_wiki}'
                              {"description":null,"homepage":null,"topics":[],"has_wiki":true}
$ git log --reverse --format='%ad' --date=short | head -1        2026-07-22
$ gh repo view --json createdAt                                  2026-07-23
$ whois toldstraight.com | grep -i creation                      2026-07-26
```

The second heading in the file is `## Setup`. Nothing above it says there is a podcast.

**Facts the status section should carry — measure each yourself:**

- Project start (first commit), repo public date, domain registration date
- DNS security records live (#22/PR #41); mail live with SPF+DKIM+DMARC passing (#54/PR #57)
- Ep01 v2 rendered (#43/PR #45) — stem count and master duration from
  `output/episodes/ToldStraight-Ep01-v2/` and `ffprobe`, **and that it is unpublished**
- Cast: Jofra as the expert (character name **Owen**), Daniel as an **interim** host to be
  replaced by the maintainer's own narration — from `episodes/cast.json`
- Season 1 topic, from `ROADMAP.md` and `episodes/ToldStraight-Ep01/`
- Milestone status from `gh api repos/Jared-Godar/audio-lab/milestones` — **live, not copied**

## 3. Decisions — made by the PM and the maintainer, implement as written

- **§4C option 1 — the milestone-closure trigger.** Chosen 2026-07-27. When a milestone's
  last open issue closes, the PR that closes it refreshes the README's status section.
- **Scope additions from the maintainer:** set the repository **description**; add **topics**;
  apply **badges and decorators as appropriate**, subject to §0a.
- **`has_wiki: true` is the maintainer's call, not yours.** Surface it in the PR body as a
  recommendation; do not change it.
- **Two audiences, one document, listener first.** A developer will scroll past show material
  happily. A listener will not scroll past `pre-commit`.
- **Tone: confident and dry, matching the show.** *Told Straight* is against hype. Fun means
  well-written, not decorated. No emoji-per-heading, no rocket, no "awesome".

## 4. Deliverables

**A. `README.md`, rewritten.** Suggested order, not prescriptive — earn the structure:

1. What this is, in two sentences a non-developer finishes. *Told Straight*: season-per-topic
   deep dive, BLUF, data-driven, explicitly against do-your-own-research culture. Season 1 is
   adult ADHD.
2. Where it is right now — dated, honest, and including that **nothing is published yet**.
3. What is coming, without dates it cannot keep.
4. For developers: what is genuinely interesting here — the per-turn stem architecture and
   why it exists, the measured billing rate that differs from the vendor's published one,
   CloudFormation DNS with the zone as a parameter, and the agent-governance experiment.
   Then setup, moved **below** this, with the `pre-commit` warning intact.
5. Contact: `hello@toldstraight.com`.
6. A dated `Last updated:` marker so staleness is visible.

**B. Repository description.** One sentence, via `gh repo edit --description`. Not the
README's first line repeated. Propose it in the PR body so the maintainer can veto in one
command.

**C. Topics**, via `gh repo edit --add-topic`. Only what is true. Candidates:
`podcast`, `text-to-speech`, `elevenlabs`, `audio-pipeline`, `python`, `adhd`. Justify each in
one clause; drop any you cannot.

**D. Badges — apply §0a strictly.** A CI-status badge reporting `quality.yml` on `main` is
true and self-updating. A licence badge is fine **only after** you verify what the licence
actually is (`gh repo view --json licenseInfo` currently reports `Other`, which may mean the
`LICENSE` file is not what a badge would claim). **No tests badge** — `Tests (pipeline)` is
not a required check, so it would overstate what is enforced. Name in the PR what you rejected
and why.

**E. The §4C mechanism.** Add one line to `AGENTS.md` § "Definition of done": a PR that closes
the last open issue in a milestone also refreshes the README status section and its
`Last updated:` date. Checkable with:

```fish
gh api repos/Jared-Godar/audio-lab/milestones --jq '.[] | select(.open_issues==0) | .title'
```

Keep it to one line. This is a rule, not an essay.

**F. `CHANGELOG.md`** entry, and a § Findings note only if you learn something not visible in
the diff.

## 5. Execution rails

**Step 1 — Sync and branch.** `git fetch`; confirm `git log --oneline main..origin/main` is
empty; branch from `main`.

**Step 1b — Continuity walkthrough** immediately after branching, refreshed at PR-open, no
`⟨slot⟩` left unfilled.

**Step 2 — Measure everything in §2 and paste the output** before writing prose.

**Step 3 — Write.** Then read it back as each audience in turn and say in the PR body what you
cut. A README nobody finishes is worse than the setup document it replaced.

**Step 4 — `gh repo edit`** for description and topics only, then read back with
`gh api repos/Jared-Godar/audio-lab --jq '{description,topics}'` and paste it.

**Step N+1 — Commit, gating on the committed state.** `pre-commit run --all-files` green.

**Step N+2/N+3 — Push and open the PR** per §6.

## 6. PR metadata (all at creation time)

`Closes #58` · assignee `Jared-Godar` · labels `type: docs`, `area: governance`,
`priority: medium` · **no milestone**. Verified by `gh pr view --json` read-back, never
inferred from the create command.

## 7. Numbered acceptance criteria

1. `README.md` opens with what the show is, in language a non-developer finishes.
2. Every date, count and status is **measured this session**, with the commands pasted.
3. **Nothing implies the episode is listenable** — state explicitly in the PR that you checked
   this, and quote the sentence that comes closest to the line.
4. Developer section present and genuinely interesting; setup below it; `pre-commit` warning
   intact — quote it from the new file to prove it survived.
5. `hello@toldstraight.com` present.
6. Repository `description` and `topics` set; read-back pasted. `homepage` still empty.
7. Badges: each one justified, each rejected one named. No tests badge.
8. `AGENTS.md` § "Definition of done" gains the one-line milestone trigger.
9. `has_wiki` recommendation surfaced in the PR body, **not acted on**.
10. **Rendered view checked on GitHub**, not just source — headings, tables, links. Say how you
    checked.
11. `pre-commit run --all-files` green; CI green.
12. Spec copied verbatim to `prompts/20260727-issue-58-readme-rewrite.md`.
13. CHANGELOG entry.
14. Everything deliberately omitted named in the PR body.

## 8. Non-goals

- Not a website, not a header image or logo (#60), not publishing anything.
- Not restructuring the repository or renaming directories.
- Not changing `has_wiki`, visibility, merge settings, or branch protection.
- Not touching `ROADMAP.md`, `CHANGELOG.md` beyond its entry, or the episode assets.
- Not marketing copy: no hype, no impact claims, no emoji-per-heading.

## 9. Verification status of this spec's claims

- **Measured by the PM 2026-07-27:** README line count and first three lines; the empty
  `description`/`topics`/`homepage`; `has_wiki: true`; first commit 2026-07-22; repo created
  2026-07-23; domain registered 2026-07-26.
- **Stated but not re-measured at spec time:** milestone counts, stem count, master duration —
  **which is exactly why §2 tells you to measure them yourself.**
- **Unverified:** what licence `LICENSE` actually grants. `gh repo view` reports `Other`;
  confirm before any licence badge.

## 10. References

- **#58** — the issue, including §4A content shape and the §4B truthfulness constraint
- **#60** — the visual identity work; the README header comes from there, not here
- **#30** §4 — why a tests badge would overstate enforcement
- **#8** — the label taxonomy gap noted when filing #60
- `README.md`, `ROADMAP.md`, `CHANGELOG.md`, `episodes/cast.json`
- `artifacts/specs/TEMPLATE.md` — this spec is authored from that template
- `AGENTS.md` § "The artifact is not the behavior" · § "Definition of done"
- Authored by the PM thread 2026-07-27 after the maintainer chose §4C option 1 and added the
  description/topics/badges scope.
