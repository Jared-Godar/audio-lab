# Executor spec — M1 core extraction + shared-voice browsing, and infra/ DNS

Authored 2026-07-26 by the PM thread. Two PRs, one session, in the order given.

---

## 0. Read the durable contracts before you touch anything

First action, before any edit, command, or plan:

1. `AGENTS.md` — the standing contract binding every session here
2. `CLAUDE.md` — session modes, the lane, artifact naming
3. `~/.claude/CLAUDE.md` — Jared's global standing rules
4. `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` — memory files
5. `CHANGELOG.md` (especially **Findings**) and `docs/elevenlabs.md`

**A durable contract outranks this spec.** If anything below conflicts with one of
those files, stop and report the conflict — do not resolve it yourself, and do not
resolve it by doing the smaller thing quietly.

You are the **executor**. Launch with `AUDIO_LAB_EXECUTOR=1` set. You commit, push,
and open PRs with full metadata. **You never merge** — the PM thread announces the
signal and Jared merges via the GUI.

If the spec is ambiguous, or you find something that changes scope, **stop and
report**. Do not improvise.

---

## Non-goals — do not do these, they are decisions Jared owns

- **Do not pick a model.** `eleven_v3` vs `eleven_multilingual_v2` is issue #10 and
  it is Jared's ear, not your judgement. `core/` must support both cleanly. Do not
  hardcode a preference, do not "just default to" one with a comment arguing for it.
