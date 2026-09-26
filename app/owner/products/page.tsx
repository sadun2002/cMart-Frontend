'use client';
import { Suspense } from 'react';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateSystemBarcode } from '@/lib/barcode-utils';
import { Plus, Search, Trash2, Package, Tag, Filter, X, Barcode, Edit, List, LayoutGrid, Maximize, Minimize, Copy, ChevronDown, ChevronUp, CircleDollarSign, Printer, Download, Settings, Calendar, Check, Layers, Info, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, Boxes, Sparkles, ArrowRight, AlertCircle, SearchX, BarChart3 } from 'lucide-react';
import { KpiCard } from '@/components/ui/kpi-card';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect, CustomSelectOption } from '@/components/ui/custom-select';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { useAuthStore } from '@/lib/auth-store';
import { CategoryPanel } from '@/components/shared/CategoryPanel';
import { AddProductPanel } from '@/components/shared/AddProductPanel';
import { BrandPanel } from '@/components/shared/BrandPanel';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { saveProductLocally, markProductSynced, getLocalProducts, updateProductLocally, deleteProductLocally, getLocalBrands, getLocalCategories, getProductLogs, saveBarcodeHistory, saveCategoryLocally, saveBrandLocally } from '@/lib/local-services';
import { getSetting, setSetting } from '@/lib/db';
import { isTauriEnv } from '@/lib/local-db';

const DEFAULT_UNITS: CustomSelectOption[] = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'l', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'packets', label: 'Packets' }
];

const DEFAULT_VARIANT_OPTIONS = ['Size', 'Color', 'Material', 'Style', 'Weight'];

const BARCODE_TYPES = [
  { value: 'ean13', label: 'EAN-13 (Retail)' },
  { value: 'code128', label: 'Code 128 (Standard)' },
  { value: 'upca', label: 'UPC-A (North America)' },
  { value: 'code39', label: 'Code 39' },
  { value: 'qrcode', label: 'QR Code' },
];

