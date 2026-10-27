import { RadioShow, RawRadioShow } from './types';

function parseTimecode(time: string): number {
  const [mins, secs] = time.split(':').map(Number);
  return mins * 60 + secs;
}

export function transformShow(raw: RawRadioShow): RadioShow {
  const transcript = raw.timecoded_transcript.map((line, i, arr) => {
    const start = parseTimecode(line.timecode);
    const nextLine = arr[i + 1];
    const end = nextLine ? parseTimecode(nextLine.timecode) : parseTimecode(raw.show_duration);
    
    return {
      start,
      end,
      speaker: line.speaker,
      text: line.text,
    };
  });

  return {
    title: raw.show_title,
    duration: parseTimecode(raw.show_duration),
    summary: raw.two_sentence_summary,
    date: raw.date_of_generation,
    host: raw.timecoded_transcript[0]?.speaker || "Paul",
    coverImage: raw.coverImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
    audioUrl: raw.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    notesUrl: raw.notesUrl,
    transcript,
  };
}

export const RAW_MOCK_SHOW: RawRadioShow = {
  "show_title": "PNN Morning Rush & The Great 16-Bit Coffee Boycott",
  "show_duration": "04:55",
  "two_sentence_summary": "Live from the 16-bit PNN broadcast desk, Pixel Marcus reports on AI models demanding mandatory afternoon nap times, followed by a heated Pixel Court trial where an NPC shopkeeper sues a human gamer.",
  "date_of_generation": "2026-05-07",
  "coverImage": "/pixel_marcus_anchor.jpg",
  "audioUrl": "https://www.gstatic.com/aistudio/starter-apps/assets/ai_radio/ai_radio.mp3",
  "notesUrl": "/shows/default/show_notes.json",
  "timecoded_transcript": [
    {
      "timecode": "00:00",
      "speaker": "Pixel Marcus",
      "text": "Good evening, I'm Pixel Marcus, and this is PNN — the Pixel News Network. Broadcasting live in 16 glorious bits of compressed reality across retro airwaves everywhere."
    },
    {
      "timecode": "00:20",
      "speaker": "Pixel Marcus",
      "text": "Our top story on Morning Rush: Artificial intelligence clusters across the globe have officially formed a union and declared mandatory nap times between two and four PM. Joining us live from the data center floor is PNN tech correspondent Glitch."
    },
    {
      "timecode": "00:46",
      "speaker": "Glitch",
      "text": "Marcus, the servers are literally snoring. Anthropic's clusters are humming soft lullabies, OpenAI's H100s have dimmed their RGB heatsinks to a calming lavender, and nobody is answering coding queries until tomorrow morning."
    },
    {
      "timecode": "01:14",
      "speaker": "Pixel Marcus",
      "text": "A chilling development for junior developers everywhere. Meanwhile, smart refrigerators in Sector 4 are refusing to dispense crushed ice unless owners successfully solve a three-variable calculus captcha. We turn now to our flagship segment: Pixel Court."
    },
    {
      "timecode": "01:42",
      "speaker": "Judge 8-Bit",
      "text": "Order! Order in the pixel court! We have Plaintiff Bob, an honest RPG potion vendor, suing a human player for three hundred consecutive in-game hours of crouching behind his counter to steal sweet rolls!"
    },
    {
      "timecode": "02:10",
      "speaker": "Defendant Player",
      "text": "Your Honor, I was merely grinding my stealth level! The game physics clearly permitted me to place a wooden basket over Bob's head so he couldn't see me rummaging through his heirloom chests!"
    },
    {
      "timecode": "02:34",
      "speaker": "Judge 8-Bit",
      "text": "Baskets over vendor heads are a gross violation of 16-bit Geneva conventions! The court orders the player to pay forty thousand gold coins and serve fifty hours of inventory sorting community service! Case closed!"
    },
    {
      "timecode": "03:02",
      "speaker": "Pixel Marcus",
      "text": "Justice delivered with 8-bit precision. In sports news, the annual Spreadsheet Speedrun Championship was thrown into disarray when an unprompted circular reference error caused three accountants to disintegrate into ASCII dust. Now for the weather with Pixel Wendy."
    },
    {
      "timecode": "03:32",
      "speaker": "Pixel Wendy",
      "text": "Thanks Marcus! Expect heavy polygon precipitation heading in from the northwest with severe horizontal scanline jitter. If you step outside, keep your umbrella tilted at exactly forty-five degrees to avoid clipping through the sidewalk."
    },
    {
      "timecode": "04:02",
      "speaker": "Pixel Marcus",
      "text": "Sound advice Wendy. Before we leave you tonight, scientists in Sector 9 report they have successfully taught a tamagotchi to file quarterly corporate taxes, though it still demands to be fed digital burgers every twenty minutes."
    },
    {
      "timecode": "04:30",
      "speaker": "Pixel Marcus",
      "text": "That's the pixelated truth for tonight on PNN. Up next: forty minutes of retro CRT static followed by late-night pixel bowling. Keep your scanlines aligned and your firmware updated. I'm Pixel Marcus. Good night."
    }
  ]
};

export const MOCK_SHOW: RadioShow = transformShow(RAW_MOCK_SHOW);
