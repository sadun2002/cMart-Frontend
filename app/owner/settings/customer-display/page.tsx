'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Tv,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Clock,
  Eye,
  Settings2,
  Upload,
  Link as LinkIcon,
  Shield,
  Layers,
  Store,
  Tag,
  Maximize2,
  Laptop,
  X,
} from 'lucide-react';
import {
  getCustomerDisplayConfig,
  saveCustomerDisplayConfig,
  getAvailableDisplays,
  launchCustomerDisplayWindow,
  closeCustomerDisplayWindow,
  checkCustomerDisplayActive,
  storeMediaBlob,
  deleteMediaBlob,
  isTauriEnvironment,
  CustomerDisplayConfig,
  CustomerDisplayMedia,
  DisplayInfo,
  DEFAULT_CFD_CONFIG,
} from '@/lib/customer-display';
import { toast } from 'sonner';

export default function CustomerDisplaySettingsPage() {
  const [config, setConfig] = useState<CustomerDisplayConfig>(DEFAULT_CFD_CONFIG);
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);
  const [isLoadingDisplays, setIsLoadingDisplays] = useState(false);
  const [isWindowActive, setIsWindowActive] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // New Media Modal/Drawer State
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'video' | 'image'>('video');

  // Load config & displays
  useEffect(() => {
    const loaded = getCustomerDisplayConfig();
    setConfig(loaded);
    refreshDisplays();
    checkWindowStatus();

    const interval = setInterval(checkWindowStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const refreshDisplays = async () => {
    setIsLoadingDisplays(true);
    try {
      const list = await getAvailableDisplays();
      setDisplays(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDisplays(false);
    }
  };

  const checkWindowStatus = async () => {
    const active = await checkCustomerDisplayActive();
    setIsWindowActive(active);
  };

  const handleSave = (updated: Partial<CustomerDisplayConfig>) => {
    const newCfg = saveCustomerDisplayConfig(updated);
    setConfig(newCfg);
    toast.success('Customer display settings saved!');
  };

  const handleLaunch = async (fullscreen?: boolean) => {
    setIsLaunching(true);
    try {
      const ok = await launchCustomerDisplayWindow(config.selectedMonitor, fullscreen ?? config.fullscreen);
      if (ok) {
        setIsWindowActive(true);
        toast.success('Customer display window launched!');
      } else {
        toast.info('Customer display opened in browser preview.');
      }
    } catch (err) {
      toast.error('Failed to launch customer display');
    } finally {
      setIsLaunching(false);
    }
  };

  const handleClose = async () => {
    try {
      await closeCustomerDisplayWindow();
      setIsWindowActive(false);
      toast.success('Customer display window closed.');
    } catch (err) {
      toast.error('Failed to close display window');
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim() || !newMediaUrl.trim()) {
      toast.error('Please provide a title and video/image URL');
      return;
    }

    const newMedia: CustomerDisplayMedia = {
      id: `media-${Date.now()}`,
      title: newMediaTitle.trim(),
      type: newMediaType,
      url: newMediaUrl.trim(),
      active: true,
    };

    const updatedPlaylist = [...config.mediaPlaylist, newMedia];
    handleSave({
      mediaPlaylist: updatedPlaylist,
      activeMediaId: newMedia.id,
    });

    setIsAddMediaOpen(false);
    setNewMediaTitle('');
    setNewMediaUrl('');
    toast.success('Promotional media added to playlist!');
  };

  const handleToggleMediaActive = (id: string) => {
    const updated = config.mediaPlaylist.map((m) =>
      m.id === id ? { ...m, active: !m.active } : m
    );
    handleSave({ mediaPlaylist: updated });
  };

  const handleDeleteMedia = async (id: string) => {
    if (config.mediaPlaylist.length <= 1) {
      toast.error('You must keep at least one media item in the playlist');
      return;
    }
    if (id.startsWith('local-') || id.startsWith('db-')) {
      await deleteMediaBlob(id);
    }
    const updated = config.mediaPlaylist.filter((m) => m.id !== id);
    handleSave({
      mediaPlaylist: updated,
      activeMediaId: config.activeMediaId === id ? updated[0].id : config.activeMediaId,
    });
    toast.success('Media removed from playlist');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 300 * 1024 * 1024) {
      toast.error('File size exceeds 300MB limit');
      return;
    }

    try {
      const id = `local-${Date.now()}`;
      await storeMediaBlob(id, file);

      const isVid = file.type.startsWith('video');

      const newMedia: CustomerDisplayMedia = {
        id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: isVid ? 'video' : 'image',
        url: '', // Stored and read via IndexedDB
        active: true,
      };

      const updatedPlaylist = [...config.mediaPlaylist, newMedia];
      handleSave({
        mediaPlaylist: updatedPlaylist,
        activeMediaId: newMedia.id,
      });
      toast.success(`Saved "${file.name}" to display video library!`);
    } catch (err: any) {
      toast.error('Failed to store video: ' + err.message);
    }
  };

  return (
    <div className="font-sans p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* ──────────────── PAGE HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Customer-Facing Display (CFD)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Dual-screen hardware management, promotional video ads, and live checkout display
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isWindowActive && (
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 font-bold text-sm transition-all cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
              Close Display Window
            </button>
          )}
          <button
            onClick={() => handleLaunch(false)}
            disabled={isLaunching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <Eye className="w-4 h-4 text-blue-500" />
            Test in Window
          </button>
          <button
            onClick={() => handleLaunch(true)}
            disabled={isLaunching}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            {displays.length > 1 ? 'Launch Fullscreen on Screen 2' : 'Launch Fullscreen'}
          </button>
        </div>
      </div>

      {/* ──────────────── HARDWARE & MONITOR STATUS CARD ──────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Tv className="w-5 h-5 text-blue-600" />
              Connected Monitors & Windows
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automatic secondary display placement for dual-monitor supermarket setups
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isWindowActive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isWindowActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isWindowActive ? 'Display Window Active' : 'Display Window Standby'}
            </span>

            {isWindowActive && (
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
              >
                Close Window
              </button>
            )}

            <button
              onClick={refreshDisplays}
              disabled={isLoadingDisplays}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Connected Monitors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDisplays ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Display List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displays.map((disp, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                disp.is_primary
                  ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800'
                  : 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      disp.is_primary
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {disp.name || `Display Monitor ${idx + 1}`}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {disp.width} × {disp.height} @ Scale {disp.scale_factor}x
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md border ${
                    disp.is_primary
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
                  }`}
                >
                  {disp.is_primary ? 'Primary (Cashier)' : 'Secondary (Customer CFD)'}
                </span>
              </div>

              {!disp.is_primary && (
                <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-blue-900/30 text-xs">
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommended for Customer Screen
                  </span>
                  <button
                    onClick={() => handleSave({ selectedMonitor: idx })}
                    className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                      config.selectedMonitor === idx
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {config.selectedMonitor === idx ? 'Selected' : 'Use This Screen'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {displays.length === 1 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Only 1 monitor detected. Connect an HDMI / DisplayPort second monitor to run true dual-screen mode. You can still test the customer display in a window using the button above.
            </p>
          </div>
        )}

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Enable Customer Display</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Broadcast POS events to customer screen</p>
            </div>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleSave({ enabled: e.target.checked })}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Borderless Fullscreen</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill the entire second monitor seamlessly</p>
            </div>
            <input
              type="checkbox"
              checked={config.fullscreen}
              onChange={(e) => handleSave({ fullscreen: e.target.checked })}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* ──────────────── LIVE INTERACTIVE CFD SIMULATOR CARD ──────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-indigo-600" />
              Live Screen 2 Interactive Simulator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Preview and test real-time customer display behavior right on your screen without needing a physical second monitor
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isWindowActive && (
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                Close Window
              </button>
            )}
            <button
              onClick={async () => {
                const targetUrl = 'http://localhost:3000/customer-display';
                if (isTauriEnvironment()) {
                  try {
                    const { open } = await import('@tauri-apps/plugin-shell');
                    await open(targetUrl);
                    toast.success('Opened Customer Display in your system browser!');
                    return;
                  } catch (err) {
                    console.warn('Shell open failed', err);
                  }
                }
                window.open('/customer-display', '_blank');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
              Open in Browser Tab
            </button>
          </div>
        </div>

        {/* 16:9 Aspect Frame Preview */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-slate-800/80 bg-black shadow-2xl">
          <iframe
            src="/customer-display"
            className="w-full h-full border-0 pointer-events-auto"
            title="Customer Display Live Simulator"
          />
        </div>
      </div>

      {/* ──────────────── PROMOTIONAL ADVERTISING & MEDIA PLAYLIST ──────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Play className="w-5 h-5 text-blue-600" />
              Idle Screen Advertisements & Video Loop
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Plays continuously when cashier is not scanning items, returning to ads 5s after sale completion
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm">
              <Upload className="w-3.5 h-3.5 text-blue-500" />
              Upload Local MP4
              <input type="file" accept="video/mp4,video/webm" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setIsAddMediaOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add URL Video
            </button>
          </div>
        </div>

        {/* Media Items List */}
        <div className="space-y-3">
          {config.mediaPlaylist.map((media) => (
            <div
              key={media.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                media.active
                  ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Play className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{media.title}</h3>
                  <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">{media.url}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleMediaActive(media.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    media.active
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {media.active ? 'Playing Active' : 'Disabled'}
                </button>

                {config.mediaPlaylist.length > 1 && (
                  <button
                    onClick={() => handleDeleteMedia(media.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Audio & Timeout Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                {config.muteVideo ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-500" />}
                Mute Advertisement Audio
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recommended to prevent cashier interference</p>
            </div>
            <input
              type="checkbox"
              checked={config.muteVideo}
              onChange={(e) => handleSave({ muteVideo: e.target.checked })}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </label>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Resume Video After Sale</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Time to display Thank You screen</p>
            </div>
            <select
              value={config.idleTimeoutSeconds}
              onChange={(e) => handleSave({ idleTimeoutSeconds: parseInt(e.target.value, 10) })}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value={3}>3 Seconds</option>
              <option value={5}>5 Seconds (Recommended)</option>
              <option value={8}>8 Seconds</option>
              <option value={10}>10 Seconds</option>
            </select>
          </div>
        </div>
      </div>

      {/* ──────────────── DISPLAY PREFERENCES & BRANDING ──────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Store className="w-5 h-5 text-blue-600" />
            Store Branding & Customer Privacy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure what customer sees on screen. Cost price, supplier details, and internal stock are always protected.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Store Display Name
            </label>
            <input
              type="text"
              value={config.storeName}
              onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
              onBlur={() => handleSave({ storeName: config.storeName })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Store Tagline / Slogan
            </label>
            <input
              type="text"
              value={config.storeTagline}
              onChange={(e) => setConfig({ ...config, storeTagline: e.target.value })}
              onBlur={() => handleSave({ storeTagline: config.storeTagline })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Show Item Unit Prices</span>
            <input
              type="checkbox"
              checked={config.showItemPrices}
              onChange={(e) => handleSave({ showItemPrices: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Highlight Savings Pill</span>
            <input
              type="checkbox"
              checked={config.showDiscounts}
              onChange={(e) => handleSave({ showDiscounts: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Show Change Due</span>
            <input
              type="checkbox"
              checked={config.showChange}
              onChange={(e) => handleSave({ showChange: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* ──────────────── MODAL: ADD CUSTOM VIDEO URL ──────────────── */}
      {isAddMediaOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Promotional Video URL</h3>
              <button onClick={() => setIsAddMediaOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Year Fresh Deals"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Direct Video MP4 URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/promo.mp4"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddMediaOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Add Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
