# ADR 0008 — No Free Tier credits exist — Identity Center is free to enable

- **Number:** 0008
- **Title:** No Free Tier credits exist — Identity Center is free to enable
- **Status:** accepted
- **Date:** 2026-07-26 (checked as root)
- **Source:** `ROADMAP.md` § "Decisions and what they constrain" (entry migrated by #62).

## Context

Checked 2026-07-26 as root: Billing → Credits shows $0.00 remaining, $0.00 used, zero
active credits. AWS's warning that creating an Organization expires Free Tier credits
**permanently** is real but has nothing to consume here. Billing is already live — the
domain purchase transacts on pay-as-you-go — so the Free Plan → Paid Plan upgrade is a
no-op.

## Decision

Enable IAM Identity Center; there are no Free Tier credits to lose by creating the
Organization it requires.

## Consequences

**Unblocks M5.** The surviving constraint is not financial: Identity Center is
**Region-locked per organization**. Set the console to `us-east-1` before enabling —
changing it later means deleting the instance and losing every user, group, permission
set, and assignment. `route53domains` and CloudFront certificates both require
us-east-1 anyway.

Note also that IAM users cannot see Billing at all until the root user activates
**IAM user and role access to Billing information** (Billing → Account). That is an
account-level switch, not a policy — `AdministratorAccess` does not bypass it.

## Reversal condition

Not recorded at decision time.
