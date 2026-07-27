# Spec: Deploy the DNS security records for toldstraight.com (Issue #22)

**Closes:** #22 · **Labels:** `type: task`, `area: infra`, `priority: high` (all verified
present in `.github/labels.json`) · **Milestone:** M5 — Web presence ·
**Assignee:** `Jared-Godar`
**Sizing:** `opus` / `high` — this changes **public DNS for a live domain**. Scope is
tight, but the blast radius is outward-facing and mail-affecting.

---

## 0. FIRST ACTION — read the durable contracts before touching anything

Read, in order: `AGENTS.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`, the memory files under
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`, then `infra/README.md` in
full and `CHANGELOG.md` § Findings.

**A durable contract outranks this spec.** Conflict → stop and report, do not resolve it.
**This spec is immutable after handoff.** Wrong or ambiguous → stop and report.

## 0.1 THE THINGS YOU MUST NOT DO

Read this list before the deliverables, not after.

- **Never create, delete, or modify the hosted zone itself.** `HostedZoneId` is a
  *parameter*; the zone is an input. A stack that owned it would destroy it on
  `delete-stack`, and recreation mints four new NS records that no longer match the
  registrar — the domain goes dark until nameservers are repointed by hand.
- **Never run a bare `create-stack` or `aws cloudformation deploy`.** Change-set only:
  create it, describe it, show the maintainer the diff, and execute only after §4 step 4.
- **Never set `DeploySiteRecords=true`** or supply `ApexTarget` / `VoteTarget`. There is
  no site and no distribution. Do not invent an IP.
- **Never touch the registrar, the nameservers, or `route53domains:*` at all.**
- **Never widen the IAM policy to make your own deploy succeed.** If `AudioLabDeploy` is
  denied something, **stop and report it.** Editing IAM to unblock yourself is the
  single worst failure available on this task.
- **Never write to `~/.aws/`.** The profile already exists.
- **Do not merge.** Open the PR, verify, stop.

## 1. Intended outcome

`toldstraight.com` publishes SPF, a null MX, DMARC, and CAA — deployed by CloudFormation
from `infra/dns.yaml`, into the pre-existing zone, with the site records still gated off.
Mail spoofing and unrestricted certificate issuance are closed, and the zone is under IaC
from its first record rather than retrofitted later.

## 2. Current state — measured 2026-07-27 by the PM thread, re-run rather than trust

**Access is live.** This was the blocker in #22 Gap 3 and it is resolved:

```
$ aws sts get-caller-identity --profile audio-lab --query Arn --output text
arn:aws:sts::448795057993:assumed-role/AWSReservedSSO_AudioLabDeploy_20bbbe575b284c8e/jared

$ aws route53 list-hosted-zones --profile audio-lab
  /hostedzone/Z09608783EP48AD8RCAL5   toldstraight.com.   2 records
```

**The zone is empty of everything that matters, confirmed two independent ways:**

```
dig      → NS, SOA only (SOA serial = 1, never modified)
AWS API  → NS (TTL 172800), SOA (TTL 900) only
```

**The template is authored, linted, and never deployed** (#13, PR #32).

## 3. Decisions already made — implement, do not re-open

- **Deploy the stack** — #22 §4A option 1, chosen by the maintainer 2026-07-27. Options 2
  (hand-add) and 3 (hybrid) were declined: hand-created records make a later
  `create-stack` fail `CREATE_FAILED` on resources that already exist.
- **Security records only.** `DeploySiteRecords` stays `"false"`.
- **Profile is `audio-lab`.** Pass `--profile audio-lab` on every AWS call. Do not use
  `lifeos`, `jagodar`, or `default`.
- **Cost is $0.** RecordSets are free; the $0.50/month hosted zone is already billed from
  registration. This does **not** meet the "billable AWS resources" bar in `AGENTS.md`
  § "Hold for the maintainer" — that gate was cleared by the maintainer's §4A decision
  regardless.

## 4. Scope and deliverables

**A. Deploy, via change-set, in this order.**

1. Re-validate offline first: `uvx cfn-lint infra/dns.yaml` and
   `aws cloudformation validate-template --profile audio-lab`.
2. **Capture the pre-state** — the §5 control block, run and pasted *before* any change.
3. `create-change-set` with stack name `toldstraight-dns`, parameters
   `HostedZoneId=Z09608783EP48AD8RCAL5`, `DomainName=toldstraight.com`,
   `DeploySiteRecords=false`. Change-set type `CREATE` (no stack exists yet).
4. `describe-change-set` and **paste the full list of changes**. Confirm it contains
   **exactly four** RecordSet additions (SPF, null MX, DMARC, CAA), **no** hosted-zone
   resource, and **no** apex/vote records. **If it contains anything else, stop and
   report — do not execute.**
5. `execute-change-set`, then wait for `CREATE_COMPLETE` and paste the terminal status.
6. If it fails, **do not retry blind.** Paste `describe-stack-events`, report, and stop.

**B. Verify, in both directions, with a control.**

- Re-run the §5 control (`google.com`) and the target queries. `AGENTS.md` § "Verify with
  a control": without a known-positive through the identical path, a broken resolver and a
  real result are indistinguishable.
- Cross-check via `aws route53 list-resource-record-sets` — two independent paths, as the
  pre-state was measured.
- **Confirm the SOA serial has incremented from `1`.** It is the cheapest proof the zone
  was actually written.
- **Negative check:** `vote.toldstraight.com` and the apex `A` record must still return
  **nothing**. If either resolves, the site condition leaked and that is a defect.
- DNS propagation is not instant. If a record is absent, wait and re-query before
  concluding anything; report `(no output)` honestly rather than retrying until green.

**C. Documentation.**

- `infra/README.md`: it currently says "**not deployed** … nothing in this repo runs
  `create-stack`, `deploy`, or a change-set." That becomes false the moment this lands.
  Update it to record the deployed stack name, the zone id, the deploy date, and the exact
  change-set commands used — and keep the zone-is-a-parameter rule prominent.
- `ROADMAP.md` § M5: record the security records as deployed; note the site records remain
  gated.
- `CHANGELOG.md`: an entry, and a **§ Findings** line for anything learned about
  CloudFormation-into-an-unowned-zone that is not visible in the diff.
- **Also fold in the AWS-access durability gap:** `artifacts/aws-identity-center-setup.md`
  and `artifacts/aws-identity-center-roles.md` are **gitignored**, so the only record of
  how to obtain AWS access here cannot reach a fresh clone or a cloud session. Port their
  operative content — the Identity Center instance, the permission set, the two
  customer-managed policies (including the JSON), and the `aws configure sso` profile
  setup — into a tracked section of `infra/README.md`. **Redact nothing that is not a
  secret, and include no secret:** account id and role names are fine; never a token, key,
  or anything from `~/.aws/credentials` or `~/.aws/sso/`.

## 5. The control block — run before and after, paste both

```fish
# Known-positive through the identical path
for q in TXT MX CAA
    echo "google $q: "(dig +short $q google.com | head -1)
