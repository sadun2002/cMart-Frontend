'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Package, Shield, GripVertical, LayoutDashboard, Tags, ClipboardList, BarChart3, CloudRain, CloudOff } from 'lucide-react';
import { format } from 'date-fns';
import { dashboardComponents, getDefaultEnabledComponents } from '@/lib/dashboard-components';
import { useAuthStore } from '@/lib/auth-store';
import { ComponentPreview } from '../settings/customize/ComponentPreview';

const STORAGE_KEY = 'cMart_dashboard_prefs';
const ORDER_KEY  = 'cMart_dashboard_widget_order';

// ── Helpers ──────────────────────────────────────────────────────────────────
function getDefaultIds(userPlan?: string): string[] {
  return getDefaultEnabledComponents(userPlan);
}
function getNonKpiIds(ids: string[]): string[] {
  return ids.filter(id => {
    const comp = dashboardComponents.find(c => c.id === id);
    return comp && comp.category !== 'kpi';
  });
}

// ── Draggable Widget Wrapper ─────────────────────────────────────────────────
interface DraggableWidgetProps {
  id: string;
  index: number;
  isDragging: boolean;
  isOver: boolean;
  children: React.ReactNode;
  onHandlePointerDown: (e: React.PointerEvent, index: number) => void;
  onHandlePointerMove: (e: React.PointerEvent) => void;
  onHandlePointerUp:   (e: React.PointerEvent) => void;
}

