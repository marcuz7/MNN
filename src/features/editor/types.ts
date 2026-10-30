export type TrackType = 'video' | 'audio' | 'caption' | 'overlay';
export type AspectRatioType = '9:16' | '16:9' | '1:1';

export interface TimelineClip {
  id: string;
  trackId: string;
  title: string;
  type: TrackType;
  startSec: number;
  endSec: number;
  durationSec: number;
  color: string;
  data: {
    text?: string;
    speaker?: string;
    sourceUrl?: string;
    words?: Array<{ word: string; start: number; end: number; isHighlight?: boolean; color?: string }>;
    volume?: number;
    ctaKeyword?: string;
    ctaPlatform?: 'Messenger' | 'Inbox' | 'Instagram DM';
  };
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: TrackType;
  isMuted: boolean;
  isLocked: boolean;
  volume: number;
  clips: TimelineClip[];
}

export interface CtaTriggerConfig {
  keyword: string;
  platform: 'Messenger' | 'Inbox' | 'Instagram DM';
  repoName: string;
  repoUrl: string;
  deliverableTitle: string;
  customWebhookUrl?: string;
}

export interface CtaTriggerOutput {
  id: string;
  keyword: string;
  platform: 'Messenger' | 'Inbox' | 'Instagram DM';
  triggerRule: {
    event: 'comment_created';
    matchType: 'contains_ignore_case' | 'exact';
    matchPattern: string;
  };
  webhookPayload: {
    source: 'MNN_Diffusion_Studio';
    version: '1.2.0';
    timestamp: string;
    action: 'send_direct_message';
    recipientContext: {
      platform: string;
      requestedKeyword: string;
    };
    message: {
      text: string;
      buttons: Array<{ type: 'web_url'; title: string; url: string }>;
    };
  };
  pinnedCommentCopy: string;
  socialCaptionCopy: string;
  executeSimulatedDm: () => Promise<{ success: boolean; deliveredAt: string; messagePreview: string }>;
}

export interface AgencyBatchVariant {
  id: string;
  title: string;
  hookAngle: string;
  targetDurationSec: number;
  pacingStyle: 'Aggressive Punch' | 'Analytical Breakdown' | 'Speedrun Challenge';
  startSec: number;
  endSec: number;
  clientType: 'E-commerce Brands' | 'SaaS Founders' | 'Content Creators';
  estimatedViews: string;
}
