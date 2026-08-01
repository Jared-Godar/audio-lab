#!/usr/bin/env fish
#
# preview-site.fish — serve the website before and after, for review before commit.
#
# AGENTS.md requires that any change under site/ is shown to the maintainer as a
# RENDERED PAGE, on a running local server, before the commit is made (#187). This
# script is that requirement made into one command, because a rule that takes six
# manual steps gets skipped and a rule that takes one does not.
#
#   scripts/preview-site.fish              # before (origin/main) + after (working tree)
#   scripts/preview-site.fish --after-only # skip the before server
#
# WHY "BEFORE" COMES FROM origin/main, NOT THE LOCAL CHECKOUT. The local main can be
# behind, dirty, or both, and a comparison against it shows a difference nobody is
# about to merge. `git archive origin/main` exports exactly what is on the remote
# default branch, whatever the working copy is doing.
#
# WHY A SERVER RATHER THAN OPENING THE FILE. Under file:// the browser applies a
# different origin model: relative asset paths resolve differently, fetch() is
# blocked outright, and inline script behaviour does not exercise the way it will
# in production. A page that looks right over file:// is not evidence.

set -l script_name (status filename)

function __preview_usage
    echo "Usage: scripts/preview-site.fish [options]"
    echo
    echo "Serves site/ twice so a change can be reviewed as a rendered page:"
    echo "  BEFORE — site/ exported from origin/main"
    echo "  AFTER  — site/ in the current working tree, including uncommitted edits"
    echo
    echo "Options:"
    echo "  --after-only        Serve only the working tree (for a brand-new page)"
    echo "  --before-port PORT  Port for the origin/main copy (default 8788)"
    echo "  --after-port PORT   Port for the working tree (default 8789)"
    echo "  --no-fetch          Skip 'git fetch origin', use the cached origin/main"
    echo "  -h, --help          This message"
end

# ---------------------------------------------------------------------------
# Arguments
# ---------------------------------------------------------------------------

set -l before_port 8788
set -l after_port 8789
set -l after_only 0
set -l do_fetch 1

set -l argv_rest $argv
while set -q argv_rest[1]
    switch $argv_rest[1]
        case --after-only
            set after_only 1
            set -e argv_rest[1]
        case --no-fetch
            set do_fetch 0
            set -e argv_rest[1]
        case --before-port
            if not set -q argv_rest[2]
                echo "$script_name: --before-port needs a value" >&2
                exit 64
            end
            set before_port $argv_rest[2]
            set -e argv_rest[1..2]
        case --after-port
            if not set -q argv_rest[2]
                echo "$script_name: --after-port needs a value" >&2
                exit 64
            end
            set after_port $argv_rest[2]
            set -e argv_rest[1..2]
        case -h --help
            __preview_usage
            exit 0
        case '*'
            echo "$script_name: unknown option '$argv_rest[1]'" >&2
            __preview_usage >&2
            exit 64
    end
end

for port in $before_port $after_port
    if not string match -qr '^[0-9]+$' -- $port
        echo "$script_name: port must be a number, got '$port'" >&2
        exit 64
    end
end

if test "$before_port" = "$after_port"
    echo "$script_name: --before-port and --after-port must differ" >&2
    exit 64
end

# ---------------------------------------------------------------------------
# Preconditions
# ---------------------------------------------------------------------------

for tool in git python3
    if not command -q $tool
        echo "$script_name: required tool not found: $tool" >&2
        exit 69
    end
end

set -l repo_root (git rev-parse --show-toplevel 2>/dev/null)
if test -z "$repo_root"
    echo "$script_name: not inside a git repository" >&2
    exit 69
end

if not test -d "$repo_root/site"
    echo "$script_name: no site/ directory at $repo_root" >&2
    exit 69
end

# A port already in use would otherwise surface as a Python traceback after the
# other server is already running, leaving a stray process behind.
function __preview_port_free --argument-names port
    if command -q lsof
        if lsof -nP -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1
            return 1
        end
    end
    return 0
end

set -l wanted_ports $after_port
if test $after_only -eq 0
    set wanted_ports $before_port $after_port
end
for port in $wanted_ports
    if not __preview_port_free $port
        echo "$script_name: port $port is already in use." >&2
        echo "  Free it (lsof -nP -iTCP:$port -sTCP:LISTEN) or pass a different --before-port/--after-port." >&2
        exit 69
    end
end

# ---------------------------------------------------------------------------
# Cleanup — registered before anything is started, so an early failure or a
# Ctrl-C at any point still tears down servers and the temp export.
# ---------------------------------------------------------------------------

