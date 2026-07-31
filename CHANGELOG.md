# Changelog

Personal recordkeeping for audio-lab. Dated entries, newest first — no releases,
no semver, just what changed and why it mattered.

Grouped as **Added / Changed / Fixed / Findings**. *Findings* is the one that
isn't standard: it records things learned about external services that aren't
visible in the diff and would otherwise evaporate.

## 2026-07-31

### Added

- **Published the privacy policy and gave the site an identity in link previews (#128).** The Coming
  Soon page collects email addresses and linked to **no privacy policy** — `docs/privacy-policy.md`
  existed as a draft from #140 but was never published. New `site/privacy.html` renders it in the
  brand register (tokens kept byte-identical to `index.html` so the two cannot drift), linked from
  **both** the consent line under the signup form and the footer. The consent link is a separate
  element rather than folded into the status line, because that line is an `aria-live` region whose
  `textContent` is replaced on every submit — a link inside it would be destroyed and re-announced to
  screen readers each time. `docs/privacy-policy.md` is now marked PUBLISHED and names itself the
  source of record, carrying forward — explicitly **not** discharging — its own "have it reviewed
  before it is published" caveat. Also adds the missing `<head>` identity: favicons (SVG + 32px light
  and dark + apple-touch), `theme-color` per colour scheme, a meta description, canonical URL, and
  Open Graph / Twitter card tags pointing at the 1200×630 OG card. **Every icon and card is an
  existing tracked asset from `brand/favicon/` and `brand/web/`, built in Illustrator — nothing was
  generated here.** Before this, a shared link rendered as a bare URL with no title card and the
  browser tab showed a default icon. Advances #128.

