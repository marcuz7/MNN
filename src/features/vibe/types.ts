export type BeatType = 'HOOK' | 'MECHANISM' | 'EVIDENCE' | 'IMPLICATION' | 'TAKEAWAY';

export type VerificationStatus = 'VERIFIED' | 'PEER_REVIEWED' | 'DOCUMENTATION';

export interface VibeSourceReference {
  title: string;
  url: string;
  publisher: string;
  verificationStatus: VerificationStatus;
  quoteExcerpt?: string;
}

export interface VibeVisualSnippet {
  codeLanguage?: string;
  codeContent?: string;
  metricLabel?: string;
  metricValue?: string;
}

export interface VibeStatementBeat {
  id: string;
  order: number;
  type: BeatType;
  statement: string;
  highlightWords: string[];
  durationMs: number;
  sources: VibeSourceReference[];
  visualSnippet?: VibeVisualSnippet;
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
