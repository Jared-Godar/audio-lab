# Audience list + AWS access guide

How to sign in, read the signup audience from the CLI, find the site bucket in the
console, close the least-privilege gap in **#148**, and split **#144** into the parts a
CLI session can do and the parts only the maintainer can.

> **Verification status of this document.** Every resource name, ARN, policy statement
> and console path below was read out of this repository's tracked files
> (`infra/signup.yaml`, `infra/site.yaml`, `infra/dns.yaml`, `infra/policies/*.json`,
> `infra/README.md`, `docs/aws-identity-center-roles.md`) and `~/.aws/config` on
> 2026-08-01. The AWS CLI commands were **not executed** against the live account while
> writing this — the SSO token was expired (`Token has expired and refresh failed`), so
> output shapes come from the SES v2 / S3 API contracts, not from an observed run. Run
> the login block first and everything else becomes live.

---

## 1. Signing in

### Console (browser)

**AWS access portal:** <https://d-906679548d.awsapps.com/start>

That is the sign-in URL for the console. It is *not* the same string as
`sso_start_url` in `~/.aws/config`, which is the newer
`https://identitycenter.amazonaws.com/ssoins-7223329d63d09094` form — both point at the
same organization instance, but only the `d-906679548d.awsapps.com/start` one renders a
browser portal. Pasting the `ssoins-` URL into a browser is a dead end.

At the portal: **AWS Account `448795057993`** → pick a role.

| Role | Use it for |
| --- | --- |
| `AudioLabDeploy` | Everyday deploys. The least-privilege default. |
| `AdministratorAccess` | Escalation. Required today for anything SES contact-list — see §5. |
| `LifeOSArchive` | Unrelated archive access. Never for this repo. |

Session duration on `AudioLabDeploy` is **1 hour** — expect to re-authenticate often.

### CLI

```fish
aws sso login --profile audio-lab-admin
```

Confirm which identity you actually got:

```fish
aws sts get-caller-identity --profile audio-lab-admin --region us-east-1
```

> **Always pass `--profile` explicitly.** This machine's default profile is `lifeos`
> (the archive role). A forgotten `--profile` does not error out with "no credentials" —
> it succeeds as the wrong principal and surfaces later as a confusing `AccessDenied`.

---

## 2. Reading the audience list from the CLI

**There is no database.** `infra/signup.yaml` stores signups directly in an
**SES v2 contact list** named `toldstraight-audience`, in `us-east-1`. No DynamoDB, no
third-party ESP — the list never leaves the account. So the tool is `aws sesv2`.

**Use `--profile audio-lab-admin`.** The `audio-lab` (deploy) profile cannot read this
list — see §5 for why and how to fix it.

### Table view

```fish
aws sesv2 list-contacts \
    --contact-list-name toldstraight-audience \
    --region us-east-1 --profile audio-lab-admin \
    --output table \
    --query 'Contacts[].{Email:EmailAddress,Updated:LastUpdatedTimestamp,Unsubscribed:UnsubscribeAll}'
```

### Just the email list, one per line

```fish
aws sesv2 list-contacts \
    --contact-list-name toldstraight-audience \
    --region us-east-1 --profile audio-lab-admin \
    --output text \
    --query 'Contacts[].[EmailAddress]'
```

The brackets around `[EmailAddress]` are load-bearing. `Contacts[].EmailAddress` returns
a *flat* list, and `--output text` prints a flat list **tab-separated on one line**.
Wrapping each address in its own sub-list makes it one row per contact, so the output is
newline-delimited and pipes cleanly into `sort`, `wc -l`, or a file.

### Count only

```fish
aws sesv2 list-contacts \
    --contact-list-name toldstraight-audience \
    --region us-east-1 --profile audio-lab-admin \
    --output text --query 'length(Contacts)'
```

### Save a dated snapshot

`output/` is gitignored, so a snapshot never risks committing subscriber addresses:

```fish
aws sesv2 list-contacts \
    --contact-list-name toldstraight-audience \
    --region us-east-1 --profile audio-lab-admin \
    --output text --query 'Contacts[].[EmailAddress]' \
    > output/20260801-aws-sesv2-toldstraight-audience-emails.txt
```

