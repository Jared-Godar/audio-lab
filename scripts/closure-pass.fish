#!/usr/bin/env fish
#
# closure-pass.fish — execute AGENTS.md § Work-item workflow step 8 and exit non-zero
# when it finds work left undone.
#
# Issue #204. Step 8 is marked **unprompted** in the contract and was skipped after
# four consecutive merges. It surfaced only because the maintainer ran `git status`
# himself and found local `main` four commits behind origin, three merged local
# branches surviving, three unpruned remote branches, and a stale locked worktree
# holding a merged branch. Every item was mechanical and every item was already
# enumerated in the contract. Nothing was missing from the rules.
#
# So this is not another rule. It is a gate: its output is the receipt, and skipping it
# becomes visible instead of silent. It reports rather than repairs — closure work that
# deletes branches or moves HEAD is the maintainer's to authorise, and a script that
# quietly fixed what it found would hide the same information a second way.
#
# Usage:
#   scripts/closure-pass.fish               # report; exit 1 if anything is outstanding
#   scripts/closure-pass.fish --quiet       # print only the checks that FAIL
#   scripts/closure-pass.fish --no-network  # skip every gh/remote check
#   scripts/closure-pass.fish --refs-report # also list Refs-only open issues to eyeball
#
# Exit codes: 0 clean · 1 outstanding closure work · 64 bad usage · 69 missing tool.

# Global, not local: `report` is a function, and fish functions do not see the
# caller's local scope. Declared with -l these read as empty inside it and the
# `test -eq` aborts mid-check.
set -g quiet 0
set -g use_network 1
set -g refs_report 0

for arg in $argv
    switch $arg
        case --quiet -q
            set -g quiet 1
        case --no-network
            set -g use_network 0
        case --refs-report
            set -g refs_report 1
        case --help -h
            sed -n '3,24p' (status filename) | string replace -r '^# ?' ''
            exit 0
        case '*'
            echo "Usage: "(status filename)" [--quiet] [--no-network]" >&2
            exit 64
    end
end

if not command -q git
    echo "Missing required tool: git" >&2
    exit 69
end

# Run from the repo root regardless of the caller's cwd. A stray `cd` silently
# rescopes git's path-limited commands to a subtree with no error at all, which is a
# measurement failure this repo has already been bitten by.
set -g root (git rev-parse --show-toplevel 2>/dev/null)
if test -z "$root"
    echo "Not inside a git repository." >&2
    exit 69
end
cd $root

set -g FAILURES 0
set -g DEFAULT_BRANCH main

# Every check increments this, and the tail refuses to print a clean verdict until it
# reaches the floor below. The first draft of this script named `report`'s parameter
# `status`, which fish reserves as read-only: the function failed to define, every
# check silently did not run, and it printed "Closure pass CLEAN" and exited 0. A gate
# that reports clean because it is broken is worse than no gate — it is exactly the
# "the artifact is not the behavior" failure, on the script written to prevent it.
set -g CHECKS_RUN 0

# report <ok|fail|skip> <label> [body line...]
#
# Body lines are ARGUMENTS, not stdin. In fish a function's `(cat)` command
# substitution does not receive the caller's pipe, so the obvious
# `something | report fail "x"` shape silently drops every detail line and prints a
# bare failure with no evidence under it.
function report --argument-names verdict label
    set -g CHECKS_RUN (math $CHECKS_RUN + 1)
    set -l body $argv[3..-1]
    switch $verdict
        case ok skip
            test $quiet -eq 1; and return 0
            set -l tag "OK  "
            test $verdict = skip; and set tag SKIP
            echo "  $tag  $label"
        case fail
            set -g FAILURES (math $FAILURES + 1)
            echo "  FAIL  $label"
    end
    test (count $body) -gt 0; and printf '          %s\n' $body
end

# Is every commit on $head already present, by patch, on $upstream?
#
# `git branch --merged` is useless here: this repo squash-merges, so the commit that
# lands on main is a new object with a different parent and the branch's ancestry is
# never joined. `git cherry` compares patch IDs instead and marks upstream-equivalent
# commits with '-', which is what makes a squash-merged branch detectable at all.
#
# Returns success only on a SUCCESSFUL cherry with no '+' lines. A cherry that fails —
# unrelated histories, a missing ref — must never read as "merged"; that is how an
# empty result silently becomes a clean bill of health.
function _fully_merged --argument-names upstream head
    set -l out (git cherry $upstream $head 2>/dev/null)
    set -l rc $status
    test $rc -ne 0; and return 2
    test (printf '%s\n' $out | string match -r '^\+' | count) -eq 0
end

