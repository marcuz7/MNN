export interface RepoStep {
  id: string;
  stepNumber: number;
  label: string;
  isCompleted?: boolean;
  timeSec: number;
  commandSnippet: string;
  explanation: string;
}

export interface MonetizationAngle {
  id: string;
  title: string;
  model: 'Micro-SaaS' | 'Agency Service' | 'Digital Product' | 'Affiliate & Content';
  monthlyPotential: string;
  pricingExample: string;
  targetClient: string;
  pitchScript: string;
}

export interface KineticCaptionWord {
  word: string;
  start: number;
  end: number;
  isHighlight?: boolean;
  color?: string; // e.g. '#38bdf8' for cyan, '#fbbf24' for amber
}

export interface GitRepoVideoTemplate {
  id: string;
  repoUrl: string;
  repoName: string;
  owner: string;
  stars: number;
  primaryLanguage: string;
  tagline: string;
  problemHook: string;
  hashtags: string[];
  steps: RepoStep[];
  monetizationAngles: MonetizationAngle[];
  terminalPrompt: string;
  terminalOutput: string[];
  targetScreenType: 'smart_tv' | 'mobile_app' | 'saas_dashboard' | 'video_generator';
  targetScreenTitle: string;
  targetScreenSubtitle: string;
  targetScreenBadge: string;
  targetScreenImageUrl?: string;
  scriptSegments: Array<{
    start: number;
    end: number;
    speaker: string;
    text: string;
    stepIndex: number;
    captionWords: KineticCaptionWord[];
  }>;
  totalDuration: number;
  ctaKeyword: string;
  ctaPlatform: 'Messenger' | 'Inbox' | 'Instagram DM';
}