function DraggableWidget({
  id, index, isDragging, isOver, children,
  onHandlePointerDown, onHandlePointerMove, onHandlePointerUp,
}: DraggableWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id={`widget-${id}`}
      className="relative group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        opacity: isDragging ? 0.35 : 1,
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        transform: isOver && !isDragging ? 'scale(1.02)' : 'scale(1)',
        outline: isOver && !isDragging ? '2px dashed #3B82F6' : '2px solid transparent',
        outlineOffset: '4px',
        borderRadius: '1rem',
        userSelect: 'none',
      }}
    >
      {/* Drag Handle — pointer events work through recharts SVGs */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onPointerDown={(e) => onHandlePointerDown(e, index)}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-md backdrop-blur-sm cursor-grab active:cursor-grabbing select-none touch-none"
        style={{
          opacity: isHovered || isDragging ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: isHovered || isDragging ? 'auto' : 'none',
        }}
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400 pointer-events-none" />
        <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 hidden sm:block pointer-events-none">Drag</span>
      </div>
      {children}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function StoreOwnerDashboard() {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [enabledIds, setEnabledIds] = useState<string[]>([]);
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [renewalDate, setRenewalDate] = useState<string>('');

  // Pointer drag refs (no state for indices to avoid stale closures)
  const dragSourceRef = useRef<number>(-1);
  const dragTargetRef = useRef<number>(-1);
  const [draggingIdx, setDraggingIdx] = useState<number>(-1);
  const [overIdx,     setOverIdx]     = useState<number>(-1);
  // Map widget DOM id -> orderedWidgets index, refreshed every render
  const widgetIdxMap = useRef<Record<string, number>>({});
  
  // Auto-scroll ref
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollSpeedRef = useRef<number>(0);

  // Clean up auto-scroll on unmount
  useEffect(() => {
    return () => stopAutoScroll();
  }, []);

  // ── Clock ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Load prefs ─────────────────────────────────────────────────────────
  useEffect(() => {
    const plan = user?.tenant?.subscription?.plan;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.enabledComponents?.length) {
          setEnabledIds(prefs.enabledComponents);
        } else {
          setEnabledIds(getDefaultIds(plan));
        }
      } else {
        setEnabledIds(getDefaultIds(plan));
      }
    } catch {
      setEnabledIds(getDefaultIds(plan));
    }
    setLoading(false);
  }, [user?.tenant?.subscription?.plan]);

  // ── Sync widget order ──────────────────────────────────────────────────
  useEffect(() => {
    if (enabledIds.length === 0) return;
    const nonKpiIds = getNonKpiIds(enabledIds);
    try {
      const savedOrder: string[] = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
      const merged = [
        ...savedOrder.filter(id => nonKpiIds.includes(id)),
        ...nonKpiIds.filter(id => !savedOrder.includes(id)),
      ];
      setWidgetOrder(merged);
    } catch {
      setWidgetOrder(nonKpiIds);
    }
  }, [enabledIds]);

  // ── Renewal date ───────────────────────────────────────────────────────
  useEffect(() => {
    const sub = user?.tenant?.subscription;
    if (!sub) { setRenewalDate(''); return; }
    const raw = sub.nextBillingDate || sub.endDate || sub.trialEndDate || sub.startDate;
    if (!raw) { setRenewalDate(''); return; }
    try { setRenewalDate(format(new Date(raw), 'MMM d, yyyy')); } catch { setRenewalDate(''); }
  }, [user?.tenant?.subscription]);

  // ── Persist helpers ────────────────────────────────────────────────────
  const saveOrder = useCallback((order: string[]) => {
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch {}
  }, []);

  const saveEnabledIds = useCallback((ids: string[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabledComponents: ids })); } catch {}
  }, []);

  // ── Reset: layout order + enabled components back to defaults ──────────
  const handleResetDefault = useCallback(() => {
    const plan = user?.tenant?.subscription?.plan;
    const defaultIds   = getDefaultIds(plan);
    const defaultOrder = getNonKpiIds(defaultIds);
    localStorage.removeItem(ORDER_KEY);
    saveEnabledIds(defaultIds);
    setEnabledIds(defaultIds);
    setWidgetOrder(defaultOrder);
  }, [saveEnabledIds, user?.tenant?.subscription?.plan]);

  // ── Pointer drag (replaces HTML5 drag — works in Tauri WebView) ────────
  const handlePointerDown = useCallback((e: React.PointerEvent, idx: number) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragSourceRef.current = idx;
    dragTargetRef.current = -1;
    setDraggingIdx(idx);
    setOverIdx(-1);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    autoScrollSpeedRef.current = 0;
  }, []);

  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) return;
    autoScrollRef.current = setInterval(() => {
      if (autoScrollSpeedRef.current === 0) return;
      const container = document.querySelector('main');
      if (container) {
        container.scrollBy({ top: autoScrollSpeedRef.current, behavior: 'auto' });
      } else {
        window.scrollBy({ top: autoScrollSpeedRef.current, behavior: 'auto' });
      }
    }, 16);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragSourceRef.current === -1) return;

    // Auto-scroll logic with variable speed
    const THRESHOLD = 150;
    const MAX_SPEED = 25;
    
    if (e.clientY < THRESHOLD) {
      const distance = THRESHOLD - Math.max(0, e.clientY);
      autoScrollSpeedRef.current = -(distance / THRESHOLD) * MAX_SPEED;
      startAutoScroll();
    } else if (window.innerHeight - e.clientY < THRESHOLD) {
      const distance = THRESHOLD - Math.max(0, window.innerHeight - e.clientY);
      autoScrollSpeedRef.current = (distance / THRESHOLD) * MAX_SPEED;
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    // elementFromPoint pierces through chart SVGs (pointer capture doesn't affect it)
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const widgetEl = el?.closest('[id^="widget-"]') as HTMLElement | null;
    if (widgetEl) {
      const widgetId  = widgetEl.id.replace('widget-', '');
      const targetIdx = widgetIdxMap.current[widgetId];
      if (targetIdx !== undefined && targetIdx !== dragSourceRef.current) {
        dragTargetRef.current = targetIdx;
        setOverIdx(targetIdx);
      }
    } else {
      dragTargetRef.current = -1;
      setOverIdx(-1);
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    stopAutoScroll();
    const from = dragSourceRef.current;
    const to   = dragTargetRef.current;
    if (from !== -1 && to !== -1 && from !== to) {
      setWidgetOrder(prev => {
        const next    = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        saveOrder(next);
        return next;
      });
    }
    dragSourceRef.current = -1;
    dragTargetRef.current = -1;
    setDraggingIdx(-1);
    setOverIdx(-1);
  }, [saveOrder, stopAutoScroll]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-slate-400 animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );

  // ── Resolve components ─────────────────────────────────────────────────
  const allEnabled     = enabledIds.map(id => dashboardComponents.find(c => c.id === id)).filter(Boolean) as typeof dashboardComponents;
  const kpis           = allEnabled.filter(c => c.category === 'kpi');
  const orderedWidgets = widgetOrder.map(id => allEnabled.find(c => c.id === id)).filter(Boolean) as typeof dashboardComponents;

  // Refresh index map every render so pointer callbacks see current positions
  const newMap: Record<string, number> = {};
  orderedWidgets.forEach((w, i) => { newMap[w.id] = i; });
  widgetIdxMap.current = newMap;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="font-sans p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-xl shadow-blue-200/50 dark:shadow-blue-900/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white truncate">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-blue-100 text-sm">
                  {format(currentTime, 'EEEE, MMMM d, yyyy')}
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-white text-xs font-semibold rounded-full backdrop-blur-sm w-fit">
                  <Shield className="w-3 h-3" />
                  {user?.tenant?.plan || 'Free'} Plan {renewalDate ? `· Renews ${renewalDate}` : ''}
                </span>
              </div>
            </div>
            
            <Link href="/owner/pos" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] transition-all w-fit mt-2">
              <Plus className="w-4 h-4" />
              New Sale
            </Link>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-5 mt-4 lg:mt-0 bg-black/10 p-4 lg:p-5 rounded-2xl backdrop-blur-md border border-white/10 w-full lg:w-auto">
            <div className="text-left lg:text-right">
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">Local Time</p>
              <div className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-baseline">
                <span>{format(currentTime, 'hh')}</span>
                <span className="mx-1 animate-pulse opacity-70">:</span>
                <span>{format(currentTime, 'mm')}</span>
                <span className="text-lg font-bold ml-2 opacity-90">{format(currentTime, 'a')}</span>
              </div>
            </div>
            
            <div className="w-px h-12 bg-white/20"></div>
            
            <div className="flex items-center gap-3 text-left">
              {(user?.tenant?.plan === 'PRO' || user?.tenant?.plan === 'ENTERPRISE') ? (
                <>
                  <div className="p-2.5 bg-blue-500/30 rounded-xl hidden sm:block">
                    <CloudRain className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl lg:text-3xl font-black text-white tracking-tight">28°C</p>
                    <p className="text-blue-200 text-xs font-semibold">Rainy</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2.5 bg-white/5 rounded-xl hidden sm:block opacity-60">
                    <CloudOff className="w-7 h-7 text-white/50" />
                  </div>
                  <div className="opacity-60">
                    <p className="text-2xl lg:text-3xl font-black text-white/60 tracking-tight">--°C</p>
                    <p className="text-white/40 text-xs font-semibold">Unavailable</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards — fixed top, not draggable */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {kpis.map(comp => (
            <ComponentPreview
              key={comp.id}
              comp={{ ...comp, size: (comp.size === 'full' || !comp.size) ? 'medium' : comp.size }}
              isEnabled={true}
              layout="grid"
              isDashboardView={true}
            />
          ))}
        </div>
      )}

      {/* Draggable Widgets Zone */}
      {orderedWidgets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
              <GripVertical className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Hover a widget and drag the handle to reorder</span>
            </div>
            <button
              onClick={handleResetDefault}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              Reset Default Layout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 grid-flow-row-dense">
            {orderedWidgets.map((comp, idx) => {
              const isTable = comp.category === 'tables';
              const isChart = comp.category === 'charts' || comp.category === 'comparison' || comp.category === 'time';
              const colClass = isTable ? 'lg:col-span-3' : isChart ? 'lg:col-span-2' : 'lg:col-span-1';
              return (
                <div key={comp.id} className={colClass}>
                  <DraggableWidget
                    id={comp.id}
                    index={idx}
                    isDragging={draggingIdx === idx}
                    isOver={overIdx === idx && draggingIdx !== idx}
                    onHandlePointerDown={handlePointerDown}
                    onHandlePointerMove={handlePointerMove}
                    onHandlePointerUp={handlePointerUp}
                  >
                    <ComponentPreview
                      comp={{ ...comp, size: (comp.size === 'full' || !comp.size) ? 'medium' : comp.size }}
                      isEnabled={true}
                      layout="grid"
                      isDashboardView={true}
                    />
                  </DraggableWidget>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {allEnabled.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 font-medium">No components enabled on your dashboard.</p>
          <a href="/owner/settings/customize" className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Customize Dashboard →
          </a>
        </div>
      )}
    </div>
  );
}
