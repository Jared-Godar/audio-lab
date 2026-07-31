# Signup — deploy & go-live walkthrough

The manual steps behind `infra/signup.yaml` (#140) and the sending work (#144). The repo
authors the template; **you deploy** (billable AWS) and do the console-only steps here.
Collection works after step 3; sending needs steps 4–6.

Commands are Fish. Everything runs against the `default` profile / the account holding the
Route 53 zone, unless you have decided on a separate account (#114).

## What each part gives you

- **Steps 1–3 — collection (unblocks the Coming Soon page go-live).** Signups land in the
  SES contact list. No email is sent.
- **Steps 4–6 — sending (#144, needed only when you mail people).** DKIM verification and
  sandbox exit; a test send.

---

## 1. Deploy the signup stack (change-set)

```fish
set STACK toldstraight-signup
aws cloudformation deploy \
    --stack-name $STACK \
    --template-file infra/signup.yaml \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides AllowedOrigin=https://toldstraight.com \
    --profile default
```

`CAPABILITY_IAM` is required (the stack creates the function's execution role). To review
before applying, use `aws cloudformation create-change-set … --change-set-name …` then
inspect it in the console (CloudFormation → Stacks → change set), the same flow as the DNS
stack in `infra/README.md`.

## 2. Read the outputs

```fish
aws cloudformation describe-stacks --stack-name toldstraight-signup \
    --query 'Stacks[0].Outputs' --profile default --output table
```

Note **`SignupEndpoint`** (the Function URL) — you wire it into the site in step 3 — and the
six **`DkimTokenName*` / `DkimTokenValue*`** values, used in step 4.

## 3. Wire the endpoint into the site form (collection is now live)

Put the `SignupEndpoint` URL into the Coming Soon page's form config (the `SIGNUP_ENDPOINT`
constant in the page's script). Submit a test address, then confirm it landed:

```fish
aws sesv2 get-contact --contact-list-name toldstraight-audience \
    --email-address you+test@example.com --profile default
```

At this point the page can **go live for signups** — nothing is sent yet, so no SES
verification or sandbox exit is needed to collect addresses.

---

## 4. Verify SES sending (DKIM) — #144

EasyDKIM tokens are generated at stack-create, so they are known only now. For each of the
three pairs from step 2, add a **CNAME** RecordSet to `infra/dns.yaml` (name =
`DkimTokenNameN`, value = `DkimTokenValueN`), then redeploy the DNS stack via change-set
(same flow as `infra/README.md`). Then confirm SES shows the identity verified:

```fish
aws sesv2 get-email-identity --email-identity toldstraight.com \
    --query 'DkimAttributes.Status' --profile default
```

Expect `SUCCESS`. Adding SES DKIM does not disturb inbound mail (still iCloud+) or the
existing Apple DKIM selector — they are different record names.

## 5. Request SES production access (leave the sandbox) — #144

In the console: **SES → Account dashboard → Request production access**. State the use
(release notifications + occasional show updates to an opted-in list, with unsubscribe).
Approval is typically ~24h. Until then SES can only send to verified addresses and is
capped, so start this early.

## 6. First send — #144

Once out of the sandbox, the send tooling (a small SESv2 `send-email` call to the contact
list, with the list's unsubscribe header) is built and run under #144. A test send should
show `dkim=pass · spf=pass · dmarc=pass` from `hello@toldstraight.com`.

---

## Teardown / rollback

`aws cloudformation delete-stack --stack-name toldstraight-signup --profile default`
removes the function, its URL, the role, and the log group. **It also deletes the SES
contact list and every address in it** — export the list first if you need to keep it.
