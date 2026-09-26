'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, 
  SlidersHorizontal, Search, SearchX, Warehouse, Filter, List, 
  LayoutGrid, Maximize, Minimize, X, DollarSign, AlertCircle, 
  Layers, ChevronDown, ChevronUp, ChevronRight, History, FileWarning, 
  CalendarDays, Building2, Check, AlertTriangle, Info, Clock, 
  CheckCircle2, ArrowRight, Truck, ShieldAlert, FileText, Sparkles, UserCircle, Lock,
  Barcode, Tag, CircleDollarSign, Copy, Calendar, Users, Plus, Circle,
  TrendingDown, TrendingUp, Star, BarChart3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KpiCard } from '@/components/ui/kpi-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { FilterPanel } from '@/components/ui/filter-panel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { MainRightPanel, SecondaryRightPanel } from '@/components/ui/right-panel';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { useBranchStore } from '@/lib/branch-store';
import { useAuthStore } from '@/lib/auth-store';
import { AddProductPanel } from '@/components/shared/AddProductPanel';
import { SelectSupplierPanel } from '@/components/shared/SelectSupplierPanel';
import { storeOwnerAPI } from '@/lib/api';
import { getLocalProducts, getLocalCategories, getProductLogs, updateStockLocally } from '@/lib/local-services';
import { toast } from 'sonner';
import { isTauriEnv } from '@/lib/local-db';

// Types
export type StockActionType = 'Stock In' | 'Stock Out' | 'Stock Transfer' | 'Stock Adjustment' | 'Damaged / Expired';

const STOCK_ACTION_OPTIONS: { label: string; value: StockActionType }[] = [
  { label: 'Stock In', value: 'Stock In' },
  { label: 'Stock Out', value: 'Stock Out' },
  { label: 'Stock Transfer', value: 'Stock Transfer' },
  { label: 'Stock Adjustment', value: 'Stock Adjustment' },
  { label: 'Damaged / Expired', value: 'Damaged / Expired' },
];

const STOCK_IN_REASONS = [
  { label: 'Purchase', value: 'Purchase' },
  { label: 'Supplier Return Received', value: 'Supplier Return Received' },
  { label: 'Branch Transfer Received', value: 'Branch Transfer Received' },
  { label: 'Opening Stock', value: 'Opening Stock' },
  { label: 'Other', value: 'Other' },
];