set -g __preview_pids
set -g __preview_tmp

# Idempotent: it runs on the normal exit path AND from the interrupt handler
# below, and clears what it touches so a second call is a no-op.
function __preview_cleanup --on-event fish_exit
    for pid in $__preview_pids
        if kill -0 $pid 2>/dev/null
            kill $pid 2>/dev/null
        end
    end
    set -g __preview_pids
    # Belt and braces before an rm -rf: only ever remove a path that still
    # looks like the mktemp directory this script created.
    if test -n "$__preview_tmp"; and string match -q '/*/preview-site.*' -- $__preview_tmp
        rm -rf -- $__preview_tmp
        set -g __preview_tmp ""
    end
end

# Ctrl-C needs its own handler that EXITS, not just one that cleans up.
# Defining an --on-signal handler suppresses fish's default action for that
# signal, so without the explicit `exit` the script survives its own Ctrl-C:
# the servers stop, the temp export is removed, and the script sits in the idle
# loop below serving nothing. Measured, not assumed — that was the first
# version's behaviour.
function __preview_interrupt --on-signal INT --on-signal TERM
    echo
    echo "Stopping preview servers and removing the temporary export…"
    __preview_cleanup
    exit 130
end

# ---------------------------------------------------------------------------
# Export origin/main's site/ and start the servers
# ---------------------------------------------------------------------------

set -l before_dir ""

if test $after_only -eq 0
    if test $do_fetch -eq 1
        echo "Fetching origin/main…"
        if not git -C "$repo_root" fetch --quiet origin main
            echo "$script_name: git fetch origin main failed. Retry, or pass --no-fetch to use the cached ref." >&2
            exit 69
        end
    end

    if not git -C "$repo_root" rev-parse --verify --quiet origin/main >/dev/null
        echo "$script_name: origin/main is not known locally. Run 'git fetch origin main' first." >&2
        exit 69
    end

    set -g __preview_tmp (mktemp -d -t preview-site)
    set before_dir "$__preview_tmp/before"
    mkdir -p "$before_dir"

    # git archive writes the tree at the requested prefix, so site/index.html
    # lands at <tmp>/before/site/index.html; the server is pointed one level in.
    if not git -C "$repo_root" archive origin/main site | tar -x -C "$before_dir"
        echo "$script_name: could not export site/ from origin/main" >&2
        exit 69
    end

    set before_dir "$before_dir/site"
end

function __preview_serve --argument-names dir port label
    python3 -m http.server $port --bind 127.0.0.1 --directory $dir >/dev/null 2>&1 &
    set -l pid $last_pid
    set -g __preview_pids $__preview_pids $pid
    # Give the server a moment, then confirm it is actually listening rather
    # than reporting a URL that answers nothing.
    for attempt in 1 2 3 4 5 6 7 8 9 10
        if curl -sS -o /dev/null "http://127.0.0.1:$port/" 2>/dev/null
            return 0
        end
        sleep 0.3
    end
    echo "  ! $label server on port $port did not come up" >&2
    return 1
end

set -l failed 0

if test $after_only -eq 0
    if not __preview_serve "$before_dir" $before_port BEFORE
        set failed 1
    end
end
if not __preview_serve "$repo_root/site" $after_port AFTER
    set failed 1
end

if test $failed -eq 1
    echo "$script_name: at least one server failed to start; nothing is being served." >&2
    exit 70
end

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

echo
if test $after_only -eq 0
    set -l before_sha (git -C "$repo_root" rev-parse --short origin/main)
    echo "  BEFORE  http://127.0.0.1:$before_port/   site/ at origin/main ($before_sha)"
end
echo "  AFTER   http://127.0.0.1:$after_port/   site/ in this working tree"
echo

if test $after_only -eq 0
    # What actually differs, so the reviewer knows which pages to open. Compares
    # the working tree (index and unstaged alike) against origin/main.
    set -l changed (git -C "$repo_root" diff --name-only origin/main -- site/)
    set -l untracked (git -C "$repo_root" ls-files --others --exclude-standard -- site/)
    set -l all_changed $changed $untracked
    if test (count $all_changed) -eq 0
        echo "  No differences under site/ against origin/main — the two servers show the same page."
    else
        echo "  Changed under site/ ("(count $all_changed)"):"
        for f in $all_changed
            echo "    $f"
        end
    end
    echo
end

echo "  Open both, compare the rendered pages, then Ctrl-C to stop and clean up."
echo

# Idle until interrupted. The cleanup handler runs on the way out.
while true
    sleep 1
end
