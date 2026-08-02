#!/usr/bin/env python3
"""Assert that load-bearing path references still resolve.

WHY THIS EXISTS. A path reference that stops matching does not fail -- it passes. That is
the whole problem. When ``tools/brand/`` moved, the brand-font gate kept exiting 0 while
resolving **0 of 13** builders:

    control  (before the move)   resolve_targets() -> 15 files, 13 .jsx
    after, references unfixed    resolve_targets() ->  2 files,  0 .jsx
    exit code 0, "Brand fonts OK: 4 face references across 2 files"

``.github/workflows/deploy-site.yml`` has the same shape: rename ``site/`` and its
``paths:`` trigger stops matching, so production deploys never run again -- silently.

This converts that class into loud failure. It asserts DECLARED FACTS ONLY: a path exists
or it does not; a pattern matches N files or it does not. It never judges a situation. The
previous closure gate became noise because it evaluated circumstances; this one cannot.

DESIGN: DERIVE, DO NOT DECLARE. The patterns are read out of the real config files at run
time. A hand-maintained list of path references would itself be a set of path references
that can go stale -- the guard would need its own guard. The only declared thing is the
EXPECTED count for each, which is the intent that a config file cannot express.

An unknown pattern is a FAILURE, not a warning. It means somebody changed a reference
without declaring what it should now match, which is exactly the moment this check exists
to catch.

ZERO DEPENDENCIES. PyYAML is not installed and must not be added: a gate whose operation
needs a network install is a gate that gets skipped. Standard library only.

Usage:  python3 scripts/check_path_references.py [--list]
"""

from __future__ import annotations

import argparse
import fnmatch
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# --------------------------------------------------------------------------------------
# Declared intent. Keys are stable identifiers; values are the MINIMUM number of tracked
# files the reference must resolve to. Measured on main@c0828bf -- see #211, which records
# the command behind every one of these numbers.
#
# A minimum of 0 is legitimate and must carry a reason: three markdownlint ignores guard
# directories that are never tracked, and asserting >=1 on those would make the check fail
# on its first run. A gate that cries wolf immediately gets ignored, which is how the last
# one became noise.
# --------------------------------------------------------------------------------------
EXPECTED: dict[str, tuple[int, str]] = {
    # brand-font gate -- the reference class that already failed this way once
    "fonts:glob:jsx": (
        13,
        "approved builders in builders/ folders beside their assets",
    ),
    "fonts:glob:md": (36, "brand documents scanned for face names"),
    "fonts:const:check_brand_fonts.py:MANIFEST_PATH": (
        1,
        "the manifest the gate reads",
    ),
    "fonts:const:generate_fonts_manifest.py:MANIFEST_PATH": (
        1,
        "the manifest it writes",
    ),
    # pre-commit hook selection -- a files: pattern matching nothing PASSES
    r"precommit:files:^(.*/(builders|working-builders)/.*\.jsx|brand/.*\.md)$": (
        49,
        "files the brand-font hook selects",
    ),
    "precommit:exclude:block:0": (
        10,
        "large-file exclusions: contact sheet, 4 episode masters, 5 portraits",
    ),
    "precommit:exclude:^prompts/": (
        27,
        "seed briefs held exempt from the style checker",
    ),
    # workflow triggers -- a paths: filter matching nothing means the job never runs
    "workflow:deploy-site.yml:paths:site/**": (27, "the site the deploy publishes"),
    "workflow:deploy-site.yml:paths:.github/workflows/deploy-site.yml": (
        1,
        "self-reference, so a fix to the deploy path is proven by running it",
    ),
    "workflow:label-drift-gate.yml:paths:.github/labels.json": (
        1,
        "the label source of truth",
    ),
    # style-checker ignores
    "markdownlint:ignores:prompts/**": (27, "seed briefs, preserved as written"),
    "markdownlint:ignores:artifacts/**": (42, "specs immutable after handoff"),
    "markdownlint:ignores:episodes/**": (88, "generated show deliverables"),
    "markdownlint:ignores:**/node_modules/**": (0, "never tracked -- expected zero"),
    "markdownlint:ignores:.venv/**": (0, "never tracked -- expected zero"),
    "markdownlint:ignores:**/.venv/**": (0, "never tracked -- expected zero"),
    # shell path filters -- these report OK when they match nothing
    "shell:closure-pass.fish:artifacts/specs": (
        1,
        "tracked-exception path the stray check scans",
    ),
    "shell:closure-pass.fish:artifacts/issues": (
        1,
        "tracked-exception path the stray check scans",
    ),
    "shell:closure-pass.fish:site/": (1, "the deploy-confirmation filter"),
    "shell:check:project:pipeline": (1, "locked environment checked by scripts/check"),
    "shell:check:project:spotify": (1, "locked environment checked by scripts/check"),
    # code constants -- assembled from segments, so invisible to a text search for the path
    "code:pipeline/core/cast.py:CAST_PATH": (1, "the cast pin the loader reads"),
    "code:pipeline/core/episode.py:TRANSCRIPT_MD": (
        1,
        "the render's source of dialogue",
    ),
}

