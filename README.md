# audio-lab

Personal audio tooling: TTS voice auditioning, podcast generation via the Save to Spotify CLI, and Spotify listening-data analysis.

## Structure
- \`fish/\` — shell functions (symlinked into fish config); \`audition-judge\` is an fzf-driven TTS voice audition tool
- \`pipeline/\` — uv-managed Python project (spotipy, data analysis)
- \`scripts/\` — one-off automation
- \`prompts/\` — episode templates and agent instructions
- \`docs/\` — notes and findings

## Stack
save-to-spotify CLI · edge-tts · OpenAI TTS · Kokoro (local) · ffmpeg · uv · fish
