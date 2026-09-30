'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Search, Trash2, Tag, Edit2, X, Image as ImageIcon, List, LayoutGrid, Package, Maximize, Minimize, ChevronDown, ChevronUp, Info, BarChart3, TrendingUp, Layers, Calendar, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { MainRightPanel } from '@/components/ui/right-panel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { useAuthStore } from '@/lib/auth-store';
import { saveBrandLocally, markBrandSynced, getLocalBrands, updateBrandLocally, deleteBrandLocally } from '@/lib/local-services';
import { isTauriEnv } from '@/lib/local-db';

// --- Brand Row Component with Inline Expandable Drawer ---
const BrandRow = ({ brand, onEdit, onDelete, isExpanded, onToggleExpand }: any) => {
  const productCount = brand._count?.products || 0;
  const isActive = productCount > 0;

  return (
    <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/60">
      <div 
        onClick={onToggleExpand}
        className={`grid grid-cols-[minmax(240px,2fr)_minmax(140px,1.2fr)_minmax(120px,1fr)_minmax(130px,1fr)_120px] gap-4 p-4 sm:px-5 items-center transition-colors cursor-pointer group ${
          isExpanded 
            ? 'bg-blue-50/60 dark:bg-blue-900/15' 
            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
        }`}
      >
        {/* Col 1: Brand & Description */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            {brand.image ? (
              <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
            ) : (
              <Tag className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{brand.name}</h3>
            {brand.description && <p className="text-xs text-slate-500 line-clamp-1">{brand.description}</p>}
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {brand.updatedAt && brand.updatedAt !== brand.createdAt 
                ? `Updated ${new Date(brand.updatedAt).toLocaleDateString()}` 
                : brand.createdAt ? `Added ${new Date(brand.createdAt).toLocaleDateString()}` : ''}
            </p>
          </div>
        </div>
        
        {/* Col 2: Catalog Products */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Package className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{productCount} Items</span>
          </div>
        </div>

        {/* Col 3: Status */}
        <div>
          {isActive ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              No Items
            </span>
          )}
        </div>

        {/* Col 4: Created Date */}
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium truncate">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>

        {/* Col 5: Actions */}
        <div className="flex justify-end items-center gap-1">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(brand);
            }} 
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors cursor-pointer"
            title="Edit Brand"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(brand.id);
            }} 
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors cursor-pointer"
            title="Delete Brand"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand Details'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Inline Detail Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/30 p-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Brand Overview: {brand.name}
                  </h4>
                  <p className="text-xs text-slate-500">Catalog details, brand inventory performance, and administrative controls</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(brand)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(brand.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* 4 Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Catalog Items</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    {productCount} Products
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Associated with active SKUs</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Brand Identification</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white font-mono truncate">
                    ID: #{brand.id}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {brand.image ? 'Custom brand logo uploaded' : 'Default icon assigned'}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Record Created</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {brand.createdAt ? new Date(brand.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Modified</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {brand.updatedAt ? new Date(brand.updatedAt).toLocaleDateString() : 'Unchanged'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {brand.updatedAt ? new Date(brand.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Same as created'}
                  </p>
                </div>
              </div>

              {brand.description && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Brand Description</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{brand.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface BrandsOverviewProps {
  brands: any[];
  setActiveTab: (tab: 'overview' | 'table') => void;
  openEditPanel: (brand: any) => void;
}

function BrandsOverviewDashboard({
  brands,
  setActiveTab,
  openEditPanel,
}: BrandsOverviewProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalBrands = brands.length;
  const totalProducts = brands.reduce((sum, b) => sum + (b._count?.products || 0), 0);
  const activeBrands = brands.filter(b => (b._count?.products || 0) > 0).length;
  const avgProducts = totalBrands > 0 ? Math.round(totalProducts / totalBrands) : 0;

  // Chart data: Top brands by products
  const chartData = useMemo(() => {
    return [...brands]
      .map(b => ({
        name: b.name,
        products: b._count?.products || 0,
      }))
      .sort((a, b) => b.products - a.products)
      .slice(0, 8);
  }, [brands]);

  // Card 1: Top Brands by Product Count
  const topBrands = useMemo(() => {
    return [...brands]
      .sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0));
  }, [brands]);

  // Card 2: Highest Catalog Share (%)
  const shareBrands = useMemo(() => {
    return [...brands]
      .filter(b => (b._count?.products || 0) > 0)
      .sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0));
  }, [brands]);

  // Card 3: Inactive / 0 Products Brands
  const emptyBrands = useMemo(() => {
    return [...brands]
      .filter(b => (b._count?.products || 0) === 0);
  }, [brands]);

  // Card 4: Recently Created Brands
  const recentBrands = useMemo(() => {
    return [...brands]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [brands]);

  return (
    <div className="space-y-6">
      {/* ──────────────── 1. KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Brands" 
          value={totalBrands} 
          icon={Tag} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active in Catalog" 
          value={activeBrands} 
          icon={Package} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Total Brand Items" 
          value={totalProducts} 
          icon={Layers} 
          iconColorClass="text-indigo-600" 
          iconBgClass="bg-indigo-50 dark:bg-indigo-500/10" 
        />
        <KpiCard 
          title="Avg Items / Brand" 
          value={avgProducts} 
          icon={TrendingUp} 
          iconColorClass="text-purple-600" 
          iconBgClass="bg-purple-50 dark:bg-purple-500/10" 
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
                Inventory Distribution by Brand
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Number of catalogued stock items manufactured per brand
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
                  No brand product data available to plot.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: any) => [`${v} Items`, 'Products']}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="products" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: any) => [`${v} Items`, 'Products']}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="products" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : null}
          </div>
        </div>

        {/* Card 1: Top Brands by Product Count (1 col, h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Top Brands by Items
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Volume
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topBrands.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No brands available.
              </div>
            ) : (
              topBrands.slice(0, 5).map((b, i) => {
                const rankColors = [
                  'bg-emerald-600 text-white',
                  'bg-emerald-500 text-white',
                  'bg-teal-500 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div
                    key={b.id || i}
                    onClick={() => openEditPanel(b)}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view/edit brand"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                          {b.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {b.description || 'Manufacturer'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      {b._count?.products || 0} Items
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Brands Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 RANKINGS / INSIGHTS CARDS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 2: Highest Catalog Share */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Highest Catalog Share
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Share
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {shareBrands.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No items assigned to brands.
              </div>
            ) : (
              shareBrands.slice(0, 5).map((b, i) => (
                <div
                  key={b.id || i}
                  onClick={() => openEditPanel(b)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view/edit brand"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {b._count?.products || 0} catalogued items
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                    {Math.round(((b._count?.products || 0) / Math.max(1, totalProducts)) * 100)}%
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
              View Share in Brands Table →
            </button>
          </div>
        </div>

        {/* Card 3: Unassigned / Inactive Brands */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Unassigned Brands
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              Audit
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {emptyBrands.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                All registered brands have items assigned!
              </div>
            ) : (
              emptyBrands.slice(0, 5).map((b, i) => (
                <div
                  key={b.id || i}
                  onClick={() => openEditPanel(b)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view/edit brand"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        0 Products linked
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    Unlinked
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
              Assign Products in Table →
            </button>
          </div>
        </div>

        {/* Card 4: Recently Added */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Recently Created Brands
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Recent
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {recentBrands.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No recent brands.
              </div>
            ) : (
              recentBrands.slice(0, 5).map((b, i) => (
                <div
                  key={b.id || i}
                  onClick={() => openEditPanel(b)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view/edit brand"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Active'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 shrink-0">
                    {b._count?.products || 0} Items
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
              View Brands in Table →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandsPageContent() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedBrandId, setExpandedBrandId] = useState<number | string | null>(null);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

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

    if (sectionKey && !openSections[sectionKey as keyof typeof openSections]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
      setTimeout(focus, 300);
    } else {
      focus();
    }

    setTimeout(() => setValidationError(null), 3500);
  };

  const [formData, setFormData] = useState({ 
    name: '', 
    description: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState({
    basic: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => {
      const next = { basic: false };
      next[section] = true;
      if (prev[section]) {
        next[section] = false;
      }
      return next;
    });
  };

  useEffect(() => {
    fetchData();
    const handleReset = () => fetchData();
    window.addEventListener('cmart_database_reset', handleReset);
    return () => window.removeEventListener('cmart_database_reset', handleReset);
  }, []);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsPanelOpen(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = useAuthStore.getState().user;
      const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';
      
      let data = [];

      try {
        if (isLocalMode) {
          data = await getLocalBrands(user?.tenantId || null);
        } else {
          const res = await storeOwnerAPI.getBrands();
          if (res && (res as any).fallbackToLocal) {
            data = await getLocalBrands(user?.tenantId || null);
          } else {
            data = res.data || [];
          }
        }
      } catch(e) {
         data = await getLocalBrands(user?.tenantId || null);
      }
      
      setBrands(data);
    } catch (err) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerValidation('basic', 'field-brand-name', 'Brand name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      payload.append('name', formData.name);
      if (formData.description) payload.append('description', formData.description);
      
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingBrand) {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

        const localData = {
          name: formData.name,
          description: formData.description,
          image: imagePreview || editingBrand.image
        };

        await updateBrandLocally(editingBrand.id, localData, tenantId);

        if (!isLocalMode) {
          try {
            await storeOwnerAPI.updateBrand(editingBrand.id, payload);
            await markBrandSynced(editingBrand.id);
            toast.success('Brand updated and synced successfully!');
          } catch(syncErr) {
            console.error('Sync failed:', syncErr);
            toast.warning('Brand updated locally but failed to sync to server.');
          }
        } else {
          toast.success('Brand updated successfully in local database!');
        }
      } else {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

        const localData = {
          name: formData.name,
          description: formData.description,
          image: imagePreview
        };

        const localRecord = await saveBrandLocally(localData, tenantId);

        if (!isLocalMode) {
          try {
            const res = await storeOwnerAPI.createBrand(payload);
            await markBrandSynced(localRecord.id);
            toast.success('Brand added and synced successfully!');
          } catch(syncErr) {
            console.error('Sync failed:', syncErr);
            toast.warning('Brand saved locally but failed to sync to server.');
          }
        } else {
           toast.success('Brand added successfully to local database!');
        }
      }

      setIsPanelOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!confirmDialog.id) return;
    try {
      setIsDeleting(true);
      const user = useAuthStore.getState().user;
      const tenantId = user?.tenantId || null;
      const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

      // Delete locally first
      await deleteBrandLocally(confirmDialog.id, tenantId);

      if (!isLocalMode) {
        try {
          await storeOwnerAPI.deleteBrand(confirmDialog.id);
          toast.success('Brand deleted and synced');
        } catch (err: any) {
          toast.success('Brand deleted locally (was not synced to server)');
        }
      } else {
        toast.success('Brand deleted from local database');
      }

      fetchData();
      setConfirmDialog({ isOpen: false, id: null });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete brand locally');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddPanel = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const openEditPanel = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
    });
    if (brand.image) {
      setImagePreview(brand.image);
    } else {
      setImagePreview(null);
    }
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '' });
    setImageFile(null);
    setImagePreview(null);
  };

  const filterBrands = (b: any[], searchTerm: string): any[] => {
    if (!searchTerm) return b;
    return b.filter(brand => brand.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filteredBrands = filterBrands(brands, search);

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Tag className="w-7 h-7 sm:w-8 h-8 text-blue-600" />
              Brands
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-xs sm:text-sm font-medium">Manage product brands and manufacturers.</p>
          </div>
          
          <button 
            type="button"
            onClick={openAddPanel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Brand
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Brands Overview | Brands Table) */}
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
            Brands Overview
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
            Brands Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (activeTab === 'overview' && e.target.value.trim() !== '') {
                  setActiveTab('table');
                }
              }}
              className="w-full bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* View Mode Toggle: List */}
          <button 
            type="button"
            onClick={() => {
              setViewMode('list');
              if (activeTab === 'overview') setActiveTab('table');
            }}
            title="List View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <List className="w-4 h-4" />
          </button>

          {/* View Mode Toggle: Grid */}
          <button 
            type="button"
            onClick={() => {
              setViewMode('grid');
              if (activeTab === 'overview') setActiveTab('table');
            }}
            title="Grid View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Fullscreen Button */}
          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="flex items-center justify-center w-10 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <BrandsOverviewDashboard
          brands={brands}
          setActiveTab={setActiveTab}
          openEditPanel={openEditPanel}
        />
      ) : (
        /* ──────────────── DATA TABLE ──────────────── */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Loading brands...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <TableEmptyState
            icon={Tag}
            title="No brands found"
            description="You haven't created any brands yet, or none match your search. Click below to add your first brand."
            actionLabel="Create First Brand"
            onAction={openAddPanel}
          />
        ) : viewMode === 'list' ? (
          <>
            <div className="grid grid-cols-[minmax(240px,2fr)_minmax(140px,1.2fr)_minmax(120px,1fr)_minmax(130px,1fr)_120px] gap-4 h-14 px-5 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <div>Brand & Description</div>
              <div>Catalog Inventory</div>
              <div>Status</div>
              <div>Created Date</div>
              <div className="text-right pr-2">Actions</div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {filteredBrands.map((b) => (
                <BrandRow 
                  key={b.id} 
                  brand={b} 
                  onEdit={openEditPanel} 
                  onDelete={handleDelete}
                  isExpanded={expandedBrandId === b.id}
                  onToggleExpand={() => setExpandedBrandId(prev => prev === b.id ? null : b.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/30 dark:bg-slate-900/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 xl:gap-6">
              {filteredBrands.map(b => (
                  <div key={b.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                         {b.image ? <img src={b.image} alt={b.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <Tag className="w-12 h-12 opacity-50" />}
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button onClick={() => openEditPanel(b)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300">
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(b.id)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                              <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="absolute top-2 right-2">
                           <span className="px-2 py-1 bg-slate-900/50 backdrop-blur-md text-white rounded-lg text-[9px] font-bold">
                             {b.productsCount || 0} items
                           </span>
                         </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1 line-clamp-1">{b.name}</h3>
                        {b.description && <p className="text-[10px] font-medium text-slate-500 line-clamp-1 mb-2">{b.description}</p>}
                        
                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <p className="text-[9px] font-bold text-slate-400">Created: {new Date(b.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── SLIDE OUT PANEL: BRAND ──────────────── */}
      <MainRightPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onDiscard={handleClosePanel}
        title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
        subtitle={editingBrand ? 'Modify manufacturer and brand details' : 'Create and manage product brands and makers'}
        icon={Tag}
        formId="brandForm"
        isSubmitting={isSubmitting}
        saveText={editingBrand ? 'Save Changes' : 'Save Brand'}
      >
        <form id="brandForm" onSubmit={handleSaveBrand} className="font-sans space-y-4">
          
          {/* 1. Basic Information */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button 
              type="button" 
              onClick={() => toggleSection("basic")}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.basic ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-blue-600" />
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
                        Brand Logo <span className="text-xs font-medium text-slate-400">(Optional)</span>
                      </label>
                      <div className="w-full relative">
                        {imagePreview ? (
                          <div className="relative group w-full h-36 rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-3">
                            <img 
                              src={imagePreview} 
                              alt="Logo Preview" 
                              className="max-w-full max-h-full object-contain cursor-pointer hover:scale-105 transition-transform" 
                              onClick={() => setZoomedImage(imagePreview)}
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-[1px]">
                              <button 
                                type="button" 
                                onClick={() => setZoomedImage(imagePreview)} 
                                className="p-2 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all shadow-md cursor-pointer hover:scale-110"
                                title="Zoom logo"
                              >
                                <Maximize className="w-4 h-4" />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => { setImageFile(null); setImagePreview(null); }} 
                                className="p-2 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-md cursor-pointer hover:scale-110"
                                title="Remove logo"
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
                                  setImageFile(file);
                                  const reader = new FileReader();
                                  reader.onloadend = () => setImagePreview(reader.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                              <Plus className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                Click or drag logo to upload
                              </span>
                              <span className="text-[11px] font-medium text-slate-400">
                                Supports PNG, JPG, SVG
                              </span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 relative">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Brand Name <span className="text-red-500">*</span></span>
                        <ValidationErrorTooltip error={validationError} fieldId="field-brand-name" />
                      </label>
                      <input 
                        id="field-brand-name"
                        autoFocus
                        value={formData.name} 
                        onChange={e => {
                          setFormData({...formData, name: e.target.value});
                          if (validationError?.field === 'field-brand-name') setValidationError(null);
                        }} 
                        className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none ${
                          validationError?.field === 'field-brand-name' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                        placeholder="e.g. Nike" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                      <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none resize-none"
                        placeholder="Short description..." 
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </MainRightPanel>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone."
        confirmText="Delete Brand"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
        isLoading={isDeleting}
      />
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
          onClick={() => setZoomedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center bg-slate-900 p-2 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomedImage(null)}
              className="absolute -top-4 -right-4 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomedImage} alt="Zoomed Brand" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <BrandsPageContent />
    </Suspense>
  );
}
