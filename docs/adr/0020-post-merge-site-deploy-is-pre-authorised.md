# ADR 0020 — Publishing `site/` after a confirmed merge is pre-authorised, and CI performs it

- **Number:** 0020
- **Title:** Publishing `site/` after a confirmed merge is pre-authorised, and CI performs it
- **Status:** `accepted`
- **Date:** 2026-08-01
- **Source:** Issue #187, maintainer decision comment "Maintainer decision — 2026-08-01".

> **Correction, 2026-08-01 (#196) — the decision stands; one mechanism detail below was wrong.**
> This record states that the trust policy pins the subject to
> `repo:Jared-Godar/audio-lab:ref:refs/heads/main`. GitHub actually issues this repository an
> **immutable** subject carrying numeric owner and repository ids
> (`repo:Jared-Godar@16855088/audio-lab@1309379475:ref:refs/heads/main`), so the first deploy
> failed at `AssumeRole`. The role now trusts **both** fully-qualified forms — same repository,
> same ref, no wildcard in either. **Nothing about the reasoning changes:** the boundary is still
> enforced in AWS rather than in the workflow file, and it is still one ref. The reversal
> conditions below are unaffected, and condition 1 in particular remains exactly as written.

## Context

Conduct rule 6 in [`AGENTS.md`](../../AGENTS.md) reads, in part: *"Destructive, irreversible,
money-spending, or outward-facing actions require his confirmation at the time of the action;
authorization in one context never extends to the next."*

`aws s3 sync site/ "s3://$BUCKET/" --delete` against the production bucket is all three things
rule 6 names at once. It publishes to the public internet (outward-facing), it removes bucket
objects that are absent from `site/` (destructive), and once an object is served from a CDN edge
the publication cannot be recalled (irreversible). Under rule 6 as written, no agent may run it
without confirmation at the moment of running.

That rule, applied literally, produced a measured failure mode rather than safety. Every website
PR merged and then stopped: the deploy was left as manual maintainer work. The consequence is
recorded in #187 — *"the PR merges, and then the maintainer manually runs the S3 sync to make the
change actually visible. That step is real work, it is easy to forget, and forgetting it means
`main` and the live site silently disagree."* The local `main` checkout was found five commits
behind `origin/main` on the same day (#189), which is the same class of drift on a different
surface.

Three options were put to the maintainer in #187: **A** a standing post-merge authorisation, **B**
an agent that always proposes the sync and waits for a go, **C** GitHub Actions deploying via OIDC
on push to `main`. The filing session recommended B now and C later, on the reasoning that B
removes the forgetting without narrowing rule 6.

That recommendation was rejected.

## Decision

From the maintainer's decision comment on #187, verbatim:

> **Option B is rejected.** Its confirm-at-action-time step defeats the purpose: the goal is for
> this to happen **seamlessly, without additional input**.
>
> **Decision: A + C.**
>
> - **A — standing post-merge authorisation.** `AGENTS.md` gets an explicit, narrow exception to
>   conduct rule 6 covering *this specific action only*: syncing `site/` to the production bucket
>   **after a confirmed merge**. Every other destructive, irreversible or outward-facing action
>   still requires confirmation at action time. The exception is written as an exception, naming
>   the rule it narrows and why.
> - **C — implement GitHub Actions via OIDC.** This is the mechanism that delivers A. With CI
>   performing the deploy on push to `main`, neither an agent nor the maintainer runs
>   `aws s3 sync` at all, and the deploy happens even when no session is running.

And on the end state the decision serves:

> Once local website update preview and PR merge should be my only required manual gates and
> activities, automate the rest.

So: **two manual gates and only two — approving the local preview before the commit, and merging
the PR.** Everything after the merge happens without the maintainer.

## Consequences

**Constrains M5** (MVP static site) and **M10** (repo structure & provenance).

**What rule 6 now says.** Rule 6 is unchanged in every other respect. It gains one named
exception, written in `AGENTS.md` § "Hold for the maintainer" as an exception rather than as a
silent absence: publishing `site/` to the production bucket, *after* a merge that GitHub reports
as `MERGED`, is pre-authorised. Registering domains, creating billable AWS resources, changing
repository visibility, deleting branches, and every other outward-facing action continue to
require confirmation at action time. Prior authorisation still does not carry forward for
anything else — this exception is the only carve-out, and it is bounded by a mechanism rather than
by an agent's judgement.

**The exception is safe because the mechanism, not the agent, enforces the boundary.** Option A on
its own would mean an agent holding credentials that can publish, trusted to run them only after a
merge. Option C removes the agent from the path entirely:

- The deploy runs from `.github/workflows/deploy-site.yml`, triggered by `push` to `main`. Merged
  content is by definition content that passed every required check.
- The AWS role `AudioLabGitHubDeploy` (`infra/github-oidc.yaml`) has a trust policy pinning the
  OIDC subject to `repo:Jared-Godar/audio-lab:ref:refs/heads/main`. A token minted for a pull
  request, a tag, a feature branch, or another repository fails at `AssumeRole`. **Editing the
  workflow on a branch to deploy early does not work** — the gate is in AWS, not only in the
  workflow file.
- The role can write to one bucket, invalidate one distribution, and read one CloudFormation
  stack. It cannot create infrastructure, touch DNS, or reach the mail records.
- No session ever holds credentials that can publish. There is no key to leak: GitHub mints a
  short-lived OIDC token per run.

**What agents must now do, and must not do.** The post-merge closure pass (`AGENTS.md` step 8)
confirms the deploy *ran and succeeded* and reports the result. It does **not** run
`aws s3 sync` — an agent doing so by hand from its own shell would route around branch protection
and is precisely what this decision removes. If the workflow fails, that is surfaced to the
maintainer, not worked around.

**Creating the AWS resources is still maintainer work.** Authoring `infra/github-oidc.yaml` is
executor work; deploying it creates an IAM identity provider and role, which is billable and
outward-facing, and so goes through the maintainer via a reviewed change-set like every other
stack in this repository. Until that stack is deployed, the workflow exists and fails at
`AssumeRole` — written, not in force.

**The other half of #187 is unaffected by this narrowing.** The mandatory local preview before
commit is a gate that *tightens* the workflow, not one that loosens it, and it needs no exception
to any rule.

## Reversal condition

Reverse this — return `site/` publication to confirmation at action time — if any of the
following becomes true:

1. **The trust boundary is shown to be wider than stated.** If a token issued for anything other
   than a push to `main` in `Jared-Godar/audio-lab` is ever observed assuming
   `AudioLabGitHubDeploy`, the standing authorisation is withdrawn until the trust policy is
   fixed and re-verified.
2. **A merge publishes something the maintainer did not intend to be live.** The premise of the
   carve-out is that merged content is reviewed content. If the merge gate stops being a real
   review gate, the deploy gate has to come back.
3. **The role's permissions grow beyond publishing.** The exception is scoped to one bucket and
   one distribution. Any expansion of `AudioLabGitHubDeploy` re-opens this decision rather than
   inheriting its authorisation.

Reversal is cheap by construction: disabling the workflow stops all automated publication, and
the manual procedure in `docs/site-deploy-walkthrough.md` § 3–4 remains documented and working.
