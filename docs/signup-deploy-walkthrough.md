# Signup — deploy & go-live walkthrough

> **Revision history** — newest first. This doc is **rewritten in place** as blockers surface
> during real deploy attempts, so the top entry tells you at a glance how current it is. If
> the newest entry predates your last failed attempt, it has not caught up yet.
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

EasyDKIM tokens are generated at stack-create, so they are known only now. For each of the
three pairs from step 3, add a **CNAME** RecordSet to `infra/dns.yaml` (name =
`DkimTokenNameN`, value = `DkimTokenValueN`), then redeploy the DNS stack via change-set
(same flow as `infra/README.md`). Then confirm SES shows the identity verified:

```fish
aws sesv2 get-email-identity --email-identity toldstraight.com \
    --query 'DkimAttributes.Status' --region us-east-1 --profile audio-lab-admin
```

Expect `SUCCESS`. Adding SES DKIM does not disturb inbound mail (still iCloud+) or the
existing Apple DKIM selector — they are different record names.

## 6. Request SES production access (leave the sandbox) — #144

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