# How a fully-merged ref got that way. "squash-merged" means it carried commits and
# their patches are upstream — closure work, safe to remove. "no commits yet" means it
# never diverged, which is equally true of a branch just cut and of a worktree another
# session is working in right now. Collapsing the two would have this script recommend
# deleting live parallel work, so it says which it is and lets the maintainer judge.
function _merge_kind --argument-names upstream head
    if test (git rev-list --count $upstream..$head 2>/dev/null) -gt 0
        echo squash-merged
    else
        echo "no commits yet — may be fresh or in use"
    end
end

# Worktree paths, one per line, deduplicated. `string match -r '^worktree (.*)'`
# returns the whole match AND its capture group, which double-counts every entry.
function _worktree_paths
    git worktree list --porcelain \
        | string match -r '^worktree ' -e \
        | string replace 'worktree ' ''
end

# A floor, not an equality: checks 2, 3, 5, 6 and 7 always report exactly once, and
# 4 and 8 add one each with network. Check 9 is conditional on origin/main existing
# and is not counted. Fewer reports than this floor means checks did not execute.
set -g CHECKS_EXPECTED 5
if test $use_network -eq 1
    set -g CHECKS_EXPECTED 7
end

echo "== closure pass (AGENTS.md step 8) =="
echo "repo: $root"
echo

# ---------------------------------------------------------------------------
# 1. Fetch, so nothing is judged against stale refs.
# ---------------------------------------------------------------------------
if test $use_network -eq 1
    if git fetch --prune --quiet 2>/dev/null
        test $quiet -eq 0; and echo "  ---   fetched origin (--prune)"
    else
        echo "  ---   could not fetch origin; remote checks use stale refs"
    end
    test $quiet -eq 0; and echo
end

# ---------------------------------------------------------------------------
# 2. Local default branch level with origin.
#    The exact check that would have caught "behind by 4 commits".
# ---------------------------------------------------------------------------
if not git show-ref --verify --quiet refs/heads/$DEFAULT_BRANCH
    report skip "$DEFAULT_BRANCH vs origin" "no local $DEFAULT_BRANCH branch"
else if not git show-ref --verify --quiet refs/remotes/origin/$DEFAULT_BRANCH
    report skip "$DEFAULT_BRANCH vs origin" "no origin/$DEFAULT_BRANCH ref"
else
    set -l behind (git rev-list --count $DEFAULT_BRANCH..origin/$DEFAULT_BRANCH 2>/dev/null)
    set -l ahead (git rev-list --count origin/$DEFAULT_BRANCH..$DEFAULT_BRANCH 2>/dev/null)
    if test "$behind" = 0 -a "$ahead" = 0
        report ok "local $DEFAULT_BRANCH is level with origin/$DEFAULT_BRANCH"
    else
        set -l detail
        test "$behind" != 0
        and set -a detail "behind origin/$DEFAULT_BRANCH by $behind commit(s) — git switch $DEFAULT_BRANCH; and git pull --ff-only"
        test "$ahead" != 0
        and set -a detail "AHEAD of origin/$DEFAULT_BRANCH by $ahead commit(s) — unpushed work on a protected branch"
        report fail "local $DEFAULT_BRANCH is not level with origin" $detail
    end
end

# ---------------------------------------------------------------------------
# 3. Merged local branches still present.
# ---------------------------------------------------------------------------
# A branch checked out in a live worktree is in use, not stale — removing it is the
# worktree check's business (item 5), and naming it in both places is noise.
set -g worktree_branches
for wt in (_worktree_paths)
    set -l wb (git -C $wt rev-parse --abbrev-ref HEAD 2>/dev/null)
    test -n "$wb" -a "$wb" != HEAD; and set -a worktree_branches $wb
end

set -l stale_branches
for branch in (git for-each-ref --format='%(refname:short)' refs/heads/)
    test "$branch" = "$DEFAULT_BRANCH"; and continue
    contains -- $branch $worktree_branches; and continue
    if _fully_merged $DEFAULT_BRANCH $branch
        set -a stale_branches $branch
    end
end
if test (count $stale_branches) -eq 0
    report ok "no merged local branches surviving"
else
    set -l detail
    for branch in $stale_branches
        set -a detail "$branch — "(_merge_kind $DEFAULT_BRANCH $branch)
    end
    report fail (count $stale_branches)" merged local branch(es) still present" \
        $detail \
        "delete with: git branch -D "(string join ' ' $stale_branches) \
        "(-d refuses — a squash merge leaves no ancestry for it to see)"
end

# ---------------------------------------------------------------------------
# 4. Merged remote branches unpruned on origin.
# ---------------------------------------------------------------------------
if test $use_network -eq 1
    set -l stale_remote
    for ref in (git for-each-ref --format='%(refname:short)' refs/remotes/origin/)
        set -l short (string replace 'origin/' '' $ref)
        test "$short" = "$DEFAULT_BRANCH" -o "$short" = HEAD; and continue
        if _fully_merged origin/$DEFAULT_BRANCH $ref
            set -a stale_remote $short
        end
    end
    if test (count $stale_remote) -eq 0
        report ok "no merged branches left on origin"
    else
        report fail (count $stale_remote)" merged branch(es) still on origin" \
            $stale_remote \
            "delete with: git push origin --delete "(string join ' ' $stale_remote)
    end
