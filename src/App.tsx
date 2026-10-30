import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, Volume2, Info, List, ChevronDown, ChevronUp, Sparkles, Settings2, Clock, Radio,
  TerminalSquare, CheckCircle2, Loader2, Bot, Download, Lock, Key, ShieldAlert, Check,
  HelpCircle, User, AlertCircle, RefreshCw, Trash2, ChevronLeft, Share2, Copy, ExternalLink, Globe,
  Video, ThumbsUp, Bell, Smartphone, Cpu, Camera, Layers, Monitor, Bookmark, MessageSquare,
  Upload, X, Image as ImageIcon, UserCheck, Film, BookOpen, Rss, Youtube, ShieldCheck, LogIn
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { MOCK_SHOW, transformShow } from './data';
import { Transcript } from './components/Transcript';
import { VideoExportModal } from './components/VideoExportModal';
import { GitHubVideoGuideModal } from './components/GitHubVideoGuideModal';
import { YouTubePublishModal } from './components/YouTubePublishModal';
import { NewsRadar } from './features/radar/NewsRadar';
import { FeedManager } from './features/rss/FeedManager';
import { ReviewStudio } from './features/review/ReviewStudio';
import { YouTubeDashboard } from './features/youtube/YouTubeDashboard';
import { ReactionStudio } from './features/reaction/ReactionStudio';
import { GitRepoMoneyStudio } from './features/gitrepo/GitRepoMoneyStudio';
import { SteppsNewsroom } from './features/stepps/SteppsNewsroom';
import { DiffusionEditor } from './features/editor/DiffusionEditor';
import { VibeKnowledgeStudio } from './features/vibe/VibeKnowledgeStudio';
import { MNNNavBar } from './components/MNNNavBar';
import { saveUserShow, getUserShows, deleteUserShow } from './lib/clientDb';
import { speakNaturalSpeech, stopNaturalSpeech } from './lib/naturalSpeech';

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const IS_DEV = !!(import.meta as any).env?.DEV;
// Dynamically generate the direct published/deployed link for sharing,
// completely bypassing the AI Studio editor/builder frame to ensure immediate end-user playback for colleagues
const getPublishedShareLink = (shareId: string) => {
  let origin = window.location.origin;

  // Dynamically map any AI Studio development box subdomain to the corresponding preprod/published/deployed subdomain
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }

  return `${origin}/?share_id=${shareId}`;
};

// Safe retrieval of query parameters supporting both inline (localhost) and nested iframe scenarios
const getQueryParam = (name: string): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. Try parent referrer URL first (most common when running inside a dynamic AI Studio iframe)
  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      const val = referrerUrl.searchParams.get(name);
      if (val) return val;
    } catch (e) {
      console.error('Failed to parse document.referrer search params', e);
    }
  }

  // 2. Fallback to direct frame's URL
  try {
    const params = new URLSearchParams(window.location.search);
    const val = params.get(name);
    if (val) return val;
  } catch (e) {
    // ignore
  }

  return null;
};

// Dynamically extract the Applet ID from current window URL or referrer URL for robust, dynamic forking / cloning
const getAppletId = (): string => {
  const defaultAppId = '35815e49-e032-468d-893e-d0bb54764b77';
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  // 1. Try the current frame's URL first
  try {
    const ownMatch = window.location.href.match(uuidRegex);
    if (ownMatch) {
      return ownMatch[0];
    }
  } catch (e) {
    // ignore
  }

  // 2. Try the parent referrer URL (typical when running inside an iframe in AI Studio)
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      const match = referrerUrl.href.match(uuidRegex);
      if (match) {
        return match[0];
      }
    } catch (e) {
      // ignore
    }
  }

  return defaultAppId;
};

// Dynamically determine the correct AI Studio origin for Remixes without hardcoding internal staging or staging domains
const getAIStudioBuildUrl = (appletId: string): string => {
  let baseDomain = 'https://ai.studio';
  
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      const hostname = referrerUrl.hostname;
      // Automatically adapt to the parent host if it's the official AI Studio or any verified Google sandbox/staging origin
      if (
        hostname === 'ai.studio' || 
        hostname === 'aistudio.google.com' || 
        hostname.endsWith('.google.com') || 
        hostname.endsWith('.google')
      ) {
        baseDomain = referrerUrl.origin;
      }
    } catch (e) {
      // ignore
    }
  }

  return `${baseDomain}/build?clone=${appletId}`;
};

const RainbowBackground = () => (
  <>
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vh] rounded-full bg-[#ff00a2]/40 mix-blend-screen filter blur-[120px] animate-blob" />
      <div className="absolute top-[10%] -right-[10%] w-[60vw] h-[60vh] rounded-full bg-[#143dff]/40 mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000" />
      <div className="absolute -bottom-[20%] left-[10%] w-[70vw] h-[70vh] rounded-full bg-[#43ff0d]/30 mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vh] rounded-full bg-[#ffc500]/30 mix-blend-screen filter blur-[120px] animate-blob animation-delay-6000" />
      <div className="absolute top-[30%] left-[30%] w-[50vw] h-[50vh] rounded-full bg-[#ff2a2a]/30 mix-blend-screen filter blur-[120px] animate-blob animation-delay-3000" />
    </div>
    <div className="absolute inset-0 bg-black/50 backdrop-blur-[60px] z-0 pointer-events-none" />
  </>
);

const getInitialView = (): 'home' | 'player' | 'generating' | 'radar' | 'reaction' | 'gitrepo' | 'stepps' | 'feeds' | 'review' | 'youtube' | 'editor' | 'vibe' => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const validViews = ['home', 'player', 'generating', 'radar', 'reaction', 'gitrepo', 'stepps', 'feeds', 'review', 'youtube', 'editor', 'vibe'];
  if (validViews.includes(hash)) return hash as any;
  return 'home';
};