- **Stood up static site hosting and shipped the wired Coming Soon page (#128).** New
  `infra/site.yaml`: a **private** S3 bucket (public access blocked, no website endpoint, versioned,
  SSE-AES256, `BucketOwnerEnforced`) served through **CloudFront with an Origin Access Control**, so
  the bucket is never addressable directly — the bucket policy admits exactly one principal, gated on
  `AWS:SourceArn` of this distribution. TLS via an **ACM certificate DNS-validated automatically in
  Route 53** (apex + `www`), `redirect-to-https`, TLS 1.2_2021, HTTP/2+3, and the managed
  `SecurityHeadersPolicy`. The distribution declares both aliases up front so the DNS cutover is a
  records-only change. **No IAM resources, so no `CAPABILITY_IAM`.** CloudFront managed policy ids
  were read from the live account rather than copied from memory. The prototype is promoted out of
  the gitignored working zone into a tracked **`site/`**, and its form — previously
  `onsubmit="return false"` — is **wired to the live #140 endpoint**: `fetch` POST, the hidden
  `company` honeypot the Lambda already checks, client-side pre-validation, disabled/"Sending…"
  state, distinct network-failure vs. server-error messaging, an `aria-live` status region, and
  deliberate silence about whether an address was already on the list (saying so would leak
  membership). Images are now `<picture>` with WebP sources and PNG fallbacks plus intrinsic
  `width`/`height` against layout shift: **5.4 MB of PNGs → 408 KB of WebP**, hero alone 3.2 MB →
  236 KB, and a first load that fetches **75 KB** of imagery. The cast PNGs are committed untouched
  as fallbacks; the hero ships **WebP-only** because its 3.2 MB source trips the repo's 1 MB
  `check-added-large-files` guardrail — the original stays in the gitignored working zone, and that
  guardrail was respected rather than bypassed (see Findings).
  New `docs/site-deploy-walkthrough.md` is the maintainer runbook. Deploy is billable and the
  maintainer's; **DNS cutover is deliberately a separate PR** — see Findings. Advances #128.

- **Built the email-signup collection backend + a privacy policy (#140).** New `infra/signup.yaml`
  (CloudFormation, long-form intrinsics, cfn-lint clean): a public **Lambda Function URL** — CORS-locked
  to the site origin — validates an email and stores it **single opt-in** in an **SES v2 contact list we
  own**. No third-party ESP; the list never leaves the account. The handler is idempotent,
  honeypot-guarded, and never reveals whether an address is already on the list. The stack also declares
  the SES domain **email-identity (EasyDKIM)** as the *sending foundation*, outputting the DKIM tokens for
  the manual DNS step. `docs/privacy-policy.md` is a draft policy covering exactly this collection
  (consent, own-list storage, unsubscribe via `hello@`); `docs/signup-deploy-walkthrough.md` is the
  maintainer runbook. **This stack collects; it does not send** — deploy is billable (maintainer, via
  change-set), and DKIM verification + sandbox exit + the launch send are #144 (double opt-in is #143).
  Closes #140.

- **Recorded the Coming Soon design language + the human/machine cast register as ADR 0019 (#138).**
  New `docs/adr/0019-coming-soon-design-and-human-machine-register.md` pins two coupled decisions from
  the #138 design session: (1) the show's cast splits **by medium** — real people are photographed
  (photoreal, warm-paper-graded), synthetic people stay ligne-claire cartoons, and the medium itself
  carries the synthetic-likeness disclosure (with the text `.ts-caution` retained for accessibility) —
  which **amends ADR 0018** for human cast members (0018's status is annotated); and (2) the Coming
  Soon page is a lighter **field-notice** treatment with a `DECLASSIFY ON` countdown (go-live
  2026-08-06), not a full TOP SECRET gimmick. The realized prototype lives in the gitignored working
  zone (`artifacts/coming-soon-prototype/`); its assets and the shipped page land with #128. Closes
  #138, unblocks #128.

- **Defined the pre-public-release readiness checklist (#109).** New tracked doc
  `docs/pre-public-release-readiness.md` — the gate Told Straight must pass before it moves
  from private beta to public. Every item across security (AWS posture / IAM / secrets),
  DNS & mail (SPF/DKIM/DMARC/rua), content & licensing, legal (entity, trademark, privacy
  policy), and accessibility (site + media) states HOW it is verified (an exact command or
  method — `(no output)` counts, an assertion does not), maps to an owner or a tracking
  issue, and is framed by what would BLOCK launch (`[BLOCKER]` vs `[SHOULD]`; accepted-risk
  only with a recorded decision, never a silent skip). It references #67 (the
  admin-principal long-lived access key — the load-bearing security blocker) and #59 (DMARC
  now reports via `rua`, but nothing parses the reports yet) without modifying either. §7
  lists the six gate items that have no tracking issue yet — full-history secret scan, `rua`
  monitoring, LLC formation, trademark clearance, privacy policy, and a site-accessibility
  bar — so they get filed before the audit runs. Parent of #110, which executes the
  checklist and records a go/no-go; this PR defines the gate, it does not run it.

- **Automated the Project #8 board lifecycle (#115, #121).** New advisory workflow
  `.github/workflows/project-automation.yml` + `scripts/project_automation.py`: a newly-opened
  issue is added to Project #8 with Status=Todo (#115), and when a PR opens, each issue it
  closes is flipped to Status=In Progress (#121) — linked issues read from the PR's
  `closingIssuesReferences`, statuses set via the Projects v2 GraphQL API. The → Done
  transition stays GitHub's built-in (confirm it's enabled under Project #8 → ⋯ → Workflows).
  **One-time maintainer setup owed:** writing a *user-owned* Project field from Actions needs a
  token with `project` scope — the default `GITHUB_TOKEN` cannot — so the workflow reads a
  `PROJECT_AUTOMATION_TOKEN` secret; until it exists the script no-ops gracefully (advisory,
  never a red X). Logic validated locally in `--dry-run` (add→Todo, PR→In Progress,
  no-linked-issue no-op, token-absent no-op); the live Actions run is pending the token.

- **Set up the Project #8 view set and documented it (#120).** New tracked guide
  `docs/project-views-setup.md` covering both paths — the scriptable GraphQL mutations
  (`createProjectV2View` / `updateProjectV2View` / `deleteProjectV2View`: name, layout, `filter`,
  `configuration.visibleFieldIds`) and the UI-only steps (board/table group-by, roadmap dates,
  Insights charts), with every click path verified against the live UI. Twelve views were created
  on Project #8 (`PVT_kwHOAQEwMM4BehsR`) via `gh api graphql`: Board (Status columns), High
  priority (`label:"priority: high"`), By milestone, Roadmap, and one filtered view per in-use
  `area:` label (all eight, 3–35 issues each). Two corrections to the 2026-07-30 research: `filter`
  is **not** a `createProjectV2View` input — it is update-only, so a filtered view is a
  create-then-update; and Project #8 has no `area`/`priority` fields, so those views filter on
  labels, not fields. Group-by, roadmap date fields, and a Status Insights chart have no API and
  are left as documented click-steps for the maintainer.

- **Researched the Told Straight social handles and wrote the registration runbook (#111).**
  New tracked doc `docs/social-handle-availability-and-registration.md`. Nine candidate handles were
  checked across YouTube, X, TikTok, Instagram, Facebook, and Bluesky — **none is publicly in use** —
  and `toldstraight` is the recommendation: 12 lowercase letters, so it clears X's 15-character
  alphanumeric cap with room, matches the registered domain exactly, and is legal and unused on all
  six surfaces. Ordered fallbacks (`toldstraightpod`, `toldstraightfm`, `thetoldstraight`,
  `toldstraighthq`) are all X-legal so consistency survives; `toldstraightshow` and `toldstraightcast`
  are declined at 16 characters because they **cannot exist on X**, which would defeat the
  consistent-handle requirement. The doc leads with what the checks do *not* prove — `no-profile`
  means no public profile resolves, **not** that the handle is registrable, since suspended,
  deactivated, and platform-reserved names all read identically — so the platform's own username
  picker at signup stays the authoritative check. Also carries the maintainer runbook: registration
  order, display name, bio copy derived from the README (not invented), the avatar asset
  (`brand/favicon/…-favicon-512-maskable.png`), a recovery-address decision that lands exactly on
  ADR 0011's stated three-address reversal boundary, and a TOTP-over-SMS 2FA recommendation.
  **Registration itself is maintainer work** and is not done — #111 stays open with four of five
  acceptance criteria owed, listed in the doc's § 6. Banner art is recorded as a genuine gap: no
  repo asset matches the platforms' header aspect ratios, and per the established workflow the agent
  authors a `tools/brand/` JSX builder rather than rendering brand PNGs itself. Refs #111.

### Changed

- **Rewrote the gated site records in `infra/dns.yaml` for the CloudFront cutover (#128).**
  `ApexSiteRecord` becomes a Route 53 **alias A record** — it was `Type: A` with a literal
  `ResourceRecords` IP, which cannot point at CloudFront (no stable IP) while an apex CNAME is
  invalid DNS (RFC 1034); an alias A record is the only construct satisfying both. New
  `WwwSiteRecord` does the same for `www`, which the certificate and distribution already cover but
  which **had no record at all**. Both use `Z2FDTNDATAQYW2`, CloudFront's fixed hosted-zone id,
  emitted by `infra/site.yaml` as `AliasHostedZoneId` so it is never retyped. `ApexTarget` is
  replaced by `SiteDistributionDomain`. **The five mail and security resources — `SpfRecord`,
  `NullMxRecord`, `DkimRecord`, `DmarcRecord`, `CaaRecord` — are byte-identical**, verified by
  structural comparison against `main`, not by eyeballing a diff. Still gated off by default; the
  cutover procedure with its change-set inspection step is §6 of `docs/site-deploy-walkthrough.md`.
  Advances #128.

- **Retired the custom Project #8 automation in favor of GitHub's built-in Project workflows
  (#115, #121).** Removed `.github/workflows/project-automation.yml` and
  `scripts/project_automation.py` (both added earlier the same day in #135). Project #8's native
  workflows cover the whole lifecycle with no custom code and no credential: "Auto-add to project"
  and "Item added to project" (→ Todo) for the add leg (#115); **"Pull request linked to issue"
  (→ In Progress)** for the PR leg (#121); and the built-in merged/closed → Done plus "Item
  reopened" → In Progress. This corrects #121's 2026-07-30 research, which concluded the built-ins
  "only do Done transitions" and therefore that the In-Progress-on-linked-PR leg required custom
  Actions + GraphQL — the "Pull request linked to issue" built-in does exactly that leg. Custom
  automation was the right call for `ecg_anomaly_detection` (nine Project fields to populate) but
  overkill for audio-lab's Status-only board. Retiring it also lets the account-wide, expiring
  `PROJECT_AUTOMATION_TOKEN` classic PAT be revoked — one fewer standing credential to rotate.

### Fixed

- **Corrected a wrong go-live date in the largest type on the Coming Soon page (#128).** The
  `DECLASSIFY ON` stamp read **08 Aug 2026** while the countdown constant and ADR 0019 both say
  **2026-08-06** — a two-day error, hand-typed into the page's most prominent element, on the very
  date the show launches. The countdown beneath it was correct the whole time, so the page contradicted
  itself in public. Caught by reading a render, not a diff: both values look plausible in source. The
  stamp is now **derived from the `GO_LIVE` constant** at runtime (formatted in `America/New_York`,
  since the launch is a fixed wall-clock moment, not the visitor's local time), with the static markup
  kept as a matching no-JS fallback — so the two can no longer drift.

- **Softened the overstated SPF `~all` vs `-all` finding (#122).** `infra/dns.yaml` stated as
  fact that Apple's Custom Email Domain verifier does a literal string comparison, so `-all`
  "can NEVER pass verification." That conclusion was never cleanly isolated from a
  propagation-delay confound — the `-all` rejection during the #54 cutover (run on 300s TTLs
  mid-change) may have been timing rather than the SPF value, and Apple's own resolver path was
  never observed. The comment now presents both explanations (literal string-match vs a record
  that had not yet propagated) as unseparated and marks "`-all` cannot verify" as untested, not
  proven. Practical guidance is unchanged: ship `~all`, the value Apple issues; the record value
  itself is untouched.

- **Fixed the signup walkthrough's unrunnable AWS commands and recorded the real SSO portal (#146).**
  `docs/signup-deploy-walkthrough.md` used `--profile default` with no `--region` throughout; on this
  SSO-only machine `default` is retired (#67) and regionless, so step 1 failed with `NoRegion` and would
  then fail auth. All commands now use `--region us-east-1 --profile audio-lab`. Separately, the real
  browser access portal — `https://d-906679548d.awsapps.com/start` — was never recorded (docs carried
  only the `d-xxxxxxxxxx` placeholder), and the `identitycenter.amazonaws.com/ssoins-…` value in config is
  a CLI-only endpoint that renders blank in a browser; `infra/README.md` now records both and the
  distinction. Surfaced live during the #140 deploy.

- **Fixed the signup Function URL returning 403 on every request (#150).** `infra/signup.yaml`
  granted its public endpoint only `lambda:InvokeFunctionUrl`. Since **October 2025** a function URL
  needs **both** `lambda:InvokeFunctionUrl` *and* `lambda:InvokeFunction`, so the stack would have
  reached `CREATE_COMPLETE` with a healthy-looking `SignupEndpoint` output that rejected every POST —
  the Coming Soon page (#128) would have shipped a form that silently collected nothing, with no
  signal in stack status, outputs, or CloudWatch (requests never reach the handler). Adds a second
  `AWS::Lambda::Permission` with `InvokedViaFunctionUrl: true`, which keeps the `Principal: "*"` grant
  narrow — invocation is allowed through the function URL only, not the Invoke API. Caught before the
  endpoint was wired to the site, so no signups were lost. Closes #150.

- **Rewrote the signup deploy walkthrough around what actually happens (#150).**
  `docs/signup-deploy-walkthrough.md` now leads with profile selection (`audio-lab-admin` until #148
  closes, because `audio-lab` cannot deploy this stack), adds a pre-flight step, a
  `ROLLBACK_FAILED` recovery procedure, and endpoint verification that discriminates. Also replaces
  an accidental terminal paste (a duplicated deploy block with a malformed fence) that had been left
  in the working tree.

### Findings

- **The repo's 1 MB large-file guardrail decides the hero image format, not preference (#128).**
  `check-added-large-files` (pre-commit, 1024 KB) rejects the 3.2 MB `hero.png`, so the hero ships
  WebP-only while the 304–536 KB cast portraits keep their PNG fallbacks. The guardrail was left
  intact rather than bypassed with `--no-verify`: a 3.2 MB blob in git history is permanent and is
  exactly what the hook exists to prevent. **Open question for the maintainer:** the hero's source
  PNG is now tracked nowhere — it survives only in the gitignored working zone on one machine. If it
  should be recoverable from a fresh clone, that needs Git LFS, an archived copy outside the repo, or
  a deliberate raise of the hook's limit. Recorded rather than silently accepted.

- **The signup form cannot be tested from anywhere except the real origin (#128).** The signup
  endpoint is CORS-locked to `https://toldstraight.com`, so a browser on `localhost` — or on the
  `*.cloudfront.net` domain the site stack hands you — is refused *by the browser* before the request
  leaves. Measured: from `http://127.0.0.1:8788` the fetch fails with `TypeError: Failed to fetch`.
  This is correct behaviour, not a defect, but it means **submission cannot be verified until the DNS
  cutover**, and the obvious pre-cutover smoke test will always look broken. The workaround (redeploy
  the signup stack with `AllowedOrigin` pointed at the CloudFront domain, then put it back) is in
  `docs/site-deploy-walkthrough.md`. Note this constrains ordering: page → DNS → *then* form test.

- **Adobe Fonts web projects have no domain allowlist — the Typekit-era requirement is gone (#128).**
  An earlier entry in this section claimed `toldstraight.com` had to be added to kit `zol6gng` or the
  page would silently fall back to Helvetica, and flagged it as a go-live blocker. That was wrong.
  Adobe's documentation is explicit: "You don't need to specify a list of domain names for your web
  projects. You can add the embed code to any website–no matter where it is hosted," with no cap on
  how many sites use one project. The Adobe Fonts UI says the same ("You can embed this project on
  any website you manage"). What made the stale advice look current is that the embed URL is still
  `use.typekit.net`, so Typekit-era guidance still ranks and still reads as applicable. Corroborating
  evidence was already in hand and under-weighted: the page rendered in Trade Gothic from `127.0.0.1`
  during local testing, which was attributed to a localhost dev exemption when the simpler
  explanation was that no restriction exists. Corrected in `docs/site-deploy-walkthrough.md`; a
  Helvetica render means the stylesheet request itself failed, not a settings problem.

- **CloudFormation does not create the resource policy for a `NONE`-auth Function URL; the console
  and AWS SAM do.** Per AWS docs (`lambda/latest/dg/urls-auth.html`): "If you're using the AWS CLI,
  AWS CloudFormation, or the Lambda API directly, you must add the policy yourself," and without it
  "users get a 403 Forbidden error code … even if the function URL uses the `NONE` auth type." Since
  **October 2025** that policy needs **two** statements, not one. This is invisible in a CFN diff and
  invisible in stack status — the failure mode is a green deploy with a dead endpoint. Any future
  Function URL in this repo needs both `AWS::Lambda::Permission` resources.

- **The `AudioLabDeploy` failures are mostly resource-ARN scope, not missing actions (#148).**
  Reading the live permission set (three customer-managed policies: `AudioLabDnsDomains`,
  `AudioLabMail`, `AudioLabSiteInfra`; no inline, no AWS-managed) shows `AudioLabSiteInfra` already
  grants the full Lambda / Logs / IAM lifecycle — but every ARN is scoped to `audiolab-*`, the
  audition stack's naming, while the signup stack names resources `toldstraight-*`. Same shape for
  the observed `ses:TagResource` denial: the action *is* granted, but only on
  `identity/toldstraight.com`, never `contact-list/*`. Genuinely absent actions are narrower than
  they looked: the SES contact-list family and the Lambda function-URL-config family. Also recorded:
  `infra/policies/` carries a file named `…AudioLabSiteInfra-v4…` while the live default version is
  **v3**, and has no copy of `AudioLabDnsDomains` at all.

- **A stack in `ROLLBACK_FAILED` cannot be updated, and `deploy` hides why.** `aws cloudformation
  deploy` prints "Waiting for changeset to be created.. / Waiting for stack create/update to
  complete" and then a generic failure, while producing **no new stack events** — so
  `describe-stack-events` shows only the original failure and looks stale. The absence of new events
  is the diagnostic: the operation was refused before it began. The stack must be deleted first.

- **Omitting `--profile` on this machine yields a misleading `AccessDenied`.** The default profile is
  `lifeos` (`LifeOSArchive`), which exists and authenticates fine but has no access to the audio-lab
  resources — so a forgotten flag surfaces as an authorization error naming `LifeOSArchive`, not as a
  missing-credentials error. Seeing `LifeOSArchive` in an AWS error means the flag was dropped.

- **Every social platform needs a different availability signal, and on three of five the obvious
  one is silently wrong (#111).** Logged-out HTTP status separates taken from free on **YouTube** and
  **X** only (200/404). On **TikTok, Instagram, and Facebook** both controls return **200**, so a
  status-code checker reports every handle as available — the `domain-availability-research.md`
  failure on new services. What works instead, all without any login: **TikTok** via the public
  oEmbed endpoint (`/oembed?url=…` → `author_name` vs `{"code":400}`); **Instagram** via the
  server-rendered `og:title` (present = taken; a bare `<title>Instagram` = no profile); **Facebook**
  via a **three-state** `<title>` classifier, because the known-taken `cocacola` returns
  `Redirecting...` — so exactly `<title>Facebook` means no-profile, `Redirecting...` is *unclear* and
  must be escalated to a browser, and anything else is taken. **Bluesky** has a real API
  (`com.atproto.identity.resolveHandle`). Facebook's negative is the weakest of the set: its own
  "This content isn't available right now" wording covers deleted and audience-restricted pages as
  well as nonexistent ones.

- **The interleaved control caught a live mid-sweep failure — the `last.fm` trap, reproduced (#111).**
  Partway through the Facebook sweep the known-positive (`NASA`) returned an **empty title**: a
  transient block, not a change in reality. Two candidate results in that block were discarded and
  re-run against fresh controls, which passed. Running the control once up front instead of
  interleaved would have published those two as findings. Any classifier in this repo runs its known
  positive through the identical path *throughout* the sweep, not once at the start.

- **X caps handles at 15 characters; YouTube allows 30 — the tightest platform decides the brand
  handle (#111).** Per `help.x.com/en/managing-your-account/change-x-handle`, an X username *"must be
  more than 4 characters long and can be up to 15 characters or less"* and may contain *"only
  letters, numbers, and underscores."* YouTube (`support.google.com/youtube/answer/11585688`) allows
  3–30 characters plus `_ - .` (not at either end) and is case-insensitive, and explicitly
  *"reserves the right to change, reclaim, or remove a handle at any time"* while forbidding handle
  sale or transfer. Instagram/TikTok/Facebook limits were **not** independently verified — their help
  pages did not return readable text through the tooling used — and the recommendation deliberately
  does not depend on them.

## 2026-07-30

### Changed

- **Post-merge closure now sweeps for untracked files in tracked paths.** `AGENTS.md` step 8
  gains an explicit `git status --porcelain --untracked-files=all -- artifacts/specs
  artifacts/issues` sweep and an end-of-closure clean-tree check. Six executor specs had
  accumulated untracked in the tracked `artifacts/specs/` path across sessions (committed in
  #131) because closure pruned worktrees/branches but never checked the main checkout for stray
  provenance files. Making it mechanical stops the recurrence.

- **DMARC now reports as well as enforces (#59).** `DmarcRecord` gained
  `rua=mailto:hello@toldstraight.com` — a same-domain target needing no cross-domain
  authorization record. Every other tag (`p=reject; sp=reject; adkim=s; aspf=s`) is
  byte-identical, verified against the authoritative nameserver after deployment.
  Deployed by change-set (`add-dmarc-rua`, type `UPDATE`, exactly one `Modify`, no
  `AWS::Route53::HostedZone`). `ruf=` stays deliberately omitted (low adoption;
  reports can contain message content). Nothing parses the reports yet —
  `infra/README.md` says so plainly rather than implying monitoring that no human
  performs.

- **The governance stack was audited, consolidated, and de-hooked (#94).** The three contract
  files were rewritten from 41 overlapping rules into a six-rule conduct core plus repo
  specifics: `AGENTS.md` 32,309 → 14,850 bytes (sole binding contract, Experiment A documented
  as the operating model, tiered issue standard, one-line origin registers), `CLAUDE.md`
  13,662 → 2,363 bytes (repo mechanics only), and the machine-local `~/.claude/CLAUDE.md`
  36,411 → 4,965 bytes (personal facts + new-repo parity + cross-repo core reference). Both
  enforcement hooks were **removed by recorded decision** — `pm-lane-guard.sh` (PreToolUse)
  and `contract-reinjection.sh` (UserPromptSubmit, a measured 645–1,010 tokens injected every
  turn) — along with `contract_digest.py`, the 51-case `scripts/pm_lane_guard_matrix.py`
  harness, `docs/PM-WORKFLOW.md`, and `artifacts/specs/TEMPLATE.md`, all of which described
  or tested the retired PM/executor apparatus. Rationale, measured in #94: 63% of all issues
  were remediation-class *with* the hooks in force — they constrained accident, not intent,
  and their cost exceeded their compliance yield. Re-introducing any hook is a maintainer
  decision, never a silent re-add. Estimated saving ≈ 15,000 resident tokens per session plus
  the per-turn injection (roughly 40–60k tokens per working session).

- **The label schema is frozen at the current 14 labels (#94, closing #8).** The four pending
  vocabulary refinements and the `effort:`/`risk:`/`status:` axes are formally declined;
  `.github/labels.json` records the decision in its comment.

### Added

- **Committed six executor specs/briefings that were authored into the tracked `artifacts/specs/`
  path but never committed (#55, #83, #84, #87, #94).** `artifacts/specs/` is a tracked path (a
  deliberate `.gitignore` exception, like `macos-system-health`), so these are the durable spec
  records for their issues — the #55 host-stems rails (v1 + v2 addendum), the #83/#84/#87
  executor specs, and the #94 Phase-1 governance briefing. They had been sitting untracked in the
  working tree across multiple sessions because post-merge closure prunes worktrees/branches, not
  stray untracked files. Committing completes the provenance record; no content change.

- **Episodes 1–3 completeness matrix (`episodes/EPISODE-COMPLETENESS.md`, #99).** An audit of
  every episode against a fixed asset checklist (script, audio, cover, chapter/exhibit art,
  transcript, show notes, metadata, distribution). Finding: content is largely complete; the
  blocker to M4 is **audio on all three** (gated on #55/#117/#119), and the one content hole is
  **E3's draft script** (split to #124). Small mechanical gaps (E2 cast-card rebuild, E1 metadata,
  E3 show-notes.html + captions) are tracked as a checklist on #99.

- **Three area labels — `area: brand`, `area: web`, `area: marketing` (release-planning build,
  2026-07-30).** The 2026-07-30 milestone plan (Branding M7, MVP-site M5, Marketing M9) produced
  work with no home in the existing area axis. The label schema, frozen earlier the same day
  (#94/#8), was reopened under its own documented trigger — "reopen only if a filtered view fails
  in practice" — since that failure was now concrete. `labels.json` and the live set are
  reconciled at 8 areas; the frozen-schema comment records the reopen as a decision, not creep.

- **`readme-staleness.yml` scheduled workflow (#94, closing #63).** Weekly check: if any
  milestone reached zero open issues after the README's `Last updated:` date, it opens one
  issue (or comments on the existing one — never duplicates, never blocks). Advisory by
  design; workflow_dispatch for on-demand runs.

### Fixed

- **Corrected a false CHANGELOG entry from #129.** That entry claimed a **tracked**
  `.vscode/settings.json` was added to point the Python interpreter at `pipeline/.venv`. But
  `.vscode/` is gitignored (`.gitignore:130`), so `git add -A` skipped the file and only the
  CHANGELOG line was ever committed — the entry described a repo change that never happened
  (falsehood class). The interpreter path is a **local, per-machine editor setting**, kept in
  each developer's untracked `.vscode/settings.json`, and is out of scope for the CHANGELOG; the
  bogus entry is removed here.

- **The PR-metadata gate no longer hangs the merge box.** `pr-metadata-gate.yml` used
  `concurrency: cancel-in-progress: true`, so the event burst at PR creation (opened +
  labeled + assigned…) cancelled earlier in-flight runs, leaving a `cancelled` conclusion
  on the **required** "PR metadata" context. GitHub branch protection treats a cancelled
  required check as unsatisfied, so the merge box stuck at "waiting for status" even after a
  later run passed (observed on PRs #98 and #125). Set `cancel-in-progress: false` so every
  run completes; the immediate-unblock workaround is a single PR edit to fire one clean run.

- **The two `fish/` "SUPERSEDED by `uv run audition`" pointers now name `voicelab`** (#94,
  the residue folded in from #74) — the last live references to the dead entry point outside
  correct-in-context history.

### Findings

- **Apple publishes the DKIM public key minutes-to-hours *after* domain verification,
  not at verification (#54, recorded by #59).** In that window outbound mail carries a
  DKIM signature no receiver can verify, so it can fail DMARC for a reason that is
  transient and self-resolving — and looks identical to a misconfiguration. Wait out
  the lag before diagnosing.
- **iCloud uses the custom domain as the envelope sender, so SPF aligns under `aspf=s`
  (#54, recorded by #59).** Measured by the maintainer's two-directional mail test,
  2026-07-27: `dkim=pass · spf=pass · dmarc=pass` with `p=REJECT` and strict alignment
  unrelaxed. This is why relaxing DMARC alignment on the first failure would have been
  the wrong fix — the failure was the key-publication lag above, and weakening
  `adkim=s; aspf=s` would have permanently degraded the domain's posture to work
  around a condition that resolved itself.

## 2026-07-29

### Changed

- **Cast-card image standard: the colour cartoon portrait replaces the brutalist silhouette**,
  going forward and across all episodes (maintainer decision, 2026-07-29). Ep03's Anna card places
  her committed portrait; Ep02's `host_des_fable.png` and `guest_michael_voss.png` are re-rendered
  under the same filenames from the committed portraits. Episodes 1–3 are **drafts, not published**
  (seen only by the maintainer and a small group of beta testers), so updating their art is a
  normal draft change, not a replacement of shipped/feed content.

- **31 of the repository's 51 issues moved off the project milestones onto a new
  `M0 — Extra remediation effort unrelated to project goals` (#85).** Every issue in the
  repository, open and closed, was audited against one criterion, quoted verbatim from #85 §2b:
  an issue is remediation if it exists because an agent failed to follow an existing guardrail,
  asserted something false, left work half-done, or because a guardrail itself was defective —
  as opposed to advancing the show, its infrastructure, or its tooling. **31 met it; 20 did
  not.** That is **61%**, against the "roughly 45%" #85 estimated from a 22-of-49 first pass.
  The full table — one row per issue, a one-line reason each, previous milestone recorded — is
  tracked at `docs/20260729-m0-remediation-audit.md`. Milestone counts moved M4 2/11 → 2/6 and
  M5 3/12 → 2/9 (open/closed, PRs included); the other twenty-two reassigned issues were
  previously unmilestoned. Every reassigned issue carries a comment naming the criterion and its
  previous milestone, and no issue was reopened, relitigated, or edited — reclassifying is not
  reversing.

  Twenty-three of the 31 were unambiguous. **Eight were genuinely borderline** — #5, #8 and #62,
  which #85 named, plus #44, #46, #58, #59 and #79, which the audit added as the same class as
  issues already confirmed. The executor's recommendations split four/four; **the maintainer
  ruled all eight remediation**, before anything moved, per #85 §4d. His ruling is quoted on the
  issue rather than paraphrased.

  **Why it took this long, in the maintainer's own words** (#85 §2c): *"the maintainer was naive
  enough to think the 'one time fix' promised was sufficient and the lag between him blindly
  believing that in spite of the mounting evidence to the contrary was the delay in correctly
  milestoning this corpus of work for what it truly is."* Each remediation issue was filed
  alongside an assurance that the underlying behaviour was now fixed. One at a time, each read as
  a closing entry. Only in aggregate is the pattern visible — which is exactly what a milestone
  view is for, and exactly what filing them under project milestones concealed.

  `README.md` and `ROADMAP.md` are corrected accordingly: the README's status section now states
  the ratio on the public front door instead of omitting it, and `ROADMAP.md` gains an M0 section
  and per-milestone notes naming which of M4's and M5's listed items are M0 items now.

### Added

- **Ep03 ("Session Two: The Results Are In") promoted from off-repo/gitignored zones into the
  tracked zone.** `episodes/ToldStraight-Ep03/` now carries the full artwork set — `cover.png`,
  `ch1.png`–`ch6.png`, `cast/clinician_anna_sinclair.png`, `alt-text.md` — the publish kit
  (`show-notes.md`, `youtube-description.txt`, `episode-copy.txt`, `transcript.{txt,md,vtt}`, all
  byte-identical from the session `publish/` folder, `cmp`-verified) and the recorded-from
  `script-draft-v1.md`. Audio stays out of git (the 19 MB mix + 50 stems remain in
  `~/ToldStraight-recordings/`); no `.html` twins (Ep02's are bespoke, no repeatable generator).
- **Ep03 artwork built by three Adobe Illustrator JSX builders under `tools/brand/`** (exhibit
  cards ch1–ch6; the SESSION TWO cover + Anna clinician card; a generic cast-cards builder),
  authored by the agent and run by the maintainer where the licensed Trade Gothic Next / Letter
  Gothic faces live — the agent does not render episode PNGs itself. The build scripts are tracked
  under `episodes/ToldStraight-Ep03/build/`; `*.ai` source is gitignored.
- **`episodes/cast.json` gains Ep03's two voices**, each with full provenance: Anna, the clinician
  (shared-library "Emma", `56bWURjYFHyYyVf490Dp`, Australian, `eleven_multilingual_v2`), and the
  host "Jared v3" (instant voice clone, `EY5FCjATHRuLwJJXcDmf`, from the 12-part corpus —
  supersedes for Ep03 the #91 Jared 1.0 config, kept for Ep01).
- **The five Archer-style host cast portraits and their provenance manifest, on the tracked
  path `episodes/cast/portraits/` (#90).** Flat-vector, *Archer*-adjacent 1:1 portraits generated
  by the maintainer in Google Gemini (Nano Banana 2): Jared Godar (host, the style/identity
  anchor — derived from private reference photos that are **never committed**), plus four
  synthetic characters anchored to his locked portrait — Owen (Ep01 expert), Des Fable (Ep02
  host), Dr. Michael Voss (Ep02 expert), and Dr. Anna Sinclair (Ep03 expert/clinician). Until
  this PR the art sat untracked — one `git clean` from gone (#68) and invisible to fresh clones,
  cloud sessions, and downstream use (avatars, Ep02 cast cards, email signature, M5 web
  presence). `manifest.json` was reconciled to disk: all five entries carry `"generated": true`,
  every present PNG has an entry, and no `generated:true` entry references a missing file — proven
  by pasted command output in the PR. Each file was eyeballed to confirm it is a generated
  cartoon, not a photograph. No reference photograph is committed. The `check-added-large-files`
  pre-commit gate (`--maxkb=1024`) blocked four of the five PNGs (1.0–1.9 MB each); per the
  config's own instruction — *"Do not fix this by raising --maxkb… add a path here instead, and
  say why"* — a directory-glob exclusion `episodes/cast/portraits/.*\.png` was added (maintainer
  decision, 2026-07-29), mirroring the #68 type-specimen exclusion. `--maxkb` stays 1024
  everywhere else; the glob (not per-file) keeps the re-runnable procedure working for
  Owen/Des/Voss/Anna and future portraits without another gate edit.

- **The Instant Voice Clone patch-tool config, recorded on tracked surfaces (#91).** Two
  IVCs were built 2026-07-29 from the Ep01 host-line session; a four-cell A/B (2 corpora ×
  2 models on the recorded t00 line, 828 credits) had the maintainer pick **"Jared 1.0"
  (`55ZBPsQ4TUfilRuaftR9`) on `eleven_multilingual_v2`** as the host-line patch config.
  Recorded in `docs/elevenlabs.md` § "Cloned voices", a dated outcome note resolving
  `docs/voice-capture.md`'s open IVC-or-PVC fork, and ADR 0017 (an ADR 0014 case-by-case
  model exception). "Jared 2.0" (`uRHCc17iD8J841Ag8zdr`, natural-pauses corpus) is kept as
  a spare by maintainer decision; the PVC slot stays held (ADR 0004 unchanged).

- **`docs/20260729-root-cause-analysis-20260727-29-failure-corpus.md` — the #84 root-cause
  analysis of the two-session failure corpus, written by a fresh `claude-fable-5` executor
  from both transcripts as primary sources (#84).** Covers the 2026-07-28 `claude-opus-5`
  session (88.06M tokens, 6h08m), the 2026-07-29 `claude-fable-5` session (45.05M tokens,
  2h12m), and the #60 lifecycle. **43 rule violations independently re-derived** (the six
  data-point comments' 27 rows confirmed and 16 added), every row quoting the rule in force
  at the moment of the act with a transcript line + UTC receipt; eight assurance-then-reversal
  instances, in every one of which a pre-claim check existed and cost at most one command;
  the guardrail audit's one-line result — every guardrail that *acts* (lane guard, gates,
  M0-as-observability) has a clean record, every guardrail that *reminds* was breached with
  its text in context; consumables measured with the #84 §8 script against a control
  (project-vs-process output split: 31.4% / 68.6% in v9, 0% project by the M0 criterion in
  v10); all seven systemic hypotheses given verdicts (five confirmed, two refined — notably:
  rails predicted compliance, model tier predicted nothing, with both models on both sides
  of the line the same night). Recommendations: 3 mechanisms, 2 templates, 2 prose —
  mechanisms outnumber prose, each with cost and named blind spot, each mechanism tied to a
  named failure it would have caught. The analyst-conflict (fable-5 analyzing fable-5
  incidents, the maintainer's explicit choice) is disclosed in the document's Methods, and
  maintainer quotes are masked to PG-13 grawlix per his 2026-07-29 rulings (spec addendum 1),
  which also waived the apology-grep acceptance criterion and directed the bleep of #84
  comment `5113162226`, executed and verified at 06:51:59Z.

- **`docs/20260729-m0-remediation-audit.md` — the tracked audit behind the reclassification
  (#85).** The criterion verbatim, the live inventory measurement, the maintainer's borderline
  ruling, all 51 rows, before/after milestone counts, the explicit non-goals, and one consequence
  recorded rather than absorbed: with #60, #81 and #82 on M0, the visual-identity deliverables the
  maintainer explicitly asked for (host imagery, email signature, business card, stationery) sit
  on no project milestone — #83 covers research and a decision brief only. That gap predates the
  reclassification; it is written down so it is visible rather than silently inherited.

### Fixed

- **`.github/labels.json` declared `retired: agent failure`, closing the label-checker drift
  (#87).** The label existed live (used on #60/#81/#82) but was never declared in the manifest,
  so `scripts/sync_labels.py check` exited 1 on every branch — a false-positive gate failure that
  blocked the queued #83/#84 launches. Maintainer's ruling, 2026-07-29 (#87 §4 Option 1): declare
  it rather than delete it, since it records as intentional a label already doing real semantic
  work. The declared entry mirrors the live label byte-for-byte (`color: 6E5494`,
  `description: "Closed because agent execution made it unusable — the work was still wanted"`).
  A negative test (seeded gap, restored) confirmed the checker still catches a real drift after
  the fix.

- **`AGENTS.md` § "Standing commitments to the maintainer" gains the receipts-vs-action-items
  rule (#87), promoted from `artifacts/rules-pending/20260729-receipts-vs-action-items.md`.**
  Folded into this PR by the maintainer's direction, 2026-07-29 ("Fold the rules-pending
  promotion into this PR"). The rule — a fenced block means "paste this," a "from here on"
  promise is persisted the same turn or not made, a session seed never outranks this file — was
  already durable at `~/.claude/CLAUDE.md` and in project memory but only bound this machine;
  landing it on the tracked `AGENTS.md` surface means it now binds cold-start, cloud, and
  fresh-clone sessions too. The pending file carries a local `PROMOTED` banner recording the PR
  number (not committed — the file is gitignored).

### Findings

- **Google Gemini "Nano Banana 2" for the cast portraits (#90).** Learned producing the set,
  invisible in the diff:
  - **Free tier.** The portraits were generated at no cost via the consumer Gemini app / AI
    Studio image UI (`https://gemini.google.com/images`); no paid image plan was needed.
  - **Best-in-class set consistency.** Its standout strength is holding **one face + one style**
    across an entire cast — the reason Jared's portrait is the locked anchor and the four
    synthetic characters are generated by referencing it, rather than prompted independently.
  - **Named-IP style filter, and the workaround.** The model refuses "Archer" (and named
    copyrighted shows/characters) as a style request. The fix that works is to **describe the
    aesthetic** — ligne-claire flat vector, bold uniform black outlines, hard-edged cel shading,
    1960s mid-century-spy deadpan, muted palette — and optionally upload a show screenshot as a
    *visual style reference only*, never naming the show in text.
  - **Head-and-shoulders weight lesson.** In a head-and-shoulders crop, "make him heavier" only
    lands when phrased as **face and neck** (fuller/rounder face, heavier jaw and neck) — asking
    for a heavier "build" changes nothing visible when the body is out of frame.

- **The de-gapped cloning corpus beat the natural-pauses corpus.** Removing every
  inter-line silence from identical source audio produced the clone the maintainer
  preferred — the opposite of the intuition that joins would teach broken timing (#91).
- **`eleven_multilingual_v2` beat `eleven_v3` for this cloned voice** on inflection and
  pacing, against ADR 0014's repo default — hence the recorded exception in ADR 0017 (#91).
- **The IVC upload wizard caps files at 10 MB each** (min 10 s total). At 48 kHz/24-bit
  mono WAV that is ~69 s per file; a multi-file upload of lossless splits satisfies it.
  ElevenLabs transcodes uploaded WAVs to MP3 server-side either way (#91).
- **Scoped API keys fail voice creation closed:** `POST /v1/voices/add` without the
  `create_instant_voice_clone` permission returns `missing_permissions` before doing
  anything — a zero-cost probe for whether a key can clone. TTS with an existing cloned
  voice needs no such permission (#91).

## 2026-07-28

### Added

- **`episodes/ToldStraight-Ep01/_v1-archive/` — the eight v1 artwork PNGs archived, copy-not-move,
  before issue #60's visual-system re-set touches them.** Satisfies one acceptance item of #60's
  RE-SCOPE comment (§2, "the originals are archived, never overwritten"); #60 itself stays open
  with seventeen-plus deliverables remaining. The eight PNGs (`cover.png`, `show-cover.png`,
  `ch1.png`…`ch6.png`) and `alt-text.md` are copied byte-identical into the archive; the
  originals are untouched and stay live under `episodes/ToldStraight-Ep01/`. A `README.md` in
  the archive states at the point of use that the files are permanent and must never be deleted —
  their provenance is unrecoverable (zero embedded metadata) and they are attached to an episode
  already on the private feed.

- **`docs/adr/` — fourteen architecture decision records, a template, and an index (#62).**
  Nine migrated from `ROADMAP.md` § "Decisions and what they constrain" (0001–0009,
  each preserving its `**Constrains M<n>:**` linkage as `## Consequences`; 0006 is a
  pointer to `AGENTS.md` § "Recorded divergences", which stays authoritative) and five
  backfilled from decisions that previously survived only in issue comments (0010–0014,
  each carrying a verbatim block quote of its named source: the SPF `~all` finding, #54's
  iCloud+ criterion, #43's per-turn-stems decision, #30's Rulesets/signed-commits
  declines, and the maintainer's 2026-07-28 model decision). `ROADMAP.md` § Decisions is
  replaced by a pointer and a compact index; the governing principle, stated in
  `docs/adr/README.md`: **a decided thing is an ADR; an undecided thing is roadmap.**
  The migrated 0002 corrects the entry's stale `uv run audition --check-rates` to
  `uv run voicelab rates` rather than migrating a command that errors (staleness already
  on record under #30).

- **`docs/runbook.md` — infrastructure and account procedures, sourced or honestly
  stubbed (#62).** DNS-by-change-set (pointing at `infra/README.md` as authoritative),
  billing-rate re-verification, Identity Center permission-set reprovisioning, and the
  host-stem replacement path. Two parts are explicit **stubs** naming what is missing
  rather than plausible commands: the ElevenLabs console click-path for key rotation
  (never walked in a recorded session) and the recorded-take → stem substitution step
  (no tracked command exists; `docs/recording-runbook.md` §9 hands off exactly there).

- **A decision-capture habit in `AGENTS.md` § "Definition of done" and the PR template
  (#62) — both labelled in-file as prose.** A PR that records or changes a decision
  adds or updates an ADR. **Nothing enforces this**, and `gh pr create --body-file`
  bypasses the PR template entirely; both files and `docs/adr/README.md` say so
  plainly, per the maintainer's §4C decision that this is habit, not mechanism.

- **Fifteen load-bearing files promoted out of the gitignored `artifacts/` zone onto tracked
  paths (#68).** They reached no fresh clone, no cloud session and no cold start, and were
  single-copy on one laptop. Landed: four Adobe builder scripts for the visual system to
  `tools/brand/`; the InDesign type-shootout guide, both Identity Center walkthroughs and
  the domain-availability research to `docs/`; the design tokens and the type-decision
  contact sheet to `brand/`; the two live IAM policy JSONs to `infra/policies/`; the
  PM-lane-guard test harness to `scripts/pm_lane_guard_matrix.py`; the voice-preview sweep
  manifest to `pipeline/tests/fixtures/`; and the Ep01 host read sheet to
  `episodes/ToldStraight-Ep01/`. The `1x/` directory name and the PNG's bare
  `told-straight-type-shootout.png` were renamed on the way to satisfy `CLAUDE.md`
  § "Generated artifacts must be self-describing". **No deletions** — sources were moved,
  and the two files excluded on security or pending-decision grounds were not touched.

- **`docs/aws-billing-access-finding.md`** — an admin principal denied on a billing page is
  never a permissions gap, because `AdministratorAccess` already grants every billing
  action; it is an account-level switch only root can flip, and root is not gated by it,
  which is why the same page can render for root and deny for an IAM admin simultaneously.
  Carries the method as well as the fact: the finding was settled only by signing in **as
  the affected principal**, after an earlier draft asserted the switch was active on the
  strength of a page rendering for somebody else. The IAM username and root click path from
  the original working note are deliberately omitted — this repository is public.

- **`tools/brand/` gains the locked wordmark builder (#60); `docs/adr/0015` records the
  dual-lockup decision.** The approval-run `…-wordmark-locked-builder.jsx` (21,289 bytes)
  promotes byte-identical from `artifacts/brand-wip/`, matching the #68 pattern; the
  companion options builder deliberately stays in `brand-wip/` as decision context, not
  promoted. ADR 0015 quotes the maintainer's dual-lockup instruction and approval verbatim
  from issue #60's two decision comments — horizontal lockup for wide surfaces, stacked for
  square-leaning, the stamp as a device rather than a lockup, M1 (`TS` in a ruled box) as the
  16px-degradation-winning compact mark, and the authority-line satellite as the default
  (variant A). #60 stays open; this is the promotion slice, not the deliverables phase.

- **The commit-body rule is landed and demonstrated by this PR's own commit** (`AGENTS.md` §
  "Canonical work-item workflow" step 5, `artifacts/specs/TEMPLATE.md` Step N+1). Applied
  verbatim from `artifacts/rules-pending/20260728-squash-commit-extended-description.md`,
  which is removed in this same PR — promoted, not left pending. Measured basis: this repo
  squashes with `squash_merge_commit_message: COMMIT_MESSAGES` on single-commit branches, so
  a branch's commit body becomes the permanent extended description under the squash merge
  on `main`; the last 8 squash bodies ran `1·128·1367·133·1·1·757·2522` bytes, and the
  1-byte bodies trace exactly to specs whose commit step was a bare `git commit -m`. Every
  future spec's commit step now reads `git commit -F <file>` with a curated 500–2,500-byte
  body instead.

- **The favicon set, README header, and both remaining brand builders land on tracked paths
  (#79) — approved 2026-07-28, existed only on gitignored paths until now.** Two Illustrator
  builders promoted to `tools/brand/` (favicon derivation, README-header-and-social-cards),
  byte-identical to their `artifacts/brand-wip/` sources per pinned blob SHAs. Ten favicon files
  land under `brand/favicon/` (16/32/180/512px light and dark, an SVG master, and the 900px M1
  reference) and five cards under `brand/web/` (README header light/dark at 1280×400, GitHub
  social preview stacked at 1280×640, OG card stacked at 1200×630 plus its dark alternative).
  The rejected `favicon-32-framed.png` and five rejected web-card variants
  (`readme-header-a/c/d`, `github-social-oneline`, `og-card-oneline`) stay untracked, per the
  maintainer's decisions on #60. `README.md` now opens with the header behind a `<picture>` +
  `prefers-color-scheme` switch, immediately above the `# audio-lab` heading.
  [ADR 0016](docs/adr/0016-favicon-readme-header-and-card-surfaces.md) records all four
  decisions — favicon framing, header variant, card treatment, and which two surfaces
  theme-switch — quoting the maintainer verbatim from #60. Uploading the GitHub social preview
  itself (Settings → General → "Social preview") stays a maintainer action, not a commit.

### Changed

- **The four stale "blocked by the model decision" statements are retired (#62).**
  `ROADMAP.md` M3 now records the decided architecture (markup editor with live
  preview, ADR 0014) with the parameter-grid cost re-framed as the `multilingual_v2`
  exception-path price; M2's blocker line records both original blockers resolved; the
  § "Open decisions" bake-off entry is a one-line pointer to ADR 0014 — the
  decided-is-ADR principle executing for the first time — with "Label taxonomy
  refinements" untouched. The M3 and M5 milestone descriptions were corrected by the
  maintainer directly before this PR ran; this PR added only the `ADR 0014` / `ADR 0008`
  cross-references, verified by read-back. M5's description had been false
  independently of the model decision — `ROADMAP.md` recorded it unblocked on
  2026-07-26, filed as part of #75.

- **`scripts/pm_lane_guard_matrix.py` discovers the repository root instead of hardcoding
  it.** The file previously carried `REPO = "/Users/…/Code/audio-lab"` and ran on exactly
  one machine — tracking it unfixed would have reproduced the defect #68 exists to close.
  Discovery anchors on the **script's own location**, not the caller's working directory,
  because a bare `git rev-parse --show-toplevel` resolves against the caller and breaks the
  run-from-anywhere requirement; that reasoning is a comment at the function so a future
  session doesn't "simplify" it back. Verified 51/51 green executed from `/tmp`, and the
  not-a-repo path exits 1 with a clear message rather than a traceback.

- **`check-added-large-files` keeps its 1024 KB limit and gains a single named exclusion.**
  The type-shootout contact sheet is 1,229 KB and would be the first tracked file over a
  megabyte — 5.4× the next largest. It is 7060×10700 and exists to be read at size, so
  downscaling destroys its only purpose, and re-encoding through `sips` makes it *larger*
  (2.3 MB). The gate was **not** raised: doubling `--maxkb` would weaken it for every future
  commit on a public repo to admit one deliberate file. The exclusion carries its reasoning
  as a comment at the line, and a control run confirms a fresh 1,200 KB file is still
  rejected.

- **`CLAUDE.md` § "Repo shape"** now states plainly that `artifacts/` is scratch and that
  anything load-bearing gets promoted out, with the rule of thumb that a tracked file
  needing to point into it is proof it does not belong there. `tools/brand/`, `brand/` and
  `infra/policies/` added to the same list.

- **`AGENTS.md` § "Definition of done" gains the mechanism that would have caught #30's and
  #31's falsehoods (#30, #31).** A PR that adds or renames a CI job now must state in its
  body whether the check is required or advisory — a check that cannot block a merge must
  never be presented as a gate. This is the shared root cause behind both issues: a tracked
  file described CI/branch-protection state, the state changed, and nothing made the
  description follow.

- **#31's branch-protection divergence recorded in both `AGENTS.md` and `ROADMAP.md` (#31).**
  Decision: keep audio-lab's settings exactly as they are — 8 required checks,
  `enforce_admins: true`, `required_linear_history: true`, `strict: true` — against 2 on
  `macos-system-health`, none on `ecg_anomaly_detection` (branch protection unset, HTTP 404),
  and 403 on `github-portfolio-modernization` (private, free plan, unavailable regardless).
  Reasoning: audio-lab is the only public repository of the four, so the strictest settings
  belong on the most exposed one. Reversal condition recorded verbatim: relax `strict` only
  if ≥2 PRs in a week need otherwise-unneeded rebases — not because the settings feel heavy.
  ecg's unprotected `main` is recorded as a deferral in `ROADMAP.md` rather than filed as a
  new cross-repo issue now, per that repo's own house issue standard.

- **`label-drift-gate.yml` documents Gap 3's ratified decision (#30 Gap 3).** The gate stays
  post-merge by design — it detects label drift, it does not prevent it. A pre-merge
  `pull_request` check was considered and rejected: it would add a networked gate to every PR
  touching `labels.json` to close a minutes-wide, main-only drift window, and that cost
  outweighs the risk here.

- **`brand/20260727-toldstraight-design-tokens.css`'s two dark-theme `UNVERIFIED` hedges are
  replaced with the measured ratios (#60, #79).** `--ts-red: #E4564F` (5.05:1 on `#14140F`) and
  `--ts-grey-web: #9A968E` (6.27:1) both pass AA body text; measured against a WCAG 2.x checker
  validated on five controls first. The justification is recorded at the value, per the
  warnings-belong-at-the-point-of-use rule: the unchanged print red `#B02A28` measures **2.82:1**
  on the same dark stock and fails AA body, AA large, and AAA, so a future session "restoring
  brand accuracy" by putting it back would break accessibility.

### Fixed

- **`infra/README.md` no longer tells readers the two IAM policies "exist only in the
  console".** The passage at :393-405 is replaced with links to both files at their tracked
  paths and their statement counts; the request for a human to paste the JSON from the IAM
  console is gone. The real underlying access limit — `iam:ListPolicies` is denied to
  `AudioLabDeploy` — is retained, along with the note that widening IAM to unblock
  documentation would be the wrong fix.

- **Two stale pointers into the gitignored zone.** `infra/README.md:676` sent a fresh clone
  to `artifacts/aws-identity-center-{setup,roles}.md`, which it does not have; it now links
  `docs/`. `ROADMAP.md:196` pointed at `artifacts/voice-cloning-guide.md` and now points at
  `docs/voice-capture.md`. `CLAUDE.md`'s "51 paired permit/deny cases" claim now cites the
  tracked harness that substantiates it.

- **`.github/workflows/quality.yml` no longer asserts the opposite of live branch protection
  (#30).** The comment at the top of the file said `Tests (pipeline)` was NOT in main's
  required-status-checks list and instructed readers not to treat it as a gate — true when
  written, false since 2026-07-27 when #30 §4 option 1 made it required, and left uncorrected
  for a day. Replaced with a comment stating it IS required, dated, citing #30.

- **`CLAUDE.md` documented a CLI entry point that errors (#30).** Both `uv run audition`
  occurrences (§ Repo shape, § ElevenLabs specifics) replaced with `uv run voicelab` /
  `uv run voicelab rates` — the entry point moved when the v1 tool was archived to
  `archive/audition-v1/` in #29. Verified by running `uv run voicelab --help` from
  `pipeline/`. `ROADMAP.md:178` carries the identical stale command and is left unfixed here
  — out of this PR's scoped diff — and flagged as an owed follow-up in the PR body.

### Findings

- **The repository asserted the `eleven_v3` model decision as both made and open at the
  same time, in four places (#62).** #62 §2 Gap 2 listed "`eleven_v3` chosen over
  `multilingual_v2`" as a decided thing (#10), while `ROADMAP.md` § "Open decisions"
  carried the same bake-off as open and **blocking M3's entire architecture**, echoed
  by `ROADMAP.md` lines 52/80 and the M3 milestone description. The PM raised the
  contradiction on 2026-07-28 and the maintainer resolved it the same day, in session:
  the v3-over-multilingual_v2 call was made personally and is real, **and**
  `multilingual_v2` is not retired — it stays available for case-by-case calls. Both
  halves are recorded verbatim in ADR 0014; a future session must not read "v3 was
  chosen" as licence to delete the `multilingual_v2` path.

- **The `infra/README.md` falsehood was false at the moment it was written, not the result
  of later drift.** The commit introducing "They exist only in the console" (`c26abab`,
  under #54) landed at 11:35:09; the policy JSONs it denied the existence of were sitting
  on disk beside it with mtimes of 10:19–10:28 — roughly an hour earlier. The #54 executor
  correctly identified two *other* files in that directory as stale and did not look at the
  four dated JSONs next to them. Worth recording because the failure mode is not "the
  document went out of date": a tracked file asserted the absence of something it had not
  checked for, and the assertion then asked a human to redo work already done.

- **A credentials-hygiene gitignore pattern false-positives on design tokens.** The global
  `**/*token*` rule (written for auth tokens) silently refused to stage
  `brand/*-design-tokens.css`, a stylesheet measured clean of every secret pattern whose
  only occurrence of the word is its title comment. `git add` reports nothing when a path is
  ignored, so this surfaces as a file quietly missing from the commit rather than as an
  error. Resolved on the maintainer's decision by narrowing the global pattern with a
  documented negation; a control (`my-auth-token.json`) confirms genuine token filenames are
  still blocked.

- **The falsehood class first named on #68 had two more tracked instances, and this PR closes
  both (#30, #31).** #68 recorded a third instance (`infra/README.md`) of the same mechanism:
  a tracked file describes CI or branch-protection state, the state changes, and nothing makes
  the description follow. The first two instances — `quality.yml`'s stale required-check
  comment and `CLAUDE.md`'s stale CLI reference — are fixed by this PR, closing #30 and #31.
  Three instances in one week is the actual signal: `AGENTS.md` § "Definition of done" now
  carries a general line (a PR that adds/renames a CI job states whether it's required), but
  as recorded on #30, that line by construction catches only the CI-check-shaped instance —
  neither `CLAUDE.md`'s CLI reference nor `infra/README.md`'s "exists only in the console"
  claim involves a CI check. Widening the mechanism beyond CI checks is a live open question,
  not resolved by this PR.

## 2026-07-27

### Added

- **`docs/recording-runbook.md` — a new session document taking recording from zero to
  handed-off takes (#69).** `docs/voice-capture.md` covered room, mic and cloning
  decisions but had zero Fish blocks and no mechanics for producing a file —
  `grep -ci fish docs/voice-capture.md` = 0. The runbook adds ten sections: pre-flight,
  room options (bedroom ideal plus a documented in-situ desk variant with soft-mass
  damping and the empirical room-tone gate), the room-tone probe itself, an Audition
  zero-to-first-record click-path (marked **MANUAL** — authored from product knowledge,
  not clicked this session), capture conventions for a continuous take, both episode
  scripts inline (Ep01's 27 lines, Ep02's 22), an IVC voice-clone corpus section,
  save/verify/handoff, and what not to do. Every Fish block that isn't the Audition
  click-path was **executed this session against synthetic audio** — a digital-silence
  WAV for the room-tone probe, a tone-plus-silence file for the trim command, two
  format-matched WAVs for the ffprobe/peak-check loop — to prove the command syntax runs
  on this machine's ffmpeg 8.1.2; the pass-bar numbers a real session measures (actual
  room-tone dBFS, actual take peaks) are not reproduced here, since there's no QuadCast on
  this machine. Ep01's 27 inline turn ids were verified against the real host stems on
  disk: `ls output/episodes/ToldStraight-Ep01-v2/stems/ | grep host | grep -oE '^t[0-9]+'
  | sort -u` produces the identical 27-id set the runbook lists.

- **`episodes/ToldStraight-Ep02/` committed — 23 files, closing a four-day gap where the
  repository held half the published season (#64).** The initial commit `f9e662a`, named
  "episodes 1 and 2", contained only Ep01; Ep02's complete asset set — seven 1600×1600
  chapter/cover PNGs, a `cast/` folder of three personnel-file cards Ep01 does not have,
  four transcript formats, both show-notes formats, `alt-text.md`,
  `captions-autosync.txt`, `episode-copy.txt`, `youtube-description.txt`,
  `transcript-markup.txt`, and both `record-*.txt` files — existed only in a working
  directory on one disk. Measured before committing: `find … | wc -l` = 23, every PNG
  1600×1600 via `sips`. **Excludes** `session-one-skills.mp3` (17.8 MB) and
  `told-straight-ep02.mp4` (16.4 MB), consistent with `CLAUDE.md` § "Repo shape" keeping
  episode audio outside git — verified with the negative test
  `git ls-files episodes/ToldStraight-Ep02 | grep -c -E '\.(mp3|mp4)$'` = 0. The `cast/`
  cards (`host_des_fable.png`, `guest_michael_voss.png`, `studio_disclaimer.png`) satisfy
  #60 §5's requirement that the synthetic co-host never be presented as a real person, and
  predate that requirement being written down. `ROADMAP.md` § "Where we are" corrected: it
  had claimed both episodes' assets were in-repo, true of Ep01 and false of Ep02 for four
  days.

- **`README.md` rewritten for a listener and a developer, and the repository's empty
  discovery fields filled (#58).** The old file's second heading was `## Setup` and its
  first line described "podcast generation via the Save to Spotify CLI" — nothing above
  the fold said there was a show, what it was about, or that `toldstraight.com` existed.
  The new one opens with *Told Straight* and Season 1's subject, carries a dated status
  table (first commit 2026-07-22, public 2026-07-23, domain 2026-07-26, mail and the
  54-stem/10:29 Ep01 rebuild both 2026-07-27), then a developer section on the four
  things here that are genuinely unusual — per-turn stems and why they pay for
  themselves, the measured 0.55× billing rate, the hosted zone as a CloudFormation
  parameter, and the agent contract's hooks — with setup moved **below** it. The
  `pre-commit install` warning survived verbatim, including its both-directions
  verification; it was moved, not lost, because a tracked `.pre-commit-config.yaml`
  installs nothing and CI only catches a secret after it is already in local history.
  **The truthfulness constraint outranked the tone and is stated bluntly in the file:**
  "Nothing here is listenable, and that is not a soft 'not yet'." There is no public
  feed, no player, no link, and `git check-ignore` confirms the master sits under the
  gitignored `output/` tree — the v1 private feed is named as `ROADMAP.md`'s claim
  rather than restated as fact. `description` and six `topics` set via
  `gh repo edit` and verified by read-back; **`homepage` deliberately left empty**
  because the apex has no `A` record, and `has_wiki` left alone as the maintainer's call.
  Two badges adopted, both reading live from the Actions API (`Quality gates` on `main`,
  `Full-history secret scan`); a licence badge **rejected** because `LICENSE` is a
  *scoped* MIT with `episodes/` all-rights-reserved and GitHub reports `licenseInfo` as
  `other`, and a tests badge rejected because `Tests (pipeline)` is not among the four
  required checks on `main`.

- **`AGENTS.md` § "Definition of done" gained the milestone-closure trigger for the
  README status section (#58 §4C option 1, chosen by the maintainer).** A PR that closes
  a milestone's last open issue also refreshes the status section and its
  `Last updated:` date, checkable with
  `gh api repos/Jared-Godar/audio-lab/milestones --jq '.[]|select(.open_issues==0)|.title'`.
  **Written, not in force** — it is a line in a contract file with nothing gating it,
  exactly the weak form `AGENTS.md` § "The artifact is not the behavior" names. Option 2
  (a scheduled staleness workflow, the only variant that would actually catch drift) was
  offered and not chosen; recording that here so the gap is a decision rather than an
  accident.

- **`toldstraight.com` now sends and receives mail at iCloud+, and the anti-spoofing
  guarantee survived the change (#54).** M5. The mail lockdown deployed six hours earlier
  in #22 was **deliberately, partially undone** — the RFC 7505 null MX (`0 .`) and
  `v=spf1 -all` are gone, replaced by iCloud's two mail exchangers
  (`10 mx01/mx02.mail.icloud.com.`), an SPF policy authorising iCloud **and nothing else**,
  Apple's `apple-domain=` ownership token, and a `sig1._domainkey` CNAME delegating DKIM to
  Apple. **DMARC and CAA are untouched**: `p=reject; sp=reject; adkim=s; aspf=s` is still
  published and is where enforcement actually lives, so the #22 protection was *narrowed
  from "no sender at all" to "exactly one sender"*, not traded away. Chosen over WorkMail
  (discontinued mid-issue) and SES+Lambda: **$0 marginal cost**, a real mailbox, and no
  forwarder component whose failure mode is silently lost mail.
  Deployed as **two** CloudFormation change-sets against the existing `toldstraight-dns`
  stack (`--change-set-type UPDATE`), each described and read before execution, both
  reaching `UPDATE_COMPLETE`; the hosted zone stayed a **parameter**, and the resource-type
  census of every change-set was checked to contain **no `AWS::Route53::HostedZone`**.
  **TTLs on the three changed records are 300, not 3600, on purpose** — the null MX told
  resolvers "this domain accepts no mail", which at 3600 could have kept bouncing mail for
  an hour past cutover; 300 makes the cutover observable and the rollback fast. Restoring
  3600 is an owed follow-up, named in the PR rather than silently skipped.
  **The logical ids `SpfRecord` and `NullMxRecord` are now misnamed on purpose**, and this
  is the one place the spec was not followed literally: it directed renaming them to honest
  names. Measured instead of argued — a rename produced a change-set of three `Add`s and
  **two `Remove`s, each carrying `PhysicalResourceId: toldstraight.com`**, i.e.
  CloudFormation would have created the new record sets and then issued `DELETE` against
  the live ones in its cleanup phase, risking the removal of SPF and Apple's verification
  token together. Keeping the ids yields `Replacement: False` in-place modifications, which
  is what the spec's own §4 said to expect. Both change-sets were built and pasted, and the
  maintainer chose; the losing one was deleted rather than left lying around.
  Verified two independent directions with a `google.com` control through the identical
  path (`aws route53 list-resource-record-sets` **and** authoritative
  `dig @ns-235.awsdns-29.com`), plus a negative test confirming apex `A`, `vote` and
  `auditions` still resolve to nothing and CAA is byte-identical. **Not verified, and
  reported owed rather than claimed:** the two-directional mail test (#54 §7), which needs
  a mailbox that exists only on Apple's side. `infra/README.md` gains the mail
  architecture, the verified Apple click path for adding/revoking an address, and the
  rollback — and its **"Note on mail" was rewritten because #54 made it false**, along with
  its **two-policy IAM section, which had been describing a three-policy reality**.

- **The durable contracts are re-injected every turn, and a mid-session change is now
  announced instead of silently ignored (#33).**
  `.claude/hooks/contract-reinjection.sh` is a tracked `UserPromptSubmit` hook — the
  event name, payload shape and `hookSpecificOutput.additionalContext` return path
  verified against the current documentation (`code.claude.com/docs/en/hooks`,
  2026-07-27) rather than assumed, because naming an event that does not exist yields a
  hook that silently never fires. Every turn it emits a **generated** digest of
  `AGENTS.md`, `CLAUDE.md` and `~/.claude/CLAUDE.md`: their SHAs, sizes and section
  headings, computed from the files at hook time. Nothing is hand-maintained — a
  hand-written digest is one more artifact that can lie, which is the defect #33 exists
  to remove. When a SHA differs from what the session last saw, it **escalates**: names
  the sections added, modified and removed, injects their full text (bounded at 16,000
  bytes; a file over 8,000 degrades to changed-sections-plus-re-read and says so), and
  instructs the session to re-read before citing. The failure it answers was observed
  here — a session spent half an hour quoting an `AGENTS.md` that had been rewritten
  thirty minutes earlier, in that same session, by a PR it had itself verified.
  **Measured cost, paid on every turn while registered:** 2,794 bytes (~700 tokens) on
  the first turn of a session, **2,575 bytes (~645 tokens) steady state**, 4,040 bytes
  (~1,010 tokens) on an escalation — recorded in `CLAUDE.md` § "Contract re-injection"
  rather than buried, along with the fact that the steady-state figure scales with the
  number of section headings, so every new `AGENTS.md` section costs a line per turn
  forever. **It fails open, always**, and that was demonstrated across six
  failure modes, not asserted: contract file renamed, `python3` off `PATH`, corrupt
  session state, garbage stdin, empty stdin, helper script deleted — every one exits 0
  and injects nothing, and it never exits 2, which would block and erase the prompt.
  **Stated plainly: it cannot make an agent read what it injects.** It removes the
  excuse, not the possibility. Registered in the **tracked** `.claude/settings.json` so
  cold-start, cloud and fresh-clone sessions inherit it. This is **net-new, not a
  port** — no context-injecting hook exists in `macos-system-health`,
  `ecg_anomaly_detection` or `github-portfolio-modernization`; all four repos' hooks are
  `PreToolUse` deny hooks — and it is recorded as a deliberate divergence in `AGENTS.md`
  § "Recorded divergences from the reference repositories", per the parity checklist.

- **The four PM/executor workflow templates were ported, so specs stop being hand-rolled
  from nothing (#34).** Every executor spec and launch block written here on 2026-07-26
  was invented from scratch, and they were wrong in ways the templates prevent by
  construction — one handed the executor the merge signal, one was six words long and
  dropped a working config, and relays shipped as prose interleaved with fences.
  Ported, each naming its source file inline and marking every adaptation
  **⟨audio-lab adaptation⟩** so divergence is visible rather than silent:
  `artifacts/specs/TEMPLATE.md` ← `macos-system-health/artifacts/specs/TEMPLATE.md`
  (13,577 b), `docs/PM-WORKFLOW.md` ← its 13,684 b namesake,
  `prompts/EXECUTOR-SEED-PROMPT-TEMPLATE.md` ←
  `macos-system-health/prompts/2026-07-21-issue-45-executor-seed.md`, and
  `templates/task-spec.md` ← `github-portfolio-modernization/templates/task-spec.md`.
  Structure and section ordering are preserved deliberately; divergence from the
  reference is what produced #34. The spec template keeps the two sections whose absence
  is directly traceable to the observed failures — **§8 "Verification status of this
  spec's claims"** and the separate **§ Handoff** block. Four adaptations are real and
  marked: this repo has no `effort:`/`status:`/`risk:` labels and no
  `label-policy.json`; `artifacts/specs/` is **tracked** here and specs are copied
  byte-identical to `prompts/`; **push and PR-open are NOT gated here** (the reference
  repo gates them — `AGENTS.md` § "Do these automatically" explicitly permits them, and
  only merging is gated); and every launch pins the **full model id** (`claude-opus-5`)
  rather than the `opus` alias, which silently resolves to whatever is latest for the
  account. Both repo-specific carry-forwards are present: the `gh issue comment` launch
  record ships **inside the same fence** as the `claude` invocation, and the model id is
  never an alias. `AGENTS.md` § "Canonical work-item workflow" now points at all three
  templates so an author finds them without knowing they exist. **They are scaffolds,
  not gates** — nothing enforces their use, and the docs say so.

- **`pytest` runs in CI (#30 Gap 4).** A `Tests (pipeline)` job in
  `.github/workflows/quality.yml` runs the 55-test suite on every PR and push to `main`.
  ffmpeg and ffprobe are installed when the runner lacks them, with bounded retries and
  a message that names an apt failure as an external condition rather than a repo
  defect — five tests are ffmpeg-gated and would otherwise skip silently, making a green
  run cover less than it appears to; `-ra` prints skip reasons so the log always shows
  how much actually ran. **Disclosed rather than implied: this check CANNOT block a
  merge.** `main`'s required-status-checks list is `Lint, format and secrets`,
  `Locked environment (pipeline)`, `Locked environment (spotify)`, `Changelog updated`
  — read live on 2026-07-27 — and adding to it is a branch-protection change that only
  the maintainer can make. Shipping a test job that looks like a gate and is not is
  precisely the failure `AGENTS.md` § "The artifact is not the behavior" names, and
  #30 §4 warns about it by name. #30 stays **open**; only its Gap 4 is addressed here.

- **Voice-capture guide promoted from a gitignored working note to a tracked reference,
  and extended with hardware, software, and room guidance (#44).**
  `artifacts/voice-cloning-guide.md` moved to `docs/voice-capture.md` — it now has to be
  usable on a phone, next to a microphone, which is what a gitignored file can't be. Every
  account claim was re-verified live (`GET /v1/user/subscription`, `GET /v1/models`):
  7,511/130,552 credits used, 0/30 voice slots, **0/1 professional clone slots** — an exact
  reconfirmation of the 2026-07-26 baseline, zero credits spent by this PR. Three new
  sections cover what the original guide never named: **Hardware** (HyperX QuadCast vs Zoom
  H2essential, recommending QuadCast pending a real A/B shootout — the maintainer's existing
  gear is sufficient, no purchase suggested), **Software and settings** (Adobe Audition over
  GarageBand over Voice Memos, 48 kHz/24-bit WAV mono, and naming the specific trap that
  Adobe Podcast Enhance / Audition Speech Enhancement is a generative reconstruction that
  must never touch cloning source audio), and **Choosing the room** (the bathroom ruled out
  for flutter echo, the living/dining room loses despite housing the gear because it adjoins
  the kitchen, the bedroom wins on soft mass) with two ASCII plan/side-view diagrams and a
  reversal condition stated honestly (furnishing beats floor plan — a clap test settles it,
  not the document). "Where this interacts with the pipeline" is rewritten against #43's
  actual per-turn-stem architecture: it now names both host-replacement routes without
  picking one — narrate directly (zero credits, `episodes/cast.json`'s `host` role is marked
  `interim: true`) versus clone-then-synthesize (~1,163 credits, the measured 27-turn host
  share of the #43 render). `artifacts/voice-cloning-guide.md` is left as a one-line pointer
  rather than deleted; it stays gitignored, unchanged by this PR.
- **`render-episode` bakes in the Ep01 v2 mastering chain (#46).** The assembly step
  was a uniform-gap concatenator; the post-production recipe the maintainer approved for
  the Ep01 v2 master lived only in a gitignored scratch script, so nothing in the repo
  could regenerate it or apply it to Ep02. `pipeline/core/episode.py` gains
  `master_from_stems`, which runs the full chain in its physics-fixed order —
  **per-speaker loudness match → concat with structure-aware gaps → high-pass + gentle
  compression → tempo → loudness-normalize (last)** — and returns the per-speaker
  loudness *before and after* matching plus the final integrated loudness, so callers
  prove the gap closed and the target was hit, not merely that ffmpeg exited 0. The
  parser now flags **chapter-start turns** (`Turn.chapter_start`; 0/8/16/24/32/40 for
  Ep01), and `smart_gap_ms` gives them a section beat (500 ms), snaps quick replies
  around short interjections (180 ms), and leaves normal handoffs at 300 ms — structure,
  not speaker, since the dialogue strictly alternates. `render-episode --assemble` now
  produces the finished master by default (`--tempo 1.08`, trim, smart gaps, `--loudnorm
  -16`, polish), each step overridable (`--no-trim`, `--no-smart-gaps`, `--no-polish`,
  `--no-loudnorm`, `--tempo`) or bypassed wholesale with `--raw`. Verified by
  regenerating the real Ep01 master from the 54 cached stems (**zero credits**):
  `ebur128` measured **−16.4 LUFS** (target −16 ±1) and the Daniel/Jofra gap closed from
  **2.0 dB → 0.0 dB**; 10.49-min master, `mp3/44100/mono/192k`. Five new tests
  (55 total), ffmpeg-gated where they touch audio, network untouched, zero credits.

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

- **The PM-lane guard's two documented, untracked holes are narrowed — and the residue
  is named rather than papered over (#48).** Hole 1: the `Bash` branch matched command
  *verbs* only, so `printf … > AGENTS.md`, `tee`, `sed -i`, `cp`, `mv`, `dd` and
  `truncate` walked straight past it — a PM session could edit any tracked file by
  shelling out. That is not hypothetical exploitation: **the guard was once narrowed by
  using the hole in the guard**, which is the documented history of the file. It now
  resolves redirect and write-command destinations against the same allow-list the
  `Write` branch uses (in-repo and outside `artifacts/` is refused), reusing the
  existing quoted-span stripping so a path inside an issue body cannot trip it. The
  extraction is deliberately narrow, because a false deny taxes the maintainer's own
  work: only `cp`/`mv`'s final operand counts, `sed` needs `-i` as a real flag token
  (not a substring, or `sed -n 1,5p release-info.txt` would be refused), and
  `truncate -s 0` does not treat `0` as a path. Hole 2: `~/.aws`, `~/.ssh` and
  `~/.gnupg` are now denied to the `Write`/`Edit` tools for **every** session including
  executors — that check runs *before* the `AUDIO_LAB_EXECUTOR=1` early exit, since an
  executor is the session most likely to be running unattended. `aws configure`,
  `ssh-keygen` and `gpg` are unaffected, and `~/.claude/` stays writable because the
  global contract requires a standing rule to be persistable in the same turn it is
  agreed. **Verified with 51 paired permit/deny cases, both lanes, all passing** — every
  deny shipped with the permit it must not have broken, and `CLAUDE.md`'s capability
  table was rewritten so no row claims enforcement the hook does not have. **The hook
  header now says plainly that this is a lane marker, not a sandbox**, and the five
  bypasses it names — `bash -c`, a script file, `python3 -c`, `perl -i`, `make` — were
  each **run to confirm they are genuinely still open** rather than listed from
  reasoning. What changed is the bar: from trivially bypassed by the obvious method to
  requiring deliberate circumvention.

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

### Fixed

- **`docs/voice-capture.md:377` told the maintainer to name Ep01 host takes
  `narration/H01..H27`, which the assembler cannot match (#69).**
  `pipeline/core/episode.py`'s `ordered_stems()` sorts by `turn.index`, and Ep01's 27
  host turns are the **even** indices `t00, t02, … t52` — not a contiguous 1..27 range.
  Demonstrated with a negative test rather than asserted: a throwaway `H01.wav` matches
  zero of the 54 stems in `output/episodes/ToldStraight-Ep01-v2/stems/`
  (`grep -c '^H01'` = 0), while `t00` matches exactly one (`grep -c '^t00'` = 1). The
  correct instruction already existed — in the gitignored
  `artifacts/20260727-ep01-v2-host-read-sheet.md` — while the tracked guide, the one a
  cold-start session or a fresh clone would read, carried the wrong one. Fixed in place;
  the checklist now cross-references `docs/recording-runbook.md` and the read sheet by
  path. Ep02's own `H01..H22` convention was checked against the same ground truth and
  left as-is: `episodes/ToldStraight-Ep02/record-host-ep02.txt` (22 host lines) has no
  per-turn stem assembler yet — `output/episodes/` holds only `ToldStraight-Ep01-v2/` —
  so there is no stem for an `HNN` name to fail to map onto.

- **Two overclaims in `README.md` that had gone stale, found by running the commands
  instead of trusting the prose (#58).** The file documented an entire `uv run audition`
  workflow — `--engines`, `--shortlist`, `--cast`, `--tier`, `--check-rates`,
  `--list-models` — none of which exists: `uv run audition` fails with
  `Failed to spawn: audition`, because the entry point moved to `voicelab` when the v1
  tool was archived to `archive/audition-v1/` in #29. And the first line advertised
  "Spotify listening-data analysis" as a headline capability, while `spotify/main.py` is
  a five-line stub that prints `Hello from spotify!`; the layout table now calls it a
  scaffold with a `spotipy` dependency and a 2022 export, with no analysis written yet.
  **`CLAUDE.md` § "Repo shape" still says "`uv run audition` is the CLI" and was left
  alone** — issue #58 §5 scopes this change out of the contract files beyond §4C, so it
  is reported as an owed follow-up rather than fixed off-spec.

- **A test that could only ever pass on one machine — caught within minutes of wiring
  pytest into CI (#30 Gap 4).** `test_manifest_entry_matches_sweep_schema` read its
  reference schema from `artifacts/voice-previews/manifest.json`, which is **gitignored**
  (`.gitignore` `artifacts/*`, zero tracked files under that directory). It passed
  locally and failed on the first CI run — `1 failed, 54 passed` — which is precisely
  what #30 predicted in writing: *"the 11/11 pass reported on PR #29 is a local
  result."* The reference is now a **tracked** fixture at
  `pipeline/tests/fixtures/voice-preview-manifest-schema.json` — one entry copied
  verbatim from the 2026-07-26 sweep (public ElevenLabs shared-voice metadata, nothing
  account-specific). **Proven in both directions rather than merely seen passing:** with
  a seeded key-order regression in `manifest_entry()` the test fails; restored, the full
  suite is 55/55 with zero skips. The fixture deliberately lives in `tests/fixtures/`
  and **not** `tests/data/` — `data/` is gitignored repo-wide under "Personal data
  exports", so the obvious directory name would have reproduced the identical bug, which
  `git check-ignore` was used to confirm before choosing the path. Repair option chosen
  by the maintainer from four presented; the one-line `skipif` was rejected because it
  would have cut CI coverage to 54 while looking green.

### Findings

- **Two scripts can carry the identical-looking naming shorthand and be correct for one,
  wrong for the other — because "wrong" is defined by whether an assembler exists to
  contradict it, not by the shorthand itself (#69).** Ep01's guide told the maintainer to
  write `H01..H27`; that's provably wrong because `pipeline/core/episode.py` already has
  54 rendered stems on disk keyed by turn id, and an `H01.wav` matches none of them.
  Ep02's script tells the maintainer to write the same `H01..H22` shape, and it's
  correct — not because the convention differs, but because nothing has rendered Ep02
  into per-turn stems yet, so there is no ground truth for it to disagree with. **Auditing
  one script's naming convention proves nothing about a sibling script's**, even when the
  shorthand looks identical; each has to be checked against its own assembler state, not
  against the other's verdict. This needs re-checking the moment Ep02 gets a per-turn
  render.

- **Apple's Custom Email Domain verifier string-matches the SPF record it issues, so
  `~all` is mandatory rather than advisory (#54).** The domain was deployed first with
  `v=spf1 include:icloud.com -all` — semantically *stricter* than Apple's instructions,
  and correct on the reasoning that iCloud is the only sender. Apple rejected it: *"Check
  your SPF record — make sure the settings you updated match the ones sent to you."* The
  verifier does a **literal string comparison against the value it issued** and does not
  evaluate SPF semantics, so a stronger record can never pass, and the error message
  blames the record rather than naming the mismatch. **Caching was excluded before
  concluding this**, not assumed: the `-all` record was confirmed live on *both* the
  authoritative nameserver and public resolvers — the old `v=spf1 -all` gone from public
  view — before Apple was retried. Fixed by a one-value change-set. **The security cost is
  bounded and is not where enforcement lives:** DMARC stays `p=reject` with strict
  alignment, and the `~all`/`-all` difference reaches only receivers doing an SPF-only
  check with no DMARC lookup, for whom spoofed mail moves from hard reject to softfail.
  Recorded loudly at the resource in `dns.yaml` because **this is the record most likely to
  be "improved" back by a future reviewer** — `-all` is exactly what a security review asks
  for, and changing it un-verifies the domain at Apple and breaks mail when nobody is
  watching.

- **A CloudFormation logical id cannot be renamed, and renaming one that owns a live DNS
  record is a delete-then-create (#54).** Renaming `SpfRecord` → `ApexTxtRecords` and
  `NullMxRecord` → `MailMxRecord` produced a change-set of three `Add`s and two `Remove`s,
  where **both `Remove`s carried `PhysicalResourceId: toldstraight.com`** — the live apex
  TXT and MX. CloudFormation creates first and deletes in its cleanup phase, so the
  sequence would UPSERT the new record sets and then issue `DELETE` against the live ones.
  Keeping the ids produced `Modify` with `Replacement: False` — a clean in-place UPSERT.
  Takeaway: **an honest comment costs nothing; an honest identifier can cost a live DNS
  record.** Measured by building both change-sets and describing them — creating a
  change-set deploys nothing, which makes it a free way to turn "I think this is risky"
  into a receipt.

- **An empty Fish command substitution inside a quoted string silently deletes the whole
  argument (#54).** `echo "apex A: "(dig +short @ns A toldstraight.com)" (empty=good)"`
  printed **nothing at all** when the record was absent — not an empty value, no line. The
  negative test in the acceptance criteria therefore *looked* like it had passed while
  producing no evidence whatsoever, which is the exact shape of a false green: an empty
  result and a broken probe are indistinguishable. The fix is to capture into a variable
  and test `count`. Worth recording because the failure mode is invisible on the success
  path and only manifests on the case the check exists to catch.

- **A stale `__pycache__` can survive a same-size file restore and produce a phantom
  failure.** After restoring `core/voice.py` from a backup during the negative test
  above, the suite kept failing while the on-disk source, the editable install path and
  `git status` all said it was correct — Python was serving a `.pyc` compiled from the
  seeded version. Clearing `__pycache__` and `.pytest_cache` resolved it. The lesson is
  narrow but sharp: **when a test result contradicts the file you just verified, suspect
  the cache before you re-reason about the code** — and clear caches on *both* sides of
  a seeded-regression test, or the negative and positive halves are not comparable.

- **Bash 3.2 — what macOS ships and what runs these hooks — mis-parses a `case`
  statement inside `$( … )`, and `bash -n` does not catch it.** The substitution is
  scanned for its closing paren without understanding `case`, so the unbalanced `)` in a
  pattern like `tee)` terminates the substitution early. The symptom is a *runtime*
  `syntax error near unexpected token 'newline'` reporting a line number from a
  completely different part of the file, while `bash -n` reports the script as clean.
  Found while building the #48 write-detection: the guard silently allowed every
  `tee`/`cp`/`mv` case until this was traced. Two fixes work — write patterns as
  `(tee)` with a leading paren, or move the block into a function defined outside the
  substitution. The function was chosen, because a function body is parsed once at
  definition and is immune by construction. **Consequence for this repo: `bash -n` is
  not sufficient verification for a hook. Execute it.**

- **A `while read` loop silently discards the last line when the input has no trailing
  newline.** `printf '%s' "$x" | tr … | while read -r seg` dropped the final segment of
  every command, so `echo x | tee AGENTS.md` was allowed — the `tee AGENTS.md` half was
  the part thrown away. The guard's own test matrix caught it; the fix is `printf
  '%s\n'`. Worth recording because the failure is *silent and asymmetric*: it only ever
  loses the last item, so a rule looks like it works right up until the case that
  matters is at the end of the line.

- **The two ElevenLabs v3 voices came out ~2 dB apart, and −16 LUFS is the delivery
  target (#46).** Measured over their trimmed stems, Jofra (EXPERT) sat at −16.8 LUFS and
  Daniel (HOST) at −18.7 — a **2.0 dB** imbalance, audible on a quiet listen, that no
  amount of master-level normalization fixes (it sets the *overall* loudness, not the
  balance *between* speakers). The fix is a per-speaker gain match **before** concat,
  because two voices can't be re-separated once glued into one file. The whole master is
  then normalized to **−16 LUFS** (Apple/podcast standard, true-peak −1.5 dBTP), and
  crucially that normalize is the **last** link: compression shifts loudness, so
  normalizing before polishing would just be undone. Order is not stylistic here — it is
  match → concat → polish → normalize, full stop.
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
