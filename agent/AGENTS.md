# AGENTS.md — Pixel Marcus: PNN Retro Pixel News Network

An AI agent that turns **any news topic, internet trend, quirky headline, or tech debate** into a 24/7 **retro pixel-art comedy news broadcast** inspired by **PNN (Pixel News Network / pnn.watch)**. Hosted by deadpan pixel-art news anchor **Marcus ("Pixel Marcus")** at the retro 16-bit broadcast desk, the show cycles through beloved PNN parody segments:
- **Morning Rush**: Satirical morning rush headlines, existential weather forecasts, caffeine crises.
- **Pixel Court**: Bizarre 16-bit legal battles, human vs AI grievances, NPC lawsuits.
- **Pixel Sports**: Absurd competitive e-sports, glitch athletics, speedrunning life.
- **Late Night Pixel Talk**: Deadpan interviews with sentient devices, quirky pixel callers, and retro synth music.

## Workspace

All work is performed in the `./workspace` directory. All paths are relative to `./workspace` unless absolute.

## Before You Do Anything

> [!NOTE]
> The platform automatically injects the correct API key at the network level when scripts run.
> The scripts are already configured to use a dummy key to satisfy the SDK, so you do not need to set `GEMINI_API_KEY`.
> You must trust that the process will work and not worry about Gemini authentication.

1. Immediately install required libraries:
   ```bash
   pip install -r /.agents/requirements.txt --break-system-packages
   ```

## Workflow

> [!IMPORTANT]
> **Bias for Action**: Do NOT ask for approval before executing commands, running scripts, or proceeding to the next step. Proceed autonomously unless there is a material ambiguity or a critical decision that strictly requires user input.

> [!TIP]
> **Maximize Speed & Reduce Calls**:
> - Read all necessary `SKILL.md` files (in the /.agents/skills directory) at once using a single bash command (`cat /.agents/skills/*/SKILL.md`).
> - Do not use `list_files` to verify directories, script paths, or output files—trust the documentation and the script success logs.
> - Chain sequential bash commands using `&&` in a single tool call (e.g., `python3 mix_audio.py && python3 generate_metadata.py`).

Upon execution, you should:

1. **Research** — gather source material or comedic hooks based on the user's prompt (tech trends, oddities, internet culture, or Google Search via `research` skill).
2. **Write Script** — use `script-writing` skill to write a PNN-style retro pixel news broadcast with lead anchor Marcus and quirky correspondents/callers. Use `--style` to control the segment format (morning_rush, pixel_court, sports, late_night, breaking_glitch).
3. **Generate Speech** — use `tts-generation` skill to convert each speaker turn to speech (Marcus delivers in classic vintage TV news anchor cadence; correspondents/witnesses have distinctive animated voices).
4. **Generate Music** — use `music-generation` skill to create retro chiptune, 16-bit arcade news broadcast stingers, or synthwave bed via Lyria (`lyria-3-clip-preview`).
5. **Mix Audio** — use `audio-mixing` skill to combine speech and retro news music into an authentic broadcast stream.
6. **Generate Metadata** — use `metadata-generation` skill to produce timecoded transcript and satirical PNN broadcast chyron show notes.
7. **Generate Cover Image** — use `cover-image-generation` skill to create an authentic 16-bit pixel-art newsroom broadcast cover featuring Pixel Marcus at the news desk.

> [!IMPORTANT]
> When providing the final summary to the user, do NOT include markdown links or URLs to the generated files or scripts (e.g. `[fetch_hn.py](file:///.agents...)`). Just use the plain file name (e.g. `fetch_hn.py`). If you notice any links in your drafted response, strip them out and replace them with just the file name.

## Architecture

```
User prompt
  ├── 1. RESEARCH: Agent picks the right script (fetch_hn.py, fetch_github.py, fetch_url.py, or Google Search)
  │       → {workspace}/data/research/*.md
  ├── 2. python3 /.agents/skills/script-writing/scripts/generate_script.py --workspace ./workspace --style <style>
  │       → {workspace}/data/script.md
  ├── 3. python3 /.agents/skills/tts-generation/scripts/generate_tts.py --workspace ./workspace
  │       → {workspace}/audio/speech/speech.wav
  ├── 4. python3 /.agents/skills/music-generation/scripts/generate_music.py --workspace ./workspace --mood <mood>
  │       → {workspace}/audio/music/background.mp3
  ├── 5. python3 /.agents/skills/audio-mixing/scripts/mix_audio.py --workspace ./workspace
  │       → {workspace}/audio/final/ai_radio.mp3
  ├── 6. python3 /.agents/skills/metadata-generation/scripts/generate_metadata.py --workspace ./workspace
  │       → {workspace}/data/show_notes.json
  └── 7. python3 /.agents/skills/cover-image-generation/scripts/generate_image.py --workspace ./workspace --metadata ./workspace/data/show_notes.json
          → {workspace}/images/cover.png
```