end

# ---------------------------------------------------------------------------
# 5. Worktrees parked on merged branches.
#    Step 8 requires copying any artifacts/ handoff OUT of a worktree before it is
#    removed — artifacts/ is gitignored, so removing the worktree destroys it with no
#    recovery. This script therefore never removes anything; it names the path.
# ---------------------------------------------------------------------------
set -l stale_worktrees
set -l current_wt (git rev-parse --show-toplevel)
for wt in (_worktree_paths)
    test "$wt" = "$root" -o "$wt" = "$current_wt"; and continue
    set -l wt_branch (git -C $wt rev-parse --abbrev-ref HEAD 2>/dev/null)
    # A detached HEAD reports as "HEAD" and has no branch to judge as merged.
    test -z "$wt_branch" -o "$wt_branch" = HEAD; and continue
    # The primary checkout sits on the default branch and is never "stale". Without
    # this, running from inside a worktree makes $root the worktree's own root, so the
    # main checkout escapes the skip above and is reported for removal.
    test "$wt_branch" = "$DEFAULT_BRANCH"; and continue
    if _fully_merged $DEFAULT_BRANCH $wt_branch
        set -a stale_worktrees "$wt ($wt_branch) — "(_merge_kind $DEFAULT_BRANCH $wt_branch)
    end
end
if test (count $stale_worktrees) -eq 0
    report ok "no worktrees parked on merged branches"
else
    report fail (count $stale_worktrees)" worktree(s) on merged branches" \
        $stale_worktrees \
        "COPY any artifacts/ handoffs out FIRST — artifacts/ is gitignored and" \
        "removing the worktree destroys it. Then: git worktree remove <path>"
end

# ---------------------------------------------------------------------------
# 6. Stray untracked files in the .gitignore-exception paths.
#    artifacts/ is gitignored with exceptions carved out for specs and issues, so a
#    file sitting untracked there is provenance that never landed.
# ---------------------------------------------------------------------------
set -l strays (git status --porcelain --untracked-files=all -- artifacts/specs artifacts/issues 2>/dev/null)
if test (count $strays) -eq 0
    report ok "no stray files under artifacts/specs or artifacts/issues"
else
    report fail (count $strays)" stray file(s) in tracked-exception paths" \
        $strays \
        "commit each or surface it — do not let these accumulate across sessions"
end

# ---------------------------------------------------------------------------
# 7. Working tree clean. Pruning branches is not the same as a clean tree, which is
#    why step 8 ends by confirming this explicitly.
# ---------------------------------------------------------------------------
set -l dirty (git status --porcelain)
if test (count $dirty) -eq 0
    report ok "working tree clean"
else
    report fail (count $dirty)" uncommitted/untracked path(s) in the working tree" $dirty
end

