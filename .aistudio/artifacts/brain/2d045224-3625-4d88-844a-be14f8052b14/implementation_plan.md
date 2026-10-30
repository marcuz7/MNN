# Vibe Knowledge Explainer Video Engine Integration

Turn any single technical or news knowledge point into an engaging, frame-by-frame kinetic typography educational video with statement-by-statement verified source footnotes, high-fidelity neural narration, and direct broadcast publishing.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX decisions were confirmed during interactive clarification and will govern the implementation:

- **Dedicated Engine Studio**: Placed as a first-class engine view in MNN Studio (`view === 'vibe'`) alongside Topic Gen, STEPPS News, Git Repo Money, and Video Timeline Editor, with quick-seed bridges from verified news clusters.
- **Visual Presentation Style**: Minimalist dark tech aesthetic (`#0A0A0B` obsidian background, slate hairline containers, high-contrast kinetic typography with glowing emphasis tokens, and crisp monospace evidence tags).
- **Interactive Statement Citations**: Every spoken sentence maps to a discrete video frame tagged with verified source references, confidence status badges (`VERIFIED`, `PEER_REVIEWED`, `OFFICIAL_DOCS`), and clickable primary source links.
- **Broadcast YouTube Publishing**: Retains and fulfills the broadcast stage "Publish to YouTube" direct publishing pipeline with auto-generated metadata, chapter timestamps, and tags.

---

## 1. Overview & Core Concept

