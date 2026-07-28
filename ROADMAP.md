# Roadmap

Where this project is, where it's going, and — most usefully — **which decisions
already constrain the ones ahead**. Working notes, not decision briefs.

Update this when a milestone moves or a decision lands. Findings about external
services still go to `CHANGELOG.md` under **Findings**; durable operating detail
goes to `docs/`.

Last updated: 2026-07-28

---

## Where we are

**"Told Straight"** is a season-per-topic deep-dive podcast — BLUF, data-driven,
strict truth on complex matters, deliberately positioned against do-your-own-research
culture. Season 1 is adult ADHD. Two episodes exist in a fully-synthetic v1 and are
being rebuilt as a **hybrid**: Jared hosting in his own voice, with an AI co-host.

Ep01 (9:34) and Ep02 (12:23) are published to a private feed. Both episodes' assets
are in-repo; audio and video stay outside git by convention. **Ep02's assets were
absent from the repository until 2026-07-27** — the initial commit `f9e662a`, named
"episodes 1 and 2", contained only Ep01, and this claim was false for four days until
issue #64 corrected it. Ep02 also carries a `cast/` folder of personnel-file cards
that Ep01 does not.

**Done so far:** ElevenLabs cost tiers and a measured billing model, three real bugs
fixed in the audition pipeline, descriptive artifact naming, lean CI, branch
protection, `AGENTS.md`, and `toldstraight.com` registered.

---

## Milestones

### M1 — Tooling foundation

Extract a shared `core/` (ElevenLabs-native, since edge-tts and Kokoro are out),
archive the v1 applet to `archive/audition-v1/` by folder move, and add shared voice
library browsing.

- **Complete** — landed in PR #29 (on `main` @ `befb3e2`): `pipeline/core/` extracted,
  `audition-v1` archived by folder move, shared-library browsing added.
- Archive happened as step one of the extraction, so there was never a window with no
  working tool.

### M2 — Casting (Round I)

Three-stage funnel: free preview sweep → paid screen test on real script lines →
blind head-to-head → cast and pin voice IDs.

- Blocked by: nothing — M2 is complete (below). Its original blockers are both
  resolved: M1 landed in PR #29, and the model bake-off is decided
  ([ADR 0014](docs/adr/0014-eleven-v3-default-multilingual-v2-case-by-case.md)).
