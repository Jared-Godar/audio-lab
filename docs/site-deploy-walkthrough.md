# Site — deploy & go-live walkthrough

> **Revision history** — newest first. This doc is **rewritten in place** as blockers
> surface during real deploys, so the top entry tells you at a glance how current it is.
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

**2. Fonts come from Adobe Typekit and will silently fall back.** The page loads
`https://use.typekit.net/zol6gng.css`. Adobe kits enforce a **domain allowlist** — if
`toldstraight.com` (and the CloudFront domain, if you test there) is not on that kit, every
face silently falls back to Helvetica/Arial. Nothing errors, nothing appears in the console;
the page just stops looking like Told Straight.

Do this in the browser before go-live: **Adobe Fonts → My Kits → kit `zol6gng` → Settings →
Domains** → add `toldstraight.com`, `www.toldstraight.com`, and the CloudFront domain if you
plan to check there. Then publish the kit.

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
- [ ] Typography is Trade Gothic, **not** Helvetica — if it is Helvetica, the Typekit domain
      allowlist is the cause, not the deploy
- [ ] HTTPS with no certificate warning
- [ ] The signup form is expected to fail here until DNS cutover (see the top of this doc)

## 6. DNS cutover — a SEPARATE PR

Not done here, on purpose. Pointing the apex at CloudFront means editing `infra/dns.yaml`,
which also carries SPF, the Apple DKIM delegation, DMARC `p=reject`, and CAA. Those records
keep your mail working and deserve their own change-set review, not a footnote to a website
change.

That PR will:

1. Replace `ApexSiteRecord` (currently `Type: A` with a literal `ResourceRecords` IP) with an
   `AliasTarget` block — apex CNAMEs are invalid DNS, so an alias A record is the only way to
   point a bare domain at CloudFront, which has no stable IP.
2. Use `AliasTarget.HostedZoneId: Z2FDTNDATAQYW2` — CloudFront's fixed constant, **not** this
   account's zone id. The stack outputs it as `AliasHostedZoneId` so it is not retyped from
   memory.
3. Add a `www` alias record.
4. Deploy with `DeploySiteRecords=true` via a reviewed change-set.

After that, re-test the signup form on the real origin.

---

## Teardown

```fish
aws s3 rm "s3://$BUCKET/" --recursive --profile audio-lab-admin
aws cloudformation delete-stack --stack-name toldstraight-site --region us-east-1 --profile audio-lab-admin
```

The bucket is versioned, so a non-empty bucket (including delete markers) will block stack
deletion — empty it first, and if deletion still fails, remove the noncurrent versions too.
Deleting the distribution takes several minutes as CloudFront disables it first.
