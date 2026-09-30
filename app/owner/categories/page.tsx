'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Trash2, FolderTree, Edit2, X, Image as ImageIcon, ChevronRight, ChevronDown, ChevronUp, List, LayoutGrid, Package, Maximize, Minimize, Layers, Info, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomSelect } from '@/components/ui/custom-select';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { MainRightPanel } from '@/components/ui/right-panel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { useAuthStore } from '@/lib/auth-store';
import { saveCategoryLocally, markCategorySynced, getLocalCategories, deleteCategoryLocally } from '@/lib/local-services';
import { isTauriEnv } from '@/lib/local-db';

// --- Recursive Category Row Component ---
const CategoryRow = ({ category, level = 0, onEdit, onDelete, defaultExpanded = false }: any) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = category.children && category.children.length > 0;

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <>
      <div 
        onClick={() => {
          if (hasChildren) setIsExpanded(!isExpanded);
        }}
        className={`grid grid-cols-[minmax(240px,2fr)_minmax(140px,1.2fr)_minmax(120px,1fr)_minmax(120px,1fr)_120px] gap-4 p-4 sm:px-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer`}
        style={{ paddingLeft: `${1.25 + level * 1.5}rem` }}
      >
        {/* Col 1: Category Name & Indent */}
        <div className="flex items-center gap-3 min-w-0">
          {hasChildren ? (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }} 
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer shrink-0 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
          ) : (
            <div className="w-6 shrink-0" />
          )}
          
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <FolderTree className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{category.name}</h3>
            {category.description && <p className="text-xs text-slate-500 line-clamp-1">{category.description}</p>}
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {category.updatedAt && category.updatedAt !== category.createdAt 
                ? `Updated ${new Date(category.updatedAt).toLocaleDateString()}` 
                : category.createdAt ? `Added ${new Date(category.createdAt).toLocaleDateString()}` : ''}
            </p>
          </div>
        </div>
        
        {/* Col 2: Slug */}
        <div className="min-w-0">
          <span className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50 truncate block w-fit max-w-full">
            /{category.slug}
          </span>
        </div>

        {/* Col 3: Items Count */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{category._count?.products || 0} Products</span>
        </div>

        {/* Col 4: Hierarchy */}
        <div>
          {hasChildren ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 w-fit">
              <Layers className="w-3 h-3 shrink-0" />
              {category.children.length} Subcats
            </span>
          ) : level > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 w-fit">
              Subcategory
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 w-fit">
              Root
            </span>
          )}
        </div>

        {/* Col 5: Actions */}
        <div className="flex justify-end items-center gap-1">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }} 
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors cursor-pointer"
            title="Edit Category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category.id);
            }} 
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors cursor-pointer"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {hasChildren ? (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
          ) : (
            <div className="w-8 shrink-0" />
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col">
          {category.children.map((child: any) => (
            <CategoryRow key={child.id} category={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} defaultExpanded={defaultExpanded} />
          ))}
        </div>
      )}
    </>
  );
};

interface CategoriesOverviewProps {
  categories: any[];
  flatCategories: any[];
  setActiveTab: (tab: 'overview' | 'table') => void;
  openEditPanel: (cat: any) => void;
}