- Cost: ~4,400 credits. The sweep stage is free.
- **Stage one (free preview sweep) — complete** (#7): 12 candidates on disk in
  `artifacts/voice-previews/`.
- **Stage two (paid screen test) — complete** (#38, PR #39): the top-5-by-adopters
  shortlist plus the premade-Daniel control read three real Ep01 EXPERT lines
  (dense-stat / warm aside / emotional handoff) on `eleven_v3` @ 192 kbps. 18 renders
  under `output/auditions/samples/elevenlabs/`, each folder self-describing with a
  digest manifest carrying `voice_id`, line, chars, and measured credits. **Spend:
  1,758 credits measured from `/v1/history` vs a 1,762 estimate (Δ −4, pure
  per-generation rounding — the 0.55× rate holds exactly).** The control rendered
  through the same voice_id and path as the #10 bake-off, so the render path is sound;
  the aural judgement (which candidates survive) is the maintainer's, next.
- **Stage three (blind head-to-head) — superseded by a direct maintainer pick, not
  run** (#40). The maintainer picked Jofra directly from the stage-two renders on
  2026-07-27 rather than reporting a thin field, so the reversal condition — fewer
  than two of the five surviving (#38 §3) — never fired, and the remaining seven
  candidates were deliberately not screened.
- **Cast pinned — M2 complete** (#40): **Jofra – Expressive & Neutral Narrator**
  (`NuRyEq0OdD9mMOyd51UZ`), a shared-library voice that consumes neither a general
  voice slot nor the Professional Voice Clone slot, recorded in `episodes/cast.json`
  with a loader in `pipeline/core/cast.py` so M3 and M4 read one source of truth
  instead of an issue comment.

### M3 — Tuning app (Phase II)

Dial/markup app that persists tuned settings back to the cast record.

- **Unblocked — architecture decided 2026-07-28**
  ([ADR 0014](docs/adr/0014-eleven-v3-default-multilingual-v2-case-by-case.md)):
  `eleven_v3` is the default, so this is a **markup editor with live preview**, not a
  mixing board — v3 accepts `style`/`speaker_boost` with HTTP 200 and discards them,
  and is expressive via inline audio tags instead. `multilingual_v2` stays available
  case-by-case, and the editor must not foreclose rendering a line or episode on it.
- If a `multilingual_v2` slider path is ever taken under 0014's exception: full
  mixing-board feel needs a pre-rendered parameter grid; ~3,400 credits per voice for
  a 5×5 grid over two dials.

### M4 — Episodes v2

Rewrite Ep01/Ep02 into the hybrid format, record host lines, render, republish.

- Blocked by: M2 (voices), M3 (settings).
- The record-host/record-guest scaffolding already exists in the working copies.
- Publish as staged v2 first; do not overwrite the live feed until heard end to end.
- **Ep01 v2.0 interim render — built and rendered 2026-07-27 (#43).**
  `pipeline/core/episode.py` renders the transcript as **54 per-turn stems** on
  `eleven_v3` @ 192 kbps — Daniel (host) reads the 27 HOST turns, Jofra (co-host) the 27
  EXPERT turns (character **Owen**) — read from `episodes/cast.json`, then assembles a
  single master via `ffmpeg` with a 350 ms inter-turn gap. Per-turn stems are the point:
  the host is a **placeholder** for the maintainer's own narration (#44), so swapping it
  re-renders only the 27 host turns (~1,163 credits), not a second full pass. `uv run
  voicelab render-episode` is dry-run by default; spending needs `--confirm-spend`, and a
  batch over the 2,000-credit self-serve threshold needs an explicit, auditable
  `--authorize-ceiling`. Speaker labels dropped the TTS voice id from the transcript
  (`HOST (bm_fable)` → `HOST`, `EXPERT (Emma)` → `EXPERT (Owen)`) across `.md`/`.txt`/
  `.html`. Still ahead: record the real host lines and rebuild the host track; Ep02.
- **Ep01 v2.0 mastering chain baked into `render-episode` — 2026-07-27 (#46).**
  `render-episode --assemble` now produces a finished master, not a raw concat:
  per-speaker loudness match → structure-aware gaps (chapter/interjection/normal) →
  high-pass + gentle compression → 1.08× tempo → −16 LUFS. Approved by A/B this session;
  the real master regenerates from the cached stems at −16.4 LUFS with the Daniel/Jofra
  gap closed 2.0 → 0.0 dB. Each step is flag-overridable so Ep02 can be tuned, not
  re-derived.

### M5 — Web presence

AWS Identity Center, DNS, static site at `toldstraight.com`, all IaC after
registration.

- Blocked by: nothing. Unblocked 2026-07-26 — no Free Tier credits exist to lose.
- `toldstraight.com` registered 2026-07-26, $16/yr, auto-renew on.
- **DNS security records — deployed 2026-07-27** (#22): SPF, null MX, DMARC `p=reject`,
  and CAA restricting issuance to `amazon.com`, via CloudFormation stack
  `toldstraight-dns` (change-set, `CREATE_COMPLETE`) into the pre-existing zone
  `Z09608783EP48AD8RCAL5`. The zone stays a **parameter**, never a stack resource. The
  apex + `vote` **site records remain gated off** (`DeploySiteRecords=false`) — nothing
  to point them at yet. Mail is locked hard: nothing can send as this domain until the
  records change.
- **Mail on iCloud+ — deployed 2026-07-27** (#54): the #22 lockdown was deliberately,
  partially undone so the domain can host mailboxes. Null MX → iCloud's `mx01`/`mx02`;
  SPF → `include:icloud.com ~all`; Apple's `apple-domain=` token and a `sig1._domainkey`
  DKIM CNAME added. **DMARC `p=reject` with strict alignment and CAA are unchanged** — the
  anti-spoofing guarantee was narrowed from "no sender" to "exactly one sender", not traded
  away. Two change-sets on `toldstraight-dns`, both `UPDATE_COMPLETE`. Cost **$0 marginal**
  (iCloud+ Custom Email Domain on an existing tier), chosen after WorkMail was found
  discontinued mid-issue. **`~all` is mandatory, not a weakening by preference** — Apple's
  verifier string-matches the value it issues and rejects the stricter `-all`.
- Owed follow-ups from #54, tracked so they are not lost: **raise the three mail records'
  TTLs from 300 back to 3600** once mail is confirmed working, **paste the live
  `AudioLabSiteInfra` v4 / `AudioLabMail` v1 JSON** into `infra/README.md` (the deploy role
  cannot read IAM, so an executor cannot), and **trim `AudioLabMail`'s dead WorkMail /
  Directory Service statements** (a maintainer console action). Optionally add a
  same-domain DMARC `rua=` now that a mailbox on this domain exists.
- Still ahead in M5: the static site (S3 + CloudFront + ACM), then the apex/vote records
  switched on with real targets.

### M6 — Community applet

`vote.toldstraight.com` — let friends, then listeners, weigh in on voices.

- Blocked by: M5, and by having something worth voting on.
- Separate architecture from the two terminal apps: multi-user, hosted, no API key
  client-side.

---

## Decisions and what they constrain

The decision records moved to [`docs/adr/`](docs/adr/) (#62) — one file per decision,
with context, the deciding text verbatim, consequences, and a reversal condition —
because this section had become an ADR log inside a document whose job is sequencing
work. The index below preserves the milestone linkage; if within a month it has drifted
from the ADRs it lists, drop the table and keep only the pointer — a stale index is
worse than no index.

| ADR | Decision | Constrains |
| --- | --- | --- |
| [0001](docs/adr/0001-route53-zone-as-parameter.md) | Route 53 auto-creates the hosted zone → CloudFormation manages records, not zones | M5 |
| [0002](docs/adr/0002-elevenlabs-bills-at-055x.md) | ElevenLabs bills at 0.55× the advertised rate | M2, M3, M4 |
| [0003](docs/adr/0003-library-voices-work-without-adding.md) | Library voices work without being added to the account | M2 |
| [0004](docs/adr/0004-one-professional-voice-clone-slot.md) | One Professional Voice Clone slot | M4 |
| [0005](docs/adr/0005-enforce-admins-on-main.md) | `enforce_admins: true` on `main` | everything |
| [0006](docs/adr/0006-branch-protection-stays-strict.md) | Branch protection stays as-is — deliberately stricter than the portfolio (#31) | everything downstream of the merge workflow |
| [0007](docs/adr/0007-descriptive-artifact-names.md) | Descriptive artifact names, cache identity in a manifest | M1, M3 |
| [0008](docs/adr/0008-no-free-tier-credits.md) | No Free Tier credits exist — Identity Center is free to enable | M5 |
| [0009](docs/adr/0009-dot-fm-costs-122.md) | `.fm` costs $122/yr | M6, branding |
| [0010](docs/adr/0010-spf-softfail-mandatory.md) | SPF must stay `~all` — Apple string-matches the record it issues | M5 |
| [0011](docs/adr/0011-icloud-mail-over-workmail-ses.md) | iCloud+ over WorkMail and over SES-plus-Lambda | M5 |
| [0012](docs/adr/0012-per-turn-stems.md) | Per-turn stems over a monolithic render | M4 |
| [0013](docs/adr/0013-classic-branch-protection-signed-commits-declined.md) | Classic branch protection over Rulesets; signed commits declined | repo governance |
| [0014](docs/adr/0014-eleven-v3-default-multilingual-v2-case-by-case.md) | `eleven_v3` default; `multilingual_v2` available case-by-case | M3 |

---

## Open decisions

The model bake-off (`eleven_v3` vs `eleven_multilingual_v2`) was decided 2026-07-28 —
see [ADR 0014](docs/adr/0014-eleven-v3-default-multilingual-v2-case-by-case.md).

### Label taxonomy refinements

Four proposed, none applied: drop `priority:` for a single `priority: next`; drop or
document `type: task` as the null default; add `type: research`; rename
`area: governance` → `area: repo`. Add `area: web` when M6 exists.

---

## Owed

Asked for and not delivered:

1. Domain registration guide (Route 53 + CloudFormation walkthrough).
2. ~~`infra/` CloudFormation templates.~~ Delivered — `infra/dns.yaml` + `infra/README.md`
   (#13), authored and validated but not deployed.
3. TUI vs local-web decision brief for the casting and tuning apps.
4. ~~The `archive/audition-v1/` move — folded into M1.~~ Done — landed in PR #29.
5. The four label changes above.

## Housekeeping

- An empty probe commit `f72daa4` sits on `main` — an agent error. Removing it needs
  protection temporarily relaxed. Cosmetic, but it is a public repo.
- `prompts/told-straight-v2-pm-seed.md` contains stale claims, preserved deliberately
  as immutable. Corrections live in `CHANGELOG.md`.
- `.show`, `.co`, `.studio`, `.news`, `.media`, `.pub` domain availability was never
  verified — controls failed on those registries.