- **Do not build the tuning app** (#11 — TUI vs local web is undecided).
- **Do not deploy anything to AWS.** Authoring and linting templates is in scope;
  `create-stack`/`deploy` is not, and billable AWS is on the hold-for-Jared list.
- **Do not spend ElevenLabs credits.** Everything here is free: `/v1/voices`,
  `/v1/shared-voices`, and `preview_url` downloads all cost zero. If you find
  yourself about to call `/v1/text-to-speech`, stop and report instead.
- **Do not touch** `episodes/`, `prompts/`, `output/`, or `~/ToldStraight-*`.
- **Do not write governance rules, new contract sections, or process docs.** If you
  hit friction with a rule, report it in the PR body and move on.

---

# PR A — Extract `pipeline/core/`, archive audition v1, add shared-voice browsing

Closes #6 and #7. Milestone: **M1 — Tooling foundation**.

These are one PR deliberately: `main` is protected and you cannot merge, so a
dependent second PR would stall. `/v1/shared-voices` is a capability of the new
voice layer, not a bolt-on.

## A1. Archive first — before writing any new code

Per #6, the archive is step one so there is never a window with no working tool.

- `git mv pipeline/audition archive/audition-v1/audition` — **a real folder move.**
  Not a copy, not "it's in git history anyway."
- Give `archive/audition-v1/` its own `pyproject.toml` so the v1 tool still runs.
  Base it on `pipeline/pyproject.toml`; keep the deps v1 actually needs
  (`edge-tts`, `questionary`, `requests`, `rich`) and the
  `audition = "audition.run:main"` script entry.
- Run `uv lock` inside `archive/audition-v1/`.
- **Verify it still runs** before continuing:
  `uv run --project archive/audition-v1 audition --list-models`
  Paste the output into the PR body. A move that breaks the tool is not an archive.
- Add `archive/audition-v1/README.md`: one short paragraph saying this is the
  frozen multi-engine v1, why it was retired (ElevenLabs-only decision; the
  engine-agnostic `Voice` could not carry `voice_settings`), and its run command.
  Do not modify the archived source otherwise — it is a snapshot.

**CI watch-item:** the workflows run a locked-environment check *per uv subproject*.
Read `.github/workflows/` and determine how subprojects are enumerated. If the list
is hardcoded, add `archive/audition-v1`. If it is discovered by glob, confirm the
glob reaches it. Say in the PR body which of the two it was and how you verified.

## A2. Build `pipeline/core/`

ElevenLabs-only. edge-tts and Kokoro are dropped from the go-forward path — they
live in the archive now. Drop `edge-tts` from `pipeline/pyproject.toml` and re-lock.

Carry these forward from `archive/audition-v1/audition/helpers.py` — they are
working, contract-bearing code, and most of them exist because a real bug was found.
Reorganise freely, but **preserve the behaviour and the comments explaining why**:

| Carried over | Why it must survive |
| --- | --- |
| `MODELS`, `TIERS`, `DEFAULT_TIER` | tier system is documented in `docs/elevenlabs.md` |
| `ACCOUNT_RATE_FACTOR = 0.55` + its comment block | measured, not advertised; the comment is the evidence |
| `request_with_retry`, `ExternalServiceError`, `TRANSIENT_STATUS`, `PERMANENT_HINTS` | the defensive-external-call contract |
| `attempts=2` on synthesis | a retry can re-bill |
| `sample_path` / `manifest.json` naming scheme | the artifact-naming hard rule |
| cache key including model **and** bitrate | fixed a real collision between draft and master |
| `output_format` actually being sent | 192 kbps was silently impossible before |
| `recent_rates()` reading `/v1/history` | `/v1/user/subscription` lags and misattributes |

Suggested shape — adjust if you have a better one, but say so in the PR body:

```
pipeline/core/
  __init__.py
  models.py     # Model, Tier, MODELS, TIERS, ACCOUNT_RATE_FACTOR
  http.py       # request_with_retry, ExternalServiceError, status tables
  voices.py     # Voice, VoiceSettings, account + shared-library listing
  synth.py      # ElevenLabs client: synthesize, credits, recent_rates
  cache.py      # voice_dir, sample_path, manifest read/write, slug
  cast.py       # cast records / results persistence
```

**The one substantive design change** (this is the point of #6): `Voice` was forced
into a lowest-common-denominator shape across three engines and could not carry
`voice_settings`. The new `Voice` must carry them.

- Add a `VoiceSettings` dataclass: `stability`, `similarity_boost`, `style`,
  `use_speaker_boost`, `speed` — all optional, `None` meaning "don't send it".
- Serialize into the TTS request body under `voice_settings`, omitting `None`s.
- **Guard against the silent-discard trap.** `Model` already has `supports_style`.
  Extend it to record what each model actually honours, sourced from the
  capability flags on `/v1/models` — not from memory, and not from a docs page.
  When a caller passes a setting the selected model does not honour, the code
  **warns explicitly** naming the setting and the model. A 200 is not a result;
  `eleven_v3` accepts `style` and `speaker_boost` and silently throws them away.
  Do not silently drop them either — say so out loud.

## A3. Shared voice library browsing (#7)

`GET /v1/shared-voices` — verified reachable and filterable.

Two findings that shape this, both already confirmed; do not re-verify by spending:

- Library voices **synthesize without being added** to the account
  (`is_added_by_user: false` case confirmed). The 30-slot cap and the 95 add/edit
  budget are **not** limits on auditioning.
- Every library voice ships a **free** `preview_url`. Round I screening costs zero
  credits.

Requirements:

- Paginated fetch with the existing retry wrapper. Handle the page cursor properly;
  do not silently stop at page one.
- Filters: `gender`, `accent`, `age`, `category`, free-text search, and a
  minimum-adopters threshold (`cloned_by_count` / users). Sorting by adopter count
  matters — it is how Adam Greene surfaced at 102k.
- Preview download to disk, reusing the existing naming scheme. Filenames follow
  `YYYYMMDD-VENDOR-...-PURPOSE.mp3` with a **mandatory `purpose` argument** —
  a caller that cannot name what it is producing is a design smell to fix, not to
  paper over. Match the shape already on disk in `artifacts/voice-previews/`:
  `20260726-elevenlabs-preview-adam-greene-clear-friendly-e-cohost-candidate.mp3`
- Emit a sibling `manifest.json` with the fields the hand-built sweep already
  captured: `file`, `voice_id`, `name`, `accent`, `age`, `gender`, `users`,
  `descriptive`, `description`. Read
  `artifacts/voice-previews/manifest.json` first and match those keys — that sweep
  was done by hand and its 12 candidates must not be invalidated by a schema change.
- **Do not re-download or overwrite `artifacts/voice-previews/`.** Twelve co-host
  candidates already live there and that work is done.

**Verify with a control.** Per `AGENTS.md`: any check that classifies something runs
a known-positive through the identical code path. For the filters, that means
asserting a voice you know matches is actually returned by the filtered query — not
just that the query returned *something*. A broken filter and an empty result look
identical otherwise. State in the PR body what your control was.

## A4. CLI

Keep `audition` as the entry point name in `pipeline/pyproject.toml` (README and
docs already say `uv run audition`). Preserve the existing flags — `--tier`,
`--model`, `--list-models`, `--check-rates` are documented in `docs/elevenlabs.md`
and `CHANGELOG.md`. Add browsing/preview subcommands for A3.

`uv run audition --check-rates` must still work and still re-derive the rate from
`/v1/history`. Run it and paste the output in the PR body — that is the
0.55× claim staying honest.

---

# PR B — `infra/` CloudFormation for DNS

Closes #13. Milestone: **M5 — Web presence**. Branch off `main` fresh.

## B1. The hard constraint

`toldstraight.com` was registered 2026-07-26 and **Route 53 auto-created its hosted
zone**. Templates take `HostedZoneId` as a **Parameter** and manage `RecordSet`s
inside it. The template must **never create or own the zone.**

If a stack owned the zone, `delete-stack` would destroy it, and recreating it mints
four new NS records that no longer match what the registrar publishes — the domain
goes dark until nameservers are repointed by hand.

Also: CloudFormation cannot register domains. There is no `AWS::Route53Domains`
resource type. Registration stays a manual purchase.

## B2. Records

Nothing sends mail from this domain, so lock mail down hard rather than leaving it
open:

- **SPF** (apex TXT): `"v=spf1 -all"`
- **Null MX** (apex MX, RFC 7505): `0 .` — the explicit "this domain accepts no
  mail" signal
- **DMARC** (`_dmarc` TXT): `"v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;"`
  Omit `rua`/`ruf` unless Jared asks — aggregate reports to an address on another
  domain require that domain to publish an authorisation record, and there is no
  mailbox here yet. Note this tradeoff in a template comment.
- **CAA** (apex): `0 issue "amazon.com"` and `0 issuewild "amazon.com"`, restricting
  certificate issuance to Amazon (ACM). Add `0 iodef` only if Jared supplies an
  address.
- **Apex + `vote` placeholders**: gate these behind a `Condition` driven by a
  parameter defaulting to **false**, so the template is deployable today with only
  the security records and the site records switch on later without a rewrite.
  Do not invent an IP or a CloudFront distribution to point at.

TTLs: 300 for anything expected to change, 3600 for the stable security records.

## B3. Validation without deploying

- Lint offline: `uvx cfn-lint infra/*.yaml` (or `.yml` — match whatever you author).
  Paste the output in the PR body.
- `aws cloudformation validate-template` is an **API call requiring credentials**.
  If credentials are configured, run it and paste the result. If they are not,
  **say so plainly in the PR body** — "not run, no credentials in this session" —
  and do not treat cfn-lint passing as equivalent. Do not configure AWS credentials
  yourself.
- **Do not deploy.** No `create-stack`, no `deploy`, no `change-set`.
- Add `infra/README.md`: what the stack manages, the `HostedZoneId`-as-parameter
  rule **and why** (the domain-goes-dark failure above), and the exact Fish command
  Jared would run to deploy when he chooses to — including how to find the hosted
  zone id. Give him the **click path** for the console route as well as the CLI:
  AWS console → **Route 53** → **Hosted zones** → select `toldstraight.com` → the
  **Hosted zone details** panel shows **Hosted zone ID**. Verify that path against
  current AWS docs before writing it; if you cannot verify it, say so rather than
  reciting it from memory.

---

# Both PRs — the mechanics

Per `AGENTS.md` "Canonical work-item workflow". Do this for each PR.

1. **Sync then branch.** `git fetch`; confirm `git log --oneline main..origin/main`
   is empty; branch.
2. **Write the continuity walkthrough immediately after branching** —
   `artifacts/walkthroughs/<UTC-timestamp>-<slug>.md`, gitignored, Fish blocks with
   a verification command after each step, unknown values as ⟨slots⟩. Refresh it at
   PR-opened and at awaiting-merge.
3. **`pre-commit run --all-files` green before every commit.** Not after.
4. **Update `CHANGELOG.md` in the same PR.** Merge gate, not archaeology. PR A's
   entry belongs under **Changed**/**Added**; anything newly learned about
   `/v1/shared-voices` belongs under **Findings**.
5. **Push over SSH.**
6. **PR metadata — all of it, before pushing:**
   - PR A: `Closes #6`, `Closes #7` · labels `area: pipeline`, `type: task`,
     `priority: high` · milestone **M1 — Tooling foundation**
   - PR B: `Closes #13` · labels `area: infra`, `type: task`,
     `priority: medium` · milestone **M5 — Web presence**
   - Assignee `Jared-Godar` on both.
   - Confirm every label exists in `.github/labels.json` before applying it. Do not
     assume a label name.
   - In the body, **disclose what you deliberately excluded and why.**
7. **Verify by read-back**, never by inferring success from the create command:
   `gh pr checks <N>` and `gh pr view <N> --json assignees,labels,milestone`
8. **Announce HOLD from first push.** Then report to the PM thread with the receipts
   listed below. **Do not merge.**

## Receipts to hand back — no completion claim without these

Distinguish plainly: **done (receipt attached) / queued / owed / not done.**

- `uv run --project archive/audition-v1 audition --list-models` output (A1)
- how CI enumerates uv subprojects, and what you did about it (A1)
- `uv run audition --check-rates` output (A4)
- your control case for the shared-voice filters, and its result (A3)
- `uvx cfn-lint` output (B3)
- whether `validate-template` ran, or explicitly that it did not and why (B3)
- `gh pr checks` output for both PRs

If any of these did not run, say **"not run"** and why. A statement Jared could act
on that would surprise him when he did is a defect, regardless of its wording.

## Stop and report — do not decide these yourself

- Anything that would spend ElevenLabs credits
- Anything that would create a billable AWS resource
- A conflict between this spec and `AGENTS.md` / `CLAUDE.md` / `~/.claude/CLAUDE.md`
- The `core/` split turning out materially harder than A2 assumes
- Any need to touch branch protection, `episodes/`, or `prompts/`