function CategoriesOverviewDashboard({
  categories,
  flatCategories,
  setActiveTab,
  openEditPanel,
}: CategoriesOverviewProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartMetric, setChartMetric] = useState<'products' | 'subcats'>('products');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, c) => sum + (c.children?.length || 0), 0);
  const totalProducts = flatCategories.reduce((sum, c) => sum + (c._count?.products || 0), 0);
  const activeCategories = flatCategories.filter(c => c.active !== false).length;

  // Chart data: Top categories by products or subcategories
  const chartData = useMemo(() => {
    return categories
      .map(c => ({
        name: c.name,
        products: c._count?.products || 0,
        subcats: c.children?.length || 0,
      }))
      .sort((a, b) => b[chartMetric] - a[chartMetric])
      .slice(0, 8);
  }, [categories, chartMetric]);

  // Card 1: Top Categories by Products
  const topProductCats = useMemo(() => {
    return [...flatCategories]
      .sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0));
  }, [flatCategories]);

  // Card 2: Categories with Subcategories (Hierarchy depth)
  const topHierarchyCats = useMemo(() => {
    return [...categories]
      .filter(c => (c.children?.length || 0) > 0)
      .sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0));
  }, [categories]);

  // Card 3: Empty / Low Inventory Categories
  const emptyCats = useMemo(() => {
    return [...flatCategories]
      .filter(c => (c._count?.products || 0) === 0);
  }, [flatCategories]);

  // Card 4: Recently Created Categories
  const recentCats = useMemo(() => {
    return [...flatCategories]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [flatCategories]);

  return (
    <div className="space-y-6">
      {/* ──────────────── 1. KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Parent Categories" 
          value={totalCategories} 
          icon={FolderTree} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Subcategories" 
          value={totalSubcategories} 
          icon={Layers} 
          iconColorClass="text-indigo-600" 
          iconBgClass="bg-indigo-50 dark:bg-indigo-500/10" 
        />
        <KpiCard 
          title="Total Catalogued Items" 
          value={totalProducts} 
          icon={Package} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Active Categories" 
          value={activeCategories} 
          icon={FolderTree} 
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
                Category Catalog & Subcategory Volume
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribution of inventory items and sub-levels per category
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMetric('products')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'products' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Items
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('subcats')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'subcats' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Subcategories
                </button>
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
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            {mounted ? (
              chartData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No category data available to plot.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: any) => [
                          chartMetric === 'products' ? `${v} Items` : `${v} Subcategories`,
                          chartMetric === 'products' ? 'Items' : 'Subcategories'
                        ]}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey={chartMetric} fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: any) => [
                          chartMetric === 'products' ? `${v} Items` : `${v} Subcategories`,
                          chartMetric === 'products' ? 'Items' : 'Subcategories'
                        ]}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey={chartMetric} stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : null}
          </div>
        </div>

        {/* Card 1: Top Categories by Products (1 col, h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Top Categories by Items
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Inventory
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topProductCats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No categories available.
              </div>
            ) : (
              topProductCats.slice(0, 5).map((cat, i) => {
                const rankColors = [
                  'bg-emerald-600 text-white',
                  'bg-emerald-500 text-white',
                  'bg-teal-500 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div
                    key={cat.id || i}
                    onClick={() => openEditPanel(cat)}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view/edit category"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                          {cat.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          /{cat.slug || cat.name.toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      {cat._count?.products || 0} Items
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
              View All in Categories Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 RANKINGS / INSIGHTS CARDS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 2: Categories with Subcategories */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Subcategory Hierarchy
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Structure
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topHierarchyCats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No subcategories created yet.
              </div>
            ) : (
              topHierarchyCats.slice(0, 5).map((cat, i) => (
                <div
                  key={cat.id || i}
                  onClick={() => openEditPanel(cat)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view/edit category"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {cat.children?.map((ch: any) => ch.name).slice(0, 2).join(', ')}{cat.children?.length > 2 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                    {cat.children?.length || 0} Subcats
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
              View Hierarchy in Table →
            </button>
          </div>
        </div>

        {/* Card 3: Empty / Zero Product Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Empty / Unassigned Categories
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              Audit
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {emptyCats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                All categories have items assigned!
              </div>
            ) : (
              emptyCats.slice(0, 5).map((cat, i) => (
                <div
                  key={cat.id || i}
                  onClick={() => openEditPanel(cat)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view/edit category"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        0 Products assigned
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    Empty
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
              <FolderTree className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Recently Created Categories
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Recent
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {recentCats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No recent categories.
              </div>
            ) : (
              recentCats.slice(0, 5).map((cat, i) => (
                <div
                  key={cat.id || i}
                  onClick={() => openEditPanel(cat)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view/edit category"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'Active'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 shrink-0">
                    {cat._count?.products || 0} Items
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
              View Categories in Table →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesPageContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  
  // Modal / Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // Form State
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    parentId: 'null', 
    sortOrder: '0',
    active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState({
    basic: true,
    hierarchy: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        basic: false,
        hierarchy: false,
        [section]: true
      };
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('action') === 'add' || searchParams.get('action') === 'add-sub') {
      setIsPanelOpen(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = useAuthStore.getState().user;
      const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';
      
      let treeData = [];
      let flatData = [];

      try {
        if (isLocalMode) {
          treeData = await getLocalCategories(user?.tenantId || null);
          flatData = await getLocalCategories(user?.tenantId || null); // Flat could just be a flat map, but local returns tree. We can flatten it.
          
          // Flatten tree
          const flatten = (nodes: any[]): any[] => {
            let res: any[] = [];
            nodes.forEach(n => {
              res.push(n);
              if (n.children) res = [...res, ...flatten(n.children)];
            });
            return res;
          };
          flatData = flatten(treeData);
        } else {
          const [treeRes, flatRes] = await Promise.all([
            storeOwnerAPI.getCategories(),
            storeOwnerAPI.getFlatCategories()
          ]);
          treeData = treeRes.data;
          flatData = flatRes.data;
        }
      } catch(e) {
         // Fallback to local
         treeData = await getLocalCategories(user?.tenantId || null);
         const flatten = (nodes: any[]): any[] => {
            let res: any[] = [];
            nodes.forEach(n => {
              res.push(n);
              if (n.children) res = [...res, ...flatten(n.children)];
            });
            return res;
          };
          flatData = flatten(treeData);
      }
      
      setCategories(treeData);
      setFlatCategories(flatData);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerValidation('basic', 'field-category-name', 'Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      payload.append('name', formData.name);
      if (formData.description) payload.append('description', formData.description);
      payload.append('parentId', formData.parentId);
      payload.append('sortOrder', formData.sortOrder);
      payload.append('active', formData.active.toString());
      
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingCategory) {
        await storeOwnerAPI.updateCategory(editingCategory.id, payload);
        toast.success('Category updated successfully!');
      } else {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

        const localData = {
          name: formData.name,
          description: formData.description,
          parentId: formData.parentId,
          image: imagePreview // Save base64 preview if available
        };

        const localRecord = await saveCategoryLocally(localData, tenantId);

        if (!isLocalMode) {
          try {
            const res = await storeOwnerAPI.createCategory(payload);
            await markCategorySynced(localRecord.id);
            toast.success('Category added and synced successfully!');
          } catch(syncErr) {
            console.error('Sync failed:', syncErr);
            toast.warning('Category saved locally but failed to sync to server.');
          }
        } else {
           toast.success('Category added successfully to local database!');
        }
      }

      setIsPanelOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
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

      // Always delete locally first
      await deleteCategoryLocally(confirmDialog.id, tenantId);

      if (!isLocalMode) {
        try {
          await storeOwnerAPI.deleteCategory(confirmDialog.id);
          toast.success('Category deleted and synced');
        } catch (syncErr: any) {
          console.error('Failed to sync deletion:', syncErr);
          toast.warning('Deleted locally but cloud sync failed (offline)');
        }
      } else {
        toast.success('Category deleted locally');
      }

      fetchData();
      setConfirmDialog({ isOpen: false, id: null });
    } catch (err: any) {
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddPanel = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const openEditPanel = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      parentId: category.parentId ? category.parentId.toString() : 'null',
      sortOrder: category.sortOrder !== undefined ? category.sortOrder.toString() : '0',
      active: category.active !== undefined ? category.active : true,
    });
    if (category.image) {
      setImagePreview(category.image);
    } else {
      setImagePreview(null);
    }
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', parentId: 'null', sortOrder: '0', active: true });
    setImageFile(null);
    setImagePreview(null);
  };

  const filterCategories = (cats: any[], searchTerm: string): any[] => {
    if (!searchTerm) return cats;
    
    return cats.map(c => {
      const category = { ...c };
      const nameMatches = category.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchingChildren: any[] = [];
      if (category.children && category.children.length > 0) {
        matchingChildren = filterCategories(category.children, searchTerm);
      }
      
      if (nameMatches) {
        return category; // Parent matches, keep it with all its original children
      } else if (matchingChildren.length > 0) {
        // Parent doesn't match, but children do. Keep parent with only matching children.
        category.children = matchingChildren;
        return category;
      }
      return null;
    }).filter(Boolean);
  };

  const filteredCategories = filterCategories(categories, search);
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, c) => sum + (c.children?.length || 0), 0);

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <FolderTree className="w-7 h-7 sm:w-8 h-8 text-blue-600" />
              Categories
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-xs sm:text-sm font-medium">Organize your products into categories and subcategories.</p>
          </div>
          
          <button 
            type="button"
            onClick={openAddPanel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Categories Overview | Categories Table) */}
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
            Categories Overview
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
            Categories Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search categories..."
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
        <CategoriesOverviewDashboard
          categories={categories}
          flatCategories={flatCategories}
          setActiveTab={setActiveTab}
          openEditPanel={openEditPanel}
        />
      ) : (
        /* ──────────────── DATA TABLE ──────────────── */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <TableEmptyState
            icon={FolderTree}
            title="No categories found"
            description="You haven't created any categories yet, or none match your search. Click below to add your first category."
            actionLabel="Create First Category"
            onAction={openAddPanel}
          />
        ) : viewMode === 'list' ? (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[minmax(240px,2fr)_minmax(140px,1.2fr)_minmax(120px,1fr)_minmax(120px,1fr)_120px] gap-4 h-14 px-5 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <div className="pl-9">Category Name</div>
              <div>Slug</div>
              <div>Catalog Items</div>
              <div>Hierarchy</div>
              <div className="text-right pr-2">Actions</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {filteredCategories.map((c) => (
                <CategoryRow key={c.id} category={c} onEdit={openEditPanel} onDelete={handleDelete} defaultExpanded={!!search} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/30 dark:bg-slate-900/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 xl:gap-6">
              {filteredCategories.map(c => (
                  <div key={c.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                         {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <FolderTree className="w-12 h-12 opacity-50" />}
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button onClick={() => openEditPanel(c)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300">
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                              <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="absolute top-2 right-2">
                           <span className="px-2 py-1 bg-slate-900/50 backdrop-blur-md text-white rounded-lg text-[9px] font-bold">
                             {c.productsCount || 0} items
                           </span>
                         </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1 line-clamp-1">{c.name}</h3>
                        {c.description && <p className="text-[10px] font-medium text-slate-500 line-clamp-1 mb-2">{c.description}</p>}
                        
                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <p className="text-[9px] font-bold text-slate-400">Created: {new Date(c.createdAt).toLocaleDateString()}</p>
                          {c.children && c.children.length > 0 && (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                              {c.children.length} sub
                            </span>
                          )}
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── SLIDE OUT PANEL: CATEGORY ──────────────── */}
      <MainRightPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onDiscard={handleClosePanel}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        subtitle={editingCategory ? 'Modify category hierarchy and details' : 'Organize your products with categories and subcategories'}
        icon={FolderTree}
        formId="categoryForm"
        isSubmitting={isSubmitting}
        saveText={editingCategory ? 'Save Changes' : 'Save Category'}
      >
        <form id="categoryForm" onSubmit={handleSaveCategory} className="font-sans space-y-4">
          
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
                        Cover Image <span className="text-xs font-medium text-slate-400">(Optional)</span>
                      </label>
                      <div className="w-full relative">
                        {imagePreview ? (
                          <div className="relative group w-full h-36 rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <img 
                              src={imagePreview} 
                              alt="Cover Preview" 
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                              onClick={() => setZoomedImage(imagePreview)}
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-[1px]">
                              <button 
                                type="button" 
                                onClick={() => setZoomedImage(imagePreview)} 
                                className="p-2 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all shadow-md cursor-pointer hover:scale-110"
                                title="Zoom image"
                              >
                                <Maximize className="w-4 h-4" />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => { setImageFile(null); setImagePreview(null); }} 
                                className="p-2 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-md cursor-pointer hover:scale-110"
                                title="Remove image"
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
                                Click or drag image to upload
                              </span>
                              <span className="text-[11px] font-medium text-slate-400">
                                Supports PNG, JPG, WebP
                              </span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          id="field-category-name"
                          value={formData.name} 
                          onChange={e => {
                            if (validationError?.field === 'field-category-name') setValidationError(null);
                            setFormData({...formData, name: e.target.value});
                          }} 
                          className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          placeholder="e.g. Electronics" 
                        />
                        <ValidationErrorTooltip error={validationError} fieldId="field-category-name" />
                      </div>
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

          {/* 2. Hierarchy & Organization */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button 
              type="button" 
              onClick={() => toggleSection("hierarchy")}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.hierarchy ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-blue-600" />
                Hierarchy & Organization
              </span>
              {openSections.hierarchy ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {openSections.hierarchy && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Parent Category</label>
                      <CustomSelect 
                        value={formData.parentId} 
                        onChange={val => setFormData({...formData, parentId: val})}
                        label="None (Root Category)"
                        options={[
                          { value: 'null', label: 'None (Root Category)' },
                          ...flatCategories
                            .filter(c => c.id !== editingCategory?.id)
                            .map(c => ({ value: c.id.toString(), label: c.name }))
                        ]}
                      />
                      <p className="text-xs text-slate-400 font-medium">
                        Choose a parent category to create a sub-category, or leave as root category.
                      </p>
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
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete Category"
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
            <img src={zoomedImage} alt="Zoomed Category" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <CategoriesPageContent />
    </Suspense>
  );
}
