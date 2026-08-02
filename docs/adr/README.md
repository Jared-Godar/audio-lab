# Architecture decision records

Decisions already made, whose consequences reach forward, one file per decision.
Re-litigating them is usually wrong; forgetting them is worse. Each record states its
context, the decision verbatim where the deciding text exists, what it constrains, and
what would have to be true to reverse it. The template is [`TEMPLATE.md`](TEMPLATE.md).

**The principle that keeps this directory and `ROADMAP.md` from becoming each other:
a decided thing is an ADR; an undecided thing is roadmap.** Open questions live in
`ROADMAP.md` § "Open decisions". When one closes, it moves here as a new ADR and the
roadmap entry is replaced by a one-line pointer. ADR 0014 is the first decision to make
that trip.

## Index

| ADR | Title | Status | Date | Constrains |
| --- | --- | --- | --- | --- |
| [0001](0001-route53-zone-as-parameter.md) | Route 53 auto-creates the hosted zone → CloudFormation manages records, not zones | accepted | 2026-07-26 | M5 |
| [0002](0002-elevenlabs-bills-at-055x.md) | ElevenLabs bills at 0.55× the advertised rate | accepted | not recorded | M2, M3, M4 |
| [0003](0003-library-voices-work-without-adding.md) | Library voices work without being added to the account | accepted | not recorded | M2 |
| [0004](0004-one-professional-voice-clone-slot.md) | One Professional Voice Clone slot | accepted | not recorded | M4 |
| [0005](0005-enforce-admins-on-main.md) | `enforce_admins: true` on `main` | accepted | not recorded | everything |
| [0006](0006-branch-protection-stays-strict.md) | Branch protection stays as-is — audio-lab is deliberately stricter (#31) | accepted | 2026-07-27 | everything downstream of the merge workflow |
| [0007](0007-descriptive-artifact-names.md) | Descriptive artifact names, cache identity in a manifest | accepted | 2026-07-26 | M1, M3 |
| [0008](0008-no-free-tier-credits.md) | No Free Tier credits exist — Identity Center is free to enable | accepted | 2026-07-26 | M5 |
| [0009](0009-dot-fm-costs-122.md) | `.fm` costs $122/yr | accepted | not recorded | M6, branding |
| [0010](0010-spf-softfail-mandatory.md) | SPF must stay `~all` because Apple string-matches the record it issues | accepted | 2026-07-27 | M5 |
| [0011](0011-icloud-mail-over-workmail-ses.md) | iCloud+ chosen over WorkMail and over SES-plus-Lambda | accepted | 2026-07-27 | M5 |
| [0012](0012-per-turn-stems.md) | Per-turn stems over a monolithic render, because the host track is temporary | accepted | 2026-07-27 | M4 |
| [0013](0013-classic-branch-protection-signed-commits-declined.md) | Classic branch protection retained over Rulesets; signed commits declined | accepted | 2026-07-27 | repo governance |
| [0014](0014-eleven-v3-default-multilingual-v2-case-by-case.md) | `eleven_v3` is the default model; `multilingual_v2` stays available case-by-case | accepted | 2026-07-28 | **M3** |
| [0015](0015-wordmark-dual-lockup-system.md) | The wordmark system is a dual lockup, not a single primary | accepted | 2026-07-28 | M1, M5 |
| [0016](0016-favicon-readme-header-and-card-surfaces.md) | The favicon set, README header, and social/OG cards are decided, and only two of them theme-switch | accepted | 2026-07-28 | M5 |
| [0017](0017-ivc-patch-tool-config.md) | Host-line patches render with IVC "Jared 1.0" on `eleven_multilingual_v2` | accepted | 2026-07-29 | M4 |
| [0018](0018-cast-card-portrait-standard.md) | The colour cartoon portrait is the cast-card image standard, across all episodes | accepted (amended by 0019) | 2026-07-30 | M4, M7 |
| [0019](0019-coming-soon-design-and-human-machine-register.md) | Real cast are photographed, synthetic cast stay cartoons; the Coming Soon page is a field-notice with a declassify countdown | accepted | 2026-07-31 | M5, M7 |
| [0020](0020-post-merge-site-deploy-is-pre-authorised.md) | Publishing `site/` after a confirmed merge is pre-authorised, and CI performs it | accepted | 2026-08-01 | M5, M10 |
| [0021](0021-timestamp-prefix-is-mandatory-and-second-granular.md) | Generated documents, scripts and walkthroughs carry a mandatory `YYYYMMDDHHmmss` prefix | accepted | 2026-08-01 | M10 |
| [0022](0022-approved-target-file-structure.md) | The repository's target file structure is nine tracked top-level directories, decided at gate 1 | accepted | 2026-08-02 | M5, M10 |

Dates marked *not recorded* were never dated in the migrated `ROADMAP.md` entries;
inventing one after the fact would be worse than the gap.

## How new decisions get captured — prose, enforced by nothing

A PR that records or changes a decision is expected to add or update an ADR here. That
expectation lives in two places: a line in `AGENTS.md` § "Definition of done" and a
checkbox in `.github/pull_request_template.md`. **Both are prose. Neither is a gate.**
Nothing rejects a PR that records a decision without writing an ADR — and
`gh pr create --body-file` bypasses the PR template entirely, so the checkbox is never
even seen by an agent-authored PR unless the body includes it deliberately. If this
habit fails often enough to matter, a mechanism is a separate issue; presenting this
paragraph as enforcement would be the artifact-is-not-the-behavior failure this
repository has recorded four instances of.
