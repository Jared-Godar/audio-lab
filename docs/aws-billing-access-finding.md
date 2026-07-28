# A billing "Access denied" under an admin principal is not a permissions gap

**Status:** durable finding. Found 2026-07-26 while wiring AWS access for this project;
preserved on issue #68 and promoted to a tracked path 2026-07-28.

## The finding

`AdministratorAccess` is `"Action": "*"` on `"Resource": "*"`. It **already grants every
billing and cost-management action there is.** There is no billing action it omits.

So when a principal holding `AdministratorAccess` gets *Access denied* on a billing or
cost page, the conclusion is counterintuitive but firm:

> **It is never a permissions gap, and no policy will fix it.**

Attaching another policy, widening an existing one, or hand-crafting a `billing:*` or
`ce:*` grant accomplishes nothing, because the permission was never missing.

## Why it happens instead

Billing visibility for non-root principals is gated by an **account-level switch**, not by
IAM: *IAM user and role access to Billing information*. Two properties make it confusing:

1. **Only the account root user can change it.** No IAM admin can, regardless of policy.
2. **Root is not an IAM user or role, so the switch does not gate root.**

Together those produce the symptom that reads as a bug: **the same billing page can render
correctly for root and deny for an IAM administrator at the same moment.** Nothing is
broken and nothing is misconfigured — the two principals are being evaluated by different
mechanisms.

## What to do about it

- **Do not widen IAM** in response to a billing denial. It is the wrong lever and it
  permanently loosens the account to fix a problem it cannot reach.
- Recognise the shape: admin principal + billing surface + `AccessDenied` = the
  account-level switch, not the policy.
- Changing the switch requires the root user and is a maintainer action. It is outside
  what any agent session does here.

## The method that actually settled it — carry this across, not just the fact

An earlier draft of this note asserted the switch was **already active**, and cited a
billing page rendering successfully as the proof. That was **an inference stated as
fact, and it was wrong** — the page that rendered had been loaded by a different
principal than the one being denied.

It was resolved only by **signing in as the affected principal and re-checking.** That is
the control that settles it: a page rendering for *somebody* proves nothing about whether
it renders for the principal in question. This is the same discipline `AGENTS.md` §
"Verify with a control" requires — run the known case through the identical path, or a
broken check and a real result are indistinguishable.

## Related

- [`infra/README.md`](../infra/README.md) — the account's Identity Center setup, permission
  sets, and the reasoning for short-lived credentials over a static access key.
- [`docs/aws-identity-center-setup.md`](aws-identity-center-setup.md) and
  [`docs/aws-identity-center-roles.md`](aws-identity-center-roles.md) — the fuller
  walkthroughs.

**Provenance:** found by the PM thread 2026-07-26 during AWS access setup; the reasoning
was preserved verbatim on issue #68 (maintainer decisions comment, 2026-07-27) before the
working note holding it was deleted, and promoted here under #68. The IAM username and the
root-account click path from the original working note are **deliberately omitted** — this
is a public repository and neither is needed to act on the finding.
