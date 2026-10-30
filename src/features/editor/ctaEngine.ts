import { CtaTriggerConfig, CtaTriggerOutput } from './types';

/**
 * Functional Call-To-Action (CTA) Generator
 * Programmatically transforms a repository or video concept into ManyChat / Chatfuel / Instagram DM automation rules.
 */
export function createCtaTrigger(config: CtaTriggerConfig): CtaTriggerOutput {
  const sanitizedKeyword = (config.keyword || 'EDITOR').trim().toUpperCase();
  const platform = config.platform || 'Messenger';
  const id = `cta_${sanitizedKeyword.toLowerCase()}_${Date.now()}`;

  const pinnedCommentCopy = `👇 Comment "${sanitizedKeyword}" below and Marcus will instantly DM you the direct link to ${config.repoName}, the 1-click setup scripts, and the monetization guide straight to your ${platform}!`;

  const socialCaptionCopy = `Stop wasting 6 hours editing video clips manually.\n\nHere is how to set up ${config.repoName} with open-source WebCodecs in under 60 seconds.\n\n💬 Comment "${sanitizedKeyword}" to get the repo link + agency batching template delivered to your ${platform}!\n\n#videoeditor #webcodecs #opensource #remotion #saas #contentcreator`;

  const webhookPayload = {
    source: 'MNN_Diffusion_Studio' as const,
    version: '1.2.0' as const,
    timestamp: new Date().toISOString(),
    action: 'send_direct_message' as const,
    recipientContext: {
      platform,
      requestedKeyword: sanitizedKeyword
    },
    message: {
      text: `Hey! Marcus Leng here from MNN. Here is the ${config.deliverableTitle} for ${config.repoName}:\n\n🔗 Direct GitHub: ${config.repoUrl}\n⚡ Includes 1-click timeline setup & agency client onboarding scripts.`,
      buttons: [
        {
          type: 'web_url' as const,
          title: `Open ${config.repoName}`,
          url: config.repoUrl
        }
      ]
    }
  };

  const executeSimulatedDm = async (): Promise<{ success: boolean; deliveredAt: string; messagePreview: string }> => {
    // Simulate real webhook roundtrip latency
    await new Promise(resolve => setTimeout(resolve, 450));
    return {
      success: true,
      deliveredAt: new Date().toLocaleTimeString(),
      messagePreview: webhookPayload.message.text
    };
  };

  return {
    id,
    keyword: sanitizedKeyword,
    platform,
    triggerRule: {
      event: 'comment_created',
      matchType: 'contains_ignore_case',
      matchPattern: `(?i)\\b${sanitizedKeyword}\\b`
    },
    webhookPayload,
    pinnedCommentCopy,
    socialCaptionCopy,
    executeSimulatedDm
  };
}
