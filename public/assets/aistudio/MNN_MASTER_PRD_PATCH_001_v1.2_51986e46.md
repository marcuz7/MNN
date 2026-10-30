# MNN — RSS-to-Video Master Patch 001 v1.2
**Canonical, Consolidated Implementation-Ready Product Requirements Document**

**Version:** 1.2  
**Date:** 28 October 2026  
**Repository:** https://github.com/marcuz7/MNN  
**Baseline:** `main` at `6936be429b4eb20ced1e2f946b91b1abf2b5a897`  
**Mode:** SUPERVISED — generation autonomous, external publication human-approved  
**Priority:** P0  
**Status:** Canonical specification, NOT YET IMPLEMENTED; no claim of tested MP4 output  
**Scope:** Additive upgrade to existing MNN application, not a new application  
**Reference only:** https://github.com/mugunthank7/FeedForward-Ai-news (reviewed at `a916d795865d1c6a4d0d69923494cb05830b7e3c`)  
**Relationship to prior drafts:** **Supersedes Patch 001 v1.0 and v1.1 in full. Run v1.2 ONLY.** All retained requirements, changes and implementation priority are expressed in this file; no companion PRD is required.

---

## 0. Canonical Decisions, Changes and Non-Negotiables

**Single source of truth.** This document consolidates the user's uploaded v1.0 and the subsequent FeedForward-informed v1.1. It incorporates every existing functional area—RSS, deduplication, claim verification, scripts, TTS/timing, Pixel Marcus Video Director, Remotion export, approvals, YouTube, API contracts, schema, tests, reliability, security, migration and rollout—plus the decisions below. Older PRDs are historical and must not be separately executed.

| Question | Canonical v1.2 decision |
|---|---|
| First proof: 90 seconds or 3–5 minutes? | **Gate A: one 90-second, three-RSS-story 1080p MP4.** Gate B: 3–5-minute episodes as the full Patch 001 target. |
| One story or three? | Gate A uses **three** selected, verified RSS stories; all APIs must also support single-story episodes. Gate C publishes an approved episode (one or multiple stories). |
| FeedForward integration | Use the designs as **reference**, do not vendor/copy unlicensed code; keep MNN primary. |
| Video renderer | **Remotion for React/TypeScript + FFmpeg/ffprobe** for media diagnostics; no MoviePy second primary pipeline. |
| Presenter | Existing original Pixel Marcus artwork; V0.1 lightweight deterministic idle/speaking sprite animation. **No looping 30-second SadTalker facial clip.** |
| Speech | Preserve MNN Gemini TTS; exact segment durations; optional word-alignment adapter; measured turn-level subtitles as safe fallback. |
| RSS feed storage | PostgreSQL normalized articles, clustering and polling state; Redis/BullMQ for durable job queue. |
| Publication | Supervised, explicit authenticated revision-specific approval, private-first upload, exact approved visibility/schedule. |
| Existing features | No deletion or breaking changes to MNN's existing radio, web player, sharing, Firebase auth or IndexedDB history. |
| Current status | Design only until engineering reports tests; no claim that the 90-second MP4 has been generated. |

**Acceptance gates, in order:**

- **Gate 0 — Regression/safety:** baseline checks, feature flags, security-critical fixes; no legacy regressions.
- **Gate A — Video proof:** 3 RSS headlines → verified source-backed script → measured audio timeline → 90-second *standalone* H.264/AAC MP4 at 1920×1080/30 FPS, real animated frames, subtitles and download. The 90 seconds is a target; tolerate a documented small timing difference from generated speech rather than truncating dialogue.
- **Gate B — Editorial production:** scheduled polling, evidence review, repeatable 3–5-minute episodes, durable job recovery and complete human Review Studio.
- **Gate C — Supervised distribution:** exact approved immutable revision uploads privately and is made public or scheduled only as explicitly approved; operational and regression checks pass.

**HARD STOPS:** No unapproved public YouTube publication, no real-world news fabricated as fact, no silent use of copyrighted publisher imagery, no automatic copying of FeedForward code, no false “LIVE” label for prerecorded video, and no declaration of completion based only on a successful React preview or MP3.

## 1. Executive Summary

MNN (MarcusLeng News Network) will evolve from an AI-generated news podcast and simulated broadcast player into an AI-native, RSS-driven YouTube video production system.

The target user journey is:

**Discover → Verify → Script → Voice → Direct → Render → Review → Publish → Learn**

The system autonomously handles research, story selection, script drafting, voice synthesis, visual composition and video production.

**All external publication requires explicit human approval.**

The release must reuse the current MNN implementation and introduce additive modules without breaking podcast generation, downloads, authentication, existing sharing links or archived shows.

### 1.1 Primary user story

> As the MNN channel owner, I want the system to discover interesting AI and technology news through RSS, produce a fully narrated pixel-art television episode featuring Pixel Marcus, and present the finished video for approval so I can publish consistent, original YouTube content without manually editing each video.

### 1.2 Core release outcomes

- Ingest news automatically from configured RSS and Atom feeds.
- Cluster duplicate or related stories.
- Rank opportunities for MNN episodes.
- Gather source-backed facts and identify unsupported claims.
- Generate an editable broadcast script.
- Reuse MNN's speech, music and cover-generation pipeline.
- Generate real moving visuals synchronized to actual speech audio.
- Export an H.264/AAC MP4 with subtitles and YouTube metadata.
- Provide a reviewer interface for preview, editing and approval.
- Upload the approved video to the connected YouTube channel.
- Support immediate or scheduled publication.
- Preserve audit trails, provenance, versions and generation costs.

### 1.3 Explicit non-goals

Patch 001 does not include real-time interactive anchors, autonomous public posting without approval, full 24/7 livestreaming, expensive diffusion video generation for every frame, or a multi-channel commercial SaaS marketplace.

These may be developed later.

---

### 1.4 First-run operating scenario and target outputs

**Operator:** Marcus, running the existing MNN site in supervised mode. **Input:** three relevant AI/technology headlines selected from RSS News Radar (or the seed fixture during development). **Output:** MNN-branded studio broadcast with an original Pixel Marcus presenter, at least three changing story visuals, fact-attributed titles, recorded narration, synchronized captions and verified H.264/AAC MP4. **Review:** visible video and evidence packet; no YouTube action for Gate A. **Next:** 3–5-minute episodes and an approval-gated private-first YouTube upload.

The initial release is English-first, technology-focused and creator-operated. Manual topic and article-URL entry remain supported. No assumption is made about the user's available GPU or Apple Silicon hardware; Gate A must support ordinary Linux/Windows-capable rendering workers, even without GPU-based lip-sync.

## 2. Existing Codebase and Preservation Contract

### 2.1 Existing assets to retain

| Existing component | Source | Required action |
|---|---|---|
| React application and interactive episode player | `src/App.tsx` | Preserve; extract reusable broadcast components |
| Express backend | `server.ts` | Preserve existing routes; introduce modular routers |
| Gemini managed-agent integration | `server/lib/agentClient.ts` | Retain behind generation service interface |
| Research skills | `agent/skills/research/` | Reuse for source enrichment |
| Script generation | `agent/skills/script-writing/` | Extend output contract |
| TTS synthesis | `agent/skills/tts-generation/` | Preserve voices; expose individual segment durations |
| Audio mixing | `agent/skills/audio-mixing/` | Reuse; provide exact timeline manifest |
| Metadata generation | `agent/skills/metadata-generation/` | Add evidence and scene metadata |
| Image generation | `agent/skills/cover-image-generation/` | Continue; extend to thumbnails and approved scene assets |
| Pixel Marcus avatar and studio | `public/` | Retain brand visuals |
| Firebase authentication | Frontend and backend | Reuse for identity |
| Google Cloud Storage sharing | `server.ts` | Reuse object storage infrastructure |
| IndexedDB show history | `src/lib/clientDb.ts` | Maintain backwards compatibility |

### 2.2 Compatibility rules

**BC-001:** The existing `POST /api/generate-show` endpoint must continue accepting `topic`, `duration`, `mood` and `generationId`.

**BC-002:** Existing radio/podcast output must remain playable and downloadable.

**BC-003:** Existing saved episodes and shared URLs must remain accessible.

**BC-004:** Existing Pixel Marcus artwork, characters, voice preferences and show categories must not be overwritten.

**BC-005:** New video features must use feature flags. `MNN_VIDEO_ENABLED=false` must preserve legacy operating behavior.

**BC-006:** Do not rename or delete existing API endpoints as part of Patch 001.

**BC-007:** External third-party repository code must undergo dependency and license review before merging.

**BC-008:** The new public channel must use original MNN branding. PNN serves as functional inspiration, not an authorization to copy protected branding, scripts, characters or media.

---

### 2.3 Current repository inspection and integration guardrails

Baseline code observed at the referenced MNN commit includes `src/App.tsx` (~3,137 lines) with an HTML `<audio>` player layered under static studio/avatar art and CSS/Motion effects; `server.ts` (~987 lines) with `/api/generate-show`, sharing, quotas and archive delivery; agent skills for research, script, TTS, music, mixing, metadata and cover art; and public Pixel Marcus studio images. It has **no identified real MP4 render pipeline or direct YouTube publisher**. This description is a source inspection, not a successful local build or E2E verification.

**Known risks to address:** the current `/api/download-proxy` fetches caller-specified URLs without a trusted-destination policy; authentication may fall back to a shared development identity; the generated-audio metadata fallback estimates 15 seconds per speaker turn; the broadcast ticker/viewer count is partly hardcoded; show data can include large base64 audio in event payloads. Fix these while preserving the old flows.

**FeedForward design inventory (reference only):** `src/scraper.py` RSS + URL normalization/cache; `src/extractor.py` article/image collection; `src/summarizer.py` local Ollama priority/category/headline; `src/video_generator.py` actual MoviePy 1080p/24 FPS MP4 with ticker, lower thirds, Ken Burns, captions; `src/lip_sync.py` SadTalker capped to the first 30 seconds and looped. FeedForward does **not** supply MNN approval, robust fact-verification, YouTube publisher, or a production-ready license grant. Its README says personal/educational use and no repository-level LICENSE was found in the inspected tree. Treat all associated implementation patterns as a design reference; obtain permission before reusing code.

