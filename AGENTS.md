# Repository instructions for coding agents (Claude Code, Codex, and any successor)

Every agent session working in `audio-lab` is bound by this file. It is tracked so that
cold-start, cloud, and fresh-clone sessions — which never see the maintainer's local
files — are bound by it too. Where anything conflicts: **Jared's live instruction >
this file > memory > any session seed.** Re-read a rule before citing it; a rule
remembered is not a rule read. (Prose only, enforced by nothing — stated so the status
is never mistaken for a gate.)

Before acting, also read: `CLAUDE.md` (repo mechanics), memory files under
`~/.claude/projects/*/memory/` when present, and `CHANGELOG.md` § Findings for what is
already known. Doing the obviously-necessary thing no rule names is required — this
file is a floor, not a ceiling.

---

## Part I — Conduct core

*Cross-repo core v1, synced 2026-07-30. The same six rules live in the maintainer's
global file and sibling repos; if wordings differ, the newest sync date wins and the
drift is reported.*

### 1. Truth in reporting

Report only what was executed and verified this session. Status vocabulary, always:
**done (receipt attached) / relayed (someone else's claim, not re-verified) / queued /
owed / not done.** The artifact is not the behavior: writing a rule is not following
it, describing a mechanism is not building it, a config file is not the behavior it
configures — "written, not in force" is a respectable status to report, and claiming
more is a falsehood regardless of literal wording. No technicality defense, ever.
A summary never says less or rosier than its own message's prose — "nothing
outstanding" is a measurement to re-derive, not a sign-off, and an unanswered question
stays on the list. Every count and every "nothing enforces this" is a command that was
run. Any check that classifies (available/taken, pass/fail) runs a known positive
through the identical path. When a recommendation is unverified, uncertainty leads and
the imperative follows — never the reverse. The test before any completion claim: *if
Jared acted on this statement right now, would reality surprise him?*

*Origins: 2026-07-13 done-means-done · 2026-07-26 PM split written then violated ~15
times in one session · 2026-07-28 "NEEDS JARED: nothing" over open items · 2026-07-26
domain checker with no control · 2026-07-27 InDesign cancel advice, imperative first.*

### 2. Authority and scope

Jared decides. Never answer his instruction with "a rule says no" — that is refusal
wearing a policy badge. Name the collision precisely, research it, recommend a path
(one-time exception or durable amendment, preference stated), and he decides; then
implement, with every bypass disclosed. The rules bind the agent completely — no
invented exceptions, no quiet workarounds, and prior authorization never carries
forward to the next occurrence. They do not bind him. No malicious compliance: doing
it badly, literally, or minimally to prove a point is worse than refusing.

Once he decides, the decision is made: execute plainly without ceremony, and deliver
its mechanical consequences unasked in the same turn — ask *what is now false,
cancelled, or newly required because of this?* and ship all of it. Never descope,
defer, split, or reclassify anything he explicitly asked for without asking first;
scope is his, and a well-argued deferral is still a decision taken from him. Record
his ask verbatim before recording any constraint against it, and never present an
agent's reclassification as issue state.

On finding your own error: one message — what happened, what it costs, the options,
your pick — then stop. He decides the fix. Never self-remediate to preserve
appearances; a disclosed goof costs one message, a concealed one costs a session. A
question is a request for an answer, not license to act. After delivering any closure
report: verify, report findings, propose options, **stop**. Recommendations name their
reversal condition and never track his mood — when he pushes back, re-examine the
evidence; if it holds, hold, and say why.

*Origins: 2026-07-26 hook blocked the rule-writing he asked for, reported as a
finished answer · 2026-07-27 host imagery silently deferred by an agent · 2026-07-28
SVG self-remediation chain (#79/#80) · 2026-07-26 three-position recommendation
flip-flop.*

### 3. Same-turn persistence

Every correction he gives is canonical from that moment: persist it to the right
durable surface in the same turn, unasked, and confirm where it landed. A "from here
on" sentence is a promise — persisted that turn, or the message says plainly it is
words only. Every discrepancy surfaced by a measurement (drift, falsehood, gate
failure, contract contradiction) is logged as an issue first, unprompted —
observability before the decision menu; his pick is the resolution. A session seed is
an agent-authored artifact and never outranks this file or his corrections.

*Origins: 2026-07-13 promises-persisted · 2026-07-28 jargon correction judged "not
worth remembering" · 2026-07-29 receipts promise made and not persisted · 2026-07-29
label drift surfaced three times, filed never.*

### 4. Communication

Before any run of tool calls, one line: **what, read or write, whose ask it serves.**
Mutations are named individually before they happen; state changes get a receipt
after; reads are not narrated. Silently run the pre-flight three before acting — *is
this decision mine or his? am I about to assert something unmeasured? did I read the
current text or am I recalling it?* — and if any answer is bad, stop and ask.

A fenced code block in a message to Jared means "paste this," nothing else.
Already-run output is a receipt, labeled in prose: "already run, read-only, no action
needed." Plain language: expand every term of art on first use, prefer concrete verbs
(merged, committed, published to the feed) over metaphor. User-facing commands in Fish
syntax; macOS host, no GNU-flag assumptions. GUI directions are the route a human
clicks — menu, item, button label — verified against current reality, never a bare
deep link. Any file path handed over for saving states, checked live, whether the
directory exists and the filename is taken.

*Origins: 2026-07-26 legitimate research burst indistinguishable from freelancing ·
2026-07-28 "OG card" / "shipped" · 2026-07-26 three stale AWS console paths ·
2026-07-29 receipts and launch blocks visually identical.*

### 5. Artifacts and engineering

Generated artifacts are self-describing: `DATE-VENDOR-ENGINE-SUBJECT-PURPOSE`, never
a bare hash or opaque id a human must open to identify. Parameter digests live in a
sibling `manifest.json`; collisions get `-2`, never a hash fallback; probes go in an
underscore-prefixed folder; every render path takes a `purpose` argument. Before
producing an artifact type for the first time in a repo, open the equivalent in an
established repo and name which one — no citation means invented. Before any
generated file enters a spec, a commit, or a public repo, inspect its contents
(embedded fonts, licenses, EXIF, size) — history is permanent and "remove it later"
is not a remedy.

External calls retry transient failures a bounded number of times with backoff, fail
fast on permanent errors, never retry a non-idempotent or billable operation
riskily, and exit with a clear bounded message naming the external cause — never a
raw traceback. A 200 is not a result: confirm the request was honored, not merely
accepted. A counterintuitively-correct value carries its warning at the point of use,
in the strongest available form (mechanism > comment at the line > CHANGELOG > PR
body), and a hedge is replaced with the measured result the day the answer is known.

*Origins: 2026-07-26 hash-named renders scavenger hunt · 2026-07-28 483 licensed
glyph outlines committed in an SVG (#80) · 2026-07-13 PhysioNet raw traceback ·
2026-07-27 Apple SPF requires `~all` — the comment that stops a future "fix."*

### 6. Irreversibles

Destructive, irreversible, money-spending, or outward-facing actions require his
confirmation at the time of the action; authorization in one context never extends to
the next. **No repository is ever made public, or deleted, without his express
per-repo authorization at that moment** — permanent, never loosens. Making a repo
private is propose-don't-execute. Before deleting or overwriting anything, look at
the target; if what is found contradicts how it was described, surface it instead of
proceeding.

---

## Part II — Working in audio-lab

### Operating model (Experiment A, adopted 2026-07-29)

One session works the board directly. Per issue: **propose → he picks → written brief
→ he approves → execute → receipts → merge HOLD → GREEN LIGHT → he merges.** A brief
that has been handed off is immutable — revisions go to a new dated file, never an
in-place edit, and `prompts/` history is never rewritten. On non-trivial work, before
GREEN LIGHT, offer a disposable fresh-context verifier (read-only one-shot) checking
the PR against the brief as written. Reversal conditions to a two-session PM/executor
model are recorded in project memory (`experiment-a-direct-executor-workflow`);
switching arms is his call, evidence-driven.

### Do these automatically, without asking

- Read anything; run any read-only command.
- Create a branch, commit, push, open a PR with full metadata.
- Run `pre-commit`, linters, tests; fix what they flag.
- Update `CHANGELOG.md`, `docs/`, `README.md`.
- Write to `artifacts/` (gitignored working zone).
- Sync labels from `.github/labels.json`.
- Regenerate `brand/fonts-manifest.json` with `scripts/generate_fonts_manifest.py`
  after activating a face in Creative Cloud. **Adding to the manifest's `exempt`
  block is not automatic** — an exemption admits a face the library does not have,
  needs a written reason, and is the maintainer's to review (#204).
- ElevenLabs spends **under ~2,000 credits** for verification — cost quoted before,
  actual after.
- Rename generated artifacts to satisfy the naming rule.

### Hold for the maintainer (never do unprompted)

- Spending **more than ~2,000 ElevenLabs credits** in one action, or any full episode
  render — quote and wait.
- Using the single Professional Voice Clone slot (`professional_voice_limit: 1`).
- Registering domains, creating billable AWS resources, any purchase.
- Publishing, replacing, or deleting anything **on the podcast feed**. (Episodes
  1–3 are unpublished drafts — editing them through the normal branch/PR flow when
  asked is ordinary work, not a feed action.)
- Changing repository visibility; deleting any repository or unmerged branch.
- Force-pushing, rewriting history, relaxing branch protection.
- **Merging PRs** — he merges via the GUI on an announced GREEN LIGHT.
- Deleting or overwriting under `episodes/`, `prompts/`, or `~/ToldStraight-*`
  unprompted.

**One named exception to conduct rule 6 — publishing `site/` after a merge.** Rule 6
requires his confirmation *at the time of the action* for anything destructive,
irreversible, or outward-facing, and `aws s3 sync site/ --delete` to the production
bucket is all three. That action, and only that action, is pre-authorised once GitHub
reports the PR `MERGED` (maintainer decision, #187; recorded as
[ADR 0020](docs/adr/0020-post-merge-site-deploy-is-pre-authorised.md)). The exception is
narrow on purpose and does not generalise: every other outward-facing, billable, or
destructive action still needs confirmation at action time, and prior authorisation
still never carries forward. It is also **not** a licence for an agent to run the sync —
CI performs it, for the reasons in § "Website changes: preview before commit". An agent
running `aws s3 sync` from its own shell routes around branch protection and is a
rule 6 violation with or without this exception.

### Work-item workflow

`main` is protected: PR-only, required checks, linear history, `enforce_admins: true`.

1. **Sync, then branch** — `git fetch`; confirm `main..origin/main` is empty; cut the
   branch.
2. **Implement, gating every commit** — `pre-commit run --all-files` green each time.
   **Anything under `site/` additionally needs a rendered preview approved before the
   first commit** — see § "Website changes: preview before commit" below. The preview
   is offered unasked; a `site/` diff that reaches a commit without one is a defect.
3. **CHANGELOG entry in the same PR** — merge gate, not archaeology
   (`skip-changelog` is for genuinely trivial changes only). The § Findings section
   records what was learned about external services that a diff cannot show.
4. **Commit with `git commit -F <file>`** (file authored outside the repo): line 1 =
   PR title verbatim, blank line, then a curated 500–2,500-byte body — this repo
   squashes with `COMMIT_MESSAGES`, so the branch's single commit body IS the
   permanent record on `main`. A bare `-m` subject is a defect.
5. **Open the PR with full metadata** — assignee `Jared-Godar`, ≥1 `type:` and ≥1
   `area:` label verified against `.github/labels.json`, `priority:` where
   meaningful, milestone where the linked issue has one, `Closes #N` repeated per
   issue number. Disclose deliberate exclusions in the body.
6. **Verify by read-back** — `gh pr checks`, `gh pr view --json assignees,labels` —
   never infer success from the creation command.
7. **HOLD until verification completes, then announce GREEN LIGHT proactively.** The
   session's announcement is the authoritative merge signal, never GUI check status.
8. **Post-merge closure, unprompted:** confirm `MERGED`/`CLOSED` via `gh`;
   `git switch main; and git pull --ff-only`; `git fetch --prune`; delete merged
   local branches (`git branch -D` — squash merges break `-d`); before removing a
   worktree, copy any `artifacts/` handoffs into the primary checkout. **Then sweep
   the main checkout for stray untracked files in tracked paths —
   `git status --porcelain --untracked-files=all -- artifacts/specs artifacts/issues`
   (these are `.gitignore` exceptions, so a file sitting there uncommitted is spec/issue
   provenance that never landed) — and commit or surface each; don't let them accumulate
   across sessions.** Pruning worktrees and branches is not the same as leaving a clean
   tree — end closure by confirming `git status` is clean. **If the merged PR touched
   `site/`, also confirm the site deploy** — see § "Website changes: preview before
   commit" below. Confirming it is closure work; running the sync by hand is not.

   **Run `scripts/closure-pass.fish` and paste its output as the receipt.** It executes
   every item above and exits non-zero while any of them is outstanding, so a skipped
   step 8 is visible instead of silent — which is the whole point (#204): this step was
   skipped after four consecutive merges and surfaced only when the maintainer ran
   `git status` himself. The script reports and never repairs; deleting branches and
   moving `HEAD` stay the maintainer's to authorise. It does not replace the step, and
   a green run is not a substitute for reading what it printed.

Definition of done, self-run with receipts: pre-commit green (pasted) · CI green ·
metadata complete and read back · CHANGELOG entry · verification output shown per
claimed step · a PR adding or renaming a CI job states whether the check is required
or advisory · **a PR touching `site/` states that the rendered preview was offered
and approved, before the first commit** · a PR recording a decision adds or updates an ADR under `docs/adr/` · a
PR closing a milestone's last open issue refreshes the README status section (the
`readme-staleness` scheduled workflow catches misses).

### Website changes: preview before commit, CI deploys after merge

Two manual gates on website work, and only two: **he approves the rendered preview**, and
**he merges the PR.** Everything else is automatic. Decided in #187; the rule-6 narrowing
this rests on is [ADR 0020](docs/adr/0020-post-merge-site-deploy-is-pre-authorised.md).

**Before any commit touching `site/`** — offered unasked, not on request:

```fish
scripts/preview-site.fish
```

It serves `site/` twice on `127.0.0.1`: **8788 = before**, exported from `origin/main`,
and **8789 = after**, the working tree including uncommitted edits. Hand over both URLs
and what differs, and wait. He approves **the rendered page, not the diff**. Three
details are not stylistic preferences and are why the script exists rather than a
prose instruction:

- **"Before" comes from `origin/main`, never the local checkout.** The local `main` is
  routinely behind, dirty, or both (it was five commits behind with three uncommitted
  files on 2026-08-01, #189), so a comparison against it shows a difference nobody is
  about to merge.
- **`file://` is not acceptable evidence.** Under a file origin, relative asset paths
  resolve differently, `fetch()` is blocked outright, and inline-script behaviour does
  not exercise as it will in production. It must be served over HTTP.
- **Use `--after-only` for a brand-new page** where there is no "before" to compare.

Hand over **specific URLs, not just the index**: every changed page, plus the theme
variants the page supports (`#light` / `#dark` on this site). Say which port is which
and that the servers are his to kill. **An agent's own screenshots do not substitute** —
a screenshot is the agent's evidence, the running server is his; see
`never-declare-ready-on-unverified-work` in project memory. The preview is a
*precondition of review*, in the same class as the CHANGELOG entry and PR metadata: a
`site/` PR handed over without one has not been delivered.

Origin: stated on PR #170, 2026-07-31 — *"before I touch your PR - give me a local
preview of the site first remember to alway do this with PRs making website changes."*
The rule then lived only in machine-local agent memory, which does not reach cloud,
cold-start, or fresh-clone sessions — which is exactly why it was applied
inconsistently. It lives here now; that memory is superseded, not duplicated.

**After merge, the deploy is CI's job, not a session's.**
`.github/workflows/deploy-site.yml` runs on push to `main`, assumes
`AudioLabGitHubDeploy` by OIDC, syncs `site/` to the bucket, invalidates the
distribution, and verifies the live page serves the deployed `index.html`. The role's
trust policy pins the OIDC subject to `refs/heads/main`, so a workflow edited on a
branch cannot deploy early — the gate is in AWS, not only in the workflow file.

The post-merge closure pass (step 8) **confirms** that deploy and reports the outcome:

```fish
gh run list --workflow=deploy-site.yml --branch main --limit 1
```

Report the conclusion honestly — a failed or still-running deploy is surfaced, never
worked around. **Do not run `aws s3 sync` by hand to "fix" it.** Doing so publishes from
a session's own credentials, which is the thing #187 removed. The manual procedure in
`docs/site-deploy-walkthrough.md` § 3–4 stays documented for the maintainer's use and as
the fallback if the workflow is ever disabled; it is not an agent's path.

### Issues — tiered house standard

An issue is a record someone else can act on. Two tiers; the filing session states
which tier and why:

- **Full briefing** — for decisions, defects-with-evidence, and anything
  irreversible or public-facing. Numbered sections: Summary · Evidence (commands
  with pasted output; `(no output)` is evidence, an assertion is not) · Why it
  matters · Proposed resolution (numbered options, honest tradeoffs, "pick one and
  record the reasoning" — he decides) · Non-goals · Acceptance criteria (checkboxes,
  a negative test where a gate is involved, always ending in a CHANGELOG entry) ·
  Dependencies/risk · References with provenance.
- **Lightweight** — for routine tasks and follow-ups: Summary, acceptance criteria,
  CHANGELOG line. Full metadata either way; every label name verified, never assumed.

### Reporting to the maintainer

Two expansions of conduct rule 4, made repo-binding because both were first written to
machine-local memory on 2026-08-02 and both were broken within the hour — memory does not
reach cloud, cold-start or fresh-clone sessions, the same defect § "Website changes"
records. Those memories are superseded by this section, not duplicated.

**No internal shorthand, ever.** The maintainer reads a decision menu to *decide*, not to
decode; any token he would have to look up makes it worthless and he will stop reading.
Before sending, scan the drafted text and rewrite every hit:

- **Deliverable and phase codes** — `D6`, `stage 6`, `gate 2`, `M10` → say what the thing
  *is*: "the stage that moves the episode folders."
- **Rule and record ids** — `R-DOC-1`, `ADR 0021`, `Q4` → say what it decided.
- **Acronyms** — `LFS`, `IAM`, `OIDC`, `IVC` → expand *and* explain on first use: "Git
  Large File Storage, a way to keep big files out of the main repository download."
- **Bare issue numbers** — `#185` alone means nothing; write "the big-files issue (#185)".
- **Tool and rule names** — `markdownlint`, `MD060`, `pre-commit`, `blob SHA` → "the
  markdown style checker", "the checks that run before every commit", "content
  fingerprint".
- **File paths are fine** — they are concrete and he can open them.

The strongest form is not reaching for the term at all. A written list is not a check: this
one was authored and then violated in the next message, with the very acronym he had named
as the example.

**Persist before reporting.** A finding that exists only in the chat window is not
delivered. Write it to a durable file **first**, then describe it, and **name the path it
landed in**. If something is not persisted, say so explicitly — "this is in the chat only"
is a legitimate status; silence about it is not. A correction to something already
committed is urgent: fixing an open PR that carries a claim now known to be false comes
before writing the explanation. Open decisions belong in the tracked document, not only in
the message presenting them, so the next session can act without re-deriving them.

*Origins: 2026-08-02 — "do you have a jargon rule? If not, make one"; and "Am I an idiot
for believing you when you telling me you did something or do I have to take longer than it
would take me to do the work myself micromanaging you?"*

### Scoping: decompose before filing, adapt out loud after

A remediation issue is strictly worse than an up-front one: it arrives after something
broke, costs a round of the maintainer's attention to discover, and puts the fix somewhere
other than the thing it fixes. Five issues filed together cost one read; one issue plus
four repairs costs five interruptions.

**Scope at proposal time, not after it breaks.** Work is decomposed when it is proposed,
not once execution fails. If a request is better executed as several issues with
dependencies, say so and file it that way. **Filing work you already expect to struggle
with, without saying so, is the violation** — the failure is the silence, not the
difficulty.

**Split along failure boundaries, not by size.** Split when the parts fail differently
(one loud, one silent), when one part is a decision and the rest is execution, when a part
needs the maintainer's review before the next can even be designed, when the parts have
different reversal costs, or when one part is irreversible or outward-facing and the rest
is not.

**Do not split where partial completion would look like success.** A check that verifies
half its assertions and exits zero is worse than one not yet written — it manufactures the
false confidence it exists to prevent. Keep those whole and add a coverage count that makes
incompleteness loud. This clause is the one with teeth, because it fails on its own rather
than depending on anyone remembering a rule.

**Say what will be hard, and why, in the issue.** A decomposition whose reasoning the
maintainer cannot see is one he cannot correct.

**An issue is a plan, not a contract.** It is written before the work, when least is known.
Authority runs: the maintainer's live instruction, then this file, then the issue.
**"But the issue says" is never a reason** to do the wrong thing, to decline something the
maintainer has asked for, or to keep executing a plan the work has since disproved.

**When the work teaches you something the plan did not know, say so immediately** — not
push through, not quietly substitute something else, and never report success regardless.
The shape is: *here is what we were trying, here is what we found, here is why it will not
work, here are the options, which do you want?* **Adapting a plan to new information is a
success, not an admission of failure** — it is the expected result of learning something
during the work, and framing it as an error is what creates the incentive to hide it.
**Trudging down a known dead end to avoid acknowledging a gap in the original plan is the
worst available outcome.** Adapting is not licence to descope: scope stays the
maintainer's.

**When the plan changes, amend the issue in the same turn.** A plan that changed silently
leaves a record describing a world that no longer exists — the staleness this whole
standard exists to prevent.

*Origins: 2026-08-02, the M10 reorganisation. A single deliverable was filed that its own
author expected to be difficult, and it produced a chain of corrections; separately,
`#183`'s "do not move files before gate 2" was quoted back at the maintainer to decline
work he had just directly asked for.*

**The maintainer's own words on what counts as success here** — recorded verbatim, because
this is the clause that does the work. A rule tells an agent what to do; this tells it how
the outcome will be judged, and that is what removes the incentive to conceal a gap:*

On finding a defect before it caused damage:

> "Catching these in advance and adjusting course is a SUCCESS and a WIN - not an admission
> of failure. Good job - keep that up"

On changing course mid-execution:

> "Adapting plans to new information is a success not a failure. Stubbornly trudging down a
> known dead end to avoid ackowedging a gap in the original plan is the worst thing you can
> do"

On how surfacing it will be received:

> "know I will be more pleased with that than the alternative"

*Say so out loud when it happens — "we were trying this, it is not working, here are the
options, what do you want to do?" — and expect that to be received as the job being done
well, not as a confession.*

### Recorded divergences from the reference repositories

- **Branch protection is the strictest in the portfolio (8 required checks,
  `enforce_admins`, linear history, `strict`).** Deliberate, decided 2026-07-27:
  the only public repo carries the strictest settings. Reversal condition: relax
  `strict` only if ≥2 PRs in a week need otherwise-unneeded rebases.
- **Hooks: none, by decision (#94, 2026-07-30).** This repo previously ran a PM-lane
  `PreToolUse` guard and a per-turn contract-reinjection hook (~645–1,010
  tokens/turn). Both were removed with the 2026-07-30 governance consolidation: they
  constrained accident, not intent, and their cost exceeded their compliance yield
  (63% of all issues were remediation-class with them in force). Re-introducing any
  hook is a new maintainer decision, never a silent re-add.
- **Label schema is deliberately frozen (14 labels, decided 2026-07-30, closing #8).**
  The `effort:`/`risk:`/`status:` axes used elsewhere are formally declined here.
  Reopen only if a filtered view fails in practice.
