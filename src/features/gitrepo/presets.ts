import { GitRepoVideoTemplate } from './types';

export const GIT_REPO_PRESETS: GitRepoVideoTemplate[] = [
  {
    id: 'smart-tv-debloater',
    repoUrl: 'https://github.com/tv-claude/google-tv-debloater',
    repoName: 'google-tv-debloater',
    owner: 'tv-claude',
    stars: 8420,
    primaryLanguage: 'Shell / Python',
    tagline: 'Remove intrusive home screen ads, purge bloatware, and speed up Google TV / TCL 4K smart TVs using ADB and Claude Code.',
    problemHook: 'Why is your $800 Smart TV lagging and showing full-screen car ads on your home screen? Here is the free open-source script.',
    hashtags: ['#googletv', '#androidtv', '#debloat', '#opensourceproject', '#githubprojects'],
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        label: 'Developer mode',
        timeSec: 0,
        commandSnippet: 'Settings -> System -> About -> Click Build 7 times',
        explanation: 'Unlock Android TV internal developer options and unlock wireless ADB bridge.'
      },
      {
        id: 's2',
        stepNumber: 2,
        label: 'USB debugging',
        timeSec: 8,
        commandSnippet: 'adb connect 192.168.1.145:5555',
        explanation: 'Enable network debugging so your laptop can execute terminal cleanup scripts on the TV.'
      },
      {
        id: 's3',
        stepNumber: 3,
        label: 'Claude Code',
        timeSec: 16,
        commandSnippet: 'claude "run debloat-script.sh --remove-ads --speedup"',
        explanation: 'Run open-source purge script to eliminate 42 sponsored ad packages permanently.'
      }
    ],
    monetizationAngles: [
      {
        id: 'm1',
        title: 'Local Smart Home TV Optimization Service',
        model: 'Agency Service',
        monthlyPotential: '$2,500 - $4,800/mo',
        pricingExample: '$120 per TV cleanup session',
        targetClient: 'Homeowners and AirBnB hosts frustrated by slow laggy TVs.',
        pitchScript: 'Offer a 15-minute high-end TV speedup & ad removal service for local home theaters and AirBnB properties.'
      },
      {
        id: 'm2',
        title: '1-Click Debloat GUI Wrapper App',
        model: 'Micro-SaaS',
        monthlyPotential: '$3,200/mo',
        pricingExample: '$9.99 one-time license',
        targetClient: 'Non-technical Android TV owners wanting no-terminal setup.',
        pitchScript: 'Package the bash scripts into a cross-platform Electron/Tauri GUI app with an activation license.'
      },
      {
        id: 'm3',
        title: 'Short-Form Tech Affiliate Guide',
        model: 'Digital Product',
        monthlyPotential: '$1,800/mo',
        pricingExample: '$15 complete TV optimization PDF + scripts',
        targetClient: 'Tech DIY enthusiasts and Reddit r/AndroidTV community.',
        pitchScript: 'Sell pre-configured profiles and curated adblock DNS configs through Gumroad and TikTok bio.'
      }
    ],
    terminalPrompt: '~/tv $ ',
    terminalOutput: [
      'Connecting to Google TV @ 192.168.1.145:5555... CONNECTED',
      'Scanning installed bloatware packages [42 detected]',
      'Removing com.google.android.tv.ads... [REMOVED ✓]',
      'Removing sponsored recommendation banner daemon... [DONE ✓]',
      'Memory free: 412MB -> 1.42GB. TV UI latency dropped by 74%!'
    ],
    targetScreenType: 'smart_tv',
    targetScreenTitle: 'Google TV 4K Interface',
    targetScreenSubtitle: 'Sponsored SUV Car Ads Permanently Purged',
    targetScreenBadge: '42 BLOAT PACKAGES REMOVED',
    scriptSegments: [
      {
        start: 0,
        end: 7,
        speaker: 'Marcus Leng',
        text: 'Stop letting your smart TV show you full-screen car ads every time you turn it on.',
        stepIndex: 0,
        captionWords: [
          { word: 'STOP', start: 0.1, end: 0.5, isHighlight: true, color: '#ef4444' },
          { word: 'letting', start: 0.5, end: 0.8 },
          { word: 'your', start: 0.8, end: 1.1 },
          { word: 'SMART', start: 1.1, end: 1.5, isHighlight: true, color: '#38bdf8' },
          { word: 'TV', start: 1.5, end: 1.9, isHighlight: true, color: '#38bdf8' },
          { word: 'show', start: 1.9, end: 2.2 },
          { word: 'you', start: 2.2, end: 2.4 },
          { word: 'FULL-SCREEN', start: 2.4, end: 3.1, isHighlight: true, color: '#f59e0b' },
          { word: 'CAR', start: 3.1, end: 3.5, isHighlight: true, color: '#f59e0b' },
          { word: 'ADS.', start: 3.5, end: 4.2, isHighlight: true, color: '#ef4444' }
        ]
      },
      {
        start: 7,
        end: 15,
        speaker: 'Marcus Leng',
        text: 'Enable developer mode and USB debugging so your laptop can connect to your TV.',
        stepIndex: 1,
        captionWords: [
          { word: 'Enable', start: 7.2, end: 7.6 },
          { word: 'USB', start: 7.6, end: 8.0, isHighlight: true, color: '#38bdf8' },
          { word: 'DEBUGGING', start: 8.0, end: 8.6, isHighlight: true, color: '#38bdf8' },
          { word: 'so', start: 8.6, end: 8.9 },
          { word: 'your', start: 8.9, end: 9.1 },
          { word: 'LAPTOP', start: 9.1, end: 9.8, isHighlight: true, color: '#38bdf8' },
          { word: 'can', start: 9.8, end: 10.1 },
          { word: 'CLEAN', start: 10.1, end: 10.6, isHighlight: true, color: '#10b981' },
          { word: 'everything.', start: 10.6, end: 11.4 }
        ]
      },
      {
        start: 15,
        end: 22,
        speaker: 'Marcus Leng',
        text: 'Run this free open source script. It removes 42 ad services and boosts RAM by 3X.',
        stepIndex: 2,
        captionWords: [
          { word: 'Run', start: 15.1, end: 15.5 },
          { word: 'this', start: 15.5, end: 15.8 },
          { word: 'FREE', start: 15.8, end: 16.2, isHighlight: true, color: '#10b981' },
          { word: 'OPEN', start: 16.2, end: 16.6, isHighlight: true, color: '#38bdf8' },
          { word: 'SOURCE', start: 16.6, end: 17.1, isHighlight: true, color: '#38bdf8' },
          { word: 'script.', start: 17.1, end: 17.7 },
          { word: 'BOOSTS', start: 17.7, end: 18.3, isHighlight: true, color: '#fbbf24' },
          { word: 'SPEED', start: 18.3, end: 18.9, isHighlight: true, color: '#fbbf24' },
          { word: 'INSTANTLY.', start: 18.9, end: 19.8, isHighlight: true, color: '#10b981' }
        ]
      },
      {
        start: 22,
        end: 28,
        speaker: 'Marcus Leng',
        text: 'People are charging $120 locally to do this for homeowners and AirBnBs.',
        stepIndex: 2,
        captionWords: [
          { word: 'PEOPLE', start: 22.1, end: 22.5 },
          { word: 'ARE', start: 22.5, end: 22.8 },
          { word: 'CHARGING', start: 22.8, end: 23.4, isHighlight: true, color: '#fbbf24' },
          { word: '$120', start: 23.4, end: 24.1, isHighlight: true, color: '#10b981' },
          { word: 'PER', start: 24.1, end: 24.4 },
          { word: 'TV', start: 24.4, end: 24.9, isHighlight: true, color: '#38bdf8' },
          { word: 'CLEANUP.', start: 24.9, end: 25.7, isHighlight: true, color: '#10b981' }
        ]
      },
      {
        start: 28,
        end: 35,
        speaker: 'Marcus Leng',
        text: 'Comment REPO below right now and I will DM you the direct GitHub link and setup script in your Messenger or Inbox!',
        stepIndex: 2,
        captionWords: [
          { word: 'COMMENT', start: 28.1, end: 28.6, isHighlight: true, color: '#ef4444' },
          { word: '"REPO"', start: 28.6, end: 29.3, isHighlight: true, color: '#fbbf24' },
          { word: 'BELOW', start: 29.3, end: 29.8 },
          { word: 'FOR', start: 29.8, end: 30.1 },
          { word: 'DIRECT', start: 30.1, end: 30.5 },
          { word: 'INBOX', start: 30.5, end: 31.1, isHighlight: true, color: '#38bdf8' },
          { word: 'LINK!', start: 31.1, end: 31.8, isHighlight: true, color: '#10b981' }
        ]
      }
    ],
    totalDuration: 35,
    ctaKeyword: 'REPO',
    ctaPlatform: 'Messenger'
  },
  {
    id: 'hypit-ai-video-dsl',
    repoUrl: 'https://github.com/hypit-ai/hypit',
    repoName: 'hypit',
    owner: 'hypit-ai',
    stars: 5930,
    primaryLanguage: 'TypeScript / React',
    tagline: 'Word-anchored AI video generation DSL. Replicate any viral video structure into editable short-form code.',
    problemHook: 'Video agencies spend 6 hours editing 1 short-form clip. This open-source repo replicates viral pacing in 4 seconds.',
    hashtags: ['#hypit', '#aivideo', '#remotion', '#opensource', '#contentcreator'],
    steps: [
      {
        id: 'h1',
        stepNumber: 1,
        label: 'Clone repo',
        timeSec: 0,
        commandSnippet: 'git clone https://github.com/hypit-ai/hypit.git',
        explanation: 'Fetch core engine with word-timestamped caption parsers and 9:16 layout templates.'
      },
      {
        id: 'h2',
        stepNumber: 2,
        label: 'Import viral video',
        timeSec: 8,
        commandSnippet: 'npx hypit parse --input viral_reel.mp4 --dsl out.json',
        explanation: 'Extract keyframe transitions, transcript timestamps, and speaker sentiment.'
      },
      {
        id: 'h3',
        stepNumber: 3,
        label: 'Render 9:16',
        timeSec: 16,
        commandSnippet: 'npm run render:vertical --output output.mp4',
        explanation: 'Instantly compile personalized avatar reactions with kinetic text styling.'
      }
    ],
    monetizationAngles: [
      {
        id: 'hm1',
        title: 'Automated Viral Video Factory SaaS',
        model: 'Micro-SaaS',
        monthlyPotential: '$4,500/mo',
        pricingExample: '$49/month for 50 video credits',
        targetClient: 'TikTok and Reels creators scaling short-form presence.',
        pitchScript: 'Wrap the Hypit CLI in an easy web dashboard where creators upload clips and get branded avatar shorts.'
      },
      {
        id: 'hm2',
        title: 'B2B Creator Repurposing Service',
        model: 'Agency Service',
        monthlyPotential: '$3,800/mo',
        pricingExample: '$1,200/mo retainer for 30 daily shorts',
        targetClient: 'Podcast hosts, tech founders, and keynote speakers.',
        pitchScript: 'Turn weekly 1-hour founder podcasts into 30 viral video shorts with automated captions and face reactions.'
      },
      {
        id: 'hm3',
        title: 'Hypit Viral DSL Template Packs',
        model: 'Digital Product',
        monthlyPotential: '$1,950/mo',
        pricingExample: '$39 for 25 proven viral short-form layouts',
        targetClient: 'Freelance video editors and marketing agencies.',
        pitchScript: 'Sell battle-tested Remotion and Hypit composition templates tuned for maximum watch-time retention.'
      }
    ],
    terminalPrompt: '~/hypit $ ',
    terminalOutput: [
      'Cloning hypit-ai/hypit into ./hypit...',
      'Analyzing video audio frequencies -> Generating word-level transcript',
      'Generating Remotion scene graph: 1080x1920 @ 60fps',
      'Overlaying reactive Marcus avatar + kinetic audio waveforms',
      'Render completed in 3.4 seconds: ./out/viral_reaction.mp4 [READY]'
    ],
    targetScreenType: 'video_generator',
    targetScreenTitle: 'Hypit 9:16 Viral Canvas',
    targetScreenSubtitle: 'Word-Anchored Keyframe Replication',
    targetScreenBadge: '60 FPS REMOTION ENGINE',
    scriptSegments: [
      {
        start: 0,
        end: 7,
        speaker: 'Marcus Leng',
        text: 'Stop paying agencies thousands of dollars to manually edit your short-form videos.',
        stepIndex: 0,
        captionWords: [
          { word: 'STOP', start: 0.1, end: 0.5, isHighlight: true, color: '#ef4444' },
          { word: 'paying', start: 0.5, end: 0.9 },
          { word: 'thousands', start: 0.9, end: 1.5, isHighlight: true, color: '#f59e0b' },
          { word: 'to', start: 1.5, end: 1.7 },
          { word: 'edit', start: 1.7, end: 2.1 },
          { word: 'SHORT-FORM', start: 2.1, end: 2.8, isHighlight: true, color: '#38bdf8' },
          { word: 'VIDEOS.', start: 2.8, end: 3.5, isHighlight: true, color: '#38bdf8' }
        ]
      },
      {
        start: 7,
        end: 15,
        speaker: 'Marcus Leng',
        text: 'This open source repo called Hypit turns any viral video into code in four seconds.',
        stepIndex: 1,
        captionWords: [
          { word: 'This', start: 7.1, end: 7.4 },
          { word: 'OPEN-SOURCE', start: 7.4, end: 8.1, isHighlight: true, color: '#10b981' },
          { word: 'repo', start: 8.1, end: 8.5 },
          { word: 'HYPIT', start: 8.5, end: 9.1, isHighlight: true, color: '#fbbf24' },
          { word: 'turns', start: 9.1, end: 9.4 },
          { word: 'VIRAL', start: 9.4, end: 9.9, isHighlight: true, color: '#38bdf8' },
          { word: 'clips', start: 9.9, end: 10.3 },
          { word: 'into', start: 10.3, end: 10.6 },
          { word: 'CODE.', start: 10.6, end: 11.2, isHighlight: true, color: '#10b981' }
        ]
      },
      {
        start: 15,
        end: 22,
        speaker: 'Marcus Leng',
        text: 'You get word-anchored captions, device mockups, and avatar reactions out of the box.',
        stepIndex: 2,
        captionWords: [
          { word: 'WORD-ANCHORED', start: 15.1, end: 15.9, isHighlight: true, color: '#38bdf8' },
          { word: 'captions,', start: 15.9, end: 16.5 },
          { word: 'DEVICE', start: 16.5, end: 17.0, isHighlight: true, color: '#fbbf24' },
          { word: 'MOCKUPS,', start: 17.0, end: 17.7, isHighlight: true, color: '#fbbf24' },
          { word: 'and', start: 17.7, end: 17.9 },
          { word: 'AVATAR', start: 17.9, end: 18.5, isHighlight: true, color: '#10b981' },
          { word: 'REACTIONS.', start: 18.5, end: 19.3, isHighlight: true, color: '#10b981' }
        ]
      },
      {
        start: 22,
        end: 30,
        speaker: 'Marcus Leng',
        text: 'Comment CODE below and Marcus will DM you the GitHub repo link and setup guide in Messenger or Inbox!',
        stepIndex: 2,
        captionWords: [
          { word: 'COMMENT', start: 22.1, end: 22.6, isHighlight: true, color: '#ef4444' },
          { word: '"CODE"', start: 22.6, end: 23.3, isHighlight: true, color: '#fbbf24' },
          { word: 'BELOW', start: 23.3, end: 23.7 },
          { word: 'FOR', start: 23.7, end: 24.0 },
          { word: 'INSTANT', start: 24.0, end: 24.5, isHighlight: true, color: '#38bdf8' },
          { word: 'INBOX', start: 24.5, end: 25.1, isHighlight: true, color: '#38bdf8' },
          { word: 'LINK!', start: 25.1, end: 25.8, isHighlight: true, color: '#10b981' }
        ]
      }
    ],
    totalDuration: 30,
    ctaKeyword: 'CODE',
    ctaPlatform: 'Messenger'
  },
  {
    id: 'last30days-skill',
    repoUrl: 'https://github.com/mvanhorn/last30days-skill',
    repoName: 'last30days-skill',
    owner: 'mvanhorn',
    stars: 3150,
    primaryLanguage: 'Python / Markdown',
    tagline: 'Deep research intelligence agent extracting trending breakthroughs from the last 30 days across arXiv, GitHub, and X.com.',
    problemHook: 'Founders spend 10 hours a week researching what AI tools actually launched. This open-source agent automates the report.',
    hashtags: ['#last30days', '#aiagents', '#marketintelligence', '#github', '#sidehustle'],
    steps: [
      {
        id: 'l1',
        stepNumber: 1,
        label: 'Configure API',
        timeSec: 0,
        commandSnippet: 'export GEMINI_API_KEY="AIzaSy..."',
        explanation: 'Link your Gemini Flash model key for ultra-fast deep reasoning and search grounding.'
      },
      {
        id: 'l2',
        stepNumber: 2,
        label: 'Run 30-day scan',
        timeSec: 8,
        commandSnippet: 'python run_skill.py --topic "AI Video Tools" --days 30',
        explanation: 'Scrapes and synthesizes GitHub commits, X viral threads, and benchmark releases.'
      },
      {
        id: 'l3',
        stepNumber: 3,
        label: 'Export intel report',
        timeSec: 16,
        commandSnippet: 'cat ./reports/executive_summary.md',
        explanation: 'Outputs publication-grade intelligence briefings with verified citations and metrics.'
      }
    ],
    monetizationAngles: [
      {
        id: 'lm1',
        title: 'Paid Executive AI Intelligence Newsletter',
        model: 'Micro-SaaS',
        monthlyPotential: '$3,400/mo',
        pricingExample: '$29/mo per executive subscriber',
        targetClient: 'CTOs, VC investors, and product managers.',
        pitchScript: 'Charge technology executives for weekly curated signal-over-noise AI breakthrough dossiers.'
      },
      {
        id: 'lm2',
        title: 'Competitor Intelligence as a Service',
        model: 'Agency Service',
        monthlyPotential: '$5,000/mo',
        pricingExample: '$1,500/mo per enterprise client',
        targetClient: 'Tech startups monitoring competitors in AI, robotics, and crypto.',
        pitchScript: 'Deliver customized 30-day competitive analysis tracking rival patents, repo updates, and hires.'
      },
      {
        id: 'lm3',
        title: 'Substack AI Radar Monetization',
        model: 'Affiliate & Content',
        monthlyPotential: '$2,100/mo',
        pricingExample: 'Substack Paid Subscriptions + Sponsorships',
        targetClient: 'AI engineers, developers, and tech founders.',
        pitchScript: 'Publish automated weekly reports with affiliate links to cloud GPUs, APIs, and dev tools.'
      }
    ],
    terminalPrompt: '~/intel-agent $ ',
    terminalOutput: [
      'Initializing mvanhorn/last30days-skill agent...',
      'Scanning arXiv papers (381 papers matched query: AI Video DSL)',
      'Analyzing top 20 trending GitHub repos with >1k weekly stars',
      'Synthesizing key findings into executive_briefing.md...',
      'Report generated: 4 actionable business opportunities identified!'
    ],
    targetScreenType: 'saas_dashboard',
    targetScreenTitle: 'Executive Intelligence Briefing',
    targetScreenSubtitle: '30-Day Market Signal Radar',
    targetScreenBadge: 'ARXIV + GITHUB GROUNDED',
    scriptSegments: [
      {
        start: 0,
        end: 7,
        speaker: 'Marcus Leng',
        text: 'Stop wasting hours scrolling Twitter to see what new AI tools actually work.',
        stepIndex: 0,
        captionWords: [
          { word: 'STOP', start: 0.1, end: 0.5, isHighlight: true, color: '#ef4444' },
          { word: 'wasting', start: 0.5, end: 0.9 },
          { word: 'HOURS', start: 0.9, end: 1.4, isHighlight: true, color: '#f59e0b' },
          { word: 'scrolling', start: 1.4, end: 1.8 },
          { word: 'for', start: 1.8, end: 2.0 },
          { word: 'AI', start: 2.0, end: 2.3, isHighlight: true, color: '#38bdf8' },
          { word: 'TOOLS.', start: 2.3, end: 3.0, isHighlight: true, color: '#38bdf8' }
        ]
      },
      {
        start: 7,
        end: 15,
        speaker: 'Marcus Leng',
        text: 'This open source repo scans the last 30 days of arXiv, GitHub, and X automatically.',
        stepIndex: 1,
        captionWords: [
          { word: 'This', start: 7.1, end: 7.4 },
          { word: 'OPEN-SOURCE', start: 7.4, end: 8.1, isHighlight: true, color: '#10b981' },
          { word: 'agent', start: 8.1, end: 8.5 },
          { word: 'SCANS', start: 8.5, end: 9.0, isHighlight: true, color: '#fbbf24' },
          { word: 'the', start: 9.0, end: 9.2 },
          { word: 'LAST', start: 9.2, end: 9.6, isHighlight: true, color: '#38bdf8' },
          { word: '30', start: 9.6, end: 10.0, isHighlight: true, color: '#38bdf8' },
          { word: 'DAYS.', start: 10.0, end: 10.7, isHighlight: true, color: '#38bdf8' }
        ]
      },
      {
        start: 15,
        end: 22,
        speaker: 'Marcus Leng',
        text: 'Consultants charge fifteen hundred a month delivering these exact briefings.',
        stepIndex: 2,
        captionWords: [
          { word: 'Consultants', start: 15.1, end: 15.7 },
          { word: 'CHARGE', start: 15.7, end: 16.3, isHighlight: true, color: '#fbbf24' },
          { word: '$1,500/MO', start: 16.3, end: 17.2, isHighlight: true, color: '#10b981' },
          { word: 'delivering', start: 17.2, end: 17.8 },
          { word: 'these', start: 17.8, end: 18.1 },
          { word: 'BRIEFINGS.', start: 18.1, end: 18.9, isHighlight: true, color: '#38bdf8' }
        ]
      },
      {
        start: 22,
        end: 30,
        speaker: 'Marcus Leng',
        text: 'Comment INTEL below and Marcus will send you the repo link and setup guide directly in your Messenger or Inbox!',
        stepIndex: 2,
        captionWords: [
          { word: 'COMMENT', start: 22.1, end: 22.6, isHighlight: true, color: '#ef4444' },
          { word: '"INTEL"', start: 22.6, end: 23.3, isHighlight: true, color: '#fbbf24' },
          { word: 'BELOW', start: 23.3, end: 23.7 },
          { word: 'FOR', start: 23.7, end: 24.0 },
          { word: 'DIRECT', start: 24.0, end: 24.5 },
          { word: 'INBOX', start: 24.5, end: 25.1, isHighlight: true, color: '#38bdf8' },
          { word: 'LINK!', start: 25.1, end: 25.8, isHighlight: true, color: '#10b981' }
        ]
      }
    ],
    totalDuration: 30,
    ctaKeyword: 'INTEL',
    ctaPlatform: 'Messenger'
  }
];
