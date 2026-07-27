# Roadmap

Where this project is, where it's going, and — most usefully — **which decisions
already constrain the ones ahead**. Working notes, not decision briefs.

Update this when a milestone moves or a decision lands. Findings about external
services still go to `CHANGELOG.md` under **Findings**; durable operating detail
goes to `docs/`.

Last updated: 2026-07-26

---

## Where we are

**"Told Straight"** is a season-per-topic deep-dive podcast — BLUF, data-driven,
strict truth on complex matters, deliberately positioned against do-your-own-research
culture. Season 1 is adult ADHD. Two episodes exist in a fully-synthetic v1 and are
being rebuilt as a **hybrid**: Jared hosting in his own voice, with an AI co-host.

Ep01 (9:34) and Ep02 (12:23) are published to a private feed. Assets are in-repo;
audio is gitignored.

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

- Blocked by: M1, and **the model bake-off** (see Open decisions).
- Cost: ~4,400 credits. The sweep stage is free.
- **Stage one (free preview sweep) — complete** (#7): 12 candidates on disk in
  `artifacts/voice-previews/`.
- **Stage two (paid screen test) — complete** (#38, PR ⟨PR⟩): the top-5-by-adopters
  shortlist plus the premade-Daniel control read three real Ep01 EXPERT lines
  (dense-stat / warm aside / emotional handoff) on `eleven_v3` @ 192 kbps. 18 renders
  under `output/auditions/samples/elevenlabs/`, each folder self-describing with a
  digest manifest carrying `voice_id`, line, chars, and measured credits. **Spend:
  1,758 credits measured from `/v1/history` vs a 1,762 estimate (Δ −4, pure
  per-generation rounding — the 0.55× rate holds exactly).** The control rendered
  through the same voice_id and path as the #10 bake-off, so the render path is sound;
  the aural judgement (which candidates survive) is the maintainer's, next.
- **Stage three (blind head-to-head) — pending** the maintainer's listen. Reversal
  condition on the shortlist: if fewer than two of the five survive, screen the
  remaining seven before trusting the adopter-count proxy (#38 §3).

### M3 — Tuning app (Phase II)

Dial/markup app that persists tuned settings back to the cast record.

- **Blocked by the model decision** — its entire architecture depends on it.
- Full mixing-board feel needs a pre-rendered parameter grid; ~3,400 credits per
  voice for a 5×5 grid over two dials.

### M4 — Episodes v2

Rewrite Ep01/Ep02 into the hybrid format, record host lines, render, republish.

- Blocked by: M2 (voices), M3 (settings).
- The record-host/record-guest scaffolding already exists in the working copies.
- Publish as staged v2 first; do not overwrite the live feed until heard end to end.

### M5 — Web presence

AWS Identity Center, DNS, static site at `toldstraight.com`, all IaC after
registration.

- Blocked by: nothing. Unblocked 2026-07-26 — no Free Tier credits exist to lose.
- `toldstraight.com` registered 2026-07-26, $16/yr, auto-renew on.

### M6 — Community applet

`vote.toldstraight.com` — let friends, then listeners, weigh in on voices.

- Blocked by: M5, and by having something worth voting on.
- Separate architecture from the two terminal apps: multi-user, hosted, no API key
  client-side.

---

## Decisions and what they constrain

The point of this section: each entry is a decision already made whose consequences
reach forward. Re-litigating them is usually wrong; forgetting them is worse.

### Route 53 auto-creates the hosted zone → CloudFormation manages records, not zones

Registering through Route 53 creates a hosted zone automatically, pre-wired to the
domain's nameservers.

**Constrains M5:** `infra/` templates take `HostedZoneId` as a **parameter** and
manage `RecordSet`s inside it. The zone stays outside CloudFormation.

**Why it matters:** if a stack owned the zone, `delete-stack` would destroy it, and
recreation mints four new NS records that no longer match what the registrar
publishes — the domain goes dark until nameservers are manually repointed. Keeping
the zone out makes stack deletion survivable. Cost: $0.50/month.

### ElevenLabs bills at 0.55× the advertised rate

Measured, not documented. Real ceiling is ~237k characters/month of production
audio, not the 130,552 credit figure.

**Constrains M2/M3/M4:** budgets roughly halve. A full rebuild — casting, three
draft passes, two masters — lands near 38,000 credits. Re-verify with
`uv run audition --check-rates` if anything looks off.

### Library voices work without being added to the account

Confirmed by synthesizing with a voice whose `is_added_by_user` was false. Every
library voice also ships a **free** `preview_url`.

**Constrains M2:** the 30-slot voice cap and 95 add/edit budget are *not* limits on
auditioning. Round I screening is free and unbounded — filter, page, play previews,
spend nothing until the shortlist reads real script lines.

### One Professional Voice Clone slot

`professional_voice_limit: 1`. Instant cloning is unlimited within 30 slots and
costs no credits.

**Constrains M4:** record host lines live, build an **Instant** clone from those
takes as a patch tool for one-line fixes. Hold the PVC slot unless cloned-Jared
becomes a primary narrator. See `artifacts/voice-cloning-guide.md`.

### `enforce_admins: true` on `main`

Direct commits are blocked for everyone, Jared included.

**Constrains everything:** if CI breaks, nothing merges until protection is relaxed
in Settings → Branches. Deliberate, but know the escape hatch exists.

### Descriptive artifact names, cache identity in a manifest

`YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE[-BITRATE]`, vendor second.

**Constrains M1/M3:** anything adding a render parameter must extend the manifest
key, never the filename, and never fall back to a hash. Folders too:
`samples/<vendor>/<voice>-<short-id>/`.

### No Free Tier credits exist — Identity Center is free to enable

Checked 2026-07-26 as root: Billing → Credits shows $0.00 remaining, $0.00 used, zero
active credits. AWS's warning that creating an Organization expires Free Tier credits
**permanently** is real but has nothing to consume here. Billing is already live —
the domain purchase transacts on pay-as-you-go — so the Free Plan → Paid Plan upgrade
is a no-op.

**Unblocks M5.** The surviving constraint is not financial: Identity Center is
**Region-locked per organization**. Set the console to `us-east-1` before enabling —
changing it later means deleting the instance and losing every user, group, permission
set, and assignment. `route53domains` and CloudFront certificates both require
us-east-1 anyway.

Note also that IAM users cannot see Billing at all until the root user activates
**IAM user and role access to Billing information** (Billing → Account). That is an
account-level switch, not a policy — `AdministratorAccess` does not bypass it.

### `.fm` costs $122/yr

Route 53 does sell it — the earlier uncertainty is resolved.

**Constrains M6 and branding:** `toldstraight.fm` was skipped as a $610/5yr
redirect. The print/journalism property should be a `.com`, which also fits it
better. `vote.toldstraight.com` is a subdomain, costing nothing.

---

## Open decisions

### The model bake-off — blocks M3's entire architecture

`eleven_v3` vs `eleven_multilingual_v2`. **Identical cost** (both 0.55× effective),
so this is purely a quality call — and it decides whether the tuning app is a
**mixing board** or a **markup editor**:

- `multilingual_v2` honours `style` and `speaker_boost` → continuous dials → sliders.
- `v3` ignores both (accepts them with HTTP 200 and discards them) but is more
  expressive via inline audio tags → a markup editor with live preview.

The existing `transcript-markup.txt` legend is already markup-shaped, which points
at v3; the imagined slider UI points at multilingual_v2.

**To resolve:** listen to the two renders already sitting in
`output/auditions/samples/elevenlabs/daniel-onwK4e9Z/`.

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
