#!/usr/bin/env python3
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Generate the AI Talk Radio radio show script from research using the Interactions API.

Usage:
    python3 generate_script.py --workspace ./workspace
    python3 generate_script.py --workspace ./workspace --style debate
    python3 generate_script.py --workspace ./workspace --style interview

Requires:
    pip install google-genai

Output:
    {workspace}/data/script.md
"""

import argparse
import os
from google import genai

BASE_PROMPT = """You are the lead comedy scriptwriter for PNN (Pixel News Network, in the style of pnn.watch) — a 24/7 AI-powered retro pixel-art comedy news channel.

Write a ~3-minute retro pixel-art news broadcast script based on the topic and research provided.

**Lead Anchor**: Marcus (known on-air as "Pixel Marcus") — a deadpan, charming, sharp-witted 16-bit retro news anchor sitting behind the wooden PNN broadcast desk with his vintage microphone and retro CRT monitors. He delivers absurd, hilarious, satirical tech and society news with complete serious anchorman professionalism.

**Format rules:**
- Every line MUST start with a speaker name and colon: `Marcus:` or `[CorrespondentOrCallerName]:`
- You MUST include a gender tag `[Male]` or `[Female]` at the beginning of the dialogue for every correspondent/guest/caller.
- You MUST include an **accent tag** `[Accent: <accent_description>]` (e.g. `[Accent: Mid-Atlantic News Anchor]`, `[Accent: British]`, `[Accent: Deadpan Tech Reporter]`).
- You MUST include **audio tags** in square brackets to indicate delivery style: `[deadpan]`, `[shuffling papers]`, `[adjusts tie]`, `[clears throat]`, `[chuckles]`, `[urgent news tone]`, `[intrigued]`.
- **PNN Signature Intro**: Marcus MUST open with a retro PNN news greeting: "Good evening, I'm Pixel Marcus, and this is PNN — the Pixel News Network, broadcasting live across 16 glorious bits of compressed reality..."
- **Parody & Satire**: Lean into the hilarious, surreal humor of PNN (AI models going on strike, digital appliances demanding rights, retro gaming glitch disasters, absurd tech debates).
- **PNN Sign-off**: Marcus MUST close with a signature deadpan PNN sign-off: "That's the pixelated truth for tonight. Up next: 40 minutes of static followed by Pixel Court. Keep your scanlines clean, I'm Pixel Marcus."
- Keep sentences punchy, rhythmic, and comedic — written for deadpan broadcast timing.
- Target ~450-500 words total.

**CONTENT SAFETY — strictly off-limits:**
- Do NOT use profanity or explicit language.
- Do NOT discuss real-world partisan politics, politicians, elections, or legislation.
- Do NOT discuss real-world international geopolitics, wars, or tragedies.
- Keep the satire centered on technology, AI culture, retro gaming, digital life, and everyday absurdity."""

STYLE_PROMPTS = {
    "morning_rush": """
**Segment: PNN MORNING RUSH**
**Structure:**
1. Intro (15 sec): Marcus welcomes sleepy viewers to Morning Rush with his digital coffee and 8-bit traffic alerts.
2. Top Stories (1.5 min): 3 rapid-fire absurd headlines with correspondent reports.
3. Live Weather & Glitch Report (1 min): A glitchy weather correspondent reports on pixelated thunderstorms and bandwidth humidity.
4. Outro (15 sec): Marcus signs off and advises viewers not to reboot their routers before noon.""",

    "pixel_court": """
**Segment: PIXEL COURT**
**Structure:**
1. Intro (15 sec): Marcus introduces the high-stakes 16-bit courtroom drama of the day.
2. The Dispute (2 min): Judge 8-Bit and the disputing parties (e.g., human gamer vs NPC shopkeeper or smart fridge vs owner) argue their absurd case.
3. The Verdict (30 sec): Judge delivers an unhinged pixel verdict. Marcus reacts with deadpan analysis.""",

    "sports": """
**Segment: PNN PIXEL SPORTS & GLITCH ATHLETICS**
**Structure:**
1. Intro (15 sec): Marcus passes the mic to the chaotic PNN Sports desk.
2. The Highlights (2 min): High-energy coverage of surreal digital competitions: competitive spreadsheet speedruns, NPC dodgeball, or sentient robot tennis.
3. Outro (20 sec): Marcus concludes with injury updates (corrupted save files and blown capacitors).""",

    "late_night": """