COVERAGE_FLOOR = 18


def tracked_files() -> list[str]:
    out = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "ls-files"],
        capture_output=True,
        text=True,
        check=True,
    )
    return out.stdout.split()


def find_file(name: str) -> Path | None:
    """Locate a script by basename, so this check survives scripts/ -> tooling/."""
    matches = [p for p in REPO_ROOT.rglob(name) if ".git" not in p.parts]
    return matches[0] if matches else None


def block_scalars(lines: list[str], key: str) -> list[str]:
    """Capture YAML block scalars by INDENTATION.

    A naive ``(?:\\s{2,}.*\\n)+`` over-captures: it swallows every later indented line in
    the file, so the compiled pattern contains the rest of the config and matches nothing.
    That produced a false zero for the large-file exclusion during scoping -- the check
    would have asserted that a live exclusion matches nothing, the opposite of the truth.
    A block scalar ends at the first line indented LESS than its body.
    """
    found: list[str] = []
    for i, line in enumerate(lines):
        if not re.match(rf"^\s*{re.escape(key)}:\s*\|\s*$", line):
            continue
        body: list[str] = []
        base: int | None = None
        for nxt in lines[i + 1 :]:
            if not nxt.strip():
                body.append(nxt)
                continue
            indent = len(nxt) - len(nxt.lstrip())
            if base is None:
                base = indent
            if indent < base:
                break
            body.append(nxt)
        found.append("\n".join(body))
    return found


def path_segments(source: str, const: str) -> list[str]:
    """Pull the quoted segments out of ``NAME = ROOT / "a" / "b"``.

    Read from source rather than imported: importing pipeline modules would need the
    package resolvable and its virtual environment present, and this check must run in a
    bare CI job. These constants are assembled from segments, so the literal path never
    appears in the file and a text search for it finds nothing.
    """
    m = re.search(
        rf"^{re.escape(const)}\s*=\s*(.+?)(?=\n\S|\n\n|\Z)", source, re.M | re.S
    )
    return re.findall(r'"([^"]+)"', m.group(1)) if m else []


