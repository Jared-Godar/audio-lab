# Spec: Enable iCloud+ mail for toldstraight.com in infra/dns.yaml (Issue #54)

**Closes:** #54 · **Labels:** `type: task`, `area: infra`, `priority: medium` · **Milestone:**
M5 — Web presence · **Assignee:** `Jared-Godar`
**Sizing:** `claude-opus-5` / `high` — pin the id, not the `opus` alias. This modifies public
DNS for a live domain and partially undoes a deployed security posture.

---

## 0. Read the durable contracts first (non-negotiable)

`AGENTS.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`, memory files under
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`, `CHANGELOG.md` § Findings,
and **`infra/README.md` in full** — especially § "The one rule that must not be broken".

A durable contract outranks this spec. Conflict → stop and report. This spec is immutable
after handoff.

### 0a. THE THINGS YOU MUST NOT DO

- **Never create, delete or modify the hosted zone.** `HostedZoneId` is a parameter.
- **Never run a bare `create-stack`/`deploy`.** Change-set only: create, describe, **paste
  the diff**, execute. The stack `toldstraight-dns` already exists, so this is
  `--change-set-type UPDATE`.
- **Never let Apple, or any provider, write DNS.** The maintainer already declined that.
- **Never set `DeploySiteRecords=true`** or supply `ApexTarget`/`VoteTarget`.
- **Never weaken DMARC pre-emptively.** It stays `p=reject; sp=reject; adkim=s; aspf=s`.
  Relaxing alignment is a decision made **on evidence from a failed test**, by the
  maintainer, not by you.
- **Never widen an IAM policy to unblock yourself.** Report and stop.
- **Do not merge.**

## 0b. Progress tracking

Comment on #54 at: branch created · change-set described (paste it) · change-set executed ·
verification complete · PR opened. If anything in §2 does not match reality, stop there.

## 1. Intended outcome

`toldstraight.com` accepts mail at iCloud and can send authenticated mail as
`hello@` and `jared@`, with SPF, DKIM and DMARC aligned — and the anti-spoofing guarantee
from #22 intact rather than traded away.

## 2. Decisions — made by the PM, implement as written

Values below came from Apple's setup screen on 2026-07-27 and were pasted by the maintainer.
**Copy them exactly, including trailing dots.**

| Record | Name | Type | Value |
| --- | --- | --- | --- |
| MX | apex | MX | `10 mx01.mail.icloud.com.` and `10 mx02.mail.icloud.com.` |
| Apex TXT | apex | TXT | `"v=spf1 include:icloud.com -all"` **and** `"apple-domain=5J9Dq1Hh4Tnuwc0B"` |
| DKIM | `sig1._domainkey` | CNAME | `sig1.dkim.toldstraight.com.at.icloudmailadmin.com.` |
| DMARC | `_dmarc` | TXT | **unchanged** |
| CAA | apex | CAA | **unchanged** |

Three decisions embedded above, stated so they are not mistaken for transcription:

1. **SPF ends `-all`, not Apple's `~all`.** Only iCloud sends as this domain, so hardfail is
   correct and stronger; Apple's `~all` is a hedge for users who also send elsewhere. **If
   outbound mail misbehaves, switching to `~all` is the first diagnostic** — record it in the
   PR if you have to.
2. **The two apex TXT values live in ONE `AWS::Route53::RecordSet`.** Route 53 cannot hold
   two RecordSets with the same name and type, and CloudFormation will fail the stack if you
   author them separately. Extend the existing `SpfRecord` resource to carry both values, and
   rename it to something honest (e.g. `ApexTxtRecords`) with a comment saying why they are
   merged.
3. **`NullMxRecord` becomes the two iCloud MX values** — modify the existing resource rather
   than deleting and re-adding it, so the change-set reads as a modification.

## 3. Deliverables

1. `infra/dns.yaml` updated per §2 — MX modified, apex TXT merged and extended, DKIM CNAME
   added. Keep the existing comment style; explain *why* the TXT values are merged.
2. **Lower the TTL on the changed records to 300 in the same change-set.** The null MX is
   currently TTL 3600, so resolvers may cache "this domain accepts no mail" for up to an hour
   after cutover. 300 makes the cutover observable and any rollback fast. Raising them back to
   3600 once mail is confirmed working is a follow-up, noted in the PR, not done here.
3. Deploy via change-set (`UPDATE`), described and pasted before execution.
4. `infra/README.md`: the deployment record gains the mail change; § "Note on mail" — which
   currently says nothing can send mail as this domain — is **now false** and must be
   corrected. **Also correct the IAM section: it documents a two-policy structure and the
   reality is three** (`AudioLabDnsDomains`, `AudioLabSiteInfra` v4, `AudioLabMail` v1), and
   `AudioLabMail`'s WorkMail and Directory Service statements are dead — the product is
   discontinued and the account is ineligible. Record all three policies' JSON here; they
   currently live only in gitignored notes.
5. `ROADMAP.md` § M5 and a `CHANGELOG.md` entry (+ § Findings if anything surprises you).

## 4. Execution rails

**Step 1 — Sync and branch.** `git fetch`; confirm `git log --oneline main..origin/main` is
empty; branch from `main`.

**Step 1b — Continuity walkthrough**, immediately after branching, to
`artifacts/walkthroughs/`, refreshed at PR-open, **no `⟨slot⟩` left unfilled**.

**Step 2 — Edit the template.** `uvx cfn-lint infra/dns.yaml` and
`aws cloudformation validate-template --profile audio-lab` both clean before proceeding.

**Step 3 — Capture pre-state.** The §6.1 control block, run and pasted *before* the deploy.

**Step 4 — Change-set.** `--change-set-type UPDATE`, stack `toldstraight-dns`, parameters
`HostedZoneId=Z09608783EP48AD8RCAL5`, `DomainName=toldstraight.com`,
`DeploySiteRecords=false`. `describe-change-set` and **paste every change**. Expect
modifications to the MX and TXT resources and one addition (DKIM CNAME). **Anything touching
`AWS::Route53::HostedZone` is a stop-and-report, not a judgement call.**

**Step 5 — Execute**, wait for `UPDATE_COMPLETE`, paste the status. On failure, paste
`describe-stack-events` and stop; do not retry blind.

**Step N+1 — Commit, gating on the committed state.** `pre-commit run --all-files` green.

**Step N+2/N+3 — Push and open the PR** with the metadata in §5.

## 5. PR metadata (all at creation time)

`Closes #54` · assignee `Jared-Godar` · labels `type: task`, `area: infra`,
`priority: medium` · milestone `M5 — Web presence`. Verify by `gh pr view --json` read-back,
never inferred from the create command.