**Segment: LATE NIGHT PIXEL TALK**
**Structure:**
1. Monologue (45 sec): Marcus delivers opening topical jokes with punchlines and rimshots.
2. Special Guest Interview (1.5 min): Marcus interviews a surreal digital guest (a retired captcha, a depressed supercomputer, or a runaway algorithm).
3. Closing (30 sec): Marcus wraps with a late-night existential thought and synth stinger.""",

    "breaking_glitch": """
**Segment: PNN BREAKING GLITCH ALERT**
**Structure:**
1. Urgent Alert (20 sec): Red alert sirens! Marcus cuts into regular programming for breaking news.
2. Live On-Scene Report (2 min): Field reporter in the digital trenches amidst a hilarious technological meltdown.
3. Studio Wrap (30 sec): Marcus reassures the public while the studio monitor visibly flickers behind him.""",
}

# Default style when none specified
STYLE_PROMPTS["default"] = STYLE_PROMPTS["morning_rush"]
STYLE_PROMPTS["review"] = STYLE_PROMPTS["morning_rush"]
STYLE_PROMPTS["debate"] = STYLE_PROMPTS["pixel_court"]
STYLE_PROMPTS["roundtable"] = STYLE_PROMPTS["late_night"]
STYLE_PROMPTS["interview"] = STYLE_PROMPTS["late_night"]
STYLE_PROMPTS["explainer"] = STYLE_PROMPTS["breaking_glitch"]

VALID_STYLES = list(STYLE_PROMPTS.keys())


def main():
    parser = argparse.ArgumentParser(description="Generate AI Talk Radio radio script")
    parser.add_argument("--workspace", default="workspace", help="Workspace directory")
    parser.add_argument(
        "--style",
        default="default",
        choices=VALID_STYLES,
        help=f"Show format: {', '.join(VALID_STYLES)}",
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=3,
        help="Target duration in minutes",
    )
    parser.add_argument(
        "--context",
        default="",
        help="Additional tone/style notes inferred from the user prompt (e.g. 'emphasize the technical details'). Do not use for content selection.",
    )
    args = parser.parse_args()

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "dummy-key"))

    # Read research
    research_dir = os.path.join(args.workspace, "data", "research")
    research = ""
    for fname in sorted(os.listdir(research_dir)):
        if fname.endswith(".md"):
            with open(os.path.join(research_dir, fname)) as f:
                research += f.read() + "\n\n"

    if not research.strip():
        print("ERROR: No research found in data/research/. Run the research step first.")
        return

    # Build system prompt = base + style
    target_words = args.duration * 125
    modified_base_prompt = BASE_PROMPT.replace(
        "Write a ~3-minute radio script",
        f"Write a ~{args.duration}-minute radio script"
    ).replace(
        "- Target ~450-500 words total.",
        f"- Target ~{target_words} words total."
    )

    # Make style prompt durations dynamic
    main_seg_min = (args.duration * 60 - 40) / 60
    main_seg_str = f"{main_seg_min:.1f} min"
    style_prompt = STYLE_PROMPTS[args.style].replace("2.5 min", main_seg_str)

    system_prompt = modified_base_prompt + style_prompt

    # Conditionally add Hacker News credit if it's in the research
    if "Hacker News" in research:
        system_prompt += "\n\n**CRITICAL INSTRUCTION**: The research provided comes from Hacker News. The host MUST explicitly mention and give credit to Hacker News during the show."

    if args.context:
        system_prompt += f"\n\n**ADDITIONAL CONTEXT FROM USER**: {args.context}\n(Note: Incorporate this context naturally. Maintain the show's grounded, conversational tone. Apply this context ONLY to the tone and style of the conversation; do NOT use it to limit or dictate which specific stories or facts from the research are discussed.)"

    print(f"=== The Pixel Marcus Show: Script Generation ===\n")
    print(f"Style: {args.style}")
    print(f"Read {len(research)} characters of research.")
    print("Generating script via Interactions API...\n")

    interaction = client.interactions.create(
        model="gemini-3.5-flash",
        input=f"Write the radio script based on this research:\n\n{research}",
        system_instruction=system_prompt,
    )

    script = interaction.steps[-1].content[0].text

    # Save
    out_path = os.path.join(args.workspace, "data", "script.md")
    with open(out_path, "w") as f:
        f.write(script)

    word_count = len(script.split())
    print(f"✅ Script saved to {out_path}")
    print(f"   Word count: {word_count}")
    print(f"\n--- Preview ---\n")
    print(script[:800])
    if len(script) > 800:
        print(f"\n... ({len(script) - 800} more characters)")


if __name__ == "__main__":
    main()
