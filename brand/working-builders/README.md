# brand/working-builders/

**The one place to look for a builder you are being asked to run.**

**Empty right now, and that is the correct state** — there is no draft under review. It is
provisioned so the next draft has a home in the repository instead of a session directory
outside it. The 14 already-approved builders are not here; they moved beside their assets
on 2026-08-02 (see [`../README.md`](../README.md)).

A builder is an Adobe Illustrator or InDesign script the agent writes and the *maintainer*
runs, because the licensed typefaces live only on his machine. Until 2026-08-02 those
drafts had no home in the repository at all — they were handed over from a session
directory outside it, which meant the script under review was somewhere the maintainer
could not browse to and could not find again later.

## The lifecycle

```text
1. DRAFT        brand/working-builders/<name>.jsx
                Every iteration lands here. Broken ones too. This folder is
                deliberately allowed to be messy — it is a workbench, not an archive.

2. REVIEW       The maintainer runs it in Illustrator. Output goes to the gitignored
                output/ zone, never straight into a tracked folder.

3. APPROVED     He approves the rendered asset. The asset is promoted to its tracked
                folder, and the builder that produced it MOVES OUT of this folder to sit
                beside that asset:

                    episodes/ep01/art/cover.png
                    episodes/ep01/art/builders/…-ep01-covers-builder.jsx

                One approved builder, adjacent to the thing it made, permanently.
```

Maintainer's framing, 2026-08-02:

> "One working-builder folder under brands where you start putting all of the fucked up
> draft scripts we iterate through until you get it right. Once I approve and the artifact
> is generated, the script that made it gets placed alongside the asset it made in a
> subfolder."

## Where an approved builder goes — four rules, no judgement calls

1. **Produces assets in one folder** → a `builders/` subfolder of that folder.
2. **Produces assets across several folders** → `builders/` at the nearest shared parent.
   The Ep02+Ep03 cover rebuild goes to `episodes/builders/`, not into one arbitrary
   episode.
3. **Produces show-wide assets** → `podcast/builders/`. The cast personnel cards build from
   the shared portraits and appear in several episodes.
4. **Produces no asset at all** — it measures, audits or checks something → `tooling/`,
   not here. `…-approved-card-measurement.py` measures finished artwork; it is a tool, not
   a builder.

**The chicken-and-egg problem is not real.** Every builder in this repository already
names its own output directory in its header, so the destination is knowable from the
script before the asset exists. The `builders/` folder is created at the moment of
promotion, alongside the asset — never before.

## Why `builders/` and not `scripts/`

[#176](https://github.com/Jared-Godar/audio-lab/issues/176) names `scripts` explicitly as
a directory name that must not appear at more than one level with an overlapping purpose.
`tooling/` holds repository automation; `builders/` holds asset production. Two names, two
meanings, no collision. The maintainer's sketch used "scripts to build them" — this is that
idea under a name that does not clash.