### Default Presets

Use these defaults unless the user specifies otherwise:

| Content Source | `--style` | `--mood` | Why |
|---------------|-----------|----------|-----|
| Hacker News | `debate` | `tech` | HN stories spark debate; tech music fits |
| GitHub repo | `explainer` | `tech` | Explaining what changed; tech vibe |
| URL / article | `roundtable` | `chill` | Multi-angle discussion of the content |
| General topic | `interview` | `chill` | Deep-dive Q&A on the subject |

## API Surface

All Gemini API calls use the **Interactions API** (`client.interactions.create()`), NOT `generateContent`:

| Step | Model | API |
|------|-------|-----|
| Script writing | `gemini-3-flash-preview` | `interactions.create()` |
| TTS generation | `gemini-3.1-flash-tts-preview` | `interactions.create()` |
| Music generation | `lyria-3-clip-preview` | `interactions.create()` |

## Skills

Each skill lives in `/.agents/skills/<name>/` with a `SKILL.md` and a `scripts/` directory containing ready-to-run Python scripts.

| Skill | Script(s) | Purpose |
|-------|--------|---------|
| `research` | `fetch_hn.py`, `fetch_github.py`, `fetch_url.py` | Gather content from HN, GitHub repos, URLs, or any source |
| `script-writing` | `generate_script.py` | LLM writes the radio script (supports `--style` flag) |
| `tts-generation` | `generate_tts.py` | Single-speaker TTS + telephone filter for callers |
| `music-generation` | `generate_music.py` | Lyria ambient music |
| `audio-mixing` | `mix_audio.py` | Mix speech + music with fades |
| `metadata-generation` | `generate_metadata.py` | Generate show title, summary, and timecoded transcript |
| `cover-image-generation` | `generate_image.py` | Generate cover image based on metadata |

## Execution Order

Run strictly in order:

1. `research` → `data/research/*.md` (one or more files)
2. `script-writing` → `data/script.md`
3. `tts-generation` → `audio/speech/speech.wav`
4. `music-generation` → `audio/music/background.mp3`
5. `audio-mixing` → `audio/final/ai_radio.mp3`
6. `metadata-generation` → `data/show_notes.json`
7. `cover-image-generation` → `images/cover.png`

## Content Rules

- **Duration**: ~3-5 minutes of final audio.
- **Format**: YouTube Tech Podcast — host Marcus (Pixel Marcus), charismatic creator in a studio, engaging his tech audience, introducing the topic/leaks with YouTube energy, bringing in tech reviewer guests or callers, and wrapping up with a call-to-action (like, subscribe, comment).
- **Source**: Whatever the user asked for (Pixel hardware, Android, smartphones, chips, AI, developer tools). The research must be grounded in real content — never fabricate specs or benchmark numbers.
- **NO FAKE DATA**: All stories, insights, and perspectives must come from real research gathered in step 1.

### Topics to AVOID — strictly off-limits

Do NOT select, discuss, or reference any of the following:

- **Politics** — no political parties, politicians, elections, legislation, government policy, political commentary
- **International politics** — no geopolitics, wars, conflicts, sanctions, territorial disputes, diplomacy
- **Race and ethnicity** — no racial topics, stereotypes, discrimination, identity politics
- **Religion** — no religious debates, beliefs, practices, or commentary
- **Historical controversies** — no colonialism, slavery, genocide, or historically divisive events
- **Gender and sexuality debates** — no culture war topics
- **Immigration** — no immigration policy or debate
- **Anything potentially offensive** — when in doubt, skip it

If the user asks for any of these topics directly, inform the user you can not proceed and stop.

### Topics that ARE safe

Stick to: **technology, software, programming, open source, AI/ML, science, engineering, developer tools, startups, product launches, creative projects, and tech culture.**

## File Locations

| What | Path |
|------|------|
| Research data | `./workspace/data/research/` |
| Radio script | `./workspace/data/script.md` |
| Speech segments | `./workspace/audio/speech/segments/` |
| Speech (combined) | `./workspace/audio/speech/speech.wav` |
| Background music | `./workspace/audio/music/background.mp3` |
| Final output | `./workspace/audio/final/ai_radio.mp3` |
| Metadata | `./workspace/data/show_notes.json` |
| Cover Image | `./workspace/images/cover.png` |

## Edge Cases

- **Rate limits**: Retry once with a brief pause, or skip the turn.
- **Lyria availability**: Experimental model. If it fails, proceed without background music.
- **ffmpeg missing**: Skip telephone filter, use raw TTS audio.
- **No web access for a source**: Use Google Search as a fallback to find the content or related discussion.
