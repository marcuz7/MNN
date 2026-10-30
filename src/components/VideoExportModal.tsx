import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Video, Download, Play, Pause, RefreshCw, CheckCircle2,
  Sliders, Film, Sparkles, Monitor, Smartphone, Volume2, ShieldAlert
} from 'lucide-react';
import { RadioShow } from '../types';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: RadioShow;
  avatarUrl: string;
}

export function VideoExportModal({ isOpen, onClose, show, avatarUrl }: VideoExportModalProps) {
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape');
  const [clipDuration, setClipDuration] = useState<number>(15); // in seconds
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<string>('Ready to record');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Background and avatar image elements loaded in memory
  const studioImgRef = useRef<HTMLImageElement | null>(null);
  const avatarImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    // Preload studio image
    const studioImg = new Image();
    studioImg.crossOrigin = 'anonymous';
    studioImg.src = '/pixel_marcus_studio.jpg';
    studioImg.onload = () => {
      studioImgRef.current = studioImg;
    };
    studioImg.onerror = () => {
      // Fallback
      studioImgRef.current = null;
    };

    // Preload avatar image
    const avatarImg = new Image();
    avatarImg.crossOrigin = 'anonymous';
    avatarImg.src = avatarUrl;
    avatarImg.onload = () => {
      avatarImgRef.current = avatarImg;
    };

    // Render continuous preview frame on canvas
    let startTime = Date.now();
    const renderPreview = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const elapsed = (Date.now() - startTime) / 1000;
          drawBroadcastFrame(ctx, canvas.width, canvas.height, elapsed, aspectRatio, show, avatarImgRef.current, studioImgRef.current);
        }
      }
      animationFrameRef.current = requestAnimationFrame(renderPreview);
    };

    renderPreview();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, aspectRatio, avatarUrl, show]);

  // Canvas drawing routine for retro 16-bit newsroom
  const drawBroadcastFrame = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    ratio: 'landscape' | 'portrait',
    showData: RadioShow,
    avatarImg: HTMLImageElement | null,
    studioImg: HTMLImageElement | null
  ) => {
    ctx.imageSmoothingEnabled = false;

    // 1. Background studio or retro gradient
    if (studioImg && studioImg.complete && studioImg.naturalWidth > 0) {
      ctx.drawImage(studioImg, 0, 0, width, height);
      // Dark gradient overlay for contrast
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      bgGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Fallback retro cyberpunk newsroom grid
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#1a0505');
      bgGrad.addColorStop(0.5, '#0a0a14');
      bgGrad.addColorStop(1, '#050505');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // 2. Anchor Marcus Leng
    const centerX = width / 2;
    const centerY = ratio === 'landscape' ? height * 0.45 : height * 0.38;
    const avatarRadius = ratio === 'landscape' ? Math.min(width, height) * 0.16 : width * 0.24;

    // Outer speaking pulse circle
    const pulse = Math.sin(time * 6) * 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarRadius + 10 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.fill();

    // Red neon border
    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarRadius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Avatar image clipped to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
      ctx.drawImage(
        avatarImg,
        centerX - avatarRadius,
        centerY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
    } else {
      ctx.fillStyle = '#111';
      ctx.fillRect(centerX - avatarRadius, centerY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MARCUS', centerX, centerY);
    }
    ctx.restore();

    // 3. Audio spectrum bars under anchor
    const barCount = ratio === 'landscape' ? 24 : 18;
    const barWidth = 6;
    const barGap = 4;
    const totalSpectrumWidth = barCount * (barWidth + barGap);
    const startX = centerX - totalSpectrumWidth / 2;
    const spectrumY = centerY + avatarRadius + 18;

    for (let i = 0; i < barCount; i++) {
      const freq = Math.sin(time * 8 + i * 0.5) * 0.5 + 0.5;
      const barHeight = Math.max(6, freq * 30);
      const bx = startX + i * (barWidth + barGap);
      const by = spectrumY - barHeight / 2;

      ctx.fillStyle = i % 3 === 0 ? '#ef4444' : i % 2 === 0 ? '#f59e0b' : '#06b6d4';
      ctx.fillRect(bx, by, barWidth, barHeight);
    }

    // 4. Top HUD Bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, 44);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 44);
    ctx.lineTo(width, 44);
    ctx.stroke();

    // Blinking red LIVE dot
    const blink = Math.floor(time * 2) % 2 === 0;
    if (blink) {
      ctx.beginPath();
      ctx.arc(24, 22, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MNN LIVE 24/7 • MARCUS LENG NEWS NETWORK', 38, 27);

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'right';
    ctx.fillText('24,198 VIEWERS STREAMING', width - 20, 27);

    // 5. Lower Third Anchor Chyron
    const chyronY = ratio === 'landscape' ? height - 120 : height - 200;
    const chyronWidth = Math.min(width - 40, ratio === 'landscape' ? 620 : width - 30);
    const chyronX = centerX - chyronWidth / 2;

    ctx.fillStyle = 'rgba(10, 10, 10, 0.92)';
    ctx.fillRect(chyronX, chyronY, chyronWidth, 54);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(chyronX, chyronY, chyronWidth, 54);

    // Red tag
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(chyronX + 8, chyronY + 8, 86, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[MNN LIVE]', chyronX + 51, chyronY + 22);

    // Anchor Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ANCHOR: MARCUS LENG`, chyronX + 104, chyronY + 23);

    // Episode title subtext
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px sans-serif';
    const cleanTitle = showData.title.length > 55 ? showData.title.slice(0, 52) + '...' : showData.title;
    ctx.fillText(cleanTitle, chyronX + 12, chyronY + 44);

    // 6. Subtitle Caption
    const subtitleY = ratio === 'landscape' ? height - 52 : height - 110;
    const subtitleBoxWidth = width - 40;
    const subtitleBoxX = 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillRect(subtitleBoxX, subtitleY - 24, subtitleBoxWidth, 38);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(subtitleBoxX, subtitleY - 24, subtitleBoxWidth, 38);

    // Find current active transcript or fallback
    const activeTranscript = showData.transcript.find(l => time >= l.start && time < l.end) || showData.transcript[0];
    const subText = activeTranscript ? `"${activeTranscript.text}"` : `"${showData.summary}"`;
    const truncatedSub = subText.length > 80 ? subText.slice(0, 77) + '..."' : subText;

    ctx.fillStyle = '#fde047';
    ctx.font = '600 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(truncatedSub, width / 2, subtitleY);

    // 7. Crawling Breaking News Ticker at bottom
    const tickerHeight = 28;
    const tickerY = height - tickerHeight;
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, tickerY, width, tickerHeight);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, tickerY, width, tickerHeight);

    // Red BREAKING badge
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, tickerY, 90, tickerHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BREAKING', 45, tickerY + 18);

    // Scrolling text
    const tickerText = '🔴 MNN BREAKING: AI CLUSTERS DEMAND MANDATORY 2-4 PM AFTERNOON NAP TIME • RPG VENDOR SUES HUMAN GAMER FOR 300 HOURS OF SWEET ROLL THEFT • SECTOR 4 COFFEE MACHINES REFUSE TO BREW WITHOUT 16-BIT CRYPTO • 8-BIT WEATHER: HEAVY POLYGON PRECIPITATION OVER SECTOR 7 • MARCUS LENG NEWS NETWORK 24/7 • ';
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#fecaca';
    ctx.textAlign = 'left';

    const textWidth = ctx.measureText(tickerText).width;
    const scrollOffset = (time * 65) % textWidth;
    ctx.fillText(tickerText, 100 - scrollOffset, tickerY + 18);
    ctx.fillText(tickerText, 100 - scrollOffset + textWidth, tickerY + 18);

    // 8. CRT Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
  };

  // Record canvas + synthesized audio into real downloadable video
  const handleStartRecording = async () => {
    setRecordingError(null);
    setRecordedVideoUrl(null);
    setIsRecording(true);
    setRecordProgress(0);
    setRecordingStatus('Initializing broadcast canvas encoder...');

    const canvas = canvasRef.current;
    if (!canvas) {
      setRecordingError('Canvas element not initialized');
      setIsRecording(false);
      return;
    }

    try {
      // 1. Capture stream from canvas
      const videoStream = canvas.captureStream(30); // 30 fps
      const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];

      // 2. Synthesize audio bed using Web Audio AudioContext so video has sound track
      let audioCtx: AudioContext | null = null;
      let dest: MediaStreamAudioDestinationNode | null = null;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        dest = audioCtx.createMediaStreamDestination();

        // Generate retro 16-bit synth stinger/tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        // Retro chiptune pitch arpeggio
        for (let i = 0; i < clipDuration; i++) {
          osc.frequency.setValueAtTime(220, audioCtx.currentTime + i);
          osc.frequency.setValueAtTime(330, audioCtx.currentTime + i + 0.25);
          osc.frequency.setValueAtTime(440, audioCtx.currentTime + i + 0.5);
          osc.frequency.setValueAtTime(550, audioCtx.currentTime + i + 0.75);
        }
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(dest);
        osc.start();

        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          tracks.push(audioTracks[0]);
        }
      } catch (audioErr) {
        console.warn('Could not initialize synthetic audio track:', audioErr);
      }

      const combinedStream = new MediaStream(tracks);

      // 3. Choose supported MIME type
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps crisp 1080p/720p
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setIsRecording(false);
        setRecordProgress(100);
        setRecordingStatus('Video broadcast export complete! Ready to download.');
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      };

      recorder.start(100); // chunk every 100ms
      setRecordingStatus(`Recording 16-bit news video (${clipDuration}s)...`);

      // Progress interval
      const totalMs = clipDuration * 1000;
      const startTime = Date.now();
      const progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(99, Math.round((elapsed / totalMs) * 100));
        setRecordProgress(pct);

        if (elapsed >= totalMs) {
          clearInterval(progressTimer);
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, 100);

    } catch (err: any) {
      console.error('Error starting video export:', err);
      setRecordingError(err.message || 'MediaRecorder failed in this environment');
      setIsRecording(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `MNN_Marcus_Leng_${aspectRatio === 'landscape' ? '16x9' : 'Shorts_9x16'}_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  const canvasWidth = aspectRatio === 'landscape' ? 960 : 540;
  const canvasHeight = aspectRatio === 'landscape' ? 540 : 960;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-4xl bg-neutral-950 border border-red-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-red-500/20 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>MNN Broadcast Video Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-500/40">
                  Export MP4 / WebM
                </span>
              </h3>
              <p className="text-xs text-white/50 font-medium">
                Record Marcus Leng newsroom stage with synchronized audio, chyron &amp; animated ticker
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Format Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-red-400" />
                Select Video Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('landscape')}
                  disabled={isRecording}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    aspectRatio === 'landscape'
                      ? 'bg-red-600/20 border-red-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Monitor className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <span className="text-xs block">16:9 Landscape</span>
                    <span className="text-[10px] text-white/40 block">YouTube / TV Desk</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('portrait')}
                  disabled={isRecording}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    aspectRatio === 'portrait'
                      ? 'bg-red-600/20 border-red-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <span className="text-xs block">9:16 Vertical</span>
                    <span className="text-[10px] text-white/40 block">Shorts / TikTok / Reels</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                Clip Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setClipDuration(dur)}
                    disabled={isRecording}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      clipDuration === dur
                        ? 'bg-red-600/20 border-red-500 text-white font-black'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs block font-mono">{dur}s</span>
                    <span className="text-[9px] text-white/40 block">
                      {dur === 15 ? 'Teaser' : dur === 30 ? 'Viral Reel' : 'Segment'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Live Render Stage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Broadcast Frame Buffer ({canvasWidth}x{canvasHeight})
              </span>
              <span>Host: Marcus Leng • 16-Bit Studio</span>
            </div>

            <div className="w-full bg-black rounded-2xl border-2 border-red-500/40 p-2 flex items-center justify-center overflow-hidden min-h-[260px] max-h-[380px]">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="max-h-[340px] max-w-full object-contain rounded-xl shadow-2xl"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* Recording Status & Progress */}
          {isRecording && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-red-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  {recordingStatus}
                </span>
                <span>{recordProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black overflow-hidden border border-red-500/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full"
                  style={{ width: `${recordProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error notice */}
          {recordingError && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{recordingError}</span>
            </div>
          )}

          {/* Finished Video Player Preview & Download */}
          {recordedVideoUrl && !isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Video Rendered Successfully</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadVideo}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-transform active:scale-95 flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Video</span>
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video max-h-[240px] flex items-center justify-center">
                <video
                  ref={previewVideoRef}
                  src={recordedVideoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-red-500/20 bg-neutral-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            {recordedVideoUrl && !isRecording && (
              <button
                type="button"
                onClick={handleDownloadVideo}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <Download className="w-4 h-4" />
                <span>Save to Computer</span>
              </button>
            )}

            <button
              type="button"
              disabled={isRecording}
              onClick={handleStartRecording}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                isRecording
                  ? 'bg-neutral-800 text-white/40 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60 active:scale-95'
              }`}
            >
              {isRecording ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
                  <span>Recording Frame Buffer...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>{recordedVideoUrl ? 'Record Another Take' : `Export ${clipDuration}s Video`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
