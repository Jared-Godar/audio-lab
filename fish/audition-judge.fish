function audition-judge
    set -l voices (edge-tts --list-voices | awk '/^en-/ {print $1}')
    set -g passed   # global so the results survive the function ending
    
    while true
        set -l picks (printf '%s\n' $voices | fzf --multi --height 60% --border \
                            --prompt="Audition > " \
                            --header="Tab: mark several · Enter: audition · Esc: finish & show results")
        test -z "$picks"; and break
        
        for v in $picks
            set -l text "Hello, I'm $v. The quick brown fox jumps over the lazy dog, and I'd be delighted to read your morning briefing."
            set -l judging true
            while $judging
                echo "▶ $v"
                if not test -f /tmp/$v.mp3
                    edge-tts --voice $v --text "$text" --write-media /tmp/$v.mp3
                end
                afplay /tmp/$v.mp3
                
                read -P "  [$v]  (p)ass  (f)ail  (r)epeat  (c)ustom text  (q)uit judging: " verdict
                switch $verdict
                    case p P pass
                        if not contains $v $passed
                            set -a passed $v
                        end
                        echo "  ✓ passed ("(count $passed)" so far)"
                        set judging false
                    case f F fail
                        echo "  ✗ failed"
                        set judging false
                    case r R repeat
                        # loop replays the cached mp3
                    case c C custom
                        read -P "  New text for $v to read: " text
                        rm -f /tmp/$v.mp3   # force regeneration with the new script
                    case q Q quit
                        set judging false
                        set picks            # clear remaining picks
                        break
                    case '*'
                        echo "  p / f / r / c / q"
                end
            end
        end
        echo
    end
    
    echo
    echo "=== Passing voices ==="
    printf '%s\n' $passed
    echo
    echo "Claude-ready line:"
    echo "Use these edge-tts voices: "(string join ", " $passed)
end
