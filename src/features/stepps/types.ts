export type STEPPSDimension =
  | 'SOCIAL_CURRENCY'
  | 'TRIGGERS'
  | 'EMOTION'
  | 'PUBLIC'
  | 'PRACTICAL_VALUE'
  | 'STORIES';

export type FactStatus =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'DISPUTED'
  | 'UNCONFIRMED';

export type AudienceType =
  | 'founders'
  | 'investors'
  | 'operators'
  | 'general';

export type StoryClass =
  | 'BREAKING_NEWS'
  | 'FUNDING_DEALS'
  | 'PRODUCT_LAUNCH'
  | 'POLICY_REGULATION'
  | 'MARKET_SHIFT'
  | 'FOUNDER_STORY';

export interface SourceReference {
  id: string;
  title: string;
  url: string;
  publisher: string;
  publishedAt: string;
  credibilityScore: number;
}

export interface ProvenanceRecord {
  timestamp: string;
  feedUrl: string;
  hash: string;
  verificationAgent: string;
}

export interface VerifiedFact {
  id: string;
  statement: string;
  sourceIds: string[];
  confidence: number;
  status: FactStatus;
}

export interface VerifiedStory {
  id: string;
  headline: string;
  summary: string;
  storyClass: StoryClass;
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

export interface NewsSTEPPSDiagnosis {
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

export interface EditorialAngle {
  id: string;
  storyId: string;
  audience: AudienceType;
  angleType: 'PRACTICAL_VALUE' | 'SOCIAL_CURRENCY' | 'STORY';
  title: string;
  primaryQuestion: string;
  thesis: string;
  steppsStrategy: {
    primary: STEPPSDimension;
    secondary?: STEPPSDimension;
  };
  factIds: string[];
  unsupportedClaims: string[]; // Enforced to remain empty []
}

export interface MNNContentMaster {
  id: string;
  storyId: string;
  editorialAngleId: string;
  headline: string;
  hook: string;
  hookType: 'WHY THIS MATTERS' | 'WHAT CHANGED' | 'MOST PEOPLE MISSED THIS' | '3 THINGS TO KNOW' | 'THE BIGGER STORY' | 'WATCH THIS NEXT' | 'SECOND-ORDER EFFECT';
  thesis: string;
  verifiedFactIds: string[];
  context: string[];
  implications: string[];
  whatToWatch?: string[];
  CTA?: string;
  steppsDimensions: STEPPSDimension[];
}

export type ScriptBeatType =
  | 'HOOK'
  | 'FACT'
  | 'CONTEXT'
  | 'IMPLICATION'
  | 'WHAT_TO_WATCH'
  | 'CTA'
  | 'BEFORE'
  | 'CHANGE'
  | 'TENSION'
  | 'IMPACT'
  | 'NEXT';

export interface ScriptBeat {
  id: string;
  beatType: ScriptBeatType;
  speaker: string;
  text: string;
  startSec: number;
  endSec: number;
  factIds: string[];
  visualCue: string;
}

export interface MNNScript {
  id: string;
  contentMasterId: string;
  hook: string;
  beats: ScriptBeat[];
  outro: string;
  verifiedFactIds: string[];
  estimatedDurationSeconds: number;
  qcStatus: 'QC_PASSED' | 'FACT_QC_FAIL' | 'SENSATIONALISM_FLAGGED';
  qcErrors: string[];
}

export interface QCReport {
  passed: boolean;
  factQcPassed: boolean;
  sensationalismQcPassed: boolean;
  unsupportedClaims: string[];
  sensationalPhrasesFound: string[];
  uncertaintyPreserved: boolean;
  checkedFactCount: number;
  timestamp: string;
}

export interface AutopilotLogStep {
  id: string;
  label: string;
  count?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  detail: string;
}

export interface MNNSTEPPSProfile {
  audience: string;
  dimensionPerformance: Record<STEPPSDimension, number>;
  storyTypePerformance: Record<string, number>;
  formatPerformance: Record<string, number>;
  platformPerformance: Record<string, number>;
  topCombinations: STEPPSDimension[][];
}
