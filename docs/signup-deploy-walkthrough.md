# Signup — deploy & go-live walkthrough

> **Revision history** — newest first. This doc is **rewritten in place** as blockers surface
> during real deploy attempts, so the top entry tells you at a glance how current it is. If
> the newest entry predates your last failed attempt, it has not caught up yet.
>
> **2026-07-31 (evening) — DKIM verified; §6 gains the request answers.** The SES DKIM CNAMEs
> deployed and SES reported `SUCCESS` after ~4 hours, so §5 is marked done with what the timing
> actually looked like. §6 records that the console **gates** the production-access request behind
> domain verification — it is not the independent step it appears to be from the CLI — and now
> carries ready-to-paste answers for the request form.
>
> **2026-07-31 (later) — §5 is now a real procedure (#144).** The three SES DKIM CNAMEs are in
> `infra/dns.yaml`, so §5 stopped saying "add them yourself" and became the change-set flow, with
> the three-row expectation to check before executing and the records that must NOT appear. Also
> records why a custom MAIL FROM is deliberately not adopted under strict DMARC alignment.
>
> **2026-07-31 09:16 EDT — rewritten after the first live deploy attempt failed** (#150,
> PR #151). Step count went 6 → 7, and every step now states what *failure* looks like, not
> just the happy path. Changes:
>
> - **New lead section "Which profile"** — use `audio-lab-admin`, not `audio-lab`, until #148
>   closes; plus the `lifeos`-default trap (a forgotten `--profile` surfaces as `AccessDenied`
>   naming `LifeOSArchive`, not a credentials error).
> - **New step 1, Pre-flight** — pull `main` before deploying (`--template-file` reads your
>   local checkout, not GitHub), plus the three leftover checks that prevent `AlreadyExists`.
> - **New "Recovering from `ROLLBACK_FAILED`"** — a failed stack cannot be updated; `deploy`
>   refuses before it starts and produces *no new stack events*, which reads as a stale error.
> - **New "Verify the endpoint actually answers" under step 3** — `CREATE_COMPLETE` does not
>   mean the URL works. `get-policy` plus a malformed-email POST: `400` = good, `403` = the
>   resource policy is missing.
> - **Renumbering** — deploy is now step 2, outputs step 3 (pre-flight took the front).
> - Also replaced an accidental terminal paste (duplicated deploy block, malformed fence).
>
> **2026-07-31 08:55 EDT — fixed unrunnable commands** (#146, PR #147). `--profile default`
> → `--profile audio-lab`, added `--region us-east-1` throughout; recorded the real SSO
> portal `https://d-906679548d.awsapps.com/start`.
>
> **2026-07-31 08:17 EDT — created** (#140, PR #145) alongside `infra/signup.yaml`.

The manual steps behind `infra/signup.yaml` (#140) and the sending work (#144). The repo
authors the template; **you deploy** (billable AWS) and do the console-only steps here.
Collection works after step 4; sending needs steps 5–7.

Region is **`us-east-1`**, account **`448795057993`** (the one holding the Route 53 zone),
unless you have decided on a separate account (#114). Commands are Fish.

## Which profile — read this before you run anything

Use **`--profile audio-lab-admin`** for every command below until #148 is closed.

The documented least-privilege profile `audio-lab` **cannot deploy this stack today**. Its
permission set is scoped to the audition stack's `audiolab-*` naming, and the signup stack
names its resources `toldstraight-*`, so most grants simply do not match. See #148 for the
measured gap list. Once #148 lands, swap `audio-lab-admin` back to `audio-lab` here.

**Always pass `--profile` explicitly.** This machine's default profile is `lifeos`
(the `LifeOSArchive` role), which has no access to these resources — a command with the
flag omitted fails with a confusing `AccessDenied` naming `LifeOSArchive`, not a missing
credentials error. If you see `LifeOSArchive` in an error, you forgot the flag.

This machine is SSO-only. If a command returns an auth or token error, refresh with:

```fish
aws sso login --profile audio-lab-admin
```

The browser access portal for console login is `https://d-906679548d.awsapps.com/start`
(see `infra/README.md`). The `identitycenter.amazonaws.com/ssoins-…` URL that the CLI
prints is **CLI-only** — it renders a blank page in a browser. Do not use it to log in.

## What each part gives you

- **Steps 1–4 — collection (unblocks the Coming Soon page go-live).** Signups land in the
  SES contact list. No email is sent.
- **Steps 5–7 — sending (#144, needed only when you mail people).** DKIM verification and
  sandbox exit; a test send.

---

## 1. Pre-flight

`aws cloudformation deploy --template-file infra/signup.yaml` reads the template from
**whatever checkout your shell is in**. It does not fetch from GitHub. So if a template fix
was just merged, pull it first or you will deploy the old file and get a green stack that
is silently broken:

```fish
cd ~/Code/audio-lab; and git checkout main; and git pull
```

Then confirm no stack and no leftover resources exist. A leftover log group or contact list
turns the next create into an `AlreadyExists` failure — the log group name is hardcoded in
the template, and SES allows exactly **one contact list per account per region**.

```fish
aws cloudformation describe-stacks --stack-name toldstraight-signup \
    --region us-east-1 --profile audio-lab-admin \
    --query 'Stacks[0].StackStatus' --output text
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/toldstraight-signup \
    --region us-east-1 --profile audio-lab-admin --query 'logGroups[].logGroupName'
aws sesv2 list-contact-lists --region us-east-1 --profile audio-lab-admin
```

Expect a `does not exist` error from the first and empty results from the other two. If the
stack **does** exist in a failed state, do the recovery below before continuing.

### Recovering from `ROLLBACK_FAILED` / `ROLLBACK_COMPLETE`

A stack in either state **cannot be updated** — `deploy` fails while "Waiting for stack
create/update to complete" without producing any new stack events, which looks like a
deploy failure but is really a refusal to start. Delete it and start clean:

```fish
aws cloudformation delete-stack --stack-name toldstraight-signup \
    --region us-east-1 --profile audio-lab-admin
aws cloudformation wait stack-delete-complete --stack-name toldstraight-signup \
    --region us-east-1 --profile audio-lab-admin
```

Then re-run the three pre-flight checks above before deploying.

To see why a stack failed (this needs `--profile`, same trap as above):

```fish
aws cloudformation describe-stack-events --stack-name toldstraight-signup \
    --region us-east-1 --profile audio-lab-admin \
    --query 'StackEvents[?contains(ResourceStatus,`FAILED`)].{L:LogicalResourceId,S:ResourceStatus,R:ResourceStatusReason}' \
    --output json
```

## 2. Deploy the signup stack

```fish
set STACK toldstraight-signup
aws cloudformation deploy \
    --stack-name $STACK \
    --template-file infra/signup.yaml \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides AllowedOrigin=https://toldstraight.com \
    --region us-east-1 --profile audio-lab-admin
```

`CAPABILITY_IAM` is required (the stack creates the function's execution role). To review
before applying, use `aws cloudformation create-change-set … --change-set-name …` then
inspect it in the console (CloudFormation → Stacks → change set), the same flow as the DNS
stack in `infra/README.md`.

## 3. Read the outputs

```fish
aws cloudformation describe-stacks --stack-name toldstraight-signup \
    --query 'Stacks[0].Outputs' --region us-east-1 --profile audio-lab-admin --output table
```

Note **`SignupEndpoint`** (the Function URL) — wired into the site in step 4 — and the six
**`DkimTokenName*` / `DkimTokenValue*`** values, used in step 5.

### Verify the endpoint actually answers

`CREATE_COMPLETE` does **not** mean the endpoint works. A Function URL with `AuthType:
NONE` still needs a resource-based policy, and CloudFormation does not write one for you
(the console and AWS SAM do). Without it every request gets **403 Forbidden** while the
stack reports success. Since October 2025 that policy needs **two** statements —
`lambda:InvokeFunctionUrl` *and* `lambda:InvokeFunction`. Both are in `infra/signup.yaml`;
these checks prove they landed.

```fish
aws lambda get-policy --function-name toldstraight-signup \
    --region us-east-1 --profile audio-lab-admin --query Policy --output text | python3 -m json.tool
```

Expect two `Allow` statements with `Principal: "*"` — one for `lambda:InvokeFunctionUrl`
(condition `lambda:FunctionUrlAuthType = NONE`), one for `lambda:InvokeFunction` (condition
`lambda:InvokedViaFunctionUrl = true`).

Then POST a **deliberately malformed** address. This exercises the whole path and writes
nothing:

```fish
curl -s -o /dev/stdout -w '\nHTTP %{http_code}\n' -X POST <SignupEndpoint> \
    -H 'content-type: application/json' -d '{"email":"not-an-email"}'
```

- `HTTP 400` with `{"ok": false, "error": "invalid email"}` — **correct.** Lambda's front
  door let you in and the handler ran. No contact was stored.
- `HTTP 403` — the resource policy is missing or incomplete. Do not wire the site up yet.

Do **not** smoke-test with a real address: it lands in the contact list you are about to
hand to #144. Use a malformed one, or an address you are willing to delete.

## 4. Wire the endpoint into the site form (collection is now live)

Put the `SignupEndpoint` URL into the Coming Soon page's form config (the `SIGNUP_ENDPOINT`
constant in the page's script — that page ships in #128). Submit a test address, then
confirm it landed:

```fish
aws sesv2 get-contact --contact-list-name toldstraight-audience \
    --email-address you+test@example.com --region us-east-1 --profile audio-lab-admin
```

At this point the page can **go live for signups** — nothing is sent yet, so no SES
verification or sandbox exit is needed to collect addresses.

---

## 5. Verify SES sending (DKIM) — #144

**The three CNAMEs are already in `infra/dns.yaml`** as `SesDkimRecord1..3` — read from the
stack outputs on 2026-07-31 and verified against live SES. You only need to deploy them.

This edits the **DNS stack**, which also carries SPF, the Apple DKIM delegation, DMARC
`p=reject` and CAA. Deploy it by **change-set you read before executing** — never `deploy`
straight through.

```fish
cd ~/Code/audio-lab; and git checkout main; and git pull

aws cloudformation create-change-set \
    --stack-name toldstraight-dns \
    --change-set-name ses-dkim \
    --template-body file://infra/dns.yaml \
    --parameters \
        ParameterKey=HostedZoneId,UsePreviousValue=true \
        ParameterKey=DomainName,UsePreviousValue=true \
        ParameterKey=DeploySiteRecords,UsePreviousValue=true \
        ParameterKey=SiteDistributionDomain,UsePreviousValue=true \
        ParameterKey=DeployVoteRecord,UsePreviousValue=true \
        ParameterKey=VoteTarget,UsePreviousValue=true \
    --region us-east-1 --profile audio-lab-admin
```

Read it before executing:

```fish
aws cloudformation describe-change-set \
    --stack-name toldstraight-dns --change-set-name ses-dkim \
    --region us-east-1 --profile audio-lab-admin \
    --query 'Changes[].ResourceChange.{Action:Action,Resource:LogicalResourceId,Replace:Replacement}' \
    --output table
```

**Expect exactly three rows, all `Add`:** `SesDkimRecord1`, `SesDkimRecord2`, `SesDkimRecord3`.
**Stop** if anything else appears — in particular any `Modify` or `Remove` against `SpfRecord`,
`NullMxRecord`, `DkimRecord`, `DmarcRecord`, `CaaRecord`, `ApexSiteRecord` or `WwwSiteRecord`.
All of those are byte-identical in the template and must not be in the change-set at all.

```fish
aws cloudformation execute-change-set \
    --stack-name toldstraight-dns --change-set-name ses-dkim \
    --region us-east-1 --profile audio-lab-admin
aws cloudformation wait stack-update-complete \
    --stack-name toldstraight-dns --region us-east-1 --profile audio-lab-admin
```

Then confirm SES sees them. It polls, so this flips from `PENDING` to `SUCCESS` on its own —
usually within minutes on Route 53, though AWS allows up to 72 hours:

```fish
aws sesv2 get-email-identity --email-identity toldstraight.com \
    --query '{Dkim:DkimAttributes.Status,Verified:VerifiedForSendingStatus}' \
    --region us-east-1 --profile audio-lab-admin
```

Expect `SUCCESS` / `true`.

> **Done — 2026-07-31.** The change-set executed cleanly (exactly three `Add` rows, no mail
> record touched), all three CNAMEs resolve from Google DNS, Cloudflare and the authoritative
> nameservers, and SES flipped to `SUCCESS` / `VerifiedForSendingStatus: true` about **four
> hours** after the records went live. Four hours is unremarkable — AWS allows up to 72 — but it
> is much longer than the "usually minutes" case, so do not start debugging early. The
> diagnostic that matters is whether the CNAMEs resolve publicly; if they do, the remaining
> variable is entirely SES's polling.

**This does not disturb inbound mail** (still iCloud+) **or Apple's `sig1` DKIM selector.** A
domain may publish any number of DKIM selectors; receivers match on the selector named in each
message's signature. Apple's signs mail from your iCloud+ mailbox, SES's signs mail from the
sending identity. They are different record names and coexist by design.

**Why no custom MAIL FROM.** The usual SES advice is to add one so SPF aligns — it does not
apply here. This domain's DMARC is `adkim=s` **and** `aspf=s`, strict on both. A custom MAIL
FROM is always a *subdomain* (`bounce.toldstraight.com`), which under `aspf=s` does not align;
AWS's own guidance is that it requires `aspf=r`. Since DMARC passes if **either** mechanism
aligns, and EasyDKIM on a verified *domain* identity signs with `d=toldstraight.com` exactly —
satisfying strict DKIM alignment — DKIM carries DMARC on its own. Adopting a custom MAIL FROM
would buy nothing without first weakening the posture recorded in #59.

## 6. Request SES production access (leave the sandbox) — #144

> **Unblocked as of 2026-07-31.** The console gates this request behind domain verification —
> the **Request production access** card stays greyed with "Domain verification needed" until
> DKIM reports `SUCCESS`. It now does, so the request can be filed. It is **not** independent of
> step 5, which is the opposite of what you might assume from the CLI, where nothing indicates
> the dependency.

**Console path:** SES → make sure the region picker reads **US East (N. Virginia)**, or you get
a "Get set up" splash with no identities → left sidebar → **Account dashboard** → **Request
production access** (top right).

Approval typically takes ~24h, so start it early. Until then SES sends only to *verified*
addresses and is capped at 200/day — which means real signups on the list cannot receive the
launch email.

### Draft answers

The free-text answers affect approval time, so they are worth writing once and reusing.

**Mail type:** Transactional — closest fit for a release notification someone explicitly asked
for. "Marketing" invites more scrutiny.

**Website URL:** `https://toldstraight.com`

**Use case description:**

> Told Straight is an independent podcast launching 6 August 2026. Visitors opt in on our Coming
> Soon page to be notified when the show launches. We send one launch announcement and occasional
> new-episode updates — no advertising, no purchased or rented lists, and the list is never shared.
>
> Addresses are collected only via a form on our own site and stored in an SES v2 contact list we
> own in this account. Every send uses the list's subscription management so unsubscribe is one
> click, and unsubscribe requests are also honored at <hello@toldstraight.com>. Our privacy policy
> at <https://toldstraight.com/privacy.html> describes exactly this collection.
>
> The domain is authenticated with EasyDKIM and publishes DMARC p=reject with strict alignment.
> Expected volume is low — dozens to low hundreds of recipients.

**How do you handle bounces and complaints:**

> Volume is low enough to monitor directly at first via the SES account dashboard's bounce and
> complaint rates. Hard bounces are removed from the contact list, and complaints are treated as
> an unsubscribe and suppressed permanently. If volume grows we will wire SNS notifications to
> automate both.

This last answer is the one that most often triggers a follow-up rather than an approval.
Reviewers are checking that you understand list hygiene, not that you have automated it — a
specific, honest answer about low volume and manual handling reads better than claiming
automation that does not exist. A live privacy policy at a real URL helps too; it is checkable,
and most sandbox requests have nothing to point at.

In the console: **SES → Account dashboard → Request production access**. State the use
(release notifications + occasional show updates to an opted-in list, with unsubscribe).
Approval is typically ~24h. Until then SES can only send to verified addresses and is
capped, so start this early.

## 7. First send — #144

Once out of the sandbox, the send tooling (a small SESv2 `send-email` call to the contact
list, with the list's unsubscribe header) is built and run under #144. A test send should
show `dkim=pass · spf=pass · dmarc=pass` from `hello@toldstraight.com`.

---

## Teardown / rollback

```fish
aws cloudformation delete-stack --stack-name toldstraight-signup \
    --region us-east-1 --profile audio-lab-admin
```

This removes the function, its URL, the role, and the log group. **It also deletes the SES
contact list and every address in it** — export the list first if you need to keep it.

Note that deleting a Function URL with auth type `NONE` does not automatically remove the
resource-based policy; because ours is declared as `AWS::Lambda::Permission` resources in
the stack, CloudFormation removes them with the function.