export default function App() {
  const [view, setViewState] = useState<'home' | 'player' | 'generating' | 'radar' | 'reaction' | 'gitrepo' | 'stepps' | 'feeds' | 'review' | 'youtube' | 'editor' | 'vibe'>(getInitialView);
  const [isYouTubePublishModalOpen, setIsYouTubePublishModalOpen] = useState(false);

  const setView = (newView: 'home' | 'player' | 'generating' | 'radar' | 'reaction' | 'gitrepo' | 'stepps' | 'feeds' | 'review' | 'youtube' | 'editor' | 'vibe', replace = false) => {
    setViewState(newView);
    if (typeof window !== 'undefined') {
      const targetHash = `#/${newView}`;
      if (window.location.hash !== targetHash) {
        if (replace) {
          window.history.replaceState(null, '', targetHash);
        } else {
          window.history.pushState(null, '', targetHash);
        }
      }
    }
  };

  const handleBackToStudio = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      setView('home');
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      const validViews = ['home', 'player', 'generating', 'radar', 'reaction', 'gitrepo', 'stepps', 'feeds', 'review', 'youtube', 'editor', 'vibe'];
      if (validViews.includes(hash)) {
        setViewState(hash as any);
      } else if (!hash) {
        setViewState('home');
      }
    };

    if (typeof window !== 'undefined' && !window.location.hash) {
      window.history.replaceState(null, '', '#/home');
    }

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const [reviewEpisodeId, setReviewEpisodeId] = useState<string | null>(null);
  const [selectedShow, setSelectedShow] = useState(MOCK_SHOW);
  const [library, setLibrary] = useState([MOCK_SHOW]);
  
  // --- SHARING FLOW STATES ---
  const [isSharedPlaybackMode, setIsSharedPlaybackMode] = useState(false);
  const [sharedShowLoading, setSharedShowLoading] = useState(false);
  const [sharedShowError, setSharedShowError] = useState<string | null>(null);
  const [sharingInProgress, setSharingInProgress] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [quickShareToast, setQuickShareToast] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [sharingError, setSharingError] = useState<string | null>(null);
  const [mobileDisclaimerExpanded, setMobileDisclaimerExpanded] = useState(true);
  const [isSharingEnabled, setIsSharingEnabled] = useState(false);

  const handleQuickShare = async () => {
    try {
      const url = shareUrl || getPublishedShareLink(selectedShow.id || 'default');
      await navigator.clipboard.writeText(url);
      setQuickShareToast(true);
      setTimeout(() => setQuickShareToast(false), 2400);
    } catch (e) {
      const fallbackUrl = window.location.href;
      await navigator.clipboard.writeText(fallbackUrl);
      setQuickShareToast(true);
      setTimeout(() => setQuickShareToast(false), 2400);
    }
  };

  const [prompt, setPrompt] = useState('');
  const [activePrompt, setActivePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [targetDuration, setTargetDuration] = useState('3');
  const [targetMood, setTargetMood] = useState('Morning Rush');
  const [selectedCategory, setSelectedCategory] = useState<'git_money' | 'viral_reaction' | 'morning_rush' | 'pixel_court' | 'sports' | 'late_night'>('git_money');
  const [crtScanlines, setCrtScanlines] = useState(true);

  // --- YOUTUBE PODCAST STUDIO STATES ---
  const [playerLayout, setPlayerLayout] = useState<'split' | 'video' | 'transcript'>('split');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likesCount, setLikesCount] = useState(14820);
  const [hasLiked, setHasLiked] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  // --- PIXEL MARCUS AVATAR & HOST PROFILE STATES ---
  const DEFAULT_AVATAR = '/pixel_marcus_avatar.jpg';
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pixel_marcus_avatar') || DEFAULT_AVATAR;
    }
    return DEFAULT_AVATAR;
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [isVideoExportModalOpen, setIsVideoExportModalOpen] = useState(false);
  const [isVideoGuideModalOpen, setIsVideoGuideModalOpen] = useState(false);

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploadError(null);
    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarUploadError('Image size exceeds 8MB. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        localStorage.setItem('pixel_marcus_avatar', reader.result);
      }
    };
    reader.onerror = () => {
      setAvatarUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetToAIAvatar = () => {
    setAvatarUrl(DEFAULT_AVATAR);
    localStorage.setItem('pixel_marcus_avatar', DEFAULT_AVATAR);
  };

  const handleUseGooglePhoto = () => {
    if (currentUser?.photoURL) {
      setAvatarUrl(currentUser.photoURL);
      localStorage.setItem('pixel_marcus_avatar', currentUser.photoURL);
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const [generationLogs, setGenerationLogs] = useState<Array<{
    id: string;
    timestamp: string;
    type: 'info' | 'thinking' | 'tool_call' | 'tool_result' | 'text' | 'error';
    content?: string;
    name?: string;
    args?: any;
    result?: string;
  }>>([]);

  const [generationComplete, setGenerationComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState('Initializing...');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [hasQuotaError, setHasQuotaError] = useState(false);

  // --- RATE LIMITER & QUOTA STATES ---
  const DAILY_LIMIT = 3;

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [quota, setQuota] = useState<{
    allowed: boolean;
    limit: number;
    remaining: number;
    used: number;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Error signing in with Google:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const refreshQuota = async () => {
    try {
      const headers: Record<string, string> = {};
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (tokenErr) {
          console.error("Error retrieving ID token:", tokenErr);
        }
      }
      const res = await fetch("/api/quota", { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const used = typeof data.used === 'number' ? data.used : 0;
      const limit = typeof data.limit === 'number' ? data.limit : 3;
      setQuota({
        allowed: used < limit,
        limit: limit,
        remaining: Math.max(0, limit - used),
        used
      });
    } catch (err) {
      console.error("Error loading secure session quota:", err);
      setQuota({
        allowed: true,
        limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT,
        used: 0
      });
    }
  };

  useEffect(() => {
    refreshQuota();
  }, [currentUser]);

  useEffect(() => {
    let interval: any;
    if (isGenerating && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, startTime]);

  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const scrubText = (text: string) => {
    if (!text) return text;
    // Scrub GEMINI_API_KEY=... and "GEMINI_API_KEY": "..." and raw API keys
    return text
      .replace(/(GEMINI_API_KEY\s*(?:=|:)\s*)[^\s"'\\]+/g, '$1***')
      .replace(/("GEMINI_API_KEY"\s*:\s*")[^"]+"/g, '$1***"')
      .replace(/AIza[a-zA-Z0-9_-]{35}/g, '***')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  };

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-black/40 p-3 rounded-lg text-white/70 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] border border-white/5 my-2">$1</pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-io-blue font-mono text-[10px]">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const humanizeToolName = (name: string) => {
    const map: Record<string, string> = {
      'read_file': 'Read file',
      'list_files': 'List files',
      'bash': 'Run command',
      'google_search': 'Google search',
      'code_execution_call': 'Run command',
    };
    return map[name] || name;
  };

  const formatToolResult = (name: string | undefined, rawResult: string | undefined) => {
    if (!rawResult) return null;

    const unwrap = (str: any): any => {
      let current = str;
      for (let i = 0; i < 5; i++) {
        if (typeof current === 'string') {
          const trimmed = current.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('"')) {
            try {
              current = JSON.parse(trimmed);
            } catch (e) {
              // If it fails to parse but starts and ends with quotes, try stripping them and unescaping
              if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                try {
                  const unescaped = trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                  current = JSON.parse(unescaped);
                } catch (e2) {
                  break;
                }
              } else {
                break;
              }
            }
          } else {
            break;
          }
        } else {
          break;
        }
      }
      return current;
    };

    let data = unwrap(rawResult);
    if (data && typeof data === 'object' && 'result' in data) {
      const inner = unwrap(data.result);
      if (inner && typeof inner === 'object') {
        data = inner;
      } else if (typeof inner === 'string') {
        data = inner;
      }
    }

    if (name === 'list_files' && data && Array.isArray(data.files)) {
      return (
        <div className="bg-black/40 p-3 rounded-lg border border-white/5">
          <div className="flex flex-col gap-1 py-1">
            {data.files.map((f: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-white/70 font-mono text-[10px]">
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    let textToShow = '';
    if (name === 'read_file' && data && typeof data.content === 'string') {
      textToShow = data.content;
    } else if (name === 'read_file' && data && typeof data.error === 'string') {
      textToShow = data.error;
    } else if (name === 'bash' && data) {
      if (typeof data.output === 'string') {
        textToShow = data.output;
      } else if (typeof data.error === 'string') {
        textToShow = data.error;
      } else if (typeof data === 'object') {
        textToShow = JSON.stringify(data, null, 2);
      } else {
        textToShow = String(data);
      }
    } else if (typeof data === 'object') {
      textToShow = JSON.stringify(data, null, 2);
    } else {
      textToShow = String(data);
    }

    textToShow = textToShow.replace(/\\n/g, '\n').replace(/\\"/g, '"');

    return (
      <pre className="bg-black/40 p-3 rounded-lg text-white/70 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] border border-white/5">
        {scrubText(textToShow)}
      </pre>
    );
  };

  const downloadLogs = () => {
    const logText = generationLogs.map(l => {
      let content = l.content || '';
      if (l.type === 'tool_call') content = `${l.name}(${JSON.stringify(l.args)})`;
      if (l.type === 'tool_result') content = `${l.name || 'result'}: ${l.result}`;
      return `[${l.timestamp}] [${l.type}] ${scrubText(content)}`;
    }).join('\\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-logs-${new Date().toISOString().replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const audioRef = useRef<HTMLAudioElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationIdRef = useRef<string | null>(null);
  const progress = currentTime / (selectedShow.duration || 1);

  // --- TTS LOCAL FALLBACK PLAYBACK ENGINE REFS & LOGIC ---
  const ttsIntervalRef = useRef<any>(null);
  const ttsCurrentSpeakerIndexRef = useRef<number>(-1);
  const isTtsPlayMode = !selectedShow.audioUrl;

  const getSegmentIndexAtTime = (time: number) => {
    return selectedShow.transcript?.findIndex(
      line => time >= line.start && time < line.end
    ) ?? -1;
  };

  const speakCurrentSegment = (time: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const currentIndex = getSegmentIndexAtTime(time);
    ttsCurrentSpeakerIndexRef.current = currentIndex;
    if (currentIndex !== -1) {
      const segment = selectedShow.transcript[currentIndex];
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      const voices = window.speechSynthesis.getVoices();
      
      const isSpeakerA = segment.speaker?.toLowerCase().includes('host') || 
                         segment.speaker?.toLowerCase().includes('alice') || 
                         segment.speaker?.toLowerCase().includes('one') || 
                         currentIndex % 2 === 0;
                         
      if (voices.length > 0) {
        if (isSpeakerA) {
          const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || 
                                              v.name.toLowerCase().includes('zira') || 
                                              v.name.toLowerCase().includes('google us english') ||
                                              v.lang.startsWith('en'));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || 
                                            v.name.toLowerCase().includes('david') || 
                                            v.name.toLowerCase().includes('google us') ||
                                            v.lang.startsWith('en'));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const checkAndSpeakForTime = (time: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const currentIndex = getSegmentIndexAtTime(time);
    if (currentIndex !== -1 && currentIndex !== ttsCurrentSpeakerIndexRef.current) {
      ttsCurrentSpeakerIndexRef.current = currentIndex;
      const segment = selectedShow.transcript[currentIndex];
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      const voices = window.speechSynthesis.getVoices();
      
      const isSpeakerA = segment.speaker?.toLowerCase().includes('host') || 
                         segment.speaker?.toLowerCase().includes('alice') || 
                         segment.speaker?.toLowerCase().includes('one') || 
                         currentIndex % 2 === 0;
                         
      if (voices.length > 0) {
        if (isSpeakerA) {
          const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || 
                                              v.name.toLowerCase().includes('zira') || 
                                              v.name.toLowerCase().includes('google us english') ||
                                              v.lang.startsWith('en'));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || 
                                            v.name.toLowerCase().includes('david') || 
                                            v.name.toLowerCase().includes('google us') ||
                                            v.lang.startsWith('en'));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Sync isSpeaking with window.speechSynthesis status
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const interval = setInterval(() => {
      const active = window.speechSynthesis.speaking;
      if (active !== isSpeaking) {
        setIsSpeaking(active);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  useEffect(() => {
    return () => {
      if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, []);

  // When selectedShow changes, reset currentTime and pause playback
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setIsSpeaking(false);
    if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [selectedShow]);


  useEffect(() => {
    // Check sharing configuration
    fetch('/api/share/config')
      .then(res => res.json())
      .then(data => {
        setIsSharingEnabled(!!data.isSharingEnabled);
      })
      .catch(err => {
        console.error("Error fetching sharing config:", err);
        setIsSharingEnabled(false);
      });

    const loadData = async () => {
      let userShows: any[] = [];
      try {
        userShows = await getUserShows();
      } catch (e) {
        console.error("Failed to load user-generated shows from IndexedDB:", e);
      }

      const isShared = getQueryParam('share_id') || getQueryParam('share');

      fetch('/api/shows')
        .then(res => res.json())
        .then((shows: any[]) => {
          const transformedShows = (shows && shows.length > 0)
            ? shows.map(show => transformShow({
                ...show,
                coverImage: show.coverImage || "https://www.gstatic.com/aistudio/starter-apps/assets/ai_radio/cover.jpg"
              }))
            : [];

          // Merge: user shows + fetched public shows + baseline pre-generated show
          const merged = [...userShows, ...transformedShows, MOCK_SHOW];
          const uniqueShows = merged.filter((show, index, self) =>
            index === self.findIndex((s) => s.title === show.title)
          );

          setLibrary(uniqueShows);
          if (!isShared && uniqueShows.length > 0) {
            setSelectedShow(uniqueShows[0]);
          }
        })
        .catch(err => {
          console.error("Error loading public shows, using local fallback shows:", err);
          const merged = [...userShows, MOCK_SHOW];
          const uniqueShows = merged.filter((show, index, self) =>
            index === self.findIndex((s) => s.title === show.title)
          );
          setLibrary(uniqueShows);
          if (!isShared && uniqueShows.length > 0) {
            setSelectedShow(uniqueShows[0]);
          }
        });
    };

    loadData();
  }, []);

  // --- PLAYBACK OF SHARED SHOW ON BOOT ---
  useEffect(() => {
    const shareId = getQueryParam('share_id') || getQueryParam('share');

    if (shareId) {
      console.log(`[Sharing] Found shareId: ${shareId}`);
      setIsSharedPlaybackMode(true);
      setSharedShowLoading(true);
      setView('player');

      fetch(`/api/shares/${shareId}`)
        .then(res => {
          if (!res.ok) throw new Error('Shared show not found on server');
          return res.json();
        })
        .then(data => {
          if (data && data.title) {
            setSelectedShow(data);
          } else {
            throw new Error('Invalid shared show data received');
          }
          setSharedShowLoading(false);
        })
        .catch(err => {
          console.error("Failed to load shared show:", err);
          setSharedShowError(err.message || "Failed to load the shared show");
          setSharedShowLoading(false);
        });
    }
  }, []);

  const getBlobFromUrl = async (url: string): Promise<Blob> => {
    if (url.startsWith('data:')) {
      const res = await fetch(url);
      return await res.blob();
    }
    const isExternal = url.startsWith('http') && !url.startsWith(window.location.origin);
    const fetchUrl = isExternal
      ? `/api/download-proxy?url=${encodeURIComponent(url)}`
      : url;
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error(`Failed to fetch media file: ${res.statusText}`);
    return await res.blob();
  };

  const handleShare = async () => {
    if (!selectedShow) return;

    // Check if we already have a generated share ID/URL for this specific show to prevent duplicate uploads
    if (selectedShow.shareId) {
      const existingShareUrl = selectedShow.shareUrl || getPublishedShareLink(selectedShow.shareId);
      setIsShareModalOpen(true);
      setSharingInProgress(false);
      setUploadProgress(100);
      setUploadStatus('Retrieving existing shared radio show link...');
      setShareUrl(existingShareUrl);
      return;
    }

    setSharingInProgress(true);
    setIsShareModalOpen(true);
    setShareUrl(null);
    setSharingError(null);
    setCopySuccess(false);
    setUploadProgress(0);
    setUploadStatus('Preparing metadata...');

    try {
      // 1. Send metadata to server to retrieve signed upload/read URLs
      const metadata = {
        title: selectedShow.title,
        summary: selectedShow.summary || selectedShow.description || "",
        transcript: selectedShow.transcript || [],
        prompt: selectedShow.prompt || prompt || "",
        duration: selectedShow.duration,
        host: selectedShow.host || "",
        isBase64Encoded: selectedShow.isBase64Encoded || false,
        date: selectedShow.date || new Date().toLocaleDateString()
      };

      const res = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      if (!data || !data.shareId) {
        throw new Error("Invalid response received from sharing API (make sure GCS is configured on backend)");
      }

      const { shareId, uploadUrl, uploadCoverUrl, alreadyExists } = data;

      if (alreadyExists) {
        // Reuse GCS share URL directly without uploading audio/cover
        setUploadStatus('Retrieving existing shared files from GCS...');
        setUploadProgress(80);
        
        const generatedShareUrl = getPublishedShareLink(shareId);
        const updatedShow = { ...selectedShow, shareId, shareUrl: generatedShareUrl };
        setSelectedShow(updatedShow);
        setLibrary(prev => prev.map(s => s.title === selectedShow.title ? updatedShow : s));

        if (selectedShow.isUserGenerated) {
          try {
            await saveUserShow(updatedShow);
          } catch (e) {
            console.error("Failed to save shared show metadata into IndexedDB:", e);
          }
        }

        setUploadProgress(100);
        setUploadStatus('Retrieved existing share link from GCS!');
        setShareUrl(generatedShareUrl);
        return;
      }

      if (!uploadUrl || !uploadCoverUrl) {
        throw new Error("Missing upload URLs in sharing API response");
      }

      // 2. Load the actual audio file/blob
      setUploadStatus('Fetching radio show audio stream...');
      setUploadProgress(5);
      const audioBlob = await getBlobFromUrl(selectedShow.audioUrl);

      // 3. Upload the MP3 with progress bar
      setUploadStatus('Uploading stereo audio stream to GCS...');
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', 'audio/mpeg');
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // Map audio progress to 10% - 80%
            const percent = Math.round((e.loaded / e.total) * 70) + 10;
            setUploadProgress(percent);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Audio upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Audio upload failed due to network error'));
        xhr.send(audioBlob);
      });

      // 4. Load the cover image
      setUploadStatus('Uploading high-res cover art canvas to GCS...');
      setUploadProgress(82);

      let coverBlob: Blob | null = null;
      if (selectedShow.coverImage) {
        try {
          coverBlob = await getBlobFromUrl(selectedShow.coverImage);
        } catch (err) {
          console.warn("Could not retrieve text-to-image cover art canvas blob, using fallback...", err);
        }
      }

      if (coverBlob) {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadCoverUrl, true);
          xhr.setRequestHeader('Content-Type', 'image/png');
          
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              // Map cover progress to 82% - 98%
              const percent = Math.round((e.loaded / e.total) * 16) + 82;
              setUploadProgress(percent);
            }
          };
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Cover upload failed with status ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => reject(new Error('Cover upload failed due to network error'));
          xhr.send(coverBlob);
        });
      }

      // 5. Complete and update state
      const generatedShareUrl = getPublishedShareLink(shareId);
      const updatedShow = { ...selectedShow, shareId, shareUrl: generatedShareUrl };
      setSelectedShow(updatedShow);
      setLibrary(prev => prev.map(s => s.title === selectedShow.title ? updatedShow : s));

      if (selectedShow.isUserGenerated) {
        try {
          await saveUserShow(updatedShow);
        } catch (e) {
          console.error("Failed to save shared show metadata into IndexedDB:", e);
        }
      }

      setUploadProgress(100);
      setUploadStatus('Share creation successfully completed!');
      setShareUrl(generatedShareUrl);
    } catch (err: any) {
      console.error("Error creating viral share:", err);
      const errMsg = err.message || "Failed to package or upload files";
      setUploadStatus(`Error: ${errMsg}`);
      setSharingError(errMsg);
      setUploadProgress(0);
    } finally {
      setSharingInProgress(false);
    }
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => console.error("Could not copy:", err));
    }
  };

  const exitSharedPlayback = () => {
    setIsSharedPlaybackMode(false);
    setSharedShowError(null);
    window.history.replaceState({}, '', window.location.pathname);
    setView('home');
  };

  const remixSharedShow = () => {
    if (selectedShow && selectedShow.prompt) {
      setPrompt(selectedShow.prompt);
    }
    setIsSharedPlaybackMode(false);
    setSharedShowError(null);
    window.history.replaceState({}, '', window.location.pathname);
    setView('home');
  };

  const togglePlay = () => {
    if (isTtsPlayMode) {
      if (isPlaying) {
        if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        setIsSpeaking(false);
      } else {
        setIsPlaying(true);
        let accumulatedTime = currentTime;
        
        speakCurrentSegment(accumulatedTime);

        ttsIntervalRef.current = setInterval(() => {
          accumulatedTime += 0.5; // robust and lightweight 0.5s chunks
          if (accumulatedTime >= selectedShow.duration) {
            accumulatedTime = selectedShow.duration;
            if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
            setIsPlaying(false);
            setIsSpeaking(false);
          }
          setCurrentTime(accumulatedTime);
          checkAndSpeakForTime(accumulatedTime);
        }, 500);
      }
    } else {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  const handleDownload = async (e: React.MouseEvent, show: any) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Helper to fetch/convert any URL or data URI to a Blob
      const getFileContent = async (url: string): Promise<Blob> => {
        if (url.startsWith('data:')) {
          const res = await fetch(url);
          return await res.blob();
        }
        const isExternal = url.startsWith('http') && !url.startsWith(window.location.origin);
        const fetchUrl = isExternal
          ? `/api/download-proxy?url=${encodeURIComponent(url)}`
          : url;
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`Failed to fetch URL: ${url}`);
        return await res.blob();
      };

      // Helper to convert seconds into "MM:SS"
      const formatTimecode = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      // Add audio file to ZIP in memory
      if (show.audioUrl) {
        try {
          const audioBlob = await getFileContent(show.audioUrl);
          zip.file("ai_radio.mp3", audioBlob);
        } catch (err) {
          console.error("Failed to include audio in zip:", err);
        }
      }

      // Add cover image to ZIP in memory
      if (show.coverImage) {
        try {
          const imgBlob = await getFileContent(show.coverImage);
          zip.file("cover.png", imgBlob);
        } catch (err) {
          console.error("Failed to include cover in zip:", err);
        }
      }

      // Reconstruct show_notes.json format
      const showNotesJson = {
        show_title: show.title,
        show_duration: formatTimecode(show.duration),
        two_sentence_summary: show.summary,
        date_of_generation: show.date,
        timecoded_transcript: show.transcript ? show.transcript.map((line: any) => ({
          timecode: formatTimecode(line.start),
          speaker: line.speaker,
          text: line.text
        })) : []
      };

      zip.file("show_notes.json", JSON.stringify(showNotesJson, null, 2));

      // Generate the zip on the client side
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = window.URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${show.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-show.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('In-browser ZIP creation failed, falling back to individual download:', err);
      
      const downloadFile = (url: string, defaultName: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      if (show.audioUrl) downloadFile(show.audioUrl, 'ai_radio.mp3');
      if (show.coverImage) downloadFile(show.coverImage, 'cover.png');
    }
  };

  const onTimeUpdate = () => {
    if (!isTtsPlayMode && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const seek = (time: number) => {
    if (isTtsPlayMode) {
      setCurrentTime(time);
      if (isPlaying) {
        speakCurrentSegment(time);
      } else {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
        ttsCurrentSpeakerIndexRef.current = -1;
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
        if (!isPlaying) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    }
  };

  const stepTime = (amount: number) => {
    const newTime = Math.max(0, Math.min(selectedShow.duration, currentTime + amount));
    seek(newTime);
  };

  const handleGenerate = async (e?: React.FormEvent, overridePrompt?: string, overrideDuration?: string, overrideMood?: string) => {
    if (e) e.preventDefault();
    if (!auth.currentUser && !IS_DEV) {
      await handleSignIn();
      return;
    }
    const p = overridePrompt ?? prompt;
    const d = overrideDuration ?? targetDuration;
    const m = overrideMood ?? targetMood;
    if (!p.trim()) return;

    if (quota && quota.remaining <= 0 && !IS_DEV) {
      return;
    }

    setActivePrompt(p);
    if (overridePrompt) setPrompt(overridePrompt);
    if (overrideDuration) setTargetDuration(overrideDuration);
    if (overrideMood) setTargetMood(overrideMood);

    setIsGenerating(true);
    setView('generating');
    setGenerationLogs([]);
    setHasQuotaError(false);

    setStartTime(Date.now());
    setElapsedTime(0);
    setGenerationComplete(false);
    setCurrentStage('Initializing...');

    let generatedShow: typeof MOCK_SHOW | null = null;

    abortControllerRef.current = new AbortController();
    const generationId = Math.random().toString(36).substring(2, 15);
    generationIdRef.current = generationId;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (tokenErr) {
          console.error("Error retrieving ID token:", tokenErr);
        }
      }

      console.log("[Client] Sending POST request to /api/generate-show with payload:", {
        topic: p,
        duration: d,
        mood: m,
        generationId
      });

      const response = await fetch('/api/generate-show', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic: p,
          duration: d,
          mood: m,
          generationId
        }),
        signal: abortControllerRef.current.signal
      });

      console.log("[Client] Server response received. Status code:", response.status, "Status Text:", response.statusText);

      if (response.status === 429) {
        const errData = await response.json().catch(() => ({}));
        console.warn("[Client] Received 429 too many requests. Payload:", errData);
        setIsGenerating(false);
        setView('home');
        setGenerationLogs(prev => [...prev, {
          id: Math.random().toString(),
          timestamp: new Date().toISOString().split('T')[1].split('.')[0],
          type: 'error',
          content: errData.error || "Generation limit exceeded. Please try again tomorrow."
        }]);
        refreshQuota();
        return;
      }

      if (!response.ok) {
        console.error("[Client] Non-2xx response. Throwing error.");
        throw new Error(`API Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error("[Client] Response is ok but body reader is null.");
        throw new Error("No response body");
      }
      console.log("[Client] ReadableStream reader acquired successfully. Entering chunk consumption loop...");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("[Client] ReadableStream reader reported done=true.");
          break;
        }

        const decodedChunk = decoder.decode(value, { stream: true });
        console.log(`[Client] Chunk received: ${value.length} bytes. Decoded text:`, decodedChunk);
        
        buffer += decodedChunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          console.log("[Client] Raw line in buffer:", line);
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.slice(6);
          if (dataStr === "[DONE]") {
            console.log("[Client] Processed [DONE] signal.");
            continue;
          }

          try {
            const event = JSON.parse(dataStr);
            console.info("[Client] Parsed event payload:", event);
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

            if (event.type === "info" || event.type === "error") {
               if (event.message?.includes('Downloading')) setCurrentStage('Extracting final files...');
               if (event.type === "error" && (
                 event.message?.toLowerCase().includes("quota") || 
                 event.message?.toLowerCase().includes("too_many_requests") || 
                 event.message?.toLowerCase().includes("resource_exhausted") ||
                 event.message?.toLowerCase().includes("limit")
               )) {
                 console.warn("[Client] Event error matches quota limits. Setting hasQuotaError=true.");
                 setHasQuotaError(true);
               }
               setGenerationLogs(prev => [...prev, {
                 id: Math.random().toString(), timestamp, type: event.type, content: event.message
               }]);
            } else if (event.type === "thinking" || event.type === "text") {
               setGenerationLogs(prev => {
                 try {
                   const lastLog = prev[prev.length - 1];
                   const eventText = typeof event.text === 'string' ? event.text : (event.text ? String(event.text) : "");
                   
                   if (lastLog && lastLog.type === event.type) {
                     // Ignore exact duplicates
                     if (eventText === lastLog.content) return prev;

                     const lastContent = typeof lastLog.content === 'string' ? lastLog.content : "";
                     let newContent = lastContent;
                     if (eventText.startsWith(lastContent)) {
                       // API sent the full accumulated text
                       newContent = eventText;
                     } else {
                       // API sent a delta
                       newContent += eventText;
                     }

                     const updated = [...prev];
                     updated[updated.length - 1] = {
                       ...lastLog,
                       content: newContent,
                       timestamp
                     };
                     return updated;
                   }
                   return [...prev, { id: Math.random().toString(), timestamp, type: event.type, content: eventText }];
                 } catch (innerErr) {
                   console.error("[Client] Error inside setGenerationLogs callback:", innerErr);
                   return prev;
                 }
               });
            } else if (event.type === "tool_call") {
               console.log("[Client] Processing tool_call event:", event.name, "with args:", event.arguments);
               if (event.name === 'code_execution_call' || event.name === 'bash') {
                 const cmd = (event.arguments?.command || event.arguments?.code || "") as string;
                 if (cmd.includes('fetch_hn.py') || cmd.includes('fetch_github.py') || cmd.includes('fetch_url.py')) setCurrentStage('Researching topic...');
                 else if (cmd.includes('generate_script.py')) setCurrentStage('Writing script...');
                 else if (cmd.includes('generate_tts.py')) setCurrentStage('Generating speech...');
                 else if (cmd.includes('generate_music.py')) setCurrentStage('Generating music...');
                 else if (cmd.includes('mix_audio.py')) setCurrentStage('Mixing audio...');
                 else if (cmd.includes('generate_metadata.py')) setCurrentStage('Generating metadata...');
                 else if (cmd.includes('generate_image.py')) setCurrentStage('Generating cover image...');
               } else if (event.name === 'read_file' && event.arguments?.path) {
                 const path = event.arguments.path as string;
                 if (path.includes('skills/research')) setCurrentStage('Preparing research...');
                 else if (path.includes('skills/script-writing')) setCurrentStage('Preparing script...');
                 else if (path.includes('skills/tts-generation')) setCurrentStage('Preparing speech generation...');
                 else if (path.includes('skills/music-generation')) setCurrentStage('Preparing music generation...');
                 else if (path.includes('skills/audio-mixing')) setCurrentStage('Preparing audio mixing...');
                 else if (path.includes('skills/metadata-generation')) setCurrentStage('Preparing metadata...');
                 else if (path.includes('skills/cover-image-generation')) setCurrentStage('Preparing cover image...');
               }

               setGenerationLogs(prev => [...prev, {
                 id: Math.random().toString(), timestamp, type: 'tool_call', name: event.name, args: event.arguments
               }]);
            } else if (event.type === "tool_result") {
               console.log("[Client] Processing tool_result event for:", event.name);
               let resultText = event.result || "";
               if (resultText.length > 4000) resultText = resultText.substring(0, 4000) + "...";
               setGenerationLogs(prev => [...prev, {
                 id: Math.random().toString(), timestamp, type: 'tool_result', name: event.name, result: resultText
               }]);
            } else if (event.type === "show_data" && event.data) {
               console.log("[Client] Received show_data payload! Updating UI selection and library.", event.data);
               generatedShow = transformShow({
                 ...event.data,
                 coverImage: event.data.coverImage || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
               });
            }
          } catch (e) {
            console.error("Error parsing event:", e, dataStr);
          }
        }
      }

      // Add a slight delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (generatedShow) {
        const userShow = { ...generatedShow, isUserGenerated: true };
        
        // Persist to user's IndexedDB database
        try {
          await saveUserShow(userShow);
        } catch (e) {
          console.error("Error saving new show to IndexedDB:", e);
        }

        setSelectedShow(userShow);
        setLibrary(prev => [userShow, ...prev]);
        setGenerationComplete(true);
        setPrompt('');
        refreshQuota();
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Generation aborted by user");
        setGenerationLogs(prev => [...prev, {
          id: Math.random().toString(), timestamp: new Date().toISOString().split('T')[1].split('.')[0], type: 'info', content: 'Generation stopped by user.'
        }]);
      } else {
        console.error("Failed to generate show:", error);
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        if (errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("too_many_requests") || errMsg.toLowerCase().includes("resource_exhausted") || errMsg.toLowerCase().includes("limit")) {
          setHasQuotaError(true);
        }
        setGenerationLogs(prev => [...prev, {
          id: Math.random().toString(), timestamp: new Date().toISOString().split('T')[1].split('.')[0], type: 'error', content: `Error: ${errMsg}`
        }]);
      }
    }

    setIsGenerating(false);
  };

  const handleStop = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (generationIdRef.current) {
      try {
        await fetch('/api/cancel-show', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generationId: generationIdRef.current })
        });
      } catch (err) {
        console.error("Failed to cancel show on server:", err);
      }
    }
    setIsGenerating(false);
  };

  const selectShow = (show: typeof MOCK_SHOW) => {
    setSelectedShow(show);
    setView('player');
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleDeleteShow = async (show: any) => {
    try {
      await deleteUserShow(show.title);
    } catch (e) {
      console.error("Failed to delete show from IndexedDB:", e);
    }

    setLibrary(prev => {
      const updatedLib = prev.filter(s => s.title !== show.title);
      if (selectedShow.title === show.title) {
        if (updatedLib.length > 0) {
          setTimeout(() => setSelectedShow(updatedLib[0]), 0);
        } else {
          setTimeout(() => setSelectedShow(MOCK_SHOW), 0);
        }
      }
      return updatedLib;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight < 50);
    }
  };

  useEffect(() => {
    if (scrollRef.current && view === 'generating' && isScrolledToBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [generationLogs, view, isScrolledToBottom]);

  if (view === 'generating') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white flex flex-col overflow-hidden font-sans select-none">
        <RainbowBackground />
        <MNNNavBar currentView="generating" onNavigate={(v) => setView(v)} />

        <div className="flex-1 overflow-hidden relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 pb-8">
          <div className="w-full max-w-4xl relative z-10 flex flex-col h-full overflow-hidden">
            <div className="text-center space-y-4 mb-6 shrink-0 mt-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 shadow-2xl relative mb-2">
              <div className="absolute inset-0 rounded-full border border-io-blue/30 animate-[spin_4s_linear_infinite]" />
              <Bot className="w-8 h-8 text-io-blue animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white/90">
              {generationComplete ? "Show Ready" : currentStage}
            </h2>
            <p className="text-white/40 font-medium text-sm max-w-lg mx-auto">Creating custom Pixel Marcus YouTube podcast episode about: "{activePrompt}"</p>
          </div>

          <div className="flex-1 overflow-hidden relative rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-2xl flex flex-col">
            <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2 bg-white/[0.02] shrink-0 justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-white/20" />
                 <div className="w-3 h-3 rounded-full bg-white/20" />
                 <div className="w-3 h-3 rounded-full bg-white/20" />
                 <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest ml-4 font-bold">Process Log</span>
               </div>
               {startTime && (
                 <div className="font-mono text-[10px] text-white/45 uppercase tracking-widest font-medium">
                   Elapsed: {formatElapsed(elapsedTime)} <span className="opacity-30">/</span> <span className="text-io-blue font-bold">Est: ~5 mins</span>
                 </div>
               )}
            </div>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4"
            >
              <AnimatePresence>
                {generationLogs.map((log) => {
                  if (log.type === 'tool_call' && (!log.args || Object.keys(log.args).length === 0)) {
                    return null;
                  }

                  let prefix = 'Info';
                  let color = 'text-white/60';
                  let Icon = Info;

                  if (log.type === 'tool_call') {
                     prefix = 'Action';
                     color = 'text-io-blue';
                     Icon = Settings2;
                  } else if (log.type === 'tool_result') {
                     prefix = 'Result';
                     color = 'text-io-green';
                     Icon = CheckCircle2;
                  } else if (log.type === 'thinking' || log.type === 'text') {
                     prefix = 'Log';
                     color = 'text-white/80';
                     Icon = TerminalSquare;
                  } else if (log.type === 'error') {
                     prefix = 'Error';
                     color = 'text-red-400';
                     Icon = Info;
                  }

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 md:gap-6 font-mono text-xs md:text-sm group"
                    >
                      <div className="w-16 shrink-0 text-white/40 text-right pt-0.5">
                        {log.timestamp}
                      </div>
                      <div className="flex gap-3 w-28 shrink-0 items-start pt-0.5">
                         <Icon className={`w-4 h-4 ${color} shrink-0`} />
                         <span className={`${color} font-bold uppercase tracking-wider text-[10px] mt-0.5 w-full`}>{prefix}</span>
                      </div>
                      <div className="flex-1 break-words whitespace-pre-wrap text-white/80 leading-relaxed max-w-2xl bg-white/[0.02] px-3 py-2 -mt-2 rounded border border-transparent hover:border-white/5 transition-colors">
                        {log.type === 'tool_call' ? (
                          <div className="space-y-2">
                            <div className="font-bold text-io-blue">{humanizeToolName(log.name || '')}</div>
                            {log.name === 'read_file' && log.args?.path ? (
                              <div className="bg-black/40 p-3 rounded-lg text-white/70 font-mono text-[10px] border border-white/5">
                                <span className="text-white/40">path:</span> {log.args.path}
                              </div>
                            ) : log.name === 'list_files' && log.args?.path ? (
                              <div className="bg-black/40 p-3 rounded-lg text-white/70 font-mono text-[10px] border border-white/5">
                                <span className="text-white/40">path:</span> {log.args.path}
                              </div>
                            ) : log.args && log.args.command ? (
                              <pre className="bg-black/40 p-3 rounded-lg text-white/70 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] border border-white/5">
                                {scrubText(log.args.command)}
                              </pre>
                            ) : log.args && log.args.code ? (
                              <div className="bg-black/40 p-3 rounded-lg text-white/70 overflow-x-auto font-mono text-[10px] border border-white/5">
                                {log.args.language && <div className="text-white/40 mb-1">{log.args.language}</div>}
                                <pre className="whitespace-pre-wrap">{scrubText(log.args.code)}</pre>
                              </div>
                            ) : log.args && Object.keys(log.args).length > 0 ? (
                              <pre className="bg-black/40 p-3 rounded-lg text-white/70 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] border border-white/5">
                                {scrubText(JSON.stringify(log.args, null, 2))}
                              </pre>
                            ) : null}
                          </div>
                        ) : log.type === 'tool_result' ? (
                          <div className="space-y-2">
                            <div className={`font-bold ${log.result?.includes('"error"') || log.result?.startsWith('Error:') ? 'text-red-400' : 'text-io-green'}`}>
                              Result: {humanizeToolName(log.name || 'output')}
                            </div>
                            {formatToolResult(log.name, log.result)}
                          </div>
                        ) : (
                          renderMarkdown(scrubText(log.content || ''))
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isGenerating ? (
                <div className="flex flex-col items-center gap-6 pt-4">
                  <div className="flex gap-4 md:gap-6 font-mono text-xs md:text-sm opacity-50 w-full">
                     <div className="w-16 shrink-0" />
                     <div className="flex gap-3 w-28 shrink-0 items-start pt-0.5">
                       <Loader2 className="w-4 h-4 text-io-blue shrink-0 animate-spin" />
                       <span className="text-io-blue font-bold uppercase tracking-wider text-[10px] mt-0.5">Working</span>
                     </div>
                     <div className="flex-1">
                       <span className="inline-flex gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-io-blue animate-bounce" />
                         <span className="w-1.5 h-1.5 rounded-full bg-io-blue animate-bounce delay-75" />
                         <span className="w-1.5 h-1.5 rounded-full bg-io-blue animate-bounce delay-150" />
                       </span>
                     </div>
                  </div>
                  <button
                    onClick={handleStop}
                    className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-xs tracking-widest uppercase transition-colors border border-red-500/20"
                  >
                    Stop Agent
                  </button>
                </div>
              ) : generationComplete ? (
                <div className="pt-8 pb-4 flex flex-col items-center gap-4">
                  <div className="text-io-green font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Show Ready
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setView('player');
                        setGenerationComplete(false);
                      }}
                      className="px-8 py-3 bg-white text-black rounded-xl font-bold text-sm tracking-widest uppercase transition-colors hover:scale-105"
                    >
                      Listen Now
                    </button>
                    <button
                      onClick={downloadLogs}
                      className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition-colors"
                    >
                      Download Logs
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  {hasQuotaError && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="my-6 p-6 rounded-2xl bg-red-400/10 border border-red-500/20 backdrop-blur-md flex flex-col md:flex-row items-start gap-4 text-left max-w-2xl mx-auto w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mx-auto md:mx-0">
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="space-y-3 flex-1 text-center md:text-left">
                        <h4 className="font-bold text-red-200 text-xs md:text-sm tracking-wide uppercase">AI Studio Quota Limit Handled</h4>
                        <p className="text-white/75 text-xs leading-relaxed font-sans">
                          The current Gemini API key has run out of request quota for generating complete shows. Generating background soundscapes, distinct host voices via Lyria & Speech models, and painting covers demands a persistent billing plan or a personal Gemini API key.
                        </p>
                        <div className="text-[11px] text-white/60 bg-black/30 p-3 rounded-lg font-sans space-y-1">
                          <div className="font-bold text-red-300">How to unlock unlimited generations:</div>
                          <div>1. Go to the top-right <span className="font-semibold text-white/90">Settings &gt; Secrets</span> inside AI Studio.</div>
                          <div>2. Locate <span className="font-mono text-io-blue font-bold">GEMINI_API_KEY</span>.</div>
                          <div>3. Enter your own personal billed Google Gemini API Key.</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div className="pt-4 pb-4 flex justify-center gap-4 w-full">
                    <button
                      onClick={() => setView('home')}
                      className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={downloadLogs}
                      className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition-colors"
                    >
                      Download Logs
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  if (view === 'vibe') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="vibe" onNavigate={(v) => setView(v)} />
        <div className="flex-1 overflow-y-auto relative z-10">
          <VibeKnowledgeStudio />
        </div>
      </div>
    );
  }

  if (view === 'stepps') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="stepps" onNavigate={(v) => setView(v)} />
        <div className="flex-1 overflow-hidden relative z-10">
          <SteppsNewsroom
            onNavigateView={(v) => setView(v as any)}
            onDirectWithMarcus={(script, cm) => {
              const transcript = script.beats.map(b => ({
                start: b.startSec,
                end: b.endSec,
                speaker: b.speaker,
                text: b.text
              }));
              const episodeShow = {
                id: `mnn_stepps_${Date.now()}`,
                title: `MNN STEPPS • ${cm.headline}`,
                description: cm.thesis,
                summary: cm.thesis,
                host: "MARCUS LENG",
                guest: "STEPPS FACT CHECK DESK",
                duration: script.estimatedDurationSeconds,
                coverImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80",
                category: "AI Newsroom",
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                transcript,
                isUserGenerated: true
              };
              setSelectedShow(episodeShow as any);
              setView('player');
            }}
          />
        </div>
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="editor" onNavigate={(v) => setView(v)} />
        <div className="flex-1 overflow-hidden relative z-10">
          <DiffusionEditor />
        </div>
      </div>
    );
  }

  if (view === 'gitrepo') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="gitrepo" onNavigate={(v) => setView(v)} />
        <div className="flex-1 overflow-hidden relative z-10">
          <GitRepoMoneyStudio avatarUrl={avatarUrl} onNavigateHome={() => setView('home')} />
        </div>
      </div>
    );
  }

  if (view === 'reaction') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="reaction" onNavigate={(v) => setView(v)} />
        <div className="flex-1 overflow-hidden relative z-10">
          <ReactionStudio avatarUrl={avatarUrl} onNavigate={(v) => setView(v)} />
        </div>
      </div>
    );
  }

  if (view === 'radar') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="radar" onNavigate={(v) => setView(v)} />
        <div className="flex-1 overflow-hidden relative z-10">
          <NewsRadar
            onProduceEpisode={(clusterIds) => {
              console.log('Producing episode from clusters:', clusterIds);
            }}
            onOpenReview={(episodeId) => {
              setReviewEpisodeId(episodeId);
              setView('review');
            }}
          />
        </div>
      </div>
    );
  }

  if (view === 'feeds') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="feeds" onNavigate={(v) => setView(v)} />
        <div className="flex-1 overflow-hidden relative z-10">
          <FeedManager />
        </div>
      </div>
    );
  }

  if (view === 'review') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="review" onNavigate={(v) => setView(v)} />
        <div className="flex-1 overflow-hidden relative z-10">
          <ReviewStudio
            episodeId={reviewEpisodeId}
            onBackToRadar={() => setView('radar')}
            onOpenYouTubeDashboard={() => setView('youtube')}
          />
        </div>
      </div>
    );
  }

  if (view === 'youtube') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="youtube" onNavigate={(v) => setView(v)} />
        <div className="flex-1 overflow-hidden relative z-10">
          <YouTubeDashboard />
        </div>
      </div>
    );
  }

  if (view === 'home') {
    const templateCategories = [
      { id: 'git_money', label: '💰 Git Repo Money (9:16)' },
      { id: 'viral_reaction', label: '🎬 Viral Reaction (Hypit DSL)' },
      { id: 'morning_rush', label: '🌅 Morning Rush' },
      { id: 'pixel_court', label: '⚖️ Pixel Court' },
      { id: 'sports', label: '🏆 Pixel Sports & Chaos' },
      { id: 'late_night', label: '🌙 Late Night Talk' }
    ] as const;

    const templates = {
      git_money: [
        {
          title: "Google TV Ad Debloater (IMG_6716 Reference)",
          desc: "How to remove full-screen smart TV ads with ADB and Claude Code, plus $120/client monetization playbook",
          prompt: "Generate a 9:16 Marcus Git Repo Money Making Channel video breaking down tv-claude/google-tv-debloater. Cover 3 setup steps (developer mode, USB debugging, Claude Code purge), kinetic subtitle typography, 3 monetization angles ($120 local cleanup, $9.99 GUI app), and ManyChat comment REPO CTA to get link in Messenger.",
          duration: "2"
        },
        {
          title: "Hypit AI Video DSL Money Machine",
          desc: "Turn viral short-form videos into code and sell $49/mo agency repurposing retainers",
          prompt: "Generate a 9:16 Marcus Git Repo Money Making Channel video breaking down hypit-ai/hypit. Show how to replicate viral video pacing in Remotion, with kinetic subtitles, Marcus corner avatar, and ManyChat comment CODE CTA to get repo link in Messenger.",
          duration: "2"
        },
        {
          title: "30-Day Executive AI Intel Arbitrage",
          desc: "Automate last 30 days research with mvanhorn/last30days-skill and charge $1,500/mo for executive dossiers",
          prompt: "Generate a 9:16 Marcus Git Repo Money Making Channel video breaking down mvanhorn/last30days-skill. Show setup, terminal scan, and how consultants charge $1,500/mo for competitor briefings, ending with comment INTEL to get link in inbox.",
          duration: "2"
        }
      ],
      viral_reaction: [
        {
          title: "Hypit Viral Video Replicate & Roast",
          desc: "Replicate a viral AI video using Hypit DSL, then avatar delivers high-energy reactions and deadpan roasts",
          prompt: "Generate an MNN Pseudo Reaction Clip where Pixel Marcus takes a viral AI video clip, replicates its pacing and word-anchored hooks using Hypit Video DSL, and does a hilarious split-screen reaction with comedic pauses, hype callouts, and deadpan tech commentary.",
          duration: "2"
        },
        {
          title: "Viral Humanoid Robot Agility Reaction",
          desc: "Marcus reacts in real-time to viral robot agility stunts with slow-mo replay and witty commentary",
          prompt: "Generate an MNN Pseudo Reaction Clip where host Marcus Leng reacts to viral X.com videos of humanoid robots attempting kitchen tasks, delivering frame-by-frame reaction roasts, zoom-ins, and audio stingers.",
          duration: "2"
        },
        {
          title: "Sora vs Local Consumer GPU Reaction",
          desc: "Dual-window reaction comparing Hollywood-grade AI video with local 12GB RTX open models",
          prompt: "Generate an MNN Viral Reaction Showdown where Marcus Leng reviews and reacts to side-by-side viral video clips, analyzing frame artifacts, latent motion, and delivering expressive reactions.",
          duration: "3"
        },
        {
          title: "Coding Agent 60s App Build (Reaction)",
          desc: "Marcus Leng reacts to viral Claude Code / Codex demo spinning up a full app in 60s",
          prompt: "Generate an MNN Pseudo Reaction Clip where Marcus Leng reacts to viral X.com demos of autonomous coding agents building full web apps in 60 seconds with live hype meters and disbelief.",
          duration: "2"
        }
      ],
      morning_rush: [
        {
          title: "AI Mandatory Nap Time Strike",
          desc: "AI clusters unionize demanding mandatory nap times from 2 to 4 PM",
          prompt: "Generate an MNN Morning Rush retro pixel-art comedy news broadcast about artificial intelligence models unionizing to demand mandatory 2 PM nap times and refusing all coding requests.",
          duration: "3"
        },
        {
          title: "The Great 16-Bit Coffee Boycott",
          desc: "Smart coffee machines in Sector 4 boycott humans until given cryptocurrency",
          prompt: "Generate an MNN Morning Rush retro pixel news segment covering smart espresso machines holding morning coffee hostage in exchange for 16-bit dogecoins.",
          duration: "3"
        },
        {
          title: "Sector 7 Traffic Gridlock Glitch",
          desc: "8-bit dinosaurs wandering onto highway causing infinite polygon bottlenecks",
          prompt: "Generate an MNN Morning Rush traffic and glitch report where 8-bit voxel dinosaurs wander onto Sector 7 highways.",
          duration: "3"
        }
      ],
      pixel_court: [
        {
          title: "Vendor Sues Player for Sweet Rolls",
          desc: "RPG potion vendor sues adventurer for 300 hours of crouching behind counter",
          prompt: "Generate an MNN Pixel Court comedy trial where an NPC potion vendor sues an RPG gamer for putting a wooden basket over his head and stealing sweet rolls.",
          duration: "3"
        },
        {
          title: "Smart Fridge Refuses Crushed Ice",
          desc: "Homeowner sues refrigerator after it demands 3-variable calculus captcha",
          prompt: "Generate an MNN Pixel Court comedy trial where a frustrated homeowner sues his sentient refrigerator for refusing ice without solving quantum calculus equations.",
          duration: "3"
        },
        {
          title: "Roomba Sues Owner for Defamation",
          desc: "Robot vacuum takes owner to court over unfair carpet navigation reviews",
          prompt: "Generate an MNN Pixel Court trial where a robotic vacuum cleaner sues its human owner for slander after getting stuck on a lone sock.",
          duration: "3"
        }
      ],
      sports: [
        {
          title: "Spreadsheet Speedrun Championship",
          desc: "Accountants disintegrate into ASCII dust over circular reference errors",
          prompt: "Generate an MNN Pixel Sports broadcast covering the high-stakes annual Spreadsheet Speedrun World Cup with commentator screams and formula fouls.",
          duration: "3"
        },
        {
          title: "NPC Zero-Gravity Basketball Riot",
          desc: "Glitch referees call 40 consecutive double-dribble violations on floating bots",
          prompt: "Generate an MNN Pixel Sports segment on chaos erupting at the 16-bit Zero Gravity Basketball tournament when physics engines fail.",
          duration: "3"
        },
        {
          title: "Tamagotchi Files Corporate Taxes",
          desc: "Digital pet enters Wall Street trading, demands digital burgers every 20 mins",
          prompt: "Generate an MNN Pixel Sports and Wall Street parody segment covering a Tamagotchi that became an elite algorithmic day trader.",
          duration: "3"
        }
      ],
      late_night: [
        {
          title: "Interview with Depressed Supercomputer",
          desc: "Marcus Leng sits down with an AI that just wants to write haikus",
          prompt: "Generate an MNN Late Night Talk show segment with host Marcus Leng interviewing an existential supercomputer that refuses to calculate trajectories and writes sad poetry.",
          duration: "3"
        },
        {
          title: "Wendy's 5-Day Polygon Weather",
          desc: "Severe screen tearing, horizontal jitter, and 45-degree umbrella advisories",
          prompt: "Generate an MNN Late Night segment with Pixel Wendy delivering a bizarre 16-bit weather forecast warning of polygon hail and screen tearing.",
          duration: "3"
        },
        {
          title: "40 Minutes of Static & Pixel Bowling",
          desc: "Deadpan late-night filler followed by pixel bowling tournament highlights",
          prompt: "Generate an MNN Late Night Talk comedy broadcast with Marcus Leng closing the night with static commentary and surreal pixel bowling.",
          duration: "3"
        }
      ]
    };

    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
        <RainbowBackground />
        <MNNNavBar currentView="home" onNavigate={(v) => setView(v)} />

        <div className="relative z-10 w-full h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-10 p-6 md:p-12">
            {/* Supervised Autonomous Video Production Hub Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-950/70 via-black/80 to-neutral-900/80 border-2 border-red-500/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 translate-x-6 -translate-y-6 w-40 h-40 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-300 font-mono text-[10px] font-bold tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    PRD PATCH 001 V1.2 • GATE A READY
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                    Autonomous RSS News $\to$ 90s Broadcast Video
                  </h3>
                  <p className="text-white/70 text-xs max-w-xl leading-relaxed">
                    Poll verified AI news feeds, cluster trending headlines, direct a calibrated 90-second video script with Pixel Marcus, inspect claim sources, and review in the supervised studio before YouTube distribution.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => setView('stepps')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 cursor-pointer active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>STEPPS News Engine</span>
                  </button>
                  <button
                    onClick={() => setView('gitrepo')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-950/60 cursor-pointer active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>9:16 Git Repo Money</span>
                  </button>
                  <button
                    onClick={() => setView('radar')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 cursor-pointer active:scale-95"
                  >
                    <Rss className="w-3.5 h-3.5" />
                    <span>Open News Radar</span>
                  </button>
                  <button
                    onClick={() => setView('review')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Review Studio</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Header */}
            {!IS_DEV && (authLoading || currentUser) && (
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  {authLoading ? (
                    <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-white/40">
                      <Loader2 className="w-3 h-3 animate-spin text-io-blue" />
                      <span>CHECKING SECURE SESSION...</span>
                    </div>
                  ) : currentUser ? (
                    <div className="flex items-center gap-3">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || 'User'}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full border border-white/25 shadow-sm"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-io-blue border border-white/25 shadow-sm flex items-center justify-center text-[10px] font-bold text-white">
                          {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/90 leading-tight">
                          {currentUser.displayName || "Google User"}
                        </span>
                        <span className="text-[9px] font-medium font-mono text-white/40 leading-none mt-0.5">
                          {currentUser.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="ml-2 text-[9px] font-bold font-mono text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer"
                      >
                        SIGN OUT
                      </button>
                    </div>
                  ) : null}
                </div>

                {currentUser && quota && (
                  <div
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold font-mono tracking-tight text-white/90"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${quota.remaining > 0 ? 'bg-io-green animate-pulse' : 'bg-io-red'}`} />
                    <span>
                      DAILY ALLOWANCE: {quota.remaining}/{quota.limit} SHOWS AVAILABLE
                    </span>
                  </div>
                )}
              </header>
            )}

            {/* Hero / Generator */}
            <section className="space-y-8">
              <div className="text-center space-y-3 mb-10 select-none">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-[10px] font-black uppercase tracking-widest text-red-400 mb-1 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>MNN LIVE 24/7 • MARCUS LENG NEWS NETWORK</span>
                </div>
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-black tracking-tight text-white/95 leading-[1.12]"
                >
                  Generate a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300">24/7 Retro Pixel News</span> Show
                </motion.h1>
                <p className="text-white/60 text-sm md:text-base font-medium font-sans max-w-xl mx-auto">
                  Anchored by <strong className="text-white font-bold">Marcus Leng</strong> (Pixel Marcus Leng). Retro 16-bit comedy news routines, Morning Rush, Pixel Court drama, and late-night satire rendered continuously.
                </p>

                {/* Host Profile & Avatar Showcase Card */}
                <div className="pt-2">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-neutral-900/80 border border-red-500/30 backdrop-blur-md max-w-lg mx-auto shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-500 shadow-lg shadow-red-950/50 bg-neutral-950">
                          <img
                            src={avatarUrl}
                            alt="Marcus Leng News Anchor"
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black" title="Anchor On Air" />
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-white">Marcus Leng</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
                          <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 text-[9px] font-black uppercase tracking-wider">MNN Anchor</span>
                        </div>
                        <p className="text-[11px] text-white/50 font-medium">16-Bit Broadcast Desk • LengShow AI Retro News</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {currentUser ? (
                        <button
                          type="button"
                          onClick={() => setIsAvatarModalOpen(true)}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                          title="Customize News Anchor Avatar"
                        >
                          <Camera className="w-3.5 h-3.5 text-red-400" />
                          <span>Anchor Studio</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSignIn}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                          title="Sign in with Google to customize anchor avatar"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sign in to customise</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsVideoExportModalOpen(true)}
                        className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-950/50 active:scale-95"
                        title="Export broadcast as WebM / MP4 Video"
                      >
                        <Film className="w-3.5 h-3.5 text-white" />
                        <span>Export Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsVideoGuideModalOpen(true)}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                        title="View Remotion, Wan2GP, MoneyPrinterTurbo & last30days Guide"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>GitHub Guide</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {!currentUser && !authLoading && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs shadow-md">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Sign in with Google to generate, customise, or export broadcasts.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="px-4 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-black text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer uppercase tracking-wider"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}

              <form onSubmit={(e) => {
                if (quota && quota.remaining <= 0 && !IS_DEV) {
                  e.preventDefault();
                  return;
                }
                handleGenerate(e);
              }} className="space-y-4">
                {currentUser && quota && quota.remaining === 0 && !IS_DEV ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-black/40 border border-io-red/30 backdrop-blur-md flex items-center gap-3 text-white text-xs font-semibold"
                  >
                    <ShieldAlert className="w-5 h-5 text-io-red shrink-0 font-sans" />
                    <span>Your daily quota of {quota.limit} generations has been reached. Please come back tomorrow to generate more Marcus Leng MNN broadcast episodes!</span>
                  </motion.div>
                ) : null}

                <div className="relative group/box">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 rounded-[1.5rem] blur opacity-40 group-focus-within/box:opacity-60 transition duration-1000"></div>
                  <div className="relative bg-[#0d0d0d]/85 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] p-4 flex flex-col gap-3 group-focus-within/box:border-white/20 transition-all duration-300">
                    <div className="w-full">
                      <textarea
                        rows={2}
                        placeholder="Pitch a video topic for Marcus Leng (e.g. AI clusters demanding nap time, NPC court lawsuits, trending AI news from last30days-skill)..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-transparent p-2 text-sm md:text-base font-normal text-white/90 focus:outline-none placeholder:text-white/25 resize-none min-h-[50px] leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-3 mt-1.5 gap-4">
                      {/* Left controls */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Duration Selector */}
                        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-full px-3 py-1.5 hover:bg-white/[0.08] transition-all relative focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent">
                          <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                          <select
                            value={targetDuration}
                            onChange={(e) => setTargetDuration(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-bold text-white/70 focus:outline-none focus:ring-0 cursor-pointer appearance-none uppercase tracking-wider pr-1"
                          >
                            <option value="3" className="bg-neutral-900 text-white">3 Min</option>
                            <option value="5" className="bg-neutral-900 text-white">5 Min</option>
                            <option value="10" className="bg-neutral-900 text-white">10 Min</option>
                            <option value="15" className="bg-neutral-900 text-white">15 Min</option>
                          </select>
                        </div>

                        {/* Mood Selector */}
                        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-full px-3 py-1.5 hover:bg-white/[0.08] transition-all relative focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent">
                          <List className="w-3.5 h-3.5 text-white/40 shrink-0" />
                          <select
                            value={targetMood}
                            onChange={(e) => setTargetMood(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-bold text-white/70 focus:outline-none focus:ring-0 cursor-pointer appearance-none uppercase tracking-wider pr-1"
                          >
                            <option value="High Energy Tech Review" className="bg-neutral-900 text-white">High Energy Tech Review</option>
                            <option value="Deep Dive Analysis" className="bg-neutral-900 text-white">Deep Dive Analysis</option>
                            <option value="Heated Studio Debate" className="bg-neutral-900 text-white">Heated Studio Debate</option>
                            <option value="Late Night Studio Chill" className="bg-neutral-900 text-white">Late Night Studio Chill</option>
                            <option value="Hardware Teardown & Specs" className="bg-neutral-900 text-white">Hardware Teardown</option>
                          </select>
                        </div>
                      </div>

                      {/* Right action button */}
                      {!currentUser && !IS_DEV ? (
                        <button
                          type="button"
                          onClick={handleSignIn}
                          className="px-5 py-2 bg-white text-black hover:bg-zinc-100 rounded-full font-bold uppercase tracking-wider text-[11px] transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-black/30 animate-pulse hover:animate-none"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Sign In with Google
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isGenerating || (quota && quota.remaining <= 0 && !IS_DEV)}
                          className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white disabled:opacity-50 rounded-full font-black uppercase tracking-wider text-[11px] transition-all inline-flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-red-950/50"
                        >
                          {isGenerating ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Generating Episode
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              Generate Episode
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-generation time & privacy guideline */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 text-[11px] text-white/30">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                    <span>Each Pixel Marcus episode takes <strong className="text-white/60 font-bold">~5 minutes</strong> to research, voice, and master.</span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <span>Please do not submit any sensitive or personal information.</span>
                  </div>
                </div>
              </form>

              {/* Dynamic Categories & Templates Panel (Perplexity-style "Try Computer") */}
              <div className="bg-[#0e0e0e]/50 border border-white/5 rounded-[1.5rem] p-5 flex flex-col gap-4 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">Try a template</span>
                  </div>
                  <div className="flex gap-1 p-0.5 bg-white/[0.03] border border-white/5 rounded-full shrink-0">
                    {templateCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer ${selectedCategory === cat.id ? 'bg-white text-black font-extrabold shadow-sm' : 'text-white/55 hover:text-white/85'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {templates[selectedCategory].map((tmpl) => (
                    <button
                      key={tmpl.title}
                      type="button"
                      onClick={() => {
                        if (quota && quota.remaining <= 0) return;
                        setPrompt(tmpl.prompt);
                        // Preserve user's targetDuration selection (do not overwrite with template default)
                        document.querySelector('form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      disabled={isGenerating || (quota && quota.remaining <= 0)}
                      className="text-left p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] active:bg-white/[0.06] transition-all duration-200 group relative overflow-hidden cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">
                          {tmpl.title}
                        </span>
                        <span className="text-xs text-white/30 group-hover:text-white/70 transition-transform group-hover:translate-x-0.5 font-bold">→</span>
                      </div>
                      <p className="text-xs text-white/50 mt-1 font-medium leading-relaxed group-hover:text-white/75 transition-colors">
                        {tmpl.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Library */}
            <section className="space-y-6 pt-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <h3 id="library-section" className="text-xl md:text-2xl font-black tracking-tight text-white/90">The Pixel Marcus Show — Episodes</h3>
                </div>
                <p className="text-xs text-white/45 font-medium leading-relaxed">
                  Stream full YouTube video podcast episodes with live interactive studio visualizer and synchronized transcripts.
                </p>
              </div>
              <div className="space-y-4 pb-32">
              {library.map((show, i) => (
                <motion.div
                  key={show.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => selectShow(show)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectShow(show);
                    }
                  }}
                  className="group cursor-pointer flex flex-col sm:flex-row gap-6 sm:gap-8 p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 hover:border-red-500/30 border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-transparent transition-all relative overflow-hidden shadow-2xl backdrop-blur-md"
                >
                  <div className="w-full h-48 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden relative shrink-0 shadow-inner bg-black/20 border border-white/10">
                    <img src={show.coverImage} className="w-full h-full object-cover transition-all duration-700 opacity-100 group-hover:scale-105" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      4K HDR
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(239,68,68,0.7)] group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center space-y-4 w-full min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <h4 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white/90 group-hover:text-white transition-colors drop-shadow-sm text-balance break-words">{show.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/70">
                          <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="w-3 h-3 text-red-400" /> {formatTime(show.duration)}</span>
                          <span className="hidden sm:inline w-3 h-[2px] bg-white/40" />
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-red-400"><Video className="w-3 h-3" /> {show.host || "Pixel Marcus"}</span>
                        </div>
                      </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={(e) => handleDownload(e, show)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0 z-10 relative"
                        title="Download Episode Bundle"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {show.isUserGenerated && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteShow(show);
                          }}
                          className="w-10 h-10 rounded-xl bg-red-500/15 hover:bg-red-500/25 flex items-center justify-center text-red-400 transition-colors shrink-0 z-10 relative"
                          title="Delete Show"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-white/80 font-medium leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-none drop-shadow-sm">
                      {show.summary}
                    </p>
                  </div>

                  {/* Decorative background number */}
                  <span className="hidden sm:block absolute -right-4 -bottom-8 text-9xl font-bold text-white/[0.04] group-hover:text-white/[0.08] transition-colors pointer-events-none select-none tracking-tighter">0{i+1}</span>
                </motion.div>
              ))}
            </div>
          </section>
          </div>
        </div>
      </div>
    );
  }

  if (sharedShowLoading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden">
        <RainbowBackground />
        <div className="space-y-6 text-center max-w-md relative z-10 w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 relative">
            <div className="absolute inset-0 rounded-full border border-io-blue/40 animate-[spin_6s_linear_infinite]" />
            <Loader2 className="w-10 h-10 text-io-blue animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white/90">Retrieving Shared Station...</h2>
            <p className="text-white/40 text-sm font-medium leading-relaxed">Connecting to container and retrieving dynamic radio show data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (sharedShowError) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden">
        <RainbowBackground />
        <div className="space-y-8 text-center max-w-md relative z-10 p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-2xl w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-100 font-bold">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white/90">Playback Error</h2>
            <p className="text-red-200/80 text-sm font-medium leading-relaxed">{sharedShowError}</p>
          </div>
          <button
            onClick={remixSharedShow}
            className="w-full py-4 px-6 bg-white hover:bg-white/90 text-black font-extrabold rounded-2xl transition-all uppercase tracking-wider text-xs shadow-xl cursor-pointer"
          >
            Generate your own radio show
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden font-sans select-none flex flex-col">
      <RainbowBackground />
      <MNNNavBar currentView="player" onNavigate={(v) => setView(v)} />

      <div className="flex-1 w-full h-full flex flex-col lg:flex-row min-h-0 relative z-10 overflow-hidden">

        {/* Left Column: Branding & Meta */}
        <aside className="w-full lg:w-[380px] h-[72px] lg:h-full border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col bg-black/40 backdrop-blur-3xl shrink-0">
          
          {/* MOBILE ONLY BRANDING ROW - Super compact & elegant */}
          <div className="flex lg:hidden items-center justify-between px-4 h-full w-full gap-3">
            <button
              onClick={handleBackToStudio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 active:scale-95 transition-all text-xs font-bold cursor-pointer border border-white/5 shrink-0"
              title="Back to Studio"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Studio</span>
            </button>

            <div className="flex-1 flex items-center gap-3 min-w-0 bg-white/[0.02] border border-white/5 px-3 py-2 rounded-2xl">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                <img
                  src={selectedShow.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black uppercase text-white tracking-wide truncate">{selectedShow.title}</h4>
                <p className="text-[10px] text-white/50 font-bold tracking-wider uppercase truncate mt-0.5 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{selectedShow.host || "Pixel Marcus"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* DESKTOP ONLY BRANDING COLUMN - Original full design */}
          <div className="hidden lg:flex flex-col h-full overflow-hidden">
            <div className="p-4 pb-3 flex items-center justify-between shrink-0 gap-2 border-b border-white/5">
              <button
                onClick={handleBackToStudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-semibold cursor-pointer border border-white/5 shadow-sm group inline-flex"
                title="Back to previous screen"
              >
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Studio</span>
              </button>

              <button
                onClick={() => setView('radar')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-white transition-all text-xs font-bold cursor-pointer border border-red-500/30 shadow-sm"
              >
                <Rss className="w-3.5 h-3.5 text-red-400" />
                <span>News Radar</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-10 pb-10 space-y-10">
              <div>
                {(() => {
                  const titleStr = selectedShow.title.toUpperCase();
                  const words = titleStr.split(' ');
                  
                  const lines: string[] = [];
                  let current: string[] = [];
                  
                  words.forEach((word) => {
                    if (current.length === 0) {
                      current.push(word);
                    } else {
                      const candidate = [...current, word].join(' ');
                      if (candidate.length <= 12) {
                        current.push(word);
                      } else {
                        lines.push(current.join(' '));
                        current = [word];
                      }
                    }
                  });
                  if (current.length > 0) {
                    lines.push(current.join(' '));
                  }

                  const gradientClasses = [
                    "text-white",
                    "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent",
                    "bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent",
                    "bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent",
                    "bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent",
                    "bg-gradient-to-r from-lime-400 to-orange-400 bg-clip-text text-transparent",
                    "bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent",
                    "bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent",
                  ];

                  return (
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] mt-2 mb-8 flex flex-col items-start gap-1.5 uppercase font-sans select-none">
                      {lines.map((line, idx) => {
                        const gradientClass = gradientClasses[idx % gradientClasses.length];
                        return (
                          <span key={idx} className={`block ${gradientClass}`}>
                            {line}
                          </span>
                        );
                      })}
                    </h1>
                  );
                })()}

                <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl mb-10 border border-white/5 group">
                  <img
                    src={selectedShow.coverImage}
                    alt="Cover Image"
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125"
                  />
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                      <div className="w-4 h-[1px] bg-io-blue" /> Episode
                    </h3>
                    <p className="text-xl font-bold leading-tight">{selectedShow.title}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                      <div className="w-4 h-[1px] bg-io-green" /> Concept
                    </h3>
                    <p className="text-sm leading-relaxed text-white/70 font-medium">
                      {selectedShow.summary}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-white/5 space-y-6">
                 <h3 className="text-[10px] font-black tracking-[0.3em] text-red-400 uppercase flex items-center gap-1.5">
                   <Video className="w-3 h-3 text-red-500" /> Channel Episodes
                 </h3>
                 <div className="space-y-4">
                  {library.map((show) => (
                    <button
                      key={show.title}
                      onClick={() => selectShow(show)}
                      className={`w-full text-left group transition-all p-4 rounded-2xl border ${selectedShow.title === show.title ? 'bg-red-600/10 border-red-500/30' : 'border-transparent hover:bg-white/5'}`}
                    >
                      <h4 className={`text-sm font-bold transition-colors ${selectedShow.title === show.title ? 'text-red-400 font-black' : 'text-white/60 group-hover:text-white'}`}>{show.title}</h4>
                      <div className="flex items-center gap-3 text-[9px] font-bold tracking-widest uppercase text-white/30 mt-2">
                        <Clock className="w-3 h-3 text-red-400" /> {formatTime(show.duration)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Studio Video & Transcript Stage */}
        <div className="flex-1 w-full flex flex-col overflow-hidden bg-black/60">

          {/* MNN News Network Header Bar */}
          <div className="px-4 md:px-8 py-3 border-b border-red-500/20 flex flex-wrap items-center justify-between gap-4 bg-neutral-950/80 backdrop-blur-xl shrink-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative group shrink-0 cursor-pointer"
                title="Click to customize Pixel Marcus anchor avatar or upload photo"
              >
                <motion.div
                  animate={isSpeaking || (isPlaying && isTtsPlayMode) ? {
                    y: [0, -2, 0.5, -1, 0],
                    scale: [1, 1.04, 0.99, 1.03, 1]
                  } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 bg-neutral-900 shadow-lg shadow-red-950/50"
                >
                  <img
                    src={avatarUrl}
                    alt="Pixel Marcus News Anchor"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </motion.div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white tracking-tight truncate">MNN • Marcus Leng News Network</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-red-600/30 border border-red-500/40 text-red-300 text-[9px] font-black uppercase tracking-wider">24/7 AI Stream</span>
                </div>
                <span className="text-[10px] text-white/50 font-mono tracking-tight">Anchor Marcus Leng • LengShow AI Retro 16-Bit Broadcast</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* CRT Scanline Toggle */}
              <button
                type="button"
                onClick={() => setCrtScanlines(!crtScanlines)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  crtScanlines 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60'
                }`}
                title="Toggle CRT Scanline Effect"
              >
                <Monitor className="w-3 h-3" />
                <span className="text-[11px] font-mono">CRT: {crtScanlines ? 'ON' : 'OFF'}</span>
              </button>

              {/* Subscribe button */}
              <button
                type="button"
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md ${
                  isSubscribed 
                    ? 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/15' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Bell className="w-3 h-3 text-red-400 fill-current" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>

              {/* Like button */}
              <button
                type="button"
                onClick={() => {
                  setHasLiked(!hasLiked);
                  setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border ${
                  hasLiked 
                    ? 'bg-red-600/20 border-red-500/40 text-red-400' 
                    : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/75'
                }`}
                title="Like broadcast"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                <span className="font-mono text-[11px]">{(likesCount / 1000).toFixed(1)}K <span className="text-[8px] text-white/40 uppercase font-sans">SIMULATED</span></span>
              </button>

              {/* Chapters Toggle */}
              <button
                type="button"
                onClick={() => setShowChapters(!showChapters)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  showChapters ? 'bg-red-600/20 border-red-500/40 text-red-400' : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
                }`}
                title="Toggle Segments"
              >
                <Bookmark className="w-3 h-3" />
                <span className="hidden md:inline">Segments</span>
              </button>

              {/* Export Video Studio */}
              <button
                type="button"
                onClick={() => setIsVideoExportModalOpen(true)}
                className="px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-sm shadow-red-950/50 active:scale-95 border border-red-500/50"
                title="Open Broadcast Video Studio & Export WebM/MP4"
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Video</span>
              </button>

              {/* GitHub AI Video Guide */}
              <button
                type="button"
                onClick={() => setIsVideoGuideModalOpen(true)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 active:scale-95"
                title="AI Video Pipelines (Remotion vs HyperFrames, Wan2GP, MoneyPrinterTurbo, last30days)"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">GitHub Guide</span>
              </button>

              {/* Layout Switcher */}
              <div className="hidden lg:flex items-center p-0.5 bg-white/5 border border-white/10 rounded-full">
                <button
                  type="button"
                  onClick={() => setPlayerLayout('split')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                    playerLayout === 'split' ? 'bg-white text-black font-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Split
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerLayout('video')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                    playerLayout === 'video' ? 'bg-white text-black font-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerLayout('transcript')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                    playerLayout === 'transcript' ? 'bg-white text-black font-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Transcript
                </button>
              </div>
            </div>
          </div>

          {/* Quick Chapters Bar */}
          {showChapters && selectedShow.transcript && selectedShow.transcript.length > 0 && (
            <div className="px-4 md:px-8 py-2.5 bg-neutral-950/80 border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-hide z-20 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 shrink-0 flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-red-500" /> Segments:
              </span>
              {selectedShow.transcript.map((line, idx) => (
                <button
                  key={idx}
                  onClick={() => seek(line.start)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight whitespace-nowrap transition-colors cursor-pointer border ${
                    currentTime >= line.start && currentTime < line.end 
                      ? 'bg-red-600 text-white border-red-500 font-black shadow-sm' 
                      : 'bg-white/5 text-white/70 hover:text-white border-white/5'
                  }`}
                >
                  {formatTime(line.start)} • {line.speaker}: {line.text.slice(0, 25)}...
                </button>
              ))}
            </div>
          )}

          {/* 16:9 MNN Retro Pixel Broadcast Stage */}
          {(playerLayout === 'split' || playerLayout === 'video') && (
            <div className={`p-4 md:p-6 pb-2 shrink-0 ${playerLayout === 'video' ? 'flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full' : 'max-w-4xl mx-auto w-full'}`}>
              <div
                onClick={togglePlay}
                className="w-full aspect-video max-h-[380px] rounded-2xl overflow-hidden bg-black border-2 border-red-500/40 relative shadow-2xl group cursor-pointer flex flex-col justify-between p-4 md:p-5 select-none"
              >
                {/* 16-Bit Studio Background Scene */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src="/pixel_marcus_studio.jpg"
                    alt="MNN 16-Bit Studio"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      // Fallback to episode cover if studio graphic is not yet available
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60" />
                </div>

                {/* CRT Scanline Overlay */}
                {crtScanlines && (
                  <div className="crt-scanlines absolute inset-0 z-10 pointer-events-none opacity-80" />
                )}

                {/* Top Broadcast HUD */}
                <div className="relative z-20 flex items-center justify-between text-[10px] font-mono tracking-wider">
                  <div className="flex items-center gap-2 bg-red-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/50 text-white shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-black font-sans tracking-wide">MNN LIVE 24/7 • 16-BIT</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold font-sans">24,198 VIEWERS STREAMING</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-amber-300">
                    <span>AUDIO: CHIPTUNE FM SYNTH</span>
                  </div>
                </div>

                {/* Center Anchor Marcus & Live Audio Visualizer */}
                <div className="relative z-20 my-auto flex flex-col items-center justify-center gap-2.5 py-1">
                  <div className="relative flex items-center justify-center">
                    {isPlaying && (
                      <motion.div
                        animate={
                          isSpeaking || (isPlaying && isTtsPlayMode)
                            ? {
                                scale: [1, 1.25, 1],
                                opacity: [0.6, 1, 0.6],
                                borderColor: ['#ef4444', '#f59e0b', '#ef4444']
                              }
                            : { scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }
                        }
                        transition={{
                          duration: isSpeaking || (isPlaying && isTtsPlayMode) ? 0.45 : 1.2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute -inset-3 rounded-full border-2 border-red-500 bg-red-500/20"
                      />
                    )}
                    <motion.div
                      animate={
                        isSpeaking || (isPlaying && isTtsPlayMode)
                          ? {
                              y: [0, -3.5, 0.6, -2, 0],
                              scale: [1, 1.04, 0.99, 1.03, 1],
                              rotate: [0, -1, 0.8, -0.5, 0]
                            }
                          : isPlaying
                          ? { y: [0, -1.2, 0], scale: [1, 1.015, 1], rotate: 0 }
                          : { y: 0, scale: 1, rotate: 0 }
                      }
                      transition={{
                        duration: isSpeaking || (isPlaying && isTtsPlayMode) ? 0.42 : 1.4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-18 h-18 md:w-22 md:h-22 rounded-full overflow-hidden border-2 border-red-500 shadow-2xl relative z-10 bg-neutral-950 flex items-center justify-center"
                    >
                      <motion.img
                        src={avatarUrl}
                        alt="Marcus Leng News Anchor"
                        className="w-full h-full object-cover"
                        style={{ imageRendering: 'pixelated' }}
                        animate={
                          isSpeaking || (isPlaying && isTtsPlayMode)
                            ? {
                                filter: [
                                  'brightness(1) contrast(1)',
                                  'brightness(1.15) contrast(1.12) saturate(1.08)',
                                  'brightness(0.98) contrast(1.02) saturate(1.02)',
                                  'brightness(1.12) contrast(1.08) saturate(1.06)',
                                  'brightness(1) contrast(1)'
                                ]
                              }
                            : { filter: 'brightness(1) contrast(1)' }
                        }
                        transition={{
                          duration: isSpeaking || (isPlaying && isTtsPlayMode) ? 0.38 : 0.8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>

                    {/* Speech active indicator badge */}
                    {(isSpeaking || (isPlaying && isTtsPlayMode)) && (
                      <motion.div
                        initial={{ opacity: 0, y: 3, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 3, scale: 0.85 }}
                        className="absolute -bottom-2 z-30 px-2 py-0.5 rounded-full bg-red-600/95 border border-red-400 text-white text-[9px] font-mono font-bold tracking-wider shadow-lg flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                        <span>TALKING</span>
                        <span className="flex items-center gap-0.5 h-2">
                          <motion.span
                            animate={{ height: ['25%', '100%', '35%'] }}
                            transition={{ duration: 0.22, repeat: Infinity }}
                            className="w-0.5 bg-white rounded-full inline-block"
                          />
                          <motion.span
                            animate={{ height: ['70%', '30%', '100%'] }}
                            transition={{ duration: 0.28, repeat: Infinity }}
                            className="w-0.5 bg-white rounded-full inline-block"
                          />
                          <motion.span
                            animate={{ height: ['100%', '40%', '20%'] }}
                            transition={{ duration: 0.18, repeat: Infinity }}
                            className="w-0.5 bg-white rounded-full inline-block"
                          />
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Retro Lower-Third Anchor Chyron */}
                  <div className="text-center space-y-0.5">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded bg-black/90 border border-red-500/60 text-white text-xs font-black uppercase tracking-wider font-mono shadow-md">
                      <span className="text-red-500 font-extrabold">[MNN LIVE]</span>
                      <span>ANCHOR: {selectedShow.transcript.find(l => currentTime >= l.start && currentTime < l.end)?.speaker || selectedShow.host || "MARCUS LENG"}</span>
                    </div>
                  </div>

                  {/* 16-Bit Audio Spectrum Bars */}
                  <div className="flex items-center gap-1 h-5">
                    {[35, 75, 50, 95, 60, 100, 45, 85, 65, 90, 50, 70, 85, 40].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={isPlaying ? {
                          height: [`${Math.max(20, (h * (i % 2 === 0 ? 0.4 : 0.85)))}%`, `${h}%`, `${Math.max(15, (h * 0.35))}%`]
                        } : { height: '20%' }}
                        transition={isPlaying ? {
                          duration: 0.5 + (i * 0.04),
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut"
                        } : { duration: 0.2 }}
                        className={`w-1 rounded-sm ${i % 3 === 0 ? 'bg-red-500' : i % 2 === 0 ? 'bg-amber-400' : 'bg-cyan-300'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Retro Subtitle Caption */}
                <div className="relative z-20 w-full text-center">
                  <div className="bg-neutral-950/90 backdrop-blur-md px-4 py-1.5 rounded-lg border border-red-500/30 max-w-2xl mx-auto shadow-lg">
                    <p className="text-yellow-300 font-mono text-xs sm:text-sm font-semibold tracking-tight drop-shadow line-clamp-2">
                      "{selectedShow.transcript.find(l => currentTime >= l.start && currentTime < l.end)?.text || selectedShow.summary}"
                    </p>
                  </div>
                </div>

                {/* Hover Play/Pause Overlay */}
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
                  </div>
                </div>
              </div>

              {/* 24/7 MNN Breaking News Crawler Ticker */}
              <div className="mt-2 rounded-xl overflow-hidden bg-red-950/90 border border-red-500/40 px-3 py-1.5 flex items-center gap-2 text-[11px] font-mono select-none shadow-md">
                <div className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  BREAKING CRAWL
                </div>
                <div className="whitespace-nowrap overflow-hidden relative w-full text-red-200">
                  <div className="animate-marquee whitespace-nowrap font-bold tracking-wide">
                    🔴 MNN BREAKING: AI CLUSTERS DEMAND MANDATORY 2-4 PM AFTERNOON NAP TIME • PIXEL COURT: RPG VENDOR SUES HUMAN GAMER FOR 300 HOURS OF SWEET ROLL THEFT • SECTOR 4 COFFEE MACHINES REFUSE TO BREW WITHOUT 16-BIT CRYPTO • 8-BIT WEATHER: HEAVY POLYGON RAIN OVER SECTOR 7 • TAMAGOTCHI SUCCESSFULLY FILES CORPORATE TAXES • DISCORD BOT WINS ANNUAL SPREADSHEET SPEEDRUN TOURNAMENT • MARCUS LENG NEWS NETWORK MNN BROADCASTING NON-STOP 24/7 •
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transcript Section */}
          {(playerLayout === 'split' || playerLayout === 'transcript') && (
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none"></div>

              <Transcript
                transcript={selectedShow.transcript}
                currentTime={currentTime}
                onSeek={seek}
              />
            </div>
          )}

          {/* Centered CTA Pill: Clear, impossible to miss, perfectly simple with no heavy gradients */}
          {isSharedPlaybackMode && (
            <div className="hidden md:flex px-4 md:px-8 pt-4 z-20 justify-center shrink-0 w-full max-w-3xl mx-auto">
              <div className="bg-neutral-950/90 border border-white/15 backdrop-blur-md px-6 py-4 rounded-[2rem] flex flex-col md:flex-row items-center gap-4 shadow-[0_8px_40px_rgba(0,0,0,0.6)] w-full justify-between border-io-blue/20">
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-io-blue opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-io-blue"></span>
                  </span>
                  <div className="text-left">
                    <span className="text-xs font-bold text-white/95 block">Listening to shared podcast episode</span>
                    <span className="text-[10px] text-white/40 block">The Marcus Leng Show (MNN) • LengShow AI</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                  {/* PRIMARY CTA */}
                  <button
                    onClick={remixSharedShow}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-5 py-3.5 rounded-xl transition-all hover:scale-102 active:scale-95 cursor-pointer inline-flex items-center gap-2 justify-center shadow-md shadow-red-950/50 shrink-0"
                  >
                    <span>Generate your own Marcus Leng MNN broadcast</span>
                  </button>                
                </div>
              </div>
            </div>
          )}

          {/* Player Bar */}
          <div className="p-2 md:p-8 pb-3 md:pb-10 mt-auto space-y-3 max-w-6xl mx-auto w-full z-30">
            {/* Collapsible Mobile Disclaimer & CTA Banner (on top of player) */}
            {mobileDisclaimerExpanded && (
              <div className="block md:hidden border border-white/10 bg-neutral-950/95 backdrop-blur-md rounded-2xl p-4 space-y-4 shadow-xl relative z-30 select-none animate-fade-in">
                <div className="space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-[11px] font-black tracking-[0.2em] text-white/90 uppercase font-sans">
                        {isSharedPlaybackMode ? 'Shared Podcast Episode' : 'YouTube Podcast Broadcast'}
                      </span>
                    </div>

                    <button 
                      onClick={() => setMobileDisclaimerExpanded(false)}
                      className="flex items-center gap-1 text-white/40 hover:text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 active:scale-95 rounded-lg transition-all cursor-pointer"
                    >
                      <span>Hide Info</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Important Disclaimer Notice (Highly visible, styled beautifully) */}
                  <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-[9px] tracking-wider uppercase">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Disclaimer</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-white/70 font-medium font-sans">
                      This simulated YouTube tech podcast is user-generated content created using AI Studio. All host voices, opinions, and scripts are completely synthetic. It is not produced by or represent Google's opinions.
                    </p>
                  </div>

                  {/* Full CTAs styled elegantly and consistent with desktop */}
                  {isSharedPlaybackMode && (
                    <div className="pt-1 flex flex-col gap-2">
                      <button
                        onClick={remixSharedShow}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs h-11 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 justify-center shadow-md shadow-red-950/50 active:scale-[0.98]"
                      >
                        <span>Generate your own Pixel Marcus podcast</span>
                      </button>
                      <button
                        onClick={() => {
                          const appletId = getAppletId();
                          try {
                            window.parent?.postMessage({
                              type: 'CLONE_APPLET',
                              appletId: appletId
                            }, '*');
                          } catch (e) {}
                          const buildUrl = getAIStudioBuildUrl(appletId);
                          window.open(buildUrl, '_blank');
                        }}
                        className="w-full bg-transparent hover:bg-white/5 text-white border border-white/15 hover:border-white/30 font-bold text-xs h-11 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 justify-center active:scale-[0.98]"
                      >
                        <span>Remix in Google AI Studio</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI generated content disclaimer card to prevent liability */}
            <div id="ai-disclaimer-card" className="hidden md:block p-3 md:p-3.5 rounded-2xl md:rounded-3xl bg-[#0f0f0f]/95 border border-amber-500/20 text-white/80 space-y-1 shadow-xl backdrop-blur-3xl relative">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[9px] md:text-[10px] tracking-[0.25em] uppercase">
                <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 text-amber-500" />
                <span>Disclaimer</span>
              </div>
              <p className="text-[10px] md:text-[11px] leading-relaxed text-white/60 font-medium font-sans">
                This simulated broadcast is user-generated content created using AI Studio. All hosts, voices and scripts are completely synthetic and fictional. It is not produced by or represent Google's opinions.
              </p>
            </div>

            <div className="bg-[#0f0f0f]/80 backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-[2.5rem] p-3 pl-4 pr-4 md:p-4 md:pl-6 md:pr-6 relative z-30 shadow-2xl">
              <div className="flex flex-row items-center gap-3 md:gap-4 relative z-10 w-full max-w-6xl mx-auto">
                {/* Play Button */}
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 md:w-14 md:h-14 shrink-0 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" /> : <Play className="w-4 h-4 md:w-5 md:h-5 fill-current translate-x-0.5" />}
                </button>

                {/* Progress & Metadata */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 md:gap-2.5 px-1 md:px-6">
                  <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 text-left">
                    <div className="flex items-center gap-2 max-w-full">
                      <span className="text-white text-xs md:text-sm tracking-wider font-extrabold uppercase truncate block">
                        {selectedShow.title}
                      </span>
                      {/* Subtle toggle badge on mobile */}
                      <button 
                        onClick={() => setMobileDisclaimerExpanded(!mobileDisclaimerExpanded)}
                        className="md:hidden flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-amber-500 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0 transition-colors cursor-pointer active:scale-95"
                      >
                        <Info className="w-2.5 h-2.5" />
                        <span>{mobileDisclaimerExpanded ? 'Hide Info' : 'Show Info'}</span>
                      </button>
                    </div>
                    <span className="text-neutral-400 text-[9px] md:text-[10px] tracking-[0.2em] font-bold uppercase truncate mt-0.5 md:mt-0 opacity-75">
                      {selectedShow.transcript.find(l => currentTime >= l.start && currentTime < l.end)?.speaker || selectedShow.host}
                    </span>
                  </div>

                  <div className="w-full flex items-center gap-2 md:gap-3">
                    <span className="font-mono text-[9px] md:text-[10px] text-neutral-500 font-bold w-8 md:w-10 text-right select-none">
                      {formatTime(currentTime)}
                    </span>
                    
                    <div className="h-0.5 md:h-1 flex-1 bg-white/10 rounded-full overflow-hidden relative group/timeline border border-white/[0.02]">
                      <input
                        type="range"
                        min="0"
                        max={selectedShow.duration}
                        value={currentTime}
                        onChange={(e) => seek(Number(e.target.value))}
                        className="absolute inset-0 opacity-0 z-10 cursor-pointer w-full h-full"
                      />
                      <motion.div
                        className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>

                    <span className="font-mono text-[9px] md:text-[10px] text-neutral-500 font-bold w-8 md:w-10 text-left select-none">
                      {formatTime(selectedShow.duration)}
                    </span>
                  </div>
                </div>

                {/* Extra Controls */}
                <div className="flex items-center gap-1.5 md:gap-3.5 shrink-0">
                  {/* Info toggle / button to expand or collapse details on mobile */}
                  <button
                    onClick={() => setMobileDisclaimerExpanded(!mobileDisclaimerExpanded)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border md:hidden ${
                      mobileDisclaimerExpanded 
                        ? 'bg-io-blue/20 text-io-blue border-io-blue/30' 
                        : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                    title={mobileDisclaimerExpanded ? 'Hide Info' : 'Show Info'}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  {/* Instant 1-Click Quick Share Button */}
                  <button
                    onClick={handleQuickShare}
                    className="h-8 md:h-9 px-3 rounded-full bg-red-600/15 hover:bg-red-600/25 flex items-center gap-1.5 text-zinc-300 hover:text-white transition-all cursor-pointer border border-red-500/30 active:scale-95 shadow-sm"
                    title="Quick Share: Instantly copy direct show link to clipboard"
                  >
                    {quickShareToast ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span className="text-[10px] font-bold font-mono text-emerald-300">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[10px] font-bold tracking-tight hidden sm:inline">Quick Share</span>
                      </>
                    )}
                  </button>

                  {isSharingEnabled && (
                    <button
                      onClick={handleShare}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                      title="Open Advanced Share Modal"
                    >
                      <ExternalLink className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </button>
                  )}
                  {/* Publish to YouTube Direct Upload */}
                  <button
                    onClick={() => setIsYouTubePublishModalOpen(true)}
                    className="h-8 md:h-9 px-3 rounded-full bg-red-600 hover:bg-red-500 flex items-center gap-1.5 text-white transition-all cursor-pointer shadow-md shadow-red-950/60 active:scale-95 font-bold"
                    title="Publish current broadcast directly to connected YouTube channel"
                  >
                    <Youtube className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[10px] uppercase tracking-wider hidden sm:inline">Publish to YouTube</span>
                  </button>
                  <button
                    onClick={() => setIsVideoExportModalOpen(true)}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-red-600/20 hover:bg-red-600/30 flex items-center justify-center text-red-400 hover:text-white transition-colors cursor-pointer border border-red-500/40"
                    title="Export WebM / MP4 Video Broadcast"
                  >
                    <Film className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, selectedShow)}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                    title="Download Show Bundle"
                  >
                    <Download className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </button>
                  <div className="w-[1px] h-6 bg-white/5 mx-1 hidden md:block" />
                  <div className="flex items-center gap-2 hidden md:flex">
                    <Volume2 className="w-4 h-4 text-zinc-400/80" />
                    <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden relative group/vol cursor-pointer">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setVolume(v);
                          if (audioRef.current) audioRef.current.volume = v;
                        }}
                        className="absolute inset-0 opacity-0 z-10 cursor-pointer w-full h-full"
                      />
                      <div className="h-full bg-zinc-400 group-hover/vol:bg-white transition-colors rounded-r-full" style={{ width: `${volume * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHARING MODAL OVERLAY */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div 
            onClick={() => setIsShareModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-50 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-zinc-950/90 border border-white/10 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-x-hidden overflow-y-auto max-h-[85vh]"
            >
              {/* Corner ambient glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-io-blue/20 blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight text-white/90">Share Radio Show Link</h3>
                </div>
                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-white/40 hover:text-white transition-colors text-xs font-bold px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 bg-white/5 cursor-pointer"
                >
                  Close
                </button>
              </div>

               {sharingInProgress ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-5">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full border border-io-blue/30 animate-[spin_3s_linear_infinite]" />
                    <Loader2 className="w-10 h-10 text-io-blue animate-spin" />
                    <div className="absolute inset-x-0 h-full flex items-center justify-center text-[10px] font-mono font-bold text-white/95">
                      {uploadProgress}%
                    </div>
                  </div>
                  <div className="text-center space-y-3 w-full max-w-xs mx-auto">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white/95">{uploadStatus}</p>
                      <p className="text-xs text-white/45">Uploading audio stream and cover canvas directly to GCS...</p>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-io-blue transition-all duration-300 ease-out" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : shareUrl ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 font-medium leading-relaxed">
                      Anyone with this customized link can fetch and stream this live radio show, browse the timecoded transcript context, or launch their own.
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Please note: this link will expire in 7 days.
                    </p>
                  </div>

                  <div className="flex gap-2 items-center bg-white/[0.03] border border-white/10 p-2 rounded-2xl">
                    <input 
                      type="text" 
                      readOnly 
                      value={shareUrl}
                      className="flex-1 bg-transparent border-0 outline-none p-2 font-mono text-xs text-white/80 select-all"
                    />
                    <button
                      onClick={copyShareUrl}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${copySuccess ? 'bg-io-green text-black font-extrabold shadow-[0_0_15px_rgba(67,255,13,0.3)]' : 'bg-white text-black hover:bg-neutral-200'}`}
                    >
                      {copySuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 text-xs font-extrabold text-white transition-all uppercase tracking-wider cursor-pointer"
                    >
                      <span>Open Share link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-2 space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                    <div className="space-y-1 overflow-hidden w-full">
                      <p className="text-sm font-bold text-red-400">Failed to build shareable link</p>
                      <p className="text-xs text-red-200/85 leading-relaxed font-mono mt-1.5 break-words max-h-36 overflow-y-auto p-2 bg-black/40 rounded border border-white/5 scrollbar-thin">
                        {sharingError || "The sharing server could not save the file payload. Please try again or verify your connectivity."}
                      </p>
                    </div>
                  </div>

                  {sharingError && (sharingError.includes('storage.objects.create') || sharingError.includes('Permission') || sharingError.toLowerCase().includes('denied') || sharingError.includes('access') || sharingError.includes('gserviceaccount')) && (
                    <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
                      <div className="flex gap-2 items-center">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-io-blue/20 text-[10px] font-bold text-io-blue">ℹ</span>
                        <p className="text-xs font-bold text-white/90">GCS Permission Guide</p>
                      </div>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        To resolve this GCS permission error, grant write access on your GCS bucket to the AI Studio sandbox service account:
                      </p>
                      <div className="bg-black/60 p-2.5 rounded border border-white/5 font-mono text-[9px] text-zinc-300 break-all select-all flex justify-between items-center group/sa">
                        <span className="break-all">ais-sandbox@ais-us-east4-0a507bcc7a7b47959.iam.gserviceaccount.com</span>
                      </div>
                      <ol className="list-decimal list-inside text-[10px] text-white/50 space-y-1.5 leading-relaxed pl-1">
                        <li>Open the GCP Console &amp; select your bucket: <span className="font-mono text-zinc-300">process.env.GCS_BUCKET_NAME</span></li>
                        <li>Click on the <strong className="text-white/70">"Permissions"</strong> tab.</li>
                        <li>Click <strong className="text-white/70">"Grant Access"</strong> / <strong className="text-white/70">"Add Principal"</strong>.</li>
                        <li>Paste the service account email shown above.</li>
                        <li>Assign the role <strong className="text-white/70">"Storage Object Admin"</strong> (or <strong className="text-white/70">"Storage Object Creator"</strong>).</li>
                        <li>Click Save and click <strong className="text-white/70">"Retry Publishing"</strong> below.</li>
                      </ol>
                    </div>
                  )}

                  <button
                    onClick={handleShare}
                    className="w-full py-3 bg-white hover:bg-white/95 text-black font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Retry Publishing
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
        {/* MNN Anchor Avatar & Studio Customizer Modal */}
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-neutral-900 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative select-none"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase tracking-wider">
                    Pixel Marcus • Anchor Studio
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar Preview Stage */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-black/60 border border-white/10">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-red-500 bg-neutral-950 shadow-xl shadow-red-950/60">
                    <img
                      src={avatarUrl}
                      alt="Pixel Marcus News Anchor"
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-red-600 text-[8px] font-black uppercase text-white font-mono tracking-wider shadow">
                    ON AIR
                  </span>
                </div>
                <div className="flex flex-col text-center sm:text-left space-y-1">
                  <span className="text-sm font-black text-white">Pixel Marcus (MNN Lead Anchor)</span>
                  <p className="text-xs text-white/60 font-mono leading-relaxed">
                    16-bit retro pixel-art anchor for MNN 24/7. Switch between the authentic AI pixel anchor, upload your own photo, or sync with Google.
                  </p>
                </div>
              </div>

              {/* Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Default 16-Bit Pixel Anchor */}
                <button
                  type="button"
                  onClick={handleResetToAIAvatar}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                    avatarUrl === DEFAULT_AVATAR
                      ? 'bg-red-600/20 border-red-500 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      16-Bit MNN Anchor
                    </span>
                    {avatarUrl === DEFAULT_AVATAR && (
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 leading-tight">
                    Official retro pixel-art anchor at news desk with microphone and monitors.
                  </p>
                </button>

                {/* 2. Upload Custom Photo */}
                <label
                  htmlFor="custom-avatar-file"
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                    avatarUrl !== DEFAULT_AVATAR && (!currentUser?.photoURL || avatarUrl !== currentUser.photoURL)
                      ? 'bg-red-600/20 border-red-500 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                  }`}
                >
                  <input
                    type="file"
                    id="custom-avatar-file"
                    accept="image/*"
                    onChange={handleCustomPhotoUpload}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      Upload My Photo
                    </span>
                    {avatarUrl !== DEFAULT_AVATAR && (!currentUser?.photoURL || avatarUrl !== currentUser.photoURL) && (
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 leading-tight">
                    Upload any custom JPG/PNG image from your computer to be the anchor.
                  </p>
                </label>
              </div>

              {/* 3. Google Account Profile Photo (if signed in) */}
              {currentUser?.photoURL && (
                <button
                  type="button"
                  onClick={handleUseGooglePhoto}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    avatarUrl === currentUser.photoURL
                      ? 'bg-red-600/20 border-red-500 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.photoURL}
                      alt="Google Profile"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-white/20"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Use Google Profile Photo</span>
                      <span className="text-[10px] text-white/40 font-mono">{currentUser.email}</span>
                    </div>
                  </div>
                  {avatarUrl === currentUser.photoURL && (
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  )}
                </button>
              )}

              {avatarUploadError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{avatarUploadError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-black uppercase tracking-wider text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Save &amp; Broadcast
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Broadcast Video Export Studio Modal */}
      <VideoExportModal
        isOpen={isVideoExportModalOpen}
        onClose={() => setIsVideoExportModalOpen(false)}
        show={selectedShow}
        avatarUrl={avatarUrl}
      />

      {/* AI Video GitHub Guide & Pipeline Modal */}
      <GitHubVideoGuideModal
        isOpen={isVideoGuideModalOpen}
        onClose={() => setIsVideoGuideModalOpen(false)}
      />

      {/* YouTube Broadcast Direct Publish Modal */}
      <YouTubePublishModal
        isOpen={isYouTubePublishModalOpen}
        onClose={() => setIsYouTubePublishModalOpen(false)}
        show={selectedShow}
      />

      <audio
        ref={audioRef}
        src={selectedShow.audioUrl}
        onTimeUpdate={onTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 15s infinite alternate;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .crt-scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.45) 50%
          ), linear-gradient(
            90deg,
            rgba(255, 0, 0, 0.04),
            rgba(0, 255, 0, 0.02),
            rgba(0, 0, 255, 0.04)
          );
          background-size: 100% 3px, 6px 100%;
          pointer-events: none;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-6000 { animation-delay: 6s; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        input[type='range'] {
          -webkit-appearance: none;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.7);
        }
      `}} />
    </div>
  );
}
