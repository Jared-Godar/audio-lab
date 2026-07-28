# ADR 0001 — Route 53 auto-creates the hosted zone → CloudFormation manages records, not zones

- **Number:** 0001
- **Title:** Route 53 auto-creates the hosted zone → CloudFormation manages records, not zones
- **Status:** accepted
- **Date:** 2026-07-26 — embodied in `infra/dns.yaml` as authored under #13.
- **Source:** `ROADMAP.md` § "Decisions and what they constrain" (entry migrated by #62); #13.

## Context

Registering through Route 53 creates a hosted zone automatically, pre-wired to the
domain's nameservers.

## Decision

`infra/` templates take `HostedZoneId` as a **parameter** and manage `RecordSet`s inside
it. The zone stays outside CloudFormation.

## Consequences

**Constrains M5:** every `infra/` template treats the zone as an input, never a resource.

Why it matters: if a stack owned the zone, `delete-stack` would destroy it, and
recreation mints four new NS records that no longer match what the registrar publishes —
the domain goes dark until nameservers are manually repointed. Keeping the zone out
makes stack deletion survivable. Cost: $0.50/month.

## Reversal condition

Not recorded at decision time.