## 3. Operating Model: Supervised Autonomy

### 3.1 Responsibilities

| Activity | AI / system | Human |
|---|---|---|
| Poll RSS feeds | Automatic | Configure feeds |
| Identify duplicate stories | Automatic | Resolve exceptions |
| Rank story relevance | Automatic | Override ranking |
| Verify factual claims | Automated evidence gathering | Review uncertain/high-risk claims |
| Generate script | Automatic | Edit or approve |
| Generate narration | Automatic | Preview |
| Direct animated scenes | Automatic | Override scene choices |
| Render MP4 | Automatic | Review final output |
| Prepare title, thumbnail and description | Automatic | Final approval |
| Publish to YouTube | Only after authorization | Explicitly approve action |
| Handle failures | Retry bounded operations | Review persistent errors |

### 3.2 Authorization invariant

No operation may cause a video to become publicly visible or scheduled for public visibility without an explicit, authenticated, recorded approval that references the exact immutable video revision and publishing configuration.

Editing the script, video, title, description, thumbnail, channel or scheduled publication details after approval invalidates that approval and requires re-approval.

A button labeled **Approve & Publish** authorizes immediate publication of the shown revision. A button labeled **Approve & Schedule** authorizes the displayed date and time only.

---

## 4. Functional Requirements

## FR-01 — RSS Feed Manager

### Purpose

Enable MNN to continuously discover stories from multiple configured news sources.

### Required capabilities

- Add an RSS/Atom URL.
- Validate and preview the feed before activation.
- Enable, disable, edit and delete configured feeds.
- Store feed name, URL, category, language, priority and poll interval.
- Support scheduled polling, defaulting to every 30 minutes.
- Support HTTP conditional requests using ETag and Last-Modified.
- Parse RSS 2.0 and Atom feeds.
- Respect publishers' content-access policies.
- Display last poll time, most recent item, response status and error message.
- Allow manual refresh.
- Bound maximum response size, timeouts and item count.
- Store original source attribution.

### Feed record

Required properties:

`id`, `ownerUid`, `url`, `title`, `category`, `language`, `priority`, `enabled`, `pollIntervalMinutes`, `etag`, `lastModified`, `lastPolledAt`, `nextPollAt`, `lastError`, `createdAt`, `updatedAt`.

### Polling behavior

1. Scheduler selects eligible feeds.
2. Worker validates destination and fetch policy.
3. Conditional HTTP fetch is performed.
4. XML is parsed safely with external entities disabled.
5. URLs are canonicalized.
6. Items are upserted idempotently.
7. Items enter the deduplication pipeline.
8. Poll results and failures are recorded.

A 304 response must be treated as successful with no new content.

A feed failure must not block unrelated feeds.

### Acceptance criteria

- One configured feed successfully produces persisted news items.
- A second poll with no new stories creates no duplicate records.
- Malformed XML is handled without crashing the service.
- Disabled feeds are never polled.
- Invalid, private-network or prohibited URLs are rejected.
- Feed errors are observable in the UI.

---

### FeedForward-informed RSS enhancements (FR-01A)

Expose an editable preset catalog, not an unchangeable eight-feed list. Candidate categories and example source families: TechCrunch AI, VentureBeat AI, MIT Technology Review AI, Ars Technica, The Verge AI, official OpenAI and Google AI announcements, and a filtered Hacker News RSS feed. **Do not assume their example feed URLs are current or authorized.** The importer must validate each URL with a live fetch before activation, display health/errors, and allow disabling it. Additional categories: LLM/agents, open source, robotics, startups/venture, science/engineering, developer tools, and technology products.

Feeds must not be marked consumed until their items have been durably written. Source-agnostic `sourceId`, canonical article URL, GUID, first-seen time, headline, optional image URL, article/extraction status and raw-source provenance must survive downstream transformations. Retain the distinction between publisher-provided images, user-supplied graphics and generated/owned visuals; only the latter two may be automatically embedded if their rights metadata permits it.

**RSS acceptance extension:** Import the seed fixture with eight candidate entries across three configured feeds; rerun polling twice and verify the unique item count does not grow. A redirect to a private-network target must be blocked. Verify conditional 304 responses and expired/broken feed handling.

## FR-02 — News Deduplication and Story Clustering

### Purpose

Avoid generating multiple videos covering the same underlying news event.

### Deduplication stages

**Stage A — Exact identity**

Compare normalized canonical URLs, RSS GUIDs, publisher IDs and content hashes.

**Stage B — Near-duplicate detection**

Use normalized title similarity, entity matching and optional embedding similarity.

**Stage C — Event clustering**

Group independently published reports describing the same event.

The cluster must preserve every source rather than replacing secondary articles with one canonical text.

### Default thresholds

Initial candidate rules (calibrate against a labeled news set):

- Exact canonical URL match: duplicate.
- Exact normalized content hash: duplicate.
- Title similarity above 0.92 with matching named entities: candidate duplicate.
- Semantic similarity above 0.88: send for clustering validation.
- Lower-confidence cases remain separate until resolved.

Thresholds are configuration values, not guaranteed accuracy levels.

### Output

`StoryCluster` containing:

`id`, `leadItemId`, `title`, `summary`, `sourceItemIds`, `firstSeenAt`, `lastSeenAt`, `duplicateCount`, `score`, `status`.

### Ranking formula

Initial editorial opportunity score:

- Relevance to configured channel topics: 30%.
- Recency: 20%.
- Audience interest signals: 20%.
- Source reliability and factual support: 15%.
- Visual/storytelling potential: 10%.
- Novelty against previously published MNN episodes: 5%.

Scores are explainable and displayed to the reviewer.

**Important:** High relevance cannot override a fact-verification failure.

---

### FeedForward reconciliation: correct the weak parts (FR-02A)

FeedForward's source URL normalizer removes *all* query strings, which can merge distinct news URLs whose query parameters identify a meaningful item. MNN must remove recognized tracking parameters (`utm_*`, `fbclid`, etc.) but preserve content-identifying parameters until a tested canonical link or source GUID proves equivalence. The cache must be a durable unique constraint plus idempotent upsert rather than an unbounded JSON `seen_urls` file. Deduplication covers **same article** and **same underlying event** separately.

FeedForward's selection limits (at most three per source, four per category) are useful *configurable diversity caps*, not universal scoring facts. Require a clear reason for every included/excluded story, and store freshness, duplicates, score components and reference URLs. No semantically similar event may be merged solely because of an embedding score.

## FR-03 — Fact Verification and Evidence Engine

### Purpose

Ensure that MNN's news content is factual even when the delivery includes humor or fictional characters.

### Pipeline

1. Extract atomic factual claims from source material.
2. Resolve each claim to supporting evidence.
3. Prefer primary documentation, official announcements and original data.
4. Seek independent corroboration where appropriate.
5. Identify contradictions and outdated information.
6. Mark claims as `SUPPORTED`, `DISPUTED`, `INSUFFICIENT_EVIDENCE` or `SATIRICAL_FICTION`.
7. Compile an immutable evidence packet for script generation.
8. Require human resolution of disputed claims before video approval.

### Claim record

Each claim must contain:

- Exact claim text.
- Associated story ID.
- Source URL and source title.
- Evidence excerpt or reference.
- Publication date when available.
- Verification outcome.
- Confidence and reasoning metadata.
- Whether the claim is presented as fact or fiction.

### Editorial rules

**FACT-001:** News claims must never be invented.

**FACT-002:** Missing facts must be omitted, caveated or explicitly routed for review.

**FACT-003:** Satirical statements cannot be presented as verified news.

**FACT-004:** Comedy segments may be fictional, but must be clearly distinguished from real reporting.

**FACT-005:** Screens, titles and descriptions must not imply fictional stories are real breaking news.

**FACT-006:** Current information requires date-aware sourcing.

**FACT-007:** All referenced visual assets require provenance and usage-rights metadata.

### Gate behavior

Stories with unresolved material contradictions enter `NEEDS_FACT_REVIEW`.

The system may generate a private draft for review but cannot mark the episode ready for approval until the relevant evidence exceptions are resolved.

---

### Editorial evidence compilation details (FR-03A)

The source compiler must preserve an immutable `EvidencePacket` with `storyClusterId`, source records, retrieval time, claim list, quoted evidence snippets where permitted, and verification status. Dates used in spoken scripts and overlays must derive from observed publisher timestamps or recorded verification time. Never use an LLM's training knowledge alone to present a recent event as verified.

Independent publisher corroboration may add confidence but cannot substitute for checking the primary announcement or underlying paper when the original claim is technical. Editorial confidence is **not** a guarantee of truth. Editorial review is mandatory for disputed facts, suspected licensing violations, impersonation concerns and security-sensitive image/URL sources.

## FR-04 — Pixel Marcus Script Engine

### Purpose

Convert a verified story cluster into an original broadcast script.

### Inputs

- Verified evidence packet.
- Original source links.
- Target duration.
- Language.
- Tone and program format.
- Presenter configuration.
- Previous episode context.
- Editorial restrictions.

### Initial show formats

| Format | Purpose |
|---|---|
| Morning Rush | Multiple technology headlines |
| Breaking News | One major developing story |
| AI Explainer | Explain a complex AI development |
| Pixel Court | Clearly fictional or satirical debate |
| Late Night | Entertainment-focused technology commentary |

### Required script output

Structured JSON containing:

- Episode title.
- Summary.
- Story outline.
- Ordered speaker turns.
- Speaker ID and voice profile.
- Dialogue.
- Audio direction.
- Visual scene intention.
- Relevant supporting claim IDs.
- Estimated duration.
- Satire/fiction disclosure flags.

The existing `script.md` must remain available for backwards compatibility.

### Human editing

The reviewer can edit dialogue, change speaker assignment, regenerate a section and request a shorter or longer episode.

Every edit creates a new script revision and invalidates downstream assets affected by the change.