## 6. Numbered acceptance criteria

1. `cfn-lint` and `validate-template` clean — pasted.
2. Change-set **described and pasted before execution**; no hosted-zone resource in it.
3. Stack reaches `UPDATE_COMPLETE` — pasted.
4. **Control block run before and after**, `google.com` returning TXT/MX/CAA/DMARC in both:
   ```fish
   for q in TXT MX CAA
       echo "google $q: "(dig +short $q google.com | head -1)
   end
   for q in TXT MX CAA
       echo "toldstraight $q: "(dig +short @ns-235.awsdns-29.com $q toldstraight.com | tr '\n' ' ')
   end
   echo "DKIM : "(dig +short @ns-235.awsdns-29.com CNAME sig1._domainkey.toldstraight.com)
   echo "DMARC: "(dig +short @ns-235.awsdns-29.com TXT _dmarc.toldstraight.com)
   ```
5. Both MX values, both apex TXT values, and the DKIM CNAME resolve on the authoritative
   nameserver — pasted. **Query the authoritative NS, not a public resolver**: the pre-deploy
   queries seeded a negative cache with an 86400s SOA minimum.
6. **Negative test — the protection from #22 survives.** `apex A` and `vote` still resolve to
   nothing, and the CAA record is unchanged. Paste both.
7. **Two-directional mail proof, and this is the criterion that matters:** a message sent to
   `hello@toldstraight.com` arrives, **and** a message sent *from* it passes SPF, DKIM and
   DMARC at an external authentication checker — headers pasted. If DMARC fails, **report it
   and stop**; do not relax alignment.
8. `infra/README.md` corrected per §3.4 — the false mail note, the three-policy IAM structure,
   and the dead WorkMail statements all addressed.
9. `ROADMAP.md` § M5 updated; CHANGELOG entry.
10. `pre-commit run --all-files` green; CI green.
11. Spec copied verbatim to `prompts/20260727-issue-54-icloud-mail-dns.md`.
12. Everything deliberately omitted named in the PR body.

## 7. Non-goals

- Not the website, ACM certificate, CloudFront, or the `vote`/`auditions` subdomains.
- Not restoring TTLs to 3600 — a follow-up once mail is confirmed.
- Not configuring SES (that is #50's Cognito dependency, unrelated).
- Not creating the mailboxes — Apple's side is the maintainer's.
- Not relaxing DMARC.
- Not trimming `AudioLabMail`'s dead WorkMail statements from the live policy — **document**
  that they are dead; changing the live policy is the maintainer's console action.

## 8. Verification status of this spec's claims

- **Measured by the PM this session:** current SPF/MX/DMARC/CAA on the authoritative NS;
  zone id `Z09608783EP48AD8RCAL5`; stack `toldstraight-dns` exists; all IAM probes.
- **Supplied by the maintainer from Apple's setup screen:** every value in §2. Not
  independently verifiable by the PM — if Apple's screen still shows them, they are current.
- **Unverified, flagged deliberately:** whether iCloud's envelope sender aligns under
  `aspf=s`. DMARC passes on **either** SPF or DKIM alignment and the DKIM CNAME signs as
  `toldstraight.com`, so it should hold on DKIM alone — but §6.7 is the test that settles it,
  and it is why that criterion says stop rather than adjust.

## 9. References

- **#54** — the decision brief, the WorkMail reversal, and the iCloud+ decision
- **#22** / PR #41 — the mail lockdown being modified; `infra/README.md` § deployment record
- `infra/dns.yaml` — `SpfRecord` (to merge/extend), `NullMxRecord` (to modify), `DmarcRecord`
  and `CaaRecord` (unchanged)
- `artifacts/specs/TEMPLATE.md` (#34, PR #53) — **this spec is authored from that template**,
  which #34's acceptance criteria left as the one item unmet at merge
- Authored by the PM thread 2026-07-27 from values the maintainer pasted from Apple.