### Check one specific address

```fish
aws sesv2 get-contact \
    --contact-list-name toldstraight-audience \
    --email-address you+test@example.com \
    --region us-east-1 --profile audio-lab-admin
```

### Things to know about this data

- **SES gives you no signup timestamp.** The only time field is
  `LastUpdatedTimestamp`. For a contact that has never been modified this is effectively
  the signup time, but it silently rewrites on any update — do not treat it as a durable
  acquisition date. If signup-date reporting ever matters, it has to be captured at write
  time by the Lambda, not read back out of SES.
- **The AWS CLI auto-paginates `list-contacts`**, so these return the whole list past the
  API's per-page limit. No `NextToken` loop needed.
- **`UnsubscribeAll: true` means gone.** A contact is subscribed unless they opt out
  (`DEFAULT_UNSUBSCRIBE` on the `release-and-updates` topic — single opt-in). Filter
  those out before any send:

  ```fish
  aws sesv2 list-contacts \
      --contact-list-name toldstraight-audience \
      --region us-east-1 --profile audio-lab-admin \
      --output text \
      --query 'Contacts[?UnsubscribeAll==`false`].[EmailAddress]'
  ```

- **One list per account per region.** SES allows exactly one contact list, so
  `toldstraight-audience` is effectively a permanent name once created.
- These addresses are personal data covered by `docs/privacy-policy.md`. Don't paste them
  into issues, PRs, or anywhere tracked by git.

---

## 3. Finding the site bucket in the console

**Bucket name:** `toldstraight-site-448795057993`

The name is generated in `infra/site.yaml` from `Fn::Sub: "toldstraight-site-${AWS::AccountId}"`,
so the account ID is baked into it.

### Click path

1. Sign in at <https://d-906679548d.awsapps.com/start>.
2. Account `448795057993` → **`AudioLabDeploy`** → **Management console**.
3. Confirm the region selector (top right) reads **N. Virginia / us-east-1**. S3's bucket
   list is global, but every other console page here is regional and will look empty in
   the wrong region.
4. Search **S3** in the top search bar → **S3**.
5. In **Buckets**, filter for `toldstraight` → click **`toldstraight-site-448795057993`**.

### What you'll see, and what you won't

- **The bucket is private and has no website endpoint.** Public access is fully blocked
  and CloudFront reaches it through an Origin Access Control. There is no
  `s3-website-...` URL and the object URLs return 403 — that is correct, not broken.
  The site is only reachable through the CloudFront distribution.
- **Versioning is on.** The **Versions** toggle on the objects list shows prior revisions;
  overwriting a file does not destroy the old one.
- **Encryption is SSE-S3 (AES256)**, and object ownership is `BucketOwnerEnforced`, so
  the ACLs tab is intentionally inert.

### The CLI equivalents

```fish
aws s3 ls s3://toldstraight-site-448795057993/ \
    --recursive --human-readable --summarize \
    --region us-east-1 --profile audio-lab-admin
```

```fish
aws s3api list-buckets --profile audio-lab-admin \
    --query 'Buckets[?starts_with(Name, `toldstraight`)].Name' --output text
```

> `AudioLabDeploy` **can** read and write this bucket — `AudioLabSiteInfra` scopes S3 to
> `arn:aws:s3:::toldstraight-*`. The bucket is one of the few `toldstraight-*` resources
> the deploy role already reaches; §5 explains why most of the others it can't.

---

## 4. What is actually deployed vs. what isn't

