function audition
    set -l voices (edge-tts --list-voices | awk '/^en-/ {print $1}')
    while true
        set -l picks (printf '%s\n' $voices | fzf --multi --height 60% --border \
                            --prompt="Audition > " \
                            --header="Tab: mark several · Enter: play · Esc or Ctrl-C here: quit")
        test -z "$picks"; and break
        for v in $picks
            echo "▶ $v"
            if not test -f /tmp/$v.mp3
                edge-tts --voice $v \
                                        --text "Hello, I'm $v. The quick brown fox jumps over the lazy dog, and I'd be delighted to read your morning briefing." \
                                        --write-media /tmp/$v.mp3
            end
            afplay /tmp/$v.mp3
        end
        echo
    end
    echo "Done auditioning."
end
