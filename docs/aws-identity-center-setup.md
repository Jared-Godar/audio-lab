# AWS IAM Identity Center — setup guide (Option A)

Working note, 2026-07-26. Gitignored.

Console steps and CLI syntax **verified against current AWS documentation on
2026-07-26**, not written from memory. Sources at the bottom. Where this guide and
the console disagree, the console is newer — but the concepts below are stable.

Supersedes Option B (IAM user + assume-role) in `aws-iam-setup.md`. Read
`aws-identity-center-roles.md` next for the machine identities Identity Center
does **not** cover.

---

## Read this before you enable anything

Two facts from the AWS docs that are easy to walk past and expensive to undo.

### 1. Enabling this on a standalone account creates an AWS Organization

Account `448795057993` is standalone. The recommended path (an **organization
instance**) will create an AWS Organization with your account as the management
account.

> **AWS's own warning:** "If you use a free tier account, creating an AWS
> organization automatically upgrades your account to a paid plan with
> pay-as-you-go pricing. **Your free tier credits expire immediately.**"

If you are sitting on free-tier credits you care about, stop and decide before
clicking Enable. If your account is already on pay-as-you-go, this costs nothing —
Organizations and Identity Center are both free.

### 2. An *account* instance cannot do what you want

There are two instance types, and the difference is decisive here:

| | Organization instance | Account instance |
| --- | --- | --- |
| Creates an Organization | yes | no |
| **AWS account access via permission sets** | **yes** | **no** |
| Application assignments | yes | yes |

The AWS tutorial marks the "Add administrative permissions" step **"Follow these
steps only if you enabled an organization instance."** Account instances handle
application assignment, not multi-account AWS permissions.

**You need an organization instance.** The account instance is not a lighter-weight
route to the same thing.

### 3. The Region is effectively permanent

Identity Center runs in **one Region** per organization. Changing it later means
deleting the instance and recreating it — losing users, groups, permission sets,
and assignments. Pick `us-east-1` and stay there: `route53domains` is us-east-1
only, and CloudFront certificates must live in us-east-1.

### 4. Keep a break-glass path

Do not delete your existing IAM admin user or lose the root credentials. If
Identity Center is misconfigured you can lock yourself out of your own account.
Keep one IAM identity with `AdministratorAccess` and MFA, unused day to day.

---

## Step 1 — Enable Identity Center

1. Sign in as your existing IAM admin (or root).
2. Open the **IAM Identity Center** console —
   <https://console.aws.amazon.com/singlesignon>
3. Set the Region selector to **us-east-1** *before* enabling.
4. Under **Enable IAM Identity Center**, choose **Enable**.
5. You will see **Enable IAM Identity Center with AWS Organizations**. This is the
   organization-instance path — the one you want. Review, then **Enable**.

> Ignore the "enable an account instance of IAM Identity Center" link on that page.
> That is the path that cannot grant AWS account access.

Verify: the console shows a **Dashboard** with an **AWS access portal URL** like
`https://d-xxxxxxxxxx.awsapps.com/start`. **Record that URL** — you need it for the
CLI and it is your sign-in address from now on.

## Step 2 — Confirm the identity source

Enabling configures the built-in **Identity Center directory** automatically. That
is what you want for a personal setup — no Active Directory, no Okta.

Verify: **Settings** → **Identity source** reads `Identity Center directory`.

## Step 3 — Create your user

1. Navigation pane → **Users** → **Add user**.
2. **Specify user details**:
   - **Username** — you cannot change this later. Use something you will still
     recognise in three years (`jared`).
   - **Password** — choose **Send an email to this user with password setup
     instructions**. Mail arrives from `no-reply@signin.aws` or
     `no-reply@login.awsapps.com`; allowlist those.
   - **Email address** — must be unique across the directory. If your admin IAM user
     already uses your primary address, this is fine — Identity Center users are a
     separate namespace — but you cannot reuse the same address for two Identity
     Center users.
   - First name, last name, display name.
3. **Next** → **Add user to groups** → **Create group**.
   - This opens a **new browser tab**. Name the group for the *role it plays*, not
     the person — e.g. `audio-lab-admins`. Create group, then **close that tab**.
4. Back on the Add user tab, hit **Refresh** in the Groups area, tick your new
   group, **Next**.
5. **Review and add user**.

> Assign permissions to **groups**, never directly to users. This is the one place
> groups genuinely earn their keep — unlike the IAM-user case in Option B, where a
> group for a single machine identity was pure indirection.

## Step 4 — Create the permission set

Permission sets are the substance. A permission set becomes an **IAM role**
provisioned into the target account, named `AWSReservedSSO_<name>_<hash>`.

1. Navigation pane → **Multi-account permissions** → **AWS accounts**.
2. Tick your account in the **Organizational structure** tree → **Assign users or
   groups**.