| Thing | Where it's defined | State |
| --- | --- | --- |
| Site bucket + CloudFront | `infra/site.yaml` | Deployed |
| DNS zone, SPF, DMARC, Apple DKIM | `infra/dns.yaml` | Deployed |
| SES EasyDKIM CNAMEs (3) | `infra/dns.yaml` | **In the template** (commit `ab33b9c`, #144) — redeploy of the DNS stack still required |
| Signup Lambda + contact list | `infra/signup.yaml` | Deployed under `audio-lab-admin` (the #148 interim) |
| SES sandbox exit | *not code* | Not done — maintainer support case |
| Launch send | *not written* | Not started (#144 step 4) |

---

## 5. Issue #148 — giving `AudioLabDeploy` the signup permissions

### The finding that changes the fix

The issue reads like "the role is missing SES actions." Reading the live permission set
showed something more specific, already recorded in `CHANGELOG.md`:

> The `AudioLabDeploy` failures are **mostly resource-ARN scope, not missing actions**.

`AudioLabSiteInfra` already grants the full Lambda / Logs / IAM lifecycle — but **every
ARN is scoped to `audiolab-*`**, the audition stack's naming, while the signup stack
names everything `toldstraight-*`. Same shape for the `ses:TagResource` denial that was
the root failure: the action *is* granted by `AudioLabMail`, but only on
`identity/toldstraight.com`, never `contact-list/*`.

So the genuinely absent pieces are narrower than the issue suggests:

1. The **SES contact-list family** (`contact-list/*` appears in no policy at all).
2. The **Lambda function-URL-config family** (`CreateFunctionUrlConfig` and friends are
   in no policy at all).
3. **`toldstraight-*` ARN coverage** for Lambda, IAM roles, and CloudWatch Logs.

`AudioLabMail` v1 already covers the SES *email identity* and `SendEmail` — **#144 needs
no new identity permissions**, only the contact-list ones below.

### Why a fourth policy, not an edit to `AudioLabSiteInfra`

A managed policy is capped at **6,144 characters** (AWS excludes whitespace, so minifying
is not an escape hatch). `AudioLabSiteInfra` v4 is already **5,072** minified — 1,072 of
headroom. The additions above do not fit, and this is not hypothetical: the single-policy
structure already blew that limit once on 2026-07-27 and had to be split.

A new fourth policy also keeps the seam honest — the signup/sending stack has an
independent lifecycle from the audition platform — and it is a **pure add**, so there is
no way to break the working audition deploy while fixing the signup one. The permission
set allows 10 policies and currently carries 3.

### The new policy

Tracked verbatim at
[`infra/policies/20260801-aws-iam-AudioLabSignup-v1-signup-collection.json`](../infra/policies/20260801-aws-iam-AudioLabSignup-v1-signup-collection.json)
— **6 statements, 2,127 characters minified, 4,017 of headroom** (measured with
`json.dumps(separators=(',',':'))`, not estimated).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AudienceContactList",
      "Effect": "Allow",
      "Action": [
        "ses:CreateContactList",
        "ses:GetContactList",
        "ses:UpdateContactList",
        "ses:DeleteContactList",
        "ses:CreateContact",
        "ses:GetContact",
        "ses:UpdateContact",
        "ses:DeleteContact",
        "ses:ListContacts",
        "ses:TagResource",
        "ses:UntagResource",
        "ses:ListTagsForResource"
      ],
      "Resource": "arn:aws:ses:us-east-1:448795057993:contact-list/*"
    },
    {
      "Sid": "ContactListDiscovery",
      "Effect": "Allow",
      "Action": "ses:ListContactLists",
      "Resource": "*"
    },
    {
      "Sid": "SignupLambda",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:ListVersionsByFunction",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:GetPolicy",
        "lambda:CreateFunctionUrlConfig",
        "lambda:GetFunctionUrlConfig",
        "lambda:UpdateFunctionUrlConfig",
        "lambda:DeleteFunctionUrlConfig",
        "lambda:TagResource",
        "lambda:UntagResource",
        "lambda:ListTags"
      ],
      "Resource": "arn:aws:lambda:us-east-1:448795057993:function:toldstraight-*"
    },
    {
      "Sid": "SignupRoleLifecycle",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:UpdateAssumeRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      "Resource": "arn:aws:iam::448795057993:role/toldstraight-*"
    },
    {
      "Sid": "PassOnlyToldstraightRolesToLambda",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::448795057993:role/toldstraight-*",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "lambda.amazonaws.com"
        }
      }
    },
    {
      "Sid": "SignupLambdaLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:PutRetentionPolicy",
        "logs:DeleteRetentionPolicy",
        "logs:TagLogGroup",
        "logs:TagResource",
        "logs:UntagResource",
        "logs:ListTagsForResource",
        "logs:DescribeLogStreams",
        "logs:GetLogEvents",
        "logs:FilterLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:us-east-1:448795057993:log-group:/aws/lambda/toldstraight-*",
        "arn:aws:logs:us-east-1:448795057993:log-group:/aws/lambda/toldstraight-*:*"
      ]
    }
  ]
}
```

### Deliberate design decisions in that JSON

- **`iam:AttachRolePolicy` / `iam:DetachRolePolicy` are omitted.** Combined with the
  `PassRole` grant, they are a textbook privilege-escalation path: attach
  `AdministratorAccess` to a `toldstraight-*` role, pass it to Lambda, invoke. The signup
  stack only uses an **inline** role policy (`Policies:` in the template →
  `iam:PutRolePolicy`), so it does not need them. If a future stack attaches a *managed*
  policy to a `toldstraight-*` role, that deploy will fail with `AccessDenied` on
  `iam:AttachRolePolicy` — that failure is the design working, and the fix is a
  deliberate decision, not a reflex widening.
  > Worth knowing: `AudioLabSiteInfra` v4 **does** grant `AttachRolePolicy` on
  > `audiolab-*` alongside `PassRole`, so that escalation path already exists for the
  > audition stack. Pre-existing, out of scope here, but it should not be replicated.
- **`ses:TagResource` is scoped to `contact-list/*`, not `*`.** This is the exact action
  whose denial was the root failure — CloudFormation's `AWS::SES::ContactList` handler
  tags the list on create.
- **`logs:DeleteLogGroup` is included on purpose.** Its absence is what left the failed
  stack stuck in `ROLLBACK_FAILED` — rollback could not delete `SignupLogGroup`.
- **Both `logs:TagLogGroup` and `logs:TagResource` are present.** CloudFormation migrated
  between these two tagging APIs; which one fires depends on the resource handler version.
- **The role ARN pattern depends on the stack name.** `SignupFunctionRole` in
  `infra/signup.yaml` sets no `RoleName`, so CloudFormation generates
  `<stack-name>-SignupFunctionRole-<random>`. Because the stack is named
  `toldstraight-signup`, the generated name starts with `toldstraight-` and matches
  `role/toldstraight-*`. **Rename the stack and this policy silently stops matching.**

### Walkthrough — applying it

Do this as `AdministratorAccess`; `AudioLabDeploy` is denied `iam:ListPolicies` and
`iam:GetPolicyVersion` by design, and widening IAM so the role can read its own policies
would be exactly the wrong fix.

**Step 1 — create the managed policy.**

Console → **IAM** → **Policies** → **Create policy** → the **JSON** tab.

Use the JSON tab, **not the visual editor** — the visual editor's "string like" matcher
can silently widen an ARN, which is how a `toldstraight-*` scope quietly becomes `*`.

Paste the JSON above. **Next** → name it exactly **`AudioLabSignup`** → description
*"Signup collection + audience contact list for toldstraight.com (#148)."* → **Create policy**.

**Step 2 — attach it to the permission set.**

Console → **IAM Identity Center** → **Permission sets** → **`AudioLabDeploy`** →
**Policies** tab → **Customer managed policies** → **Attach policies** → type
**`AudioLabSignup`** **by name** → **Attach**.

Identity Center references customer-managed policies *by name*, not ARN — the policy must
exist in the account (Step 1) before this succeeds, and the name must match character for
character.

**Step 3 — reprovision. This step is the one people skip.**

Console → **IAM Identity Center** → **Permission sets** → **`AudioLabDeploy`** →
**AWS accounts** tab → tick account `448795057993` → **Reprovision**.

*Attaching* a policy to a permission set requires reprovisioning; *editing an existing
policy's contents* takes effect immediately. Skip this and the console will happily show
the policy attached while the role in the account still has the old permissions — the
change appears applied and nothing behaves differently.

**Step 4 — get a fresh session.** The old token still carries the old permissions.

```fish
aws sso logout
aws sso login --profile audio-lab
```

**Step 5 — verify with the least-privilege profile.** Note `--profile audio-lab`, not
`-admin`. That switch *is* the test:

```fish
aws sesv2 list-contact-lists --region us-east-1 --profile audio-lab
aws sesv2 list-contacts --contact-list-name toldstraight-audience \
    --region us-east-1 --profile audio-lab --output text --query 'length(Contacts)'
aws lambda get-function-url-config --function-name toldstraight-signup \
    --region us-east-1 --profile audio-lab
```

**Step 6 — the real acceptance test (destructive; your call).** #148 asks that the stack
deploy under `audio-lab`, and the only honest proof is deleting the admin-created stack
and redeploying:

```fish
aws cloudformation delete-stack --stack-name toldstraight-signup \
    --region us-east-1 --profile audio-lab-admin
aws cloudformation wait stack-delete-complete --stack-name toldstraight-signup \
    --region us-east-1 --profile audio-lab-admin

aws cloudformation deploy --stack-name toldstraight-signup \
    --template-file infra/signup.yaml --capabilities CAPABILITY_IAM \
    --region us-east-1 --profile audio-lab
```

> **This destroys the contact list and every signup in it.** Deleting the stack deletes
> `AWS::SES::ContactList`. Export the addresses first (§2, "Save a dated snapshot") and be
> deliberate about whether the least-privilege proof is worth it while the list has real
> subscribers on it. Deleting the stack also rotates the **Function URL**, so
> `site/` must be updated with the new endpoint afterward. If there are live signups,
> the defensible order is: close #148's *policy* work now, verify with Step 5's read-only
> checks, and defer Step 6 to the next time the stack genuinely needs a rebuild.

### One discrepancy to resolve while you're in there

`infra/policies/` tracks a file named `…AudioLabSiteInfra-**v4**…`, but the live default
version in IAM was observed as **v3**. Either the v4 JSON was authored and never applied,
or it was applied and then rolled back. While you have the console open, check
**IAM → Policies → `AudioLabSiteInfra` → Policy versions** and reconcile — the tracked
file is supposed to be the verbatim record of what is live, and right now one of the two
is lying. Separately, `AudioLabDnsDomains` has **no JSON file at all** in
`infra/policies/`; its text lives only inline in `infra/README.md`.

---

## 6. Issue #144 — SES sending

Issue #144 is the manual and launch-time half of the signup work. The useful split is **what a
CLI executor session can legitimately do** versus **what needs you**.

### What a CLI executor session can do

These are authoring, reading, and verification — no spend, nothing irreversible, nothing
outward-facing. An agent session can complete these unattended:

- **Author the template changes.** Already done for step 2: the three EasyDKIM CNAMEs are
  in `infra/dns.yaml` as of commit `ab33b9c`, with a comment explaining why the usual
  "relax DMARC alignment" advice does not apply to this domain.
- **Read stack outputs, including the DKIM tokens.**

  ```fish
  aws cloudformation describe-stacks --stack-name toldstraight-signup \
      --region us-east-1 --profile audio-lab-admin \
      --query 'Stacks[0].Outputs' --output table
  ```

- **Check DKIM verification status** and report it plainly.

  ```fish
  aws sesv2 get-email-identity --email-identity toldstraight.com \
      --region us-east-1 --profile audio-lab-admin \
      --query '{Verified:VerifiedForSendingStatus,Dkim:DkimAttributes.Status,Tokens:DkimAttributes.Tokens}'
  ```

- **Check whether the CNAMEs actually resolve in public DNS** — the step that catches a
  DNS stack that was edited but never redeployed:

  ```fish
  for t in sixxhervxran37gyqtpawr2c7kmerq6t wcwnf2kstuhbpkh6fyfs6qa3sagtlwvf qxtsbnyw5nypdhzzgvofyqapz6o4ynhe
      dig +short CNAME $t._domainkey.toldstraight.com
  end
  ```

  Expect each to return `<token>.dkim.amazonses.com.`. Empty output means the DNS stack
  has not been redeployed.
- **Check sandbox status** (`ProductionAccessEnabled: false` means still sandboxed):

  ```fish
  aws sesv2 get-account --region us-east-1 --profile audio-lab-admin \
      --query '{Sandbox:ProductionAccessEnabled,Sending:SendingEnabled,Quota:SendQuota}'
  ```

- **Author the send script** for step 4 — the "we are live" blast — including the
  `UnsubscribeAll` filter, the unsubscribe link, dry-run mode, and a printed recipient
  count before anything sends. Authoring and reviewing it needs no sandbox exit.
- **Prepare a reviewed change-set** for the DNS redeploy without executing it, so you can
  read the diff before anything changes:

  ```fish
  aws cloudformation create-change-set --stack-name toldstraight-dns \
      --change-set-name dkim-cnames --change-set-type UPDATE \
      --template-body file://infra/dns.yaml \
      --parameters \
          ParameterKey=HostedZoneId,UsePreviousValue=true \
          ParameterKey=DomainName,UsePreviousValue=true \
          ParameterKey=DeploySiteRecords,UsePreviousValue=true \
          ParameterKey=SiteDistributionDomain,UsePreviousValue=true \
          ParameterKey=DeployVoteRecord,UsePreviousValue=true \
          ParameterKey=VoteTarget,UsePreviousValue=true \
      --region us-east-1 --profile audio-lab-admin

  aws cloudformation describe-change-set --stack-name toldstraight-dns \
      --change-set-name dkim-cnames --region us-east-1 --profile audio-lab-admin \
      --query 'Changes[].ResourceChange.{Action:Action,Type:ResourceType,Id:LogicalResourceId}' \
      --output table
  ```

  > **Every `UsePreviousValue=true` above is load-bearing — do not trim them.** Raw
  > `create-change-set` is not `aws cloudformation deploy`: for any parameter you omit,
  > it falls back to the **template default**, not the value the stack currently holds.
  > `infra/dns.yaml` defaults `DeploySiteRecords` to `"false"`, so a change-set that
  > omits it would silently propose **deleting the live apex and `www` records** while
  > you were only trying to add three CNAMEs. `HostedZoneId` has no default at all, so
  > omitting the block entirely fails loudly — which is the only reason a careless
  > version of this command errors instead of quietly arming a site outage. This is
  > exactly why step 2's rule is *read the change-set before executing it*.

- **Update `CHANGELOG.md`, `infra/README.md`, and this guide** as facts change.

### What only you can do

Per `AGENTS.md`, these are billable, irreversible, or outward-facing — an executor
session stops and hands them over:

| # | Step | Why it's yours |
| --- | --- | --- |
| 1 | **Execute the DNS change-set** | Mutates live public DNS for the domain. |
| 2 | **Request SES sandbox exit** | A support case tied to your identity, with commitments about sending practice that an agent cannot make on your behalf. |
| 3 | **Execute the launch send** | Outward-facing and unrecallable. Once it lands in someone's inbox there is no undo. |
| 4 | **Any stack delete** (§5 Step 6) | Destroys the contact list and every subscriber in it. |

### Walkthrough — the manual steps

**Step 1 — redeploy the DNS stack so the DKIM CNAMEs go live.**

The three CNAMEs are already in `infra/dns.yaml`. Review the change-set from the executor
section above, confirm it shows three `AWS::Route53::RecordSet` additions **and nothing
else**, then execute:

```fish
aws cloudformation execute-change-set --stack-name toldstraight-dns \
    --change-set-name dkim-cnames --region us-east-1 --profile audio-lab-admin
aws cloudformation wait stack-update-complete --stack-name toldstraight-dns \
    --region us-east-1 --profile audio-lab-admin
```

Then wait for SES to notice. Verification is usually minutes but AWS allows up to 72
hours; re-run the `get-email-identity` check until `Dkim.Status` reads `SUCCESS`.

> **Do not delete the Apple `sig1._domainkey` CNAME.** Inbound mail stays on iCloud+.
> DKIM is designed for multiple selectors coexisting — Apple signs inbound-domain mail,
> SES signs what you send from the list, and receivers match on the selector in each
> message. Both must live in the zone simultaneously.

**Step 2 — request sandbox exit.** Do this early; approval runs about 24 hours and
nothing can be sent to a non-verified address until it lands.

1. Sign in at <https://d-906679548d.awsapps.com/start> → account `448795057993` →
   **`AdministratorAccess`** → **Management console**.
2. Region selector → **N. Virginia (us-east-1)**. Sandbox status is **per region**;
   requesting it in the wrong region grants nothing useful here.
3. Search **Amazon SES** → **Amazon Simple Email Service**.
4. Left nav → **Account dashboard**. A banner reads *"Your Amazon SES account is in the
   sandbox in US East (N. Virginia)."*
5. Click **Request production access**.
6. Fill the form:
   - **Mail type:** Marketing
   - **Website URL:** `https://toldstraight.com`
   - **Use case description:** be concrete and honest — a podcast release-notification
     list; single opt-in through a form on our own site with a honeypot; addresses are
     stored only in an SES contact list we own; every send carries a working unsubscribe
     link; bounces and complaints are monitored and hard-bounced addresses are removed.
     Vague answers are the most common rejection reason.
   - **Additional contacts / preferred language:** as you like.
7. Accept the AUP checkbox → **Submit request**.

Confirm afterwards from the CLI — `ProductionAccessEnabled` flips to `true`:

```fish
aws sesv2 get-account --region us-east-1 --profile audio-lab-admin \
    --query '{Sandbox:ProductionAccessEnabled,Quota:SendQuota}'
```

> **While sandboxed you can still test end to end**, as long as both sender *and*
> recipient are verified identities. Verify a personal address once and the whole path is
> testable before approval lands:
>
> ```fish
> aws sesv2 create-email-identity --email-identity you@example.com \
>     --region us-east-1 --profile audio-lab-admin
> ```

**Step 3 — the launch send.** Gated on Steps 1 and 2 both being green. Before it runs:

- Sandbox exit approved, and DKIM `Status: SUCCESS`.
- A test send to yourself shows **`dkim=pass; spf=pass; dmarc=pass`** in the raw headers.
  DMARC on this domain is `p=reject` with **strict** alignment (`adkim=s; aspf=s`) — a
  misaligned send is not softly filtered, it is **rejected outright**. Check headers on
  the test, do not assume.
- The recipient list is the `UnsubscribeAll == false` filter from §2, and the count is
  printed and eyeballed before sending.
- Every message carries a working unsubscribe link.
- A dry run has printed the exact recipient count and rendered body.

### Acceptance checklist (from the issue)

- [ ] Signup stack deployed; endpoint reachable from `toldstraight.com` — *done under
      `audio-lab-admin`; #148 closes the least-privilege half*
- [ ] SES identity verified (DKIM CNAMEs live) — *in the template, DNS stack redeploy pending*
- [ ] Sandbox exit approved
- [ ] Test send delivers with pass DKIM/SPF/DMARC
- [ ] `CHANGELOG.md` entry

---

## Quick reference

| | |
| --- | --- |
| Console sign-in | <https://d-906679548d.awsapps.com/start> |
| Account | `448795057993` |
| Region | `us-east-1` (everything) |
| CLI login | `aws sso login --profile audio-lab-admin` |
| Contact list | `toldstraight-audience` |
| Topic | `release-and-updates` |
| Site bucket | `toldstraight-site-448795057993` |
| Signup function | `toldstraight-signup` |
| Log group | `/aws/lambda/toldstraight-signup` (90-day retention) |
| Stacks | `toldstraight-site`, `toldstraight-dns`, `toldstraight-signup` |
| Hosted zone | `Z09608783EP48AD8RCAL5` |

**Related:** [`infra/README.md`](../infra/README.md) ·
[`docs/signup-deploy-walkthrough.md`](signup-deploy-walkthrough.md) ·
[`docs/site-deploy-walkthrough.md`](site-deploy-walkthrough.md) ·
[`docs/aws-identity-center-roles.md`](aws-identity-center-roles.md) ·
[`docs/privacy-policy.md`](privacy-policy.md)