def collect() -> list[tuple[str, int, str]]:
    """Return (key, actual_count, detail) for every reference derived from the repo."""
    tracked = tracked_files()
    results: list[tuple[str, int, str]] = []

    def count_glob(glob: str) -> int:
        return sum(
            1
            for t in tracked
            if fnmatch.fnmatch(t, glob) or t.startswith(glob.rstrip("*"))
        )

    def count_regex(pattern: str, verbose: bool = False) -> int:
        flags = re.X if verbose else 0
        try:
            rx = re.compile(pattern, flags)
        except re.error as exc:
            raise SystemExit(
                f"path guard: cannot compile pattern from repo config: {exc}"
            )
        return sum(1 for t in tracked if rx.search(t))

    # -- brand-font gate globs and manifest constants ----------------------------------
    gate = find_file("check_brand_fonts.py")
    if gate:
        src = gate.read_text()
        globs = re.search(r"^DEFAULT_GLOBS\s*=\s*\((.+?)\)", src, re.M | re.S)
        jsx = md = 0
        for g in re.findall(r'"([^"]+)"', globs.group(1) if globs else ""):
            hits = [str(p.relative_to(REPO_ROOT)) for p in REPO_ROOT.glob(g)]
            jsx += sum(1 for h in hits if h.endswith(".jsx"))
            md += sum(1 for h in hits if h.endswith(".md"))
        results.append(("fonts:glob:jsx", jsx, "from DEFAULT_GLOBS"))
        results.append(("fonts:glob:md", md, "from DEFAULT_GLOBS"))

    for name in ("check_brand_fonts.py", "generate_fonts_manifest.py"):
        f = find_file(name)
        if not f:
            continue
        segs = path_segments(f.read_text(), "MANIFEST_PATH")
        target = REPO_ROOT.joinpath(*segs) if segs else None
        results.append(
            (
                f"fonts:const:{name}:MANIFEST_PATH",
                1 if target and target.exists() else 0,
                "/".join(segs) or "constant not found",
            )
        )

    # -- pre-commit files: and exclude: ------------------------------------------------
    pc = REPO_ROOT / ".pre-commit-config.yaml"
    if pc.exists():
        text = pc.read_text()
        lines = text.split("\n")
        for m in re.finditer(r"^\s*files:\s*(\S.*)$", text, re.M):
            pat = m.group(1).strip()
            results.append(
                (f"precommit:files:{pat}", count_regex(pat), "hook file selector")
            )
        for idx, blk in enumerate(block_scalars(lines, "exclude")):
            results.append(
                (
                    f"precommit:exclude:block:{idx}",
                    count_regex(blk, verbose=True),
                    "block scalar",
                )
            )
        for m in re.finditer(r"^\s*exclude:\s*(\S.*)$", text, re.M):
            pat = m.group(1).strip()
            if pat == "|":
                continue
            results.append(
                (f"precommit:exclude:{pat}", count_regex(pat), "inline exclude")
            )

    # -- workflow paths: triggers ------------------------------------------------------
    for wf in sorted((REPO_ROOT / ".github" / "workflows").glob("*.yml")):
        m = re.search(r"^\s*paths:\s*$((?:\n\s*(?:#.*|-\s*.+))+)", wf.read_text(), re.M)
        if not m:
            continue
        for entry in re.findall(r'^\s*-\s*"?([^"#\n]+?)"?\s*$', m.group(1), re.M):
            results.append(
                (
                    f"workflow:{wf.name}:paths:{entry}",
                    count_glob(entry),
                    "push trigger filter",
                )
            )

    # -- markdownlint ignores ----------------------------------------------------------
    ml = REPO_ROOT / ".markdownlint-cli2.yaml"
    if ml.exists():
        body = ml.read_text().split("ignores:")
        if len(body) > 1:
            for g in re.findall(r'^\s*-\s+"([^"]+)"', body[1], re.M):
                results.append(
                    (
                        f"markdownlint:ignores:{g}",
                        sum(1 for t in tracked if fnmatch.fnmatch(t, g)),
                        "style-checker ignore",
                    )
                )

    # -- shell path filters ------------------------------------------------------------
    cp = find_file("closure-pass.fish")
    if cp:
        src = cp.read_text()
        for frag in re.findall(
            r"--\s+((?:[a-z][\w./-]+\s*)+?)(?=\d?>|\)|$)", src, re.M
        ):
            for token in frag.split():
                if "/" not in token:
                    continue
                target = REPO_ROOT / token
                results.append(
                    (
                        f"shell:closure-pass.fish:{token}",
                        1 if target.exists() else 0,
                        "git path filter",
                    )
                )
    chk = find_file("check")
    if chk and chk.is_file():
        for m in re.finditer(r"for project in (.+?);", chk.read_text()):
            for proj in m.group(1).split():
                results.append(
                    (
                        f"shell:check:project:{proj}",
                        1 if (REPO_ROOT / proj / "pyproject.toml").exists() else 0,
                        "locked-environment subproject",
                    )
                )

    # -- code path constants -----------------------------------------------------------
    for rel, const in (
        ("pipeline/core/cast.py", "CAST_PATH"),
        ("pipeline/core/episode.py", "TRANSCRIPT_MD"),
    ):
        f = REPO_ROOT / rel
        if not f.exists():
            continue
        segs = path_segments(f.read_text(), const)
        target = REPO_ROOT.joinpath(*segs) if segs else None
        results.append(
            (
                f"code:{rel}:{const}",
                1 if target and target.exists() else 0,
                "/".join(segs) or "constant not found",
            )
        )

    # Deduplicate while preserving order -- a pattern can legitimately appear twice.
    seen: set[str] = set()
    unique: list[tuple[str, int, str]] = []
    for key, actual, detail in results:
        if key in seen:
            continue
        seen.add(key)
        unique.append((key, actual, detail))
    return unique


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--list", action="store_true", help="print every reference and its count"
    )
    parser.add_argument(
        "paths", nargs="*", help="ignored; accepted so pre-commit can pass files"
    )
    args = parser.parse_args()

    found = collect()
    failures: list[str] = []
    undeclared: list[str] = []

    for key, actual, detail in found:
        if key not in EXPECTED:
            undeclared.append(f"  {key}  (resolves to {actual}) -- {detail}")
            continue
        minimum, reason = EXPECTED[key]
        ok = actual >= minimum if minimum else actual == 0
        if args.list:
            mark = "ok  " if ok else "FAIL"
            print(
                f"  {mark} {actual:>4} (expect {'>=' if minimum else '=='}{minimum:<3}) {key}"
            )
        if not ok:
            failures.append(
                f"  {key}\n"
                f"      resolves to {actual}, expected {'at least ' if minimum else 'exactly '}"
                f"{minimum} -- {reason}\n"
                f"      derived from: {detail}"
            )

    missing = [k for k in EXPECTED if k not in {f[0] for f in found}]

    # Coverage is checked FIRST and deliberately so. If a collector stops running, every
    # reference on that surface looks "missing" -- which reads as a repo problem and invites
    # deleting valid expectations. Low coverage means THIS FILE stopped looking, and the
    # message has to say that. Found by negative test 5; see the PR body.
    if len(found) < COVERAGE_FLOOR:
        print(
            f"path guard: verified only {len(found)} references, floor is {COVERAGE_FLOOR}.\n"
            "  Coverage dropped, so this check stopped looking at something it used to --\n"
            "  suspect a collector in this file before suspecting the repository. A\n"
            "  half-built guard reports success, which is what this floor makes loud.",
            file=sys.stderr,
        )
        if missing:
            print("  References that went unseen:", file=sys.stderr)
            for k in missing:
                print(f"    {k}", file=sys.stderr)
        return 1

    if undeclared:
        print(
            "path guard: references found with no declared expectation:",
            file=sys.stderr,
        )
        print("\n".join(undeclared), file=sys.stderr)
        print(
            "\n  A reference changed without its expectation being updated. Add it to EXPECTED\n"
            "  in this file with the count it should resolve to, and say why.",
            file=sys.stderr,
        )
        return 1

    if missing:
        print(
            "path guard: declared references that no longer exist in the repo:",
            file=sys.stderr,
        )
        for k in missing:
            print(f"  {k} -- {EXPECTED[k][1]}", file=sys.stderr)
        print(
            "\n  The reference was deleted or renamed. Either restore it, or remove its\n"
            "  expectation here and say why in the PR.",
            file=sys.stderr,
        )
        return 1

    if failures:
        print(
            "path guard: load-bearing path references have stopped resolving:",
            file=sys.stderr,
        )
        print("\n\n".join(failures), file=sys.stderr)
        print(
            "\n  These do not fail on their own -- a pattern matching nothing PASSES, which is\n"
            "  why this check exists. Fix the reference, or update its expectation here if the\n"
            "  change was deliberate.",
            file=sys.stderr,
        )
        return 1

    print(f"Path references OK: {len(found)} load-bearing references all resolve.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
