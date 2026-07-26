# Changelog

Personal recordkeeping for audio-lab. Dated entries, newest first — no releases,
no semver, just what changed and why it mattered.

Grouped as **Added / Changed / Fixed / Findings**. *Findings* is the one that
isn't standard: it records things learned about external services that aren't
visible in the diff and would otherwise evaporate.

## 2026-07-26

### Added

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
