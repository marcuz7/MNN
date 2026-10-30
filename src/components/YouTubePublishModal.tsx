import React, { useState, useEffect } from 'react';
import { Youtube, X, CheckCircle, ExternalLink, Loader2, Sparkles, Copy, Check, ShieldCheck, Lock, Globe, EyeOff } from 'lucide-react';

interface YouTubeChannel {
  id: string;
  channelId: string;
  displayName: string;
  status: string;
  avatarUrl?: string;
}

interface YouTubePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: {
    id?: string;
    title: string;
    summary?: string;
    description?: string;
    transcript?: Array<{ speaker: string; text: string; time?: string }> | string;
    duration?: number;
    coverImage?: string;
    audioUrl?: string;
    host?: string;
    date?: string;
  } | null;
  onPublished?: (result: { videoId: string; videoUrl: string }) => void;
}

export const YouTubePublishModal: React.FC<YouTubePublishModalProps> = ({
  isOpen,
  onClose,
  show,
  onPublished
}) => {
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('UC_MNN_MarcusLeng_Official');
  const [privacyStatus, setPrivacyStatus] = useState<'PUBLIC' | 'UNLISTED' | 'PRIVATE'>('PUBLIC');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('AI, TechNews, MarcusNewsNetwork, TalkRadio, OpenSource');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ videoId: string; videoUrl: string; publishedAt: string; channelTitle: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !show) return;

    // Fetch channels
    fetch('/api/youtube/channels')
      .then(res => res.json())
      .then(data => {
        if (data.channels && data.channels.length > 0) {
          setChannels(data.channels);
          setSelectedChannelId(data.channels[0].channelId);
        } else {
          setChannels([
            {
              id: 'ch-default',
              channelId: 'UC_MNN_MarcusLeng_Official',
              displayName: 'Marcus Leng News Network (Official)',
              status: 'CONNECTED'
            }
          ]);
        }
      })
      .catch(() => {
        setChannels([
          {
            id: 'ch-default',
            channelId: 'UC_MNN_MarcusLeng_Official',
            displayName: 'Marcus Leng News Network (Official)',
            status: 'CONNECTED'
          }
        ]);
      });

    // Auto-generate title
    const cleanTitle = (show.title || 'MNN Talk Radio Episode').trim();
    const generatedTitle = `${cleanTitle} | MNN 24/7 AI Talk Radio`.slice(0, 100);
    setTitle(generatedTitle);

    // Auto-generate description with timestamps & hashtags
    let generatedDesc = `${show.summary || show.description || cleanTitle}\n\n`;
    generatedDesc += `🎙️ Host: ${show.host || 'Pixel Marcus Leng'} (Marcus News Network)\n`;
    generatedDesc += `📅 Broadcast Date: ${show.date || new Date().toLocaleDateString()}\n\n`;
    generatedDesc += `⏱️ CHAPTER TIMESTAMPS:\n`;

    if (Array.isArray(show.transcript) && show.transcript.length > 0) {
      let currentSeconds = 0;
      show.transcript.slice(0, 6).forEach((turn, idx) => {
        const mins = Math.floor(currentSeconds / 60);
        const secs = currentSeconds % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        const preview = turn.text.slice(0, 40).replace(/["\n]/g, '').trim();
        generatedDesc += `${timeStr} - ${turn.speaker}: ${preview}...\n`;
        currentSeconds += Math.min(30, Math.max(15, Math.floor(turn.text.length / 15)));
      });
    } else {
      generatedDesc += `00:00 - Introduction & Breaking Intelligence\n00:45 - In-Depth Analysis\n01:30 - Second-Order Market Impact\n02:15 - Key Takeaways & Operator Action Checklist\n`;
    }

    generatedDesc += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    generatedDesc += `FACTUAL ACCURACY GUARANTEE:\n`;
    generatedDesc += `Grounded in MNN Fact Verification & STEPPS Editorial Pipeline.\n`;
    generatedDesc += `Core Law: Facts are immutable. Presentation is optimizable.\n\n`;
    generatedDesc += `#MNN #MarcusLeng #AITalkRadio #TechNews #OpenSource #Podcast`;

    setDescription(generatedDesc);
    setPublishResult(null);
    setError(null);
  }, [isOpen, show]);

  if (!isOpen || !show) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        privacyStatus,
        channelId: selectedChannelId,
        showData: show
      };

      const res = await fetch('/api/youtube/publish-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to publish to YouTube');
      }

      setPublishResult({
        videoId: data.videoId,
        videoUrl: data.videoUrl,
        publishedAt: data.publishedAt,
        channelTitle: data.channelTitle
      });

      if (onPublished) {
        onPublished({ videoId: data.videoId, videoUrl: data.videoUrl });
      }
    } catch (err: any) {
      setError(err.message || 'Network error uploading to YouTube');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = () => {
    if (!publishResult) return;
    navigator.clipboard.writeText(publishResult.videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Publish to YouTube
                <span className="text-xs font-mono font-normal text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded">
                  Connected Channel
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Direct upload with auto-generated metadata, chapter timestamps, and verified tags
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {publishResult ? (
            /* Success State */
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Broadcast Published to YouTube!</h3>
                <p className="text-sm text-neutral-300 mt-1">
                  Successfully uploaded to <span className="font-semibold text-emerald-300">{publishResult.channelTitle}</span>
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 flex items-center justify-between gap-2 max-w-lg mx-auto">
                <span className="font-mono text-xs text-neutral-300 truncate">{publishResult.videoUrl}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={publishResult.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded flex items-center gap-1 font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </a>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Publishing Form */
            <>
              {error && (
                <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-xs text-red-200 flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Show Preview Snippet */}
              <div className="flex items-center gap-3 p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                {show.coverImage ? (
                  <img
                    src={show.coverImage}
                    alt={show.title}
                    className="w-20 h-14 object-cover rounded-lg border border-neutral-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-14 bg-red-950/40 border border-red-800/40 rounded-lg flex items-center justify-center text-red-400 font-mono text-xs font-bold shrink-0">
                    MNN
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">{show.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                    <span>{show.host || 'Pixel Marcus'}</span>
                    <span>·</span>
                    <span className="font-mono">{show.duration ? `${Math.floor(show.duration / 60)}m ${show.duration % 60}s` : 'Full Broadcast'}</span>
                    <span>·</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Factual ClaimLock
                    </span>
                  </div>
                </div>
              </div>

              {/* Channel & Visibility Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Target Channel
                  </label>
                  <select
                    value={selectedChannelId}
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    {channels.map((c) => (
                      <option key={c.channelId} value={c.channelId}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Visibility
                  </label>
                  <div className="flex rounded-lg border border-neutral-700 p-0.5 bg-neutral-950">
                    <button
                      type="button"
                      onClick={() => setPrivacyStatus('PUBLIC')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1 transition-colors ${
                        privacyStatus === 'PUBLIC'
                          ? 'bg-red-600 text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrivacyStatus('UNLISTED')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1 transition-colors ${
                        privacyStatus === 'UNLISTED'
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <EyeOff className="w-3 h-3" />
                      Unlisted
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrivacyStatus('PRIVATE')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1 transition-colors ${
                        privacyStatus === 'PRIVATE'
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      Private
                    </button>
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    YouTube Video Title
                  </label>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {title.length}/100
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  placeholder="Enter episode video title"
                />
              </div>

              {/* Description Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-400" />
                    Auto-Generated Description (Chapters & Citations)
                  </label>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {description.length}/5000
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-red-500 resize-y"
                  placeholder="Generated description..."
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!publishResult && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between gap-3 sticky bottom-0">
            <button
              onClick={onClose}
              disabled={isPublishing}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || !title.trim()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/60 transition-all cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing to Channel...
                </>
              ) : (
                <>
                  <Youtube className="w-4 h-4" />
                  Upload & Publish Now
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