# ---------------------------------------------------------------------------
# 8. Merged PRs that CLAIMED to close an issue and did not.
#
#    Origin: #178 and #179 were complete, with both deliverables on main, and stayed
#    OPEN for a day because their PRs said `Refs #N` rather than `Closes #N`.
#    scripts/check_pr_metadata.py deliberately does not require a closing keyword — a
#    Refs-only governance PR is a real case (PR #24) — so nothing reported the gap.
#
#    What this check does NOT do, and why. It does not flag every `Refs #N` whose
#    issue is open. Measured on this repo 2026-08-02, that rule produces 20 hits over
#    the last 15 merged PRs, and essentially all of them are correct: #176, #177,
#    #181, #184, #189 and #190 are long-running tracking issues that many PRs
#    legitimately reference while remaining open. Whether a Refs-only PR *completed*
#    its issue is a judgement about deliverables, not a fact in the git or GitHub
#    metadata, so no gate can decide it — and a gate that fires 20 times on correct
#    work is a gate that gets ignored, which is the failure #204 is about.
#
#    What it does flag is the one unambiguous defect: a merged PR carrying a real
#    closing keyword (Closes/Fixes/Resolves) for an issue that is nonetheless still
#    open. GitHub auto-closes those, so an open one means the keyword was malformed,
#    the reference was cross-repo, or the issue was reopened without the work being
#    reopened. That is always worth a look and is almost always silent.
#
#    Use --refs-report for the judgement call: it lists Refs-only open issues for the
#    maintainer to eyeball, and never affects the exit code.
# ---------------------------------------------------------------------------
if test $use_network -eq 1
    if not command -q gh; or not gh auth status >/dev/null 2>&1
        report skip "merged-PR issue closure" "gh missing or not authenticated"
    else
        set -l lookback 15
        set -l broken_closers
        set -l refs_only
        set -l seen
        for pr in (gh pr list --state merged --limit $lookback --json number --jq '.[].number' 2>/dev/null)
            set -l text (gh pr view $pr --json body,title --jq '.title + "\n" + .body' 2>/dev/null)

            # Numbers reached by a closing keyword, per GitHub's documented set —
            # extracted line by line so a negated mention cannot be read as a claim.
            #
            # PR #194's body says: Refs #190, #177. Deliberately **not** `Closes #190`:
            # triage only. A plain keyword scan flags that PR for the closure defect
            # precisely BECAUSE its author was explicit about not closing the issue —
            # a false positive that would make this check worthless within a week.
            # Two guards, either of which catches that line:
            #   1. inline code spans are stripped, since the keyword is backticked;
            #   2. a line carrying a negation cue is not read as a closing claim.
            set -l closed_nums
            for line in $text
                set -l bare (string replace -ra '`[^`]*`' ' ' -- "$line")
                string match -qri '\b(not|never|rather than|instead of|without)\b' -- "$bare"; and continue
                set -a closed_nums (string match -ar -i '(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#([0-9]+)' -- "$bare" | string match -r '^[0-9]+$')
            end
            set -l all_nums (string match -ar '#([0-9]+)' -- "$text" | string match -r '^[0-9]+$')

            for num in $all_nums
                test "$num" = "$pr"; and continue
                contains -- "$pr:$num" $seen; and continue
                set -a seen "$pr:$num"

                # `gh issue view` happily resolves a PR number; only issues count.
                set -l meta (gh issue view $num --json state,url --jq '.state + " " + .url' 2>/dev/null)
                string match -q '*/issues/*' -- "$meta"; or continue
                string match -q 'OPEN *' -- "$meta"; or continue

                if contains -- $num $closed_nums
                    set -a broken_closers "PR #$pr says it closes #$num — #$num is still OPEN"
                else
                    set -a refs_only "PR #$pr refs #$num (open)"
                end
            end
        end

        if test (count $broken_closers) -eq 0
            report ok "no merged PR left a Closes/Fixes issue open (last $lookback PRs)"
        else
            report fail (count $broken_closers)" merged PR(s) claimed a close that did not happen" \
                $broken_closers \
                "GitHub auto-closes on a well-formed keyword, so an open one means the" \
                "keyword was malformed, cross-repo, or the issue was reopened." \
                "Verify, then: gh issue close <n> --comment '<why>'"
        end

        if test $refs_report -eq 1; and test (count $refs_only) -gt 0
            echo
            echo "  ---   Refs-only references to open issues (informational, not a failure):"
            printf '          %s\n' $refs_only
            echo "          Judge each: a tracking epic stays open; a completed deliverable"
            echo "          does not. This is the #178/#179 case and no gate can decide it."
        end
    end
end

# ---------------------------------------------------------------------------
# 9. Site deploy, when the last merge touched site/.
# ---------------------------------------------------------------------------
if test $use_network -eq 1; and git rev-parse --verify --quiet origin/$DEFAULT_BRANCH >/dev/null
    set -l touched (git diff --name-only origin/$DEFAULT_BRANCH~1 origin/$DEFAULT_BRANCH -- site/ 2>/dev/null | count)
    if test "$touched" -eq 0
        report ok "site deploy not applicable (last merge did not touch site/)"
    else if not command -q gh; or not gh auth status >/dev/null 2>&1
        report skip "site deploy confirmation" "gh unavailable"
    else
        set -l concl (gh run list --workflow=deploy-site.yml --branch $DEFAULT_BRANCH --limit 1 --json conclusion,status --jq '.[0].conclusion + "/" + .[0].status' 2>/dev/null)
        if string match -q 'success/*' -- "$concl"
            report ok "site deploy confirmed" "deploy-site.yml: $concl"
        else
            report fail "site deploy not confirmed successful" \
                "deploy-site.yml: $concl" \
                "Surface this — do NOT run 'aws s3 sync' by hand to fix it (#187, ADR 0020)."
        end
    end
end

echo

# Self-check before any clean verdict is allowed out. See the CHECKS_RUN comment.
if test $CHECKS_RUN -lt $CHECKS_EXPECTED
    echo "closure-pass is BROKEN: $CHECKS_RUN of at least $CHECKS_EXPECTED checks reported."
    echo "Refusing to report a result. Fix this script before trusting its output."
    exit 1
end

if test $FAILURES -eq 0
    echo "Closure pass CLEAN — step 8 has nothing outstanding ($CHECKS_RUN checks)."
    exit 0
end

echo "Closure pass found $FAILURES outstanding item(s) across $CHECKS_RUN checks."
echo "Step 8 is not done. Every item above is mechanical and is enumerated in"
echo "AGENTS.md § Work-item workflow step 8."
exit 1
