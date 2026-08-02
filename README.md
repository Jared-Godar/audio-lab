<picture>
  <source media="(prefers-color-scheme: dark)"
          srcset="brand/web/20260728-adobe-illustrator-toldstraight-readme-header-b-dark-1280x400.png">
  <img src="brand/web/20260728-adobe-illustrator-toldstraight-readme-header-b-oneline-1280x400.png"
       alt="Told Straight — Dept. of Neurodevelopmental Affairs. Season One: Adult ADHD."
       width="1280">
</picture>

# audio-lab

The workshop behind **Told Straight** — the pipeline that renders the show, the
transcripts and art that ship with it, and the infrastructure it runs on.

[![Quality gates](https://github.com/Jared-Godar/audio-lab/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/Jared-Godar/audio-lab/actions/workflows/quality.yml?query=branch%3Amain)
[![Full-history secret scan](https://github.com/Jared-Godar/audio-lab/actions/workflows/full-history-scan.yml/badge.svg)](https://github.com/Jared-Godar/audio-lab/actions/workflows/full-history-scan.yml)

---

## Told Straight

A season-per-topic podcast that takes one complicated subject and covers it
properly: bottom line up front, every claim sourced to peer-reviewed literature,
dark humour, no woo. It exists because "do your own research" mostly means reading
whatever ranks well. This is the opposite of that, done out loud.

**Season 1 is adult ADHD.** Episode 1, *Membership Has Requirements*, is an
orientation for someone who has just been diagnosed — roughly 74% heritable,
described in the medical literature since 1775, genuinely dangerous untreated, and
one of the most treatable conditions in psychiatry. A host and an expert who has it
too walk through what the evidence actually says. Orientation, not medical advice.

## Where this is — 2026-07-29

Five days old, built in public, one decision at a time.

| | |
| --- | --- |
| First commit | 2026-07-22 |
| Repository made public | 2026-07-23 |
| `toldstraight.com` registered | 2026-07-26 |
| Mail live at `hello@toldstraight.com` | 2026-07-27 — SPF, DKIM and DMARC `p=reject` |
| Episode 1 rebuilt | 2026-07-27 — 54 per-turn stems, a 10:29 master |

**Nothing here is published, and that is not a soft "not yet".** There is no public
feed, no player and no link. The finished episode masters — audio and video — are
tracked here as of 2026-08-02; working audio (auditions, stems, test renders) stays in
the gitignored `output/`. Until that change every `.mp3` and `.mp4` was ignored, which
left the masters as files on one laptop and nowhere else.
An earlier fully-synthetic v1 of two episodes sits on a *private* feed (`ROADMAP.md`);
the rebuild is on no feed whatsoever. `toldstraight.com` serves DNS and mail and
nothing else — the apex deliberately has no `A` record, because there is nothing yet
to point it at.

What does exist, and can be read right now: the episode 1
[transcript](episodes/ToldStraight-Ep01/transcript.md) and
[show notes](episodes/ToldStraight-Ep01/show-notes.md), with every claim DOI-linked.

**And the part the issue tracker was quietly overstating: 31 of this repository's 51
issues are not project work.** They exist because a coding agent did not follow
guardrails that were already in place, asserted something false, or left work
half-finished — and the maintainer had to spend his time getting it corrected. On
2026-07-29 every issue was audited against that criterion and the 31 were moved to a
milestone that says so, **M0 — Extra remediation effort unrelated to project goals**
(#85). Before that they sat under the project's own milestones, where milestone
completion read as progress on the show. The full table, one line of reasoning per
issue, is at [`docs/20260729-m0-remediation-audit.md`](docs/20260729-m0-remediation-audit.md).
An honest ledger showing that ratio is worth more than a clean one that hides it.

**M0 was closed out on 2026-07-30** — 36 issues total, ending with a deliberate
consolidation of the governance surface itself (#94: three contract files rewritten
into a six-rule core, both enforcement hooks removed by recorded decision) and the
DMARC telemetry gap (#59). Whether the remediation share actually falls now that the
apparatus is smaller is the open question the ledger will answer.

## What is coming

In rough order, and without dates it cannot keep:

- Replace the interim synthetic host with the maintainer's own narration. This is
  the whole reason episodes render as per-turn stems.
- Episode 2, rebuilt the same way.
- A static site at `toldstraight.com`, and then a public feed.
- `vote.toldstraight.com`, so listeners get a say in the voices.

`ROADMAP.md` has the full picture. The decisions that already constrain the ones
ahead each have their own record under [`docs/adr/`](docs/adr/), and the
operational procedures live in [`docs/runbook.md`](docs/runbook.md).

---

## For developers

Four things here are more interesting than the average side project.

### Episodes render as per-turn stems, not as one file

Episode 1 is 54 separate renders — one per speaking turn — assembled by `ffmpeg`.
That looks wasteful until you know the host voice is a placeholder for real
narration: swapping it re-renders 27 stems (~1,163 credits), not a second full pass.
The mastering chain is baked into the same command rather than living in someone's
head — per-speaker loudness match, structure-aware gaps, high-pass and gentle
compression, 1.08× tempo, normalised to −16 LUFS. Every step is flag-overridable so
episode 2 can be tuned instead of re-derived.

### The billing rate is measured, not read off the price list

ElevenLabs publishes a `character_cost_multiplier` per model. This account bills at
**0.55×** that — derived from `/v1/history`, not assumed, and re-derivable at any
time with `uv run voicelab rates`. Every budget in this repository uses the measured
number, which roughly halves them.

Related, and the more expensive lesson: **a 200 is not a result.** `eleven_v3`
accepts `style` and `speaker_boost` and then silently discards them.
`uv run voicelab models` prints each model's real capability flags.

### The DNS zone is a CloudFormation parameter, never a stack resource

Registering through Route 53 auto-creates a hosted zone, pre-wired to the domain's
nameservers. If a stack owned that zone, `delete-stack` would destroy it, and
recreating it mints four new NS records the registrar no longer publishes — the
domain goes dark until nameservers are repointed by hand. So `infra/dns.yaml` takes
`HostedZoneId` as a **parameter** and manages record sets inside it, which makes
stack deletion survivable.

Two things in there look like defects and are load-bearing, each commented at the
line: SPF ends `~all` rather than the stricter `-all`, because Apple's domain
verifier string-matches the value it issues instead of evaluating SPF; and two
logical ids are misnamed on purpose, because renaming one is a delete-plus-create
against a live DNS record.

### The agent contract is deliberately small, and says what enforces it

`AGENTS.md` and `CLAUDE.md` are binding instructions for the coding agents that do
most of the work here. The repository once ran two enforcement hooks — a
`PreToolUse` lane guard and a per-turn contract-reinjection digest — and removed
both by recorded decision (#94, 2026-07-30): they constrained accident rather than
intent, and their measured cost exceeded their compliance yield. What remains is a
consolidated six-rule contract that states plainly which parts are mechanism (CI
gates, branch protection) and which are prose enforced by nothing. Nearly every rule
exists because a specific failure happened first; `CHANGELOG.md` records which.

---

## Working in this repo

### Setup — do this first in a fresh clone

```fish
uvx --from pre-commit==4.6.0 pre-commit install
```

**Required, and easy to miss.** `.pre-commit-config.yaml` being tracked does *not*
install anything — without this command every local hook is inert, including
`gitleaks`, `detect-private-key`, and the `no-commit-to-branch` guard on `main`.
CI still runs them, but only after a secret has already entered local history.

Verify it took, in both directions:

```fish
test -f .git/hooks/pre-commit; and echo installed; or echo MISSING
git switch main; and git commit --allow-empty -m "should be blocked"   # must refuse
```

The second command should fail with `don't commit to branch ... Failed`. A hook that
is installed but not proven to block is a hook you have not tested.

`ELEVENLABS_API_KEY` is read from the environment — never a file, never in code.

### The CLI

```fish
cd pipeline
uv run voicelab models          # models, rates, tiers, capability flags
uv run voicelab rates           # re-derive real billing from /v1/history
uv run voicelab account         # voices on the account
uv run voicelab browse          # the shared voice library
uv run voicelab screentest      # render a shortlist on real episode dialogue
uv run voicelab render-episode  # per-turn stems, then the mastered assembly
```

Anything that spends credits is **dry-run by default**. Spending needs
`--confirm-spend`, and a batch above the self-serve threshold needs an explicit,
auditable `--authorize-ceiling`.

### Layout

| | |
| --- | --- |
| `pipeline/` | the `voicelab` CLI — ElevenLabs client, casting, episode render and mastering |
| `episodes/` | *Told Straight* deliverables: transcripts, show notes, art, `cast.json`, and the finished audio and video masters. Working audio stays in the gitignored `output/` |
| `infra/` | CloudFormation for `toldstraight.com` DNS and mail |
| `docs/` | durable findings — [decision records](docs/adr/), [the ops runbook](docs/runbook.md), [ElevenLabs operating notes](docs/elevenlabs.md), [voice capture](docs/voice-capture.md) |
| `spotify/` | a listening-data scaffold: a `spotipy` dependency and a 2022 export in `data/`. No analysis written yet |
| `prompts/` | the specs agent sessions are handed, kept immutable after handoff |
| `fish/`, `scripts/` | shell helpers and repository automation |
| `archive/` | retired tools, kept whole rather than deleted |

`artifacts/` and `output/` are gitignored working zones. `CHANGELOG.md` records every
change and, under **Findings**, the things learned about external services that are
not visible in a diff.

## Licensing

Two licences, split by what the file is:

- **Software, tooling, configuration** — MIT (`LICENSE`). Reuse freely with attribution.
- **Episode content** under `episodes/` (transcripts, show notes, artwork, captions,
  alt text for *Told Straight*) — **all rights reserved** (`episodes/LICENSE`). Not
  licensed for reuse, redistribution, or modification.

A bare root MIT would have licensed the show's content for commercial redistribution;
the split prevents that.

## Contact

`hello@toldstraight.com`

---

**Last updated: 2026-07-30.** The status section above is refreshed by the pull
request that closes a milestone's last open issue — see `AGENTS.md`
§ "Definition of done".
