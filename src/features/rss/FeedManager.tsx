import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rss, Plus, RefreshCw, Trash2, CheckCircle2, AlertTriangle, ExternalLink,
  Sliders, ShieldCheck, Check, Clock, Radio, Power, Lock, AlertCircle, X
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface RssFeed {
  id: string;
  url: string;
  title: string;
  category: string;
  language: string;
  priority: number;
  enabled: boolean;
  pollIntervalMinutes: number;
  lastPolledAt?: string;
  lastError?: string | null;
}

export function FeedManager() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('AI');
  const [validating, setValidating] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [pollAllResult, setPollAllResult] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    action: 'toggle' | 'delete';
    feed: RssFeed;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rss/feeds');
      if (res.ok) {
        const data = await res.json();
        setFeeds(data.feeds || []);
      }
    } catch (err) {
      console.error('Failed to fetch feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleValidateUrl = async () => {
    if (!newUrl) return;
    setValidating(true);
    setValidationMsg(null);
    setIsValidated(false);

    try {
      const res = await fetch('/api/rss/feeds/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setIsValidated(true);
        setValidationMsg(`Valid RSS endpoint (${data.contentType})`);
        if (!newTitle) {
          try {
            const host = new URL(newUrl).hostname.replace('www.', '');
            setNewTitle(`${host.charAt(0).toUpperCase() + host.slice(1)} Feed`);
          } catch {}
        }
      } else {
        setValidationMsg(data.error?.message || 'Failed to reach feed endpoint.');
      }
    } catch (err: any) {
      setValidationMsg(err.message || 'Validation request failed.');
    } finally {
      setValidating(false);
    }
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newUrl || !newTitle) return;

    try {
      const res = await fetch('/api/rss/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl,
          title: newTitle,
          category: newCategory,
          priority: 8,
          pollIntervalMinutes: 30,
          enabled: true
        })
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewUrl('');
        setNewTitle('');
        setIsValidated(false);
        setValidationMsg(null);
        fetchFeeds();
      } else {
        const data = await res.json();
        setValidationMsg(data.error?.message || 'Could not save feed.');
      }
    } catch (err: any) {
      setValidationMsg(err.message || 'Failed to submit feed.');
    }
  };

  const handlePollSingle = async (feedId: string) => {
    if (!currentUser) return;
    setPollingId(feedId);
    try {
      const res = await fetch(`/api/rss/feeds/${feedId}/poll`, { method: 'POST' });
      if (res.ok) {
        fetchFeeds();
      }
    } catch (err) {
      console.error('Poll error:', err);
    } finally {
      setPollingId(null);
    }
  };

  const handlePollAll = async () => {
    if (!currentUser) return;
    setPollAllResult('Polling all enabled feeds...');
    try {
      const res = await fetch('/api/rss/poll-all', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const totalNew = data.results?.reduce((sum: number, r: any) => sum + (r.itemsNew || 0), 0);
        setPollAllResult(`Poll complete: ${totalNew} new stories ingested.`);
        fetchFeeds();
      }
    } catch (err) {
      setPollAllResult('Failed to poll feeds.');
    } finally {
      setTimeout(() => setPollAllResult(null), 4000);
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmDialog || !currentUser) return;
    const { action, feed } = confirmDialog;

    if (action === 'toggle') {
      try {
        const res = await fetch(`/api/rss/feeds/${feed.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: !feed.enabled })
        });
        if (res.ok) {
          setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, enabled: !f.enabled } : f));
        }
      } catch (err) {
        console.error('Toggle error:', err);
      }
    } else if (action === 'delete') {
      try {
        const res = await fetch(`/api/rss/feeds/${feed.id}`, { method: 'DELETE' });
        if (res.ok) {
          setFeeds(prev => prev.filter(f => f.id !== feed.id));
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    }

    setConfirmDialog(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900/80 border border-red-500/30 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <Rss className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">RSS &amp; Atom Feed Manager</h2>
              <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-[10px] font-mono font-bold uppercase">
                FR-01 Engine
              </span>
            </div>
            <p className="text-xs text-white/50 font-medium">
              Verified sources monitored with SSRF protection, strict URL validation &amp; SHA-256 deduplication.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {currentUser ? (
            <>
              <button
                onClick={handlePollAll}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Poll All Feeds</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/60"
              >
                <Plus className="w-4 h-4" />
                <span>Add Verified Feed</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Read-Only Mode (Sign in to add or poll feeds)</span>
            </div>
          )}
        </div>
      </div>

      {pollAllResult && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono rounded-xl animate-in fade-in">
          {pollAllResult}
        </div>
      )}

      {/* Feeds Table */}
      <div className="rounded-3xl bg-neutral-900/60 border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-white/5 text-white/40 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source Title &amp; Category</th>
                <th className="py-3 px-4">Endpoint URL</th>
                <th className="py-3 px-4">Cadence</th>
                <th className="py-3 px-4">Last Polled</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/40 font-mono">
                    Loading feeds...
                  </td>
                </tr>
              ) : feeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/40 font-mono">
                    No feeds configured.
                  </td>
                </tr>
              ) : (
                feeds.map(feed => (
                  <tr key={feed.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      {feed.enabled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-500 bg-neutral-800/40 px-2 py-0.5 rounded-full border border-neutral-700/50">
                          DISABLED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{feed.title}</div>
                      <div className="text-[10px] text-white/40 font-mono mt-0.5">{feed.category}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-white/60 max-w-xs truncate">
                      <a href={feed.url} target="_blank" rel="noreferrer" className="hover:text-red-400 flex items-center gap-1">
                        <span className="truncate">{feed.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4 font-mono text-white/60">
                      {feed.pollIntervalMinutes}m
                    </td>
                    <td className="py-3 px-4 font-mono text-white/60">
                      {feed.lastPolledAt ? new Date(feed.lastPolledAt).toLocaleTimeString() : 'Pending'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {currentUser ? (
                          <>
                            <button
                              onClick={() => handlePollSingle(feed.id)}
                              disabled={pollingId === feed.id}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                              title="Poll Feed Now"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${pollingId === feed.id ? 'animate-spin text-red-400' : ''}`} />
                            </button>
                            <button
                              onClick={() => setConfirmDialog({ action: 'toggle', feed })}
                              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                feed.enabled
                                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-white/5 text-white/40 hover:bg-white/10'
                              }`}
                              title={feed.enabled ? 'Disable Feed' : 'Enable Feed'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDialog({ action: 'delete', feed })}
                              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Feed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-500 italic">
                            Protected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Feed Modify / Delete */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 border border-neutral-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-white">
                  Confirm Feed {confirmDialog.action === 'delete' ? 'Deletion' : 'Toggle'}
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Are you sure you want to {confirmDialog.action === 'delete' ? 'permanently delete' : confirmDialog.feed.enabled ? 'disable' : 'enable'} <strong>"{confirmDialog.feed.title}"</strong>?
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl text-white transition-colors ${
                    confirmDialog.action === 'delete' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Feed Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 border border-red-500/40 rounded-3xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rss className="w-5 h-5 text-red-400" />
                  <h3 className="text-base font-black text-white">Add RSS/Atom Feed</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddFeed} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Feed URL (RSS 2.0 / Atom)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/feed.xml"
                      value={newUrl}
                      onChange={e => {
                        setNewUrl(e.target.value);
                        setIsValidated(false);
                        setValidationMsg(null);
                      }}
                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleValidateUrl}
                      disabled={validating || !newUrl}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      {validating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Validate'}
                    </button>
                  </div>
                  {validationMsg && (
                    <p className={`text-[10px] font-mono mt-1 ${isValidated ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {validationMsg}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Display Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenAI Research Blog"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="AI">AI &amp; Agents</option>
                    <option value="GitHub">GitHub Trending</option>
                    <option value="X.com">Hottest X.com</option>
                    <option value="Substack">Substack Thinkers</option>
                    <option value="General Tech">General Tech</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider"
                  >
                    Save Feed
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
