# ADR 0011 — iCloud+ chosen over WorkMail and over SES-plus-Lambda

- **Number:** 0011
- **Title:** iCloud+ Custom Email Domain hosts `toldstraight.com`'s mailbox, chosen over
  WorkMail (discontinued) and over SES-plus-Lambda
- **Status:** accepted
- **Date:** 2026-07-27
- **Source:** issue #54 — the decision comment (2026-07-27T14:24Z) and the correction
  comment "§4 option 1 (WorkMail) is void — the product is discontinued"
  (2026-07-27T14:42Z).

## Context

`jared@toldstraight.com` could not exist without partially undoing the #22 mail
lockdown, and AWS's only mailbox product turned out to be unavailable: mid-issue, the
console showed WorkMail discontinued (*"On March 31, 2027, AWS will discontinue support
for Amazon WorkMail… New customer sign-ups are no longer available"*). SES was never a
mailbox — it is a sending service with a receiving pipeline.

## Decision

From the #54 correction comment, verbatim — this is the criterion that decided both
rounds of the choice:

> **The criterion is unchanged and it is why the answer moved.** WorkMail was chosen to
> avoid owning a Lambda forwarder whose failure mode is silently lost mail. That
> reasoning still holds, so it now points at a hosted mailbox rather than at SES.

The revised decision: **iCloud+ Custom Email Domain** — $0 marginal cost (included with
the maintainer's existing paid iCloud+ tier), a real mailbox native in Mail on
macOS/iOS, genuine send-as, no code to maintain. Not chosen: SES+Lambda (the component
the criterion rejects), paid third-party mailboxes ($10–86/yr for no advantage over
free), and deferral.

## Consequences

**Constrains M5 (mail):** DNS records still go through `infra/dns.yaml` and a
change-set — Apple's setup flow offers to write records itself and that offer is
declined, because joint ownership between a provider and CloudFormation is the drift
`infra/README.md` exists to prevent. DMARC stays `p=reject`. SES is still needed
for #50's Cognito invitations, unaffected by this choice. The deployed result and its
verification record are in `CHANGELOG.md` (2026-07-27) and `infra/README.md`.

## Reversal condition

Recorded in #54 §5 against the original WorkMail pick, verbatim; the revised decision
kept the criterion and did not restate a new condition:

> **What would reverse this:** wanting more than roughly three addresses, or the show
> sending bulk mail (a newsletter). At that point SES is required regardless and
> WorkMail's per-user cost starts to matter — the calculus flips and option 2 becomes
> correct.
