'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Sparkles,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Clock,
  Store,
  Tag,
  Gift,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowRight,
  ShieldCheck,
  Package,
  User,
  Heart,
  Percent,
  X,
} from 'lucide-react';
import {
  subscribeCustomerDisplayEvents,
  getLatestCustomerDisplayState,
  getCustomerDisplayConfig,
  getMediaBlob,
  isTauriEnvironment,
  CustomerDisplayCart,
  CustomerDisplayPayment,
  CustomerDisplaySuccess,
  CustomerDisplayConfig,
  DEFAULT_CFD_CONFIG,
} from '@/lib/customer-display';
import { formatLKR } from '@/lib/constants';

type DisplayMode = 'IDLE' | 'CART' | 'PAYMENT' | 'SUCCESS' | 'HOLD' | 'CANCEL';

export default function CustomerDisplayPage() {
  const [mounted, setMounted] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [mode, setMode] = useState<DisplayMode>('IDLE');
  const [config, setConfig] = useState<CustomerDisplayConfig>(DEFAULT_CFD_CONFIG);
  const [cartData, setCartData] = useState<CustomerDisplayCart | null>(null);
  const [paymentData, setPaymentData] = useState<CustomerDisplayPayment | null>(null);
  const [successData, setSuccessData] = useState<CustomerDisplaySuccess | null>(null);
  const [holdName, setHoldName] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string | null>(null);

  // Media & Video State
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cartScrollRef = useRef<HTMLDivElement>(null);

  // Time for idle screen clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);

  // Fullscreen toggle for the customer display window
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mount & Iframe detector
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        setIsInIframe(window.self !== window.top);
      } catch (e) {
        setIsInIframe(false);
      }
    }
  }, []);

  // Clock updater
  useEffect(() => {
    if (!mounted) return;
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Hydrate config and initial state
  useEffect(() => {
    if (!mounted) return;
    const loadedConfig = getCustomerDisplayConfig();
    setConfig(loadedConfig);
    setIsMuted(loadedConfig.muteVideo);

    const latest = getLatestCustomerDisplayState();
    if (latest) {
      handleEvent(latest);
    }

    const unsubscribe = subscribeCustomerDisplayEvents((event) => {
      handleEvent(event);
    });

    return () => unsubscribe();
  }, [mounted]);

  // Event dispatcher / state machine
  const handleEvent = (event: any) => {
    if (!event || !event.type) return;

    switch (event.type) {
      case 'CART_UPDATE': {
        const cart: CustomerDisplayCart = event.payload;
        setCartData(cart);
        if (cart && cart.items && cart.items.length > 0) {
          setMode('CART');
          // Auto-scroll to latest item
          setTimeout(() => {
            if (cartScrollRef.current) {
              cartScrollRef.current.scrollTo({
                top: cartScrollRef.current.scrollHeight,
                behavior: 'smooth',
              });
            }
          }, 100);
        } else {
          setMode('IDLE');
        }
        break;
      }

      case 'PAYMENT_STATE': {
        const pay: CustomerDisplayPayment = event.payload;
        setPaymentData(pay);
        setMode('PAYMENT');
        break;
      }

      case 'PAYMENT_SUCCESS': {
        const succ: CustomerDisplaySuccess = event.payload;
        setSuccessData(succ);
        setMode('SUCCESS');
        setCountdownSeconds(config.idleTimeoutSeconds || 5);
        break;
      }

      case 'TRANSACTION_HOLD': {
        setHoldName(event.payload?.orderName || 'Order');
        setMode('HOLD');
        setTimeout(() => {
          setMode('IDLE');
        }, 3500);
        break;
      }

      case 'TRANSACTION_CANCEL': {
        setCancelReason(event.payload?.reason || 'Transaction Cancelled');
        setMode('CANCEL');
        setTimeout(() => {
          setCartData(null);
          setPaymentData(null);
          setMode('IDLE');
        }, 2500);
        break;
      }

      case 'RESET_IDLE': {
        setCartData(null);
        setPaymentData(null);
        setSuccessData(null);
        setMode('IDLE');
        break;
      }

      case 'CONFIG_UPDATE': {
        setConfig(event.payload);
        setIsMuted(event.payload.muteVideo);
        break;
      }

      case 'FORCE_CLOSE': {
        handleCloseWindow();
        break;
      }

      default:
        break;
    }
  };

  // Success countdown back to Idle
  useEffect(() => {
    if (mode === 'SUCCESS') {
      const interval = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCartData(null);
            setPaymentData(null);
            setSuccessData(null);
            setMode('IDLE');
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  // Video playback management when switching modes
  useEffect(() => {
    if (videoRef.current) {
      if (mode === 'IDLE') {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [mode]);

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCloseWindow = async () => {
    // 1. Try destroying window if in Tauri
    if (isTauriEnvironment()) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const current = getCurrentWindow();
        if (current && current.label === 'customer-display') {
          await current.destroy();
          return;
        }
      } catch (e) {
        console.warn('Tauri getCurrentWindow.destroy failed', e);
      }

      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('close_customer_display');
        return;
      } catch (e) {
        console.warn('Tauri close_customer_display failed', e);
      }
    }

    // 2. Try closing browser popup window
    try {
      window.close();
    } catch (e) {}
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseWindow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Memoize active promotional media to prevent infinite re-rendering
  const activeMedia = React.useMemo(() => {
    if (!config?.mediaPlaylist || config.mediaPlaylist.length === 0) return null;
    return (
      config.mediaPlaylist.find((m) => m.id === config.activeMediaId && m.active) ||
      config.mediaPlaylist.find((m) => m.active) ||
      config.mediaPlaylist[0] ||
      null
    );
  }, [config.mediaPlaylist, config.activeMediaId]);

  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let localBlobUrl: string | null = null;

    if (!activeMedia || activeMedia.type !== 'video' || !activeMedia.url) {
      setResolvedVideoUrl(null);
      return;
    }

    const resolveUrl = async () => {
      try {
        if (activeMedia.id.startsWith('local-') || activeMedia.id.startsWith('db-')) {
          const blob = await getMediaBlob(activeMedia.id);
          if (blob && !isCancelled) {
            localBlobUrl = URL.createObjectURL(blob);
            setResolvedVideoUrl(localBlobUrl);
            setVideoError(false);
            return;
          }
        }

        if (!isCancelled) {
          setResolvedVideoUrl(activeMedia.url);
          setVideoError(false);
        }
      } catch (err) {
        console.warn('Error resolving video url:', err);
        if (!isCancelled) {
          setResolvedVideoUrl(activeMedia.url);
        }
      }
    };

    resolveUrl();

    return () => {
      isCancelled = true;
      if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    };
  }, [activeMedia?.id, activeMedia?.url]);

  if (!mounted) {
    return (
      <div className="w-screen h-screen bg-[#0B0F19] flex flex-col items-center justify-center gap-4 text-white font-sans">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Initializing cMart Customer Display...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none font-sans transition-colors duration-500 ${
        config.theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F19] text-white'
      }`}
    >
      {/* ──────────────── TOP FLOATING SYSTEM CONTROLS (Hidden inside simulator iframe) ──────────────── */}
      {!isInIframe && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2.5">
          <button
            onClick={handleCloseWindow}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg shadow-rose-950/40 border border-rose-500/40 transition-all cursor-pointer"
            title="Close Customer Display Window (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Window</span>
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-slate-900/70 backdrop-blur-md text-white border border-slate-700/50 hover:bg-slate-800 transition-all cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/70 backdrop-blur-md text-white border border-slate-700/50 hover:bg-slate-800 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* ──────────────── 1. IDLE / ADVERTISEMENT MODE ──────────────── */}
      <AnimatePresence>
        {mode === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-10 flex flex-col bg-slate-950"
          >
            {/* Background Video Player */}
            {activeMedia && activeMedia.type === 'video' && resolvedVideoUrl && !videoError ? (
              <video
                ref={videoRef}
                src={resolvedVideoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onError={() => setVideoError(true)}
                className="absolute inset-0 w-full h-full object-cover opacity-90 brightness-95"
              />
            ) : (
              /* Fallback Animated Store Showcase when no video or error */
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/40 to-slate-900 flex items-center justify-center p-8 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />

                <div className="relative z-10 text-center max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-sm tracking-wide uppercase shadow-lg shadow-blue-500/10">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Special Promotions & Offers Today
                  </div>

                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                    {config.storeName}
                  </h1>

                  <p className="text-xl text-slate-300 font-medium max-w-xl mx-auto">
                    {config.storeTagline}
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-6">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <Tag className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <h4 className="font-bold text-white text-base">Best Value</h4>
                      <p className="text-xs text-slate-400 mt-1">Guaranteed lowest retail prices</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <Gift className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <h4 className="font-bold text-white text-base">Loyalty Points</h4>
                      <p className="text-xs text-slate-400 mt-1">Earn points on every single purchase</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <ShieldCheck className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                      <h4 className="font-bold text-white text-base">100% Fresh</h4>
                      <p className="text-xs text-slate-400 mt-1">Premium quality goods guaranteed</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subtle Gradient Overlays for Video Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/70 pointer-events-none" />

            {/* Top Store Header & Clock */}
            <div className="relative z-20 flex justify-between items-center p-8 lg:p-10 pointer-events-none">
              <div className="flex items-center gap-4 bg-slate-900/70 backdrop-blur-xl border border-slate-700/40 px-6 py-3.5 rounded-2xl shadow-xl">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/30">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white leading-tight">
                    {config.storeName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 tracking-wider">
                    {config.storeTagline}
                  </p>
                </div>
              </div>

              {/* Live Digital Clock */}
              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/40 px-6 py-3.5 rounded-2xl text-right shadow-xl">
                <div className="text-2xl font-black tracking-tight text-white font-mono flex items-center justify-end gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  {currentTime}
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-0.5">
                  {currentDate}
                </div>
              </div>
            </div>

            {/* Bottom Promotional Ticker */}
            <div className="relative z-20 mt-auto p-8 lg:p-10">
              <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 p-5 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Welcome Customer</span>
                    <p className="text-base lg:text-lg font-bold text-white">
                      Please place your items on the counter. Your bill will appear live on this screen.
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Ready to scan
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── 2. LIVE SHOPPING CART MODE ──────────────── */}
      <AnimatePresence>
        {mode === 'CART' && cartData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 grid grid-cols-12 h-full overflow-hidden p-6 lg:p-8 gap-6"
          >
            {/* Left 7 Columns: Items List */}
            <div className="col-span-7 flex flex-col h-full bg-slate-900/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl overflow-hidden">
              {/* Table Header / Title */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Your Order</h2>
                    <p className="text-xs font-medium text-slate-400">
                      {cartData.totalItems} {cartData.totalItems === 1 ? 'item' : 'items'} in cart
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Scanning
                  </span>
                </div>
              </div>

              {/* Items Table Headers */}
              <div className="grid grid-cols-12 gap-3 py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60">
                <div className="col-span-6">Item Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Scrollable Cart Items with Auto-Scroll */}
              <div ref={cartScrollRef} className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 custom-scrollbar">
                {cartData.items.map((item, idx) => (
                  <motion.div
                    key={`${item.productId}-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-12 gap-3 items-center p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all"
                  >
                    {/* Item Name & Details */}
                    <div className="col-span-6 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-400 font-black text-xs">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Package className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-base truncate leading-snug">
                          {item.productName}
                        </h4>
                        {item.discount && item.discount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <Percent className="w-3 h-3" /> Saved {formatLKR(item.discount)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Standard item
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Badge */}
                    <div className="col-span-2 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black text-sm">
                        × {item.quantity}
                      </span>
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-semibold text-slate-300">
                        {formatLKR(item.price)}
                      </span>
                    </div>

                    {/* Line Total */}
                    <div className="col-span-2 text-right">
                      <span className="text-base font-black text-white">
                        {formatLKR(item.subtotal)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Reassurance */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Verified Cmart Price Guarantee
                </span>
                <span>Prices inclusive of statutory taxes</span>
              </div>
            </div>

            {/* Right 5 Columns: Summary & Customer Card */}
            <div className="col-span-5 flex flex-col h-full gap-6">
              {/* Store & Customer Greeting Card */}
              <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg leading-tight">{config.storeName}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Welcome Customer</p>
                  </div>
                </div>

                {cartData.customer && (
                  <div className="bg-blue-500/10 border border-blue-500/30 px-3.5 py-2 rounded-2xl text-right">
                    <p className="text-xs font-bold text-blue-400 flex items-center justify-end gap-1">
                      <User className="w-3.5 h-3.5" />
                      {cartData.customer.name || 'Valued Member'}
                    </p>
                    {cartData.customer.loyaltyPoints !== undefined && (
                      <p className="text-[11px] font-extrabold text-emerald-400">
                        {cartData.customer.loyaltyPoints} Loyalty Pts
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Grand Total & Breakdown Card */}
              <div className="flex-1 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    Payment Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-base text-slate-300">
                      <span>Subtotal ({cartData.totalItems} items)</span>
                      <span className="font-bold text-white">{formatLKR(cartData.subtotal)}</span>
                    </div>

                    {(cartData.discount ?? cartData.discountAmount ?? 0) > 0 && (
                      <div className="flex justify-between items-center text-base text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl">
                        <span className="font-bold flex items-center gap-1.5">
                          <Gift className="w-4 h-4" /> You Saved
                        </span>
                        <span className="font-black">- {formatLKR(cartData.discount ?? cartData.discountAmount ?? 0)}</span>
                      </div>
                    )}

                    {(cartData.tax ?? cartData.taxAmount ?? 0) > 0 && (
                      <div className="flex justify-between items-center text-sm text-slate-400">
                        <span>Tax</span>
                        <span className="font-semibold text-slate-300">+{formatLKR(cartData.tax ?? cartData.taxAmount ?? 0)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Big Total Box */}
                <div className="pt-6 border-t border-slate-800 mt-6">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                    Total Amount Due
                  </span>
                  <div className="text-4xl lg:text-5xl font-black tracking-tight text-white font-mono text-emerald-400">
                    {formatLKR(cartData.total)}
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mt-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Cashier is ringing up your items...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── 3. PAYMENT MODE ──────────────── */}
      <AnimatePresence>
        {mode === 'PAYMENT' && paymentData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-30 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-2xl"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 lg:p-12 max-w-2xl w-full text-center space-y-8">
              {/* Payment Method Header Icon */}
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10">
                {paymentData.method === 'CASH' && <Banknote className="w-10 h-10 text-emerald-400" />}
                {paymentData.method === 'CARD' && <CreditCard className="w-10 h-10 text-blue-400" />}
                {paymentData.method === 'PAYHERE_QR' && <QrCode className="w-10 h-10 text-violet-400" />}
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Payment in Progress
                </span>
                <h2 className="text-3xl font-black text-white mt-1">
                  {paymentData.method === 'CASH' && 'Cash Payment'}
                  {paymentData.method === 'CARD' && 'Card Payment'}
                  {paymentData.method === 'PAYHERE_QR' && 'Scan QR to Pay'}
                </h2>
              </div>

              {/* Total Due Pill */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 max-w-md mx-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Amount Due
                </span>
                <div className="text-4xl lg:text-5xl font-black text-white font-mono text-emerald-400">
                  {formatLKR(paymentData.total)}
                </div>
              </div>

              {/* Detailed Payment Mode Prompts */}
              {paymentData.method === 'CASH' && (
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-xs font-bold text-slate-400">Tendered Cash</span>
                    <p className="text-xl font-black text-white mt-1">
                      {(paymentData.tenderedAmount ?? paymentData.tendered ?? 0) > 0
                        ? formatLKR(paymentData.tenderedAmount ?? paymentData.tendered ?? 0)
                        : 'Processing...'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left">
                    <span className="text-xs font-bold text-emerald-400">Change Due</span>
                    <p className="text-xl font-black text-emerald-400 mt-1">
                      {(paymentData.change ?? 0) > 0 ? formatLKR(paymentData.change ?? 0) : 'Rs. 0.00'}
                    </p>
                  </div>
                </div>
              )}

              {paymentData.method === 'CARD' && (
                <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 max-w-md mx-auto text-center space-y-2">
                  <p className="font-bold text-white text-base">Please follow instructions on card terminal</p>
                  <p className="text-xs text-slate-300">Tap, insert or swipe your debit/credit card</p>
                </div>
              )}

              {paymentData.method === 'PAYHERE_QR' && (
                <div className="p-6 rounded-3xl bg-white text-slate-900 max-w-xs mx-auto text-center shadow-2xl space-y-3">
                  <div className="w-48 h-48 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center p-2 border-2 border-slate-900/10">
                    {paymentData.qrCodeData ? (
                      <img src={paymentData.qrCodeData} alt="PayHere QR" className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-36 h-36 text-slate-900" />
                    )}
                  </div>
                  <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    Scan with any LankaQR or Banking App
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-400 font-medium">
                Your cashier is processing your transaction
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── 4. SUCCESS / THANK YOU MODE ──────────────── */}
      <AnimatePresence>
        {mode === 'SUCCESS' && successData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, type: 'spring', damping: 20 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-3xl"
          >
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl p-8 lg:p-12 max-w-xl w-full text-center space-y-6 relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Animated Checkmark Badge */}
              <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Payment Received
                </span>
                <h2 className="text-4xl font-black text-white mt-3 tracking-tight">
                  Thank You!
                </h2>
                <p className="text-slate-300 font-medium mt-1">
                  We appreciate your business at {config.storeName}
                </p>
              </div>

              {/* Receipt Summary Details */}
              <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-3 text-left">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Invoice Number:</span>
                  <span className="font-mono font-bold text-white">{successData.invoiceNo}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Payment Method:</span>
                  <span className="font-bold text-slate-200">{successData.paymentMethod || 'Paid'}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-300">Total Paid:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {formatLKR(successData.total ?? successData.totalPaid ?? 0)}
                  </span>
                </div>
                {(successData.change ?? 0) > 0 && (
                  <div className="flex justify-between items-baseline text-sm font-bold text-amber-400">
                    <span>Change Returned:</span>
                    <span className="text-lg font-black font-mono">{formatLKR(successData.change ?? 0)}</span>
                  </div>
                )}
              </div>

              {/* Auto Countdown Progress */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Returning to home screen in <span className="font-bold text-white">{countdownSeconds}s</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── 5. HELD / CANCELLED STATE OVERLAY ──────────────── */}
      <AnimatePresence>
        {mode === 'HOLD' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-35 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-8"
          >
            <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-3 max-w-md">
              <Clock className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-2xl font-black text-white">Order On Hold</h3>
              <p className="text-sm text-slate-300">
                Please step aside while cashier assists you. Your items will be retained.
              </p>
            </div>
          </motion.div>
        )}

        {mode === 'CANCEL' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-35 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-8"
          >
            <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-3 max-w-md">
              <Package className="w-12 h-12 text-rose-400 mx-auto" />
              <h3 className="text-2xl font-black text-white">Transaction Cancelled</h3>
              <p className="text-sm text-slate-300">
                {cancelReason || 'Items cleared from checkout.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
