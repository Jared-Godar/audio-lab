# `infra/` — DNS for `toldstraight.com`

CloudFormation that manages **records inside an existing Route 53 hosted zone**.
The mail and security records are **deployed** (stack `toldstraight-dns`, 2026-07-27); the
site records remain gated off. See [Deployment record](#deployment-record) below.

## What the stack manages

`dns.yaml` writes these RecordSets into the hosted zone whose id you pass as
`HostedZoneId`:

| Record | Name | Type | TTL | Value | Purpose |
| --- | --- | --- | --- | --- | --- |
| Apex TXT | apex | TXT | 300 | `"v=spf1 include:icloud.com ~all"` **+** `"apple-domain=…"` | SPF: only iCloud may send (softfail — **`~all` is mandatory**, see below) · Apple domain-ownership token |
| MX | apex | MX | 300 | `10 mx01.mail.icloud.com.` + `10 mx02.mail.icloud.com.` | inbound mail to iCloud+ |
| DKIM | `sig1._domainkey` | CNAME | 300 | `sig1.dkim.<domain>.at.icloudmailadmin.com.` | delegates the DKIM key to Apple |
| DMARC | `_dmarc` | TXT | 3600 | `"v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;"` | reject unaligned mail, domain + subdomains |
| CAA | apex | CAA | 3600 | `0 issue "amazon.com"` + `0 issuewild "amazon.com"` | only ACM/Amazon may issue certs |
| Apex site | apex | A | 300 | `ApexTarget` param | **gated off** by default |
| Vote site | `vote` | CNAME | 300 | `VoteTarget` param | **gated off** by default |

**The two apex TXT strings share one `AWS::Route53::RecordSet` on purpose.** Route 53
addresses a record set by (name, type), so an apex TXT can only ever be a single resource
holding multiple strings — authoring the SPF policy and Apple's verification token
separately would collide and fail the stack.

`rua`/`ruf` (DMARC report addresses) and `iodef` (CAA violation address) are still
omitted. The reason has half-expired: a mailbox on **this** domain now exists, and a
same-domain `rua` target needs no cross-domain `_report._dmarc` authorization, so adding
one is now cheap. It is a deliberate follow-up, not an oversight — see the comments in
`dns.yaml`.

### Mail architecture, and how to add or revoke an address

Mailboxes are hosted by **iCloud+ Custom Email Domain** — a real mailbox, native in Mail
on macOS/iOS, at **$0 marginal cost** on an existing paid iCloud+ tier. There is no
forwarder, no Lambda, and no repo-owned mail component; the only mail state in this repo
is the four DNS records above.

- **Add or remove an address** (e.g. `hello@`, `jared@`): Apple's side only, no DNS
  change. Adding an address neither needs nor triggers a template change.

  **Click path** (verified against Apple's current documentation, July 2026 — not
  recited from memory): go to **`icloud.com/icloudplus`** → sign in to your Apple
  Account → **Custom Email Domain** → select **`toldstraight.com`** → then use the
  controls beside each address to create or delete one. If you are already signed in
  to iCloud.com, the equivalent route is the **toolbar → Custom Email Domain**.

  **Apple caps a custom domain at three active email addresses.** `hello@` and `jared@`
  are two of the three; a fourth alias is not available without removing one.
- **Revoke the domain entirely:** roll back the DNS (see [Rollback](#rollback)), which
  stops inbound mail within the 300 s TTL, then remove the domain on Apple's side.

**Apple's setup flow offers to write these records into Route 53 for you. Decline it.**
The zone's records are owned by this template; joint ownership between a provider and
CloudFormation is exactly the drift this file exists to prevent. Take the *values* off
Apple's screen; publish them only through a change-set.

The apex and vote records are authored but held behind the `SiteRecordsEnabled`
condition (`DeploySiteRecords` defaults to `false`), so the deployed stack carries
security records only and the site switches on later without a rewrite. No IP or
CloudFront distribution is invented here — the targets are deploy-time parameters.

## The one rule that must not be broken: the zone is a parameter, never a resource

`HostedZoneId` is a **`Parameter`**. This template **never creates or owns the hosted
zone.**

`toldstraight.com` was registered through Route 53 on 2026-07-26, and Route 53
auto-created its hosted zone, pre-wired to the four nameservers the registrar
publishes. If a CloudFormation stack *owned* that zone:

1. `delete-stack` (or a failed create rollback) would **destroy the zone**.
2. Recreating it mints **four brand-new NS records** that no longer match what the
   registrar publishes.
3. The domain goes **dark** — nothing resolves — until the nameservers are repointed
   by hand at the registrar.

Keeping the zone outside CloudFormation makes stack deletion survivable: delete the
stack and you lose the *records*, not the *zone*. CloudFormation also cannot register
domains (there is no `AWS::Route53Domains` resource type), so registration stays a
manual purchase and the zone is always a pre-existing input.

## Deployment record

**Deployed 2026-07-27 (issue #22)** via a CloudFormation **change-set** — never a bare
`create-stack`/`deploy` — so the exact resource changes were reviewed before anything
was written to the live zone.

| | |
| --- | --- |
| Stack name | `toldstraight-dns` |
| Hosted zone id | `Z09608783EP48AD8RCAL5` (a **parameter** — not created by the stack) |
| Account | `448795057993` · Region `us-east-1` · Profile `audio-lab` |
| Records | SPF, null MX, DMARC, CAA — 4 `AWS::Route53::RecordSet`s. Site records gated off (`DeploySiteRecords=false`). |
| Result | `CREATE_COMPLETE` |

The exact commands used, in order — **change-set only, read before execute**:

```fish
# 1. Create the change-set (type CREATE: no stack existed yet). Deploys nothing.
aws cloudformation create-change-set --profile audio-lab \
  --stack-name toldstraight-dns \
  --change-set-name deploy-security-records \
  --change-set-type CREATE \
  --template-body file://infra/dns.yaml \
  --parameters \
    ParameterKey=HostedZoneId,ParameterValue=Z09608783EP48AD8RCAL5 \
    ParameterKey=DomainName,ParameterValue=toldstraight.com \
    ParameterKey=DeploySiteRecords,ParameterValue=false
aws cloudformation wait change-set-create-complete --profile audio-lab \
  --stack-name toldstraight-dns --change-set-name deploy-security-records

# 2. Read the change-set BEFORE executing. Expect exactly four RecordSet
#    additions and NO AWS::Route53::HostedZone resource. Anything else -> stop.
aws cloudformation describe-change-set --profile audio-lab \
  --stack-name toldstraight-dns --change-set-name deploy-security-records \
  --query 'Changes[].ResourceChange.{Action:Action,Type:ResourceType,LogicalId:LogicalResourceId}' \
  --output table

# 3. Execute only after reading the diff.
aws cloudformation execute-change-set --profile audio-lab \
  --stack-name toldstraight-dns --change-set-name deploy-security-records
aws cloudformation wait stack-create-complete --profile audio-lab \
  --stack-name toldstraight-dns
```

### Rollback

**The fastest rollback is a DNS one, not a git one.** The mail records carry TTL 300
deliberately, so a revert is visible within five minutes.

Restore the pre-#54 lockdown by re-deploying the previous template through a change-set:

```fish
git show afdfb3f:infra/dns.yaml > /tmp/dns-pre-54.yaml
aws cloudformation create-change-set --profile audio-lab \
  --stack-name toldstraight-dns --change-set-name rollback-icloud-mail \
  --change-set-type UPDATE --template-body file:///tmp/dns-pre-54.yaml \
  --parameters \
    ParameterKey=HostedZoneId,ParameterValue=Z09608783EP48AD8RCAL5 \
    ParameterKey=DomainName,ParameterValue=toldstraight.com \
    ParameterKey=DeploySiteRecords,ParameterValue=false
# then describe -> read -> execute, exactly as above.
```

**Do not use `delete-stack` as a rollback.** `aws cloudformation delete-stack --profile
audio-lab --stack-name toldstraight-dns` removes the records but **not** the zone — the
zone is a parameter, so it survives stack deletion (that is the whole point of the rule
above). But it leaves the domain with *no* mail records at all: no SPF, no DMARC, no MX,
null or otherwise. That is strictly worse than either the locked or the iCloud state,
because an unprotected domain invites spoofing. Delete the stack only when the intent is
genuinely to stop managing this zone.

To **change** these records later, create a change-set with `--change-set-type UPDATE`
(the stack now exists), review it, then execute — never a bare `deploy`.

### Update 2026-07-27 (issue #54) — mail switched on for iCloud+

The mail lockdown was **deliberately, partially undone** so `toldstraight.com` can host
mailboxes at iCloud+ Custom Email Domain. Deployed by change-set
`enable-icloud-mail-keepids`, type `UPDATE`, result **`UPDATE_COMPLETE`**.

| Record | From | To |
| --- | --- | --- |
| Apex TXT | `"v=spf1 -all"` (TTL 3600) | `"v=spf1 include:icloud.com ~all"` + `"apple-domain=…"` (TTL 300) |
| MX | `0 .` (RFC 7505 null, TTL 3600) | `10 mx01.mail.icloud.com.` + `10 mx02.mail.icloud.com.` (TTL 300) |
| DKIM | absent | `sig1._domainkey` CNAME → `sig1.dkim.<domain>.at.icloudmailadmin.com.` (TTL 300) |
| DMARC · CAA | — | **unchanged** |

The change-set was described and reviewed before execution: **`Modify` SpfRecord,
`Modify` NullMxRecord, `Add` DkimRecord — three `AWS::Route53::RecordSet`s, no
`AWS::Route53::HostedZone`.**

### Update 2026-07-30 (issue #59) — DMARC aggregate reporting switched on

`DmarcRecord` gained `rua=mailto:hello@toldstraight.com` (maintainer decision, #59 §4
option 1 — same-domain target, so no cross-domain `_report._dmarc` authorization is
needed and no third party sees sender metadata). Everything else in the record —
`p=reject; sp=reject; adkim=s; aspf=s` — is byte-identical.

**How the reports are read, stated honestly: nobody reads them yet.** Aggregate
reports arrive at `hello@toldstraight.com` as gzipped XML attachments, roughly one
per reporting receiver per day, from addresses like `noreply-dmarc-support@google.com`.
They are the domain's only telemetry that enforcement is rejecting something — worth a
glance when mail behaves oddly, and *the* place to look before ever considering
relaxing alignment. If they prove unreadable in practice, the recorded next step is a
hosted analyzer (#59 §4 option 2 — the DNS change is identical), filed as its own
issue with evidence, not a silent switch.

#### SPF must end `~all`. This is not a preference — do not "improve" it to `-all`

Deployed first as `-all` (hard fail), on the reasoning that iCloud is the only sender so
the stricter form was both correct and safer. **Apple's verifier rejected the domain:**

> Check your SPF record — make sure the settings you updated match the ones sent to you.

**Apple's Custom Email Domain verifier does a literal string comparison against the SPF
value it issued; it does not evaluate SPF semantics.** Apple issues `~all`, so `-all` can
never pass, no matter how long you wait — and the error blames your record rather than
naming the mismatch. Corrected in a second change-set (`spf-softfail-for-apple-verifier`,
one `Modify` on the TXT resource, `UPDATE_COMPLETE`).

**Caching was excluded as a cause before concluding this**, not assumed: the `-all` record
was confirmed live on *both* the authoritative nameserver and public resolvers, with the
old `v=spf1 -all` gone from public view, before Apple was retried.

**The security accounting, stated rather than glossed:** DMARC is `p=reject` with strict
alignment and is **unchanged** — that is where enforcement lives. The `~all` vs `-all`
difference reaches only receivers that do an SPF-only check with **no** DMARC lookup; for
those, spoofed mail moves from hard reject to softfail. Against DMARC-aware receivers,
everything #22 bought is intact.

**This is the record most likely to be "fixed" by a future reviewer**, because `-all` is
what a security review asks for. `dns.yaml` carries a blunt warning at the resource.
Changing it un-verifies the domain at Apple and breaks mail at a moment nobody is watching.

**TTLs on the three changed records are 300, not 3600, on purpose.** The null MX told
resolvers "this domain accepts no mail", and at TTL 3600 that could have been cached for
an hour past cutover. 300 makes the cutover observable and a rollback fast. **Raising
them back to 3600 once mail is confirmed working is an owed follow-up.**

#### The logical IDs `SpfRecord` and `NullMxRecord` are now misnamed, deliberately

Neither resource is a "null MX" or an SPF-only record any more. **A CloudFormation
logical ID cannot be renamed** — changing it is a delete of the old resource plus a
create of the new one. Measured on this stack: renaming them produced a change-set of
three `Add`s and two `Remove`s, where each `Remove` carried
`PhysicalResourceId: toldstraight.com` — CloudFormation would have created the new record
sets and then issued `DELETE` against the live ones in its cleanup phase, risking the
removal of SPF and Apple's verification token together. Keeping the ids yields
`Replacement: False` in-place modifications instead.

**An honest comment costs nothing; an honest identifier would cost a live DNS record.**
`dns.yaml` carries this reasoning at both resources. Read the values, not the ids.

## Enabling the site records later

The apex/vote records switch on without a template rewrite. Supply real targets — do
not invent them — via a change-set:

```fish
aws cloudformation create-change-set --profile audio-lab \
  --stack-name toldstraight-dns --change-set-name enable-site \
  --change-set-type UPDATE --template-body file://infra/dns.yaml \
  --parameters \
    ParameterKey=HostedZoneId,ParameterValue=Z09608783EP48AD8RCAL5 \
    ParameterKey=DomainName,ParameterValue=toldstraight.com \
    ParameterKey=DeploySiteRecords,ParameterValue=true \
    ParameterKey=ApexTarget,ParameterValue=⟨APEX_IPV4⟩ \
    ParameterKey=VoteTarget,ParameterValue=⟨VOTE_HOSTNAME⟩
# describe, review, then execute-change-set as above.
```

When the apex should point at CloudFront, replace `ApexSiteRecord` with an A-record
`AliasTarget` block rather than an `ApexTarget` IP — apex CNAMEs are invalid DNS and
CloudFront has no stable IP. The template comments flag this at the record.

**Note on mail (rewritten 2026-07-27, #54 — the previous version is now false).** This
file used to say *"nothing can send mail as this domain until these records change."*
That stopped being true the moment #54 deployed: the domain now sends and receives via
iCloud+.

What is true today: **`v=spf1 include:icloud.com ~all` authorizes iCloud and nothing
else**, DMARC stays `p=reject` with strict alignment, and Apple's DKIM selector signs as
`toldstraight.com`. **The anti-spoofing guarantee from #22 survives** — it was narrowed
from "no sender at all" to "exactly one sender", not traded away. Anything else claiming
to be this domain fails SPF alignment and is **rejected by DMARC policy**, which is the
mechanism doing the work (see the `~all` note above for why SPF itself softfails).

If a newsletter or transactional sender (e.g. SES for #50's Cognito invitations) is ever
added, **these records must change first** — a second sender needs its own SPF `include:`
and its own DKIM selector, or its mail will be rejected by the domain's own policy.

## Finding the `HostedZoneId`

**Console click path** (verified against current AWS docs, July 2026):

> AWS Console → **Route 53** → **Hosted zones** (left navigation) → select the
> **radio button** next to `toldstraight.com` → **View details** → the **Hosted zone
> details** panel shows **Hosted zone ID**.

**CLI:**

```fish
aws route53 list-hosted-zones-by-name --profile audio-lab \
  --dns-name toldstraight.com --query 'HostedZones[0].Id' --output text
```

That returns `/hostedzone/ZXXXXXXXXXXXXX`; pass just the `ZXXXXXXXXXXXXX` part.

## Validate without deploying

```fish
uvx cfn-lint infra/dns.yaml                                   # offline structural lint
aws cloudformation validate-template --profile audio-lab \
  --template-body file://infra/dns.yaml                       # API call; needs creds; NOT a deploy
```

`validate-template` only checks that the template is well-formed — it is **not**
equivalent to a deploy and does not confirm the records are correct for your zone.

## Verify after a deploy

Verify in **two independent directions** and against a **control**, because a broken
resolver and a real result look identical without one.

```fish
# AWS API — authoritative and immediate, no resolver caching:
aws route53 list-resource-record-sets --profile audio-lab \
  --hosted-zone-id Z09608783EP48AD8RCAL5 \
  --query 'ResourceRecordSets[].{Name:Name,Type:Type,TTL:TTL}' --output table

# DNS — query the zone's OWN nameserver directly to sidestep resolver caching:
dig +short @ns-235.awsdns-29.com TXT toldstraight.com          # expect v=spf1 include:icloud.com ~all + apple-domain=...
dig +short @ns-235.awsdns-29.com MX toldstraight.com           # expect 10 mx01/mx02.mail.icloud.com.
dig +short @ns-235.awsdns-29.com CNAME sig1._domainkey.toldstraight.com  # expect sig1.dkim...icloudmailadmin.com.
dig +short @ns-235.awsdns-29.com TXT _dmarc.toldstraight.com   # expect v=DMARC1; p=reject; ...
dig +short @ns-235.awsdns-29.com CAA toldstraight.com          # expect 0 issue "amazon.com" + issuewild

# Control (known-positive through the identical path):
dig +short TXT google.com; dig +short MX google.com; dig +short CAA google.com
```

**Negative check — the #22 protection must still hold.** These must all return nothing;
run the control above alongside them, or an empty answer and a broken probe look identical:

```fish
dig +short @ns-235.awsdns-29.com A toldstraight.com        # expect (no output)
dig +short @ns-235.awsdns-29.com A vote.toldstraight.com   # expect (no output)
```

**Careful writing these in Fish:** an empty command substitution inside a quoted string
collapses the whole argument, so `echo "apex: "(dig +short …)` prints *nothing at all*
when the record is absent — which reads as a silent pass. Capture into a variable and
test `count` instead.

**Public resolvers lag.** A pre-deploy query for an absent record can seed a negative
cache for up to the SOA minimum TTL (86400s here), so `dig` against your default
resolver may show nothing for a while after the records are live. Query the zone's own
nameserver (`@ns-...awsdns...`) for the authoritative answer; report `(no output)`
honestly rather than retrying the public resolver until it turns green.

**Do not use the SOA serial as proof of a write.** Route 53 does **not** increment the
SOA serial on `ChangeResourceRecordSets` — it does not support zone transfers, so the
serial stays `1` no matter how many records you add, and this does not affect
propagation. Confirm a write with `list-resource-record-sets` or an authoritative `dig`,
never the SOA serial. (See `CHANGELOG.md` § Findings, 2026-07-27.)

---

## AWS access — how to obtain credentials for this account

Access is via **IAM Identity Center** (SSO), not a long-lived IAM access key. This
section is tracked so a fresh clone or a cloud session can reproduce access without the
gitignored setup notes. **It contains no secret** — see "What is deliberately omitted".

### The identity model

Identity Center replaces **IAM users** as the way *humans* get credentials; the rest of
IAM is unchanged. A **permission set** is assigned to a group for the account, and
Identity Center provisions a real IAM role named `AWSReservedSSO_<PermissionSetName>_<hash>`
in that account, kept in sync with the permission set. Never edit the provisioned role
directly — edit the permission set and **Reprovision**.

- **Instance:** organization instance of IAM Identity Center (an account instance cannot
  grant AWS-account access via permission sets), Region **us-east-1** — the Region is
  effectively permanent (changing it means deleting the instance and losing every user,
  group, permission set, and assignment).
- **Permission set:** `AudioLabDeploy` — a **custom** permission set (not
  `AdministratorAccess`), session duration **1 hour**, referencing the **three**
  customer-managed policies below **by name** (create the policies first, or provisioning
  fails). The limit is 10 policies per permission set.
- **Break-glass:** keep exactly one IAM admin user with `AdministratorAccess` + MFA,
  unused day to day, so a misconfigured Identity Center cannot lock you out.

### Customer-managed policies attached to `AudioLabDeploy`

Create these in **IAM → Policies → Create policy → JSON tab** (not the visual editor —
its "string like" matcher can silently widen an ARN), then attach all three to the
permission set by name and **Reprovision**.

**There are three, not two — corrected 2026-07-27 (#54).** This section documented a
two-policy structure long after it stopped being true. On 2026-07-27 the single
`AudioLabSiteInfra` policy **exceeded IAM's 6,144-character managed-policy limit** once
WorkMail, Directory Service and SES actions were added (7,066 minified, 922 over). AWS
excludes whitespace from that count, so minifying was not an escape. It was split along a
real seam — mail and the audition platform have independent lifecycles — rather than by
trimming capabilities:

| Policy | Statements | Minified size | Headroom |
| --- | --- | --- | --- |
| `AudioLabDnsDomains` | unchanged | — | — |
| `AudioLabSiteInfra` (**v4**) | 16 | 5,072 | 1,072 |
| `AudioLabMail` (**v1**) | 5 | 2,116 | 4,028 |

**Attaching a new policy to a permission set requires reprovisioning** — unlike editing a
policy's *contents*, which takes effect immediately.

> **`AudioLabMail`'s WorkMail and Directory Service statements are dead.** AWS announced
> it will discontinue Amazon WorkMail on **31 March 2027**, new sign-ups are closed, and
> this account reports *"This account does not have access to Amazon WorkMail."* The
> `WorkMailOrganization` and `WorkMailDirectoryBacking` statements (~1,120 characters)
> describe a capability that cannot be used. They are **inert, not harmful**. The
> `MailDomainIdentity` and `MailAccountVisibility` (SES) statements stay — #50 needs SES
> sending for Cognito invitations. **Trimming the dead statements is a maintainer console
> action, deliberately not done by an executor** (see the note below on the JSON gap).

**The verbatim JSON for both policies is tracked in this repository:**

- [`infra/policies/20260727-aws-iam-AudioLabSiteInfra-v4-platform.json`](policies/20260727-aws-iam-AudioLabSiteInfra-v4-platform.json)
  — 16 statements, 5,072 characters minified
- [`infra/policies/20260727-aws-iam-AudioLabMail-v1-workmail-ses.json`](policies/20260727-aws-iam-AudioLabMail-v1-workmail-ses.json)
  — 5 statements, 2,116 characters minified

Both match the statement counts and minified sizes in the table above, measured
independently of the session that wrote those numbers.

> **This passage previously denied that the two policies existed anywhere but the IAM
> console, and asked a human to paste them in.** That was false when written (#68): the
> files were already
> on disk under the gitignored `artifacts/` zone, timestamped roughly an hour *before* the
> commit that claimed they did not exist. The underlying access limit is real and still
> stands — `iam:ListPolicies` / `iam:GetPolicyVersion` are **denied** to `AudioLabDeploy`
> (`AccessDenied … not authorized to perform: iam:ListPolicies`), and **widening IAM to
> unblock documentation would be exactly the wrong fix.** The policies here were captured
> by a principal that could read them, not by relaxing `AudioLabDeploy`.

The `AudioLabDnsDomains` JSON below is complete and current.

**`AudioLabDnsDomains`** — `route53domains` is us-east-1 only and has no resource-level
permissions, so `"Resource": "*"` is the service's constraint, not sloppiness:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DomainRegistration",
      "Effect": "Allow",
      "Action": [
        "route53domains:ListPrices",
        "route53domains:CheckDomainAvailability",
        "route53domains:CheckDomainTransferability",
        "route53domains:GetDomainSuggestions",
        "route53domains:RegisterDomain",
        "route53domains:GetOperationDetail",
        "route53domains:ListDomains",
        "route53domains:GetDomainDetail",
        "route53domains:UpdateDomainNameservers",
        "route53domains:UpdateDomainContactPrivacy",
        "route53domains:ListOperations"
      ],
      "Resource": "*"
    },
    {
      "Sid": "HostedZonesAndRecords",
      "Effect": "Allow",
      "Action": [
        "route53:CreateHostedZone",
        "route53:DeleteHostedZone",
        "route53:GetHostedZone",
        "route53:ListHostedZones",
        "route53:ListHostedZonesByName",
        "route53:ChangeResourceRecordSets",
        "route53:ListResourceRecordSets",
        "route53:GetChange",
        "route53:ChangeTagsForResource",
        "route53:ListTagsForResource"
      ],
      "Resource": "*"
    }
  ]
}
```

**`AudioLabSiteInfra`** — CloudFormation + S3 (scoped to the `toldstraight-*` prefix) +
ACM + CloudFront + a whoami statement.

> ⚠️ **The JSON below is the ORIGINAL 6-statement version, not the live v4 (16
> statements).** It is retained because it is the accurate record of what was deployed on
> 2026-07-26 and every statement in it still exists in v4; it is **not** a complete
> description of the live policy, which also carries Lambda, Cognito, API Gateway and SSM
> actions added for #50. Do not recreate the policy from this block. Replace it with the
> live JSON when the maintainer pastes it — see the note above.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationStacks",
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ValidateTemplate",
        "cloudformation:ListStacks",
        "cloudformation:CreateChangeSet",
        "cloudformation:DescribeChangeSet",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:DeleteChangeSet",
        "cloudformation:TagResource",
        "cloudformation:UntagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SiteBuckets",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketVersioning",
        "s3:PutBucketTagging",
        "s3:PutEncryptionConfiguration",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::toldstraight-*",
        "arn:aws:s3:::toldstraight-*/*"
      ]
    },
    {
      "Sid": "ListBucketsForConsole",
      "Effect": "Allow",
      "Action": "s3:ListAllMyBuckets",
      "Resource": "*"
    },
    {
      "Sid": "Certificates",
      "Effect": "Allow",
      "Action": [
        "acm:RequestCertificate",
        "acm:DescribeCertificate",
        "acm:DeleteCertificate",
        "acm:ListCertificates",
        "acm:AddTagsToCertificate"
      ],
      "Resource": "*"
    },
    {
      "Sid": "Cdn",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:UpdateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig",
        "cloudfront:ListDistributions",
        "cloudfront:CreateOriginAccessControl",
        "cloudfront:GetOriginAccessControl",
        "cloudfront:DeleteOriginAccessControl",
        "cloudfront:CreateInvalidation",
        "cloudfront:TagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "WhoAmI",
      "Effect": "Allow",
      "Action": ["sts:GetCallerIdentity", "iam:GetUser"],
      "Resource": "*"
    }
  ]
}
```

**`AudioLabMail` (v1)** — 5 statements, created 2026-07-27 when `AudioLabSiteInfra`
outgrew the 6,144-character limit. Two of the five are permanently dead (see the WorkMail
note above); the SES statements remain live and are what #50 needs.

| Sid | Status | Purpose |
| --- | --- | --- |
| `WorkMailOrganization` | **dead** | WorkMail org/user management — product discontinued, account ineligible |
| `WorkMailDirectoryBacking` | **dead** | Directory Service actions backing a WorkMail org |
| `MailDomainIdentity` | live | SES identity actions scoped to `identity/toldstraight.com` |
| `MailAccountVisibility` | live | SES account/sending read actions |
| `MailSending` | live | SES send actions (#50's Cognito invitations) |

**JSON not recorded — see the note above.** The statement inventory here comes from the
maintainer's own record on issue #54, not from a read of the live policy, and is labelled
as such rather than presented as a measurement.

**Verified after the split by nine probes in both directions** (2026-07-27, recorded on
issue #54 — relayed, not re-run by this session):

```text
MAIL      workmail list-organizations      ALLOWED
          sesv2 list-email-identities      ALLOWED
          ds describe-directories          ALLOWED
PLATFORM  lambda list-functions            ALLOWED
          cognito-idp list-user-pools      ALLOWED
          apigateway get-rest-apis         ALLOWED
          ssm get-parameters-by-path       ALLOWED   (/audiolab/)
          route53 list-hosted-zones        ALLOWED   toldstraight.com.
CONTROL   ec2 describe-instances           DENIED
```

The platform probes are a regression check — the v4 split removed statements from a policy
the audition work depends on, and all of them still resolve. **The EC2 denial is the
control:** without it, a working probe and an over-broad policy are indistinguishable.

**A `[]` from a list API proves an IAM grant, not that the service is usable.**
`aws workmail list-organizations` returned `[]` and was read as "allowed, nothing created
yet" — permissions and *availability* are two different questions and only one was tested.
The account had no WorkMail access at all. This is the same class of false green the
control discipline in this file exists to catch.

**AWS action names are not inferable from API shape; the IAM policy editor is the
authority.** Three names were wrong across two rounds and the console validator caught
every one: `apigateway:TagResource`, `apigateway:UntagResource`, and
`workmail:DescribeMailDomain` (WorkMail names it `GetMailDomain`) — plus
`ssm:DescribeParameters` scoped to a resource ARN when it is account-level.

**Deliberately excluded from the policy** — add only when something actually needs them:
`iam:CreateRole`/`iam:PassRole` (a privilege-escalation path, needed only once a stack
creates roles), `route53domains:TransferDomain`/`DeleteDomain`, and S3 write outside the
`toldstraight-*` prefix. `route53domains:RegisterDomain` spends money — the permission
exists so the **maintainer** can run it, not so an agent will (it is a
hold-for-the-maintainer action per `AGENTS.md`).

### Wire up the CLI profile

```fish
aws configure sso
```

Answer the wizard (values below are this account's). Two different URLs are involved, and
confusing them wastes time:

- **Browser access portal** (console login): **`https://d-906679548d.awsapps.com/start`**
  (`d-906679548d` is this org's Identity Store id). Bookmark this — it is the page you sign
  in on to reach the AWS Management Console.
- **CLI start URL** that `aws configure sso` stores: the issuer form
  `https://identitycenter.amazonaws.com/ssoins-7223329d63d09094`. This is **not** a web
  page — opening it in a browser shows a blank white page. It is used only by the device
  authorization flow.

The `d-xxxxxxxxxx.awsapps.com/start` shown below is the generic placeholder form; the real
value for this account is the portal URL above.

```text
SSO session name:            audio-lab
SSO start URL:               https://d-xxxxxxxxxx.awsapps.com/start
SSO region:                  us-east-1
SSO registration scopes:     sso:account:access
Default client Region:       us-east-1
CLI default output format:   json
Profile name:                audio-lab
```

Resulting `~/.aws/config` (the separate `[sso-session]` block is what enables automatic
token refresh — the legacy inline form does not refresh):

```ini
[profile audio-lab]
sso_session = audio-lab
sso_account_id = 448795057993
sso_role_name = AudioLabDeploy
region = us-east-1
output = json

[sso-session audio-lab]
sso_region = us-east-1
sso_start_url = https://d-xxxxxxxxxx.awsapps.com/start
sso_registration_scopes = sso:account:access
```

Log in and verify, **including the deny direction**:

```fish
aws sso login --profile audio-lab
aws sts get-caller-identity --profile audio-lab
# expect: arn:aws:sts::448795057993:assumed-role/AWSReservedSSO_AudioLabDeploy_<hash>/jared
aws iam create-user --user-name should-fail   # expect AccessDenied (negative control)
```

The `AWSReservedSSO_` prefix confirms an Identity Center role rather than a leftover IAM
user. If a command fails with `Error loading SSO Token` / `Token has expired`, that is an
expired login, not a permissions bug — re-run `aws sso login --profile audio-lab`.

### What is deliberately omitted (and why it is safe to track this)

**Nothing here is a secret.** The account id (`448795057993`), the role/permission-set
names, the policy JSON, and the profile shape are all non-sensitive configuration. What
is **never** committed and lives only on the maintainer's machine:

- Anything under `~/.aws/credentials` — there is nothing there by design; Identity
  Center issues short-lived tokens, so there is no long-lived access key to leak.
- The SSO token cache under `~/.aws/sso/`.
- The real access-portal subdomain is shown as `d-xxxxxxxxxx` — it is an identifier, not
  a credential, but is left as a placeholder since it is not needed to reproduce the
  setup and is not recorded in a tracked file.

The fuller walkthrough (GitHub Actions OIDC for CI, an optional CloudFormation service
role, and the Identity Center console click-through) is tracked in
[`docs/aws-identity-center-setup.md`](../docs/aws-identity-center-setup.md) and
[`docs/aws-identity-center-roles.md`](../docs/aws-identity-center-roles.md).

Billing access under an admin principal has its own failure mode that looks like a
permissions gap and is not one — see
[`docs/aws-billing-access-finding.md`](../docs/aws-billing-access-finding.md).
