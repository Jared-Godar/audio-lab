# ADR 0010 — SPF must stay `~all` because Apple string-matches the record it issues

- **Number:** 0010
- **Title:** SPF must stay `~all` because Apple's Custom Email Domain verifier
  string-matches the record it issues
- **Status:** accepted
- **Date:** 2026-07-27
- **Source:** `CHANGELOG.md` § Findings, 2026-07-27 entry (#54).

**The operative warning is not this file.** It lives as a comment at the `SpfRecord`
resource in [`infra/dns.yaml`](../../infra/dns.yaml) — the file a future session would
actually edit — per the house rule that warnings belong at the point of use. That
comment outranks this ADR; this ADR is the *reasoning record*, not the enforcement, and
nothing here replaces or relaxes it.

## Context

`toldstraight.com`'s SPF record was deployed first the semantically stricter way and
Apple rejected it. From the named source, `CHANGELOG.md` § Findings, 2026-07-27,
verbatim:

> **Apple's Custom Email Domain verifier string-matches the SPF record it issues, so
> `~all` is mandatory rather than advisory (#54).** The domain was deployed first with
> `v=spf1 include:icloud.com -all` — semantically *stricter* than Apple's instructions,
> and correct on the reasoning that iCloud is the only sender. Apple rejected it: *"Check
> your SPF record — make sure the settings you updated match the ones sent to you."* The
> verifier does a **literal string comparison against the value it issued** and does not
> evaluate SPF semantics, so a stronger record can never pass, and the error message
> blames the record rather than naming the mismatch.

## Decision

The apex SPF value stays `v=spf1 include:icloud.com ~all`. It must never be "improved"
to `-all` — doing so un-verifies the domain at Apple and breaks mail at a moment nobody
is watching.

## Consequences

**Constrains M5 (mail):** every future DNS review, security audit, or template edit
must leave `~all` alone. This is exactly the record a security review would tighten,
which is why the warning sits at the resource itself. The security cost is bounded and
enforcement does not live in SPF: DMARC stays `p=reject` with strict alignment, so the
`~all`/`-all` difference reaches only receivers doing an SPF-only check with no DMARC
lookup, for whom spoofed mail moves from hard reject to softfail.

## Reversal condition

Not recorded at decision time.