function formatStock(num: number) {
  if (num == null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}

function dataURLtoFile(dataurl: string, filename: string) {
  try {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--) { u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  } catch(e) {
    return null;
  }
}

function ProductHistoryView({ product, categoryName, onClose, onUpdate, onDelete }: { product: any, categoryName?: string, onClose: () => void, onUpdate: (p: any) => void, onDelete: (id: number) => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    async function loadLogs() {
      if (!product?.id) return;
      const logs = await getProductLogs(product.id, user?.branchId || 1);
      
      // If no logs found (e.g. legacy products), fallback to creation log
      if (logs.length === 0) {
        setHistory([{ date: product.createdAt, action: 'CREATED', desc: 'Product created', by: user?.name || 'System', role: user?.role || '' }]);
      } else {
        setHistory(logs.map(l => {
          const parts = (l.performedBy || `${user?.name || 'System'}|${user?.role || ''}`).split('|');
          return {
            date: l.createdAt,
            action: l.action,
            desc: l.description,
            by: parts[0],
            role: parts[1] || ''
          };
        }));
      }
    }
    loadLogs();
  }, [product, user?.branchId]);

  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-900/50 border-b-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            {product.name}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
              product.showOnWebsite ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 
              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {product.showOnWebsite ? 'Published' : 'POS Only'}
            </span>
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Added on {new Date(product.createdAt).toLocaleDateString()} at {new Date(product.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onUpdate(product)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-colors shadow-sm shadow-blue-500/20">
            <Edit className="w-4 h-4" /> Update
          </button>
          <button onClick={() => onDelete(product.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10 font-bold transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10 font-bold transition-colors">
            <ChevronUp className="w-4 h-4" /> Close
          </button>
        </div>
      </div>
      
      {/* Product Details Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Box 1: Identification */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Barcode className="w-4 h-4" /> Identification</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Barcode</p>
                <div className="flex items-center gap-2 group/barcode">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.barcode || <span className="text-slate-400 italic font-normal">N/A</span>}</p>
                  {product.barcode && (
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(product.barcode); toast.success('Barcode copied!'); }} className="p-1 opacity-0 group-hover/barcode:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0" title="Copy Barcode">
                      <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">SKU</p>
                <div className="flex items-center gap-2 group/sku">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.sku || <span className="text-slate-400 italic font-normal">N/A</span>}</p>
                  {product.sku && (
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(product.sku); toast.success('SKU copied!'); }} className="p-1 opacity-0 group-hover/sku:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0" title="Copy SKU">
                      <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500" />
                    </button>
                  )}
                </div>
              </div>
              {product.aliases && <div><p className="text-xs text-slate-500 mb-0.5">Aliases</p><p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{product.aliases}</p></div>}
            </div>
          </div>
          
          {/* Box 2: Organization */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Organization</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-slate-500 mb-0.5">Category</p><p className="font-bold text-slate-900 dark:text-white text-sm">{categoryName || 'N/A'}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Brand</p><p className="font-bold text-slate-900 dark:text-white text-sm">{product.brand || <span className="text-slate-400 italic font-normal">N/A</span>}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Unit</p><p className="font-bold text-slate-900 dark:text-white text-sm uppercase">{product.unit || 'pieces'}</p></div>
            </div>
          </div>
          
          {/* Box 3: Pricing */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><CircleDollarSign className="w-4 h-4" /> Pricing</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-slate-500 mb-0.5">Selling Price</p><p className="font-black text-blue-600 dark:text-blue-400 text-lg">Rs. {Number(product.price || 0).toFixed(2)}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Cost Price</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Rs. {Number(product.cost || 0).toFixed(2)}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Wholesale Price</p><p className="font-bold text-amber-600 dark:text-amber-500 text-sm">Rs. {Number(product.wholesalePrice || 0).toFixed(2)}</p></div>
              {product.taxRate && Number(product.taxRate) > 0 ? <div><p className="text-xs text-slate-500 mb-0.5">Tax Rate</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{product.taxRate}%</p></div> : null}
            </div>
          </div>

          {/* Box 4: Inventory */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> Inventory & Tracking</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Current Stock</p>
                <p className={`font-black text-lg ${
                  product.stock <= 0 ? 'text-red-600' :
                  product.stock <= (product.lowStockLevel || 5) ? 'text-orange-500' :
                  'text-emerald-600'
                }`}>{formatStock(product.stock)} {product.unit}</p>
              </div>
              <div><p className="text-xs text-slate-500 mb-0.5">Low Stock Alert Level</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{product.lowStockLevel || 5}</p></div>
              {product.moq && Number(product.moq) > 0 && <div><p className="text-xs text-slate-500 mb-0.5">MOQ</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{product.moq}</p></div>}
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Tracking Options</p>
                <div className="flex gap-2 mt-1">
                  {product.trackExpiry && <span className="text-[10px] bg-purple-50 text-purple-600 dark:bg-purple-500/20 px-2 py-0.5 rounded font-bold uppercase">Expiry: {product.expiryDate || 'Yes'}</span>}
                  {product.trackBatch && <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 px-2 py-0.5 rounded font-bold uppercase">Batch</span>}
                  {!product.trackExpiry && !product.trackBatch && <span className="text-[10px] text-slate-400 italic font-medium">None</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-black text-slate-900 dark:text-white">Recent Activity Log</h3>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-max flex flex-col">
              <div className="grid grid-cols-[200px_150px_450px_200px] gap-4 p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Date</div>
                <div>Action</div>
                <div>Description</div>
                <div>Performed By</div>
              </div>
              <div className="flex flex-col">
                {history.map((h, i) => (
                  <div key={i} className="grid grid-cols-[200px_150px_450px_200px] gap-4 p-4 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div>
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${
                        h.action === 'CREATED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                        h.action === 'PRICE_UPDATE' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                        'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>{h.action.replace('_', ' ')}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{h.desc}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{h.by}</span>
                      {h.role && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-1.5 py-0.5 rounded w-max mt-0.5">
                          {h.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductOverviewDashboardProps {
  overviewStats: {
    totalProducts: number;
    totalStockQty: number;
    totalCostValuation: number;
    totalRetailValuation: number;
    potentialProfit: number;
    avgProfitMargin: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthRatio: number;
    categoryDistribution: Array<{ id: number | string; name: string; count: number; valuation: number; stock: number }>;
    restockItems: Array<{ product: any; stock: number; threshold: number; isOutOfStock: boolean }>;
    topCapitalProducts: Array<{ product: any; capital: number; retailValue: number; marginPercent: number }>;
    chartData: Array<{ name: string; fullName: string; value: number; stock: number; count: number }>;
  };
  categories: any[];
  getCategoryName: (categoryId: number | null) => { main: string; sub: string | null } | null;
  setActiveTab: (tab: 'overview' | 'inventory') => void;
  setStockFilter: (filter: string) => void;
  openEditPanel: (product: any) => void;
  openAddPanel: () => void;
  setIsAddCategoryPanelOpen: (open: boolean) => void;
}

function ProductOverviewDashboard({
  overviewStats,
  categories,
  getCategoryName,
  setActiveTab,
  setStockFilter,
  openEditPanel,
  openAddPanel,
  setIsAddCategoryPanelOpen,
}: ProductOverviewDashboardProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto pr-1 pb-10 space-y-6">
      {/* ──────────────── 1. REUSABLE TOP 4 KPI CARDS (Matching Inventory / Sales / Suppliers Pages) ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Products"
          value={overviewStats.totalProducts.toString()}
          icon={Package}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50 dark:bg-blue-500/10"
        />
        <KpiCard
          title="In Stock"
          value={overviewStats.inStockCount.toString()}
          icon={CheckCircle2}
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <KpiCard
          title="Low Stock Alerts"
          value={overviewStats.lowStockCount.toString()}
          icon={AlertCircle}
          iconColorClass="text-amber-600"
          iconBgClass="bg-amber-50 dark:bg-amber-500/10"
        />
        <KpiCard
          title="Out of Stock"
          value={overviewStats.outOfStockCount.toString()}
          icon={SearchX}
          iconColorClass="text-red-600"
          iconBgClass="bg-red-50 dark:bg-red-500/10"
        />
      </div>

      {/* ──────────────── 2. MAIN DASHBOARD-STYLE GRID: CHART (2 Cols) + TOP 5 PRODUCTS (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (Matching Dashboard Sales/Performance Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[380px] justify-between">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Category Inventory & Stock Valuation
            </h2>
            <div className="flex items-center gap-2">
              {/* Bar / Line toggle button */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded-md transition-all ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Bar
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded-md transition-all ${chartType === 'line' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Line
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            {mounted ? (
              overviewStats.chartData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No category data available to plot chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={overviewStats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                      <Tooltip 
                        formatter={(v: any) => [`Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Valuation']} 
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={overviewStats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                      <Tooltip 
                        formatter={(v: any) => [`Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Valuation']} 
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 font-medium">
            <span>Overall Inventory Cost Valuation</span>
            <span className="font-bold text-slate-900 dark:text-white">
              Rs. {overviewStats.totalCostValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Right: Top 5 Products Card (Matching Dashboard list-top5-products) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[380px] justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Top 5 Capital Products
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                Ranked
              </span>
            </div>

            <div className="space-y-3">
              {overviewStats.topCapitalProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No product data found.
                </div>
              ) : (
                overviewStats.topCapitalProducts.map(({ product: p, capital }, i) => {
                  const rankColors = [
                    'bg-amber-500 text-white',
                    'bg-slate-400 text-white',
                    'bg-orange-700 text-white',
                    'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                    'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  ];
                  return (
                    <div 
                      key={p.id || i} 
                      onClick={() => openEditPanel(p)}
                      className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                      title="Click to edit product"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {p.stock} units in stock
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white flex-shrink-0">
                        Rs. {capital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              View All in Inventory Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: CRITICAL RESTOCK ALERTS & CATEGORY BREAKDOWN ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Critical Restock Attention List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                overviewStats.restockItems.length > 0 
                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600' 
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Critical Restock Attention List
                  </h3>
                  {overviewStats.restockItems.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                      {overviewStats.restockItems.length} Urgent
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Items below threshold requiring immediate purchase order.
                </p>
              </div>
            </div>

            {overviewStats.restockItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStockFilter('lowstock');
                  setActiveTab('inventory');
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View in Table <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {overviewStats.restockItems.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">All Products Well Stocked</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                None of your products are currently out of stock or below low stock alert levels.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[500px] divide-y divide-slate-100 dark:divide-slate-800">
                <div className="grid grid-cols-[2fr_1fr_1fr_90px] gap-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <div>Product</div>
                  <div>Stock Status</div>
                  <div>Selling Price</div>
                  <div className="text-right">Action</div>
                </div>

                {overviewStats.restockItems.slice(0, 6).map(({ product: p, stock, threshold, isOutOfStock }, idx) => (
                  <div key={p.id || idx} className="grid grid-cols-[2fr_1fr_1fr_90px] gap-3 py-2.5 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden text-slate-400">
                        {p.images && p.images.length > 0 ? (
                          <img src={typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">SKU: {p.sku || 'N/A'}</div>
                      </div>
                    </div>

                    <div>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          0 in stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {stock} left
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Rs. {Number(p.price || 0).toFixed(2)}
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => openEditPanel(p)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-xs font-bold transition-all shadow-xs"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Category Distribution Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Category Distribution</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Inventory volume & capital tied by category</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsAddCategoryPanelOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Category
            </button>
          </div>

          {overviewStats.categoryDistribution.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No category data available yet.
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {overviewStats.categoryDistribution.slice(0, 6).map((cat, idx) => {
                const maxVal = overviewStats.categoryDistribution[0]?.valuation || 1;
                const percentage = Math.max(8, Math.round((cat.valuation / maxVal) * 100));
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-medium">
                          {cat.count} {cat.count === 1 ? 'product' : 'products'} ({cat.stock.toLocaleString()} units)
                        </span>
                        <span className="font-black text-slate-900 dark:text-white">
                          Rs. {cat.valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StoreProductsPageContent() {
  const { user } = useAuthStore();
  const isProOrEnterprise = user?.tenant?.plan === 'PRO' || user?.tenant?.plan === 'ENTERPRISE';
  const plan = user?.tenant?.plan?.toUpperCase() || 'STARTUP';
  const isStartup = plan === 'STARTUP' || plan === 'FREE';
  const isLocalMode = isTauriEnv() || isStartup;

  const [products, setProducts] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal / Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Quick Add Panels State
  const [isAddCategoryPanelOpen, setIsAddCategoryPanelOpen] = useState(false);
  const [isAddBrandPanelOpen, setIsAddBrandPanelOpen] = useState(false);

  const handleClosePanel = () => {
    setShowDiscardConfirm(true);
  };
  
  // Filters
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilterType, setDateFilterType] = useState<'all' | 'newly-added' | 'updated'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // View & Sort
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [sortMode, setSortMode] = useState<'default' | 'price-asc' | 'price-desc' | 'instock' | 'outofstock'>('default');

  // Form State
  const [formData, setFormData] = useState({ 
    name: '', 
    barcode: '', 
    sku: '',
    price: '', 
    cost: '',
    stockQuantity: '',
    lowStockLevel: '',
    taxRate: '',
    unit: '',
    brand: '',
    supplierId: 'null',
    moq: '',
    wholesalePrice: '',
    trackExpiry: false, expiryDate: "",
    trackBatch: false,
    showOnWebsite: false,
    categoryId: 'null',
    subcategoryId: 'null',
    aliases: ''
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageLabels, setImageLabels] = useState<string[]>([]);
  const [existingImageLabels, setExistingImageLabels] = useState<Record<number, string>>({});
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({ basic: true, pricing: false, identification: false, variants: false, advanced: false });

  // Barcode Generation State
  const [generateBarcodeOnSave, setGenerateBarcodeOnSave] = useState(false);
  const [symbology, setSymbology] = useState('ean13');
  const [barcodeScale, setBarcodeScale] = useState(3);
  const [barcodeHeight, setBarcodeHeight] = useState(15);
  const [showStoreName, setShowStoreName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [printQuantity, setPrintQuantity] = useState(1);
  const [compositeImageUrl, setCompositeImageUrl] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [openVariantSections, setOpenVariantSections] = useState<Record<string, boolean>>({});
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitInput, setCustomUnitInput] = useState('');
  const [customUnits, setCustomUnits] = useState<string[]>([]);
  const [customVariantOptions, setCustomVariantOptions] = useState<string[]>([]);
  const [customVariantInputs, setCustomVariantInputs] = useState<Record<number, string>>({});
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variantOptions, setVariantOptions] = useState<{name: string, values: string[], isCustom?: boolean}[]>([{ name: '', values: [] }]);
  const [variants, setVariants] = useState<any[]>([]);

  const toggleSection = (section: 'basic' | 'pricing' | 'identification' | 'variants' | 'advanced') => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      } else {
        return {
          basic: false,
          pricing: false,
          identification: false,
          variants: false,
          advanced: false,
          [section]: true
        };
      }
    });
  };

  const focusField = (id: string, sectionKey?: string) => {
    const focus = () => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          if (el.tagName === 'BUTTON') el.click();
        }
      }, 100);
    };

    if (sectionKey && !(openSections as any)[sectionKey]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
      setTimeout(focus, 300);
    } else {
      focus();
    }
  };

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
    if (searchParams.get('action') === 'add') {
      openAddPanel();
      // Remove the query param from URL so it doesn't re-open on refresh
      router.replace('/owner/products');
    }
  }, [searchParams, router]);

  // Variant Generation Effect
  useEffect(() => {
    if (!hasVariants) {
      setVariants([]);
      return;
    }
    const activeOptions = variantOptions.filter(o => o.name.trim() && o.values.length >= 2);
    if (activeOptions.length === 0) {
      setVariants([]);
      return;
    }
    
    const cartesianProduct = (arr: any[][]): any[][] => {
      return arr.reduce((a, b) => {
        return a.flatMap(d => b.map(e => [d, e].flat()));
      }, [[]] as any[][]);
    };

    const valuesArrays = activeOptions.map(o => o.values);
    const combos = cartesianProduct(valuesArrays);
    
    setVariants(prevVariants => {
      return combos.map(combo => {
        const name = combo.join(' / ');
        const attributes: any = {};
        activeOptions.forEach((opt, idx) => {
          attributes[opt.name] = combo[idx];
        });
        
        // Preserve existing if possible
        const existing = prevVariants.find(v => v.name === name);
        const generatedSku = `PRD-${Math.floor(10000000 + Math.random() * 90000000)}`;
        return existing ? existing : {
          name,
          sku: generatedSku,
          barcode: '',
          price: '',
          cost: '',
          stockQuantity: '0',
          lowStockLevel: '5',
          moq: '',
          wholesalePrice: '',
          attributes
        };
      });
    });
  }, [variantOptions, hasVariants]);

  // Derived Barcode State
  const activeVariantIndexStr = Object.keys(openVariantSections).find(k => openVariantSections[k]);
  const activeVariantIndex = activeVariantIndexStr ? parseInt(activeVariantIndexStr) : null;
  const showBarcodePanel = generateBarcodeOnSave && (
    (!hasVariants && openSections.identification) || 
    (hasVariants && activeVariantIndex !== null)
  );
  
  const activeBarcode = (hasVariants && activeVariantIndex !== null) 
    ? variants[activeVariantIndex]?.barcode 
    : formData.barcode;
    
  const activePrice = (hasVariants && activeVariantIndex !== null) 
    ? variants[activeVariantIndex]?.price 
    : formData.price;

  // Auto-fill print quantity when panel opens
  useEffect(() => {
    if (showBarcodePanel) {
      if (hasVariants && activeVariantIndex !== null) {
        const v = variants[activeVariantIndex];
        const stock = parseInt(v?.stockQuantity || '0');
        setPrintQuantity(stock > 0 ? stock : 1);
      } else if (!hasVariants && openSections.identification) {
        const stock = parseInt(formData.stockQuantity || '0');
        setPrintQuantity(stock > 0 ? stock : 1);
      }
    }
  }, [showBarcodePanel, activeVariantIndex, openSections.identification, hasVariants]);

  // Barcode Preview Generation
  useEffect(() => {
    if (!showBarcodePanel || !activeBarcode) {
      setCompositeImageUrl('');
      return;
    }

    const generateBarcodeUrl = () => {
      if (!activeBarcode) return '';
      const params = new URLSearchParams({
        bcid: symbology,
        text: activeBarcode,
        scale: barcodeScale.toString(),
        height: barcodeHeight.toString(),
        includetext: 'true',
        backgroundcolor: 'ffffff',
      });
      return `https://bwipjs-api.metafloor.com/?${params.toString()}`;
    };

    const bwipUrl = generateBarcodeUrl();
    if (!bwipUrl) {
      setCompositeImageUrl('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = bwipUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const topPadding = (showStoreName || showDate) ? 30 * (barcodeScale / 3) : 0;
      const bottomPadding = showPrice ? 30 * (barcodeScale / 3) : 0;
      
      canvas.width = img.width + 40;
      canvas.height = img.height + topPadding + bottomPadding + 20;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      
      const fontSize = Math.max(12, 16 * (barcodeScale / 3));
      ctx.font = `bold ${fontSize}px sans-serif`;

      if (showStoreName || showDate) {
        ctx.textBaseline = 'top';
        
        if (showStoreName) {
          ctx.textAlign = 'left';
          ctx.fillText(user?.tenant?.businessName || 'cMart POS', 20, 10);
        }
        
        if (showDate) {
          const dateStr = new Date().toLocaleDateString('en-GB');
          ctx.textAlign = 'right';
          ctx.fillText(dateStr, canvas.width - 20, 10);
        }
      }

      const imgX = (canvas.width - img.width) / 2;
      const imgY = topPadding + 10;
      ctx.drawImage(img, imgX, imgY);

      if (showPrice) {
         ctx.textBaseline = 'bottom';
         ctx.textAlign = 'center';
         const priceStr = `Rs. ${parseFloat(activePrice || '0').toFixed(2)}`;
         ctx.fillText(priceStr, canvas.width / 2, canvas.height - 10);
      }
      
      setCompositeImageUrl(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      setCompositeImageUrl('');
    };
  }, [activeBarcode, activePrice, symbology, barcodeScale, barcodeHeight, showStoreName, showDate, showPrice, user, showBarcodePanel]);

  const handlePrintBarcode = async () => {
    if (user?.tenantId) {
       await saveBarcodeHistory(user.tenantId, {
         barcode: activeBarcode,
         barcodeType: symbology,
         quantity: printQuantity
       });
    }
    const printWindow = window.open('', '_blank');
    if (printWindow && compositeImageUrl) {
      const imagesHtml = Array(printQuantity)
        .fill(0)
        .map(() => `<div class="barcode-wrapper"><img src="${compositeImageUrl}" onload="imageLoaded()" /></div>`)
        .join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcodes</title>
            <style>
              body { 
                display: flex; 
                flex-wrap: wrap; 
                gap: 20px; 
                padding: 20px; 
                justify-content: center; 
                margin: 0;
                background: white;
              }
              .barcode-wrapper { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                page-break-inside: avoid;
              }
              img { max-width: 100%; height: auto; }
              @media print {
                body { padding: 0; gap: 10px; }
              }
            </style>
            <script>
              let loaded = 0;
              const total = ${printQuantity};
              function imageLoaded() {
                loaded++;
                if (loaded >= total) {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 200);
                }
              }
            </script>
          </head>
          <body>
            ${imagesHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Save draft state
  useEffect(() => {
    if (!editingProduct && isPanelOpen) {
      localStorage.setItem('productDraft', JSON.stringify(formData));
      if (imagePreviews.length > 0) {
        try {
          const base64Images = imagePreviews.filter(img => img.startsWith('data:image'));
          localStorage.setItem('productDraftImages', JSON.stringify(base64Images));
          localStorage.setItem('productDraftLabels', JSON.stringify(imageLabels));
        } catch(e) {
          console.warn("Images too large to auto-save in draft.");
        }
      } else {
        localStorage.removeItem('productDraftImages');
        localStorage.removeItem('productDraftLabels');
      }
    }
  }, [formData, editingProduct, isPanelOpen, imagePreviews]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const user = useAuthStore.getState().user;
      const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';
      
      let prodData: any[] = [];
      let brandsData: any[] = [];
      let catsData: any[] = [];
      try {
        if (isLocalMode) {
          prodData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1);
          brandsData = await getLocalBrands(user?.tenantId || null);
          catsData = await getLocalCategories(user?.tenantId || null);
        } else {
          const prodRes = await storeOwnerAPI.getProducts();
          prodData = prodRes.data;
          const brandRes = await storeOwnerAPI.getBrands().catch(() => ({ fallbackToLocal: true }));
          if (brandRes && (brandRes as any).fallbackToLocal) {
            brandsData = await getLocalBrands(user?.tenantId || null);
          } else {
            brandsData = (brandRes as any).data || [];
          }
          const catRes = await storeOwnerAPI.getCategories().catch(() => ({ data: [] }));
          catsData = catRes.data || [];
        }
      } catch(e) {
        // Fallback to local DB if backend fetch fails
        prodData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1);
        brandsData = await getLocalBrands(user?.tenantId || null);
        catsData = await getLocalCategories(user?.tenantId || null);
      }

      setProducts(prodData);
      setCategories(catsData);
      setBrands(brandsData);

      // Load custom units & custom variant options
      try {
        const localUnits = localStorage.getItem('product_custom_units');
        if (localUnits) {
          const parsed = JSON.parse(localUnits);
          if (Array.isArray(parsed)) setCustomUnits(parsed);
        }
        const dbUnits = await getSetting('product_custom_units', '');
        if (dbUnits) {
          const parsed = JSON.parse(dbUnits);
          if (Array.isArray(parsed)) {
            setCustomUnits(parsed);
            localStorage.setItem('product_custom_units', dbUnits);
          }
        }
      } catch (e) {}

      try {
        const localVariants = localStorage.getItem('product_custom_variants');
        if (localVariants) {
          const parsed = JSON.parse(localVariants);
          if (Array.isArray(parsed)) setCustomVariantOptions(parsed);
        }
        const dbVariants = await getSetting('product_custom_variants', '');
        if (dbVariants) {
          const parsed = JSON.parse(dbVariants);
          if (Array.isArray(parsed)) {
            setCustomVariantOptions(parsed);
            localStorage.setItem('product_custom_variants', dbVariants);
          }
        }
      } catch (e) {}
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const user = useAuthStore.getState().user;
      const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';
      
      if (isLocalMode) {
        const localData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1);
        setProducts(localData);
      } else {
        const res = await storeOwnerAPI.getProducts();
        setProducts(res.data);
      }
    } catch (err) {
      const user = useAuthStore.getState().user;
      const localData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1).catch(() => []);
      setProducts(localData);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      focusField('field-name', 'basic');
      return;
    }
    if (!hasVariants && !formData.price) {
      toast.error('Selling Price is required');
      focusField('field-price', 'pricing');
      return;
    }
    if (hasVariants) {
      if (variants.length < 2) {
        toast.error('At least two variants must be created (e.g. Size S and M)');
        focusField('field-variant-option-0', 'variants');
        return;
      }
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.price) {
          toast.error(`Selling price is required for variant: ${v.name}`);
          if (!openVariantSections[i]) {
            setOpenVariantSections(prev => ({ ...prev, [i]: true }));
            setTimeout(() => focusField(`field-variant-price-${i}`, 'variants'), 300);
          } else {
            focusField(`field-variant-price-${i}`, 'variants');
          }
          return;
        }
      }
    }
    
    if (generateBarcodeOnSave) {
      if (!hasVariants && !formData.barcode) {
        toast.error('Barcode is required when "Generate and Print Barcode" is enabled.');
        focusField('field-barcode', 'identification');
        return;
      }
      if (!hasVariants && formData.barcode) {
        if (symbology === 'ean13' && formData.barcode.length !== 13) {
          toast.error('EAN-13 barcodes must be exactly 13 digits.');
          focusField('field-barcode', 'identification');
          return;
        }
        if (symbology === 'upca' && formData.barcode.length !== 12) {
          toast.error('UPC-A barcodes must be exactly 12 digits.');
          focusField('field-barcode', 'identification');
          return;
        }
      }

      if (hasVariants) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          if (!v.barcode) {
            toast.error(`Barcode is required for variant: ${v.name} when generating barcodes.`);
            if (!openVariantSections[i]) {
              setOpenVariantSections(prev => ({ ...prev, [i]: true }));
              setTimeout(() => focusField(`field-variant-barcode-${i}`, 'variants'), 300);
            } else {
              focusField(`field-variant-barcode-${i}`, 'variants');
            }
            return;
          }
          if (symbology === 'ean13' && v.barcode.length !== 13) {
            toast.error(`EAN-13 barcodes must be exactly 13 digits for variant: ${v.name}.`);
            if (!openVariantSections[i]) {
              setOpenVariantSections(prev => ({ ...prev, [i]: true }));
              setTimeout(() => focusField(`field-variant-barcode-${i}`, 'variants'), 300);
            } else {
              focusField(`field-variant-barcode-${i}`, 'variants');
            }
            return;
          }
          if (symbology === 'upca' && v.barcode.length !== 12) {
            toast.error(`UPC-A barcodes must be exactly 12 digits for variant: ${v.name}.`);
            if (!openVariantSections[i]) {
              setOpenVariantSections(prev => ({ ...prev, [i]: true }));
              setTimeout(() => focusField(`field-variant-barcode-${i}`, 'variants'), 300);
            } else {
              focusField(`field-variant-barcode-${i}`, 'variants');
            }
            return;
          }
        }
      }
    }
    if (formData.categoryId === 'null') {
      toast.error('Category is required');
      focusField('field-category', 'basic');
      return;
    }
    const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId);
    if (selectedCategory && selectedCategory.children && selectedCategory.children.length > 0) {
      if (formData.subcategoryId === 'null') {
        toast.error('Subcategory is required for this category');
        focusField('field-subcategory', 'basic');
        return;
      }
    }
    if (!formData.unit) {
      toast.error('Unit is required');
      focusField('field-unit', 'basic');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      payload.append('name', formData.name);
      if (formData.barcode) payload.append('barcode', formData.barcode);
      
      // Send dummy values for backend compatibility until backend is updated for multi-branch
      payload.append('price', formData.price || '0');
      if (formData.cost) payload.append('cost', formData.cost || '0');
      payload.append('stockQuantity', formData.stockQuantity || '0');
      payload.append('unit', formData.unit || 'pieces');
      payload.append('showOnWebsite', formData.showOnWebsite.toString());
      
      if (formData.aliases) payload.append('aliases', formData.aliases);
      if (formData.moq) payload.append('moq', formData.moq);
      if (formData.wholesalePrice) payload.append('wholesalePrice', formData.wholesalePrice);
      
      if (hasVariants) {
        payload.append('hasVariants', 'true');
        payload.append('variants', JSON.stringify(variants));
      }
      
      const finalCategoryId = formData.subcategoryId !== 'null' ? formData.subcategoryId : formData.categoryId !== 'null' ? formData.categoryId : null;
      if (finalCategoryId) {
        payload.append('categoryId', finalCategoryId);
      }
      
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          payload.append('images', file);
        });
        payload.append('imageLabels', JSON.stringify(imageLabels));
      }
      if (deletedImageIds.length > 0) {
        payload.append('deletedImageIds', JSON.stringify(deletedImageIds));
      }
      if (Object.keys(existingImageLabels).length > 0) {
        payload.append('existingImageLabels', JSON.stringify(existingImageLabels));
      }

      if (editingProduct) {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

        // Update locally first
        const localData = {
          name: formData.name,
          barcode: formData.barcode,
          sku: formData.sku,
          price: formData.price,
          cost: formData.cost,
          stockQuantity: formData.stockQuantity,
          lowStockLevel: formData.lowStockLevel,
          taxRate: formData.taxRate,
          unit: formData.unit,
          brand: formData.brand,
          supplierId: formData.supplierId,
          wholesalePrice: formData.wholesalePrice,
          trackExpiry: formData.trackExpiry,
          trackBatch: formData.trackBatch,
          showOnWebsite: formData.showOnWebsite,
          categoryId: finalCategoryId,
          aliases: formData.aliases,
          imageLabels: JSON.stringify(imageLabels),
          hasVariants,
          variants,
          images: JSON.stringify(imagePreviews),
          isBarcodePrinted: generateBarcodeOnSave
        };

        await updateProductLocally(editingProduct.id, localData, tenantId);

        if (!isLocalMode) {
          try {
            await storeOwnerAPI.updateProduct(editingProduct.id, payload);
            await markProductSynced(editingProduct.id);
            toast.success('Product updated and synced successfully!');
          } catch (syncErr: any) {
            console.error('Sync failed:', syncErr);
            toast.warning('Product updated locally but failed to sync to server (Product may not exist on server).');
          }
        } else {
          toast.success('Product updated successfully in local database!');
        }
      } else {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

        // 1. Save locally first
        const localData = {
          name: formData.name,
          barcode: formData.barcode,
          sku: formData.sku,
          price: formData.price,
          cost: formData.cost,
          stockQuantity: formData.stockQuantity,
          lowStockLevel: formData.lowStockLevel,
          taxRate: formData.taxRate,
          unit: formData.unit,
          brand: formData.brand,
          supplierId: formData.supplierId,
          wholesalePrice: formData.wholesalePrice,
          trackExpiry: formData.trackExpiry,
          trackBatch: formData.trackBatch,
          showOnWebsite: formData.showOnWebsite,
          categoryId: finalCategoryId,
          aliases: formData.aliases,
          imageLabels: JSON.stringify(imageLabels),
          hasVariants,
          variants,
          images: JSON.stringify(imagePreviews), // Draft base64 representations
          isBarcodePrinted: generateBarcodeOnSave
        };
        
        const localRecord = await saveProductLocally(localData, tenantId);

        // 2. Sync if not startup
        if (!isLocalMode) {
          try {
            const res = await storeOwnerAPI.createProduct(payload);
            // Mark synced in local DB
            await markProductSynced(localRecord.id);
            toast.success('Product added and synced successfully!');
          } catch (syncErr) {
            console.error('Sync failed:', syncErr);
            toast.warning('Product saved locally but failed to sync to server.');
          }
        } else {
          toast.success('Product added successfully to local database!');
        }

        localStorage.removeItem('productDraft');
        localStorage.removeItem('productDraftImages');
        localStorage.removeItem('productDraftLabels');
      }

      setIsPanelOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
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

      await deleteProductLocally(confirmDialog.id, tenantId);

      if (!isLocalMode) {
        try {
          await storeOwnerAPI.deleteProduct(confirmDialog.id);
          toast.success('Product deleted and synced');
        } catch (syncErr: any) {
          console.error('Delete sync failed:', syncErr);
          toast.success('Product deleted locally (was not synced to server)');
        }
      } else {
        toast.success('Product deleted from local database');
      }

      fetchProducts();
      setConfirmDialog({ isOpen: false, id: null });
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddPanel = () => {
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    setImageLabels([]);
    setExistingImageLabels({});
    setDeletedImageIds([]);
    
    const draft = localStorage.getItem('productDraft');
    const generatedSku = `PRD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setIsCustomUnit(false);
    setCustomUnitInput('');
    setCustomVariantInputs({});
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData({ ...parsed, categoryId: parsed.categoryId || 'null', subcategoryId: parsed.subcategoryId || 'null', sku: parsed.sku || generatedSku, moq: parsed.moq || '' });
      } catch (e) {
        setFormData({ name: '', barcode: '', sku: generatedSku, price: '', cost: '', stockQuantity: '', lowStockLevel: '5', taxRate: '0', unit: '', brand: '', supplierId: 'null', moq: '', wholesalePrice: '', trackExpiry: false, expiryDate: "", trackBatch: false, showOnWebsite: false, categoryId: 'null', subcategoryId: 'null', aliases: '' });
      }
      setFormData({ name: '', barcode: '', sku: generatedSku, price: '', cost: '', stockQuantity: '', lowStockLevel: '5', taxRate: '0', unit: '', brand: '', supplierId: 'null', moq: '', wholesalePrice: '', trackExpiry: false, expiryDate: "", trackBatch: false, showOnWebsite: false, categoryId: 'null', subcategoryId: 'null', aliases: '' });
    }
    setGenerateBarcodeOnSave(false);
    
    const draftImagesStr = localStorage.getItem('productDraftImages');
    const draftLabelsStr = localStorage.getItem('productDraftLabels');
    if (draftImagesStr) {
      try {
        const draftImages = JSON.parse(draftImagesStr);
        setImagePreviews(draftImages);
        
        let parsedLabels = Array(draftImages.length).fill('');
        if (draftLabelsStr) {
          try {
            parsedLabels = JSON.parse(draftLabelsStr);
          } catch(e) {}
        }
        setImageLabels(parsedLabels);

        const files = draftImages.map((img: string, idx: number) => dataURLtoFile(img, `draft-image-${idx}.png`)).filter(Boolean);
        setImageFiles(files);
      } catch (e) {
        console.warn('Failed to parse draft images');
      }
    }
    
    setIsPanelOpen(true);
  };

  const openEditPanel = (product: any) => {
    setEditingProduct(product);
    
    // Find if the product's category is a subcategory to populate both dropdowns correctly
    let catId = 'null';
    let subcatId = 'null';
    if (product.categoryId) {
      const isMainCategory = categories.find(c => c.id === product.categoryId);
      if (isMainCategory) {
        catId = product.categoryId.toString();
      } else {
        // It might be a subcategory
        for (const mainCat of categories) {
          const isSub = mainCat.children?.find((sc: any) => sc.id === product.categoryId);
          if (isSub) {
            catId = mainCat.id.toString();
            subcatId = isSub.id.toString();
            break;
          }
        }
      }
    }

    setFormData({
      name: product.name || '',
      barcode: product.barcode || '',
      sku: product.sku || `PRD-${Math.floor(10000000 + Math.random() * 90000000)}`,
      price: product.price ? product.price.toString() : '',
      cost: product.cost ? product.cost.toString() : '',
      stockQuantity: product.stockQuantity !== undefined && product.stockQuantity !== null ? product.stockQuantity.toString() : '0',
      lowStockLevel: product.lowStockLevel !== undefined && product.lowStockLevel !== null ? product.lowStockLevel.toString() : '5',
      taxRate: product.taxRate !== undefined && product.taxRate !== null ? product.taxRate.toString() : '0',
      unit: product.unit || '',
      brand: product.brand || '',
      supplierId: product.supplierId ? product.supplierId.toString() : 'null',
      moq: product.moq ? product.moq.toString() : '',
      wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toString() : '',
      trackExpiry: product.trackExpiry === 1,
      expiryDate: product.expiryDate || "",
      trackBatch: product.trackBatch === 1,
      showOnWebsite: product.showOnWebsite === 1,
      categoryId: catId,
      subcategoryId: subcatId,
      aliases: product.aliases || ''
    });
    setGenerateBarcodeOnSave(product.isBarcodePrinted === true);
    // Set preview if image exists
    setImageFiles([]);
    setImagePreviews([]);
    setImageLabels([]);
    
    // Populate existing labels if available
    const existingLabels: Record<number, string> = {};
    if (product.images) {
       product.images.forEach((img: any) => {
         if (img.label) existingLabels[img.id] = img.label;
       });
    }
    setExistingImageLabels(existingLabels);
    
    setDeletedImageIds([]);
    setIsCustomUnit(false);
    setCustomUnitInput('');
    setCustomVariantInputs({});
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    const generatedSku = `PRD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setFormData({ name: '', barcode: '', sku: generatedSku, price: '', cost: '', stockQuantity: '', lowStockLevel: '5', taxRate: '0', unit: '', brand: '', supplierId: 'null', moq: '', wholesalePrice: '', trackExpiry: false, expiryDate: "", trackBatch: false, showOnWebsite: false, categoryId: 'null', subcategoryId: 'null', aliases: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setImageLabels([]);
    setExistingImageLabels({});
    setDeletedImageIds([]);
    setIsCustomUnit(false);
    setCustomUnitInput('');
    setCustomVariantInputs({});
    setVariantOptions([{ name: '', values: [] }]);
    setHasVariants(false);
  };

  const generateBarcode = () => {
    const code = generateSystemBarcode(user?.tenantId || 0);
    setFormData({...formData, barcode: code});
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return null;
    for (const cat of categories) {
      if (cat.id === categoryId) return { main: cat.name, sub: null };
      if (cat.children) {
        const sub = cat.children.find((c: any) => c.id === categoryId);
        if (sub) return { main: cat.name, sub: sub.name };
      }
    }
    return null;
  };

  const handleSaveCustomUnit = async () => {
    const trimmed = customUnitInput.trim();
    if (!trimmed) {
      setIsCustomUnit(false);
      return;
    }

    const lower = trimmed.toLowerCase();
    const isDefault = DEFAULT_UNITS.some(u => u.value.toLowerCase() === lower);

    if (!isDefault && !customUnits.some(u => u.toLowerCase() === lower)) {
      const updated = [...customUnits, trimmed];
      setCustomUnits(updated);
      localStorage.setItem('product_custom_units', JSON.stringify(updated));
      try {
        await setSetting('product_custom_units', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist custom unit', e);
      }
    }

    setFormData(prev => ({ ...prev, unit: trimmed }));
    setCustomUnitInput('');
    setIsCustomUnit(false);
  };

  const handleDeleteCustomUnit = async (unitToDelete: string) => {
    const updated = customUnits.filter(u => u.toLowerCase() !== unitToDelete.toLowerCase());
    setCustomUnits(updated);
    localStorage.setItem('product_custom_units', JSON.stringify(updated));
    try {
      await setSetting('product_custom_units', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist custom units', e);
    }
    if (formData.unit.toLowerCase() === unitToDelete.toLowerCase()) {
      setFormData(prev => ({ ...prev, unit: '' }));
    }
  };

  const handleSaveCustomVariantOption = async (idx: number) => {
    const val = (customVariantInputs[idx] || '').trim();
    if (!val) {
      const newOpts = [...variantOptions];
      newOpts[idx].isCustom = false;
      setVariantOptions(newOpts);
      return;
    }

    const formattedVal = val.charAt(0).toUpperCase() + val.slice(1);
    const isDefault = DEFAULT_VARIANT_OPTIONS.some(o => o.toLowerCase() === formattedVal.toLowerCase());

    if (!isDefault && !customVariantOptions.some(o => o.toLowerCase() === formattedVal.toLowerCase())) {
      const updated = [...customVariantOptions, formattedVal];
      setCustomVariantOptions(updated);
      localStorage.setItem('product_custom_variants', JSON.stringify(updated));
      try {
        await setSetting('product_custom_variants', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist custom variant option', e);
      }
    }

    const newOpts = [...variantOptions];
    newOpts[idx].name = formattedVal;
    newOpts[idx].isCustom = false;
    if (formattedVal === 'Size' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['S', 'M', 'L', 'XL', 'XXL'];
    else if (formattedVal === 'Color' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['Red', 'Green', 'Blue', 'Black', 'White'];
    else if (formattedVal === 'Weight' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['100g', '250g', '500g', '1kg'];
    else if (formattedVal === 'Material' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['Cotton', 'Polyester', 'Silk', 'Leather'];
    else if (formattedVal === 'Style' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['Casual', 'Formal', 'Sport', 'Vintage'];

    setVariantOptions(newOpts);
    setCustomVariantInputs(prev => ({ ...prev, [idx]: '' }));
  };

  const handleDeleteCustomVariantOption = async (optionToDelete: string) => {
    const updated = customVariantOptions.filter(o => o.toLowerCase() !== optionToDelete.toLowerCase());
    setCustomVariantOptions(updated);
    localStorage.setItem('product_custom_variants', JSON.stringify(updated));
    try {
      await setSetting('product_custom_variants', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist custom variant options', e);
    }

    const newOpts = variantOptions.map(opt => {
      if (opt.name.toLowerCase() === optionToDelete.toLowerCase()) {
        return { ...opt, name: '', values: [] };
      }
      return opt;
    });
    setVariantOptions(newOpts);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search);
    let matchesStock = true;
    if (stockFilter === 'instock') matchesStock = p.stock > 0;
    if (stockFilter === 'outofstock') matchesStock = p.stock <= 0;
    if (stockFilter === 'lowstock') matchesStock = p.stock > 0 && p.stock < 10;
    
    let matchesCategory = true;
    if (categoryFilter !== 'all') {
      const catId = parseInt(categoryFilter);
      if (p.categoryId !== catId) {
        // Also check if it's a subcategory of this category
        const isMain = categories.find(c => c.id === catId);
        if (!isMain?.children?.some((sc: any) => sc.id === p.categoryId)) {
          matchesCategory = false;
        }
      }
    }

    let matchesDate = true;
    if (dateFilterType !== 'all') {
      const targetDate = dateFilterType === 'newly-added' ? new Date(p.createdAt) : new Date(p.updatedAt || p.createdAt);
      
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (targetDate < from) matchesDate = false;
      }
      
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (targetDate > to) matchesDate = false;
      }
    }
    
    return matchesSearch && matchesStock && matchesCategory && matchesDate;
  }).sort((a, b) => {
    if (sortMode === 'instock') return (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortMode === 'outofstock') return (b.stock <= 0 ? 1 : 0) - (a.stock <= 0 ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortMode === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortMode === 'price-desc') return Number(b.price) - Number(a.price);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // default newest first
  });

  const overviewStats = useMemo(() => {
    let totalStockQty = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const catMap = new Map<number | string, { id: number | string; name: string; count: number; valuation: number; stock: number }>();
    const productsWithCapital: Array<{ product: any; capital: number; retailValue: number; marginPercent: number }> = [];
    const restockItems: Array<{ product: any; stock: number; threshold: number; isOutOfStock: boolean }> = [];

    products.forEach((p) => {
      const stock = Number(p.stock || 0);
      const cost = Number(p.cost || 0);
      const price = Number(p.price || 0);
      const threshold = Number(p.lowStockLevel) > 0 ? Number(p.lowStockLevel) : 5;

      totalStockQty += stock;
      const itemCostVal = cost * stock;
      const itemRetailVal = price * stock;
      totalCostValuation += itemCostVal;
      totalRetailValuation += itemRetailVal;

      if (stock <= 0) {
        outOfStockCount++;
        restockItems.push({ product: p, stock, threshold, isOutOfStock: true });
      } else if (stock <= threshold) {
        lowStockCount++;
        restockItems.push({ product: p, stock, threshold, isOutOfStock: false });
      } else {
        inStockCount++;
      }

      // Category breakdown
      const catId = p.categoryId || 'uncategorized';
      const catInfo = getCategoryName(p.categoryId);
      const catName = catInfo ? (catInfo.sub ? `${catInfo.main} > ${catInfo.sub}` : catInfo.main) : 'Uncategorized';

      const existing = catMap.get(catId) || { id: catId, name: catName, count: 0, valuation: 0, stock: 0 };
      existing.count += 1;
      existing.stock += stock;
      existing.valuation += itemCostVal > 0 ? itemCostVal : itemRetailVal;
      catMap.set(catId, existing);

      // Capital calculation
      const capital = itemCostVal > 0 ? itemCostVal : itemRetailVal;
      const margin = price > 0 && cost > 0 ? ((price - cost) / price) * 100 : 0;
      productsWithCapital.push({
        product: p,
        capital,
        retailValue: itemRetailVal,
        marginPercent: margin,
      });
    });

    const categoryDistribution = Array.from(catMap.values())
      .sort((a, b) => b.valuation - a.valuation);

    restockItems.sort((a, b) => {
      if (a.isOutOfStock && !b.isOutOfStock) return -1;
      if (!a.isOutOfStock && b.isOutOfStock) return 1;
      return a.stock - b.stock;
    });

    const topCapitalProducts = [...productsWithCapital]
      .sort((a, b) => b.capital - a.capital)
      .slice(0, 5);

    const totalProducts = products.length;
    const healthRatio = totalProducts > 0 ? (inStockCount / totalProducts) * 100 : 100;
    const potentialProfit = Math.max(0, totalRetailValuation - totalCostValuation);
    const avgProfitMargin = totalRetailValuation > 0 ? ((totalRetailValuation - totalCostValuation) / totalRetailValuation) * 100 : 0;

    const chartData = categoryDistribution.slice(0, 8).map(c => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + '...' : c.name,
      fullName: c.name,
      value: c.valuation,
      stock: c.stock,
      count: c.count,
    }));

    return {
      totalProducts,
      totalStockQty,
      totalCostValuation,
      totalRetailValuation,
      potentialProfit,
      avgProfitMargin,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      healthRatio,
      categoryDistribution,
      restockItems,
      topCapitalProducts,
      chartData,
    };
  }, [products, categories]);

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              Product Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Add, update, and track your store products elegantly.</p>
          </div>
          
          <button 
            onClick={openAddPanel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Product Overview | Product Inventory) - Exactly h-12 p-1 matching Data & Backup */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0">
          <button 
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Product Overview
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button 
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm ${
              activeTab === 'inventory'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Product Inventory
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (activeTab === 'overview' && e.target.value.trim() !== '') {
                  setActiveTab('inventory');
                }
              }}
              className="w-full bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Filter Button */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative"
            title="Filter & Sort"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline text-xs">Filters</span>
            {(stockFilter !== 'all' || categoryFilter !== 'all' || sortMode !== 'default' || dateFilterType !== 'all') && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          
          {/* List View Toggle */}
          <button 
            onClick={() => {
              setActiveTab('inventory');
              setViewMode('list');
            }}
            title="List View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${
              viewMode === 'list' && activeTab === 'inventory'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          
          {/* Grid View Toggle */}
          <button 
            onClick={() => {
              setActiveTab('inventory');
              setViewMode('grid');
            }}
            title="Grid View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${
              viewMode === 'grid' && activeTab === 'inventory'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Full Screen Toggle */}
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
            className="flex items-center justify-center w-12 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ──────────────── TAB CONTENT: OVERVIEW OR INVENTORY ──────────────── */}
      {activeTab === 'overview' ? (
        <ProductOverviewDashboard
          overviewStats={overviewStats}
          categories={categories}
          getCategoryName={getCategoryName}
          setActiveTab={setActiveTab}
          setStockFilter={setStockFilter}
          openEditPanel={openEditPanel}
          openAddPanel={openAddPanel}
          setIsAddCategoryPanelOpen={setIsAddCategoryPanelOpen}
        />
      ) : (
        /* ──────────────── DATA TABLE (CARD LIST) ──────────────── */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Loading inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <TableEmptyState
            icon={Package}
            title="No products found"
            description="You haven't added any products to your inventory yet, or none match your search. Click below to add your first product."
            actionLabel="Add First Product"
            onAction={openAddPanel}
          />
        ) : viewMode === 'list' ? (
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[300px_180px_200px_200px_150px_150px_120px_100px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Product Name</div>
                <div>Category & Brand</div>
                <div>Identifiers</div>
                <div>Pricing</div>
                <div>Inventory</div>
                <div>Tracking</div>
                <div className="text-center">Visibility</div>
                <div className="text-center">Action</div>
              </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {filteredProducts.map((p) => {
                  const catInfo = getCategoryName(p.categoryId);
                  return (
                  <React.Fragment key={p.id}>
                    <div onClick={() => setViewingProduct(viewingProduct?.id === p.id ? null : p)} className={`cursor-pointer grid grid-cols-[300px_180px_200px_200px_150px_150px_120px_100px] gap-4 p-5 items-center transition-colors group ${viewingProduct?.id === p.id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-b-0' : 'border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 overflow-hidden">
                        {p.images && p.images.length > 0 ? (
                          <img src={typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate" title={p.name}>{p.name}</h3>
                        {p.aliases && <p className="text-[10px] text-slate-500 truncate" title={p.aliases}>Aliases: {p.aliases}</p>}
                      </div>
                    </div>

                    <div className="min-w-0 flex flex-col justify-center">
                      {catInfo ? (
                        <>
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{catInfo.main}</span>
                          {catInfo.sub && <span className="text-xs text-slate-500 truncate">{catInfo.sub}</span>}
                        </>
                      ) : <span className="text-slate-400 italic text-sm">None</span>}
                      {p.brand && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-1.5 py-0.5 rounded w-max mt-1 truncate max-w-full">{p.brand}</span>}
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-0 justify-center">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm truncate group/sku">
                        <span className="truncate">SKU: {p.sku || <span className="text-slate-400 italic font-normal text-xs">N/A</span>}</span>
                        {p.sku && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.sku); toast.success('SKU copied!'); }}
                            className="p-1 opacity-0 group-hover/sku:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0"
                            title="Copy SKU"
                          >
                            <Copy className="w-3 h-3 text-slate-400 hover:text-blue-500" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs truncate group/barcode">
                        <Barcode className="w-3 h-3 shrink-0" />
                        <span className="truncate">{p.barcode || <span className="text-slate-400 italic font-normal text-[10px]">N/A</span>}</span>
                        {p.barcode && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.barcode); toast.success('Barcode copied!'); }}
                            className="p-1 opacity-0 group-hover/barcode:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0"
                            title="Copy Barcode"
                          >
                            <Copy className="w-3 h-3 text-slate-400 hover:text-blue-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0 justify-center text-xs">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-slate-500">Price:</span>
                        <span className="font-black text-blue-600 dark:text-blue-400">Rs. {Number(p.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-slate-500">Cost:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Rs. {Number(p.cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-slate-500">W/S:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-500">Rs. {Number(p.wholesalePrice || 0).toFixed(2)}</span>
                      </div>
                      {p.taxRate && Number(p.taxRate) > 0 ? (
                         <div className="flex justify-between items-center w-full mt-0.5 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                           <span className="text-slate-500 text-[10px]">Tax:</span>
                           <span className="font-bold text-slate-500 text-[10px]">{p.taxRate}%</span>
                         </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 justify-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] uppercase font-bold w-max ${
                        p.stock <= 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                        p.stock <= (p.lowStockLevel || 5) ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}>
                         Stock: {formatStock(p.stock)} {p.unit}
                      </span>
                      {p.moq && Number(p.moq) > 0 && (
                        <span className="text-[10px] text-slate-500 font-medium">MOQ: <span className="font-bold text-slate-700 dark:text-slate-300">{p.moq}</span></span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-0 justify-center text-[10px]">
                      {p.trackExpiry ? (
                         <div className="flex flex-col gap-0.5">
                           <span className="text-slate-500">Expiry Tracked</span>
                           {p.expiryDate && <span className="font-bold text-slate-700 dark:text-slate-300">{p.expiryDate}</span>}
                         </div>
                      ) : p.trackBatch ? (
                         <span className="text-slate-500">Batch Tracked</span>
                      ) : (
                         <span className="text-slate-400 italic">No Tracking</span>
                      )}
                    </div>

                    <div className="flex justify-center items-center">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${
                        p.showOnWebsite ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {p.showOnWebsite ? 'Published' : 'POS Only'}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditPanel(p); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                    {/* Inline Details Expansion for List */}
                    <AnimatePresence>
                      {viewingProduct?.id === p.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-b border-slate-100 dark:border-slate-800/60"
                        >
                          <ProductHistoryView product={p} categoryName={catInfo ? (catInfo.sub || catInfo.main) : undefined} onClose={() => setViewingProduct(null)} onUpdate={openEditPanel} onDelete={handleDelete} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )})}
            </div>
          </div>
        </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/30 dark:bg-slate-900/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 xl:gap-6">
              {filteredProducts.map(p => {
                  const catInfo = getCategoryName(p.categoryId);
                  return (
                  <React.Fragment key={p.id}>
                    <div onClick={() => setViewingProduct(viewingProduct?.id === p.id ? null : p)} className={`cursor-pointer bg-white dark:bg-slate-900 border ${viewingProduct?.id === p.id ? 'border-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-800'} rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col`}>
                      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                         {p.images && p.images.length > 0 ? <img src={typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <Package className="w-8 h-8 opacity-50" />}
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button onClick={() => openEditPanel(p)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                              <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                           <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                             p.stock <= 0 ? 'bg-red-500 text-white' :
                             p.stock < 10 ? 'bg-orange-500 text-white' :
                             'bg-emerald-500 text-white'
                           }`}>
                             {formatStock(p.stock)} in stock
                           </span>
                           {!p.showOnWebsite && (
                             <span className="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md bg-slate-800 text-white opacity-80 uppercase tracking-wider">
                               POS Only
                             </span>
                           )}
                         </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <p className="text-[10px] font-bold text-slate-500 truncate">{catInfo ? (catInfo.sub || catInfo.main) : 'No Category'}</p>
                            {p.brand && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-1.5 py-0.5 rounded truncate max-w-[80px] shrink-0">{p.brand}</span>}
                          </div>
                          <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1.5 line-clamp-2" title={p.name}>{p.name}</h3>
                          
                          <div className="flex flex-col gap-0.5 mt-2">
                            {p.sku && (
                              <div className="flex items-center justify-between group/sku">
                                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate"><span className="text-slate-400">SKU:</span> {p.sku}</p>
                                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.sku); toast.success('SKU copied!'); }} className="p-0.5 opacity-0 group-hover/sku:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0" title="Copy SKU"><Copy className="w-2.5 h-2.5 text-slate-400" /></button>
                              </div>
                            )}
                            {p.barcode && (
                              <div className="flex items-center justify-between group/barcode">
                                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate"><Barcode className="w-3 h-3 text-slate-400" /> {p.barcode}</p>
                                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.barcode); toast.success('Barcode copied!'); }} className="p-0.5 opacity-0 group-hover/barcode:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0" title="Copy Barcode"><Copy className="w-2.5 h-2.5 text-slate-400" /></button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 justify-end">
                          <div className="flex justify-between items-end">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                            <span className="font-black text-blue-600 dark:text-blue-400 text-base leading-none">Rs. {Number(p.price || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cost</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Rs. {Number(p.cost || 0).toFixed(2)}</span>
                          </div>
                          {(Number(p.wholesalePrice) > 0) && (
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">W/S</span>
                              <span className="font-bold text-amber-600 dark:text-amber-500 text-xs">Rs. {Number(p.wholesalePrice).toFixed(2)}</span>
                            </div>
                          )}
                          {(Number(p.moq) > 0) && (
                            <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-50 dark:border-slate-800/50">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">MOQ</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{p.moq}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Inline Details Expansion for Grid */}
                    <AnimatePresence>
                      {viewingProduct?.id === p.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="col-span-full overflow-hidden rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-lg mt-2 mb-4"
                        >
                          <ProductHistoryView product={p} categoryName={catInfo ? (catInfo.sub || catInfo.main) : undefined} onClose={() => setViewingProduct(null)} onUpdate={openEditPanel} onDelete={handleDelete} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <AnimatePresence>
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Products"
        onClear={() => { setStockFilter('all'); setCategoryFilter('all'); setDateFilterType('all'); setFromDate(''); setToDate(''); setIsFilterOpen(false); }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Stock Status</label>
          <CustomSelect
            value={stockFilter}
            onChange={setStockFilter}
            options={[
              { value: 'all', label: 'All Products' },
              { value: 'instock', label: 'In Stock (>0)' },
              { value: 'lowstock', label: 'Low Stock (<10)' },
              { value: 'outofstock', label: 'Out of Stock (0)' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By Price</label>
          <CustomSelect
            value={sortMode}
            onChange={(val) => setSortMode(val as any)}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'price-asc', label: 'Low to High' },
              { value: 'price-desc', label: 'High to Low' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Date Filter</label>
          <CustomSelect
            value={dateFilterType}
            onChange={(val) => setDateFilterType(val as any)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: 'newly-added', label: 'Added Date' },
              { value: 'updated', label: 'Updated Date' },
            ]}
          />
          
          {dateFilterType !== 'all' && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">From</label>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">To</label>
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Category</label>
          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.flatMap(c => [
                { value: c.id.toString(), label: c.name },
                ...(c.children || []).map((sc: any) => ({ value: sc.id.toString(), label: `-- ${sc.name}` }))
              ])
            ]}
          />
        </div>
      </FilterPanel>
      </AnimatePresence>

      {/* ──────────────── ADD PRODUCT PANEL ──────────────── */}
      <AddProductPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        onSuccess={(newProduct: any) => {
            fetchInitialData();
            setIsPanelOpen(false);
            setEditingProduct(null);
        }} 
        editingProduct={editingProduct} 
      />

    </div>
  );
}

export default function StoreProductsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Loading products...</div>}>
      <StoreProductsPageContent />
    </Suspense>
  );
}