3. **Step 1: Select users and groups** — choose `audio-lab-admins` → **Next**.
4. **Step 2: Select permission sets** → **Create permission set** (opens a new tab):
   - **Permission set type** → **Custom permission set** (not Predefined — you want
     the two scoped policies from `aws-identity-center-roles.md`, not
     `AdministratorAccess`).
   - **Policies** — attach the customer managed policies `AudioLabDnsDomains` and
     `AudioLabSiteInfra`. **Create those policies first** (see the companion guide);
     a permission set references customer managed policies **by name**, and the
     policy must already exist in the target account or provisioning fails.
   - **Permission set details** — name `AudioLabDeploy`; **session duration 1 hour**.
   - **Review and create**.
5. Back on the assignment tab, **Refresh**, tick `AudioLabDeploy`, **Next**.
6. **Step 3: Review and submit assignments** → **Submit**. Wait for reprovisioning.

Verify: **AWS accounts** → your account shows the group with the permission set.

> Consider also creating a second permission set with `AdministratorAccess` for
> break-glass and account administration, assigned to the same group. Day-to-day you
> select `AudioLabDeploy`; you escalate only deliberately. This is the least-privilege
> pattern AWS recommends and it reads well on a résumé.

## Step 5 — Activate your login and register MFA

1. Open the invitation email → **Accept invitation**.
2. Set a password. Register an MFA device when prompted — do it now, not later.
3. Sign in at the **AWS access portal URL** from Step 1.
4. Expand the organization → your account → you will see your permission sets, each
   with two options: **Role** (console) and **Access keys** (CLI).

## Step 6 — Wire up the CLI

Get the two values first: in the access portal, click **Access keys** next to
`AudioLabDeploy`, then the **IAM Identity Center credentials** method. It shows the
**SSO Start URL** and **SSO Region**.

Then run the wizard:

```fish
aws configure sso
```

Answer:

```text
SSO session name (Recommended): audio-lab
SSO start URL [None]: https://d-xxxxxxxxxx.awsapps.com/start
SSO region [None]: us-east-1
SSO registration scopes [None]: sso:account:access
```

Your browser opens for authorization. (Your CLI is 2.35.11, so this uses **PKCE**,
which must be completed on this same machine. Add `--use-device-code` only if you
need to authorize from a different device.)

Then pick the account and role when prompted, and finish:

```text
Default client Region [None]: us-east-1
CLI default output format [None]: json
Profile name [...]: audio-lab
```

Resulting `~/.aws/config`:

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

The separate `[sso-session]` block is what enables **automatic token refresh**.
Profiles that inline `sso_start_url` instead are the legacy form and do not refresh
— if you hand-edit this file, keep the two-block shape.

**Nothing goes in `~/.aws/credentials`.** No access key, no secret. That is the
entire point of this option: there is no long-lived credential to leak.

Set the profile in Fish:

```fish
set -gx AWS_PROFILE audio-lab
```

To make it permanent:

```fish
set -Ux AWS_PROFILE audio-lab
```

## Step 7 — Verify, including the deny direction

```fish
aws sso login --profile audio-lab
aws sts get-caller-identity --profile audio-lab
```

Expect an ARN of the form:

```text
arn:aws:sts::448795057993:assumed-role/AWSReservedSSO_AudioLabDeploy_<hash>/jared
```

That `AWSReservedSSO_` prefix is the confirmation you are on an Identity Center
role and not a leftover IAM user.

Positive checks:

```fish
aws route53domains list-prices --region us-east-1 --max-items 5
aws route53 list-hosted-zones
aws cloudformation list-stacks --max-items 5
```

Negative check — a policy tested only in the allow direction is untested:

```fish
aws iam create-user --user-name should-fail
```

Expect `AccessDenied`.

Session hygiene:

```fish
aws sso logout
```

## Step 8 — Retire the old path

Once the above verifies, the Option B artifacts are dead weight and each one is a
standing credential risk:

- Delete any access key on `lifeos-archive-user` you are not actively using.
- Do **not** create `audio-lab-cli`. Identity Center replaces it.
- Keep exactly one break-glass IAM admin with MFA.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `Error loading SSO Token` / `Token has expired` | Run `aws sso login --profile audio-lab`. Tokens are short-lived by design. |
| Browser opens but authorization fails | PKCE requires the browser on the **same device**. Use `--use-device-code` for a different device. |
| Permission set fails to provision | It references a customer managed policy by **name** that does not exist in the target account. Create the policies first. |
| Changed a policy, CLI still denied | Permission sets need re-provisioning after policy edits — **AWS accounts** → select account → **Reprovision**. |
| `sts:AssumeRole` errors mentioning `AWSReservedSSO_` | You are editing the provisioned role directly. Never do that — edit the permission set; the role is regenerated from it. |

## Sources

Verified 2026-07-26:

- [Enable IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/get-set-up-for-idc.html)
- [Configure user access with the default directory](https://docs.aws.amazon.com/singlesignon/latest/userguide/quick-start-default-idc.html)
- [Configuring IAM Identity Center authentication with the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
