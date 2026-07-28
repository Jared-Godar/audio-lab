# ADR 0013 — Classic branch protection retained over Rulesets; signed commits declined

- **Number:** 0013
- **Title:** Classic branch protection retained over Rulesets; signed commits declined
- **Status:** accepted
- **Date:** 2026-07-27
- **Source:** issue #30, the "§4 decision applied and verified" comment
  (2026-07-27T16:40Z).

## Context

While applying #30 §4 option 1 (making all previously-advisory checks required),
GitHub's banner recommended migrating from classic branch protection to Rulesets, and
requiring signed commits was considered alongside.

## Decision

From the #30 decision comment, verbatim:

> - **Rulesets not adopted.** GitHub's banner recommends migrating from classic branch
>   protection. Declined deliberately: rulesets earn their complexity through org-wide
>   policy layering, and this is a single repository with no organisation. Re-expressing
>   a working configuration in a different model mid-stream risks dropping something
>   silently. Revisit if this becomes an org.
> - **Signed commits not required.** Deliberate exception: every executor commits over
>   CLI, and unconfigured signing in that environment would fail every agent commit —
>   real breakage in exchange for provenance a single-account repository already has.

## Consequences

**Constrains repo governance:** branch protection stays expressed in the classic model
(the configuration ADRs 0005 and 0006 describe). Any future protection change edits the
classic rule rather than migrating models as a side effect. Agent sessions commit
unsigned by design; a signing requirement would break every executor commit until
signing is configured for that environment.

## Reversal condition

For the Rulesets half, verbatim from the source: "Revisit if this becomes an org."
For signed commits: not recorded at decision time.
