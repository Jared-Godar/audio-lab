# `infra/` — DNS for `toldstraight.com`

CloudFormation that manages **records inside an existing Route 53 hosted zone**.
Authored, linted, and (template-)validated — **not deployed.** Deploying is billable
AWS territory and is the maintainer's call; nothing in this repo runs `create-stack`,
`deploy`, or a change-set.

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
condition (`DeploySiteRecords` defaults to `false`), so the template deploys today with
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

## Finding the `HostedZoneId`

**Console click path** (verified against current AWS docs, July 2026):

> AWS Console → **Route 53** → **Hosted zones** (left navigation) → select the
> **radio button** next to `toldstraight.com` → **View details** → the **Hosted zone
> details** panel shows **Hosted zone ID**.

**CLI** (needs `route53:ListHostedZonesByName`, which a read-only/archive principal may
not have — the `lifeos-archive-user` used in the authoring session did not):

```fish
aws route53 list-hosted-zones-by-name --dns-name toldstraight.com \
  --query 'HostedZones[0].Id' --output text
```

That returns `/hostedzone/ZXXXXXXXXXXXXX`; pass just the `ZXXXXXXXXXXXXX` part.

## Validate without deploying

```fish
uvx cfn-lint infra/dns.yaml                                   # offline structural lint
aws cloudformation validate-template \
  --template-body file://infra/dns.yaml                       # API call; needs creds; NOT a deploy
```

Both were run when this template was authored (2026-07-26): `cfn-lint` exit 0, and
`validate-template` returned the parsed parameter/description set (exit 0). Note that
`validate-template` only checks that the template is well-formed — it is **not**
equivalent to a deploy and does not confirm the records are correct for your zone.

## Deploy (maintainer only, when you choose to)

Deploys the **security records only** — `DeploySiteRecords` stays `false`:

```fish
aws cloudformation deploy \
  --template-file infra/dns.yaml \
  --stack-name toldstraight-dns \
  --parameter-overrides HostedZoneId=⟨ZONE_ID⟩ \
  --region us-east-1
```

No `--capabilities` is needed: this template creates no IAM resources.

To switch the site records on later (supply real targets — do not invent them):

```fish
aws cloudformation deploy \
  --template-file infra/dns.yaml \
  --stack-name toldstraight-dns \
  --parameter-overrides HostedZoneId=⟨ZONE_ID⟩ DeploySiteRecords=true \
    ApexTarget=⟨APEX_IPV4⟩ VoteTarget=⟨VOTE_HOSTNAME⟩ \
  --region us-east-1
```

When the apex should point at CloudFront, replace `ApexSiteRecord` with an A-record
`AliasTarget` block rather than an `ApexTarget` IP — apex CNAMEs are invalid DNS and
CloudFront has no stable IP. The template comments flag this at the record.

## Verify after a deploy

```fish
dig +short TXT toldstraight.com          # expect v=spf1 -all
dig +short MX toldstraight.com           # expect 0 .
dig +short TXT _dmarc.toldstraight.com   # expect v=DMARC1; p=reject; ...
dig +short CAA toldstraight.com          # expect 0 issue "amazon.com" + issuewild
```
