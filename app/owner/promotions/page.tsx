"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag, Plus, Trash2, Edit2, Calendar, Search, X, Check, Activity, Clock, Ban, CheckCircle2, ChevronDown, ChevronUp, ListFilter,
  List, LayoutGrid, Maximize, Minimize, Filter, ImageIcon, Package, Folder, ChevronRight, Percent, Layers, Settings,
  BarChart3, TrendingUp
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import { KpiCard } from '@/components/ui/kpi-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FilterPanel } from '@/components/ui/filter-panel';
import { MainRightPanel, SecondaryRightPanel } from '@/components/ui/right-panel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { 
  getLocalProducts, 
  getLocalCategories, 
  getLocalBrands, 
  getPromotionsLocally, 
  savePromotionLocally, 
  updatePromotionLocally, 
  deletePromotionLocally, 
  togglePromotionActive 
} from '@/lib/local-services';

interface PromotionsOverviewProps {
  promotions: any[];
  setActiveTab: (tab: 'overview' | 'table') => void;
  openFormPanel: (promo?: any) => void;
  setStatusFilter: (status: string) => void;
  setTypeFilter: (type: string) => void;
  getStatus: (promo: any) => string;
}

function PromotionsOverviewDashboard({
  promotions,
  setActiveTab,
  openFormPanel,
  setStatusFilter,
  setTypeFilter,
  getStatus,
}: PromotionsOverviewProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalPromotions = promotions.length;
  const activeCount = promotions.filter(p => getStatus(p) === 'Active').length;
  const scheduledCount = promotions.filter(p => getStatus(p) === 'Scheduled').length;
  const expiredCount = promotions.filter(p => getStatus(p) === 'Expired' || getStatus(p) === 'Disabled').length;

  // Chart data: Distribution by Promotion Type
  const chartData = useMemo(() => {
    const typeMap = new Map<string, number>();
    promotions.forEach(p => {
      const t = p.type || 'PERCENTAGE';
      typeMap.set(t, (typeMap.get(t) || 0) + 1);
    });
    return Array.from(typeMap.entries()).map(([name, count]) => ({
      name: name.replace(/_/g, ' '),
      rawType: name,
      count
    })).sort((a, b) => b.count - a.count);
  }, [promotions]);

  // Card 1: Active Offers Live Now
  const activePromotions = useMemo(() => {
    return promotions.filter(p => getStatus(p) === 'Active');
  }, [promotions, getStatus]);

  // Card 2: Upcoming Scheduled Campaigns
  const scheduledPromotions = useMemo(() => {
    return promotions.filter(p => getStatus(p) === 'Scheduled');
  }, [promotions, getStatus]);

  // Card 3: Promotion Types & Breakdown
  const typeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    promotions.forEach(p => {
      const t = p.type || 'PERCENTAGE';
      map.set(t, (map.get(t) || 0) + 1);
    });
    return Array.from(map.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
  }, [promotions]);

  // Card 4: Store-Wide vs Targeted Promotions
  const scopeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    promotions.forEach(p => {
      const s = p.appliesToType || (p.appliesToAll ? 'ALL_PRODUCTS' : 'TARGETED');
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map.entries()).map(([scope, count]) => ({ scope, count })).sort((a, b) => b.count - a.count);
  }, [promotions]);

  return (
    <div className="space-y-6">
      {/* ──────────────── 1. KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Promotions" 
          value={totalPromotions} 
          icon={Tag} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active Live Now" 
          value={activeCount} 
          icon={Activity} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Scheduled Upcoming" 
          value={scheduledCount} 
          icon={Clock} 
          iconColorClass="text-blue-500" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Expired / Inactive" 
          value={expiredCount} 
          icon={Calendar} 
          iconColorClass="text-amber-500" 
          iconBgClass="bg-amber-50 dark:bg-amber-500/10" 
        />
      </div>

      {/* ──────────────── 2. MID ROW: CHART (2 COLS) + CARD 1 (1 COL) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart (2 cols, h-[400px]) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 flex flex-col h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Promotion Mechanics & Type Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Breakdown of active and configured discount campaign structures
              </p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-md transition-all ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Bar
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 rounded-md transition-all ${chartType === 'line' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Line
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            {mounted ? (
              chartData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No promotions created to plot.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: any) => [`${v} Campaigns`, 'Promotions']}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: any) => [`${v} Campaigns`, 'Promotions']}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : null}
          </div>
        </div>

        {/* Card 1: Active Offers Live Now (1 col, h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Live Offers Now
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Active ({activePromotions.length})
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {activePromotions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No promotions are currently active.
              </div>
            ) : (
              activePromotions.slice(0, 5).map((promo, i) => {
                const rankColors = [
                  'bg-emerald-600 text-white',
                  'bg-emerald-500 text-white',
                  'bg-teal-500 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div
                    key={promo.id || i}
                    onClick={() => openFormPanel(promo)}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view/edit promotion"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                          {promo.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Ends: {new Date(promo.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      {promo.type === 'PERCENTAGE' ? `${promo.offerValue}% OFF` : `Rs. ${promo.offerValue}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('active');
                setActiveTab('table');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View Active in Promotions Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 RANKINGS / INSIGHTS CARDS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 2: Upcoming Scheduled Campaigns */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Scheduled Upcoming
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              Future ({scheduledPromotions.length})
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {scheduledPromotions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No future campaigns scheduled.
              </div>
            ) : (
              scheduledPromotions.slice(0, 5).map((promo, i) => (
                <div
                  key={promo.id || i}
                  onClick={() => openFormPanel(promo)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view/edit promotion"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {promo.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Starts: {new Date(promo.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 shrink-0">
                    {promo.type === 'PERCENTAGE' ? `${promo.offerValue}%` : `Rs. ${promo.offerValue}`}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('scheduled');
                setActiveTab('table');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View Scheduled in Table →
            </button>
          </div>
        </div>

        {/* Card 3: Promotion Types */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Promotion Types
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Mechanics
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {typeBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No promotion types recorded.
              </div>
            ) : (
              typeBreakdown.slice(0, 5).map((t, i) => (
                <div
                  key={t.type || i}
                  onClick={() => {
                    setTypeFilter(t.type);
                    setActiveTab('table');
                  }}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to filter by type in table"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                        {t.type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {t.count} configured campaign{t.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                    {Math.round((t.count / Math.max(1, totalPromotions)) * 100)}%
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              Filter Types in Table →
            </button>
          </div>
        </div>

        {/* Card 4: Store-Wide vs Targeted */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Promotion Scope
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Audience
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {scopeBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No promotion scope data.
              </div>
            ) : (
              scopeBreakdown.slice(0, 5).map((s, i) => (
                <div
                  key={s.scope || i}
                  onClick={() => setActiveTab('table')}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view promotions in table"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">
                        {s.scope.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {s.count} promotion{s.count !== 1 ? 's' : ''} applied
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 shrink-0">
                    {Math.round((s.count / Math.max(1, totalPromotions)) * 100)}%
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View Scope in Table →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const { user } = useAuthStore();
  
  // Data States
  const [promotions, setPromotions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Promotion States
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_promotion_form');
    } catch (e) {}
    resetForm();
    setIsPanelOpen(false);
  };
  
  const [name, setName] = useState('');
  const [type, setType] = useState('PERCENTAGE'); // PERCENTAGE, FIXED, BUY_X_GET_Y
  const [offerValue, setOfferValue] = useState('');
  const [quantityRequirement, setQuantityRequirement] = useState('');
  const [rewardQuantity, setRewardQuantity] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Default to today for start date, tomorrow for end date
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  
  // Applies To States
  const [appliesToAll, setAppliesToAll] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [active, setActive] = useState(true);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionSearch, setSelectionSearch] = useState('');
  
  // New UI Layout States
  const [viewMode, setViewMode] = useState<'list'|'grid'>('list');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionPanelType, setSelectionPanelType] = useState<'PRODUCTS'|'CATEGORIES'|'BRANDS'|null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    mechanics: false,
    schedule: false,
    scope: false,
    status: false,
  });

  // Validation Error State
  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);

  const triggerValidation = (sectionKey: string, fieldId: string, message: string) => {
    setValidationError({ field: fieldId, message });

    const focus = () => {
      setTimeout(() => {
        const el = document.getElementById(fieldId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 100);
    };

    if (sectionKey && !openSections[sectionKey]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
      setTimeout(focus, 300);
    } else {
      focus();
    }

    setTimeout(() => setValidationError(null), 3500);
  };

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        basic: false,
        mechanics: false,
        schedule: false,
        scope: false,
        status: false,
        [section]: true
      };
    });
  };
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [user?.tenantId]);

  const loadData = async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    try {
      const [promos, prods, cats, brnds] = await Promise.all([
        getPromotionsLocally(user.tenantId),
        getLocalProducts(user.tenantId, user.branchId || 1),
        getLocalCategories(user.tenantId),
        getLocalBrands(user.tenantId)
      ]);
      setPromotions(promos);
      setProducts(prods);
      setCategories(cats);
      setBrands(brnds);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (promo: any) => {
    if (!promo.active) return 'Disabled';
    const now = new Date();
    
    // Parse dates to include full day boundaries
    const start = new Date(promo.startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(promo.endDate);
    end.setHours(23, 59, 59, 999);

    if (now < start) return 'Scheduled';
    if (now > end) return 'Expired';
    return 'Active';
  };

  const resetForm = () => {
    setName('');
    setType('PERCENTAGE');
    setOfferValue('');
    setQuantityRequirement('');
    setRewardQuantity('');
    setStartDate(todayStr);
    setEndDate(tomorrowStr);
    setAppliesToAll(true);
    setSelectedProducts([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setActive(true);
    setBannerFile(null);
    setBannerPreview(null);
    setSelectionPanelType(null);
    setExpandedCategories([]);
    setSelectionSearch('');
    setIsEditing(false);
    setEditId(null);
  };

  const openFormPanel = (promo?: any) => {
    if (promo) {
      handleEdit(promo);
    } else {
      setIsEditing(false);
      setEditId(null);
      try {
        const saved = localStorage.getItem('draft_promotion_form');
        if (saved) {
          const d = JSON.parse(saved);
          if (d.name !== undefined) setName(d.name);
          if (d.type !== undefined) setType(d.type);
          if (d.offerValue !== undefined) setOfferValue(d.offerValue);
          if (d.quantityRequirement !== undefined) setQuantityRequirement(d.quantityRequirement);
          if (d.rewardQuantity !== undefined) setRewardQuantity(d.rewardQuantity);
          if (d.startDate !== undefined) setStartDate(d.startDate);
          if (d.endDate !== undefined) setEndDate(d.endDate);
          if (d.appliesToAll !== undefined) setAppliesToAll(d.appliesToAll);
          if (Array.isArray(d.selectedProducts)) setSelectedProducts(d.selectedProducts);
          if (Array.isArray(d.selectedCategories)) setSelectedCategories(d.selectedCategories);
          if (Array.isArray(d.selectedBrands)) setSelectedBrands(d.selectedBrands);
          if (d.active !== undefined) setActive(d.active);
        } else {
          resetForm();
        }
      } catch (e) {
        resetForm();
      }
    }
    setIsPanelOpen(true);
  };

  // Auto-save draft for new promotion
  useEffect(() => {
    if (isEditing || !isPanelOpen) return;
    const hasData = Boolean(
      name || offerValue || quantityRequirement || rewardQuantity ||
      selectedProducts.length > 0 || selectedCategories.length > 0 || selectedBrands.length > 0
    );
    if (hasData) {
      try {
        const draft = {
          name, type, offerValue, quantityRequirement, rewardQuantity,
          startDate, endDate, appliesToAll, selectedProducts,
          selectedCategories, selectedBrands, active
        };
        localStorage.setItem('draft_promotion_form', JSON.stringify(draft));
      } catch (e) {}
    }
  }, [name, type, offerValue, quantityRequirement, rewardQuantity, startDate, endDate, appliesToAll, selectedProducts, selectedCategories, selectedBrands, active, isEditing, isPanelOpen]);

  const handleEdit = (promo: any) => {
    setName(promo.name);
    setType(promo.type);
    setOfferValue(promo.offerValue?.toString() || '');
    setQuantityRequirement(promo.quantityRequirement?.toString() || '');
    setRewardQuantity(promo.rewardQuantity?.toString() || '');
    setStartDate(promo.startDate.split('T')[0]);
    setEndDate(promo.endDate.split('T')[0]);
    
    if (promo.appliesToType === 'ALL') {
      setAppliesToAll(true);
      setSelectedProducts([]);
      setSelectedCategories([]);
      setSelectedBrands([]);
    } else {
      setAppliesToAll(false);
      let ids = [];
      try {
        ids = promo.appliesToIds ? (typeof promo.appliesToIds === 'string' ? JSON.parse(promo.appliesToIds) : promo.appliesToIds) : [];
      } catch (e) { ids = []; }
      
      setSelectedProducts([]);
      setSelectedCategories([]);
      setSelectedBrands([]);
      
      if (promo.appliesToType === 'PRODUCTS') setSelectedProducts(ids);
      else if (promo.appliesToType === 'CATEGORIES') setSelectedCategories(ids);
      else if (promo.appliesToType === 'BRANDS') setSelectedBrands(ids);
      else if (promo.appliesToType === 'MIXED') {
        setSelectedProducts(ids.products || []);
        setSelectedCategories(ids.categories || []);
        setSelectedBrands(ids.brands || []);
      }
    }
    
    setActive(promo.active);
    setBannerPreview(promo.banner || null);
    setSelectionPanelType(null);
    setExpandedCategories([]);
    setSelectionSearch('');
    setIsEditing(true);
    setEditId(promo.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerValidation('basic', 'field-promo-name', 'Promotion name is required');
      return;
    }
    if (['PERCENTAGE', 'FIXED', 'SPECIAL_PRICE'].includes(type) && (!offerValue || isNaN(Number(offerValue)) || Number(offerValue) <= 0)) {
      triggerValidation('mechanics', 'field-promo-offer-value', 'Valid offer value is required');
      return;
    }
    if (type === 'QUANTITY') {
      if (!quantityRequirement || Number(quantityRequirement) <= 0) {
        triggerValidation('mechanics', 'field-promo-qty-req', 'Valid quantity requirement is required');
        return;
      }
      if (!offerValue || Number(offerValue) <= 0) {
        triggerValidation('mechanics', 'field-promo-offer-value', 'Valid bundle price is required');
        return;
      }
    }
    if (type === 'BUY_X_GET_Y') {
      if (!quantityRequirement || Number(quantityRequirement) <= 0) {
        triggerValidation('mechanics', 'field-promo-qty-req', 'Valid buy quantity is required');
        return;
      }
      if (!rewardQuantity || Number(rewardQuantity) <= 0) {
        triggerValidation('mechanics', 'field-promo-reward-qty', 'Valid free quantity is required');
        return;
      }
    }
    if (!startDate) {
      triggerValidation('schedule', 'field-promo-start-date', 'Start date is required');
      return;
    }
    if (!endDate) {
      triggerValidation('schedule', 'field-promo-end-date', 'End date is required');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      triggerValidation('schedule', 'field-promo-end-date', 'End date must be after start date');
      return;
    }
    if (!appliesToAll && selectedProducts.length === 0 && selectedCategories.length === 0 && selectedBrands.length === 0) {
      triggerValidation('scope', 'field-promo-scope', 'Please select at least one product, category, or brand');
      return;
    }

    let resolvedAppliesToType = 'ALL';
    let resolvedAppliesToIds: any = [];

    if (!appliesToAll) {
      const hasProds = selectedProducts.length > 0;
      const hasCats = selectedCategories.length > 0;
      const hasBrands = selectedBrands.length > 0;
      
      if (hasProds && !hasCats && !hasBrands) { resolvedAppliesToType = 'PRODUCTS'; resolvedAppliesToIds = selectedProducts; }
      else if (!hasProds && hasCats && !hasBrands) { resolvedAppliesToType = 'CATEGORIES'; resolvedAppliesToIds = selectedCategories; }
      else if (!hasProds && !hasCats && hasBrands) { resolvedAppliesToType = 'BRANDS'; resolvedAppliesToIds = selectedBrands; }
      else { 
        resolvedAppliesToType = 'MIXED'; 
        resolvedAppliesToIds = { products: selectedProducts, categories: selectedCategories, brands: selectedBrands }; 
      }
    }

    setIsSubmitting(true);
    try {
      const data = {
        name,
        type,
        offerValue: parseFloat(offerValue) || 0,
        quantityRequirement: parseInt(quantityRequirement) || 0,
        rewardQuantity: parseInt(rewardQuantity) || 0,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        appliesToType: resolvedAppliesToType,
        appliesToIds: JSON.stringify(resolvedAppliesToIds),
        active,
        banner: bannerPreview || null
      };

      if (isEditing && editId) {
        await updatePromotionLocally(editId, data);
        toast.success('Promotion updated successfully');
      } else {
        await savePromotionLocally(data, user?.tenantId || null);
        toast.success('Promotion created successfully');
      }
      try {
        localStorage.removeItem('draft_promotion_form');
      } catch (e) {}
      resetForm();
      setIsPanelOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmDialog({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirmDialog.id) return;
    try {
      setIsDeleting(true);
      await deletePromotionLocally(deleteConfirmDialog.id);
      toast.success('Promotion deleted');
      setDeleteConfirmDialog({ isOpen: false, id: null });
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete promotion');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await togglePromotionActive(id, !currentActive);
      toast.success(`Promotion ${!currentActive ? 'enabled' : 'disabled'}`);
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  const toggleAppliesToId = (type: 'PRODUCTS'|'CATEGORIES'|'BRANDS', id: number, isParentCat?: boolean, childrenIds?: number[]) => {
    if (type === 'PRODUCTS') setSelectedProducts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    if (type === 'BRANDS') setSelectedBrands(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    if (type === 'CATEGORIES') {
      setSelectedCategories(prev => {
        let next = [...prev];
        if (isParentCat && childrenIds) {
          const isSelected = prev.includes(id);
          if (isSelected) {
            // Remove parent and all its children
            next = next.filter(i => i !== id && !childrenIds.includes(i));
          } else {
            // Add parent and all its children
            if (!next.includes(id)) next.push(id);
            childrenIds.forEach(childId => {
              if (!next.includes(childId)) next.push(childId);
            });
          }
        } else {
          // It's a subcategory
          const isSelected = prev.includes(id);
          if (isSelected) {
            // Remove child, and also remove parent since it's no longer fully selected
            const parentId = categories.find(c => c.children?.some((sub: any) => sub.id === id))?.id;
            next = next.filter(i => i !== id && i !== parentId);
          } else {
            // Add child
            if (!next.includes(id)) next.push(id);
          }
        }
        return next;
      });
    }
  };

  const getCategorySelectionText = () => {
    let parentCount = 0;
    let subCount = 0;
    
    selectedCategories.forEach(id => {
      const isParent = categories.some(c => c.id === id);
      if (isParent) parentCount++;
      else subCount++;
    });
    
    const parts = [];
    if (parentCount > 0) parts.push(`${parentCount} ${parentCount === 1 ? 'category' : 'categories'}`);
    if (subCount > 0) parts.push(`${subCount} subcategories`);
    
    if (parts.length === 0) return '0 categories selected';
    return parts.join(', ') + ' selected';
  };

  // Helper for rendering available selections
  const getAppliesToOptions = () => {
    let options: any[] = [];
    if (selectionPanelType === 'PRODUCTS') options = products;
    if (selectionPanelType === 'CATEGORIES') options = categories;
    if (selectionPanelType === 'BRANDS') options = brands;

    return options.filter(opt => 
      opt.name?.toLowerCase().includes(selectionSearch.toLowerCase()) ||
      opt.barcode?.toLowerCase().includes(selectionSearch.toLowerCase())
    );
  };

  const renderStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Active': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      'Scheduled': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      'Expired': 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      'Disabled': 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
    };
    const icons: Record<string, any> = {
      'Active': <Activity className="w-3 h-3" />,
      'Scheduled': <Clock className="w-3 h-3" />,
      'Expired': <Calendar className="w-3 h-3" />,
      'Disabled': <Ban className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${styles[status] || styles['Disabled']}`}>
        {icons[status]} {status}
      </span>
    );
  };

  const filteredPromotions = promotions.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    const currentStatus = getStatus(p);
    if (statusFilter === 'active') matchesStatus = currentStatus === 'Active';
    if (statusFilter === 'scheduled') matchesStatus = currentStatus === 'Scheduled';
    if (statusFilter === 'expired') matchesStatus = currentStatus === 'Expired';
    if (statusFilter === 'disabled') matchesStatus = currentStatus === 'Disabled';
    
    let matchesType = true;
    if (typeFilter !== 'all') matchesType = p.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullScreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullScreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Tag className="w-7 h-7 sm:w-8 h-8 text-blue-600" />
              Promotions & Offers
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-xs sm:text-sm font-medium">Manage automated discounts and special pricing.</p>
          </div>
          
          <button 
            type="button"
            onClick={() => openFormPanel()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-5 h-5" />
            Create Promotion
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Promotions Overview | Promotions Table) */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0">
          <button 
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Promotions Overview
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          <button 
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer ${
              activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Promotions Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filter, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search promotions..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (activeTab === 'overview' && e.target.value.trim() !== '') {
                  setActiveTab('table');
                }
              }}
              className="w-full bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Filter Button */}
          <button 
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-3 sm:px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-1.5 font-bold text-xs cursor-pointer relative"
            title="Filter"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* View Mode Toggles */}
          <button 
            type="button"
            onClick={() => setViewMode('list')}
            title="List View"
            className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <List className="w-4 h-4" />
          </button>
          
          <button 
            type="button"
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />
          
          {/* Fullscreen Toggle */}
          <button 
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title="Toggle Fullscreen"
            className="flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────── CONTENT (OVERVIEW vs TABLE) ──────────────── */}
      {activeTab === 'overview' ? (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <PromotionsOverviewDashboard 
            promotions={promotions}
            setActiveTab={setActiveTab}
            openFormPanel={openFormPanel}
            setStatusFilter={setStatusFilter}
            setTypeFilter={setTypeFilter}
            getStatus={getStatus}
          />
        </div>
      ) : (
        /* PROMOTIONS LIST/GRID */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullScreen ? 'm-0 rounded-none border-none' : ''}`}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-bold">Loading promotions...</p>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <TableEmptyState
              icon={Tag}
              title="No promotions found"
              description="You haven't created any promotions yet, or none match your search. Click below to get started."
              actionLabel="Create First Promotion"
              onAction={() => openFormPanel()}
            />
          ) : viewMode === 'list' ? (
            // LIST VIEW (TABLE)
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-max">
                <div className="grid grid-cols-[300px_150px_200px_200px_150px_120px] gap-4 p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div>Promotion Name</div>
                  <div>Status</div>
                  <div>Offer</div>
                  <div>Duration</div>
                  <div>Applies To</div>
                  <div className="text-right">Actions</div>
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPromotions.map((promo) => (
                    <div key={promo.id} className="grid grid-cols-[300px_150px_200px_200px_150px_120px] gap-4 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{promo.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{promo.type.replace(/_/g, ' ')}</p>
                      </div>
                      
                      <div>
                        {renderStatusBadge(getStatus(promo))}
                      </div>
                      
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                          {promo.type === 'PERCENTAGE' && `${promo.offerValue}% OFF`}
                          {promo.type === 'FIXED' && `Rs. ${promo.offerValue} OFF`}
                          {promo.type === 'SPECIAL_PRICE' && `Rs. ${promo.offerValue} SPECIAL PRICE`}
                          {promo.type === 'QUANTITY' && `BUY ${promo.quantityRequirement} FOR Rs. ${promo.offerValue}`}
                          {promo.type === 'BUY_X_GET_Y' && `BUY ${promo.quantityRequirement} GET ${promo.rewardQuantity} FREE`}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                         <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold tracking-wider uppercase">
                            {promo.appliesToType}
                         </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleActive(promo.id, promo.active)}
                          className={`p-2 rounded-lg transition-colors ${promo.active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={promo.active ? 'Disable' : 'Enable'}
                        >
                          {promo.active ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => openFormPanel(promo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // GRID VIEW
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPromotions.map((promo) => (
                <div key={promo.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                  
                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                    <button onClick={() => handleToggleActive(promo.id, promo.active)} className={`p-1.5 rounded-md transition-colors ${promo.active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`} title={promo.active ? 'Disable' : 'Enable'}>
                      {promo.active ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openFormPanel(promo)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(promo.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-start justify-between mb-4 pr-20">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">{promo.name}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1 uppercase">{promo.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/30">
                      <p className="text-xs text-indigo-500 mb-1 font-bold">Offer Value</p>
                      <p className="font-black text-indigo-700 dark:text-indigo-400 text-lg">
                        {promo.type === 'PERCENTAGE' && `${promo.offerValue}% OFF`}
                        {promo.type === 'FIXED' && `Rs. ${promo.offerValue} OFF`}
                        {promo.type === 'SPECIAL_PRICE' && `Rs. ${promo.offerValue}`}
                        {promo.type === 'QUANTITY' && `BUY ${promo.quantityRequirement} FOR Rs. ${promo.offerValue}`}
                        {promo.type === 'BUY_X_GET_Y' && `BUY ${promo.quantityRequirement} GET ${promo.rewardQuantity} FREE`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium text-xs">
                          {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {renderStatusBadge(getStatus(promo))}
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold tracking-wider uppercase">
                      {promo.appliesToType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {/* SLIDE-OUT PANEL FOR FORM */}
        <MainRightPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onDiscard={handleDiscardChanges}
          title={isEditing ? 'Edit Promotion' : 'Create Promotion'}
          subtitle={isEditing ? 'Modify discount rates and schedules' : 'Set up discounts and deals'}
          icon={Tag}
          formId="promoForm"
          isSubmitting={isSubmitting}
          saveText={isEditing ? 'Save Changes' : 'Create Promotion'}
        >
          <form id="promoForm" onSubmit={handleSubmit} className="font-sans space-y-4">
                    
                    {/* Section 1: Basic Information */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                      <button 
                        type="button" 
                        onClick={() => toggleSection("basic")}
                        className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.basic ? "rounded-t-xl" : "rounded-xl"}`}
                      >
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                          <Tag className="w-4 h-4 text-blue-600" />
                          Basic Information
                        </span>
                        {openSections.basic ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                      </button>
                      <AnimatePresence>
                        {openSections.basic && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          >
                            <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                              {/* Image Upload */}
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Promotion Banner <span className="text-xs font-medium text-slate-400">(Optional)</span>
                                </label>
                                <div className="w-full relative">
                                  {bannerPreview ? (
                                    <div className="relative group w-full h-36 rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                      <img 
                                        src={bannerPreview} 
                                        alt="Banner Preview" 
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                                        onClick={() => setZoomedImage(bannerPreview)}
                                      />
                                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-[1px]">
                                        <button 
                                          type="button" 
                                          onClick={() => setZoomedImage(bannerPreview)} 
                                          className="p-2 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all shadow-md cursor-pointer hover:scale-110"
                                          title="Zoom banner"
                                        >
                                          <Maximize className="w-4 h-4" />
                                        </button>
                                        <button 
                                          type="button" 
                                          onClick={() => { setBannerFile(null); setBannerPreview(null); }} 
                                          className="p-2 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-md cursor-pointer hover:scale-110"
                                          title="Remove banner"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <label className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                      <input 
                                        type="file" 
                                        accept="image/*"
                                        className="hidden" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setBannerFile(file);
                                            const reader = new FileReader();
                                            reader.onloadend = () => setBannerPreview(reader.result as string);
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                        <Plus className="w-5 h-5" />
                                      </div>
                                      <div className="text-center">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                          Click or drag banner to upload
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-400">
                                          Supports PNG, JPG, WebP
                                        </span>
                                      </div>
                                    </label>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1.5 relative">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                  <span>Promotion Name <span className="text-red-500">*</span></span>
                                  <ValidationErrorTooltip error={validationError} fieldId="field-promo-name" />
                                </label>
                                <input
                                  id="field-promo-name"
                                  type="text"
                                  value={name}
                                  onChange={(e) => {
                                    setName(e.target.value);
                                    if (validationError?.field === 'field-promo-name') setValidationError(null);
                                  }}
                                  placeholder="e.g., Summer Sale 20% Off"
                                  className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm font-medium text-slate-900 dark:text-white transition-all outline-none ${
                                    validationError?.field === 'field-promo-name' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                  }`}
                                />
                              </div>

                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Promotion Type</label>
                                <CustomSelect
                                  value={type}
                                  onChange={(val) => setType(val)}
                                  searchable={false}
                                  options={[
                                    { value: 'PERCENTAGE', label: 'Percentage Discount (%)' },
                                    { value: 'FIXED', label: 'Fixed Amount Discount (Rs)' },
                                    { value: 'SPECIAL_PRICE', label: 'Special Price (Rs)' },
                                    { value: 'QUANTITY', label: 'Bundle Pricing (Buy X for Rs Y)' },
                                    { value: 'BUY_X_GET_Y', label: 'Buy X Get Y Free' }
                                  ]}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Section 2: Offer Mechanics */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                      <button 
                        type="button" 
                        onClick={() => toggleSection("mechanics")}
                        className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.mechanics ? "rounded-t-xl" : "rounded-xl"}`}
                      >
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                          <Percent className="w-4 h-4 text-blue-600" />
                          Offer Mechanics
                        </span>
                        {openSections.mechanics ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                      </button>
                      <AnimatePresence>
                        {openSections.mechanics && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          >
                            <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                              {['PERCENTAGE', 'FIXED', 'SPECIAL_PRICE'].includes(type) && (
                                <div className="space-y-1.5 relative">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>{type === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Amount (Rs)'} <span className="text-red-500">*</span></span>
                                    <ValidationErrorTooltip error={validationError} fieldId="field-promo-offer-value" />
                                  </label>
                                  <input
                                    id="field-promo-offer-value"
                                    type="number"
                                    step="0.01"
                                    value={offerValue}
                                    onChange={(e) => {
                                      setOfferValue(e.target.value);
                                      if (validationError?.field === 'field-promo-offer-value') setValidationError(null);
                                    }}
                                    placeholder="0.00"
                                    className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all outline-none ${
                                      validationError?.field === 'field-promo-offer-value' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                  />
                                </div>
                              )}

                              {type === 'QUANTITY' && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5 relative">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                      <span>Buy Qty <span className="text-red-500">*</span></span>
                                      <ValidationErrorTooltip error={validationError} fieldId="field-promo-qty-req" />
                                    </label>
                                    <input
                                      id="field-promo-qty-req"
                                      type="number"
                                      value={quantityRequirement}
                                      onChange={(e) => {
                                        setQuantityRequirement(e.target.value);
                                        if (validationError?.field === 'field-promo-qty-req') setValidationError(null);
                                      }}
                                      placeholder="e.g. 3"
                                      className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all outline-none ${
                                        validationError?.field === 'field-promo-qty-req' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                      }`}
                                    />
                                  </div>
                                  <div className="space-y-1.5 relative">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                      <span>For Price (Rs) <span className="text-red-500">*</span></span>
                                      <ValidationErrorTooltip error={validationError} fieldId="field-promo-offer-value" />
                                    </label>
                                    <input
                                      id="field-promo-offer-value"
                                      type="number"
                                      step="0.01"
                                      value={offerValue}
                                      onChange={(e) => {
                                        setOfferValue(e.target.value);
                                        if (validationError?.field === 'field-promo-offer-value') setValidationError(null);
                                      }}
                                      placeholder="0.00"
                                      className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all outline-none ${
                                        validationError?.field === 'field-promo-offer-value' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                      }`}
                                    />
                                  </div>
                                </div>
                              )}

                              {type === 'BUY_X_GET_Y' && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5 relative">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                      <span>Buy Qty <span className="text-red-500">*</span></span>
                                      <ValidationErrorTooltip error={validationError} fieldId="field-promo-qty-req" />
                                    </label>
                                    <input
                                      id="field-promo-qty-req"
                                      type="number"
                                      value={quantityRequirement}
                                      onChange={(e) => {
                                        setQuantityRequirement(e.target.value);
                                        if (validationError?.field === 'field-promo-qty-req') setValidationError(null);
                                      }}
                                      placeholder="e.g. 2"
                                      className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all outline-none ${
                                        validationError?.field === 'field-promo-qty-req' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                      }`}
                                    />
                                  </div>
                                  <div className="space-y-1.5 relative">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                      <span>Get Free Qty <span className="text-red-500">*</span></span>
                                      <ValidationErrorTooltip error={validationError} fieldId="field-promo-reward-qty" />
                                    </label>
                                    <input
                                      id="field-promo-reward-qty"
                                      type="number"
                                      value={rewardQuantity}
                                      onChange={(e) => {
                                        setRewardQuantity(e.target.value);
                                        if (validationError?.field === 'field-promo-reward-qty') setValidationError(null);
                                      }}
                                      placeholder="e.g. 1"
                                      className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all outline-none ${
                                        validationError?.field === 'field-promo-reward-qty' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                      }`}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Section 3: Validity Schedule */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                      <button 
                        type="button" 
                        onClick={() => toggleSection("schedule")}
                        className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.schedule ? "rounded-t-xl" : "rounded-xl"}`}
                      >
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          Validity Schedule
                        </span>
                        {openSections.schedule ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                      </button>
                      <AnimatePresence>
                        {openSections.schedule && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          >
                            <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 relative">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Start Date <span className="text-red-500">*</span></span>
                                    <ValidationErrorTooltip error={validationError} fieldId="field-promo-start-date" />
                                  </label>
                                  <input
                                    id="field-promo-start-date"
                                    type="date"
                                    min={todayStr}
                                    value={startDate}
                                    onChange={(e) => {
                                      setStartDate(e.target.value);
                                      if (validationError?.field === 'field-promo-start-date') setValidationError(null);
                                    }}
                                    className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm font-medium text-slate-900 dark:text-white transition-all outline-none ${
                                      validationError?.field === 'field-promo-start-date' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                  />
                                </div>
                                <div className="space-y-1.5 relative">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>End Date <span className="text-red-500">*</span></span>
                                    <ValidationErrorTooltip error={validationError} fieldId="field-promo-end-date" />
                                  </label>
                                  <input
                                    id="field-promo-end-date"
                                    type="date"
                                    min={startDate}
                                    value={endDate}
                                    onChange={(e) => {
                                      setEndDate(e.target.value);
                                      if (validationError?.field === 'field-promo-end-date') setValidationError(null);
                                    }}
                                    className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm font-medium text-slate-900 dark:text-white transition-all outline-none ${
                                      validationError?.field === 'field-promo-end-date' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Section 4: Target Products & Scope */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                      <button 
                        type="button" 
                        onClick={() => toggleSection("scope")}
                        className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.scope ? "rounded-t-xl" : "rounded-xl"}`}
                      >
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                          <Layers className="w-4 h-4 text-blue-600" />
                          Target Products & Scope
                        </span>
                        {openSections.scope ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                      </button>
                      <AnimatePresence>
                        {openSections.scope && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          >
                            <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                              <div className="space-y-1.5 relative">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                  <span>Applies To</span>
                                  <ValidationErrorTooltip error={validationError} fieldId="field-promo-scope" />
                                </label>
                                <div id="field-promo-scope">
                                  <CustomSelect
                                    value={appliesToAll ? 'ALL' : ''}
                                    label="Add Selection Condition"
                                    searchable={false}
                                    onChange={(val) => {
                                      if (validationError?.field === 'field-promo-scope') setValidationError(null);
                                      if (val === 'ALL') {
                                        setAppliesToAll(true);
                                        setSelectedProducts([]);
                                        setSelectedCategories([]);
                                        setSelectedBrands([]);
                                        setSelectionPanelType(null);
                                      } else {
                                        setAppliesToAll(false);
                                        setSelectionPanelType(val as 'PRODUCTS'|'CATEGORIES'|'BRANDS');
                                      }
                                    }}
                                    options={[
                                      { value: 'ALL', label: 'All Products (Clear selections)' },
                                      { value: 'PRODUCTS', label: 'Specific Products' },
                                      { value: 'CATEGORIES', label: 'Specific Categories' },
                                      { value: 'BRANDS', label: 'Specific Brands' }
                                    ]}
                                  />
                                </div>
                              </div>

                              {!appliesToAll && (
                                <div className="space-y-2">
                                  {selectedProducts.length > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl">
                                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {selectedProducts.length} products selected
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => setSelectionPanelType('PRODUCTS')}
                                        className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                      >
                                        Manage Selection
                                      </button>
                                    </div>
                                  )}
                                  
                                  {selectedCategories.length > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl">
                                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        {getCategorySelectionText()}
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => setSelectionPanelType('CATEGORIES')}
                                        className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                      >
                                        Manage Selection
                                      </button>
                                    </div>
                                  )}
                                  
                                  {selectedBrands.length > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl">
                                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                        {selectedBrands.length} brands selected
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => setSelectionPanelType('BRANDS')}
                                        className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                      >
                                        Manage Selection
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Section 5: Status & Settings */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                      <button 
                        type="button" 
                        onClick={() => toggleSection("status")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.status ? "rounded-t-xl" : "rounded-xl"}`}
                      >
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                          <Settings className="w-4 h-4 text-blue-600" />
                          Status & Settings
                        </span>
                        {openSections.status ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                      </button>
                      <AnimatePresence>
                        {openSections.status && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          >
                            <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                              <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div>
                                  <span className="block text-sm font-bold text-slate-900 dark:text-white select-none">
                                    Promotion Active
                                  </span>
                                  <span className="block text-xs font-medium text-slate-500 mt-0.5">
                                    Enable or disable this promotion in POS and online
                                  </span>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={active}
                                  onChange={(e) => setActive(e.target.checked)}
                                />
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

          </form>
        </MainRightPanel>

              {/* SLIDE-OUT SELECTION PANEL */}
              <SecondaryRightPanel
                isOpen={!!selectionPanelType}
                onClose={() => setSelectionPanelType(null)}
                title={selectionPanelType ? `Select ${selectionPanelType.charAt(0) + selectionPanelType.slice(1).toLowerCase()}` : 'Select Items'}
                icon={ListFilter}
                hideFooter={true}
                className="hidden lg:flex"
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={`Search ${selectionPanelType?.toLowerCase() || 'items'}...`}
                        value={selectionSearch}
                        onChange={(e) => setSelectionSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {selectionPanelType === 'CATEGORIES' ? (
                      categories.filter(c => c.name.toLowerCase().includes(selectionSearch.toLowerCase())).map(cat => {
                        const isSelected = selectedCategories.includes(cat.id);
                        const isExpanded = expandedCategories.includes(cat.id);
                        const hasChildren = cat.children && cat.children.length > 0;
                        
                        return (
                        <div key={cat.id} className="space-y-1">
                          <div className={`w-full flex items-center justify-between p-2 rounded-xl border transition-colors ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30' 
                              : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/50'
                          }`}>
                            <button
                              type="button"
                              onClick={() => toggleAppliesToId('CATEGORIES', cat.id, true, cat.children?.map((sub:any) => sub.id) || [])}
                              className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                {cat.image ? (
                                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Folder className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 truncate pr-2">
                                <span className={`block font-bold text-sm truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {cat.name}
                                </span>
                              </div>
                              {isSelected && <Check className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400 mr-2" />}
                            </button>
                            
                            {hasChildren && (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCategories(prev => 
                                    prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                                  );
                                }}
                                className="p-2 ml-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
                              >
                                <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                            )}
                          </div>
                          
                          {isExpanded && hasChildren && (
                            <div className="pl-6 space-y-1 mt-1 relative before:absolute before:left-[19px] before:top-0 before:bottom-3 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                              {cat.children.map((sub: any) => {
                                if (selectionSearch && !sub.name.toLowerCase().includes(selectionSearch.toLowerCase()) && !cat.name.toLowerCase().includes(selectionSearch.toLowerCase())) return null;
                                const isSubSelected = selectedCategories.includes(sub.id);
                                return (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => toggleAppliesToId('CATEGORIES', sub.id, false)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors relative before:absolute before:left-[-9px] before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-px before:bg-slate-200 dark:before:bg-slate-700 ${
                                      isSubSelected 
                                        ? 'bg-indigo-50/50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' 
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded-md bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                      <Folder className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="font-medium text-sm truncate flex-1">{sub.name}</span>
                                    {isSubSelected && <Check className="w-4 h-4 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )})
                    ) : (
                      getAppliesToOptions().map(opt => {
                        const isSelected = selectionPanelType === 'PRODUCTS' ? selectedProducts.includes(opt.id) : selectedBrands.includes(opt.id);
                        
                        // Extract image based on type
                        let imgSrc = null;
                        let DefaultIcon = Tag;
                        
                        if (selectionPanelType === 'PRODUCTS') {
                          DefaultIcon = Package;
                          if (opt.images && opt.images.length > 0) {
                            imgSrc = typeof opt.images[0] === 'string' ? opt.images[0] : opt.images[0].url;
                          }
                        } else if (selectionPanelType === 'BRANDS') {
                          DefaultIcon = Tag;
                          if (opt.image) imgSrc = opt.image;
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => selectionPanelType && toggleAppliesToId(selectionPanelType, opt.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl border transition-colors ${
                              isSelected 
                                ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30' 
                                : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 text-left overflow-hidden flex-1">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                {imgSrc ? (
                                  <img src={imgSrc} alt={opt.name} className="w-full h-full object-cover" />
                                ) : (
                                  <DefaultIcon className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 truncate pr-2">
                                <span className={`block font-bold text-sm truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {opt.name}
                                </span>
                                {selectionPanelType === 'PRODUCTS' && opt.barcode && (
                                  <span className="block text-xs font-medium text-slate-500 truncate mt-0.5">
                                    {opt.barcode}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && <Check className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400 mr-2" />}
                          </button>
                        );
                      })
                    )}
                    
                    {getAppliesToOptions().length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Search className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No results found</p>
                      </div>
                    )}
                  </div>
                </div>
              </SecondaryRightPanel>

        {/* ──────────────── FILTER RIGHT PANEL ──────────────── */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title="Filter Promotions"
          onClear={() => { setStatusFilter('all'); setTypeFilter('all'); setSearchQuery(''); setIsFilterOpen(false); }}
          onApply={() => setIsFilterOpen(false)}
        >
          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">Promotion Status</label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'disabled', label: 'Disabled' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${statusFilter === opt.value ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' : 'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {opt.label}
                    {statusFilter === opt.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Type Filter */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">Promotion Type</label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Types' },
                  { value: 'PERCENTAGE', label: 'Percentage (%)' },
                  { value: 'FIXED', label: 'Fixed Amount (Rs)' },
                  { value: 'SPECIAL_PRICE', label: 'Special Price' },
                  { value: 'QUANTITY', label: 'Bundle Pricing' },
                  { value: 'BUY_X_GET_Y', label: 'Buy X Get Y' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTypeFilter(opt.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${typeFilter === opt.value ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30' : 'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {opt.label}
                    {typeFilter === opt.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FilterPanel>

      <ConfirmDialog 
        isOpen={deleteConfirmDialog.isOpen}
        title="Delete Promotion"
        message="Are you sure you want to delete this promotion? This action cannot be undone."
        confirmText="Delete Promotion"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmDialog({ isOpen: false, id: null })}
        isLoading={isDeleting}
      />

    </div>
  );
}

