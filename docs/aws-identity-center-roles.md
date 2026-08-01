# Roles and permissions that dovetail with IAM Identity Center

Working note, 2026-07-26. Gitignored.
Companion to `aws-identity-center-setup.md` — read that one first.

---

## The mental model (this is the part worth internalising)

Identity Center does not replace IAM. It replaces **IAM users** as the way *humans*
get credentials. Everything else in IAM stays exactly as it was.

```text
                    ┌─────────────── HUMANS ───────────────┐
   You ──▶ Identity Center ──▶ permission set ──▶ provisions an IAM role
                                                 AWSReservedSSO_AudioLabDeploy_<hash>
                                                        │
                                                        ▼
                    ┌────────────── MACHINES ──────────────┐   AWS APIs
   GitHub Actions ──▶ OIDC provider ──▶ IAM role ──────────┘
   CloudFormation ──▶ service role ───────────────────────┘
```

**A permission set *is* a role.** When you assign a permission set to a group for an
account, Identity Center provisions a real IAM role in that account named
`AWSReservedSSO_<PermissionSetName>_<hash>` and keeps it in sync with the permission
set definition.

Three consequences that trip people up:

1. **Never edit the provisioned role directly.** It is regenerated from the
   permission set; your edits vanish on the next reprovision.
2. **Edit the permission set, then reprovision.** Policy changes are not live until
   AWS accounts → select account → **Reprovision**.
3. **You do not need `audio-lab-cli`.** Option B's IAM user exists only to obtain
   credentials, which is precisely the job Identity Center takes over.

## What you still need real IAM for

| Identity | Human or machine | Mechanism | Needed now? |
| --- | --- | --- | --- |
| You, day to day | human | Identity Center permission set | **yes** |
| You, break-glass | human | one IAM user, `AdministratorAccess`, MFA | **yes** — keep |
| GitHub Actions deploys | machine | **OIDC provider + IAM role** | when CI deploys |
| CloudFormation execution | machine | service role | optional |
| ElevenLabs / podcast tooling | — | not AWS at all | no |

The rule: **Identity Center for anything with a human behind it; IAM roles for
anything that runs unattended.** A machine cannot complete a browser sign-in, so it
cannot use Identity Center.

---

## Part 1 — Policies for the permission set

These are the same two policies from `aws-iam-setup.md` §4, unchanged. Under
Identity Center they attach to a **permission set** rather than to a role you build
by hand.

**Create them first.** A permission set references customer managed policies **by
name**, and provisioning fails if the named policy does not exist in the target
account.

IAM → Policies → **Create policy** → **JSON** tab (never the visual editor — its
"string like" matcher can silently widen an ARN).

### `AudioLabDnsDomains`

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

`route53domains` is **us-east-1 only** and does not support resource-level
permissions — `"Resource": "*"` is the service's constraint, not sloppiness.

### `AudioLabSiteInfra`

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

**Deliberately excluded** — add only when something actually needs them:

- `iam:CreateRole` / `iam:PassRole` — a privilege-escalation path. Needed only once
  a stack creates roles (Lambda, CloudFront Functions).
- `route53domains:TransferDomain`, `DeleteDomain`.
- S3 write outside the `toldstraight-*` prefix.

> `RegisterDomain` spends money. Per `AGENTS.md` that is a hold-for-the-maintainer
> action — the permission exists so **you** can run it, not so an agent will.

### Attach

IAM Identity Center → **Permission sets** → `AudioLabDeploy` → **Policies** →
**Customer managed policies** → add both **by name**. Then **AWS accounts** →
select account → **Reprovision**.

---

## Part 2 — GitHub Actions via OIDC (no keys, ever)