---

### First-episode program format (FR-04A)

**`MNN_DAILY_NEWS` / Gate A:** three RSS stories selected from the News Radar. Initial *planning* beats: 0–5 s intro; 5–29 s story 1; 29–53 s story 2; 53–77 s story 3; 77–85 s recap; 85–90 s outro. Actual boundaries must be computed from generated audio; never truncate words simply to force 90 seconds.

Add to script JSON: `format`, `segmentId`, `storyClusterId`, `speakerId`, `voiceId`, `sceneType`, `audioDirection`, `estimatedSeconds`, `claimIds`, `satireDisclosure`, and `sourceIds`. Save both human-readable `script.md` (legacy) and typed `script.json` (new). Every script revision invalidates dependent speech/scene/render artifacts; unchanged upstream research need not be repeated.

The initial target includes a solo Pixel Marcus anchor, but multi-speaker scripts remain supported by MNN's existing TTS design. For real technology news, fact and opinion are separate; original deadpan comedy is allowed but must not disguise invented events as actual breaking news. Generated new intro/outro labels must say **MNN**, not PNN; existing archived PNN-style demo content must not be rewritten destructively.

**Legacy duration compatibility:** The old `POST /api/generate-show` supplies a `duration` field in minutes (with a current server default of `"15"`), while agent documentation targets approximately 3–5 minutes. For Gate A, the *new* `/api/episodes/from-stories` flow must explicitly supply `durationTargetSeconds=90` and ensure the script-writing agent respects it, without silently altering the old endpoint's default or breaking legacy users. Validate the actual speech length and allow a documented slight duration variance; no mid-sentence truncation.

## FR-05 — Speech and Accurate Timing

### Current limitation

MNN currently derives some transcript times through model estimates; its fallback approximates each turn as 15 seconds.

This is insufficient for deterministic video synchronization.

### Required implementation

Each generated speech turn must produce:

`turnId`, `speakerId`, `text`, `audioAssetId`, `durationMs`, `sampleRate`, `channels`, `voiceId`, `startMs`, `endMs`.

### Synchronization rules

- Measure each actual synthesized audio file.
- Concatenate turns in deterministic order.
- Account for inserted silence and intro padding.
- Build cumulative absolute timing from media durations.
- Track audio and music independently.
- Do not infer final speaker timing solely from LLM output.
- Use word-level alignment when available.
- If word-level alignment is unavailable, show per-turn captions with verified start/end times.
- Never silently fall back to arbitrary fixed-duration subtitles.

The existing Gemini TTS adapter stays supported. Add an optional local TTS adapter only after the first MP4 passes acceptance.

---

### SpeechTimelineV1 technical specification (FR-05A)

1. For each script turn, synthesize into an individual PCM/WAV or accurately probed compressed-audio asset and save speaker/voice IDs and text. Record sample rate, sample count, duration, file checksum and source script revision.
2. Record silent pauses, optional lead-in and the exact offsets introduced by mixing (`mix_audio.py` currently adds a 3-second tail and a 500 ms lead-in when music exists); do **not** count a separate music introduction twice.
3. Build absolute `startMs`/`endMs` using the *actual audible alignment* in the final master audio. Validate with media probing, not model-approximated timestamps.
4. If available, add word-boundary alignment through a separately licensed aligner; if unavailable, emit accurate per-turn captions. Explicitly mark alignment precision in manifest (`WORD` or `TURN`).
5. Captions may wrap/scroll for readability, but must not infer timing from the screen ticker's rate.

Example turn: `{"turnId":"turn-001","speakerId":"pixel-marcus","startMs":500,"endMs":4210,"durationMs":3710,"text":"Tonight, three developments in AI.","audioAssetId":"asset-001","alignmentPrecision":"TURN"}`.

**Acceptance:** In controlled speech fixtures, caption/speaker start and end deviation from the source audio must be ≤150 ms, or a tighter value where a validated aligner allows it. The renderer must use a single shared audio/scene time base.

## FR-06 — MNN Video Director

### Purpose

Translate the structured script and synchronized audio into a scene-by-scene video timeline.

### Scene types

| Scene type | Function |
|---|---|
| `ANCHOR_DESK` | Pixel Marcus narrating in the MNN studio |
| `SPLIT_SCREEN` | Anchor and relevant secondary visual |
| `NEWS_CARD` | Story headline with visual and attribution |
| `CORRESPONDENT` | Alternative speaker/pixel character |
| `EXPLAINER` | Animated charts, icons and diagrams |
| `QUOTE_CARD` | Attributed quotation |
| `TRANSITION` | Show intro, bumper or segment transition |
| `OUTRO` | Closing message and subscription prompt |

### V0.1 visual requirements

- Reuse the existing Pixel Marcus studio backdrop.
- Create an independent, renderable presenter layer.
- Add controlled idle movement and speaking movement.
- Add a basic audio-envelope-driven mouth animation or speech sprite.
- Synchronize the active speaker to the speech timeline.
- Display changing news headlines and source-attributed supporting visuals.
- Use dynamic lower-thirds.
- Add a moving news ticker using actual episode headlines.
- Include captions.
- Display the MNN brand rather than reusing PNN's protected identity.
- Only show a `LIVE` indicator during an actual live stream.

Basic mouth movement in V0.1 is not claimed to provide phoneme-accurate lip synchronization. Advanced viseme-driven animation is a separate enhancement.

### Video Director output contract

The canonical `VideoManifestV1` must contain:

```json
{
  "schemaVersion": "1.0",
  "episodeId": "episode-uuid",
  "revision": 1,
  "compositionId": "MNNBroadcast16x9",
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "durationMs": 180000,
  "audio": {
    "masterAssetId": "asset-uuid",
    "startMs": 0
  },
  "scenes": [
    {
      "sceneId": "scene-001",
      "type": "ANCHOR_DESK",
      "speakerId": "pixel-marcus",
      "startMs": 0,
      "endMs": 12000,
      "headline": "The AI Agent Revolution",
      "assetIds": ["studio-asset-uuid"],
      "turnIds": ["turn-001"],
      "claimIds": ["claim-001"]
    }
  ],
  "captions": [
    {
      "startMs": 0,
      "endMs": 3200,
      "speakerId": "pixel-marcus",
      "text": "Good evening. I'm Pixel Marcus."
    }
  ]
}
```

The manifest must be validated before entering the render queue.

### Timeline invariants

- `durationMs` must equal the measured master-audio duration, adjusted only for explicitly configured opening/closing video padding.
- Scene start and end times must be ordered and bounded by the composition duration.
- Every narration interval must have an assigned scene.
- No subtitle may extend beyond the final composition frame.
- Assets must resolve to authorized, locally staged or otherwise render-accessible files.
- A render must be reproducible from the same manifest and asset revision.

---

### Pixel Marcus director additions (FR-06A)

**V0.1 animation:** reuse the existing Pixel Marcus artwork, extract independent video-compatible studio assets, and implement deterministic idle breathing, 2–4 mouth sprites/speech-state mouth toggles, head movement, story card transitions, image-pan/zoom (Ken Burns style), dynamic MNN lower-thirds, genuine episode-headline ticker and a safe fallback graphic if publisher images are unlicensed or missing. For news stories, display source attribution and publication timestamp when known. Do not use a 30-second repeating SadTalker talking face: its mouth sequence becomes desynchronized after 30 seconds.

**Frame mapping:** define `startFrame = floor(startMs * fps / 1000)` and `endFrameExclusive = ceil(endMs * fps / 1000)` with boundary reconciliation so adjacent scenes do not unintentionally overlap or leave gaps. Choose `durationInFrames = ceil(durationMs * fps / 1000)` and validate that the end is within one frame of actual media duration plus explicit video padding. The manifest must carry `turnIds`, `storyClusterId`, `claimIds`, asset IDs, rights decisions, `speakerId`, and scene-level visual rules.

**Composition reuse:** the existing browser broadcast UI can inspire presentational components, but exported animation must be deterministic and use Remotion-supported primitives. Do not simply screen-capture the current React app or advertise that as a finished rendering architecture.

## FR-07 — Remotion Video Renderer

### Renderer architecture

Use Remotion compositions with deterministic JSON input properties. `MNNBroadcast16x9` is the **only required episode composition for Gate A**; preserve flexibility for longer runtimes and 9:16 Shorts later. The render worker must derive actual frame count from the approved manifest, not a hardcoded 90 seconds.

Required compositions:

- `MNNBroadcast16x9`
- `MNNShorts9x16` (future Patch 002, **not required for Patch 001**; interface may be reserved)
- `MNNThumbnail16x9`

### Output specification

| Property | V0.1 target |
|---|---|
| Resolution | 1920 × 1080 |
| Frame rate | 30 FPS |
| Container | MP4 |
| Video codec | H.264 |
| Audio codec | AAC |
| Aspect ratio | 16:9 |
| **Gate A first-render duration** | **90-second target, three verified RSS stories** |
| **Gate B sustained episode duration** | **3–5 minutes** |
| Subtitles | Burned-in captions and downloadable SRT |
| Thumbnail | JPG/PNG, 16:9 |
| Source metadata | Episode JSON |
| File storage | Google Cloud Storage or configured local output |

### Rendering sequence

1. Validate manifest.
2. Validate all asset references and rights.
3. Stage assets in the isolated render workspace.
4. Calculate duration in frames.
5. Bundle/select Remotion composition.
6. Render video and audio.
7. Probe output using FFmpeg/ffprobe.
8. Validate duration, streams and dimensions.
9. Check for frozen, black or missing-asset scenes.
10. Store output with checksum and immutable revision.
11. Move episode to `VIDEO_READY`.

### Audio implementation requirement

Use Remotion's supported audio components, including `@remotion/media`, to align narration with the frame-based timeline.

Avoid live API calls, nondeterministic animations or random timestamps inside compositions.

Scene animation must derive from frame number, timeline data and deterministic parameters.

### Rendering failure handling

