# MNN STEPPS NEWS CONTENT ENGINE

**PRD Patch v1.0**  
**Status**: Canonical Standard  
**Product**: Marcus News Network (MNN)  
**File**: `docs/MNN_STEPPS_ENGINE_PATCH.md`  
**Purpose**: Turn verified news stories into stronger, more shareable editorial angles without altering facts.

---

## 1. CORE PRODUCT LAW

**MNN STEPPS must never optimize facts.**

It may optimize:
- angle
- hook
- structure
- storytelling
- usefulness
- memorability
- shareability

It may not alter:
- verified facts
- dates
- numbers
- quotes
- attribution
- source provenance
- uncertainty

### Canonical Rule:
> **FACTS ARE IMMUTABLE. PRESENTATION IS OPTIMIZABLE.**

---

## 2. POSITION IN MNN

Correct pipeline:

```
RSS / Sources
  │
  ▼
Deduplicate
  │
  ▼
Story Cluster
  │
  ▼
Fact Verification
  │
  ▼
VerifiedStory
  │
  ▼
Editorial Angle
  │
  ▼
STEPPS Engine
  │
  ▼
ContentMaster
  │
  ▼
Pixel Marcus Director
  │
  ▼
Script / VideoPlan
  │
  ▼
Render
  │
  ▼
QC
  │
  ▼
Publish
  │
  ▼
Learn
```

**STEPPS must not run before verification.**

---

## 3. INPUT OBJECT

```typescript
interface VerifiedStory {
  id: string;
  headline: string;
  summary: string;
  facts: VerifiedFact[];
  sources: SourceReference[];
  confidence: number;
  disputedClaims?: string[];
  unknowns?: string[];
  publishedAt?: string;
  topic: string;
  entities: string[];
  provenance: ProvenanceRecord[];
}
```

---

## 4. VERIFIED FACT

```typescript
interface VerifiedFact {
  id: string;
  statement: string;
  sourceIds: string[];
  confidence: number;
  status:
    | "VERIFIED"
    | "PARTIALLY_VERIFIED"
    | "DISPUTED"
    | "UNCONFIRMED";
}
```

- Only **`VERIFIED`** facts may be asserted as fact.
- Other statuses must retain uncertainty language.

---

## 5. STEPPS FOR NEWS

MNN uses:
- **S** — Social Currency
- **T** — Triggers
- **E** — Emotion
- **P** — Public
- **P** — Practical Value
- **S** — Stories

Each dimension is strictly constrained by editorial truth.

---

## 6. SOCIAL CURRENCY

**Goal**: Help the audience understand something important before others do.

- **Good patterns**:
  - what smart founders should notice
  - what investors are missing
  - the second-order effect
  - why this matters
  - the hidden implication

- **Bad patterns**:
  - fake insider information
  - unsupported exclusivity
  - invented secret knowledge

*Example*:
> "What founders should notice about this AI launch isn't the feature. It's the change in workflow economics."

---

## 7. TRIGGERS

Connect the story to recurring industry events.

*Examples*:
- "Every time another AI agent launches..."
- "Every time a startup announces a huge funding round..."
- "Next time your team evaluates another SaaS subscription..."

The trigger must arise naturally from the verified story.

---

## 8. EMOTION

- **Allowed**: curiosity, awe, surprise, urgency, concern, excitement, hope.
- **Constraints**:
  - no manufactured fear
  - no fabricated outrage
  - no unsupported catastrophe framing
  - no sensationalizing uncertainty as certainty

---

## 9. PUBLIC

Make the implications observable.

*Examples*:
- Watch how competitors respond.
- Look at what companies start removing from their stack.
- Compare product pricing before and after this change.
- Track who adopts the new capability.

Useful for: challenges, benchmarks, before/after comparisons, public market observations, and visible behavior changes.

---

## 10. PRACTICAL VALUE

For MNN, this is heavily weighted. Transform news into:
- what this means
- what to watch
- what founders should do
- what investors should ask
- what operators should change
- 3 implications
- 5 actions
- decision checklist

*Example*:
> "Three things founders should check after this announcement:
> 1. Which workflow is now cheaper?
> 2. Which SaaS category becomes vulnerable?
> 3. What scarce capability becomes more valuable?"

---

## 11. STORIES

Convert raw news into narrative without inventing events.

**Allowed Structure**:
```
Before ──► What changed ──► Why it matters ──► Who is affected ──► What happens next
```

*Example*:
> "Two years ago, AI mostly answered questions. Then it started writing code. Now the competition is shifting toward systems that can complete the work itself."

The story provides context; it may never fabricate scenes, dialogue, motivations, or outcomes.

---

## 12. STEPPS DIAGNOSIS

For every `VerifiedStory`:

```typescript
interface NewsSTEPPSDiagnosis {
  storyId: string;
  socialCurrency: number;
  triggers: number;
  emotion: number;
  public: number;
  practicalValue: number;
  stories: number;
  recommendedPrimary: STEPPSDimension;
  recommendedSecondary?: STEPPSDimension;
  rationale: string[];
}
```

