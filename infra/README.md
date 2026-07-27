# `infra/` — DNS for `toldstraight.com`

CloudFormation that manages **records inside an existing Route 53 hosted zone**.
The security records are **deployed** (stack `toldstraight-dns`, 2026-07-27); the site
records remain gated off. See [Deployment record](#deployment-record) below.

## What the stack manages

`dns.yaml` writes these RecordSets into the hosted zone whose id you pass as
`HostedZoneId`:

| Record | Name | Type | TTL | Value | Purpose |
| --- | --- | --- | --- | --- | --- |
| SPF | apex | TXT | 3600 | `"v=spf1 -all"` | authorize no mail senders (hard fail) |
| Null MX | apex | MX | 3600 | `0 .` | RFC 7505: this domain accepts no mail |
| DMARC | `_dmarc` | TXT | 3600 | `"v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;"` | reject unaligned mail, domain + subdomains |
| CAA | apex | CAA | 3600 | `0 issue "amazon.com"` + `0 issuewild "amazon.com"` | only ACM/Amazon may issue certs |
| Apex site | apex | A | 300 | `ApexTarget` param | **gated off** by default |
| Vote site | `vote` | CNAME | 300 | `VoteTarget` param | **gated off** by default |

Nothing sends mail from this domain, so the mail records lock it down hard rather than
leaving it open to spoofing. `rua`/`ruf` (DMARC report addresses) and `iodef` (CAA
violation address) are deliberately omitted until a reporting mailbox exists — see the
comments in `dns.yaml`.

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

**Rollback:** `aws cloudformation delete-stack --profile audio-lab --stack-name
toldstraight-dns` removes the four records but **not** the zone — the zone is a
parameter, so it survives stack deletion (that is the whole point of the rule above).

To **change** these records later, create a change-set with `--change-set-type UPDATE`
(the stack now exists), review it, then execute — never a bare `deploy`.

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

**Note on mail:** `v=spf1 -all` + DMARC `p=reject` mean nothing can send mail as this
domain until these records change. That is correct today and deliberate. If a
newsletter or transactional sender is ever added, these records must change first.

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
dig +short @ns-235.awsdns-29.com TXT toldstraight.com          # expect "v=spf1 -all"
dig +short @ns-235.awsdns-29.com MX toldstraight.com           # expect 0 .
dig +short @ns-235.awsdns-29.com TXT _dmarc.toldstraight.com   # expect v=DMARC1; p=reject; ...
dig +short @ns-235.awsdns-29.com CAA toldstraight.com          # expect 0 issue "amazon.com" + issuewild

# Control (known-positive through the identical path):
dig +short TXT google.com; dig +short MX google.com; dig +short CAA google.com
```

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
  `AdministratorAccess`), session duration **1 hour**, referencing the two
  customer-managed policies below **by name** (create the policies first, or provisioning
  fails).
- **Break-glass:** keep exactly one IAM admin user with `AdministratorAccess` + MFA,
  unused day to day, so a misconfigured Identity Center cannot lock you out.

### Customer-managed policies attached to `AudioLabDeploy`

Create these in **IAM → Policies → Create policy → JSON tab** (not the visual editor —
its "string like" matcher can silently widen an ARN), then attach both to the permission
set by name and **Reprovision**.

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
ACM + CloudFront + a whoami statement:

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

Answer the wizard (values below are this account's; the start URL is the org's access
portal, of the form `https://d-xxxxxxxxxx.awsapps.com/start`):

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
role, and the Identity Center console click-through) lives in the gitignored working
notes `artifacts/aws-identity-center-setup.md` and `artifacts/aws-identity-center-roles.md`.
