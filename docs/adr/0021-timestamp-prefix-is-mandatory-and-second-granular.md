# ADR 0021 — Generated documents, scripts and walkthroughs carry a mandatory `YYYYMMDDHHmmss` prefix

- **Number:** 0021
- **Title:** Generated documents, scripts and walkthroughs carry a mandatory
  `YYYYMMDDHHmmss` prefix
- **Status:** `accepted`
- **Date:** 2026-08-01
- **Source:** maintainer instruction during the #180 (D3) session; answers D1's open item 7,
  which D2 did not carry forward. Boundary and sequencing settled in the same exchange.

## Context

The repo carried **two incompatible timestamp conventions and one directory that used
neither**, measured on `main@0a8e88c` (`docs/adr/` excluded — ADRs use deliberate `NNNN-`
numbering):

```console
$ # date-prefix conformance, per directory
artifacts/specs/    40/40 dated   (100%)
tools/              14/14 dated   (100%)
docs/                5/22 dated   ( 23%)

$ # a second, incompatible format in the gitignored zone
artifacts/walkthroughs/   30 of 31 files use YYYYMMDDTHHMMSSZ-
```

**All 17 undated files sit in `docs/`.** D1 reported this as an aggregate — *"51 dated, 35
undated — about 59%"* — which read as general decay and hid the real pattern: two
directories adopted the convention completely and one never adopted it.

D1 raised the choice of format as its open item 7. **D2 carried neither the question nor a
resolution** — its mapping preserves every filename as-is and its ten gate questions do not
mention naming. The item was dropped between stages rather than decided, and D3 restored it
as Q12. The maintainer then decided it directly, before the gate.

Day-granularity had also already collided in practice: D1, D2 and the D3 report were all
authored on 2026-08-01 and would have shared the prefix `20260801-`, sorting arbitrarily
against one another.

## Decision

The maintainer's instruction, verbatim:

> INCLUDE timestampy YYYYMMDDHHmmss as a prefix to every script, walkthrough, and
> maintainer requested document - I am in favor of applying it universally, but open to
> counterarguments against, should you have any

Counterarguments were offered and **none defeated the policy**. Two boundary questions were
put to the maintainer and answered:

**Format.** `YYYYMMDDHHmmss` — fourteen digits, no separator, no `T`, no `Z`, followed by a
hyphen. It replaces both incumbents. It is preferred over the existing
`YYYYMMDDTHHMMSSZ-` because a bare digit run sorts identically, is two characters shorter,
leaves no ambiguity about whether `T`/`Z` belong to the token, and does not assert UTC —
which `Z` does, falsely, for a local-time stamp.

**Scope — exempt load-bearing names.** The prefix applies to every generated document,
script and walkthrough **except** filenames that are read by exact name, where a rename
breaks behaviour rather than taste:

| Exempt | Why |
| --- | --- |
| `README.md`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md` | GitHub renders these by exact filename |
| `AGENTS.md`, `CLAUDE.md` | agent tooling loads them by name |
| `.github/**` | GitHub requires exact paths for workflows, templates and configuration |
| `docs/adr/NNNN-*.md` | deliberate sequential numbering, already a convention |
| `pipeline/**` Python sources | imports resolve by module name; a digit-leading filename is not a legal Python identifier |

**Sequencing — the historical renames ride D7.** The rule is go-forward from
2026-08-01. The ~84 already-dated files keep their current prefixes until the reorg's
mechanical move stage (#184, D7), which is already rewriting every path and fixing every
inbound reference — docs cross-links, CHANGELOG citations, `AGENTS.md`, and the
machine-local memory files. Renaming them now would touch all of those twice.

The first file to carry the new prefix is the D3 report itself,
`docs/20260801225106-repo-file-structure-d3-assessment-report.md`.

## Consequences

**Constrains M10 (Repo structure & provenance).** D7 (#184) gains scope it did not have
when it was written: in addition to relocating files, it renames the ~84 already-dated
files to `YYYYMMDDHHmmss-` and retires the `YYYYMMDDTHHMMSSZ-` format used in
`artifacts/walkthroughs/`. That addition is recorded here rather than discovered at
execution time.

**Constrains every session from 2026-08-01.** Any new report, spec, builder, walkthrough or
maintainer-requested document is created with the prefix. `CLAUDE.md` § Artifact naming
carries the operative rule; this ADR carries the reasoning.

**Resolves D3's Q12.** It is recorded in the D3 report as decided, not open, so the D4 gate
(#181) sees eleven open questions rather than twelve.

**Does not change** the rendered-audio naming shape
(`YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE[-BITRATE].mp3`) beyond its date component, nor the
`DATE-VENDOR-ENGINE-SUBJECT-PURPOSE` ordering that conduct rule 5 requires. Only the `DATE`
token's format and its mandatory status change.

## Reversal condition

Reverse if filename length becomes a practical obstacle — the prefix adds six characters
over `YYYYMMDD-`, and combined with the mandatory
`VENDOR-ENGINE-SUBJECT-PURPOSE` components a path may approach tooling limits. Concretely:
if any path exceeds 255 bytes, or if the maintainer finds himself truncating names to fit a
terminal or dialog, fall back to `YYYYMMDD-` with a `-2` disambiguator for same-day
collisions.

Reverse the **mandatory** aspect (not the format) if the exemption list needs a third
extension — that would indicate the rule's boundary is being decided case by case, which is
how the previous convention decayed to 23% in `docs/`.