> **Status as of 2026-08-01: needed, and built as infrastructure-as-code.** This section used
> to read *"Not needed yet — build it when there is something to deploy."* There is now
> something to deploy: #187 moved site publication into CI, and ADR 0020 records the decision.
>
> **The console click-path and the inline JSON below are now a teaching reference, not the
> procedure.** The real, reviewable artifact is
> [`infra/github-oidc.yaml`](../infra/github-oidc.yaml), deployed by change-set per
> [`site-deploy-walkthrough.md`](site-deploy-walkthrough.md) § 7 — clicking this together in
> the console would produce an identity nothing in the repository describes. Where the sketch
> below and the template disagree, **the template is what exists**; two differences are
> deliberate and worth knowing:
>
> - The template **omits `ThumbprintList`**. It is optional on `AWS::IAM::OIDCProvider`, and
>   when absent IAM retrieves the CA thumbprint itself. Hardcoding GitHub's SHA-1 thumbprint —
>   which the AWS Security Blog example below still shows — breaks on certificate rotation.
> - The template's S3 grant is scoped to the **one** site bucket, derived as
>   `toldstraight-site-${AWS::AccountId}`, and `cloudfront:CreateInvalidation` to **one**
>   distribution ARN. The `toldstraight-*` wildcard and `"Resource": "*"` in the sketch below
>   are wider than what was built.

The point: GitHub mints a short-lived OIDC token, AWS trusts it, and the workflow
assumes a role. No secret in the repo, nothing to rotate or leak. This is strictly
better than an IAM user with an access key in GitHub secrets, and it is the pattern
worth having on a résumé.

**Identity provider** — IAM → Identity providers → **Add provider**:

- Type **OpenID Connect**
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

**Role trust policy** — note `StringLike` on the subject, scoped to one repo and one
branch. A missing or over-broad `sub` condition here is the classic mistake: it lets
*any* GitHub repo assume your role.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::448795057993:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:Jared-Godar/audio-lab:ref:refs/heads/main"
      }
    }
  }]
}
```

Name it `AudioLabGitHubDeploy` and attach a **narrower** policy than the human one —
CI should publish content, not register domains:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::toldstraight-*",
        "arn:aws:s3:::toldstraight-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "*"
    }
  ]
}
```

Workflow side:

```yaml
permissions:
  id-token: write   # required for OIDC — without it the assume fails
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::448795057993:role/AudioLabGitHubDeploy
      aws-region: us-east-1
```

## Part 3 — CloudFormation service role (optional)

By default CloudFormation acts with **your** permissions, so a stack can do anything
you can. A service role makes the stack act as itself, with its own scoped policy.

Worth it when: you want stack operations narrower than your own access, or you want
an audit trail attributing changes to the stack rather than to you.

Skip it for now. Revisit when `infra/` has real stacks — noted here so the option
does not get forgotten.

---

## Setup order

1. Create `AudioLabDnsDomains` and `AudioLabSiteInfra` (Part 1) — **before** the
   permission set, which references them by name.
2. Enable Identity Center and create the permission set
   (`aws-identity-center-setup.md`).
3. Attach both policies to the permission set → **Reprovision**.
4. Verify with `aws sts get-caller-identity` — expect `AWSReservedSSO_`.
5. Test the deny direction: `aws iam create-user --user-name should-fail` →
   `AccessDenied`.
6. GitHub OIDC (Part 2) — **due now.** Deploy `infra/github-oidc.yaml` by change-set;
   the step-by-step is `site-deploy-walkthrough.md` § 7.

## What changes for the agent workflow

The hold-for-the-maintainer list still governs: domain registration and billable AWS
resources are your call regardless of which credential mechanism is underneath.

**One thing did change, on 2026-08-01.** This section previously said *"Nothing in
`AGENTS.md` changes"*, and that is no longer true. Conduct rule 6 gained exactly one
named exception: publishing `site/` to the production bucket after a confirmed merge is
pre-authorised, because CI performs it under a role no branch but `main` can assume
(#187, ADR 0020). Nothing else about rule 6 moved, and no agent gained the ability to
publish — the credentials live in GitHub Actions, not in any session.

One practical difference worth knowing: **Identity Center sessions expire.** When a
session dies mid-task, commands fail with `Error loading SSO Token`. That is an
expired login, not a permissions bug — the fix is `aws sso login --profile
audio-lab`, and it is worth recognising on sight rather than debugging a policy.