- Bounded retries for transient infrastructure failures.
- No blind retries for malformed manifests or missing assets.
- Retry attempts must reuse the original immutable input revision.
- Workers must not render the same idempotency key concurrently.
- Partial files must not be exposed as completed exports.
- Cancellation must terminate the worker and clean temporary resources.

---

### Renderer contract and media QA extensions (FR-07A)

- Use the Remotion `calculateMetadata` composition function (or equivalent build-time computed metadata) to derive `durationInFrames` from `VideoManifestV1` and preserve the configured 1920×1080/30 FPS output. The composition should receive only versioned input properties and staged, allowed assets.
- Use Remotion's recommended `Audio` from `@remotion/media` to place the final mixed master audio on the timeline. FFmpeg is still required for diagnostic probing, optional transformations, output validation and recovery utilities; do not introduce a second audio clock.
- A render worker must persist its job state independently of the Express request. It should check H.264/AAC streams, frame dimensions, frame rate, duration tolerance, and representative frame inspection. Confirm captions at the selected story boundaries and ensure the MP4 plays outside the app.
- Implement typed export artifacts: `episode.mp4`, `episode.srt`, `thumbnail.png`, `video-manifest.json`, `timeline.json`, and `quality-report.json` (plus existing MP3/cover/show notes).
- Protect render jobs against duplicate requests through a stable `(episodeId, revision, preset)` idempotency key, and provide cancellation, bounded retries, a status API and durable error reports.
- Baseline MP4 quality must not depend on a CUDA/MPS GPU, SadTalker, purchased diffusion models or any runtime external video-generation service.

**Definition of 'video'**: a real H.264/AAC `.mp4` containing nontrivial timed animation, scene changes, graphics and correctly aligned narration; a static still + audio, HTML player, short loop falsely advertised as lipsync, or audio ZIP is not sufficient.

## FR-08 — Human Review Studio

### New application navigation

Add a production workspace while preserving the existing episode/player experience.

**Recommended navigation**

`News Radar | Feed Manager | Episodes | Review Queue | Broadcast Studio | YouTube | Settings`

### Review screen layout

**Left:** Pixel Marcus video preview with playback controls.

**Right:** Script, source evidence, title, description, thumbnail and publishing settings.

**Bottom:** Timestamped scene timeline, captions, generation diagnostics and approval history.

### Required actions

- Preview final rendered MP4.
- Inspect original sources and fact-check results.
- Edit script and regenerate affected scenes.
- Replace unsuitable visuals.
- Correct subtitles.
- Edit YouTube metadata.
- Approve the exact video revision.
- Reject with a reason.
- Request changes.
- Select target YouTube channel.
- Select immediate or scheduled publication.
- Download MP4 and supplementary files.

### Review invariants

An approved episode cannot be edited in place.

Changes create a new revision and return it to an unapproved state.

Review decisions must record reviewer UID, timestamp, media checksum, script revision, metadata revision, channel and publishing parameters.

---

## FR-09 — YouTube Publishing

### Integration

Use YouTube Data API v3 with server-side OAuth 2.0.

The user explicitly connects a YouTube channel and grants required permissions.

OAuth refresh tokens must be encrypted at rest and never sent to the browser.

Use resumable media uploads for MP4 files.

### Publishing flow

1. Human reviews completed video.
2. Human selects exact metadata and visibility/schedule.
3. Human approves the release.
4. System creates an upload job.
5. Video is initially uploaded as `private`.
6. Thumbnail is uploaded.
7. Video metadata and disclosure flags are validated.
8. Visibility or scheduling is applied according to the approval.
9. The YouTube video ID and response are persisted.
10. Episode publication status is updated.

If any post-upload step fails, leave the uploaded video private and notify the reviewer.

### Required metadata

- Video title.
- Description including original source attribution.
- Tags and category.
- Thumbnail.
- Language.
- Audience designation.
- Appropriate altered/synthetic-media disclosure.
- Visibility.
- Scheduled publication timestamp if applicable.

### Critical restrictions

- Never publish a draft automatically.
- Never substitute a different video or channel after approval.
- Never publish content with unresolved material claims.
- Never automatically retry an uncertain upload by creating another video; first reconcile with the recorded upload/session state.
- Never store OAuth credentials in client-accessible code.

---

### YouTube platform-specific publishing conditions (FR-09A)

Always set `status.privacyStatus="private"` explicitly in `videos.insert`; the API may otherwise default to public. Store `videoId` after the first successful resumable upload response. Inspect existing upload/session status before retrying an uncertain response so retries cannot create multiple public videos. Use `thumbnails.set` only after successfully identifying the intended private video.