end
echo "google DMARC: "(dig +short TXT _dmarc.google.com | head -1)

# Target
for q in NS SOA A TXT MX CAA
    echo "toldstraight $q: "(dig +short $q toldstraight.com | tr '\n' ' ')
end
echo "toldstraight DMARC: "(dig +short TXT _dmarc.toldstraight.com)
echo "toldstraight vote:  "(dig +short A vote.toldstraight.com)
```

## 6. Non-goals

- **Not the website, ACM certificate, or CloudFront distribution.** Apex and vote stay
  gated off.
- **Not configuring outbound mail.** These records assert this domain sends none. If that
  ever changes, they change with it.
- **Not registering or transferring domains**, and not touching `route53domains:*`.
- **Not creating a CloudFormation service role** or any IAM change of any kind.
- **Not enabling anything further in Identity Center.**
- **Not deleting the `lifeos` profile or editing `~/.aws/`.**

## 7. Acceptance criteria

- [ ] `cfn-lint` and `validate-template` re-run clean — output pasted
- [ ] Change-set **described and pasted before execution**, showing exactly four RecordSet
      additions and no hosted-zone resource
- [ ] Stack `toldstraight-dns` reaches `CREATE_COMPLETE` — status pasted
- [ ] §5 control block pasted **before and after**, with `google.com` returning all four
      record types in both runs
- [ ] SPF, null MX, DMARC and CAA all resolve on `toldstraight.com` — pasted
- [ ] **SOA serial incremented from `1`** — pasted
- [ ] **Negative check:** apex `A` and `vote.toldstraight.com` still return nothing
- [ ] `aws route53 list-resource-record-sets` cross-check pasted
- [ ] `infra/README.md` no longer claims the stack is undeployed; records stack name, zone
      id, deploy date, and the change-set commands
- [ ] `infra/README.md` gains the tracked AWS-access section (§4.C), **containing no
      secret** — state explicitly what was deliberately omitted
- [ ] `ROADMAP.md` § M5 updated; `CHANGELOG.md` entry (+ Findings if anything was learned)
- [ ] `pre-commit run --all-files` green (pasted), CI green
- [ ] This spec copied verbatim to `prompts/20260727-issue-22-deploy-dns-security-records.md`
- [ ] PR: `Closes #22`, assignee `Jared-Godar`, labels above, milestone M5 — verified by
      `gh pr view --json` read-back
- [ ] Continuity walkthrough written after branching, refreshed at PR-open, **no `⟨slot⟩`
      left unfilled**
- [ ] Everything deliberately omitted named in the PR body

## 8. Risk

**The deploy itself is low-risk and reversible** — RecordSets can be changed or removed,
and nothing currently depends on this domain resolving.

**The unrecoverable failure is zone destruction**, which is why §0.1 leads with it and why
§4.A step 4 requires reading the change-set before executing. A change-set that proposes
anything touching `AWS::Route53::HostedZone` is a stop-and-report, not a judgement call.

**Second risk: mail.** `v=spf1 -all` plus `p=reject` means nothing can ever send mail as
this domain until the records change. That is correct today and deliberate. If a
newsletter or transactional sender is added later, these records must change first.

## 9. References

- **#22** — the issue, including the §4A options and the §4B access options now resolved
- **#13** / **PR #32** — `infra/dns.yaml` and `infra/README.md` as authored
- `infra/README.md` § "The one rule that must not be broken: the zone is a parameter"
- `artifacts/aws-identity-center-roles.md` § Part 1 — the two customer-managed policies
- `artifacts/aws-identity-center-setup.md` — the Identity Center walkthrough
- `AGENTS.md` § "Verify with a control" · § "Hold for the maintainer" · § "Definition of
  done" · § "Defensively code every external call"
- Zone id `Z09608783EP48AD8RCAL5`; account `448795057993`; profile `audio-lab`
- Authored by the PM thread 2026-07-27 after the maintainer chose §4A option 1 and after
  Route 53 read access was confirmed live.