Scores represent editorial fit, not viral probability.

---

## 13. STORY TYPE ROUTING

| Story Class | Weighted Dimensions |
|---|---|
| **BREAKING NEWS** | Practical Value, Triggers, Emotion |
| **FUNDING / DEALS** | Social Currency, Practical Value, Stories |
| **PRODUCT LAUNCH** | Practical Value, Social Currency, Public |
| **POLICY / REGULATION** | Practical Value, Stories, Triggers |
| **MARKET SHIFT** | Stories, Social Currency, Practical Value |
| **HUMAN / FOUNDER STORY** | Stories, Emotion, Social Currency |

---

## 14. AUDIENCE ROUTING

- **For founders**: *What should I do?*
- **For investors**: *What changes valuation or market structure?*
- **For operators**: *What workflow changes?*
- **For general audience**: *Why should I care?*

---

## 15. EDITORIAL ANGLE OBJECT

```typescript
interface EditorialAngle {
  id: string;
  storyId: string;
  audience: string;
  primaryQuestion: string;
  thesis: string;
  steppsStrategy: {
    primary: STEPPSDimension;
    secondary?: STEPPSDimension;
  };
  factIds: string[];
  unsupportedClaims: string[];
}
```

`unsupportedClaims` must be empty (`[]`) before production.

---

## 16. GENERATION MODES

- **A. HEADLINE**: Stronger, factual headline options.
- **B. SHORT SCRIPT**: 30–90 second broadcast script.
- **C. DEEP EXPLAINER**: Longer editorial breakdown.
- **D. MULTI-FORMAT**: YouTube video, YouTube Short, LinkedIn post, X thread, Carousel.

---

## 17. DEFAULT GENERATION

For each important story:
1. Practical Value angle
2. Social Currency angle
3. Story angle

Choose based on audience + channel.

---

## 18. CONTENT MASTER

```typescript
interface MNNContentMaster {
  id: string;
  storyId: string;
  editorialAngleId: string;
  headline: string;
  hook: string;
  thesis: string;
  verifiedFactIds: string[];
  context: string[];
  implications: string[];
  whatToWatch?: string[];
  CTA?: string;
  steppsDimensions: STEPPSDimension[];
}
```

---

## 19. HOOK GENERATOR

Allowed hook types:
- `WHY THIS MATTERS`
- `WHAT CHANGED`
- `MOST PEOPLE MISSED THIS`
- `3 THINGS TO KNOW`
- `THE BIGGER STORY`
- `WATCH THIS NEXT`
- `SECOND-ORDER EFFECT`

---

## 20. CLAIM LOCK

Once facts are verified:
```
VerifiedFact ──► ClaimLock
```

Downstream models receive immutable fact references. They may rephrase, summarize, reorder, and explain, but they may **not** change meaning, increase certainty, or invent causality, numbers, or quotes.

---

## 21. UNCERTAINTY PRESERVATION

If a fact is uncertain (`UNCONFIRMED`), output must preserve language such as *reported*, *appears*, *according to*, or *has not yet been independently confirmed*. STEPPS cannot upgrade uncertainty into certainty.

---

## 22. PIXEL MARCUS HANDOFF

```
ContentMaster ──► Pixel Marcus
```
Pixel Marcus owns presentation, visual direction, scene grammar, shot choices, B-roll, graphics, and timing. STEPPS owns the editorial transmission strategy.

---

## 23. VIDEO SCRIPT CONTRACT

```typescript
interface MNNScript {
  id: string;
  contentMasterId: string;
  hook: string;
  beats: ScriptBeat[];
  outro: string;
  verifiedFactIds: string[];
  estimatedDurationSeconds: number;
}
```

Recommended beat structure:
```
HOOK ──► FACT ──► CONTEXT ──► IMPLICATION ──► WHAT TO WATCH ──► CTA
```

---

## 24. QC — FACTUAL & EDITORIAL

- **Fact QC**: Every asserted claim, number, date, and quote maps to source. Uncertainty is preserved. Failure triggers `FACT_QC_FAIL` and blocks publication.
- **Sensationalism Guard**: Rejects or rewrites phrases like *"This changes everything"*, *"This will destroy..."*, *"The industry is dead"*, *"Nobody saw this coming"*.

---

## 25. FROZEN RULES

1. **VERIFY FIRST. STEPPS SECOND.**
2. **FACTS ARE IMMUTABLE. ANGLES ARE OPTIMIZABLE.**
3. **NEVER INCREASE CERTAINTY BEYOND THE SOURCES.**
4. **NO FABRICATED QUOTES, NUMBERS, EVENTS OR MOTIVES.**
5. **STEPPS IMPROVES TRANSMISSION, NOT TRUTH.**
6. **CORRECTION OVERRIDES VIRALITY.**
7. **ONE VERIFIED STORY CAN PRODUCE MANY FORMATS.**
8. **PIXEL MARCUS DIRECTS THE VIDEO; STEPPS DIRECTS THE MESSAGE.**
9. **MNN LEARNS ONLY FROM REAL PERFORMANCE DATA.**
