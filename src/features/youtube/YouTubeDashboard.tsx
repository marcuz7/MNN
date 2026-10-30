import React, { useState, useEffect } from 'react';
import {
  Youtube, ExternalLink, CheckCircle2, Clock, ShieldCheck, RefreshCw,
  Video, Eye, Calendar, AlertCircle
} from 'lucide-react';

interface YouTubeChannel {
  id: string;
  channelId: string;
  displayName: string;
  customUrl?: string;
  status: string;
  createdAt: string;
}

interface YouTubePublication {
  id: string;
  episodeId: string;
  revision: number;
  channelId: string;
  videoId?: string;
  videoUrl?: string;
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  idempotencyKey: string;
  createdAt: string;
}

export function YouTubeDashboard() {
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [publications, setPublications] = useState<YouTubePublication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [chanRes, pubRes] = await Promise.all([
        fetch('/api/youtube/channels'),
        fetch('/api/youtube/publications')
      ]);
      if (chanRes.ok) {
        const d = await chanRes.json();
        setChannels(d.channels || []);
      }
      if (pubRes.ok) {
        const d = await pubRes.json();
        setPublications(d.publications || []);
      }
    } catch (err) {
      console.error('Failed to load YouTube dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900/80 border border-red-500/30 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">YouTube Broadcast Hub</h2>
              <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-[10px] font-mono font-bold uppercase">
                FR-09 Engine
              </span>
            </div>
            <p className="text-xs text-white/50 font-medium">
              Supervised distribution, OAuth channel status, private-first uploads &amp; scheduled publishing
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Connected Channels Card */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-white/60">Connected YouTube Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map(chan => (
            <div key={chan.id} className="p-4 rounded-2xl bg-black/60 border border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{chan.displayName}</h4>
                  <p className="text-[11px] font-mono text-white/40">{chan.customUrl || chan.channelId}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[9px] font-bold">
                CONNECTED &bull; OAUTH V3
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Publication History Table */}
      <div className="rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white/70">
            Supervised Upload &amp; Publication Queue ({publications.length})
          </h3>
          <span className="text-[10px] font-mono text-white/40">
            Authorization Invariant: Private-first upload strictly enforced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/40 uppercase tracking-widest font-mono text-[10px] border-b border-white/5">
              <tr>
                <th className="p-4">Episode &bull; Rev</th>
                <th className="p-4">Status</th>
                <th className="p-4">YouTube Video ID</th>
                <th className="p-4">Published / Scheduled</th>
                <th className="p-4 text-right">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/75">
              {publications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40 font-mono">
                    No videos approved or published yet. Go to News Radar &rarr; Review Studio to approve your first broadcast.
                  </td>
                </tr>
              ) : (
                publications.map(pub => (
                  <tr key={pub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono">
                      <span className="text-white font-bold">{pub.episodeId}</span>
                      <span className="text-white/40 ml-1.5">(Rev #{pub.revision})</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                        pub.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : pub.status === 'SCHEDULED'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-white/5 text-white/60'
                      }`}>
                        {pub.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-white/80">
                      {pub.videoId || 'Uploading...'}
                    </td>
                    <td className="p-4 font-mono text-white/60 text-[11px]">
                      {pub.scheduledAt
                        ? `Scheduled: ${new Date(pub.scheduledAt).toLocaleString()}`
                        : pub.publishedAt
                        ? `Published: ${new Date(pub.publishedAt).toLocaleString()}`
                        : 'Pending'}
                    </td>
                    <td className="p-4 text-right">
                      {pub.videoUrl ? (
                        <a
                          href={pub.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-white inline-flex items-center gap-1 font-bold text-xs"
                        >
                          <span>Watch</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-white/30 font-mono">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
