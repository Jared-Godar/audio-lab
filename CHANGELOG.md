# Changelog

Personal recordkeeping for audio-lab. Dated entries, newest first — no releases,
no semver, just what changed and why it mattered.

Grouped as **Added / Changed / Fixed / Findings**. *Findings* is the one that
isn't standard: it records things learned about external services that aren't
visible in the diff and would otherwise evaporate.

## 2026-07-27

### Added

- **Jofra pinned as the Ep01 co-host in a tracked cast record (#40).** The maintainer's
  choice — **Jofra – Expressive & Neutral Narrator**, `NuRyEq0OdD9mMOyd51UZ`, picked
  directly from the 18 stage-two screen-test renders — previously existed only in an
  issue comment. `episodes/cast.json` now names it (role, episode, vendor, voice_id,
  model, output_format, source, `chosen_by`, `chosen_on`, provenance), and
  `pipeline/core/cast.py` loads it into a `Voice` usable directly by the existing
  synthesis path — no downstream caller parses JSON or retypes the id. A missing,
  malformed, or role-not-found `cast.json` fails with a clear message naming the file,
  never a bare `KeyError` (`AGENTS.md` § "Defensively code every external call" applied
  to a file boundary, not just the network). Deliberately does **not** touch
  `pipeline/core/screentest.py`'s candidate list — coupling the casting tool to a cast
  it exists to help choose was out of scope. `ROADMAP.md` § M2 fills the `⟨PR⟩`
  placeholder left on `main` (`#39`), records stage three as **superseded by the direct
  pick, not run** (the §3 reversal condition never fired; the remaining seven
  candidates were deliberately not screened), and marks M2 complete. Also corrects
  `docs/elevenlabs.md:38-39`, which still pointed at the retired `pipeline/audition/`
  path (`uv run audition --check-rates` / `helpers.py`) two PRs after #29 replaced it
  with `pipeline/core/` — now `uv run voicelab rates` / `pipeline/core/models.py`, both
  verified to exist by running them. Zero credits spent: the loader is a local-file
  read, and `uv run pytest` never touches the network.
- **DNS security records deployed for `toldstraight.com` (#22).** M5. The `infra/dns.yaml`
  template authored in #13 is now **live**: SPF (`v=spf1 -all`), null MX (`0 .`), DMARC
  (`p=reject; sp=reject; adkim=s; aspf=s`), and CAA (`issue`/`issuewild` restricted to
  `amazon.com`) — four `AWS::Route53::RecordSet`s written **into** the pre-existing hosted
  zone `Z09608783EP48AD8RCAL5`, which stays a **parameter**, never a stack resource.
  Deployed as CloudFormation stack `toldstraight-dns` via a **change-set** (type `CREATE`),
  never a bare `create-stack`/`deploy`: the change-set was described and confirmed to hold
  **exactly four RecordSet additions and no `AWS::Route53::HostedZone` resource** before
  execution — the zone-ownership trap (an owned zone destroyed on `delete-stack`, four new
  NS records that dark the domain) cannot be sprung by a change-set that provably touches
  no zone. Reached `CREATE_COMPLETE`. Site records (apex + `vote`) stay **gated off**
  (`DeploySiteRecords=false`). Verified two independent directions — `aws route53
  list-resource-record-sets` and a direct authoritative `dig @ns-235.awsdns-29.com` — with
  a `google.com` control returning all four record types through the identical path, and
  negative checks confirming apex `A` and `vote` still resolve to nothing. Cost **$0**
  (RecordSets are free; the zone's $0.50/mo was already billed at registration). Mail is
  now locked hard: nothing can send as this domain until the records change.
  `infra/README.md` records the deployed stack, the exact change-set commands, and the
  rollback (`delete-stack` removes records, not the zone), and gains a **tracked
  AWS-access section** (Identity Center org instance, the `AudioLabDeploy` permission set,
  both customer-managed policies incl. JSON, the `aws configure sso` profile) so a fresh
  clone can reproduce access — porting the operative content out of the two gitignored
  `artifacts/aws-identity-center-*.md` notes, with **no secret committed** (account id and
  role names are configuration; no token, key, or `~/.aws/` contents).
- **Ep01 v2.0 rendered as 54 per-turn stems + a single master (#43).** M4.
  `pipeline/core/episode.py` parses `episodes/ToldStraight-Ep01/transcript.md` into 54
  ordered turns (27 HOST / 27 EXPERT, 9,225 chars — verified against spec §2 as a hard
  gate, not incidental output), renders each as its own stem on `eleven_v3` @ 192 kbps —
  **Daniel** (host) reads the 27 HOST turns, **Jofra** (co-host) the 27 EXPERT turns
  (character **Owen**), both read from `episodes/cast.json` — then concatenates them with
  `ffmpeg` into one **11.5-minute master** (350 ms inter-turn gap). Per-turn stems are the
  deliverable, not just the master: the host is a **placeholder** for the maintainer's own
  narration (#44), so swapping it re-renders only the 27 host turns (~1,163 credits), and a
  single bad turn costs ~40 credits to redo rather than a second full pass. `uv run
  voicelab render-episode` is dry-run by default; spending needs `--confirm-spend`, and a
  batch over the 2,000-credit self-serve threshold hard-stops unless an explicit, auditable
  `--authorize-ceiling` names the cap (a `SpendGate` that refuses both a missing ceiling and
  an estimate above it — proven by a negative test). A digest-manifest cache keyed on turn
  index + voice + text + variant makes a re-run after a mid-batch failure re-bill nothing
  (proven: the completion re-run rendered 0, cached 54, measured 0). **Cost: 5,076 credits
  measured from `/v1/history`** against the 5,074 estimate (Δ +2), inside the 5,600
  authorised ceiling; ledger 128,120 → 123,041 remaining across the session. Stems land
  under `output/episodes/` (gitignored) with turn-index-led descriptive names so a lexical
  sort is playback order, plus a sibling `manifest.json` per turn (index, speaker, role,
  `voice_id`, chars, `credits_est`, `credits_measured`, digest). Control: an episode Daniel
  stem is codec-identical (`mp3/44100/mono/192k`) to the #38 screen-test Daniel render, so a
  broken pipeline and a bad read stay distinguishable. `episodes/cast.json` gains the
  interim `host` role (Daniel `onwK4e9Z`, `interim:true`, `replaced_by` the maintainer's
  narration); the `cast.py` loader needed no change (extra fields ride along in
  `Voice.meta`).

### Changed

- **Ep01 transcript speaker labels drop the TTS voice id and rename the expert (#43).**
  Across `transcript.md`, `.txt`, and `.html`: `HOST (bm_fable)` → `HOST` (27 each) and
  `EXPERT (Emma)` → `EXPERT (Owen)` (27 each), plus the `.md`/`.txt` bylines. The host
  label had named a *TTS voice id* (`bm_fable`) — worse than a wrong character name, and
  wrong again the moment the maintainer records — so the transcript now names people and
  roles while voices live only in `cast.json`. **Owen** is a PM proposal the maintainer
  confirmed; it is held as a single constant (`episode.EXPERT_CHARACTER`) so a later change
  is one edit. Note the `.txt` carried the label as `HOST (bmfable)` (the underscore was
  stripped when that file was generated), handled explicitly rather than left as a stray
  voice id. `transcript.vtt` (bare `HOST:`/`EXPERT:`, no voice id, no name) and
  `captions-autosync.txt` (no speaker labels) do **not** carry the targeted labels and were
  left untouched, as spec §4E directed — checked and reported either way.
- **`net.py` now surfaces ElevenLabs' own error message on a permanent failure, instead of
  a canned hint (#43).** The 401 handler previously reported "API key rejected — check
  ELEVENLABS_API_KEY", which was actively misleading during the Ep01 render: the real body
  was `quota_exceeded` on a **key-scoped credit cap**, not a bad key. `request_with_retry`
  now prefers the provider's `detail.message`/`detail.code` when present (falling back to
  the static hint), so `ElevenLabs 401: quota_exceeded: This request exceeds your API key
  (…) quota of 5000` reaches the caller verbatim. Diagnose before suppressing — a clear
  message that names what actually failed.

### Findings

- **A 401 from ElevenLabs can mean an exhausted *key-scoped* credit quota, not a bad key
  (#43).** During the authorised Ep01 render the batch rendered 32 of 54 turns, then every
  subsequent call returned **HTTP 401** — while `GET /v1/user/subscription` with the *same
  key* kept returning 200 (125k+ credits on the account). The 401 body was
  `{"detail":{"code":"quota_exceeded","message":"This request exceeds your API key
  (dpotify-claude) quota of 5000. You have 4 credits remaining…"}}`: the **API key** carried
  its own 5,000-credit cap, independent of the account balance and of the render's 5,600
  authorised ceiling, and it was ~4,996 spent from prior work before this render even
  started. Takeaways: (1) ElevenLabs returns **401** (not 402) for a key-scoped quota
  breach, so 401 must be read from the response body, not assumed to be an auth failure —
  hence the `net.py` change above; (2) a key's own quota is a separate wall from the account
  cycle and the per-render ceiling, and a single small probe call can slip through on the
  last few credits and mislead (a 5-char "Test." succeeded while a 16-credit turn 401'd);
  (3) the maintainer raised the `dpotify-claude` key cap to 40,000 to finish, and the
  digest-manifest cache made resuming cost only the 22 unrendered turns (2,515 credits),
  re-billing nothing for the 32 already done.
- **Synthesis against a shared-library voice consumes neither a general voice slot nor
  the Professional Voice Clone slot (#40).** Measured by the PM thread 2026-07-27
  (issue #40 Gap 4, relayed here rather than re-verified by this zero-credit executor
  session): `GET /v1/user/subscription` read `voice_slots_used = 0/30` and
  `professional_voice_slots_used = 0/1` while `GET /v1/voices` showed Jofra present
  with `category='professional'` and three renders already completed against it (the
  #38 stage-two screen test). `CHANGELOG.md` previously recorded only that *browsing
  and previewing* a shared-library voice are free (2026-07-26, "`GET /v1/shared-voices`
  is page-based..."); this extends that to *synthesizing* against one. Takeaway: the
  single PVC slot `AGENTS.md` protects is never at risk from casting off the shared
  library, however many voices are screen-tested.
- **Route 53 never increments the SOA serial on record changes, so the serial is not a
  proof-of-write (#22).** The deploy spec's acceptance check "confirm the SOA serial
  incremented from 1" rests on a **false premise about Route 53**. Measured: the zone's SOA
  serial read `1` before the deploy and `1` after (both `aws route53
  list-resource-record-sets` and authoritative `dig`), despite four records being
  successfully written and `CREATE_COMPLETE` reached. Route 53 does not support zone
  transfers, so — unlike BIND — it does not auto-increment the SOA serial when records
  change, and the static serial does not affect propagation or external recognition
  (AWS re:Post "SOA serial number set to 1 … does not update"; `ChangeResourceRecordSets`
  API reference). Takeaway: prove a Route 53 write with `list-resource-record-sets` or an
  authoritative `dig` against the zone's own nameserver — never the SOA serial. The spec's
  SOA-serial criterion was therefore **not satisfiable and was not met**; stronger proof
  was substituted and this is flagged in the PR body.
- **Public resolvers can lag a fresh Route 53 write by up to the SOA minimum TTL because a
  pre-deploy query seeds a negative cache.** The pre-state control block queried the apex
  TXT/MX/CAA/DMARC while absent; the SOA minimum (last field, `86400`) is the negative-cache
  TTL, so a default resolver may return `(no output)` for the new records for a while even
  though they are live. Querying the zone's authoritative nameserver directly
  (`dig @ns-...awsdns...`) sidesteps this and is the right way to verify immediately after a
  deploy — report `(no output)` from the public resolver honestly rather than retrying it
  until green.

## 2026-07-26

### Added

- **Screen-test render path + the Ep01 co-host screen test (#38).** M2 stage two.
  `pipeline/core/screentest.py` adds a library entry point (`render_screentest`) that
  renders an ordered set of `(voice, line)` pairs at the client's model/format, and a
  `voicelab screentest` subcommand over it. The PR #29 rule — "synthesis stays a library
  call, never a one-shot flag, so a credit spend is always deliberate" — is honoured, not
  dropped: the subcommand **defaults to a dry-run** that prints the quote and the ledger
  and **refuses to spend without `--confirm-spend`**, and a pre-flight gate hard-stops any
  batch whose estimate exceeds the 2,000-credit self-serve threshold. `purpose` is a
  mandatory argument on the render function (self-describing artifacts). It reuses the
  existing machinery wholesale — the tier system, `ACCOUNT_RATE_FACTOR`, the bounded-retry
  wrapper, `attempts=2` on synthesis, and the descriptive-filename + digest-manifest cache
  (the digest keying and filename minting were extracted to `naming.render_digest` /
  `naming.descriptive_render_name` so both callers share one cache identity). Covered by
  `pipeline/tests/test_screentest.py` (network fully stubbed, sample tree redirected to
  `tmp_path` — zero credits). **The renders:** the top-5-by-adopters shortlist plus the
  premade-Daniel control read three real Ep01 EXPERT lines on `eleven_v3` @ 192 kbps — 18
  files under `output/auditions/samples/elevenlabs/` (gitignored), each folder carrying a
  digest manifest with `voice_id`, line slug, chars, and measured credits. The two Daniels
  are disambiguated in folder and filename (`daniel-premade-control-onwK4e9Z` vs
  `daniel-deep-african-8dvhVJc8`). **Spend: 1,758 credits measured from `/v1/history` vs a
  1,762 estimate (Δ −4).**
- **`infra/` — CloudFormation DNS for `toldstraight.com` (#13).** `infra/dns.yaml`
  manages RecordSets **inside** the existing Route 53 hosted zone: `HostedZoneId` is a
  `Parameter` and the template never creates or owns the zone — an owned zone is
  destroyed on `delete-stack`, and recreation mints four new NS records that no longer
  match the registrar, darking the domain until nameservers are repointed by hand.
  Initial scope is a hard mail lockdown (SPF `v=spf1 -all`, null MX `0 .` per RFC 7505,
  DMARC `p=reject`) and a CAA record restricting certificate issuance to `amazon.com`
  (ACM); apex + `vote` site records are authored but held behind a `Condition`
  defaulting **false**, so the stack deploys today with security records only and the
  site switches on later without a rewrite — no IP or CloudFront distribution invented.
  Authored and validated, **not deployed**: `uvx cfn-lint infra/*.yaml` exit 0 and
  `aws cloudformation validate-template` exit 0 (creds present this session);
  no `create-stack`/`deploy`/`change-set`. `infra/README.md` carries the
  zone-as-parameter rule and *why*, the Fish deploy command, and the verified Route 53
  console click path for finding the zone id.
- **`pipeline/core/` — the ElevenLabs-only tooling foundation (#6).** A new package
  (`net`, `models`, `voice`, `naming`, `client`, `cli`) replacing the retired
  multi-engine audition tool. The structural win: `Voice` now carries a `VoiceSettings`
  (`stability`, `similarity_boost`, `style`, `use_speaker_boost`, `speed`; each optional,
  `None` = "don't send" so an unset value never overrides an account default), which the
  engine-agnostic v1 `Voice` could not hold. Every model records its `/v1/models`
  capability flags, and synthesising with a setting the model does not honour (e.g.
  `style` on `eleven_v3`) emits an explicit warning naming the setting and model — a 200
  is not proof the setting applied. New CLI `voicelab` (`models [--live]`, `rates`,
  `account`, `browse`); synthesis stays a library call, never a one-shot flag, so a
  credit spend is always deliberate. Carried forward from v1 intact: the tier system,
  the measured `ACCOUNT_RATE_FACTOR = 0.55`, bounded retry with the transient/permanent
  split, `attempts=2` on synthesis (a retry can re-bill), the descriptive-filename +
  digest-manifest cache keyed on model **and** bitrate, and `/v1/history` rate
  derivation. Covered by `pipeline/tests/` (11 tests, all network stubbed — zero credits).
- **Shared-library browsing (`GET /v1/shared-voices`) in `core` (#7).** Paginated
  through the retry wrapper (follows `page`/`has_more`, does not stop at page one),
  filterable by gender/accent/age/category/search/language with a client-side
  minimum-adopter floor, sorted by adopter count. Free previews download to
  `output/shared-previews/` with a mandatory `purpose` argument and self-describing
  names, writing a sibling `manifest.json` whose schema exactly matches the authoritative
  12-candidate sweep in `artifacts/voice-previews/` (which this tool never writes to).
  Auditioning a library voice costs no credits and no account slot.

- **Label integrity.** `.github/labels.json` now declares all 23 live labels — the 9
  GitHub stock labels are **retained by decision** (issue #21) and declared so the file
  matches the live set. `scripts/sync_labels.py` syncs the manifest to GitHub (`sync`,
  **additive — never deletes**) and detects drift (`check`), and
  `.github/workflows/label-drift-gate.yml` runs the check on label changes. Verified with
  a negative test: a seeded stray live label is caught (exit 1); the clean state passes.
- **`scripts/` is no longer empty.** `scripts/check` — one local gate (pre-commit +
  `uv sync --locked` per subproject + label drift) mirroring CI; `scripts/install-hooks`
  — runs `pre-commit install` and verifies the hook landed, making the #14 fix repeatable
  for a fresh clone.
- **`.github/dependabot.yml`** — GitHub Actions ecosystem, monthly, with a cooldown.
  Closes #5. (uv/pip ecosystems deliberately deferred, per #5.)
- **PR-metadata gate** — `.github/workflows/pr-metadata-gate.yml` +
  `scripts/check_pr_metadata.py`: requires ≥1 `type:` and ≥1 `area:` label (all declared
  in `labels.json`) and an assignee. Deliberately does **not** require a milestone or a
  `Closes #N` link, so `Refs`-only governance PRs are not false-failed.
- **`.github/ISSUE_TEMPLATE/`** — a config, a house-standard briefing form, and a bug
  form. Stated plainly: a template is a scaffold, not a gate — `gh issue create
  --body-file` walks past it; the real standard is in `AGENTS.md`.
- **Full-history secret scan** (`.github/workflows/full-history-scan.yml`): the gitleaks
  CLI over `--log-opts=--all`, weekly plus `workflow_dispatch`, catching secrets that
  exist only in git history — which the per-push working-tree hook misses. It uses the
  CLI, **not** gitleaks-action, which scopes its scan to the triggering event's commits
  even at `fetch-depth: 0` (the `ecg_anomaly_detection` #264 defect). Verified with a
  control before landing: a private key present only in history is caught (exit 1) while
  the clean repo exits 0.
- **Hygiene files for the public repo:** `LICENSE` (MIT), `SECURITY.md` (private
  vulnerability reporting; the `ELEVENLABS_API_KEY`-in-shell threat surface),
  `CONTRIBUTING.md` (the PM/executor workflow and merge gates), and `.github/CODEOWNERS`.
- **Split the licence so episode content is not MIT.** A bare root MIT `LICENSE` covers
  every tracked file — it would have licensed the 16 tracked `episodes/` files (both
  episodes' transcripts in `.md`/`.txt`/`.html`/`.vtt`, show notes, alt text, captions,
  cover art, and chapter PNGs) for commercial redistribution with attribution alone.
  The root `LICENSE` now scopes MIT to software/tooling/config only; `episodes/LICENSE`
  is **all rights reserved**; and `README.md` states the split. The maintainer chose
  all-rights-reserved over CC BY-NC-ND. Effectively irreversible once published, since a
  taken copy keeps the grant — hence fixed before merge.
- Tiered model selection for ElevenLabs: `--tier {draft,cast,production}`,
  with `--model` to override a tier's model at equal cost.
  - `draft` — Turbo v2.5 @ 128 kbps, ~half price, for read-throughs and timing.
  - `cast` — Multilingual v2 @ 192 kbps. Auditions deliberately render at
    production quality; casting on draft output means judging a voice you will
    never ship.
  - `production` — Multilingual v2 @ 192 kbps, the final master.
- `--list-models` — models, listed vs effective rates, and what each tier is for.
- `--check-rates` — re-derives real billing per model from `/v1/history`, so the
  account discount is verifiable instead of a hardcoded assumption.
- Credit ledger printed at session start and finish, with a colour threshold.
- Bounded retry with exponential backoff on all ElevenLabs calls. Transient
  failures only; fail-fast with plain-language hints on 401/402/403/404/422.
  Synthesis is capped at 2 attempts because a retry can re-bill.

- `CLAUDE.md` — project instructions, including the self-describing-filename rule.
- `artifacts/` — gitignored working zone for handoffs, walkthroughs and guides.
  Durable findings still belong in `docs/` and this changelog.
- Lean CI: pre-commit (ruff, markdownlint, shellcheck, gitleaks, zizmor) and a
  locked-environment check per uv subproject, on every PR and push to main.
  Deliberately sized for the repo as it stands; `quality.yml` lists the growth
  hooks to add later rather than adding them now.
- Governance: PR template, a small label taxonomy in `.github/labels.json`, and a
  changelog gate that fails any PR not touching this file. The gate exists because
  a rule with nothing enforcing it depends on somebody remembering; `skip-changelog`
  is the escape hatch for genuinely trivial changes.
- Branch protection on `main`: pull request required, quality gates must pass,
  linear history, no force-pushes or deletions, `enforce_admins: true`.
- `AGENTS.md` — the standing contract binding every agent session, tracked so
  cold-start sessions that inherit no local memory are still bound by it. Carries
  the meta-contract (read the durable contracts, don't assume, durable contract
  outranks the prompt), the do-automatically list, the hold-for-the-maintainer
  list, and the canonical PR workflow. Modelled on the portfolio-mod/ECG pattern,
  scaled down to this repo.
- `CLAUDE.md` gains PM/executor session modes and the requirement that executor
  specs open by reading the durable contracts.

- `ROADMAP.md` — milestones M1–M6, plus a "Decisions and what they constrain"
  section recording how settled choices reach forward into later work (e.g. Route 53
  auto-creating the hosted zone means CloudFormation manages records, not zones).
  GitHub milestones mirror it.
- **"Jared is the absolute authority" hard rule** in `AGENTS.md` and
  `~/.claude/CLAUDE.md`. The rules bind the agent completely — no self-invented
  exceptions, no unilateral bypass, and prior authorization does not carry forward. But
  they never bind Jared: a direct instruction is never answered with "I can't, because
  of a rule." Collisions get named, researched, and resolved by him, with a recommended
  path and every bypass disclosed. No malicious compliance.
- `prompts/20260726-pm-thread-seed-v3.md` — PM seed carrying the lane, the three
  failures that produced it, and the ask-don't-refuse contract.
- **PM-lane enforcement.** Tracked `.claude/settings.json` plus
  `.claude/hooks/pm-lane-guard.sh` gate the PM/executor split as a mechanism instead of
  a rule to remember. Inside this repo PM may write only under `artifacts/` and cannot
  run mutating `git`/`gh`; executors declare themselves with `AUDIO_LAB_EXECUTOR=1`.
  Read-only verification stays open to PM, and writes outside the repo are ungated so
  standing rules can be persisted the turn they are made.
- **"The artifact is not the behavior"** hard rule in `AGENTS.md` and
  `~/.claude/CLAUDE.md`: writing the thing that describes X is not doing X; reports
  must distinguish "written, not in force" from "built and verified"; no technicality
  defense exists for meeting the letter while defeating the purpose; and a gate you
  built blocking the maintainer's request is a question to ask him, never a finished
  answer to report.
- Registered `toldstraight.com` (2026-07-26, $16/yr, auto-renew, privacy on).
  `toldstraight.fm` skipped at $122/yr; `vote.toldstraight.com` will be a subdomain.
- **`AGENTS.md` gains six governance sections** ported from the established repos:
  "Repository visibility and deletion", "PM thread discipline" (the one-block executor
  relay and the launch-record-in-the-same-block rule), "Model and effort sizing",
  "Definition of done", "Issues are written to the house standard", and "New-repo
  parity checklist". These live in `~/.claude/CLAUDE.md` globally, which does **not**
  reach cold-start, cloud, or fresh-clone sessions — only the tracked `AGENTS.md` does.
- **`artifacts/specs/` and `artifacts/issues/` are now tracked.** They were gitignored,
  so every PM-authored executor spec was invisible to any session that inherits no
  local memory. The specs and issue drafts written 2026-07-26 are committed, matching
  how `macos-system-health` tracks `artifacts/specs/`. Walkthroughs and session-handoffs
  stay ignored as session scratch by contract.

### Fixed

- **`pre-commit` was never installed as a git hook**, so every local guard was inert
  — `gitleaks`, `detect-private-key`, and the `no-commit-to-branch` protection on
  `main` all silently did nothing on `git commit`. Found when a commit landed on
  local `main` despite the config forbidding it. A tracked config does not install
  the hook. README now carries the setup step and a both-directions verification.
  Server-side branch protection was the only real guard in the meantime, and it held.
- **Rendered samples were named by hash.** A three-way model comparison landed as
  `76a676a12824.mp3` / `facf0b2fbe0a.mp3` / `a7a79bffe119.mp3`, which is unusable
  for a human asked to listen to them. Filenames are now
  `YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE-BITRATE.mp3` and per-voice folders are
  `<voice>-<short-id>` rather than a bare 20-char id; exact cache identity moved to
  a sibling `manifest.json`, so correctness no longer costs readability. Vendor is
  explicit so a repo with several TTS providers stays legible at a glance.
- **`AGENTS.md` forbade deleting any branch** while its own closure pass required
  deleting merged ones. Scoped the hold to unmerged branches.
- **The same-turn persistence rule was unsatisfiable by a PM session** once the guard
  existed. Resolved by capture-then-promote via `artifacts/rules-pending/`, plus
  leaving writes outside the repo ungated — rather than weakening the guard.
- **Sample cache collided across models.** `sample_path()` hashed only the text,
  so a half-price draft render and a 192 kbps master of the same line resolved to
  one file — you would have cast from, or shipped, whichever generated first. The
  cache key now includes model and bitrate.
- **192 kbps was silently impossible.** `synthesize()` sent no `output_format`,
  so every render came back at the 128 kbps default regardless of intent.
- **Library voices were hidden.** `list_voices()` dropped everything except
  `category == "premade"` — a free-tier workaround that would have concealed every
  voice added from the shared library.
- **The PM-lane guard blocked read-only verification and let the long-form DELETE
  through (#35).** `.claude/hooks/pm-lane-guard.sh` substring-matched the whole Bash
  line, so `git merge-base` (read-only, the correct pre-delete ancestry check) was
  denied because `merge` had no word boundary, a `grep` whose *pattern* named a `gh`
  subcommand was refused, yet a ref-deleting `gh api --method DELETE` passed cleanly
  because the mutation clause matched only the short `-X` form. Now the matcher strips
  quoted spans first (a quoted verb can't execute, so a search pattern or an issue
  body can't trip it), anchors each simple verb on a trailing word boundary (so the
  `merge-*` family is read-only again), and matches both `-X` and `--method`. Verified
  two-directionally: 27 simulated PM payloads, every permit and every deny asserted,
  including the long-`--method` DELETE now **denied**. Known hole left open and stated
  in the hook header: a deliberate `bash -c "git push"` wrapper still evades, exactly
  like the printf/tee in-repo write hole — the guard is a lane marker, not a sandbox.
- **Dependabot was configured as a label list only, so every bot PR was dead on
  arrival (#28).** `dependabot.yml` carried labels but no `assignees` (the PR-metadata
  gate requires one) and no `groups` (so #26 and #27 arrived as two blocked PRs where
  one grouped PR was intended), and nothing satisfied the changelog gate for an author
  that writes no changelog. Added `assignees: ["Jared-Godar"]` and a `github-actions`
  group, and exempted `dependabot[bot]` **in the changelog gate's `if:`** rather than
  pinning `skip-changelog` onto every bot PR — which keeps that label meaning an
  explicit per-PR human judgement. The `user.login` check is spoof-safe on the
  `pull_request` trigger. Deliberately **not** ported: ECG's `dependabot-autofill.yml`
  (see Findings).

### Changed

- **The multi-engine audition tool was archived by folder move (#6).**
  `pipeline/audition/` → `archive/audition-v1/audition/` via `git mv`, given its own
  `pyproject.toml` (deps it actually uses: `edge-tts`, `questionary`, `requests`,
  `rich`), `uv.lock`, and README; still runs (`uv run --project archive/audition-v1
  audition --list-models`). Archived first so there was never a window with no working
  tool. The source is frozen — nothing under `audition/` was edited.
- **`pipeline` is ElevenLabs-only.** `edge-tts` dropped from `pipeline/pyproject.toml`
  (#6), and with it `questionary` (only the archived interactive loop used it) and
  `spotipy` (belongs to the `spotify/` subproject; never imported in `pipeline/`) —
  verified by grep before removal. The `audition` script entry is replaced by
  `voicelab = "core.cli:main"`; a `dev` group adds `pytest`.
- **CI locked-env matrix covers the archive.** `.github/workflows/quality.yml` lists
  `archive/audition-v1` explicitly, and the stale comment claiming the matrix "picks up
  new uv subprojects by name" is corrected — it is a literal list, not a glob, so an
  unlisted subproject's lockfile drift would go unchecked.
- Per-call cost estimates now reflect the measured account rate rather than the
  advertised multiplier, so the spend confirmation prompt is trustworthy.
- `AGENTS.md` gains a **GUI navigation** rule: direct the maintainer by the click path
  a human actually uses — menu, item, section heading, button label — never a bare
  deep-link URL, and verify the elements exist against current vendor docs first.
  Origin: three stale or wrong AWS console locations handed over in one session, each
  costing a round trip.
- **Repo merge settings now match the declared contract** (issue #21, Gap 5):
  `mergeCommitAllowed=false`, `rebaseMergeAllowed=false`, `squashMergeAllowed=true`,
  `deleteBranchOnMerge=true` — squash-only, linear history, auto-delete merged branches,
  as `AGENTS.md` § "Canonical work-item workflow" declares. Applied via `gh repo edit`
  and verified by `gh repo view --json` read-back; no commit involved.
- **The PM lane was narrowed to permit issue and label work.** The guard blocked
  `gh issue`/`gh label` from a PM session, yet writing issues is the PM's job in every
  other project. `.claude/hooks/pm-lane-guard.sh` now allows `gh issue`/`gh label`
  (create, edit, close, comment); git write commands, `gh pr create|merge|edit`,
  `gh repo edit`, and `gh api -X POST|PUT|PATCH|DELETE` stay executor-only.
  `CLAUDE.md` § "The lane is enforced" was false on this point — its capability table
  and prose are corrected. The narrowing was applied by a **Bash write** because the
  guard's `Edit` matcher blocks its own path; that hole is recorded in `CLAUDE.md`, not
  closed here.
- **Rewrote nine stub issues** — #4, #5, #6, #7, #8, #9, #10, #11, #13 — to the house
  briefing standard: measured evidence with pasted command output, resolution options
  framed as the maintainer's choice, explicit non-goals, and checkbox acceptance
  criteria. #6 and #7 gained the scope, constraints, and acceptance detail that had
  been stranded in a gitignored M1 spec. Closes #20.

### Findings

- **`/v1/history` has a brief propagation lag on the *newest* generation, not just
  `/v1/user/subscription` (#38).** `docs/elevenlabs.md` § "Measuring spend" already notes
  the subscription counter lags by tens of seconds; this refines it. Immediately after an
  18-render `eleven_v3` batch, a `/v1/history` query returned only **17** of the 18 rows —
  the last generation had not yet been indexed — so the in-run reconciliation reported
  1,680 credits. A re-query seconds later returned all 18 (`6×157 + 6×78 + 6×58 = 1,758`),
  matching the 1,762 estimate within Δ −4 (pure per-generation rounding; the 0.55× account
  rate holds exactly). Takeaway: reconcile from `/v1/history` a few seconds after the last
  call, or diff the row **set** rather than trusting an immediate post-render count. This
  also confirms `eleven_v3` logs a `character_count_change` delta in history even though it
  omits its text, so batch spend is measurable there despite the per-call text being absent.
- **ECG's `dependabot-autofill.yml` cannot be "ported, not varied" into this repo —
  the instruction was impossible, not merely hard (#28).** The workflow is inseparable
  from ECG-specific machinery absent here: it calls `scripts/github/`
  `autofill_dependabot_changelog.py` (895 lines), `sync_dependabot_pr_metadata.py`
  (384 lines) and a shared `github_api.py` (943 lines) — 2,222 lines, no `scripts/github/`
  exists here; it needs a classic-PAT `PROJECT_METADATA_TOKEN` secret (none present,
  `gh secret list` empty) which cannot be created programmatically; it hardcodes ECG's
  "Project #5" (audio-lab's board is #8); and it runs `uv sync` at the repo root where
  audio-lab's uv project lives under `pipeline/`. Crucially, **over half of it exists to
  satisfy ECG's Project-membership metadata check, which this repo's
  `scripts/check_pr_metadata.py` does not perform** — it validates only `type:`/`area:`
  labels and an assignee (milestone and `Closes` deliberately not required). A verbatim
  port would have guaranteed the opposite of the acceptance criterion: the autofill job
  would error and no changelog entry would be written. The right fix for *this* repo is
  config (`assignees` + `groups`) plus a two-line author exemption in the changelog gate.
  Origin: the executor spec said "port, do not vary" without reading what the workflow
  imports; caught by an executor 2026-07-26 before writing anything, superseding #28 §4
  option 1.
- **`/v1/models` reports per-model capability flags — `can_use_style` and
  `can_use_speaker_boost` — and they are the authoritative source for which
  `voice_settings` a model honours.** Verified live 2026-07-26: only
  `eleven_multilingual_v2` reports both `true`; `eleven_v3`, `eleven_turbo_v2_5` and
  `eleven_flash_v2` report both `false`. This confirms the "v3 silently ignores style
  and speaker_boost" rule from the API side rather than by folklore, and `voicelab
  models --live` reconciles the hardcoded flags against the live endpoint so a future
  change is caught, not assumed.
- **`GET /v1/shared-voices` is page-based and filterable, and it is free.** Response
  carries `voices`, `has_more`, `total_count`; paginate with `page`/`page_size` until
  `has_more` is false (verified: page 0 and page 1 return disjoint sets). Server-side
  filters include `gender`, `accent`, `age`, `category`, `search`, `language`, and
  `sort=cloned_by_count` returns descending adopter counts (top voices in the millions).
  There is **no** minimum-adopter parameter — that floor is client-side. Each row ships
  a free `preview_url` and a `cloned_by_count`; browsing and previewing spend zero
  credits and touch no account slot.

- **`gitleaks-action` scopes its scan to the triggering event's commits even with
  `fetch-depth: 0`** — it is not a full-history re-scan, despite the deep checkout
  suggesting otherwise. A genuine full-history scan needs the gitleaks CLI with
  `--log-opts=--all`. Confirmed here with a control: a private key committed then removed
  (present only in history, absent from the working tree) is caught by the CLI/`--all`
  path with exit 1, and would be missed by any working-tree-only scan. Origin:
  `ecg_anomaly_detection` #264.
- **Nothing compared a new repository against the established ones**, so audio-lab was
  set up from scratch and diverged on 12 surfaces. Three were defects already diagnosed
  and written up in `macos-system-health` (#93 twice, #94) and reproduced here verbatim;
  two were live exposure on a public repo (no full-history secret scan, no LICENSE). The
  individual gaps were cheap to close; the missing parity check was not, because it would
  reproduce the same list on the next repository. Fix: the "New-repo parity checklist"
  now in `AGENTS.md`, tracked as #21, with the issue-quality half tracked as #20.
- **No AWS Free Tier credits exist on this account** ($0.00 remaining, used, and
  zero active credits, checked as root 2026-07-26). Creating an AWS Organization —
  which enabling IAM Identity Center does on a standalone account — therefore costs
  nothing. Unblocks M5.
- **IAM users cannot access Billing at all until the root user activates "IAM user
  and role access to Billing information"** (Billing -> Account). This is an
  account-level switch, not a permissions problem: `AdministratorAccess` does not
  bypass it. It also does not gate Cost Anomaly Detection or the Billing SDK APIs,
  which is why dashboard widgets rendered while console pages showed Access denied.
- **ElevenLabs bills at 0.55x its advertised `character_cost_multiplier`** on this
  account. Confirmed against `/v1/history`: seven Turbo generations predating the
  Creator upgrade billed at 0.504x; two after it billed at 0.275x. Same model, same
  endpoint. The discount is uniform across all four TTS models, so the real monthly
  ceiling is ~237k characters of production audio, not the 130,552 credit figure.
- **v3 and Multilingual v2 cost exactly the same** (both 0.55x effective). Choosing
  between them is a pure quality decision with no budget consequence.
- **The `/v1/user/subscription` counter lags by tens of seconds** and cannot be used
  to attribute cost to an individual request — it misattributes deltas between
  back-to-back calls. `/v1/history` is the authoritative per-generation record.
  `eleven_v3` does not log its text there, so its rate must be derived from known
  input length.
- **One Professional Voice Clone slot** on Creator (`professional_voice_limit: 1`),
  against 30 total voice slots and unlimited Instant cloning.

## 2026-07-23

### Added

- Voice audition applet (`pipeline/audition/`): engine-agnostic TTS auditioning
  with a listen/verdict loop, shortlist replay, role casting, and a sample cache.
  Adapters for edge-tts, ElevenLabs, and local Kokoro.
- "Told Straight" Ep01 and Ep02 deliverables — transcripts, show notes, chapter
  art, captions, alt text.

### Changed

- `.gitignore` reworked to track episode deliverables (art, transcripts, notes)
  while excluding secrets, PII, virtualenvs, and heavy media.

## 2026-07-22

### Added

- Initial repository structure: `fish/` shell functions, `pipeline/` and
  `spotify/` uv projects, `scripts/`, `docs/`, `prompts/`.
