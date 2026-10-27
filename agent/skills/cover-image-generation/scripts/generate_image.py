#!/usr/bin/env python3
"""Generate cover image for AI Talk Radio using Gemini 3 Pro Image (Nano Banana Pro).

Usage:
    python3 generate_image.py --workspace ./workspace --prompt "Futuristic radio station"

Requires:
    pip install google-genai
"""

import argparse
import base64
import json
import os
import sys
import warnings
from google import genai

import random

# Suppress experimental warnings from SDK
warnings.filterwarnings("ignore", message="Interactions usage is experimental")

BASE_PROMPT = "An authentic 16-bit retro pixel-art broadcast cover for PNN (Pixel News Network) anchored by Pixel Marcus titled '{title}'. Pixel art style of classic PC-98 and LucasArts adventure games, retro newsroom anchor desk with vintage microphone, CRT television monitors, news chyron lower-third graphic"

PROMPT_STYLES = [
    ", retro pixel-art news studio with world map graphic screen, glowing CRT monitors, 16-bit color palette, sharp pixel grid, no blur.",
    ", retro cyberpunk city skyline at night through the pixel studio window, flying cars, neon signs, vibrant 16-bit arcade aesthetic.",
    ", pixel court setting with 16-bit gavel and witness stand, retro courtroom monitors, humorous pixel art details.",
    ", retro pixel sports stadium backdrop with 8-bit scoreboards and electronic stadium lights, vibrant arcade palette.",
    ", late-night talk show set with skyline backdrop, retro couch, microphone, warm 16-bit synthwave lighting."
]

def generate_image(prompt, output_path, reference=None):
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY", "dummy-key"),
        http_options={"timeout": 60}
    )

    prompt = prompt + " Image must be a 1:1 aspect ratio."

    print(f"Generating image with prompt: '{prompt}'")

    input_content = [{"type": "text", "text": prompt}]
    if reference and os.path.exists(reference):
        print(f"Uploading reference image {reference}...")
        ref_file = client.files.upload(file=reference)
        input_content.append({
            "type": "image",
            "uri": ref_file.uri
        })
        print(f"Uploaded as {ref_file.name}")

    models_to_try = [
        "gemini-3.1-flash-image",
        "gemini-3.1-pro-image"
    ]

    for model_name in models_to_try:
        print(f"Trying model: {model_name}")
        try:
            interaction = client.interactions.create(
                model=model_name,
                input=input_content,
                response_format={
                    "type": "image"
                }
            )

            for step in getattr(interaction, "steps", []):
                content_list = getattr(step, "content", [])
                for item in content_list:
                    item_type = getattr(item, "type", "")
                    mime_type = getattr(item, "mime_type", "")
                    if item_type == "image" or (isinstance(mime_type, str) and mime_type.startswith("image/")):
                        image_data = base64.b64decode(item.data)
                        os.makedirs(os.path.dirname(output_path), exist_ok=True)
                        with open(output_path, "wb") as f:
                            f.write(image_data)
                        print(f"✅ Image saved to {output_path}")
                        return True

            print(f"⚠️  No image returned in response from {model_name}.")

        except Exception as e:
            print(f"⚠️  Image generation failed with {model_name}: {e}")
            if "500" in str(e) or "api_error" in str(e):
                print("Falling back to next model...")
                continue
            else:
                # If it's a different error (e.g., auth), we might still want to try the fallback, 
                # but let's just continue to the next model anyway.
                print("Falling back to next model...")
                continue

    print("❌ All models failed to generate an image.")
    return False

def main():
    parser = argparse.ArgumentParser(description="Generate cover image with Gemini")
    parser.add_argument("--workspace", default="workspace", help="Workspace directory")
    parser.add_argument("--prompt", help="Image prompt")
    parser.add_argument("--metadata", help="Path to show_notes.json metadata file")
    parser.add_argument("--output", help="Output image path")
    parser.add_argument("--reference", help="Reference image path for consistency")
    args = parser.parse_args()

    if not args.prompt and not args.metadata:
        parser.error("Either --prompt or --metadata must be provided")

    prompt = args.prompt

    if args.metadata:
        if not os.path.exists(args.metadata):
            print(f"ERROR: Metadata file not found at {args.metadata}")
            sys.exit(1)

        with open(args.metadata, "r") as f:
            metadata = json.load(f)

        title = metadata.get("show_title", "AI Talk Radio")
        summary = metadata.get("two_sentence_summary", "")

        print(f"Selecting prompt template for title: '{title}'")

        style = random.choice(PROMPT_STYLES)
        prompt = BASE_PROMPT.format(title=title) + style
        print(f"Selected random style. Prompt: '{prompt}'")

    output_path = args.output
    if not output_path:
        output_path = os.path.join(args.workspace, "images", "cover.png")

    import signal

    class TimeoutException(Exception):
        pass

    def handler(signum, frame):
        raise TimeoutException()

    # Register the alarm signal handler
    signal.signal(signal.SIGALRM, handler)
    # Set timeout for image generation to 120 seconds max to prevent hangs
    signal.alarm(120)

    try:
        success = generate_image(prompt, output_path, reference=args.reference)
    except TimeoutException:
        print("⚠️ Image generation timed out! Falling back to client-side default cover visual.")
        success = False
    except Exception as e:
        print(f"⚠️ Image generation failed: {e}")
        success = False
    finally:
        # Disable the alarm
        signal.alarm(0)

    if not success:
        print("⚠️ Skipping custom cover image generation (using default template). Exiting successfully with status 0.")
        sys.exit(0)

if __name__ == "__main__":
    main()
