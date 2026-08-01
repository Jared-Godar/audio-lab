# Site — deploy & go-live walkthrough

> **Revision history** — newest first. This doc is **rewritten in place** as blockers
> surface during real deploys, so the top entry tells you at a glance how current it is.
>
> **2026-08-01 (later) — §7 corrected after the first real deploy failed (#196).** The trust
> policy trusted the classic OIDC subject; GitHub issues this repository the **immutable** form
> with numeric ids, so `AssumeRole` was denied 12 of 12 times. §7 now takes the two ids as
> parameters, expects a `Modify` rather than an `Add` on the second run, and documents the
> CloudTrail lookup that reads the claim actually presented — the workflow log does **not**
> contain it, which the previous revision wrongly implied.
>
> **2026-08-01 — content deploys move to CI; §3 reversed itself.** #187 replaced the manual
> upload-after-every-merge loop with `.github/workflows/deploy-site.yml`, which publishes on push
> to `main` via OIDC. §3's standing warning ("merging a PR that changes `site/` does not change
> the site") therefore becomes **false once the §7 stack is deployed**, and is rewritten rather
> than left to mislead. New §7 covers deploying `infra/github-oidc.yaml`. The manual §3–§4 steps
> stay as the maintainer's fallback. Rule-6 basis: `docs/adr/0020-post-merge-site-deploy-is-pre-authorised.md`.
>
> **2026-07-31 (later still) — §6 is now a real procedure.** The DNS cutover template work is
> done (`infra/dns.yaml`), so §6 replaced its "here is what the future PR will do" placeholder
> with the actual change-set commands, the two-row expectation to check before executing, and
> the five mail records that must NOT appear in that change-set.
>
> **2026-07-31 (later) — corrected after the first live deploy.** The stack deployed clean
> and the page is verified live at the CloudFront domain. Two changes: the claim that Adobe
> Fonts needs a **domain allowlist was wrong** and is removed (there is no such requirement —
> it was a Typekit-era rule Adobe dropped), and the verification checklist no longer sends you
> to Adobe settings when type looks wrong.
>
> **2026-07-31 — created** (#128) alongside `infra/site.yaml` and the tracked `site/`
> directory. Not yet exercised against a live deploy; the first run will almost certainly
> add to the failure notes below.

The manual steps behind `infra/site.yaml` (#128). The repo authors the template and the
page; **you deploy** (billable AWS). Region is **`us-east-1`** — required, because
CloudFront can only use an ACM certificate issued there.

Commands are Fish. Use **`--profile audio-lab-admin`** until #148 is closed, and **always
pass `--profile`** — this machine's default is `lifeos`, which produces a confusing
`AccessDenied` naming `LifeOSArchive` rather than a credentials error.

## Read this before you start: two things that fail silently

**1. The signup form will not work until DNS is cut over.** The signup endpoint is
CORS-locked to `https://toldstraight.com` (`AllowedOrigin` on the `toldstraight-signup`
stack). A browser on *any* other origin — `localhost`, or the
`d111111abcdef8.cloudfront.net` domain this stack hands you — is refused by the browser
before the request leaves. Verified: from `http://127.0.0.1:8788` the fetch fails with
`TypeError: Failed to fetch`. The page still renders and the form still validates; only the
submit fails, showing "Couldn't reach the server."

If you want to test submission *before* the DNS cutover, redeploy the signup stack pointing
at the CloudFront domain, then put it back afterwards:

```fish
# temporary — note the https:// and NO trailing slash
aws cloudformation deploy --stack-name toldstraight-signup \
    --template-file infra/signup.yaml --capabilities CAPABILITY_IAM \
    --parameter-overrides AllowedOrigin=https://<distribution-domain> \
    --region us-east-1 --profile audio-lab-admin
```

Otherwise, just verify the form after the cutover. Nothing is broken in the meantime.

**2. Fonts load from Adobe Fonts — and need no setup.** The page loads
`https://use.typekit.net/zol6gng.css` (web project `audio-lab`, 49 fonts). **There is no
domain allowlist to configure.** Per Adobe's own documentation: "You don't need to specify a
list of domain names for your web projects. You can add the embed code to any website–no
matter where it is hosted." There is also no cap on how many sites use one project.

The domain allowlist was a **Typekit-era** requirement that Adobe removed; the URL still says
`typekit.net`, which makes the old advice look current. The project page states the same
thing in the UI: "You can embed this project on any website you manage."

So the fonts work on `localhost`, on the CloudFront domain, and on `toldstraight.com` with no
Adobe-side step. Confirmed locally: the page renders in Trade Gothic served from
`use.typekit.net` with no configuration.

If the page *does* render in Helvetica, do not go looking at Adobe settings — check that the
stylesheet request itself succeeded (DevTools → Network → `zol6gng.css`). A blocked request,
a Content Security Policy, or an offline machine are the realistic causes.

See [Domains | Adobe Fonts](https://helpx.adobe.com/fonts/using/domains.html).

---

## 1. Pre-flight

`--template-file` reads your **local checkout**, not GitHub. Pull first:

```fish
cd ~/Code/audio-lab; and git checkout main; and git pull
```

Confirm no stack exists yet:

```fish
aws cloudformation describe-stacks --stack-name toldstraight-site \
    --region us-east-1 --profile audio-lab-admin --query 'Stacks[0].StackStatus' --output text
```

Expect a `does not exist` error. If it exists in `ROLLBACK_FAILED` or `ROLLBACK_COMPLETE`,
delete it first — a stack in either state cannot be updated, and `deploy` refuses before it
starts, producing **no new stack events** (which reads as a stale error):

```fish
aws cloudformation delete-stack --stack-name toldstraight-site --region us-east-1 --profile audio-lab-admin
aws cloudformation wait stack-delete-complete --stack-name toldstraight-site --region us-east-1 --profile audio-lab-admin
```

You will also need the hosted zone id — the bare form, not `/hostedzone/…`:

```fish
aws route53 list-hosted-zones-by-name --dns-name toldstraight.com \
    --profile audio-lab-admin --query 'HostedZones[0].Id' --output text
```

## 2. Deploy the hosting stack

No `CAPABILITY_IAM` — this stack creates no IAM roles (the bucket policy is a resource
policy, which does not require the capability).

```fish
aws cloudformation deploy \
    --stack-name toldstraight-site \
    --template-file infra/site.yaml \
    --parameter-overrides DomainName=toldstraight.com HostedZoneId=Z09608783EP48AD8RCAL5 \
    --region us-east-1 --profile audio-lab-admin
```

**Expect this to take 5–15 minutes** — far longer than the signup stack. CloudFront
distributions are slow to create, and the ACM certificate must validate first.

Certificate validation is automatic *only* because all three of these hold: the domain is in
Route 53, the zone is in this account, and the method is DNS. ACM writes its own validation
CNAME. If any of those stopped being true, the stack would sit in `CREATE_IN_PROGRESS` for
hours waiting on a record nobody added.

## 3. Upload the site content

> **This step is now automatic — read §7 before doing it by hand.** It used to say the opposite:
> *"merging a PR that changes `site/` does not change the site"*, with an instruction to re-run
> the sync manually after every merge. That is what #187 fixed. **Once the stack in §7 is
> deployed, merging a `site/` PR publishes the site**, through
> `.github/workflows/deploy-site.yml` on push to `main`.
>
> **Until §7 is deployed, the old warning still holds and these steps are the live path.** The
> workflow is committed but fails at `AssumeRole` without the role — written, not in force.
>
> §3 and §4 remain here as the maintainer's fallback: use them if the workflow is disabled, if
> the deploy role is removed, or to recover from a partial sync. They are **not** an agent's
> path — an agent syncing from its own shell routes around branch protection, which is exactly
> what ADR 0020 removed.

```fish
set BUCKET (aws cloudformation describe-stacks --stack-name toldstraight-site \
    --region us-east-1 --profile audio-lab-admin \
    --query 'Stacks[0].Outputs[?OutputKey==`SiteBucketName`].OutputValue' --output text)

aws s3 sync site/ "s3://$BUCKET/" --delete --profile audio-lab-admin
```

`--delete` removes anything in the bucket that is no longer in `site/`, so the bucket is an
exact mirror. Content type is inferred from the extension; `.webp` is recognised.

## 4. Invalidate the cache

CloudFront caches aggressively (`Managed-CachingOptimized`). After **every** upload:

```fish
set DIST (aws cloudformation describe-stacks --stack-name toldstraight-site \
    --region us-east-1 --profile audio-lab-admin \
    --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' --output text)

aws cloudfront create-invalidation --distribution-id $DIST --paths '/*' --profile audio-lab-admin
```

The first 1,000 invalidation paths per month are free. `/*` counts as one path.

## 5. Verify

```fish
aws cloudformation describe-stacks --stack-name toldstraight-site \
    --query 'Stacks[0].Outputs' --region us-east-1 --profile audio-lab-admin --output table
```

Open the `DistributionDomainName` value in a browser. Check:

- [ ] Page renders; the DECLASSIFY countdown is running
- [ ] Cast portraits and the hero image all load
- [ ] Images served as `.webp` (DevTools → Network → the `Type` column)
- [ ] Typography is Trade Gothic, **not** Helvetica — if it is Helvetica, check whether the
      `zol6gng.css` request itself failed (no Adobe-side configuration is involved)
- [ ] HTTPS with no certificate warning
- [ ] The signup form is expected to fail here until DNS cutover (see the top of this doc)

## 6. DNS cutover — the last step, and the only mail-critical one

This edits the **DNS stack** (`toldstraight-dns`), not the site stack. That template also
carries SPF, the Apple DKIM delegation, DMARC `p=reject` with strict alignment, and CAA — the
records that keep your mail working. **Deploy it by change-set you read before executing.**
Never `deploy` this stack straight through.

`infra/dns.yaml` is already updated for this (the template work is done). Three things changed:

1. **`ApexSiteRecord` is now an alias A record.** It used to be `Type: A` with a literal
   `ResourceRecords` IP. CloudFront has no stable IP, and apex CNAMEs are invalid DNS
   (RFC 1034), so a Route 53 alias A record is the only construct that satisfies both.
2. **`WwwSiteRecord` is new.** The certificate and the distribution both cover `www`, but no
   record existed for it, so it would simply not have resolved.
3. **`VoteSiteRecord` has its own gate now (`DeployVoteRecord`).** It used to share
   `DeploySiteRecords`, which meant turning the website on *also* tried to create
   `vote.<domain>` — with an empty `VoteTarget`, producing an invalid RecordSet, a
   `CREATE_FAILED`, and a rollback of your mail stack. It stays `false`.

Alias records use `Z2FDTNDATAQYW2`, CloudFront's own fixed hosted-zone id — the same in every
account, and **not** this domain's zone. The site stack emits it as `AliasHostedZoneId` so it
never has to be retyped.

### 6a. Create the change-set (this changes nothing yet)

```fish
cd ~/Code/audio-lab; and git checkout main; and git pull

set DISTDOMAIN (aws cloudformation describe-stacks --stack-name toldstraight-site \
    --region us-east-1 --profile audio-lab-admin \
    --query 'Stacks[0].Outputs[?OutputKey==`DistributionDomainName`].OutputValue' --output text)
echo "distribution: $DISTDOMAIN"

aws cloudformation create-change-set \
    --stack-name toldstraight-dns \
    --change-set-name site-cutover \
    --template-body file://infra/dns.yaml \
    --parameters \
        ParameterKey=HostedZoneId,UsePreviousValue=true \
        ParameterKey=DomainName,UsePreviousValue=true \
        ParameterKey=DeploySiteRecords,ParameterValue=true \
        ParameterKey=SiteDistributionDomain,ParameterValue=$DISTDOMAIN \
        ParameterKey=DeployVoteRecord,ParameterValue=false \
        ParameterKey=VoteTarget,ParameterValue= \
    --region us-east-1 --profile audio-lab-admin
```

### 6b. Read it before executing

```fish
aws cloudformation describe-change-set \
    --stack-name toldstraight-dns --change-set-name site-cutover \
    --region us-east-1 --profile audio-lab-admin \
    --query 'Changes[].ResourceChange.{Action:Action,Resource:LogicalResourceId,Replace:Replacement}' \
    --output table
```

**Expect exactly two rows, both `Add`:** `ApexSiteRecord` and `WwwSiteRecord`.

**Stop and re-read if you see anything else** — in particular any `Modify` or `Remove` against
`SpfRecord`, `DkimRecord`, `DmarcRecord`, `CaaRecord`, or `NullMxRecord`. Those five are
byte-identical in the template and must not appear in the change-set at all.

### 6c. Execute

```fish
aws cloudformation execute-change-set \
    --stack-name toldstraight-dns --change-set-name site-cutover \
    --region us-east-1 --profile audio-lab-admin
aws cloudformation wait stack-update-complete \
    --stack-name toldstraight-dns --region us-east-1 --profile audio-lab-admin
```

### 6d. Verify

Alias records resolve almost immediately — there is no TTL to wait out on the record itself,
though a previously cached NXDOMAIN can linger briefly.

```fish
dig +short toldstraight.com
dig +short www.toldstraight.com
curl -sI https://toldstraight.com/ | head -1
```

Then in a browser at `https://toldstraight.com`:

- [ ] Page loads over HTTPS with no certificate warning
- [ ] **The signup form now works** — submit a real address you control and confirm:

```fish
aws sesv2 get-contact --contact-list-name toldstraight-audience \
    --email-address you@example.com --region us-east-1 --profile audio-lab-admin
```

- [ ] Confirm the mail path still works — send yourself a message at `hello@toldstraight.com`.
      Nothing in this change touches it, but it costs one minute to prove.

## 7. CI deploy identity — the stack that makes §3 and §4 automatic

This is the one-time setup behind #187. After it, merging a `site/` PR publishes the site and
nobody runs §3 or §4 again. `infra/github-oidc.yaml` creates exactly two things: the GitHub
Actions OIDC identity provider for the account, and the `AudioLabGitHubDeploy` role that only
this repository, only on `main`, can assume.

**No GitHub secret is involved and none should be created.** GitHub mints a short-lived OIDC
token per run and AWS trusts it. There is no access key to store, rotate, or leak — that is the
whole point of the pattern.

### 7a. Collect the parameter

The distribution id is a required parameter with no default, deliberately: the alternative is a
`*` resource on `cloudfront:CreateInvalidation`, which would let CI purge every distribution in
the account.

```fish
set DIST (aws cloudformation describe-stacks --stack-name toldstraight-site \
    --region us-east-1 --profile audio-lab-admin \
    --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' --output text)
echo "distribution: $DIST"
```

Confirm no OIDC provider exists yet — there can be only one per URL per account, and a second
declaration fails with `EntityAlreadyExists`:

```fish
aws iam list-open-id-connect-providers --profile audio-lab-admin
```

Expect an empty `OpenIDConnectProviderList` (it was empty on 2026-08-01). If it is **not** empty,
stop: the template must be changed to reference the existing provider instead of creating one.

### 7b. Create the change-set (this changes nothing yet)

`CAPABILITY_NAMED_IAM` is required, not merely `CAPABILITY_IAM`, because the role is created with
an explicit `RoleName`. The workflow references that name literally, which is why it is fixed
rather than generated.

**The stack already exists** (created 2026-08-01), so this is an **UPDATE** change-set — omit
`--change-set-type`, which defaults to `UPDATE`. Pass `--change-set-type CREATE` only if the
stack has been deleted and you are rebuilding it from nothing.

The two numeric ids are GitHub's immutable owner and repository ids. Read them live rather than
copying them — they are the whole subject of #196, and a wrong digit produces exactly the
`AssumeRole` denial this section exists to prevent:

```fish
cd ~/Code/audio-lab; and git checkout main; and git pull

set OWNERID (gh api repos/Jared-Godar/audio-lab --jq '.owner.id')
set REPOID (gh api repos/Jared-Godar/audio-lab --jq '.id')
echo "owner: $OWNERID  repo: $REPOID"

# Control: GitHub reports the same two ids as the prefix it will actually send.
gh api repos/Jared-Godar/audio-lab/actions/oidc/customization/sub --jq '.sub_claim_prefix'
# expect: repo:Jared-Godar@<OWNERID>/audio-lab@<REPOID>

aws cloudformation create-change-set \
    --stack-name toldstraight-github-oidc \
    --change-set-name ci-deploy-identity \
    --template-body file://infra/github-oidc.yaml \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters \
        ParameterKey=GitHubOwner,ParameterValue=Jared-Godar \
        ParameterKey=GitHubRepositoryName,ParameterValue=audio-lab \
        ParameterKey=GitHubOwnerId,ParameterValue=$OWNERID \
        ParameterKey=GitHubRepositoryId,ParameterValue=$REPOID \
        ParameterKey=DeployBranch,ParameterValue=main \
        ParameterKey=SiteDistributionId,ParameterValue=$DIST \
        ParameterKey=SiteStackName,ParameterValue=toldstraight-site \
    --region us-east-1 --profile audio-lab-admin
```

A change-set name can only be used once per stack. If `ci-deploy-identity` already exists from a
previous run, either delete it (`delete-change-set`) or pick a new name.

### 7c. Read it before executing

```fish
aws cloudformation describe-change-set \
    --stack-name toldstraight-github-oidc --change-set-name ci-deploy-identity \
    --region us-east-1 --profile audio-lab-admin \
    --query 'Changes[].ResourceChange.{Action:Action,Resource:LogicalResourceId}' \
    --output table
```

**On a first CREATE, expect exactly two rows, both `Add`:** `GitHubOidcProvider` and
`GitHubDeployRole`.

**On the #196 UPDATE, expect exactly one row: `Modify` on `GitHubDeployRole`.** `Replacement`
should read `False` — the trust policy changes in place and the role ARN is unchanged, which
matters because the workflow carries that ARN literally. **`GitHubOidcProvider` must not appear
at all**; if it does, stop and read why, because replacing the account's OIDC provider would
break the trust relationship rather than fix it.

The single thing worth reading character by character is the trust condition — a wrong or
over-broad `sub` lets any GitHub repository assume this role. Read it from the change-set's
resolved template rather than from the parameters, so what you inspect is the string that will
actually be written:

```fish
aws cloudformation describe-change-set \
    --stack-name toldstraight-github-oidc --change-set-name ci-deploy-identity \
    --region us-east-1 --profile audio-lab-admin \
    --query 'Parameters' --output table
```

Confirm `GitHubOwnerId` and `GitHubRepositoryId` match the values §7a printed, and that
`DeployBranch` is `main`.

### 7d. Execute

```fish
aws cloudformation execute-change-set \
    --stack-name toldstraight-github-oidc --change-set-name ci-deploy-identity \
    --region us-east-1 --profile audio-lab-admin
aws cloudformation wait stack-create-complete \
    --stack-name toldstraight-github-oidc --region us-east-1 --profile audio-lab-admin
```

### 7e. Verify the trust boundary, then the deploy

First read back what the role actually trusts. This is the check that matters; everything else
about this stack is recoverable, an over-broad `sub` is not.

```fish
aws iam get-role --role-name AudioLabGitHubDeploy --profile audio-lab-admin \
    --query 'Role.AssumeRolePolicyDocument.Statement[0].Condition' --output json
```

- [ ] `sub` is a **list of two** fully-qualified subjects — the classic
      `repo:Jared-Godar/audio-lab:ref:refs/heads/main` and the immutable
      `repo:Jared-Godar@16855088/audio-lab@1309379475:ref:refs/heads/main`. Both name the same
      repository and the same ref; **neither contains a `*`** (#196)
- [ ] `aud` reads `sts.amazonaws.com`

**Why two.** GitHub issues this repository an *immutable* subject carrying numeric ids, while
almost all documentation — AWS's included — shows the classic name-based form. Trusting only the
classic form is what made the first deploy after #187 fail 12 of 12 attempts. Trusting both is not
a widening: it names one identity twice, so the deploy works whichever form GitHub sends.

**GitHub's API is not the authority on which form is sent.**
`/actions/oidc/customization/sub` reports `"use_immutable_subject": false` *and* an immutable
`sub_claim_prefix` at the same time. The only reliable read of what was actually presented is
CloudTrail — the claim appears in the event's `userName`:

```fish
aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRoleWithWebIdentity \
    --region us-east-1 --profile audio-lab-admin --max-results 3 \
    --query 'Events[].{When:EventTime,Subject:Username}' --output table
```

Use that first on any future `AssumeRole` denial. It turns a guess into a one-command diagnosis.

Confirm the permissions are the narrow set and nothing more:

```fish
aws iam get-role-policy --role-name AudioLabGitHubDeploy --policy-name SitePublish \
    --profile audio-lab-admin --query 'PolicyDocument.Statement[].{Sid:Sid,Action:Action,Resource:Resource}' \
    --output json
```

- [ ] Four statements: `ListSiteBucket`, `WriteSiteObjects`, `InvalidateSiteCache`,
      `ReadSiteStackOutputs` — and no `"Resource": "*"` anywhere except where it is not present
      at all

Then run the deploy once by hand to prove the whole path end to end. GitHub → **Actions** →
**Deploy site** → **Run workflow** → branch `main` → **Run workflow**. Or:

```fish
gh workflow run deploy-site.yml --ref main
gh run list --workflow=deploy-site.yml --branch main --limit 1
```

- [ ] The run is green. Its summary table names the bucket, the distribution, and how many
      objects were uploaded or deleted
- [ ] Its final step confirms the live page serves the deployed `index.html` — a green sync with
      a failing verify means the bucket took the content but the CDN is not serving it

A failure at the **Assume the deploy role via OIDC** step is nearly always the `sub` claim. The
stack's `TrustedSubjectClassic` and `TrustedSubjectImmutable` outputs print the exact strings the
role expects; compare the CloudTrail `userName` above against both. A claim matching neither is a
new form; a claim matching one while the role trusts only the other is #196 recurring.

**Do not look for the claim in the workflow log — it is not there.** The failing run prints only
`Not authorized to perform sts:AssumeRoleWithWebIdentity`, repeated across its retries, with no
indication of what subject was presented. That is what makes the CloudTrail lookup above the
diagnosis rather than a supplement to it.

### 7f. What changes for you afterwards

- §3 and §4 become fallback procedures. You stop running them.
- Your two manual gates on website work are: **approve the local preview** (an agent runs
  `scripts/preview-site.fish` and hands you two URLs before committing), and **merge the PR**.
- If a deploy fails, it is surfaced to you. An agent must not "fix" it with a manual
  `aws s3 sync` — see ADR 0020.

---

## Teardown

```fish
aws s3 rm "s3://$BUCKET/" --recursive --profile audio-lab-admin
aws cloudformation delete-stack --stack-name toldstraight-site --region us-east-1 --profile audio-lab-admin
```

The bucket is versioned, so a non-empty bucket (including delete markers) will block stack
deletion — empty it first, and if deletion still fails, remove the noncurrent versions too.
Deleting the distribution takes several minutes as CloudFront disables it first.