For future scheduling, `status.publishAt` applies to a **private, never-published** video. Validate that `scheduledAt` is unambiguously in the future (UTC internally, user's locale shown in UI); a past `publishAt` can publish immediately. When updating publish settings, keep `status.privacyStatus=private` alongside `status.publishAt` as required by YouTube's API. Apply scheduling only after the human authorized the specific timestamp, channel and immutable metadata/video hashes.

YouTube supports `status.containsSyntheticMedia` for relevant disclosures, but do not assert that every stylized pixel-art animation requires the same disclosure. Review platform policy and apply accurate audience/synthetic-media designations. Review API project verification/audit restrictions with a real authorized test channel; do not promise that an unverified project can publish publicly without restrictions because Google's documentation on this issue has been inconsistent. Keep the approval-gated private upload available even when publication is blocked.

## 5. End-to-End Architecture

```text
RSS Feeds / Manual Topic / Article URL
                  |
             Feed Scheduler
                  |
             RSS Ingestion
                  |
        Normalization + Dedup
                  |
             Story Clusters
                  |
        News Ranking + Selection
                  |
        Fact/Evidence Compiler
                  |
             Script Engine
                  |
        TTS + Music Generation
                  |
          Audio Timeline Builder
                  |
           MNN Video Director
                  |
           VideoManifestV1
                  |
           Render Job Queue
                  |
        Remotion + FFmpeg Worker
                  |
        MP4 / Captions / Thumbnail
                  |
            Human Review Gate
                  |
         Approved Revision Only
                  |
           YouTube Publisher
                  |
          Scheduled / Published
                  |
         Audit + Cost + Metrics
```

### Infrastructure decisions

| Layer | Decision |
|---|---|
| Frontend | Existing React 19 + Vite |
| API | Existing Express + TypeScript |
| Authentication | Existing Firebase Auth |
| Orchestration | Existing Gemini integration behind adapter |
| Durable database | PostgreSQL |
| SQL migration layer | Prisma or equivalent typed migration tooling |
| Job queue | BullMQ + Redis |
| Object storage | Existing Google Cloud Storage integration |
| Rendering | **Remotion (primary)** + isolated Node worker, no MoviePy production dependency |
| Media verification | FFmpeg / ffprobe + timeline assertions + sample frames |
| YouTube | Data API v3 + OAuth 2.0 |
| Observability | Structured logs, job state, metrics, audit events |

### Why PostgreSQL is added

MNN's current IndexedDB and file-based quota state are insufficient for reliable shared queues, cross-worker deduplication, revision history and transactional publishing approvals.

Keep IndexedDB as a local cache and legacy compatibility layer, but use PostgreSQL as the source of truth for all new production records.

The video-rendering worker must run independently from the API process. Rendering jobs must survive API restarts and browser disconnections.

---

## 6. Data Model and Database Schema

All IDs are UUIDs unless otherwise stated. Timestamps use timezone-aware UTC values. Media records reference object storage rather than placing full binary files inside SQL.

### 6.1 Required entities

| Table | Essential fields |
|---|---|
| `rss_feeds` | id, owner_uid, url, title, category, enabled, poll_interval_minutes, etag, last_modified, next_poll_at, last_error |
| `rss_items` | id, feed_id, guid, canonical_url, title, author, published_at, fetched_at, content_hash, body_text |
| `story_clusters` | id, owner_uid, lead_item_id, title, summary, score, status, first_seen_at, last_seen_at |
| `story_cluster_items` | cluster_id, item_id |
| `claims` | id, cluster_id, claim_text, verdict, evidence_json, impact, reviewed_by |
| `episodes` | id, owner_uid, cluster_id, input_mode, status, current_revision, language, format, created_at, updated_at |
| `episode_revisions` | id, episode_id, revision, script_json, audio_manifest_json, video_manifest_json, youtube_metadata_json, manifest_checksum, created_at |
| `speech_turns` | id, episode_revision_id, turn_id, speaker_id, voice_id, text, audio_asset_id, start_ms, end_ms, duration_ms, alignment_precision, sha256 |
| `media_assets` | id, episode_id, revision, kind, storage_uri, mime_type, duration_ms, sha256, rights_json, created_at |
| `render_jobs` | id, episode_id, revision, status, progress, attempts, idempotency_key, error_code, output_asset_id |
| `review_decisions` | id, episode_id, revision, reviewer_uid, decision, approved_checksum, metadata_checksum, publication_json, created_at |
| `youtube_channels` | id, owner_uid, channel_id, display_name, encrypted_refresh_token, token_key_id, status |
| `youtube_publications` | id, episode_id, revision, channel_id, video_id, upload_session_ref, status, scheduled_at, published_at, idempotency_key |
| `audit_events` | id, actor_uid, entity_type, entity_id, event_type, details_json, created_at |

### 6.2 Database constraints

- Unique normalized feed URL per owner.
- Unique item identity by canonical URL or source GUID strategy.
- Unique `(cluster_id, item_id)` association.
- Unique `(episode_id, revision)` revision.
- Unique `(episode_revision_id, turn_id)` speech turn.
- `start_ms >= 0`, `end_ms > start_ms`, and `duration_ms = end_ms - start_ms` for synchronized speech-turn records.
- Each committed media asset references an immutable revision and SHA-256 digest.
- Unique render idempotency key.
- Unique publication idempotency key.
- Unique YouTube video ID when present.
- Foreign keys must prevent orphaned job references.
- Approval references a specific immutable revision.
- All state changes are audited.

### 6.3 Database migrations

Create new versioned migrations for the new tables and indexes. Do not alter existing browser-saved show keys or delete existing GCS objects.

A migration must be repeatable in development and safely applied once in production.

### 6.4 Index requirements

At minimum:

- `rss_feeds(enabled, next_poll_at)`
- `rss_items(feed_id, published_at DESC)`
- `rss_items(content_hash)`
- `story_clusters(owner_uid, status, score DESC)`
- `episodes(owner_uid, status, created_at DESC)`
- `render_jobs(status, created_at)`
- `speech_turns(episode_revision_id, start_ms)`
- `youtube_publications(episode_id, revision)`
- `audit_events(entity_type, entity_id, created_at DESC)`

### 6.5 Media asset paths

Use structured storage paths such as:

```text
mnn/episodes/{episodeId}/r{revision}/
  research/evidence.json
  script/script.json
  speech/turn-001.wav
  speech/turn-002.wav
  audio/speech-timeline.json
  audio/master.wav
  audio/master.mp3
  scenes/scene-001.png
  manifests/video.json
  render/episode.mp4
  captions/episode.srt
  artwork/thumbnail.png
  metadata/youtube.json
  reports/quality.json
```

An existing episode's approved output must remain immutable.

---

### 6.6 Data and media contract examples

`rss_items` must persist both `source_guid` and `canonical_url` (where present), publisher, source publication time, original headline, ingestion time, body excerpt/full-text status, hash and optional *rights-qualified* asset reference. Preserve raw and normalized article provenance so reviewers can trace scripts back to the originating source. `story_cluster_items` is a many-to-many junction, not a list that overwrites publisher attributions. `claims` must explicitly distinguish `DISPUTED` and `SATIRICAL_FICTION` and store immutable evidence references. `episode_revisions` holds validated `script_json`, `speech_timeline_json`, `video_manifest_json` and YouTube metadata revision or immutable checksums.

**Media integrity and retention:** GCS objects live at versioned keys, never mutable `latest.mp4` paths. Store SHA-256 digests for audio/video, record rights metadata for any reused publisher images, and preserve approved revisions and audit records during routine cleanup. Continue serving legacy IndexedDB/GCS links. Use transactionally committed metadata and outbox/queue dispatch where necessary to avoid stranded jobs.

## 7. API Contracts

All new protected endpoints require Firebase Bearer authentication.

Authorization must be checked against object ownership and role, not merely token presence.

### 7.1 Feed APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/rss/feeds` | List feeds |
| POST | `/api/rss/feeds` | Add and validate feed |
| PATCH | `/api/rss/feeds/:id` | Update feed |
| DELETE | `/api/rss/feeds/:id` | Disable/delete feed |
| POST | `/api/rss/feeds/:id/poll` | Manual poll |
| GET | `/api/rss/items` | List newly ingested items |
| POST | `/api/rss/feeds/validate` | Validate URL and preview before persistence |

**Example create feed**

```json
{
  "url": "https://example.com/feed.xml",
  "title": "Example AI News",
  "category": "AI",
  "language": "en",
  "priority": 8,
  "pollIntervalMinutes": 30,
  "enabled": true
}
```

Successful creation returns HTTP 201 with the server-generated feed ID and validated configuration.

Validation errors return HTTP 400 or 422. Duplicates return HTTP 409.

### 7.2 Story APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/stories` | Ranked story queue |
| GET | `/api/stories/:id` | Sources and evidence |
| POST | `/api/stories/:id/verify` | Queue verification |
| POST | `/api/stories/:id/produce` | Create draft episode |
| PATCH | `/api/stories/:id` | Reviewer overrides |

### 7.3 Episode APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/episodes/from-text` | Create manual-input episode |
| POST | `/api/episodes/from-stories` | Create episode from selected RSS story cluster IDs |
| GET | `/api/episodes/:id` | Episode and state |
| GET | `/api/episodes/:id/revisions/:revision` | Immutable revision |
| PATCH | `/api/episodes/:id/script` | Save script edit as new revision |
| POST | `/api/episodes/:id/render` | Queue render |
| GET | `/api/episodes/:id/assets` | Authorized media list |
| POST | `/api/episodes/:id/submit-review` | Submit final video |
| POST | `/api/episodes/:id/approve` | Approve revision |
| POST | `/api/episodes/:id/reject` | Reject revision |
| GET | `/api/episodes/:id/video` | Authorized preview/asset link for rendered revision |
| GET | `/api/jobs/:jobId` | Read job progress |
| GET | `/api/jobs/:jobId/events` | Stream job updates |

### 7.4 Render request

```json
{
  "revision": 3,
  "compositionId": "MNNBroadcast16x9",
  "outputPreset": "youtube_1080p",
  "idempotencyKey": "episode-id-r3-youtube"
}
```

Response: HTTP 202 Accepted.

```json
{
  "jobId": "job-uuid",
  "episodeId": "episode-uuid",
  "revision": 3,
  "status": "QUEUED",
  "progress": 0
}
```

### 7.5 Approval request

```json
{
  "revision": 3,
  "videoChecksum": "sha256-value",
  "metadataChecksum": "sha256-value",
  "decision": "APPROVE",
  "publication": {
    "channelId": "connected-channel-id",
    "mode": "SCHEDULED",
    "scheduledAt": "2026-10-29T02:00:00Z"
  }
}
```

Reject if the requested revision is no longer current, checksums differ, evidence is unresolved, or the reviewer lacks permission.

### 7.6 YouTube APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/youtube/connect` | Start OAuth |
| GET | `/api/youtube/callback` | Finish OAuth |
| GET | `/api/youtube/channels` | Connected channels |
| DELETE | `/api/youtube/channels/:id` | Disconnect |
| POST | `/api/episodes/:id/publish` | Execute recorded approval |
| GET | `/api/episodes/:id/publication` | Upload/publish status |

Publication API responses must return actual YouTube IDs, persisted states and error reasons.

### 7.7 API error format

```json
{
  "error": {
    "code": "APPROVAL_REVISION_MISMATCH",
    "message": "The video changed after approval.",
    "retryable": false,
    "requestId": "request-uuid"
  }
}
```

Use HTTP 401 for missing authentication, 403 for denied access, 404 for missing resources, 409 for state conflicts, 422 for invalid requests, 429 for quota violations and 5xx for server failures.

---

### 7.8 Additional request/response examples and validation

**Create Gate-A episode** `POST /api/episodes/from-stories`:

```json
{"storyClusterIds":["cluster-a","cluster-b","cluster-c"],"format":"MNN_DAILY_NEWS","durationTargetSeconds":90,"language":"en","reviewRequired":true}
```

Return `201 {"episodeId":"...","revision":1,"status":"SELECTED"}`. Server must validate story ownership, evidence states, three unique event clusters for the Gate-A fixture and legal media permissions before automatic drafting. Normal production APIs must also allow one or two stories.

**Render** `POST /api/episodes/:id/render`: `202` with `jobId`, immutable `revision`, preset, and `QUEUED` status. If an identical idempotency key is replayed, return the same existing job, not a second render. `GET /api/jobs/:jobId/events` streams progress while `GET /api/jobs/:jobId` remains authoritative after browser disconnect.

**Approve** `POST /api/episodes/:id/approve`: validate `revision`, immutable `videoChecksum`, `metadataChecksum`, `channelId`, visibility and optional UTC `scheduledAt`, authorized Firebase reviewer, supporting claims and rights. Any stale or changed component produces `409 APPROVAL_REVISION_MISMATCH` or another explicit conflict. Approval records must be write-once with auditable principal and timestamp.

**Do not send** access tokens or binary media via browser-visible SSE or JSON. Provide signed/authorized object downloads. Continue accepting the old `/api/generate-show` JSON shape without changing old show-playback behavior.

## 8. Episode State Machine

### 8.1 Primary lifecycle

```text
DISCOVERED
    |
SELECTED
    |
VERIFYING
    |
VERIFIED
    |
SCRIPTING
    |
SCRIPT_READY
    |
GENERATING_AUDIO
    |
AUDIO_READY
    |
DIRECTING
    |
RENDER_QUEUED
    |
RENDERING
    |
VIDEO_READY
    |
AWAITING_APPROVAL
    |
APPROVED
    |
UPLOADING
    |
UPLOADED_PRIVATE
    |
  +-----------------+
  |                 |
SCHEDULED        PUBLISHED
  |
PUBLISHED
```

### 8.2 Exception states

- `NEEDS_FACT_REVIEW`
- `CHANGES_REQUESTED`
- `RENDER_FAILED`
- `UPLOAD_FAILED`
- `PUBLISH_FAILED`
- `CANCELLED`
- `ARCHIVED`

Every exception state must have defined recovery transitions.

`CHANGES_REQUESTED` creates a new editable revision. The previous approved or rendered revision remains available for audit.

### 8.3 Transition guards

- `VERIFIED` requires a completed evidence packet.
- `SCRIPT_READY` requires valid speaker-turn JSON.
- `AUDIO_READY` requires playable audio and measured durations.
- `RENDER_QUEUED` requires a valid video manifest.
- `VIDEO_READY` requires a verified MP4 file.
- `AWAITING_APPROVAL` requires completed media and fact review checks.
- `APPROVED` requires authenticated human approval.
- `UPLOADING` requires an approval matching the current revision.
- `PUBLISHED` requires YouTube confirmation.
- Publishing a different revision requires fresh approval.

---

### 8.4 State review and approval rules

- `VIDEO_READY` is not `APPROVED`; video completion never causes a publish transition.
- `APPROVED` may transition only to the exact authorized `UPLOADING` job. `UPLOADED_PRIVATE` is still not `PUBLISHED`.
- `SCHEDULED` requires an explicit future time and matching original approval. If publish time has elapsed by retry, **fail closed** and request new approval instead of silently publishing now.
- Re-editing script, audio, visuals, thumbnail, description, channel, visibility or schedule increments revision and invalidates existing approval; editing an archived episode must not overwrite its historic published artifact.
- `FAILED` states preserve retryable error codes and original media IDs. No hidden success state when optional cover art or lip-sync fails; optional assets may use explicitly flagged fallbacks.
- Only authorized users may cancel render and publication jobs. Cancelling after an external operation starts requires reconciliation with YouTube before reporting cancellation.

## 9. Background Jobs and Reliability

### Queue definitions

- `rss.poll`
- `rss.normalize`
- `news.cluster`
- `news.verify`
- `episode.script`
- `episode.tts`
- `episode.audio_mix`
- `episode.direct`
- `video.render`
- `video.quality_check`
- `youtube.upload`
- `youtube.publish`
- `media.cleanup`

### Job policies

- Every job must have a durable ID and status.
- Jobs should support resumable workflows where feasible.
- Idempotency must prevent repeated article insertion, duplicate renders and duplicate YouTube uploads.
- Use exponential backoff with bounded retries and jitter.
- Validation failures require correction, not automatic retries.
- Record stage duration, model cost, asset sizes and errors.
- Reserve maximum worker concurrency and memory.
- Generation and publishing budgets must have configurable ceilings.
- Cancellation must propagate through dependent jobs.
- API restart must not erase queued work.

The existing `DAILY_QUOTA_LIMIT` behavior stays supported while server-side quota accounting moves to durable storage for production.

---

### 9.1 Observability and cost accounting

Every job records: `runId`, episode/revision, stage, timestamp, attempts, model/provider, token use (if available), synthesized speech seconds, render CPU/GPU seconds, media byte size, GCS objects, outbound requests, monetary estimate and actual charge where provided. Track publication successes, queue latencies, failure rates and editorial flags without logging API keys or unredacted OAuth tokens.

**Budget safety:** enforce configurable RSS fetch limits, LLM/TTS caps, concurrent render limits, render maximum duration, per-owner daily quotas and per-job stop conditions. Development and production config must be distinct. The pre-existing local `quota_cache.json` may remain for legacy behavior but is not authoritative in distributed production.

## 10. Security, Licensing and Content Governance

### Security requirements

**SEC-001:** Authenticate and authorize all production-write endpoints.

**SEC-002:** Do not permit a failed authentication token to silently become a privileged shared user.

**SEC-003:** Harden `/api/download-proxy` against SSRF. Restrict allowed destinations, validate DNS/IP ranges and redirects, limit payload size, and block cloud metadata and internal services.

**SEC-004:** Apply equivalent network restrictions to RSS and article ingestion.

**SEC-005:** Treat RSS articles, page HTML and retrieved text as untrusted data, not executable agent instructions.

**SEC-006:** Protect OAuth tokens, API keys and storage credentials with server-side secret management.

**SEC-007:** Enforce ownership checks when retrieving videos, metadata and media objects.

**SEC-008:** Use safe file paths; reject traversal and malicious archive entries.

**SEC-009:** Isolate rendering workers from privileged cloud credentials whenever possible.

**SEC-010:** Log security-sensitive actions without exposing tokens, personal information or full secrets.

### Licensing requirements

- Review Remotion license eligibility for the actual organization and automated-video use case.
- Review media rights before selecting or generating footage.
- Use licensed, self-created or appropriately permitted audio and visual assets.
- Do not assume an open-source GitHub license covers separately distributed model weights, music, datasets or stock footage.
- Preserve publisher attributions where required.
- Document commercially restricted dependencies.

### Content requirements

- The program must identify itself as MNN.
- Synthetic speakers must not impersonate a real person without appropriate authorization.
- Clearly distinguish satirical fiction from factual news.
- Configure YouTube audience and synthetic-media disclosures correctly.
- Do not display artificial viewer counts as real statistics.
- The human approval screen must show unresolved editorial, copyright and factual risks.

---

### 10.1 FeedForward-specific reuse constraints

The FeedForward repo README states **personal/educational use**; its examined tree contained no top-level LICENSE file. Do not copy `src/video_generator.py`, `src/scraper.py`, graphics, its reporter image or packaged fonts into MNN without independently confirming reuse rights. `edge-tts` use may introduce separate dependencies and service restrictions and is **not** required here. SadTalker is an optional research candidate only; its short-loop approach is specifically rejected for accurate video lip-sync. Recreate generic layout concepts (story card, Ken Burns, ticker) using MNN-owned artwork and properly licensed libraries/assets. The exact Remotion licensing category must be verified for the user's organization and deployment pattern before commercial production.

## 11. User Interface Specification

### Screen A — News Radar

Display ranked story cards with headline, publisher, publication time, topic, number of independent sources, score, fact-check state and production status.

Actions: Select, Inspect, Skip, Produce.

### Screen B — RSS Feed Manager

Table of configured feeds with validation, polling controls, categories, weights, language and health status.

Actions: Add, Edit, Disable, Delete, Poll Now.

### Screen C — Episode Workspace

Display research, outline, script, voice settings, scene timeline and generation progress.

Actions: Edit, Regenerate Section, Generate Audio, Render.

### Screen D — Broadcast Studio

Maintain the current MNN player. Add a Remotion-backed preview mode with consistent 16:9 composition and scene rendering.

Modes: Audio, Video Preview, Final MP4, Transcript.

### Screen E — Review Queue

Prioritize episodes awaiting human action. Show complete evidence packet, final video, disclosures, rights status and YouTube metadata.

Actions: Request Changes, Reject, Approve & Publish, Approve & Schedule.

### Screen F — YouTube Dashboard

Show connected channel, pending uploads, scheduled videos, publication status, YouTube links and failed jobs.

### Screen G — Operations

Show queued/running/failed jobs, API usage, generation costs, storage, worker health and approval history.

---

### 11.1 First release page behavior and user journey

1. **News Radar**: show ranked, source-attributed candidates with timestamps, evidence completeness, deduped cluster count and “Select for Video” controls. Permit three unique stories for Gate A.
2. **Feed Manager**: URL validation/preview, enabled state, category, poll interval, priority, last health status, manual refresh.
3. **Episode Workspace**: input summary, structured script, segment timing, editor actions, fact citations, TTS progress and source-quality warnings.
4. **Broadcast Studio**: preserve legacy Audio/Transcript. Add `Video Preview` and `Final MP4` modes based on deterministic Remotion props. Preview must reflect the same immutable revision that will render.
5. **Review Queue**: MP4 playback, evidence exceptions, asset rights, script + caption correction, video checksum, title, description, thumbnail, channel, exact approval state.
6. **YouTube Dashboard**: connect/disconnect channel, private uploads, approved schedule, upload/session state, errors and actual video links.
7. **Operations**: durable jobs, clear errors, retry/cancel affordances, model/render/storage cost, and fail-safe controls.

**No dead buttons**: every advertised action must work or be visibly disabled with a reason. The new UI shall not fake a live broadcast audience or turn a disabled reviewer control into a silent success.

## 12. Implementation File Plan

### Existing files to modify carefully

```text
src/App.tsx
src/types.ts
src/data.ts
src/lib/clientDb.ts
server.ts
server/lib/agentClient.ts
agent/AGENTS.md
agent/skills/script-writing/
agent/skills/tts-generation/
agent/skills/metadata-generation/
package.json
.env.example
```

### New proposed directories

```text
src/
  features/
    rss/
    radar/
    episodes/
    review/
    youtube/
  components/
    broadcast/
      BroadcastStage.tsx
      PixelMarcus.tsx
      NewsTicker.tsx
      NewsLowerThird.tsx
      TranscriptCaptions.tsx

server/
  routes/
    rss.ts
    stories.ts
    episodes.ts
    approvals.ts
    jobs.ts
    youtube.ts
  services/
    rss/
    dedup/
    evidence/
    director/
    media/
    publishing/
  workers/
    ingest.worker.ts
    episode.worker.ts
    render.worker.ts
    publish.worker.ts
  db/
    prisma/
    migrations/
  lib/
    auth.ts
    audit.ts
    queues.ts
    objectStorage.ts
    idempotency.ts

video/
  index.ts
  Root.tsx
  compositions/
    MNNBroadcast16x9.tsx
    MNNShorts9x16.tsx
    MNNThumbnail.tsx
  components/
    AnchorScene.tsx
    NewsCard.tsx
    CorrespondentScene.tsx
    Captions.tsx
    BroadcastTicker.tsx
  contracts/
    VideoManifestV1.ts
  utils/
    timeline.ts
    assetResolver.ts

tests/
  unit/
  integration/
  rendering/
  e2e/
  fixtures/
```

### Architectural requirement

Avoid further expanding the existing large `src/App.tsx` and `server.ts` files.

Extract modules behind stable interfaces and preserve existing behavior.

---

### 12.1 New file responsibilities / interface inventory

| Module | Export/contract | Integration check |
|---|---|---|
| `server/services/rss/FeedPoller.ts` | `pollFeed(feedId): PollResult` | Authenticated scheduler, safe fetch, durable upserts |
| `server/services/dedup/StoryClusterer.ts` | `upsertCluster(item): StoryCluster` | Stable canonical URL + event evidence |
| `server/services/evidence/EvidenceCompiler.ts` | `compileEvidence(clusterIds): EvidencePacket` | Material-claim guard |
| `server/services/director/VideoDirector.ts` | `compileVideo(script, timeline): VideoManifestV1` | Validated frame/time mapping |
| `video/contracts/VideoManifestV1.ts` | Typed schema + runtime validator | No invalid duration or unresolved assets |
| `server/workers/render.worker.ts` | queued render and media probe | Filesystem/container isolation, job recovery |
| `server/services/publishing/YouTubePublisher.ts` | private upload + reconcile + publish | Approval checksum guard |
| `src/features/review/` | approval and edit UI | Revision-aware, fact and rights visibility |

Implement equivalent modules even if final names differ, but retain the endpoint and manifest contracts in this PRD.

## 13. Environment Configuration

Add configuration entries to `.env.example`, documenting all production requirements without committing secrets.

```dotenv
MNN_VIDEO_ENABLED=false
MNN_RSS_ENABLED=false
MNN_YOUTUBE_ENABLED=false
MNN_AUTO_PUBLISH=false

DATABASE_URL=
REDIS_URL=
GCS_BUCKET_NAME=

RSS_DEFAULT_INTERVAL_MINUTES=30
MNN_FIRST_VIDEO_DURATION_TARGET_SECONDS=90
MNN_FIRST_VIDEO_STORY_COUNT=3
RSS_MAX_BYTES=2097152
RSS_TIMEOUT_MS=10000

RENDER_MAX_CONCURRENCY=1
RENDER_MAX_DURATION_SECONDS=900
RENDER_MAX_ATTEMPTS=2
RENDER_OUTPUT_PRESET=youtube_1080p
MNN_VIDEO_RENDERER=remotion
MNN_REVIEW_REQUIRED=true

YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=
YOUTUBE_TOKEN_ENCRYPTION_KEY_REF=

DAILY_QUOTA_LIMIT=3
GEMINI_API_KEY=
```

The application must fail closed if production database, queue, authentication or encryption configuration is missing.

`MNN_AUTO_PUBLISH=false` is a hard requirement for supervised mode.

---

## 14. Acceptance Tests

### 14.1 RSS and clustering

| Test ID | Scenario | Pass condition |
|---|---|---|
| RSS-01 | Add valid feed | Stored and visible |
| RSS-02 | Fetch new items | Unique records created |
| RSS-03 | Repeat same poll | No duplicates |
| RSS-04 | Same story from two sources | Correct cluster with both sources |
| RSS-05 | Invalid XML | Controlled failure |
| RSS-06 | Private-network feed URL | Request blocked |
| RSS-07 | Source returns 304 | No unnecessary records |
| RSS-08 | Feed disabled | No scheduled fetching |

### 14.2 Editorial and audio

| Test ID | Scenario | Pass condition |
|---|---|---|
| EDIT-01 | Supported claim | Evidence linked |
| EDIT-02 | Unsupported material claim | Cannot pass approval |
| EDIT-03 | Contradictory evidence | Escalated for review |
| EDIT-04 | Satirical dialogue | Clearly marked as fiction |
| AUD-01 | Multi-speaker output | Correct voices in order |
| AUD-02 | Timestamp manifest | Matches measured audio |
| AUD-03 | Missing TTS segment | No false success |
| AUD-04 | Script revision | Affected assets invalidated |

### 14.3 Rendering

| Test ID | Scenario | Pass condition |
|---|---|---|
| VID-01 | **Gate A:** render 90-second, three-RSS-story script | Valid standalone playable MP4 |
| VID-01B | **Gate B:** render 3–5-minute episode | Valid standalone MP4 |
| VID-02 | Inspect video streams | 1920×1080, 30 FPS, H.264 |
| VID-02A | Check AAC stream and file outside browser | Audible, synchronized independent playback |
| VID-03 | Inspect audio | AAC, audible and synchronized |
| VID-04 | Validate captions | Correct speaker and timestamps from measured audio, target ≤150 ms error in fixtures |
| VID-05 | Scene transitions | All three headlines displayed, no unintended missing intervals |
| VID-06 | Missing asset | Controlled failure and diagnostics |
| VID-07 | Repeat identical render request | No duplicate job |
| VID-08 | Cancel rendering | Worker stops and releases resources |
| VID-09 | Render with fixed manifest | Reproducible visual timeline |
| VID-10 | Download | Correct MP4 and SRT files |

### 14.4 Approval and YouTube

| Test ID | Scenario | Pass condition |
|---|---|---|
| REV-01 | Unapproved episode | Cannot publish |
| REV-02 | Wrong reviewer | Access denied |
| REV-03 | Approval after script modification | Approval invalidated |
| REV-04 | Metadata edited after approval | Re-approval required |
| YT-01 | Connect channel | Secure OAuth completed |
| YT-02 | Upload approved video | Correct YouTube video ID stored |
| YT-03 | Upload interrupted | Resumes or reconciles safely |
| YT-04 | Schedule private video | Correct approved future publish time; reject past times |
| YT-05 | Invalid OAuth credentials | No publication |
| YT-06 | Upload request retried | No duplicate public video |
| YT-07 | Thumbnail upload fails | Episode remains private, error surfaced |
| YT-08 | YouTube API project publishing restrictions | Surface clear blocked/verification state, no invented public success |

### 14.5 Regression

| Test ID | Scenario | Pass condition |
|---|---|---|
| REG-01 | Legacy topic generation | Existing `/api/generate-show` works |
| REG-02 | Existing podcast player | Plays audio |
| REG-03 | Saved show history | Remains accessible |
| REG-04 | Existing share URL | Resolves |
| REG-05 | Firebase login/logout | Works |
| REG-06 | Video feature disabled | Old UX remains usable |
| REG-07 | Existing download ZIP | Unchanged output supported |
| REG-08 | API server starts | Health endpoint returns OK |

### 14.6 End-to-end golden paths — independent acceptance gates

**Gate A — First real video (must complete before YouTube integration):**

**Input:** Three distinct, evidence-backed AI/technology RSS story clusters (real feeds or a saved deterministic fixture when testing).

1. Load sources and confirm they are not duplicate event clusters.
2. Generate one MNN original ~90-second script (intro, three stories, recap, outro) with claim IDs.
3. Synthesize Pixel Marcus narration; measure every speaker turn and create a shared speech timeline.
4. Compile a deterministic video manifest and original MNN newsroom visuals (anchor, three different headlines, ticker, captions).
5. Render via Remotion to 1920×1080, 30 FPS, H.264/AAC MP4.
6. Verify media streams, audio duration, caption/scene timing, and genuine frame changes with media probes; save QA report.
7. Download and play the exported MP4 **outside** the browser, not just in MNN's React preview.
8. Preserve the original podcast flow and existing share links.

**Pass:** `VID-01`, `VID-02`, `VID-02A`, `VID-03`–`VID-10` applicable to Gate A, all critical safety tests, and essential legacy regressions pass. This gate does not require Google/YouTube credentials.

**Gate B — Repeatable editorial production:** RSS scheduler works, source deduplication and evidence review are durable, 3–5-minute MP4s render reliably from multiple stories, and completed assets enter `AWAITING_APPROVAL` with revision-specific evidence and rights reports.

**Gate C — Fully supervised YouTube end-to-end:**

1. User previews and explicitly approves a verified immutable MP4 + exact title/description/thumbnail/channel/visibility/time.
2. Upload worker begins with private visibility, stores video ID and resumes/reconciles without duplicates.
3. Apply only the authorized immediate-publication or future schedule request, respecting YouTube API constraints.
4. Store the real YouTube URL and returned status, review decision, checksums and audit event.
5. Independently verify playback under the approved visibility and re-run regressions.

**Pass:** all `REV-*`, `YT-*`, `REG-*` and security checks; five consecutive end-to-end productions before declaring production release; at least one approved real-channel YouTube integration test, if credentials and platform verification allow. Never mark a blocked upload as published.

---

## 15. Phased Implementation Plan — One Implementation Run

Use a dedicated `feature/mnn-rss-video-patch-001` branch, **never** implement v1.0 and v1.1 as separate passes. Each phase has a measurable exit gate, persists tests/logs, and must not break existing MNN functionality.

### Phase 0 — Legacy baseline, security, and foundations

**Scope:** clone/inspect actual repository, `npm ci`, typecheck/build/tests, identify reproducible issues, add feature flags, harden `/api/download-proxy`, production auth fail-closed, establish database migrations and Redis/BullMQ queue skeleton with local/test alternatives.

**Exit:** legacy `/api/generate-show`, player, sharing and Firebase behaviors retain documented function (or blockers are explicitly identified); regression fixtures and feature flags run; no production writes performed on `main`.

### Phase 1 — Feed manager and RSS radar

**Scope:** editable RSS feeds, safe fetching, 30-minute scheduler, conditional fetches, normalized article metadata, durable URL+event deduplication, ranked story cards, verified source URLs, source error reporting.

**Exit:** select three unique AI/technology story clusters from seed RSS fixtures and/or live, validated feeds; repeated polls create no duplicate events.

### Phase 2 — Editorial verification, script, audio timeline

**Scope:** evidence packet, claim verdicts and human review flags; MNN original 90-second 3-story script; preserve existing Gemini agent/TTS/music; accurately probe each speech segment, build turn-level timings and caption track.

**Exit:** source-backed `script.json` + preserved `script.md`, master audio and valid `SpeechTimelineV1`; caption timing passes measured-fixture tolerances.

### Phase 3 — Pixel Marcus director and MP4 factory (**Gate A**)

**Scope:** independent video-compatible MNN studio components, Pixel Marcus speaking/idle sprite states, three dynamic news scenes, lower-thirds/ticker, Remotion `MNNBroadcast16x9`, render worker, probe and export package.

**Exit:** a **real ~90-second 1920×1080/30 FPS MP4** plays independently, speech and subtitles are synchronized, graphics visibly change, and `VID-*` Gate-A tests pass. This is the first major milestone; do not call a web preview or audio ZIP a successful render.

### Phase 4 — Human Review Studio and revisions (**Gate B part 1**)

**Scope:** video playback, evidence/rights checks, transcript/timing correction, metadata edit, review queue, `APPROVED` state, immutable asset and approval checksums. Extend production to repeatable 3–5-minute episodes.

**Exit:** reviewer can reject/request changes/approve exact revision and approvals invalidate on edits; 3–5-minute episode passes QA.

### Phase 5 — Private-first YouTube integration (**Gate C**)

**Scope:** secure OAuth and channel binding, private-first resumable upload, thumbnail, safe scheduler, synthetic-media/audience designation, explicit approval-bound public/scheduled transition, actual video ID and reconciliation.

**Exit:** one approved channel/video workflow tested end to end; no unapproved publish, duplicate upload or past-time accidental publication; platform restrictions surfaced rather than bypassed.

### Phase 6 — Production hardening

**Scope:** logs, automated retries, cost tracking, resilience, failure recovery, media-rights audit, capacity, regression, source reliability and operator controls.

**Exit:** five consecutive successful supervised productions and all critical test groups pass; legacy MNN user journeys remain intact and rollback feature flags work.

### Time-to-value and priority policy

**Priority 1:** build the 90-second standalone video proof in Phase 3; **Priority 2:** make it reliable and reviewable; **Priority 3:** integrate YouTube. Foundational safety and actual RSS fixture ingestion are prerequisites, not excuses to create unrelated features. If credentials or infrastructure are missing, use clearly labeled local test adapters and report blockers; **never claim a real external integration succeeded without running it**.

---

## 16. Initial Operating Targets

These are acceptance targets, not claims about current MNN performance.

| Metric | Target |
|---|---|
| RSS poll interval | 30 minutes by default |
| Duplicate ingestion rate | 0 exact duplicates |
| **Gate A first episode** | **Three RSS stories; ~90 seconds** |
| **Gate B standard episode** | **3–5 minutes** |
| MP4 profile | 1080p / 30 FPS |
| Narration synchronization | ≤150 ms timing deviation at speaker boundaries |
| Render completion | ≥95% for valid supported manifests in controlled testing |
| Approval coverage | 100% of public/scheduled releases |
| Unauthorized publication incidents | 0 |
| Duplicate YouTube publications | 0 |
| Completed **Gate A** golden-path videos | 1 validated, independently playable 90-second MP4 |
| Completed **Gate C** supervised episodes | At least 5 before production release |

Generation cost must be measured by stage instead of assuming a fixed cost per minute.

Track LLM tokens, TTS usage, music generation, image generation, rendering compute, storage and YouTube API requests separately.

---

## 17. Development Workflow and Release Discipline

### Branch strategy

Create an isolated branch such as:

`feature/mnn-rss-video-patch-001`

Do not patch production `main` directly.

### Required pre-merge commands

```bash
npm ci
npm run lint
npm run build
```

Add automated commands:

```bash
npm run test
npm run test:integration
npm run test:render
npm run test:e2e
```

The newly added commands must actually execute test suites rather than return placeholder success.

### Release sequencing

1. Implement behind feature flags.
2. Test legacy flows before adding production traffic.
3. Deploy RSS and editorial modules first.
4. Enable rendering for development accounts only.
5. Verify MP4 output with fixture audio and a real generated show.
6. Enable supervised YouTube publishing after OAuth and safety testing.
7. Roll out to production.
8. Keep independent kill switches for ingestion, generation, rendering and publishing.

Rollback must disable the new modules without requiring deletion of approved records or stored media.

---

### 17.1 Explicit development commands, verification, and handoff

The initial repository's `npm run lint` is a TypeScript check (`tsc --noEmit`); do not represent it as a full linter unless additional rules are added. Run initial `npm ci && npm run lint && npm run build`, then add real (non-placeholder) test scripts and smoke checks. Ensure any Python agent-script tests are executed in an isolated environment with pinned/reviewed dependencies. Render integration tests should use fixture audio to avoid billing and require ffprobe for objective validation.

After **each phase**, deliver a concise implementation report: branch and latest SHA; files changed; actual commands and exit codes; passing/failing acceptance IDs; screenshot or manifest of UI changes if relevant; actual media path, duration, codec and ffprobe summary when video exists; cost/credential blockers; next phase and safe rollback plan. Do not say “fully working” if a critical test was skipped or if external publication was not verified.

## 18. Definition of Done

Patch 001 is considered complete only when:

- The existing MNN podcast application still works.
- RSS feeds automatically provide story candidates.
- Duplicate stories are clustered correctly.
- Each selected news item has an inspectable evidence record.
- Pixel Marcus receives an editable script and synthesized voice.
- Actual video scenes change over time.
- Narration and subtitles remain synchronized.
- The renderer exports a **real, independently playable** MP4 from three RSS stories at Gate A and 3–5 minutes at Gate B.
- A complete human approval record exists for every published episode.
- YouTube publishing and scheduling work reliably.
- Failures do not silently result in public content.
- Gate A, Gate B and Gate C golden-path tests plus legacy regressions pass at their corresponding release gates.
- The system has a basic operations dashboard and cost tracking.
- Operational documentation and environment setup instructions are complete.

**Final release goal:** MNN can discover a story from RSS, automatically produce a verified, original Pixel Marcus television-style YouTube video, and publish it only after the authorized human approves the final video and its publication settings.

---

## 19. Future Patches (Out of Scope)

**Patch 002 — MNN Autonomous Shorts Factory:** Automatically extract and reframe long episodes into 9:16 Shorts, with human approval.

**Patch 003 — Multi-Show Network:** Distinct recurring MNN personalities, program slots, channel topics and multilingual production.

**Patch 004 — MNN Live TV:** 24/7 scheduled broadcast playout, OBS/FFmpeg streaming, fallback media, uptime monitoring and real YouTube Live status.

**Patch 005 — Audience Intelligence:** Use actual YouTube analytics, retention, click-through and audience feedback to improve future editorial and production decisions, without distorting factual reporting.

---

## Appendix A — Source provenance and external verification references

**Source-derived repository facts (reviewed 27–28 October 2026):**

- MNN main branch: `https://github.com/marcuz7/MNN`, snapshot `6936be429b4eb20ced1e2f946b91b1abf2b5a897`; inspected `src/App.tsx`, `server.ts`, `src/types.ts`, MNN agent skills, the mock show, metadata, scripts and TTS code.
- FeedForward reference: `https://github.com/mugunthank7/FeedForward-Ai-news`, tree `a916d795865d1c6a4d0d69923494cb05830b7e3c`; inspected README, `run.py`, feed config, scraper, extractor, summarizer, video generator and lip-sync script. Its stated macOS timing estimates were **not** experimentally reproduced and are not MNN performance commitments.

**Implementation reference documentation (check version on actual development day):**

- Remotion `calculateMetadata`: https://www.remotiondocs.com/docs/calculate-metadata
- Remotion recommended audio component: https://www.remotion.dev/docs/media/audio
- YouTube Data API videos resource, `privacyStatus` and `publishAt`: https://developers.google.com/youtube/data/reference/rest/v3/videos
- YouTube videos.insert, `status.containsSyntheticMedia` and explicit private uploads: https://developers.google.com/youtube/data/reference/rest/v3/videos/insert
- YouTube thumbnail API and OAuth documentation must be reviewed at integration time.

Do not treat this PRD as proof that any repository has been cloned, run, patched or successfully rendered. All new functions are requested design contracts until tests demonstrate their behavior.

## 20. Exact Implementation Order and Coding Agent Handoff

**Execution order (single Patch 001 implementation, with gates):**

1. Clone/inspect `marcuz7/MNN` at latest branch state; compare to baseline and verify clean build. Create `feature/mnn-rss-video-patch-001` without mutating `main`.
2. Identify and fix critical SSRF/authentication flaws without regressions; add safe feature flags.
3. Add minimal durable SQL migrations and job infrastructure with reliable tests and fallback local fixtures.
4. Build live/safe RSS ingestion, URL normalization, distinct article/event deduplication, feed management and News Radar.
5. Compile source-backed evidence and a structured three-story, 90-second MNN script while preserving `script.md`.
6. Use Gemini TTS to create measured `SpeechTimelineV1`, speaker turns and reliable captions; preserve MP3 podcast playback.
7. Validate canonical `VideoManifestV1` (screen, audio, scenes, start/end, media rights, asset IDs).
8. Build original Pixel Marcus assets/animation and deterministic MNN broadcast scenes with Remotion.
9. Create isolated rendering, media probes, MP4/SRT/thumbnail exports and downloadable artifact revision.
10. **Stop for Gate A verification:** render and independently play one 90-second, three-story 1080p MP4. Report actual ffprobe output, timing QA and screenshots/sample frames.
11. Add complete evidence-aware review UI and immutable revision approvals; validate standard 3–5-minute episodes (Gate B).
12. Add secure channel-bound OAuth, private-first YouTube upload, scheduling and reconciliation; conduct approved real-channel publishing test (Gate C).
13. Add operational metrics, repeatability/rollback, full regression and five consecutive supervised productions.
14. Report SHA, files changed, commands, passing/failing test IDs, outputs and unresolved blockers at each gate.

### 20.1 Copy-and-paste execution prompt

> **Implement `MNN_MASTER_PRD_PATCH_001_v1.2.md` in `https://github.com/marcuz7/MNN` on a dedicated feature branch. This single file supersedes Patch 001 v1.0 and v1.1—do NOT execute either older document separately. Read all sections before coding. Preserve current Gemini agent, podcast player, Firebase authentication, sharing, GCS and IndexedDB history. Fix critical security gaps first. Use FeedForward only as a reference unless the repository owner provides a compatible source-code license. Use Remotion + FFmpeg for video, and actual TTS segment measurements for subtitle/scene timing. Implement phases 0–6 with acceptance tests. The first mandatory video milestone is three verified RSS headlines becoming a ~90-second Pixel Marcus 1080p H.264/AAC standalone MP4. Only then proceed to 3–5-minute repeatable episodes, approvals and private-first YouTube integration. All public/scheduled uploads require explicit approval tied to the immutable video/metadata/channel/schedule revision. After each phase, provide source commit, modified files, commands/results, objective QA and blockers. Never report success without tests or a real playable MP4. Do not modify `main` until a reviewed merge.**

### 20.2 Completion evidence checklist

- [ ] Baseline commit and build test captured, no legacy regression.
- [ ] Feed manager and story dedup tests pass.
- [ ] Source claims/evidence packet is inspectable.
- [ ] Actual TTS turn timings and SRT verified.
- [ ] Gate A 90-second animated 1080p H.264/AAC MP4 exported and played outside the app.
- [ ] Gate B 3–5-minute episodes, revision checks, and review workflows pass.
- [ ] Gate C approval-gated private-first upload and explicit schedule/publication verified on real YouTube account (when credentials available).
- [ ] Retry/idempotency/SSRF/OAuth/content-rights tests pass.
- [ ] Five consecutive supervised productions complete; costs, errors and audit events recorded.

**Closing rule:** Patch 001 v1.2 is not implemented by writing this PRD. Implementation begins only when a coding agent checks out the repository and starts Phase 0; milestones pass only on independently measured results.
