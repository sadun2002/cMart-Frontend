'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Package, Shield, GripVertical, LayoutDashboard, CloudRain, CloudOff } from 'lucide-react';
import { format } from 'date-fns';
import { dashboardComponents } from '@/lib/dashboard-components';
import { useAuthStore } from '@/lib/auth-store';
import { ComponentPreview } from '../settings/customize/ComponentPreview';

const STORAGE_KEY = 'cMart_dashboard_prefs';
const ORDER_KEY = 'cMart_dashboard_widget_order';

// ── Draggable Widget Wrapper ─────────────────────────────────────────────────
interface DraggableWidgetProps {
  id: string;
  index: number;
  children: React.ReactNode;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isOver: boolean;
}

function DraggableWidget({
  id,
  index,
  children,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  isOver,
}: DraggableWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id={`widget-${id}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={e => e.preventDefault()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
      style={{
        opacity: isDragging ? 0.3 : 1,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        transform: isOver && !isDragging ? 'scale(1.02)' : 'scale(1)',
        outline: isOver && !isDragging ? '2px dashed #3B82F6' : 'none',
        outlineOffset: '4px',
        borderRadius: '1rem',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Drag Handle — visible on hover */}
      <div
        className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-md backdrop-blur-sm cursor-grab active:cursor-grabbing"
        style={{
          opacity: isHovered || isDragging ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
        <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 hidden sm:block">Drag</span>
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
  // Ordered list of non-KPI widget IDs (persisted separately)
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [renewalDate, setRenewalDate] = useState<string>('');

  const dragIndex = useRef<number>(-1);
  const overIndex = useRef<number>(-1);
  const [draggingIdx, setDraggingIdx] = useState<number>(-1);
  const [overIdx, setOverIdx] = useState<number>(-1);

  // ── Clock tick ──────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Load prefs ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.enabledComponents) {
          setEnabledIds(prefs.enabledComponents);
        }
      } else {
        setEnabledIds(dashboardComponents.filter(c => c.default).map(c => c.id));
      }
    } catch {}
    setLoading(false);
  }, []);

  // ── Sync widget order whenever enabledIds changes ────────────────────────
  useEffect(() => {
    if (enabledIds.length === 0) return;

    // non-KPI ids from enabled list
    const nonKpiIds = enabledIds.filter(id => {
      const comp = dashboardComponents.find(c => c.id === id);
      return comp && comp.category !== 'kpi';
    });

    // Load saved order
    try {
      const savedOrder: string[] = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
      // Merge: keep saved order for IDs still present, append new ones at end
      const merged = [
        ...savedOrder.filter(id => nonKpiIds.includes(id)),
        ...nonKpiIds.filter(id => !savedOrder.includes(id)),
      ];
      setWidgetOrder(merged);
    } catch {
      setWidgetOrder(nonKpiIds);
    }
  }, [enabledIds]);

  // ── Resolve renewal date from subscription ───────────────────────────────
  useEffect(() => {
    const sub = user?.tenant?.subscription;
    if (!sub) {
      setRenewalDate('');
      return;
    }
    const raw = sub.nextBillingDate || sub.endDate || sub.trialEndDate || sub.startDate;
    if (!raw) {
      setRenewalDate('');
      return;
    }
    try {
      setRenewalDate(format(new Date(raw), 'MMM d, yyyy'));
    } catch {
      setRenewalDate('');
    }
  }, [user?.tenant?.subscription]);

  // ── Save order to localStorage ───────────────────────────────────────────
  const saveOrder = useCallback((order: string[]) => {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {}
  }, []);

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleDragStart = useCallback((idx: number) => {
    dragIndex.current = idx;
    setDraggingIdx(idx);
  }, []);

  const handleDragEnter = useCallback((idx: number) => {
    overIndex.current = idx;
    setOverIdx(idx);
  }, []);

  const handleDragEnd = useCallback(() => {
    const from = dragIndex.current;
    const to = overIndex.current;
    if (from !== -1 && to !== -1 && from !== to) {
      setWidgetOrder(prev => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        saveOrder(next);
        return next;
      });
    }
    dragIndex.current = -1;
    overIndex.current = -1;
    setDraggingIdx(-1);
    setOverIdx(-1);
  }, [saveOrder]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-slate-400 animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );

  // ── Resolve components ───────────────────────────────────────────────────
  const allEnabled = enabledIds.map(id => dashboardComponents.find(c => c.id === id)).filter(Boolean) as typeof dashboardComponents;
  const kpis = allEnabled.filter(c => c.category === 'kpi');

  // Non-KPI widgets sorted by user-defined drag order
  const orderedWidgets = widgetOrder
    .map(id => allEnabled.find(c => c.id === id))
    .filter(Boolean) as typeof dashboardComponents;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="font-sans p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ══════════════════════════════════════════════════════════════
          FIXED ZONE — Welcome Banner + KPIs (not draggable)
      ══════════════════════════════════════════════════════════════ */}

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
            
            <Link href="/employee/pos" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] transition-all w-fit mt-2">
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

      {/* KPI Cards — always top, never draggable */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {kpis.map(comp => <ComponentPreview key={comp.id} comp={{ ...comp, size: (comp.size === 'full' || !comp.size) ? 'medium' : comp.size }} isEnabled={true} layout="grid" isDashboardView={true} />)}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          DRAGGABLE ZONE — All other widgets (charts, lists, tables …)
      ══════════════════════════════════════════════════════════════ */}
      {orderedWidgets.length > 0 && (
        <div>
          {/* Zone label and Reset */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
              <GripVertical className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Drag widgets to reorder</span>
            </div>
            
            <button
              onClick={() => {
                localStorage.removeItem(ORDER_KEY);
                const defaultOrder = enabledIds.filter(id => {
                  const comp = dashboardComponents.find(c => c.id === id);
                  return comp && comp.category !== 'kpi';
                });
                setWidgetOrder(defaultOrder);
              }}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              Reset Default Layout
            </button>
          </div>

          {/* Widget grid — uses masonry-style 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 grid-flow-row-dense">
            {orderedWidgets.map((comp, idx) => {
              // Tables span full width; charts span 2 cols; everything else 1 col
              const isTable = comp.category === 'tables';
              const isChart = comp.category === 'charts' || comp.category === 'comparison' || comp.category === 'time';
              const colClass = isTable
                ? 'lg:col-span-3'
                : isChart
                ? 'lg:col-span-2'
                : 'lg:col-span-1';

              return (
                <div key={comp.id} className={colClass}>
                  <DraggableWidget
                    id={comp.id}
                    index={idx}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDragEnd={handleDragEnd}
                    isDragging={draggingIdx === idx}
                    isOver={overIdx === idx && draggingIdx !== idx}
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
          <a
            href="/employee/settings/customize"
            className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Customize Dashboard →
          </a>
        </div>
      )}
    </div>
  );
}
