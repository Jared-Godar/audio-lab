# Runbook — infrastructure and account procedures

Operational procedures for the things this project runs on: AWS, DNS, the ElevenLabs
account. **Recording an episode is a different document** — that whole workflow lives in
[`docs/recording-runbook.md`](recording-runbook.md) and is not restated here.

Every procedure below names its source. **A procedure marked STUB is not verified and
must not be followed as if it were** — the stub says what is missing and where the
knowledge probably lives. An invented runbook is worse than no runbook, because it will
be trusted once.

## 1. Deploy or change DNS — always by change-set

**Source:** `infra/README.md` §§ "Deployment record", "Rollback", "Enabling the site
records later", "Verify after a deploy" — which is the authoritative, full procedure
with the exact commands used on 2026-07-27, and is deliberately not duplicated here.

The shape, so you know what you are looking for:

1. Edit `infra/dns.yaml`. Validate without deploying: `uvx cfn-lint infra/dns.yaml` and
   `aws cloudformation validate-template`.
2. `aws cloudformation create-change-set` against stack `toldstraight-dns`
   (`--change-set-type UPDATE`) — **never** a bare `create-stack`/`deploy`. Creating a
   change-set deploys nothing.
3. `describe-change-set` and **read it before executing**. The resource-type census must
   contain no `AWS::Route53::HostedZone` (the zone is a parameter, ADR 0001), and the
   actions must match what you intended — `Modify` with `Replacement: False` for edits
   to live records, per the logical-id trap in
   [ADR 0011](adr/0011-icloud-mail-over-workmail-ses.md)'s change history.
4. `execute-change-set`, then verify per `infra/README.md` § "Verify after a deploy":
   `aws route53 list-resource-record-sets` **and** an authoritative
   `dig @ns-235.awsdns-29.com`, with a `google.com` control through the identical path.
   Never use the SOA serial as proof of write — Route 53 never increments it
   (CHANGELOG § Findings, 2026-07-27).

Two records must never be "fixed" in passing: SPF's `~all`
([ADR 0010](adr/0010-spf-softfail-mandatory.md), warning at the resource) and the
misnamed logical ids `SpfRecord`/`NullMxRecord` (comment at the resources; renaming is
a delete-plus-create against live records).

## 2. Rotate or re-cap the ElevenLabs API key — STUB in part

**What is sourced** (`CLAUDE.md` § "ElevenLabs specifics", `SECURITY.md` § "Secret
handling", CHANGELOG § Findings 2026-07-27):

- `ELEVENLABS_API_KEY` lives in the shell environment, never a file, never code. It is
  **not set by default**: on the maintainer's machine a Fish function, `secrets-load`,
  reads it from 1Password and exports it into the current shell only. After rotation,
  update the stored credential in 1Password, open a new shell, run `secrets-load`, and
  re-verify with `uv run voicelab rates` from `pipeline/` — a working rates read proves
  the new key end to end.
- **Do not paste the key as a command argument.** `set -gx ELEVENLABS_API_KEY <new-key>`
  works and was previously the instruction here, but the shell records the whole command
  in its history file, so the secret outlives the session in plaintext. Use that form
  only on a machine with no `secrets-load`, and remove the history entry afterwards.
  `secrets-load` and `with-secrets` are machine-local and untracked, so they reach no
  fresh clone (#233).
- **Keys carry their own credit caps, independent of the account balance.** A key-scoped
  quota breach returns **HTTP 401** (not 402) with `quota_exceeded` in the body — read
  the body before concluding the key is bad. The `dpotify-claude` key hit its 5,000 cap
  mid-render on 2026-07-27 and was raised to 40,000 by the maintainer.

**STUB — the console click-path.** The steps to create, revoke, or re-cap a key in the
ElevenLabs web console are not recorded in any tracked file, and this repo's rule is to
never give a click path that was not verified (`AGENTS.md` § "Communication"). The knowledge lives in the ElevenLabs dashboard (the API-keys page of
the account the maintainer holds); record the verified path here the next time someone
actually walks it.

## 3. Re-verify the billing rate

**Source:** `docs/elevenlabs.md` §§ "Rates — advertised vs actual", "Measuring spend".

```fish
cd pipeline
uv run voicelab rates
```

This re-derives the real multiplier from `/v1/history`. Expected: **0.55×** the
advertised `character_cost_multiplier` (0.28× on the half-rate models) — see the table
in `docs/elevenlabs.md`. If it diverges, update `ACCOUNT_RATE_FACTOR` in
`pipeline/core/models.py` and the `docs/elevenlabs.md` table together. Attribute spend
via `/v1/history`, never `/v1/user/subscription`, which lags by tens of seconds; the
newest generation has a brief indexing lag in `/v1/history` too, so reconcile a beat
after the last call and diff the row **set**.

## 4. Re-provision an Identity Center permission set

**Source:** `docs/aws-identity-center-setup.md` (Steps 4–7), `infra/README.md` § "AWS
access", and issue #54's IAM comment (2026-07-27) for the reprovisioning trigger.

- The permission set is `AudioLabDeploy`, provisioned into account `448795057993` as an
  IAM role `AWSReservedSSO_AudioLabDeploy_<hash>`, referencing three customer-managed
  policies **by name** (`AudioLabDnsDomains`, `AudioLabSiteInfra`, `AudioLabMail` —
  live JSON tracked under `infra/policies/`). A referenced policy must already exist in
  the target account or provisioning fails.
- **Editing a policy's contents takes effect immediately; attaching or detaching a
  policy requires reprovisioning the permission set** (#54, measured — reprovision
  reported `Success`). Console route: IAM Identity Center → Multi-account permissions →
  AWS accounts → select the account → the permission set offers reprovisioning after
  its policy list changes; `docs/aws-identity-center-setup.md` Step 4 walks the
  create-and-assign flow this repeats.
- Verify both directions afterwards, per `docs/aws-identity-center-setup.md` Step 7 and
  the #54 probe set: an allowed probe per policy (e.g.
  `aws route53 list-hosted-zones --profile audio-lab`,
  `aws sesv2 list-email-identities --profile audio-lab`) **and a control that must
  stay denied** (`aws ec2 describe-instances --profile audio-lab`) — without the deny,
  a working probe and an over-broad policy are indistinguishable.

## 5. Replace the interim host stems with recorded narration — STUB in part

**What is sourced:**

- Recording the takes, format/peak verification, naming, and the landing convention:
  [`docs/recording-runbook.md`](recording-runbook.md) §9 end to end. Host stems are
  keyed by turn id (`t00, t02, … t52` for Ep01 — the even indices, not `H01..H27`;
  CHANGELOG 2026-07-27, #69).
- Why the swap is cheap: per-turn stems, [ADR 0012](adr/0012-per-turn-stems.md) —
  replacing the host touches 27 files and leaves the guest track alone.
- Re-assembling the master from stems: `uv run voicelab render-episode --assemble`
  regenerates the mastered episode from cached stems at zero credits (CHANGELOG
  2026-07-27, #46), with the chain loudness-match → structure-aware gaps → polish →
  tempo → −16 LUFS normalize.

**STUB — the substitution step itself.** No tracked file documents a command that swaps
recorded WAVs into the stem set: `docs/recording-runbook.md` §9 explicitly hands off at
"tell the PM session the path — extraction … and assembly … are its job", and
`pipeline/core/episode.py` has no documented external-stem input. The knowledge gap is
the extraction/matching step (continuous take → per-turn files → placed where
`ordered_stems()` finds them); it probably lands as a `voicelab` subcommand when the
first real host session happens (#44 tracks the narration swap). Do not improvise it
from this document.