Inspired by [`andyhuo520/vibe-knowledge`](https://github.com/andyhuo520/vibe-knowledge), the **MNN Vibe Knowledge Engine** is built to bridge complex concepts (e.g. AI architecture shifts, distributed consensus, new open-source models, or financial primitives) into punchy, high-retention 30–75 second educational videos.

### Core Product Law (Inherited from MNN STEPPS)
> **Facts are immutable. Kinetic presentation is optimizable.**
Every single statement uttered in a Vibe Knowledge video must remain strictly grounded in verifiable source references. Visual pacing, typographic motion, and audio emphasis are maximized for clarity and memorability without distorting factual claims.

### Key Value
- **Zero Hallucination Explainer Videos**: Writers and creators input a topic, URL, or verified story; the engine decomposes it into 4–8 punchy statements.
- **Statement-Level Citation Lock**: Each visual frame displays the exact factual statement with interactive source citation pills and publisher provenance.
- **Real-Time Kinetic Video Canvas**: In-browser Canvas / HTML5 player rendering dynamic word-by-word kinetic typography, slide-ins, and code/diagram inserts at 60fps.
- **Multi-Format Export & Publishing**: One-click MP4/WebM rendering, VoxCPM 48kHz voice synthesis, and direct publishing to connected YouTube channels.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│  Input Knowledge Point │ ───► │ Statement & Source Review │ ───► │ Live Kinetic Stage Player │
│  (Topic, Text, or URL) │      │ (Edit claims, add sources)│      │ (9:16 Shorts or 16:9 Web) │
└────────────────────────┘      └───────────────────────────┘      └─────────────┬─────────────┘
                                                                                 │
                                                                   ┌─────────────▼─────────────┐
                                                                   │ VoxCPM Voice + YouTube    │
                                                                   │ Instant Direct Publishing │
                                                                   └───────────────────────────┘
```

1. **Knowledge Ingestion & Topic Seeds**:
   - Quick-seed prompts: "How FlashAttention-3 achieves 75% FLOPs utilization", "Why KV cache compression matters", "How DeepSeek-V3 MoE routing works", or custom user topic.
   - Import from existing MNN Verified Story Clusters with one click.
2. **Statement & Evidence Choreographer**:
   - 5 structured cards representing progressive learning beats:
     - Beat 1: The Friction / Core Problem
     - Beat 2: The Core Mechanism / Discovery
     - Beat 3: The Concrete Technical Evidence & Numbers
     - Beat 4: Second-Order Implication
     - Beat 5: Key Takeaway / Actionable Insight
   - Each beat has editable statement text, primary source citations (URL, author, date), and visual layout mode (e.g. `Code & Architecture`, `Metric Comparison`, `Kinetic Statement`, `Source Callout`).
3. **Live Kinetic Video Stage**:
   - Real-time video player supporting aspect toggle (9:16 Shorts/TikTok vs 16:9 Broadcast).
   - Dynamic kinetic typography engine with highlighted key phrases, animated progress indicators, and statement footnotes.
   - Audio timeline synchronized with VoxCPM 48kHz neural speech.
4. **Publishing & Distribution Hub**:
   - Direct "Publish to YouTube" drawer with auto-generated SEO titles, chapter timestamps, and verified source citations in the description.
   - High-bitrate WebM/MP4 recorded export for local storage and agency batching.

### Visual Identity & Theme Tokens
- **Background**: Canvas dark neutral (`#09090b` / `bg-neutral-950`).
- **Surfaces**: Hairline slate panels (`border border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md`).
- **Typography**: 
  - Headlines & Kinetic titles: `Plus Jakarta Sans` / `Outfit` (bold, tracking-tight).
  - Evidence footnotes, metrics, & code: `JetBrains Mono` with `tabular-nums`.
- **Zero-Pill Compliance**: Clean, unboxed inline metadata separated by subtle typographic bullets (`·`). Filter tabs use clean segmented button controls.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Kinetic Canvas + Server-Side Gemini Intelligence**:
  - *Chosen Approach*: Use Gemini 3.8 Flash on the backend (`/api/vibe-knowledge/generate`) to structure raw inputs into verified statement beats with strict citation formatting, paired with a high-performance interactive client-side kinetic video player.
  - *Why*: Instant playback, responsive scrubbing, zero server GPU render queue latency for previewing, and zero rendering costs during editing.
- **Decision 2: Seamless Shared Voice & YouTube Infrastructure**:
  - *Chosen Approach*: Connect the Vibe Knowledge engine directly into MNN's existing VoxCPM 48kHz speech synthesis service and the centralized YouTube Channel publisher store.
  - *Why*: Consistency across MNN: whether creating a retro talk radio episode, a Git Repo 9:16 short, or a Vibe Knowledge deep dive, the user benefits from identical high-fidelity voices and one-click YouTube uploads.

---

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              MNN Studio                                │
│                     (src/components/MNNNavBar.tsx)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ view === 'vibe'
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            VibeKnowledgeStudio (src/features/vibe/VibeStudio.tsx)      │
│  ┌───────────────────────────────┐  ┌────────────────────────────────┐ │
│  │ KnowledgeDeckSelector         │  │ KineticVideoStage              │ │
│  │ - Topic input & seed cards    │  │ - 9:16 / 16:9 Aspect Switcher  │ │
│  │ - Statement Beat Editor       │  │ - Word-level Kinetic Motion    │ │
│  │ - Verified Footnote Inspector │  │ - Audio Playback & Scrubber    │ │
│  └───────────────────────────────┘  └────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Action Bar: [Generate Audio (VoxCPM)] [Export Video] [Publish YT] │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────┬──────────────────┘
                    │                                 │
                    ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        Server AI & Engine API        │  │     YouTube Publisher API    │
│  - POST /api/vibe-knowledge/generate │  │  - POST /api/youtube/publish │
│  - POST /api/tts/voxcpm/generate     │  │  - GET /api/youtube/channels │
│  - Grounding & Claim Extraction      │  │  - Direct broadcast upload   │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Core Data Models
```typescript
export interface VibeStatementBeat {
  id: string;
  order: number;
  type: 'HOOK' | 'MECHANISM' | 'EVIDENCE' | 'IMPLICATION' | 'TAKEAWAY';
  statement: string;
  highlightWords: string[];
  durationMs: number;
  sources: Array<{
    title: string;
    url: string;
    publisher: string;
    verificationStatus: 'VERIFIED' | 'PEER_REVIEWED' | 'DOCUMENTATION';
    quoteExcerpt?: string;
  }>;
  visualSnippet?: {
    codeLanguage?: string;
    codeContent?: string;
    metricLabel?: string;
    metricValue?: string;
  };
}

export interface VibeKnowledgeProject {
  id: string;
  topic: string;
  headline: string;
  summary: string;
  aspectRatio: '9:16' | '16:9';
  visualStyle: 'dark-tech' | 'neon-terminal' | 'clean-academic';
  beats: VibeStatementBeat[];
  audioUrl?: string;
  voiceId: string;
  totalDurationMs: number;
  createdAt: string;
}
```

---

## 5. Verification Plan

1. **Backend Route Verification**:
   - Test `POST /api/vibe-knowledge/generate` endpoint for structured beat extraction and citation binding.
   - Verify `POST /api/youtube/publish-show` direct upload endpoint with connected channel test.
2. **Frontend Build & Lint Checks**:
   - Run `compile_applet` and `lint_applet` to ensure zero TypeScript/JSX errors.
3. **End-to-End User Experience**:
   - Switch to "Vibe Studio" tab in MNN navigation.
   - Test generating a knowledge point, reviewing statement beats, scrubbing kinetic playback, triggering VoxCPM narration, and testing the YouTube publisher modal.