const STOCK_OUT_REASONS = [
  { label: 'Damage', value: 'Damage' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Lost', value: 'Lost' },
  { label: 'Internal Use', value: 'Internal Use' },
  { label: 'Supplier Return', value: 'Supplier Return' },
  { label: 'Other', value: 'Other' },
];

const ADJUSTMENT_REASONS = [
  { label: 'Counting Error', value: 'Counting Error' },
  { label: 'Damaged / Broken', value: 'Damaged / Broken' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Theft / Missing', value: 'Theft / Missing' },
  { label: 'Other', value: 'Other' },
];

const DAMAGE_REASONS = [
  { label: 'Broken during transit', value: 'Broken during transit' },
  { label: 'Packaging torn / crushed', value: 'Packaging torn / crushed' },
  { label: 'Shelf accident / dropped', value: 'Shelf accident / dropped' },
  { label: 'Water / heat damage', value: 'Water / heat damage' },
  { label: 'Passed expiry date', value: 'Passed expiry date' },
  { label: 'Near expiry unsellable', value: 'Near expiry unsellable' },
  { label: 'Spoiled / defective', value: 'Spoiled / defective' },
  { label: 'Other', value: 'Other' },
];

const FALLBACK_SUPPLIERS = [
  { id: '1', name: 'Anchor Ceylon Ltd' },
  { id: '2', name: 'Nestle Lanka PLC' },
  { id: '3', name: 'Unilever Sri Lanka' },
  { id: '4', name: 'Cargills Ceylon' },
  { id: '5', name: 'Maliban Biscuit Manufactories' },
  { id: '6', name: 'Ceylon Cold Stores (Elephant House)' },
];

const getShortUnit = (unitStr?: string) => {
  if (!unitStr) return '';
  const u = unitStr.toLowerCase().trim();
  if (u === 'pieces' || u === 'piece' || u === 'pcs') return 'pcs';
  if (u === 'kilograms' || u === 'kilogram' || u === 'kg') return 'kg';
  if (u === 'grams' || u === 'gram' || u === 'g') return 'g';
  if (u === 'liters' || u === 'liter' || u === 'l' || u === 'ltr' || u === 'ltrs') return 'L';
  if (u === 'milliliters' || u === 'milliliter' || u === 'ml') return 'ml';
  if (u === 'packets' || u === 'packet' || u === 'pkts' || u === 'pkt') return 'pkt';
  if (u === 'boxes' || u === 'box') return 'box';
  if (u === 'bottles' || u === 'bottle' || u === 'btl') return 'btl';
  return unitStr;
};

// Expanded Informational View for Inventory Row / Grid Card
function InventoryProductDetailView({
  product,
  categoryName,
  branchName,
  onClose,
  onManageStock
}: {
  product: any;
  categoryName?: string;
  branchName?: string;
  onClose: () => void;
  onManageStock: (p: any) => void;
}) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    let isMounted = true;
    async function loadLogs() {
      try {
        setLoadingLogs(true);
        const prodId = Number(product.id);
        const fetchedLogs = !isNaN(prodId) ? await getProductLogs(prodId, user?.branchId || 1) : [];
        if (!isMounted) return;
        if (fetchedLogs && fetchedLogs.length > 0) {
          setLogs(fetchedLogs.map((l: any) => {
            const parts = (l.performedBy || `${user?.name || 'Store Owner'}|${user?.role || 'Owner'}`).split('|');
            return {
              date: l.createdAt,
              action: l.action,
              desc: l.description,
              by: parts[0],
              role: parts[1] || ''
            };
          }));
        } else {
          setLogs([{
            date: product.createdAt || new Date().toISOString(),
            action: 'INITIAL_STOCK',
            desc: `Current stock: ${product.stock ?? product.stockQuantity ?? 0} ${product.unit || 'pcs'}`,
            by: user?.name || 'Store Owner',
            role: user?.role || 'Owner'
          }]);
        }
      } catch (err) {
        if (!isMounted) return;
        setLogs([{
          date: product.createdAt || new Date().toISOString(),
          action: 'INITIAL_STOCK',
          desc: `Current stock: ${product.stock ?? product.stockQuantity ?? 0} ${product.unit || 'pcs'}`,
          by: user?.name || 'Store Owner',
          role: user?.role || 'Owner'
        }]);
      } finally {
        if (isMounted) setLoadingLogs(false);
      }
    }
    loadLogs();
    return () => { isMounted = false; };
  }, [product, user]);

  const stockVal = Number(product.stock ?? product.stockQuantity ?? 0);
  const minVal = Number(product.minStock ?? product.lowStockLevel ?? 10);
  const costVal = Number(product.cost || 0);
  const priceVal = Number(product.price || 0);
  const valuation = stockVal * costVal;

  return (
    <div className="bg-slate-50/70 dark:bg-slate-900/60 p-6 sm:p-8 border-b-2 border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {product.name}
            </h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase ${
              stockVal <= 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
              stockVal <= minVal ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
              'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {stockVal <= 0 ? 'Out of Stock' : stockVal <= minVal ? 'Low Stock' : 'In Stock'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1.5 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Added: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'} • Branch: {branchName || 'Main Branch'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onManageStock(product)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-all shadow-sm shadow-blue-500/20 text-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" /> Manage Stock
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all text-sm cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" /> Close
          </button>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Box 1: Identification */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Barcode className="w-4 h-4 text-blue-500" /> Identification
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Barcode</p>
              <div className="flex items-center gap-2 group/barcode">
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.barcode || <span className="text-slate-400 italic font-normal">N/A</span>}</p>
                {product.barcode && (
                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(product.barcode); toast.success('Barcode copied!'); }} className="p-1 opacity-0 group-hover/barcode:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0 cursor-pointer" title="Copy Barcode">
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
                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(product.sku); toast.success('SKU copied!'); }} className="p-1 opacity-0 group-hover/sku:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0 cursor-pointer" title="Copy SKU">
                    <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500" />
                  </button>
                )}
              </div>
            </div>
            {product.aliases ? (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Aliases</p>
                <p className="font-medium text-slate-700 dark:text-slate-300 text-sm truncate">{product.aliases}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Box 2: Organization & Branch */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-500" /> Organization
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Category</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{categoryName || 'General'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Brand</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.brand || <span className="text-slate-400 italic font-normal">N/A</span>}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Measurement Unit</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm uppercase">{product.unit || 'pcs'}</p>
            </div>
          </div>
        </div>

        {/* Box 3: Valuation & Pricing */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-emerald-500" /> Valuation & Pricing
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Selling Price</p>
              <p className="font-black text-blue-600 dark:text-blue-400 text-base">Rs. {priceVal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Cost Price</p>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Rs. {costVal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Total Stock Valuation</p>
              <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">Rs. {valuation.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            {Number(product.wholesalePrice || 0) > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Wholesale Price</p>
                <p className="font-bold text-amber-600 dark:text-amber-500 text-sm">Rs. {Number(product.wholesalePrice).toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Box 4: Stock & Levels */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500" /> Stock & Levels
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Current Stock</p>
              <p className={`font-black text-lg ${
                stockVal <= 0 ? 'text-red-600' :
                stockVal <= minVal ? 'text-orange-500' :
                'text-emerald-600'
              }`}>
                {stockVal} <span className="text-xs font-bold text-slate-400 uppercase">{product.unit || 'pcs'}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Reorder Alert Level</p>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{minVal} {product.unit || 'pcs'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Tracking Options</p>
              <div className="flex gap-2 mt-1">
                {product.trackExpiry && (
                  <span className="text-[10px] bg-purple-50 text-purple-600 dark:bg-purple-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    Expiry: {product.expiryDate || 'Yes'}
                  </span>
                )}
                {product.trackBatch && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    Batch
                  </span>
                )}
                {!product.trackExpiry && !product.trackBatch && (
                  <span className="text-[10px] text-slate-400 italic font-medium">Standard Tracking</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            Recent Activity Log
          </h4>
          <span className="text-xs font-semibold text-slate-400">{logs.length} movement records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Date & Time</th>
                <th className="py-3 px-5">Action</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingLogs ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-slate-400">Loading activity logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-slate-400 italic">No activity logs recorded yet for this product.</td>
                </tr>
              ) : (
                logs.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-sm">
                    <td className="py-3 px-5 font-medium text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                      {new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                        h.action.includes('ADD') || h.action.includes('IN') || h.action === 'CREATED'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : h.action.includes('REDUCE') || h.action.includes('OUT') || h.action.includes('DAMAGE')
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          : h.action.includes('TRANSFER')
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                        {h.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-medium text-slate-700 dark:text-slate-300 text-xs">
                      {h.desc}
                    </td>
                    <td className="py-3 px-5 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{h.by}</span>
                      {h.role && (
                        <span className="ml-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {h.role}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface InventoryOverviewDashboardProps {
  overviewStats: {
    totalProducts: number;
    totalStockQty: number;
    totalCostValuation: number;
    totalRetailValuation: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    categoryDistribution: Array<{ id: number | string; name: string; count: number; valuation: number; stock: number }>;
    topCapitalProducts: Array<{ product: any; capital: number; retailValue: number; stock: number }>;
    outOfStockProducts: Array<{ product: any; threshold: number; cost: number; price: number }>;
    lowStockProducts: Array<{ product: any; stock: number; threshold: number; deficit: number }>;
    reorderPriorityProducts: Array<{ product: any; stock: number; threshold: number; deficit: number; restockCost: number }>;
    chartData: Array<{ name: string; fullName: string; valuation: number; stock: number; count: number; inStock: number; lowStock: number }>;
  };
  kpis: Array<{ title: string; value: string; icon: any; color: string; bg: string }>;
  getCategoryName: (catId: any) => string;
  setActiveTab: (tab: 'overview' | 'table') => void;
  setStockFilter: (filter: string) => void;
  setSortMode: (mode: any) => void;
  handleOpenPanel: (action: StockActionType, product?: any) => void;
}

function InventoryOverviewDashboard({
  overviewStats,
  kpis,
  getCategoryName,
  setActiveTab,
  setStockFilter,
  setSortMode,
  handleOpenPanel,
}: InventoryOverviewDashboardProps) {
  const [chartMetric, setChartMetric] = useState<'valuation' | 'units'>('valuation');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-10 space-y-6">
      {/* ──────────────── 1. REUSABLE TOP 4 KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <KpiCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            iconColorClass={kpi.color}
            iconBgClass={kpi.bg}
          />
        ))}
      </div>

      {/* ──────────────── 2. MAIN DASHBOARD GRID: CHART (2 Cols) + TOP OUT OF STOCK (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (Category Stock Health & Volume / Valuation) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[380px] justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 flex-shrink-0">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Category Stock Distribution & Health
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {chartMetric === 'valuation' ? 'Valuation comparison by product category (Rs.)' : 'Physical unit counts across categories'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Metric Toggle: Valuation vs Units */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMetric('valuation')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'valuation' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Value (Rs)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('units')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'units' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Units
                </button>
              </div>

              {/* Bar / Line toggle */}
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
              overviewStats.chartData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No category inventory data available to plot.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={overviewStats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(v) => chartMetric === 'valuation' ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`) : `${v}`} 
                      />
                      <Tooltip 
                        formatter={(v: any) => [
                          chartMetric === 'valuation' 
                            ? `Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : `${Number(v).toLocaleString()} units`, 
                          chartMetric === 'valuation' ? 'Valuation' : 'Stock Qty'
                        ]} 
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar 
                        dataKey={chartMetric === 'valuation' ? 'valuation' : 'stock'} 
                        fill={chartMetric === 'valuation' ? '#3B82F6' : '#10B981'} 
                        radius={[6, 6, 0, 0]} 
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={overviewStats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(v) => chartMetric === 'valuation' ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`) : `${v}`} 
                      />
                      <Tooltip 
                        formatter={(v: any) => [
                          chartMetric === 'valuation' 
                            ? `Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : `${Number(v).toLocaleString()} units`, 
                          chartMetric === 'valuation' ? 'Valuation' : 'Stock Qty'
                        ]} 
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={chartMetric === 'valuation' ? 'valuation' : 'stock'} 
                        stroke={chartMetric === 'valuation' ? '#3B82F6' : '#10B981'} 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: chartMetric === 'valuation' ? '#3B82F6' : '#10B981' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading inventory chart...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 font-medium">
            <span>
              {chartMetric === 'valuation' ? 'Total Branch Cost Valuation' : 'Total Physical Units in Stock'}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {chartMetric === 'valuation' 
                ? `Rs. ${overviewStats.totalCostValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `${overviewStats.totalStockQty.toLocaleString()} units`}
            </span>
          </div>
        </div>

        {/* Right: Card 1 - Top Out of Stock Products (Stock = 0) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 pb-5 md:pb-5 w-full text-left flex flex-col h-[380px] justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                Top Out of Stock
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {overviewStats.outOfStockCount} Items Zero
              </span>
            </div>

            <div className="space-y-3">
              {overviewStats.outOfStockProducts.length === 0 ? (
                <div className="py-12 text-center text-emerald-600 dark:text-emerald-400 text-xs font-medium flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <span>No products out of stock! All items available.</span>
                </div>
              ) : (
                overviewStats.outOfStockProducts.map(({ product: p, threshold }, i) => {
                  const catName = getCategoryName(p.categoryId);
                  return (
                    <div 
                      key={p.id || i} 
                      onClick={() => handleOpenPanel('Stock In', p)}
                      className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-950/20 cursor-pointer transition-colors group"
                      title="Click to perform Stock In"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-red-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-red-500 dark:text-red-400 font-semibold truncate flex items-center gap-1.5">
                            <span>0 {p.unit || 'pcs'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400">Min: {threshold}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenPanel('Stock In', p); }}
                        className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold shrink-0 transition-colors shadow-xs"
                      >
                        Restock
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-2 pt-2.5 pb-1 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setStockFilter('out-of-stock');
                setActiveTab('table');
              }}
              className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All {overviewStats.outOfStockCount} Out of Stock Items →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 INVENTORY SPECIFIC RANKINGS / LISTS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 2: Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 pb-5 md:pb-5 w-full text-left flex flex-col h-[380px] justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                Low Stock Alerts
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                {overviewStats.lowStockCount} Items Running Low
              </span>
            </div>

            <div className="space-y-3">
              {overviewStats.lowStockProducts.length === 0 ? (
                <div className="py-12 text-center text-emerald-600 dark:text-emerald-400 text-xs font-medium flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <span>All products have safe stock buffers!</span>
                </div>
              ) : (
                overviewStats.lowStockProducts.map(({ product: p, stock, threshold }, i) => {
                  const ratio = Math.min(100, Math.round((stock / Math.max(1, threshold)) * 100));
                  return (
                    <div 
                      key={p.id || i} 
                      onClick={() => handleOpenPanel('Stock In', p)}
                      className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                      title="Click to manage stock"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold truncate">
                            {stock} / {threshold} {p.unit || 'pcs'} ({ratio}% buffer)
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white flex-shrink-0">
                        Rs. {Number(p.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-2 pt-2.5 pb-1 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setStockFilter('low-stock');
                setActiveTab('table');
              }}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer leading-normal"
            >
              View All {overviewStats.lowStockCount} Low Stock in Table →
            </button>
          </div>
        </div>

        {/* Card 3: Reorder Priority & Replenishment Deficit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 pb-5 md:pb-5 w-full text-left flex flex-col h-[380px] justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                Reorder Priority
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                Replenish Needed
              </span>
            </div>

            <div className="space-y-3">
              {overviewStats.reorderPriorityProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No replenishment orders needed.
                </div>
              ) : (
                overviewStats.reorderPriorityProducts.map(({ product: p, deficit, restockCost }, i) => {
                  return (
                    <div 
                      key={p.id || i} 
                      onClick={() => handleOpenPanel('Stock In', p)}
                      className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                      title="Click to perform Stock In"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold truncate">
                            Need +{deficit} {p.unit || 'pcs'} to reach threshold
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          Rs. {restockCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[9px] text-slate-400">est. cost</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-2 pt-2.5 pb-1 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center">
            <button
              type="button"
              onClick={() => handleOpenPanel('Stock In')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              + Quick Stock In Action →
            </button>
          </div>
        </div>

        {/* Card 4: Top Capital Tied-Up */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 pb-5 md:pb-5 w-full text-left flex flex-col h-[380px] justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                Top Capital Tied-Up
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                Highest Valuation
              </span>
            </div>

            <div className="space-y-3">
              {overviewStats.topCapitalProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No stock valuation data found.
                </div>
              ) : (
                overviewStats.topCapitalProducts.map(({ product: p, capital, stock }, i) => {
                  return (
                    <div 
                      key={p.id || i} 
                      onClick={() => handleOpenPanel('Stock In', p)}
                      className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                      title="Click to manage stock"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {stock} {p.unit || 'units'} in branch
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        Rs. {capital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-2 pt-2.5 pb-1 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setSortMode('value-desc');
                setActiveTab('table');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal"
            >
              View High Valuation in Table →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { getActiveBranch, branches, activeBranchId } = useBranchStore();
  const { user } = useAuthStore();
  const userPlan = user?.tenant?.plan?.toUpperCase() || 'STARTUP';
  const isStartup = userPlan === 'STARTUP' || userPlan === 'FREE';
  const isLocalMode = isTauriEnv() || isStartup;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Filters & Sorting
  const [stockFilter, setStockFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortMode, setSortMode] = useState<'default' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc' | 'value-desc'>('default');

  // Upgrade Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('Supplier Management');

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Slide-out Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAddProductPanelOpen, setIsAddProductPanelOpen] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    action: true,
    quantity: false,
    details: false
  });
  const [validationError, setValidationError] = useState<{ field: string, message: string } | null>(null);

  const triggerValidation = (sectionKey: string, fieldId: string, message: string) => {
    setValidationError({ field: fieldId, message });
    
    if (fieldId === 'product-select-btn') {
      setSecondaryPanel('PRODUCT');
    } else if (fieldId === 'supplier-select-btn') {
      setSecondaryPanel('SUPPLIER');
    }

    const focus = () => {
      setTimeout(() => {
        const el = document.getElementById(fieldId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          if (el.tagName === 'BUTTON' && fieldId !== 'product-select-btn' && fieldId !== 'supplier-select-btn') {
            el.click();
          }
        }
      }, 100);
    };
    
    if (sectionKey && !openSections[sectionKey]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
      setTimeout(focus, 300);
    } else {
      focus();
    }

    setTimeout(() => setValidationError(null), 3000);
  };

  const toggleSection = (section: string) => {
    setSecondaryPanel(null);
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        action: false,
        quantity: false,
        details: false,
        [section]: true
      };
    });
  };
  const [secondaryPanel, setSecondaryPanel] = useState<'PRODUCT' | 'SUPPLIER' | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [stockAction, setStockAction] = useState<StockActionType | ''>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');

  // Stock In Fields
  const [supplierId, setSupplierId] = useState<string>('');
  const [stockInReason, setStockInReason] = useState<string>('');
  const [refNumber, setRefNumber] = useState<string>('');

  // Stock Out Fields
  const [stockOutReason, setStockOutReason] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Stock Transfer Fields
  const [destinationBranchId, setDestinationBranchId] = useState<string>('');
  const [transferNote, setTransferNote] = useState<string>('');

  // Stock Adjustment Fields
  const [actualStock, setActualStock] = useState<string>('');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Damaged / Expired Fields
  const [damageType, setDamageType] = useState<'Damaged' | 'Expired'>('Damaged');
  const [damageReason, setDamageReason] = useState<string>('');

  // Universal Note
  const [note, setNote] = useState<string>('');

  // Confirmation & Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Movement / Ledger Data
  const [movements, setMovements] = useState<any[]>([
    { id: '1', date: new Date().toISOString(), product: 'Nestomalt 400g', type: 'Stock In', qty: 20, before: 45, after: 65, user: 'Admin', reason: 'Purchase (Nestle Lanka PLC)' },
    { id: '2', date: new Date(Date.now() - 86400000).toISOString(), product: 'Sunlight Soap 100g', type: 'Transfer', qty: -10, before: 65, after: 55, user: 'Manager', reason: 'To Kandy Branch' },
    { id: '3', date: new Date(Date.now() - 172800000).toISOString(), product: 'Anchor Full Cream Milk 400g', type: 'Stock Adjustment', qty: -2, before: 20, after: 18, user: 'Admin', reason: 'Counting Error' }
  ]);

  const activeBranch = getActiveBranch();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const currentUser = useAuthStore.getState().user;
      const isLocalMode = isTauriEnv() || currentUser?.tenant?.plan === 'STARTUP' || !currentUser?.tenant?.plan;

      let list: any[] = [];
      if (isLocalMode) {
        list = await getLocalProducts(currentUser?.tenantId || null, currentUser?.branchId || 1);
      } else {
        try {
          const res = await storeOwnerAPI.getProducts();
          list = res.data || res || [];
        } catch (e) {
          list = await getLocalProducts(currentUser?.tenantId || null, currentUser?.branchId || 1).catch(() => []);
        }
      }

      if (Array.isArray(list)) {
        setProducts(list.map((p: any) => ({
          ...p,
          stock: p.stockQuantity !== undefined ? Number(p.stockQuantity) : (p.stock !== undefined ? Number(p.stock) : 0),
          stockQuantity: p.stockQuantity !== undefined ? Number(p.stockQuantity) : (p.stock !== undefined ? Number(p.stock) : 0),
          unit: p.unit || 'pcs',
          cost: Number(p.cost || 0),
          price: Number(p.price || 0)
        })));
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching inventory products:', err);
      const currentUser = useAuthStore.getState().user;
      const localData = await getLocalProducts(currentUser?.tenantId || null, currentUser?.branchId || 1).catch(() => []);
      if (Array.isArray(localData)) {
        setProducts(localData.map((p: any) => ({
          ...p,
          stock: p.stockQuantity !== undefined ? Number(p.stockQuantity) : (p.stock !== undefined ? Number(p.stock) : 0),
          stockQuantity: p.stockQuantity !== undefined ? Number(p.stockQuantity) : (p.stock !== undefined ? Number(p.stock) : 0),
          unit: p.unit || 'pcs',
          cost: Number(p.cost || 0),
          price: Number(p.price || 0)
        })));
      } else {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const currentUser = useAuthStore.getState().user;
      const isLocalMode = isTauriEnv() || currentUser?.tenant?.plan === 'STARTUP' || !currentUser?.tenant?.plan;
      if (isLocalMode) {
        const localCats = await getLocalCategories(currentUser?.tenantId || null);
        setCategories(localCats);
      } else {
        try {
          const res = await storeOwnerAPI.getCategories();
          setCategories(res.data || res || []);
        } catch {
          const localCats = await getLocalCategories(currentUser?.tenantId || null);
          setCategories(localCats);
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await storeOwnerAPI.getSuppliers();
      const list = res.data || res;
      if (Array.isArray(list) && list.length > 0) {
        setSuppliers(list);
      } else {
        setSuppliers(FALLBACK_SUPPLIERS);
      }
    } catch (err) {
      setSuppliers(FALLBACK_SUPPLIERS);
    }
  };

  const getCategoryName = (catId: any) => {
    if (!catId || catId === 'null') return 'General';
    for (const c of categories) {
      if (String(c.id) === String(catId)) return c.name;
      if (c.children) {
        for (const sc of c.children) {
          if (String(sc.id) === String(catId)) return `${c.name} > ${sc.name}`;
        }
      }
    }
    return 'General';
  };

  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    products.forEach(p => {
      if (p.unit && typeof p.unit === 'string' && p.unit.trim()) {
        units.add(p.unit.trim().toLowerCase());
      }
    });
    return Array.from(units);
  }, [products]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (stockFilter !== 'all') count++;
    if (unitFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (sortMode !== 'default') count++;
    return count;
  }, [stockFilter, unitFilter, categoryFilter, sortMode]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Search query
      const searchLower = search.toLowerCase();
      const matchesSearch = !search || 
        (p.name && p.name.toLowerCase().includes(searchLower)) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchLower)) ||
        (p.sku && p.sku.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Stock status filter
      const stockVal = Number(p.stock ?? p.stockQuantity ?? 0);
      const minVal = Number(p.minStock ?? p.lowStockLevel ?? 10);
      if (stockFilter === 'instock' && stockVal <= 0) return false;
      if (stockFilter === 'lowstock' && (stockVal <= 0 || stockVal > minVal)) return false;
      if (stockFilter === 'outofstock' && stockVal > 0) return false;

      // Unit filter
      if (unitFilter !== 'all' && (p.unit || '').toLowerCase() !== unitFilter.toLowerCase()) return false;

      // Category filter
      if (categoryFilter !== 'all') {
        const catIdStr = String(p.categoryId);
        if (catIdStr !== categoryFilter) return false;
      }

      return true;
    });

    // Sorting
    if (sortMode === 'price-asc') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortMode === 'price-desc') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortMode === 'stock-asc') {
      result.sort((a, b) => Number(a.stock ?? a.stockQuantity ?? 0) - Number(b.stock ?? b.stockQuantity ?? 0));
    } else if (sortMode === 'stock-desc') {
      result.sort((a, b) => Number(b.stock ?? b.stockQuantity ?? 0) - Number(a.stock ?? a.stockQuantity ?? 0));
    } else if (sortMode === 'value-desc') {
      result.sort((a, b) => {
        const valA = Number(a.cost || 0) * Number(a.stock ?? a.stockQuantity ?? 0);
        const valB = Number(b.cost || 0) * Number(b.stock ?? b.stockQuantity ?? 0);
        return valB - valA;
      });
    }

    return result;
  }, [products, search, stockFilter, unitFilter, categoryFilter, sortMode]);

  const kpis = useMemo(() => {
    const totalItems = products.length;
    const totalStockValue = products.reduce((sum, p) => sum + (Number(p.cost || 0) * Number(p.stock ?? p.stockQuantity ?? 0)), 0);
    const lowStockItems = products.filter(p => Number(p.stock ?? p.stockQuantity ?? 0) <= Number(p.minStock ?? p.lowStockLevel ?? 10) && Number(p.stock ?? p.stockQuantity ?? 0) > 0).length;
    const outOfStockItems = products.filter(p => Number(p.stock ?? p.stockQuantity ?? 0) <= 0).length;

    return [
      { 
        title: 'Total Stock Value', 
        value: `Rs. ${totalStockValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
        icon: DollarSign, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50 dark:bg-emerald-500/10' 
      },
      { 
        title: 'Total Products', 
        value: totalItems.toString(), 
        icon: Layers, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-500/10' 
      },
      { 
        title: 'Low Stock Alerts', 
        value: lowStockItems.toString(), 
        icon: AlertCircle, 
        color: 'text-amber-500', 
        bg: 'bg-amber-50 dark:bg-amber-500/10' 
      },
      { 
        title: 'Out of Stock', 
        value: outOfStockItems.toString(), 
        icon: SearchX, 
        color: 'text-red-500', 
        bg: 'bg-red-50 dark:bg-red-500/10' 
      }
    ];
  }, [products]);

  const overviewStats = useMemo(() => {
    let totalStockQty = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const catMap = new Map<number | string, { id: number | string; name: string; count: number; valuation: number; stock: number }>();
    const productsWithCapital: Array<{ product: any; capital: number; retailValue: number; marginPercent: number }> = [];

    products.forEach((p) => {
      const stock = Number(p.stock ?? p.stockQuantity ?? 0);
      const cost = Number(p.cost || 0);
      const price = Number(p.price || 0);
      const threshold = Number(p.minStock ?? p.lowStockLevel ?? 10);

      totalStockQty += stock;
      const itemCostVal = cost * stock;
      const itemRetailVal = price * stock;
      totalCostValuation += itemCostVal;
      totalRetailValuation += itemRetailVal;

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= threshold) {
        lowStockCount++;
      } else {
        inStockCount++;
      }

      // Category breakdown
      const catId = p.categoryId || 'uncategorized';
      const catName = getCategoryName(p.categoryId) || 'Uncategorized';

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

    const topCapitalProducts = [...productsWithCapital]
      .sort((a, b) => b.capital - a.capital)
      .slice(0, 5)
      .map(item => ({
        product: item.product,
        capital: item.capital,
        retailValue: item.retailValue,
        stock: Number(item.product.stock ?? item.product.stockQuantity ?? 0)
      }));

    // 1. Out of Stock: stock <= 0
    const outOfStockProducts = products
      .filter(p => Number(p.stock ?? p.stockQuantity ?? 0) <= 0)
      .map(p => ({
        product: p,
        threshold: Number(p.minStock ?? p.lowStockLevel ?? 10),
        cost: Number(p.cost || 0),
        price: Number(p.price || 0)
      }))
      .slice(0, 5);

    // 2. Low Stock: stock > 0 && stock <= threshold
    const lowStockProducts = products
      .filter(p => {
        const s = Number(p.stock ?? p.stockQuantity ?? 0);
        const th = Number(p.minStock ?? p.lowStockLevel ?? 10);
        return s > 0 && s <= th;
      })
      .map(p => {
        const s = Number(p.stock ?? p.stockQuantity ?? 0);
        const th = Number(p.minStock ?? p.lowStockLevel ?? 10);
        return {
          product: p,
          stock: s,
          threshold: th,
          deficit: Math.max(0, th - s)
        };
      })
      .sort((a, b) => (a.stock / Math.max(1, a.threshold)) - (b.stock / Math.max(1, b.threshold)))
      .slice(0, 5);

    // 3. Reorder Priority: biggest replenishment gap
    const reorderPriorityProducts = products
      .filter(p => {
        const s = Number(p.stock ?? p.stockQuantity ?? 0);
        const th = Number(p.minStock ?? p.lowStockLevel ?? 10);
        return s <= th;
      })
      .map(p => {
        const s = Number(p.stock ?? p.stockQuantity ?? 0);
        const th = Number(p.minStock ?? p.lowStockLevel ?? 10);
        const cost = Number(p.cost || 0);
        const deficit = Math.max(1, th - s);
        return {
          product: p,
          stock: s,
          threshold: th,
          deficit,
          restockCost: deficit * cost
        };
      })
      .sort((a, b) => b.deficit - a.deficit || b.restockCost - a.restockCost)
      .slice(0, 5);

    const chartData = categoryDistribution.slice(0, 8).map(c => {
      const catProds = products.filter(p => (p.categoryId || 'uncategorized') === c.id);
      const inStock = catProds.filter(p => Number(p.stock ?? p.stockQuantity ?? 0) > Number(p.minStock ?? p.lowStockLevel ?? 10)).length;
      const lowStock = catProds.length - inStock;
      return {
        name: c.name.length > 14 ? c.name.slice(0, 14) + '...' : c.name,
        fullName: c.name,
        valuation: c.valuation,
        stock: c.stock,
        count: c.count,
        inStock,
        lowStock,
      };
    });

    return {
      totalProducts: products.length,
      totalStockQty,
      totalCostValuation,
      totalRetailValuation,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      categoryDistribution,
      topCapitalProducts,
      outOfStockProducts,
      lowStockProducts,
      reorderPriorityProducts,
      chartData,
    };
  }, [products, categories]);

  // Selected product object in panel
  const selectedProduct = useMemo(() => {
    return products.find(p => String(p.id) === String(selectedProductId)) || null;
  }, [products, selectedProductId]);

  // Product options formatted for CustomSelect
  const productSelectOptions = useMemo(() => {
    return products.map(p => ({
      value: String(p.id),
      label: `${p.name} • Stock: ${p.stock ?? p.stockQuantity ?? 0} ${p.unit || 'pcs'} ${p.barcode ? `(${p.barcode})` : ''}`
    }));
  }, [products]);

  // Supplier options formatted for CustomSelect
  const supplierSelectOptions = useMemo(() => {
    return suppliers.map(s => ({
      value: String(s.id),
      label: s.name
    }));
  }, [suppliers]);

  // Selected supplier object
  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => String(s.id) === String(supplierId)) || null;
  }, [suppliers, supplierId]);

  // Filtered lists for secondary side-panel selection
  const filteredProductsForPanel = useMemo(() => {
    return products.filter(p => 
      (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(productSearch.toLowerCase()))
    );
  }, [products, productSearch]);

  const filteredSuppliersForPanel = useMemo(() => {
    return suppliers.filter(s => 
      (s.name || '').toLowerCase().includes(supplierSearch.toLowerCase()) ||
      (s.phone || '').includes(supplierSearch) ||
      (s.contactPerson || '').toLowerCase().includes(supplierSearch.toLowerCase())
    );
  }, [suppliers, supplierSearch]);

  // Available destination branches for transfer (excludes active branch)
  const availableBranches = useMemo(() => {
    const list = branches.filter((b: any) => String(b.id) !== String(activeBranchId));
    if (list.length > 0) return list;
    return [
      { id: 'br-kandy', name: 'Kandy City Branch' },
      { id: 'br-galle', name: 'Galle Fort Branch' },
      { id: 'br-kurunegala', name: 'Kurunegala Branch' }
    ];
  }, [branches, activeBranchId]);

  const branchSelectOptions = useMemo(() => {
    return availableBranches.map((b: any) => ({
      value: String(b.id),
      label: b.name
    }));
  }, [availableBranches]);

  // Current stock and auto-calculated adjustment for Stock Adjustment
  const currentProductStock = selectedProduct ? Number(selectedProduct.stock ?? selectedProduct.stockQuantity ?? 0) : 0;
  const currentProductUnit = selectedProduct ? getShortUnit(selectedProduct.unit || 'pcs') : '';
  const calculatedAdjustment = actualStock === '' ? 0 : Number(actualStock) - currentProductStock;

  // Plan-gated Stock Action Options (Stock Transfer locked on Startup plan)
  const stockActionOptions = useMemo(() => {
    return [
      { label: 'Stock In', value: 'Stock In' as StockActionType },
      { label: 'Stock Out', value: 'Stock Out' as StockActionType },
      { 
        label: 'Stock Transfer', 
        value: 'Stock Transfer' as StockActionType,
        locked: isStartup,
        onLockedClick: () => {
          setUpgradeFeature('Multi-Branch Stock Transfer');
          setUpgradeModalOpen(true);
        }
      },
      { label: 'Stock Adjustment', value: 'Stock Adjustment' as StockActionType },
      { label: 'Damaged / Expired', value: 'Damaged / Expired' as StockActionType },
    ];
  }, [isStartup]);

  // Check if form has unsaved modifications
  const isFormDirty = Boolean(
    selectedProductId !== '' ||
    quantity !== '' ||
    actualStock !== '' ||
    supplierId !== '' ||
    refNumber !== '' ||
    note !== '' ||
    destinationBranchId !== ''
  );

  const handleOpenPanel = (action: StockActionType | '' = '', product?: any) => {
    if (action === 'Stock Transfer' && isStartup) {
      setUpgradeFeature('Multi-Branch Stock Transfer');
      setUpgradeModalOpen(true);
      return;
    }
    if (product) {
      setStockAction(action);
      setSelectedProductId(String(product.id));
      setActualStock(String(product.stock ?? product.stockQuantity ?? 0));
      setQuantity('');
      setSupplierId('');
      setRefNumber('');
      setStockInReason('');
      setStockOutReason('');
      setReason('');
      setDestinationBranchId('');
      setTransferNote('');
      setAdjustmentReason('');
      setDamageType('Damaged');
      setDamageReason('');
      setNote('');
    } else if (action) {
      setStockAction(action);
    } else {
      // Restore draft if present
      try {
        const saved = localStorage.getItem('draft_inventory_form');
        if (saved) {
          const d = JSON.parse(saved);
          if (d.stockAction !== undefined) setStockAction(d.stockAction);
          if (d.selectedProductId !== undefined) setSelectedProductId(d.selectedProductId);
          if (d.quantity !== undefined) setQuantity(d.quantity);
          if (d.supplierId !== undefined) setSupplierId(d.supplierId);
          if (d.refNumber !== undefined) setRefNumber(d.refNumber);
          if (d.stockInReason !== undefined) setStockInReason(d.stockInReason);
          if (d.stockOutReason !== undefined) setStockOutReason(d.stockOutReason);
          if (d.reason !== undefined) setReason(d.reason);
          if (d.destinationBranchId !== undefined) setDestinationBranchId(d.destinationBranchId);
          if (d.transferNote !== undefined) setTransferNote(d.transferNote);
          if (d.actualStock !== undefined) setActualStock(d.actualStock);
          if (d.adjustmentReason !== undefined) setAdjustmentReason(d.adjustmentReason);
          if (d.damageType !== undefined) setDamageType(d.damageType);
          if (d.damageReason !== undefined) setDamageReason(d.damageReason);
          if (d.note !== undefined) setNote(d.note);
        }
      } catch (e) {}
    }
    setSecondaryPanel(null);
    setProductSearch('');
    setSupplierSearch('');
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_inventory_form');
    } catch (e) {}
    resetForm();
    setIsPanelOpen(false);
  };

  // Auto-save draft when dirty inputs exist
  useEffect(() => {
    if (!isPanelOpen || !isFormDirty) return;
    try {
      const draft = {
        stockAction,
        selectedProductId,
        quantity,
        supplierId,
        refNumber,
        stockInReason,
        stockOutReason,
        reason,
        destinationBranchId,
        transferNote,
        actualStock,
        adjustmentReason,
        damageType,
        damageReason,
        note
      };
      localStorage.setItem('draft_inventory_form', JSON.stringify(draft));
    } catch (e) {}
  }, [
    stockAction, selectedProductId, quantity, supplierId, refNumber,
    stockInReason, stockOutReason, reason, destinationBranchId, transferNote,
    actualStock, adjustmentReason, damageType, damageReason, note,
    isPanelOpen, isFormDirty
  ]);

  const resetForm = () => {
    try {
      localStorage.removeItem('draft_inventory_form');
    } catch (e) {}
    setStockAction('');
    setSelectedProductId('');
    setQuantity('');
    setSupplierId('');
    setRefNumber('');
    setStockInReason('');
    setStockOutReason('');
    setReason('');
    setDestinationBranchId('');
    setTransferNote('');
    setActualStock('');
    setAdjustmentReason('');
    setDamageType('Damaged');
    setDamageReason('');
    setNote('');
    setSecondaryPanel(null);
    setProductSearch('');
    setSupplierSearch('');
  };

  const handleSaveStock = async () => {
    if (!stockAction) {
      triggerValidation('action', 'action-select', 'Please select an action.');
      return;
    }
    
    if (!selectedProductId) {
      triggerValidation('action', 'product-select-btn', 'Please select a product.');
      return;
    }

    const prod = products.find(p => String(p.id) === String(selectedProductId));
    if (!prod) {
      toast.error('Selected product not found');
      return;
    }

    const currentStock = Number(prod.stock ?? prod.stockQuantity ?? 0);
    const unit = prod.unit || 'pcs';

    // 1. Stock Adjustment Action
    if (stockAction === 'Stock Adjustment') {
      if (!adjustmentReason) {
        triggerValidation('details', 'adjustment-reason-select', 'Please select a reason.');
        return;
      }
      if (actualStock.trim() === '' || isNaN(Number(actualStock))) {
        triggerValidation('quantity', 'actual-stock-input', 'Please fill in this field.');
        return;
      }
      const actual = Number(actualStock);
      if (actual < 0) {
        toast.error('Actual stock count cannot be negative');
        return;
      }
      const diff = actual - currentStock;
      if (diff === 0) {
        toast.info('No stock adjustment needed: Actual stock matches current stock');
        return;
      }

      setIsSubmitting(true);
      try {
        const newStock = actual;
        setProducts(prev => prev.map(p => String(p.id) === String(prod.id) ? { ...p, stock: newStock, stockQuantity: newStock } : p));
        
        const newMovement = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          product: prod.name,
          type: 'Stock Adjustment',
          qty: diff,
          before: currentStock,
          after: newStock,
          user: 'Store Owner',
          reason: `${adjustmentReason}${note ? ` - ${note}` : ''}`
        };
        setMovements(prev => [newMovement, ...prev]);


        await updateStockLocally(
          prod.id,
          newStock,
          diff > 0 ? 'STOCK_ADD' : 'STOCK_REDUCE',
          `Stock Adjustment: ${diff > 0 ? `+${diff}` : diff} ${unit} (${adjustmentReason})${note ? ` - ${note}` : ''}`,
          user?.tenantId || null,
          user?.branchId || 1
        ).catch(console.error);

        toast.success(`Stock adjusted for ${prod.name}: ${diff > 0 ? `+${diff}` : diff} ${unit}`);
        setIsPanelOpen(false);
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Quantity validation for other actions
    const qty = Number(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      triggerValidation('quantity', 'quantity-input', 'Please fill in this field.');
      return;
    }

    // 3. Stock In Action
    if (stockAction === 'Stock In') {
      if (!stockInReason) {
        triggerValidation('details', 'stock-in-reason-select', 'Please select a reason.');
        return;
      }
      if (!isStartup && !supplierId) {
        triggerValidation('details', 'supplier-select-btn', 'Please select a supplier.');
        return;
      }
      const supplierObj = suppliers.find(s => String(s.id) === String(supplierId));
      setIsSubmitting(true);
      try {
        const newStock = currentStock + qty;
        setProducts(prev => prev.map(p => String(p.id) === String(prod.id) ? { ...p, stock: newStock, stockQuantity: newStock } : p));
        
        const newMovement = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          product: prod.name,
          type: 'Stock In',
          qty: qty,
          before: currentStock,
          after: newStock,
          user: 'Store Owner',
          reason: `${stockInReason}${supplierObj ? ` (${supplierObj.name})` : ''}${refNumber ? ` Ref: ${refNumber}` : ''}${note ? ` - ${note}` : ''}`
        };
        setMovements(prev => [newMovement, ...prev]);

        await updateStockLocally(
          prod.id,
          newStock,
          'STOCK_ADD',
          `Stock In: +${qty} ${unit} (${stockInReason}${supplierObj ? ` from ${supplierObj.name}` : ''}${refNumber ? ` Ref: ${refNumber}` : ''})${note ? ` - ${note}` : ''}`,
          user?.tenantId || null,
          user?.branchId || 1
        ).catch(console.error);

        toast.success(`Successfully added ${qty} ${unit} to ${prod.name}`);
        setIsPanelOpen(false);
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 4. Stock Out Action
    if (stockAction === 'Stock Out') {
      if (!stockOutReason) {
        triggerValidation('details', 'stock-out-reason-select', 'Please select a reason.');
        return;
      }
      if (qty > currentStock) {
        toast.error(`Quantity exceeds current stock (${currentStock} ${unit})`);
        return;
      }
      setIsSubmitting(true);
      try {
        const newStock = Math.max(0, currentStock - qty);
        setProducts(prev => prev.map(p => String(p.id) === String(prod.id) ? { ...p, stock: newStock, stockQuantity: newStock } : p));
        
        const newMovement = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          product: prod.name,
          type: 'Stock Out',
          qty: -qty,
          before: currentStock,
          after: newStock,
          user: 'Store Owner',
          reason: `${stockOutReason}${refNumber ? ` Ref: ${refNumber}` : ''}${note ? ` - ${note}` : ''}`
        };
        setMovements(prev => [newMovement, ...prev]);

        await updateStockLocally(
          prod.id,
          newStock,
          'STOCK_REDUCE',
          `Stock Out: -${qty} ${unit} (${stockOutReason}${refNumber ? ` Ref: ${refNumber}` : ''})${note ? ` - ${note}` : ''}`,
          user?.tenantId || null,
          user?.branchId || 1
        ).catch(console.error);

        toast.success(`Successfully removed ${qty} ${unit} from ${prod.name}`);
        setIsPanelOpen(false);
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 5. Stock Transfer Action
    if (stockAction === 'Stock Transfer') {
      if (!destinationBranchId) {
        toast.error('Please select a destination branch');
        return;
      }
      if (qty > currentStock) {
        toast.error(`Transfer quantity exceeds available stock (${currentStock} ${unit})`);
        return;
      }
      const destBranch = availableBranches.find((b: any) => String(b.id) === String(destinationBranchId));
      setIsSubmitting(true);
      try {
        const newStock = Math.max(0, currentStock - qty);
        setProducts(prev => prev.map(p => String(p.id) === String(prod.id) ? { ...p, stock: newStock, stockQuantity: newStock } : p));
        
        const newMovement = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          product: prod.name,
          type: 'Transfer',
          qty: -qty,
          before: currentStock,
          after: newStock,
          user: 'Store Owner',
          reason: `Transfer to ${destBranch?.name || 'Destination Branch'}${transferNote || note ? ` - ${transferNote || note}` : ''}`
        };
        setMovements(prev => [newMovement, ...prev]);


        await updateStockLocally(
          prod.id,
          newStock,
          'TRANSFER',
          `Transfer: -${qty} ${unit} to ${destBranch?.name || 'Destination Branch'}${transferNote || note ? ` - ${transferNote || note}` : ''}`,
          user?.tenantId || null,
          user?.branchId || 1
        ).catch(console.error);

        toast.success(`Transfer of ${qty} ${unit} to ${destBranch?.name} created successfully!`);
        setIsPanelOpen(false);
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 6. Damaged / Expired Action
    if (stockAction === 'Damaged / Expired') {
      if (!damageReason) {
        triggerValidation('details', 'damage-reason-select', 'Please select a reason.');
        return;
      }
      if (qty > currentStock) {
        toast.error(`Quantity exceeds available stock (${currentStock} ${unit})`);
        return;
      }
      setIsSubmitting(true);
      try {
        const newStock = Math.max(0, currentStock - qty);
        setProducts(prev => prev.map(p => String(p.id) === String(prod.id) ? { ...p, stock: newStock, stockQuantity: newStock } : p));
        
        const newMovement = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          product: prod.name,
          type: damageType === 'Damaged' ? 'Damaged Stock' : 'Expired Stock',
          qty: -qty,
          before: currentStock,
          after: newStock,
          user: 'Store Owner',
          reason: `${damageType}: ${damageReason}${note ? ` - ${note}` : ''}`
        };
        setMovements(prev => [newMovement, ...prev]);

        await updateStockLocally(
          prod.id,
          newStock,
          'STOCK_REDUCE',
          `${damageType}: -${qty} ${unit} (${damageReason})${note ? ` - ${note}` : ''}`,
          user?.tenantId || null,
          user?.branchId || 1
        ).catch(console.error);

        toast.success(`${damageType} stock (${qty} ${unit}) recorded for ${prod.name}`);
        setIsPanelOpen(false);
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  return (
    <div className={`flex flex-col bg-[#F4F7F6] dark:bg-slate-900 ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6 lg:p-8'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Warehouse className="w-8 h-8 text-blue-600" />
              Branch Inventory
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage stock, pricing, and transfers per branch.</p>
          </div>
          
          <button 
            onClick={() => handleOpenPanel('Stock In')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Manage Stock
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Inventory Overview | Inventory Table) */}
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
            Inventory Overview
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button 
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm ${
              activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Inventory Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search products in branch..."
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Filter Button */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center px-4 h-full rounded-xl transition-all gap-2 font-bold relative cursor-pointer ${
              activeFilterCount > 0 
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Filter"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline text-xs">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          
          {/* List View Toggle */}
          <button 
            onClick={() => {
              setActiveTab('table');
              setViewMode('list');
            }}
            title="List View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          
          {/* Grid View Toggle */}
          <button 
            onClick={() => {
              setActiveTab('table');
              setViewMode('grid');
            }}
            title="Grid View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' && activeTab === 'table'
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
            className="flex items-center justify-center w-12 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ──────────────── TAB CONTENT: OVERVIEW OR TABLE ──────────────── */}
      {activeTab === 'overview' ? (
        <InventoryOverviewDashboard
          overviewStats={overviewStats}
          kpis={kpis}
          getCategoryName={getCategoryName}
          setActiveTab={setActiveTab}
          setStockFilter={setStockFilter}
          setSortMode={setSortMode}
          handleOpenPanel={handleOpenPanel}
        />
      ) : (
        /* ──────────────── INVENTORY VIEW: LIST OR GRID ──────────────── */
        loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[400px]">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <TableEmptyState
                icon={Package}
                title="No inventory products found"
                description="No products found in inventory matching your filters. Click below to record stock movements or adjustments."
                actionLabel="Record Stock Movement"
                onAction={() => handleOpenPanel('Stock In')}
              />
            </div>
          ) : viewMode === 'list' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="flex-1 overflow-x-auto">
                <div className="min-w-max h-full flex flex-col">
                  <div className="grid grid-cols-[300px_120px_100px_120px_120px_120px_120px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                    <div>Product</div>
                    <div className="text-right">Available</div>
                    <div className="text-right">Reserved</div>
                    <div className="text-right">Reorder Lvl</div>
                    <div className="text-right">Cost (Rs)</div>
                    <div className="text-right">Selling (Rs)</div>
                    <div className="text-center">Status</div>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {filteredProducts.map(p => {
                        const stockVal = Number(p.stock ?? p.stockQuantity ?? 0);
                        const minVal = Number(p.minStock ?? p.lowStockLevel ?? 10);
                        const isExpanded = expandedRowId === p.id;
                        const pImg = p.images?.[0]?.url || (typeof p.images?.[0] === 'string' ? p.images[0] : null);

                        return (
                          <div 
                            key={p.id} 
                            id={`inventory-row-${p.id}`}
                            className="border-b border-slate-100 dark:border-slate-800/60 flex flex-col group scroll-mt-20"
                          >
                            <div 
                              onClick={() => setExpandedRowId(prev => prev === p.id ? null : p.id)}
                              className="grid grid-cols-[300px_120px_100px_120px_120px_120px_120px] gap-4 p-5 items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                                  {pImg ? (
                                    <img src={pImg} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex flex-col">
                                  <span className="font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
                                  <span className="text-xs text-slate-500 truncate">{p.barcode || p.sku || 'No identifier'}</span>
                                </div>
                              </div>
                              <div className="text-right font-black text-slate-900 dark:text-white text-lg">
                                {stockVal} <span className="text-xs font-semibold text-slate-400 uppercase">{p.unit || 'pcs'}</span>
                              </div>
                              <div className="text-right font-medium text-slate-500">
                                0
                              </div>
                              <div className="text-right font-medium text-amber-600">
                                {minVal}
                              </div>
                              <div className="text-right font-semibold text-slate-600 dark:text-slate-400">
                                {Number(p.cost || 0).toFixed(2)}
                              </div>
                              <div className="text-right font-bold text-slate-900 dark:text-white">
                                {Number(p.price || 0).toFixed(2)}
                              </div>
                              <div className="flex justify-center items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                                  stockVal <= 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                                  stockVal <= minVal ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                                  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                }`}>
                                  {stockVal <= 0 ? 'Out of Stock' : stockVal <= minVal ? 'Low Stock' : 'In Stock'}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <InventoryProductDetailView
                                    product={p}
                                    categoryName={getCategoryName(p.categoryId)}
                                    branchName={activeBranch?.name}
                                    onClose={() => setExpandedRowId(null)}
                                    onManageStock={(prod) => handleOpenPanel('Stock In', prod)}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ──────────────── INVENTORY GRID VIEW ──────────────── */
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 xl:gap-6">
                {filteredProducts.map(p => {
                    const stockVal = Number(p.stock ?? p.stockQuantity ?? 0);
                    const minVal = Number(p.minStock ?? p.lowStockLevel ?? 10);
                    const catName = getCategoryName(p.categoryId);
                    const pImg = p.images?.[0]?.url || (typeof p.images?.[0] === 'string' ? p.images[0] : null);

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setViewMode('list');
                          setExpandedRowId(p.id);
                          setTimeout(() => {
                            const el = document.getElementById(`inventory-row-${p.id}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        title="Click to view full details in List View"
                        className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col"
                      >
                        {/* Card Image */}
                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                          {pImg ? (
                            <img src={pImg} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <Package className="w-8 h-8 opacity-40 text-slate-400" />
                          )}
                          
                          {/* Hover overlay with Manage Stock */}
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPanel('Stock In', p);
                              }}
                              className="px-3 py-1.5 bg-white text-slate-900 rounded-full hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors shadow-lg translate-y-2 group-hover:translate-y-0 duration-300 flex items-center gap-1.5 cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" /> Manage Stock
                            </button>
                          </div>

                          {/* Stock Badge */}
                          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs backdrop-blur-md ${
                              stockVal <= 0 ? 'bg-red-500 text-white' :
                              stockVal <= minVal ? 'bg-orange-500 text-white' :
                              'bg-emerald-500 text-white'
                            }`}>
                              {stockVal} {p.unit || 'pcs'}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1 mb-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{catName}</p>
                              {p.brand && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-1.5 py-0.5 rounded truncate max-w-[70px]">
                                  {p.brand}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2 mb-1.5" title={p.name}>
                              {p.name}
                            </h3>

                            <div className="flex flex-col gap-0.5 text-[10px] text-slate-400">
                              {p.sku && <span className="truncate">SKU: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{p.sku}</strong></span>}
                              {p.barcode && <span className="truncate font-mono">Barcode: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{p.barcode}</strong></span>}
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Selling</span>
                              <span className="font-black text-blue-600 dark:text-blue-400 text-sm">Rs. {Number(p.price || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cost</span>
                              <span className="font-semibold text-slate-600 dark:text-slate-400 text-xs">Rs. {Number(p.cost || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1 border-t border-slate-50 dark:border-slate-800/50">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Valuation</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                Rs. {(stockVal * Number(p.cost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

      {/* ──────────────── MANAGE STOCK RIGHT SLIDE-OUT PANEL ──────────────── */}
      <MainRightPanel
        isOpen={isPanelOpen}
        onClose={() => {
              if (secondaryPanel) {
                setSecondaryPanel(null);
              } else {
                handleClosePanel();
              }
            }}
        onDiscard={handleDiscardChanges}
        title="Manage Stock"
        subtitle="Record stock movements and transfers"
        icon={Warehouse}
        isSubmitting={isSubmitting}
        saveText={stockAction === 'Stock Transfer' ? 'Create Transfer' : 'Save'}
        onSave={handleSaveStock}
          >
              <div className="font-sans space-y-6">
                
                {/* 1. ACTION & PRODUCT SELECTION */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">
                  <button 
                    type="button" 
                    onClick={() => toggleSection('action')}
                    className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.action ? 'rounded-t-xl' : 'rounded-xl'}`}
                  >
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-blue-600" />
                      Action & Product Selection
                    </span>
                    {openSections.action ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {openSections.action && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                      >
                        <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                          {/* Stock Action Dropdown */}
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">
                              Stock Action <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <CustomSelect
                                id="action-select"
                                value={isStartup && stockAction === 'Stock Transfer' ? 'Stock In' : stockAction}
                                onChange={(val) => setStockAction(val as StockActionType)}
                                options={stockActionOptions}
                                searchable={false}
                                label="Select"
                              />
                              <ValidationErrorTooltip error={validationError} fieldId="action-select" />
                            </div>
                          </div>

                          {/* Product Selection Button */}
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              Product <span className="text-red-500">*</span>
                            </label>
                            
                            <div className="relative">
                              <button
                                id="product-select-btn"
                                type="button"
                                onClick={() => {
                                  setSecondaryPanel(prev => prev === 'PRODUCT' ? null : 'PRODUCT');
                                  setProductSearch('');
                                }}
                                className={`w-full flex items-center justify-between px-4 h-11 bg-slate-100 dark:bg-slate-900 border rounded-xl font-medium text-sm transition-all text-left ${
                                  selectedProduct 
                                    ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-900/10 text-slate-900 dark:text-white' 
                                    : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                                }`}
                              >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <Package className="w-4 h-4 text-blue-600 shrink-0" />
                                <span className="truncate">
                                  {selectedProduct ? selectedProduct.name : 'Select Product...'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {selectedProduct && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                    1 Selected
                                  </span>
                                )}
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${secondaryPanel === 'PRODUCT' ? 'rotate-180' : ''}`} />
                              </div>
                              </button>
                              <ValidationErrorTooltip error={validationError} fieldId="product-select-btn" />
                            </div>

                            {/* Selected Product Card */}
                            {selectedProduct && (
                              <div className="p-3 mt-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                    {selectedProduct.images?.[0]?.url || selectedProduct.image ? (
                                      <img src={selectedProduct.images?.[0]?.url || selectedProduct.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                      <Package className="w-5 h-5 text-blue-500" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{selectedProduct.name}</h4>
                                    <p className="text-xs text-slate-500 truncate">SKU: {selectedProduct.barcode || 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 pl-2">
                                  <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Stock</div>
                                    <div className="text-sm font-black text-slate-900 dark:text-white">
                                      {currentProductStock} <span className="text-xs font-semibold text-slate-500">{currentProductUnit}</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProductId('');
                                      if (stockAction === 'Stock Adjustment') setActualStock('');
                                    }}
                                    className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
                                    title="Remove product"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. QUANTITY & ADJUSTMENTS */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">
                  <button 
                    type="button" 
                    onClick={() => toggleSection('quantity')}
                    className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.quantity ? 'rounded-t-xl' : 'rounded-xl'}`}
                  >
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Stock Quantities & Adjustments
                    </span>
                    {openSections.quantity ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {openSections.quantity && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                      >
                        <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                          {stockAction !== 'Stock Adjustment' ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Quantity <span className="text-red-500">*</span>
                                </label>
                                {selectedProduct ? (
                                  <span className="text-xs font-medium text-slate-500">
                                    Unit: <span className="font-bold text-slate-700 dark:text-slate-300">{currentProductUnit}</span>
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-slate-400">
                                    Unit: <span className="italic">Select a product</span>
                                  </span>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  id="quantity-input"
                                  type="number"
                                  min="1"
                                  placeholder="Enter quantity"
                                  value={quantity}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || Number(val) >= 0) {
                                      setQuantity(val);
                                    }
                                  }}
                                  className="w-full pl-4 pr-16 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                                />
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold uppercase tracking-wider">
                                  {selectedProduct ? currentProductUnit : 'Unit'}
                                </div>
                                <ValidationErrorTooltip error={validationError} fieldId="quantity-input" />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Stock</label>
                                  <div className="h-11 px-4 bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-between">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct ? currentProductStock : '-'}</span>
                                    <span className="text-xs font-semibold text-slate-500">{currentProductUnit}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Actual Stock <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative">
                                    <input
                                      id="actual-stock-input"
                                      type="number"
                                      min="0"
                                      placeholder="Enter count"
                                      value={actualStock}
                                      onChange={(e) => setActualStock(e.target.value)}
                                      className="w-full pl-4 pr-16 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                                    />
                                    <ValidationErrorTooltip error={validationError} fieldId="actual-stock-input" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                      {selectedProduct ? currentProductUnit : 'Unit'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Auto-calculated Adjustment badge */}
                              <div className="p-3.5 rounded-xl border flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
                                <div>
                                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Adjustment (Calculated)</span>
                                  <p className="text-xs text-slate-400 mt-0.5">Actual Stock - Current Stock</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg font-black text-sm flex items-center gap-1.5 ${
                                  calculatedAdjustment > 0 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                                  calculatedAdjustment < 0 ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                                  'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                  {calculatedAdjustment > 0 ? `+${calculatedAdjustment}` : calculatedAdjustment} {currentProductUnit}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. TRANSACTION DETAILS & NOTES */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">
                  <button 
                    type="button" 
                    onClick={() => toggleSection('details')}
                    className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.details ? 'rounded-t-xl' : 'rounded-xl'}`}
                  >
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Transaction Details & Notes
                    </span>
                    {openSections.details ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {openSections.details && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                      >
                        <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                          {/* 🟢 STOCK IN SPECIFIC FIELDS */}
                          {stockAction === 'Stock In' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Source / Supplier <span className="text-red-500">*</span>
                                </label>
                                
                                <div className="relative">
                                  <button
                                    id="supplier-select-btn"
                                    type="button"
                                    onClick={() => {
                                      setSecondaryPanel(prev => prev === 'SUPPLIER' ? null : 'SUPPLIER');
                                      setSupplierSearch('');
                                    }}
                                    className={`w-full flex items-center justify-between px-4 h-11 bg-slate-100 dark:bg-slate-900 border rounded-xl font-medium text-sm transition-all text-left ${
                                      selectedSupplier 
                                        ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-900/10 text-slate-900 dark:text-white' 
                                        : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                                    }`}
                                  >
                                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span className="truncate">
                                      {selectedSupplier ? selectedSupplier.name : 'Select Supplier...'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {selectedSupplier && (
                                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                        1 Selected
                                      </span>
                                    )}
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${secondaryPanel === 'SUPPLIER' ? 'rotate-180' : ''}`} />
                                  </div>
                                  </button>
                                  <ValidationErrorTooltip error={validationError} fieldId="supplier-select-btn" />
                                </div>

                                {/* Supplier Preview Card */}
                                {selectedSupplier && (
                                  <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                        {selectedSupplier.logo || selectedSupplier.image ? (
                                          <img src={selectedSupplier.logo || selectedSupplier.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <Building2 className="w-5 h-5 text-blue-500" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{selectedSupplier.name}</h4>
                                        <p className="text-xs text-slate-500 truncate">{selectedSupplier.contactPerson || selectedSupplier.phone || 'Registered Supplier'}</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSupplierId('');
                                      }}
                                      className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
                                      title="Remove supplier"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Reason <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <CustomSelect
                                    id="stock-in-reason-select"
                                    value={stockInReason}
                                    onChange={setStockInReason}
                                    options={STOCK_IN_REASONS}
                                    searchable={false}
                                    label="Select"
                                  />
                                  <ValidationErrorTooltip error={validationError} fieldId="stock-in-reason-select" />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Reference Number</label>
                                  <span className="text-xs text-slate-400">Optional</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="e.g. PO-88219 or INV-2024"
                                  value={refNumber}
                                  onChange={(e) => setRefNumber(e.target.value)}
                                  className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                                />
                              </div>
                            </div>
                          )}

                          {/* 🔴 STOCK OUT SPECIFIC FIELDS */}
                          {stockAction === 'Stock Out' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Reason <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <CustomSelect
                                    id="stock-out-reason-select"
                                    value={stockOutReason}
                                    onChange={setStockOutReason}
                                    options={STOCK_OUT_REASONS}
                                    searchable={false}
                                    label="Select"
                                  />
                                  <ValidationErrorTooltip error={validationError} fieldId="stock-out-reason-select" />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Reference Number</label>
                                  <span className="text-xs text-slate-400">Optional</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="e.g. DISP-001 or RTN-552"
                                  value={refNumber}
                                  onChange={(e) => setRefNumber(e.target.value)}
                                  className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                                />
                              </div>

                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                                <span>Notice: Customer POS sales automatically reduce stock. Manual Stock Out is reserved for internal usage, store damage, or vendor returns.</span>
                              </div>
                            </div>
                          )}

                          {/* 🔵 STOCK TRANSFER SPECIFIC FIELDS */}
                          {stockAction === 'Stock Transfer' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Destination Branch <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                  value={destinationBranchId}
                                  onChange={setDestinationBranchId}
                                  options={branchSelectOptions}
                                  searchable={true}
                                  label="Select"
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Transfer Note</label>
                                  <span className="text-xs text-slate-400">Optional</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="e.g. Urgent replenishment"
                                  value={transferNote}
                                  onChange={(e) => setTransferNote(e.target.value)}
                                  className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                                />
                              </div>
                            </div>
                          )}

                          {/* 🟡 STOCK ADJUSTMENT SPECIFIC FIELDS */}
                          {stockAction === 'Stock Adjustment' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Reason <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <CustomSelect
                                    id="adjustment-reason-select"
                                    value={adjustmentReason}
                                    onChange={setAdjustmentReason}
                                    options={ADJUSTMENT_REASONS}
                                    searchable={false}
                                    label="Select"
                                  />
                                  <ValidationErrorTooltip error={validationError} fieldId="adjustment-reason-select" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 🟠 DAMAGED / EXPIRED SPECIFIC FIELDS */}
                          {stockAction === 'Damaged / Expired' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setDamageType('Damaged')}
                                    className={`py-2 px-4 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                                      damageType === 'Damaged' 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                    }`}
                                  >
                                    Damaged
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDamageType('Expired')}
                                    className={`py-2 px-4 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                                      damageType === 'Expired' 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                    }`}
                                  >
                                    Expired
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Specific Reason <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <CustomSelect
                                    id="damage-reason-select"
                                    value={damageReason}
                                    onChange={setDamageReason}
                                    options={DAMAGE_REASONS}
                                    searchable={false}
                                    label="Select"
                                  />
                                  <ValidationErrorTooltip error={validationError} fieldId="damage-reason-select" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 📝 UNIVERSAL NOTE */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Note</label>
                              <span className="text-xs text-slate-400">Optional</span>
                            </div>
                            <textarea
                              rows={3}
                              placeholder="Add a note... (e.g. 3 units damaged during shelf arrangement)"
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-900 dark:text-white outline-none resize-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
      </MainRightPanel>

      <SecondaryRightPanel
        isOpen={secondaryPanel === 'PRODUCT'}
        onClose={() => setSecondaryPanel(null)}
        title="Select Product"
        subtitle="Choose a product for adjustment"
        icon={Package}
        hideFooter={true}
      >
        <div className="space-y-4 pb-12">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search by name or barcode..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-10 pr-10 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
            />
            {productSearch && (
              <button 
                onClick={() => setProductSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* List Body */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { setSecondaryPanel(null); setIsAddProductPanelOpen(true); }}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 px-5 h-12 rounded-xl font-bold transition-all cursor-pointer border border-blue-200 dark:border-blue-500/30"
            >
              <Plus className="w-5 h-5" /> Add New Product
            </button>
            
            <hr className="w-full border-slate-200 dark:border-slate-700 border-t-2" />
            
            {filteredProductsForPanel.length > 0 ? (
              filteredProductsForPanel.map((p) => {
                const isSelected = String(selectedProductId) === String(p.id);
                const pImg = p.images?.[0]?.url || p.image;
                const pStock = Number(p.stock ?? p.stockQuantity ?? 0);
                const pUnit = p.unit || 'pcs';

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedProductId('');
                        if (stockAction === 'Stock Adjustment') setActualStock('');
                      } else {
                        setSelectedProductId(String(p.id));
                        if (stockAction === 'Stock Adjustment') {
                          setActualStock(String(pStock));
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500/60 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                        {pImg ? (
                          <img src={pImg} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 pr-2">
                        <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>{p.name}</h4>
                        <p className="text-xs text-slate-500 truncate">SKU: {p.barcode || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 pl-2">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Stock</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {pStock} <span className="text-xs font-semibold text-slate-500">{pUnit}</span>
                        </div>
                      </div>
                      <div className="shrink-0 pl-2">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <SearchX className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No products found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
              </div>
            )}
          </div>
        </div>
      </SecondaryRightPanel>

      <SelectSupplierPanel
        isOpen={secondaryPanel === 'SUPPLIER'}
        onClose={() => setSecondaryPanel(null)}
        onSelect={(supplierId) => {
          setSupplierId(supplierId || '');
          setSecondaryPanel(null);
        }}
        selectedSupplierId={supplierId}
        suppliers={suppliers}
        setSuppliers={setSuppliers}
      />


      {/* Upgrade Pro Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        featureName={upgradeFeature}
        requiredTier="Pro"
      />

      {/* Add Product Panel */}
      <AddProductPanel
        isOpen={isAddProductPanelOpen}
        suppliers={suppliers}
        onClose={() => {
          setIsAddProductPanelOpen(false);
          setSecondaryPanel('PRODUCT');
        }}
        onSuccess={(newProduct: any) => {
          setIsAddProductPanelOpen(false);
          if (newProduct) {
            setProducts(prev => {
              const exists = prev.find(p => p.id === newProduct.id);
              if (exists) return prev.map(p => p.id === newProduct.id ? { ...p, ...newProduct } : p);
              return [newProduct, ...prev];
            });
          }
          fetchProducts();
          if (newProduct?.id) setSelectedProductId(String(newProduct.id));
          setSecondaryPanel('PRODUCT');
        }}
      />



      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Branch Inventory"
        onClear={() => {
          setStockFilter('all');
          setUnitFilter('all');
          setCategoryFilter('all');
          setSortMode('default');
          setIsFilterOpen(false);
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Stock Status</label>
          <CustomSelect
            value={stockFilter}
            onChange={setStockFilter}
            searchable={false}
            options={[
              { value: 'all', label: 'All Stock Statuses' },
              { value: 'instock', label: 'In Stock (>0)' },
              { value: 'lowstock', label: 'Low Stock (Alert Level)' },
              { value: 'outofstock', label: 'Out of Stock (0)' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Unit / Measurement</label>
          <CustomSelect
            value={unitFilter}
            onChange={setUnitFilter}
            searchable={false}
            options={[
              { value: 'all', label: 'All Units' },
              ...availableUnits.map(u => ({ value: u, label: u.toUpperCase() }))
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Category</label>
          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            searchable={true}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.flatMap(c => [
                { value: c.id.toString(), label: c.name },
                ...(c.children || []).map((sc: any) => ({ value: sc.id.toString(), label: `-- ${sc.name}` }))
              ])
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label>
          <CustomSelect
            value={sortMode}
            onChange={(val) => setSortMode(val as any)}
            searchable={false}
            options={[
              { value: 'default', label: 'Default (Recent)' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'stock-asc', label: 'Stock: Low to High' },
              { value: 'stock-desc', label: 'Stock: High to Low' },
              { value: 'value-desc', label: 'Stock Valuation: High to Low' },
            ]}
          />
        </div>
      </FilterPanel>

    </div>
  );
}
