'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShoppingBag, Search, Plus, Filter, List, LayoutGrid, Maximize, Minimize,
  X, Clock, CheckCircle2, Truck, CircleDollarSign, Calendar, Building2,
  ChevronDown, ChevronUp, Trash2, Eye, FileText, Check, ArrowRight,
  AlertTriangle, AlertCircle, Package, CreditCard, Banknote, RefreshCw,
  Copy, DollarSign, Tag, ExternalLink, Printer, Store, UserCircle, Send, Lock,
  Circle, SearchX, Pencil, BarChart3, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KpiCard } from '@/components/ui/kpi-card';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { FilterPanel } from '@/components/ui/filter-panel';
import { AddProductPanel } from '@/components/shared/AddProductPanel';
import { AddSupplierPanel } from '@/components/shared/AddSupplierPanel';
import { SelectSupplierPanel } from '@/components/shared/SelectSupplierPanel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { CustomSelect } from '@/components/ui/custom-select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { MainRightPanel, SecondaryRightPanel } from '@/components/ui/right-panel';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { useBranchStore } from '@/lib/branch-store';
import { useAuthStore } from '@/lib/auth-store';
import { storeOwnerAPI } from '@/lib/api';
import {
  getPurchasesLocally,
  savePurchaseLocally,
  updatePurchaseLocally,
  receivePurchaseLocally,
  deletePurchaseLocally,
  updatePurchasePaymentStatusLocally,
  getLocalProducts
} from '@/lib/local-services';
import { toast } from 'sonner';
import { isTauriEnv } from '@/lib/local-db';

// Types
export interface PurchaseItem {
  id?: number;
  productId: number;
  productName: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  quantity: number;
  receivedQuantity?: number;
  unitCost: number;
  subtotal: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface PurchaseOrder {
  id: number;
  purchaseNumber: string;
  supplierId?: number | null;
  supplierName: string;
  status: 'ORDERED' | 'PENDING' | 'RECEIVED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paymentMethod: string;
  subtotal: number;
  tax: number;
  discount: number;
  shippingCost: number;
  total: number;
  paidAmount: number;
  orderDate: string;
  expectedDate?: string | null;
  receivedDate?: string | null;
  referenceNo?: string | null;
  notes?: string | null;
  branchId?: number | null;
  tenantId?: number | null;
  items: PurchaseItem[];
}

const FALLBACK_SUPPLIERS = [
  { id: 1, name: 'Anchor Ceylon Ltd', phone: '+94 11 283 4567', contactPerson: 'Nimal Perera' },
  { id: 2, name: 'Nestle Lanka PLC', phone: '+94 11 269 8221', contactPerson: 'Saman Kumara' },
  { id: 3, name: 'Unilever Sri Lanka', phone: '+94 11 218 8000', contactPerson: 'Kamal Silva' },
  { id: 4, name: 'Ceylon Cold Stores (Elephant House)', phone: '+94 11 231 8790', contactPerson: 'Rohan Jayasinghe' },
  { id: 5, name: 'Maliban Biscuit Manufactories', phone: '+94 11 555 5555', contactPerson: 'Chathura Wickrama' },
];

const getShortUnit = (unitStr?: string) => {
  if (!unitStr) return 'pcs';
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

const SAMPLE_PURCHASES: Omit<PurchaseOrder, 'id'>[] = [
  {
    purchaseNumber: 'PO-941021',
    supplierId: 3,
    supplierName: 'Unilever Sri Lanka',
    status: 'RECEIVED',
    paymentStatus: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    subtotal: 18300,
    tax: 0,
    discount: 500,
    shippingCost: 500,
    total: 18300,
    paidAmount: 18300,
    orderDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    expectedDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    receivedDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    referenceNo: 'INV-UNL-8821',
    notes: 'Delivered to main branch warehouse without issues.',
    items: [
      { productId: 101, productName: 'Sunlight Lemon Soap 100g', unit: 'pcs', quantity: 100, receivedQuantity: 100, unitCost: 95, subtotal: 9500 },
      { productId: 102, productName: 'Lifebuoy Total Bar Soap 100g', unit: 'pcs', quantity: 80, receivedQuantity: 80, unitCost: 110, subtotal: 8800 }
    ]
  },
  {
    purchaseNumber: 'PO-941022',
    supplierId: 2,
    supplierName: 'Nestle Lanka PLC',
    status: 'ORDERED',
    paymentStatus: 'PARTIAL',
    paymentMethod: 'CHEQUE',
    subtotal: 29400,
    tax: 0,
    discount: 0,
    shippingCost: 800,
    total: 30200,
    paidAmount: 15000,
    orderDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    expectedDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    receivedDate: null,
    referenceNo: 'REF-NES-4029',
    notes: 'Urgent delivery requested for breakfast beverages.',
    items: [
      { productId: 103, productName: 'Milo Ready to Drink 180ml', unit: 'pkts', quantity: 120, receivedQuantity: 0, unitCost: 140, subtotal: 16800 },
      { productId: 104, productName: 'Nescafe Classic Jar 50g', unit: 'btl', quantity: 30, receivedQuantity: 0, unitCost: 420, subtotal: 12600 }
    ]
  },
  {
    purchaseNumber: 'PO-941023',
    supplierId: 4,
    supplierName: 'Ceylon Cold Stores (Elephant House)',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: 'CREDIT',
    subtotal: 26100,
    tax: 0,
    discount: 1000,
    shippingCost: 0,
    total: 25100,
    paidAmount: 0,
    orderDate: new Date().toISOString(),
    expectedDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    receivedDate: null,
    referenceNo: 'CCS-BEV-990',
    notes: 'Requires refrigerated transport if available.',
    items: [
      { productId: 105, productName: 'Elephant House Cream Soda 1.5L', unit: 'btl', quantity: 50, receivedQuantity: 0, unitCost: 290, subtotal: 14500 },
      { productId: 106, productName: 'Elephant House Necto 1.5L', unit: 'btl', quantity: 40, receivedQuantity: 0, unitCost: 290, subtotal: 11600 }
    ]
  },
  {
    purchaseNumber: 'PO-941024',
    supplierId: 5,
    supplierName: 'Maliban Biscuit Manufactories',
    status: 'ORDERED',
    paymentStatus: 'UNPAID',
    paymentMethod: 'CREDIT',
    subtotal: 28400,
    tax: 0,
    discount: 0,
    shippingCost: 600,
    total: 29000,
    paidAmount: 0,
    orderDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    expectedDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    receivedDate: null,
    referenceNo: 'MAL-ORD-312',
    notes: 'Monthly standard snack order.',
    items: [
      { productId: 107, productName: 'Maliban Chocolate Biscuit 200g', unit: 'pkts', quantity: 60, receivedQuantity: 0, unitCost: 220, subtotal: 13200 },
      { productId: 108, productName: 'Maliban Cream Cracker 490g', unit: 'pkts', quantity: 40, receivedQuantity: 0, unitCost: 380, subtotal: 15200 }
    ]
  }
];

interface PurchasesOverviewProps {
  purchases: PurchaseOrder[];
  suppliers: any[];
  kpiData: Array<{ title: string; value: string; icon: any; color: string; bg: string }>;
  setActiveTab: (tab: 'overview' | 'table') => void;
  setStatusFilter: (status: string) => void;
  setPaymentStatusFilter: (status: string) => void;
  setSupplierFilter: (supplier: string) => void;
  handleStartEditPurchase: (p: PurchaseOrder) => void;
  handleOpenDetailsDrawer: (p: PurchaseOrder) => void;
}

function PurchasesOverviewDashboard({
  purchases,
  suppliers,
  kpiData,
  setActiveTab,
  setStatusFilter,
  setPaymentStatusFilter,
  setSupplierFilter,
  handleStartEditPurchase,
  handleOpenDetailsDrawer,
}: PurchasesOverviewProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartMetric, setChartMetric] = useState<'spend' | 'orders'>('spend');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Chronological monthly trend
  const chartData = useMemo(() => {
    const monthMap = new Map<string, { name: string; spend: number; orders: number; dateTs: number }>();
    purchases.forEach(p => {
      const d = new Date(p.orderDate);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const name = d.toLocaleDateString('en-US', { month: 'short' });
      const cur = monthMap.get(key) || { name, spend: 0, orders: 0, dateTs: d.getTime() };
      cur.spend += Number(p.total) || 0;
      cur.orders += 1;
      monthMap.set(key, cur);
    });

    const list = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, v]) => v);

    return list;
  }, [purchases]);

  // Top 5 Suppliers by Spend
  const topSuppliers = useMemo(() => {
    const supMap = new Map<string, { id?: any; name: string; totalSpend: number; orderCount: number }>();
    purchases.forEach(p => {
      const key = p.supplierName || 'Direct Purchase';
      const cur = supMap.get(key) || { id: p.supplierId, name: key, totalSpend: 0, orderCount: 0 };
      cur.totalSpend += Number(p.total) || 0;
      cur.orderCount += 1;
      supMap.set(key, cur);
    });
    return Array.from(supMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [purchases]);

  // Pending Deliveries (ORDERED or PENDING)
  const pendingOrders = useMemo(() => {
    return purchases
      .filter(p => p.status === 'ORDERED' || p.status === 'PENDING')
      .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
  }, [purchases]);

  // Top Value Orders
  const topValueOrders = useMemo(() => {
    return [...purchases].sort((a, b) => (b.total || 0) - (a.total || 0));
  }, [purchases]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const unpaid = purchases.filter(p => p.paymentStatus === 'UNPAID');
    const partial = purchases.filter(p => p.paymentStatus === 'PARTIAL');
    const paid = purchases.filter(p => p.paymentStatus === 'PAID');
    return [
      { label: 'Unpaid Due', count: unpaid.length, total: unpaid.reduce((sum, p) => sum + (Number(p.total) || 0) - (Number(p.paidAmount) || 0), 0), status: 'UNPAID', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
      { label: 'Partially Paid', count: partial.length, total: partial.reduce((sum, p) => sum + (Number(p.total) || 0) - (Number(p.paidAmount) || 0), 0), status: 'PARTIAL', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
      { label: 'Fully Settled', count: paid.length, total: paid.reduce((sum, p) => sum + (Number(p.paidAmount) || Number(p.total) || 0), 0), status: 'PAID', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' }
    ];
  }, [purchases]);

  const totalSpendVal = purchases.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

  return (
    <div className="space-y-6">
      {/* ──────────────── TOP 4 KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
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

      {/* ──────────────── 2. MAIN DASHBOARD GRID: CHART (2 Cols) + TOP SUPPLIERS (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 shrink-0">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Purchases Spend & Orders Volume
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {chartMetric === 'spend' ? 'Total procurement spend in Rs. over time' : 'Number of purchase orders processed'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMetric('spend')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'spend' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Spend (Rs.)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('orders')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'orders' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Orders
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
                  No purchases recorded yet to plot.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => chartMetric === 'spend' ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`) : `${v}`}
                      />
                      <Tooltip
                        formatter={(v: any) => [
                          chartMetric === 'spend' ? `Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${Number(v)} Orders`,
                          chartMetric === 'spend' ? 'Spend' : 'Orders'
                        ]}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey={chartMetric === 'spend' ? 'spend' : 'orders'} fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => chartMetric === 'spend' ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`) : `${v}`}
                      />
                      <Tooltip
                        formatter={(v: any) => [
                          chartMetric === 'spend' ? `Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${Number(v)} Orders`,
                          chartMetric === 'spend' ? 'Spend' : 'Orders'
                        ]}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey={chartMetric === 'spend' ? 'spend' : 'orders'}
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3B82F6' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading purchases chart...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 font-medium">
            <span>Total Recorded Procurement Spend</span>
            <span className="font-bold text-slate-900 dark:text-white">
              Rs. {totalSpendVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Right: Card 1 - Top 5 Suppliers by Spend */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Top Suppliers by Spend
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              Highest Spend
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topSuppliers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No supplier purchases recorded yet.
              </div>
            ) : (
              topSuppliers.slice(0, 5).map((sup, i) => {
                const rankColors = [
                  'bg-blue-600 text-white',
                  'bg-blue-500 text-white',
                  'bg-indigo-500 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div
                    key={sup.name || i}
                    onClick={() => {
                      if (sup.id) setSupplierFilter(String(sup.id));
                      setActiveTab('table');
                    }}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to filter by supplier in table"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {sup.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {sup.orderCount} order{sup.orderCount !== 1 ? 's' : ''} placed
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                      Rs. {sup.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              View All in Purchases Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 RANKINGS / INSIGHTS CARDS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 2: Pending Deliveries */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Pending Deliveries
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              {pendingOrders.length} Pending
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {pendingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-emerald-600 dark:text-emerald-400 text-xs font-medium gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span>All deliveries received! No pending orders.</span>
              </div>
            ) : (
              pendingOrders.slice(0, 5).map((p, i) => (
                <div
                  key={p.id || i}
                  onClick={() => {
                    setStatusFilter('ORDERED');
                    setActiveTab('table');
                  }}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-amber-50/40 dark:hover:bg-amber-950/20 cursor-pointer transition-colors group"
                  title="Click to view pending PO"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                        #{p.purchaseNumber}
                      </div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                        {p.supplierName} • {p.status}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                    Rs. {Number(p.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ORDERED');
                setActiveTab('table');
              }}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              Filter Pending POs in Table →
            </button>
          </div>
        </div>

        {/* Card 3: Top Value Purchase Orders */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Highest Value POs
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Top Amounts
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topValueOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No orders recorded yet.
              </div>
            ) : (
              topValueOrders.slice(0, 5).map((p, i) => (
                <div
                  key={p.id || i}
                  onClick={() => setActiveTab('table')}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view PO"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                        #{p.purchaseNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {p.supplierName} • {p.items?.length || 0} items
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                    Rs. {Number(p.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All Orders in Table →
            </button>
          </div>
        </div>

        {/* Card 4: Payment Status & Payables */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Payment Status Summary
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Payables
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            {paymentBreakdown.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setPaymentStatusFilter(item.status);
                  setActiveTab('table');
                }}
                className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Click to filter by payment status in table"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.bg}`}>
                    {item.count} order{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  Rs. {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setPaymentStatusFilter('UNPAID');
                setActiveTab('table');
              }}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              Filter Unpaid POs in Table →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchasesPage() {
  const { user } = useAuthStore();
  const { activeBranchId, branches } = useBranchStore();

  // Primary Data State
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab & View Mode & Fullscreen
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  // Search & Filter Panel
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'total_desc' | 'total_asc'>('date_desc');

  // Slide-out Drawer Panel: New / Edit Purchase
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState<number | null>(null);
  const [editingPurchaseNumber, setEditingPurchaseNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slide-out Secondary Panels: 'SUPPLIER' | 'PRODUCT'
  const [secondaryPanel, setSecondaryPanel] = useState<'PRODUCT' | 'SUPPLIER' | null>(null);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isAddProductPanelOpen, setIsAddProductPanelOpen] = useState(false);
  const [isAddSupplierPanelOpen, setIsAddSupplierPanelOpen] = useState(false);

  // Validation tooltip state & helper
  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);

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

    if (sectionKey && !openSections[sectionKey as keyof typeof openSections]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
      setTimeout(focus, 300);
    } else {
      focus();
    }

    setTimeout(() => setValidationError(null), 3000);
  };

  // Quick Action confirmation (Receive / Delete)
  const [receivingOrderId, setReceivingOrderId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null
  });

  // Form State for New Purchase Order
  const [formSupplierId, setFormSupplierId] = useState<string>('');
  const [customSupplierName, setCustomSupplierName] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'ORDERED' | 'RECEIVED'>('ORDERED');
  const [formPaymentStatus, setFormPaymentStatus] = useState<'UNPAID' | 'PARTIAL' | 'PAID'>('UNPAID');
  const [formPaymentMethod, setFormPaymentMethod] = useState<string>('CASH');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [taxAmount, setTaxAmount] = useState<string>('0');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [shippingFee, setShippingFee] = useState<string>('0');

  // Collapsible Accordion Sections in New PO Drawer
  const [openSections, setOpenSections] = useState({
    supplier: true,
    items: false,
    pricing: false,
    payment: false,
    notes: false,
  });

  const toggleSection = (sectionKey: keyof typeof openSections) => {
    setSecondaryPanel(null);
    setOpenSections(prev => {
      if (prev[sectionKey]) {
        return { ...prev, [sectionKey]: false };
      }
      return {
        supplier: false,
        items: false,
        pricing: false,
        payment: false,
        notes: false,
        [sectionKey]: true
      };
    });
  };

  // Items in the current order form
  const [orderItems, setOrderItems] = useState<PurchaseItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);

  // Selected supplier resolution
  const selectedSupplier = useMemo(() => {
    if (!formSupplierId || formSupplierId === 'custom') return null;
    return suppliers.find(s => String(s.id) === String(formSupplierId)) || null;
  }, [suppliers, formSupplierId]);

  // Plan gating
  const plan = user?.tenant?.plan?.toUpperCase() || 'STARTUP';
  const isStartup = plan === 'STARTUP' || plan === 'FREE';
  const isLocalMode = isTauriEnv() || isStartup;
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Calculate if form is dirty
  const isFormDirty = Boolean(
    (!isStartup && (formSupplierId || customSupplierName)) ||
    orderItems.length > 0 ||
    referenceNo ||
    notes ||
    Number(discountAmount) > 0 ||
    Number(shippingFee) > 0
  );

  // Restore draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('draft_new_purchase');
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.formSupplierId !== undefined) setFormSupplierId(d.formSupplierId);
        if (d.customSupplierName !== undefined) setCustomSupplierName(d.customSupplierName);
        if (d.orderDate !== undefined) setOrderDate(d.orderDate);
        if (d.expectedDate !== undefined) setExpectedDate(d.expectedDate);
        if (d.referenceNo !== undefined) setReferenceNo(d.referenceNo);
        if (d.notes !== undefined) setNotes(d.notes);
        if (d.formStatus !== undefined) setFormStatus(d.formStatus);
        if (d.formPaymentStatus !== undefined) setFormPaymentStatus(d.formPaymentStatus);
        if (d.formPaymentMethod !== undefined) setFormPaymentMethod(d.formPaymentMethod);
        if (d.paidAmount !== undefined) setPaidAmount(d.paidAmount);
        if (d.taxAmount !== undefined) setTaxAmount(d.taxAmount);
        if (d.discountAmount !== undefined) setDiscountAmount(d.discountAmount);
        if (d.shippingFee !== undefined) setShippingFee(d.shippingFee);
        if (Array.isArray(d.orderItems) && d.orderItems.length > 0) setOrderItems(d.orderItems);
      }
    } catch (e) {
      console.warn('Failed to load purchase draft', e);
    }
  }, []);

  // Auto-save draft when dirty inputs exist
  useEffect(() => {
    if (!isPanelOpen && !isFormDirty) return;
    try {
      if (isFormDirty) {
        const draftData = {
          formSupplierId,
          customSupplierName,
          orderDate,
          expectedDate,
          referenceNo,
          notes,
          formStatus,
          formPaymentStatus,
          formPaymentMethod,
          paidAmount,
          taxAmount,
          discountAmount,
          shippingFee,
          orderItems,
        };
        localStorage.setItem('draft_new_purchase', JSON.stringify(draftData));
      }
    } catch (e) {}
  }, [
    formSupplierId, customSupplierName, orderDate, expectedDate, referenceNo, notes,
    formStatus, formPaymentStatus, formPaymentMethod, paidAmount, taxAmount, discountAmount,
    shippingFee, orderItems, isFormDirty, isPanelOpen
  ]);

  // ─────────────────────────────────────────────────────────────
  // Initial Data Loading
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loadAllData();
  }, [user?.tenantId, activeBranchId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const tenantId = user?.tenantId ?? null;
      const branchId = activeBranchId ? (parseInt(activeBranchId, 10) || 1) : 1;

      // 1. Fetch Local Purchases
      const localPurchases = await getPurchasesLocally(tenantId, branchId);
      setPurchases(localPurchases);

      // 2. Fetch Suppliers
      try {
        const res = await storeOwnerAPI.getSuppliers();
        if (res.data && res.data.length > 0) {
          setSuppliers(res.data);
        } else {
          setSuppliers(FALLBACK_SUPPLIERS);
        }
      } catch {
        setSuppliers(FALLBACK_SUPPLIERS);
      }

      // 3. Fetch Local Products for Item Picker
      try {
        const prods = await getLocalProducts(tenantId, branchId);
        setAvailableProducts(prods || []);
      } catch (err) {
        console.error('Failed to load local products for purchase picker', err);
      }
    } catch (err) {
      console.error('Error loading purchases data:', err);
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // KPI Calculations
  // ─────────────────────────────────────────────────────────────
  const kpiData = useMemo(() => {
    const totalOrders = purchases.length;
    const pendingDeliveries = purchases.filter(p => p.status === 'ORDERED' || p.status === 'PENDING').length;
    const receivedOrders = purchases.filter(p => p.status === 'RECEIVED').length;
    const totalSpend = purchases.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

    return [
      {
        title: 'Total Orders',
        value: `${totalOrders} Orders`,
        icon: ShoppingBag,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
      },
      {
        title: 'Pending Deliveries',
        value: `${pendingDeliveries} Pending`,
        icon: Truck,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
      },
      {
        title: 'Received Stock',
        value: `${receivedOrders} Completed`,
        icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      },
      {
        title: 'Total Spend',
        value: `Rs. ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: CircleDollarSign,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-500/10',
      },
    ];
  }, [purchases]);

  // ─────────────────────────────────────────────────────────────
  // Filters & Search
  // ─────────────────────────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (paymentStatusFilter !== 'all') count++;
    if (supplierFilter !== 'all') count++;
    if (fromDate) count++;
    if (toDate) count++;
    if (sortBy !== 'date_desc') count++;
    return count;
  }, [statusFilter, paymentStatusFilter, supplierFilter, fromDate, toDate, sortBy]);

  const clearFilters = () => {
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setSupplierFilter('all');
    setFromDate('');
    setToDate('');
    setSortBy('date_desc');
  };

  const filteredPurchases = useMemo(() => {
    return purchases
      .filter(p => {
        // Search query
        const q = search.toLowerCase().trim();
        if (q) {
          const matchNumber = (p.purchaseNumber || '').toLowerCase().includes(q);
          const matchSupplier = (p.supplierName || '').toLowerCase().includes(q);
          const matchRef = (p.referenceNo || '').toLowerCase().includes(q);
          const matchItems = p.items?.some(it => it.productName.toLowerCase().includes(q));
          if (!matchNumber && !matchSupplier && !matchRef && !matchItems) return false;
        }

        // Status Filter
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;

        // Payment Status Filter
        if (paymentStatusFilter !== 'all' && p.paymentStatus !== paymentStatusFilter) return false;

        // Supplier Filter
        if (supplierFilter !== 'all') {
          if (String(p.supplierId) !== supplierFilter && p.supplierName !== supplierFilter) return false;
        }

        // Date Range
        if (fromDate) {
          const pDate = new Date(p.orderDate).getTime();
          const fDate = new Date(fromDate).getTime();
          if (pDate < fDate) return false;
        }
        if (toDate) {
          const pDate = new Date(p.orderDate).getTime();
          const tDate = new Date(toDate).setHours(23, 59, 59, 999);
          if (pDate > tDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_asc') {
          return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
        }
        if (sortBy === 'total_desc') {
          return (b.total || 0) - (a.total || 0);
        }
        if (sortBy === 'total_asc') {
          return (a.total || 0) - (b.total || 0);
        }
        // Default: date_desc
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      });
  }, [purchases, search, statusFilter, paymentStatusFilter, supplierFilter, fromDate, toDate, sortBy]);

  // ─────────────────────────────────────────────────────────────
  // Order Form Financial Calculations
  // ─────────────────────────────────────────────────────────────
  const formSubtotal = useMemo(() => {
    return orderItems.reduce((sum, it) => sum + (it.unitCost * it.quantity), 0);
  }, [orderItems]);

  const formTotal = useMemo(() => {
    const tax = parseFloat(taxAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    const shipping = parseFloat(shippingFee) || 0;
    return Math.max(0, formSubtotal - discount + tax + shipping);
  }, [formSubtotal, taxAmount, discountAmount, shippingFee]);

  useEffect(() => {
    if (formPaymentStatus === 'PAID') {
      setPaidAmount(formTotal.toFixed(2));
    } else if (formPaymentStatus === 'UNPAID') {
      setPaidAmount('0.00');
    }
  }, [formPaymentStatus, formTotal]);

  // ─────────────────────────────────────────────────────────────
  // Form Operations (Add/Remove Item, Save)
  // ─────────────────────────────────────────────────────────────
  const handleAddItem = (prod: any) => {
    if (validationError?.field === 'product-select-btn') {
      setValidationError(null);
    }
    const existingIndex = orderItems.findIndex(it => it.productId === prod.id);
    if (existingIndex > -1) {
      setOrderItems(prev => {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        next[existingIndex].subtotal = next[existingIndex].quantity * next[existingIndex].unitCost;
        return next;
      });
    } else {
      const defaultCost = Number(prod.cost || prod.costPrice || 0) || 100;
      const newItem: PurchaseItem = {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku || '',
        barcode: prod.barcode || '',
        unit: prod.unit || 'pcs',
        quantity: 1,
        receivedQuantity: 0,
        unitCost: defaultCost,
        subtotal: defaultCost,
      };
      setOrderItems(prev => [...prev, newItem]);
    }
  };

  const handleToggleProduct = (prod: any) => {
    if (validationError?.field === 'product-select-btn') {
      setValidationError(null);
    }
    const existingIndex = orderItems.findIndex(it => it.productId === prod.id);
    if (existingIndex > -1) {
      // Toggle off / remove from order
      setOrderItems(prev => prev.filter(it => it.productId !== prod.id));
    } else {
      // Toggle on / add to order
      const defaultCost = Number(prod.cost || prod.costPrice || 0) || 100;
      const newItem: PurchaseItem = {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku || '',
        barcode: prod.barcode || '',
        unit: prod.unit || 'pcs',
        quantity: 1,
        receivedQuantity: 0,
        unitCost: defaultCost,
        subtotal: defaultCost,
      };
      setOrderItems(prev => [...prev, newItem]);
    }
  };

  const handleAddCustomItem = () => {
    if (!productSearch.trim()) return;
    if (validationError?.field === 'product-select-btn') {
      setValidationError(null);
    }
    const newItem: PurchaseItem = {
      productId: Date.now(),
      productName: productSearch.trim(),
      sku: '',
      barcode: '',
      unit: 'pcs',
      quantity: 1,
      receivedQuantity: 0,
      unitCost: 100,
      subtotal: 100,
    };
    setOrderItems(prev => [...prev, newItem]);
    setProductSearch('');
    setIsSearchingProduct(false);
  };

  const handleUpdateItemQuantity = (index: number, val: string) => {
    const qty = Math.max(1, parseFloat(val) || 1);
    setOrderItems(prev => {
      const next = [...prev];
      next[index].quantity = qty;
      next[index].subtotal = qty * next[index].unitCost;
      return next;
    });
  };

  const handleUpdateItemCost = (index: number, val: string) => {
    const cost = Math.max(0, parseFloat(val) || 0);
    setOrderItems(prev => {
      const next = [...prev];
      next[index].unitCost = cost;
      next[index].subtotal = next[index].quantity * cost;
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEditingPurchaseId(null);
    setEditingPurchaseNumber('');
    setFormSupplierId('');
    setCustomSupplierName('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setExpectedDate('');
    setReferenceNo('');
    setNotes('');
    setFormStatus('ORDERED');
    setFormPaymentStatus('UNPAID');
    setFormPaymentMethod('CASH');
    setPaidAmount('');
    setTaxAmount('0');
    setDiscountAmount('0');
    setShippingFee('0');
    setOrderItems([]);
    setProductSearch('');
    setIsSearchingProduct(false);
    setSecondaryPanel(null);
    setSupplierSearch('');
    setValidationError(null);
    setOpenSections({
      supplier: true,
      items: true,
      pricing: false,
      payment: false,
      notes: false,
    });
  };

  const handleClosePanel = () => {
    setSecondaryPanel(null);
    setIsPanelOpen(false);
    resetForm();
  };

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_new_purchase');
    } catch (e) {}
    resetForm();
    setIsPanelOpen(false);
  };

  const handleStartEditPurchase = (p: PurchaseOrder) => {
    setEditingPurchaseId(p.id);
    setEditingPurchaseNumber(p.purchaseNumber);
    setFormSupplierId(p.supplierId ? String(p.supplierId) : (p.supplierName && p.supplierName !== 'Direct Purchase' ? 'custom' : ''));
    setCustomSupplierName(p.supplierName && p.supplierName !== 'Direct Purchase' ? p.supplierName : '');
    setOrderDate(p.orderDate ? p.orderDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setExpectedDate(p.expectedDate ? p.expectedDate.split('T')[0] : '');
    setReferenceNo(p.referenceNo || '');
    setNotes(p.notes || '');
    setFormStatus(p.status === 'RECEIVED' ? 'RECEIVED' : 'ORDERED');
    setFormPaymentStatus(p.paymentStatus || 'UNPAID');
    setFormPaymentMethod(p.paymentMethod || 'CASH');
    setPaidAmount(String(p.paidAmount ?? (p.paymentStatus === 'PAID' ? p.total : 0)));
    setTaxAmount(String(p.tax || 0));
    setDiscountAmount(String(p.discount || 0));
    setShippingFee(String(p.shippingCost || 0));
    setOrderItems(p.items ? p.items.map(it => ({ ...it })) : []);
    setProductSearch('');
    setIsSearchingProduct(false);
    setSecondaryPanel(null);
    setSupplierSearch('');
    setValidationError(null);
    setOpenSections({
      supplier: true,
      items: true,
      pricing: true,
      payment: true,
      notes: !!p.notes || !!p.referenceNo,
    });
    setIsPanelOpen(true);
  };

  const handleQuickPaymentStatus = async (purchase: PurchaseOrder, newStatus: 'PAID' | 'PARTIAL' | 'UNPAID') => {
    try {
      const paidAmt = newStatus === 'PAID' ? purchase.total : newStatus === 'UNPAID' ? 0 : (purchase.paidAmount || Math.round(purchase.total / 2));
      await updatePurchasePaymentStatusLocally(purchase.id, newStatus, paidAmt);
      toast.success(`Payment status for #${purchase.purchaseNumber} updated to ${newStatus}`);
      await loadAllData();
    } catch (e) {
      console.error('Failed to update payment status', e);
      toast.error('Failed to update payment status');
    }
  };

  const handleSavePurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Supplier validation
    let resolvedSupplierName = '';
    let resolvedSupplierId: number | null = null;

    if (formSupplierId === 'custom') {
      if (!customSupplierName.trim()) {
        triggerValidation('supplier', 'field-custom-supplier-name', 'Please enter custom supplier name');
        return;
      }
      resolvedSupplierName = customSupplierName.trim();
      resolvedSupplierId = null;
    } else if (formSupplierId) {
      const matched = suppliers.find(s => String(s.id) === formSupplierId);
      resolvedSupplierId = matched ? Number(matched.id) : null;
      resolvedSupplierName = matched ? matched.name : 'Unknown Supplier';
    } else {
      if (!isStartup) {
        triggerValidation('supplier', 'supplier-select-btn', 'Please select a supplier');
        return;
      }
      resolvedSupplierName = 'Direct Purchase';
      resolvedSupplierId = null;
    }

    if (orderItems.length === 0) {
      triggerValidation('items', 'product-select-btn', 'Please add at least one product');
      return;
    }

    if (formPaymentStatus === 'PARTIAL' && (!paidAmount || Number(paidAmount) <= 0)) {
      triggerValidation('payment', 'field-paid-amount', 'Please enter paid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      const tenantId = user?.tenantId ?? null;
      const branchId = activeBranchId ? (parseInt(activeBranchId, 10) || 1) : 1;

      const newOrderData = {
        supplierId: resolvedSupplierId,
        supplierName: resolvedSupplierName,
        status: formStatus,
        paymentStatus: formPaymentStatus,
        paymentMethod: formPaymentMethod,
        subtotal: formSubtotal,
        tax: parseFloat(taxAmount) || 0,
        discount: parseFloat(discountAmount) || 0,
        shippingCost: parseFloat(shippingFee) || 0,
        total: formTotal,
        paidAmount: formPaymentStatus === 'PAID' ? formTotal : (parseFloat(paidAmount) || 0),
        orderDate: new Date(orderDate).toISOString(),
        expectedDate: expectedDate || null,
        referenceNo: referenceNo.trim() || null,
        notes: notes.trim() || null,
        items: orderItems.map(it => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          barcode: it.barcode,
          unit: it.unit,
          quantity: it.quantity,
          unitCost: it.unitCost,
          subtotal: it.subtotal,
        }))
      };

      if (editingPurchaseId) {
        await updatePurchaseLocally(editingPurchaseId, newOrderData);
        toast.success(`Purchase #${editingPurchaseNumber || ''} updated successfully!`);
      } else {
        const result = await savePurchaseLocally(newOrderData, tenantId, branchId);
        toast.success(`Purchase #${result.purchaseNumber} created successfully!`);
      }

      try {
        localStorage.removeItem('draft_new_purchase');
      } catch (e) {}
      setIsPanelOpen(false);
      resetForm();
      await loadAllData();
    } catch (err) {
      console.error('Failed to create purchase order:', err);
      toast.error('Failed to save purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Action: Receive Order Stock
  // ─────────────────────────────────────────────────────────────
  const handleReceiveOrder = async (order: PurchaseOrder) => {
    try {
      setReceivingOrderId(order.id);
      const tenantId = user?.tenantId ?? null;
      const branchId = activeBranchId ? (parseInt(activeBranchId, 10) || 1) : 1;

      await receivePurchaseLocally(order.id, tenantId, branchId);
      toast.success(`Stock received and added to inventory for PO #${order.purchaseNumber}!`);
      await loadAllData();
    } catch (err) {
      console.error('Failed to receive order:', err);
      toast.error('Failed to process order stock receipt');
    } finally {
      setReceivingOrderId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Action: Delete Order
  // ─────────────────────────────────────────────────────────────
  const handleDeleteOrder = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deletePurchaseLocally(deleteConfirm.id);
      toast.success('Purchase order deleted successfully');
      setDeleteConfirm({ isOpen: false, id: null });
      await loadAllData();
    } catch (err) {
      console.error('Failed to delete purchase order:', err);
      toast.error('Failed to delete order');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Filtered Product Options for Item Picker
  // ─────────────────────────────────────────────────────────────
  const filteredProductsToSelect = useMemo(() => {
    const list = Array.isArray(availableProducts) ? availableProducts : [];
    if (!productSearch.trim()) return list;
    const q = productSearch.toLowerCase().trim();
    return list.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [availableProducts, productSearch]);

  const supplierSelectOptions = useMemo(() => {
    const list = suppliers.map(s => ({
      value: String(s.id),
      label: s.name
    }));
    return [...list, { value: 'custom', label: '+ Other / Custom Supplier' }];
  }, [suppliers]);

  // ─────────────────────────────────────────────────────────────
  // Helper: Copy Text to Clipboard
  // ─────────────────────────────────────────────────────────────
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className={`flex flex-col bg-[#F4F7F6] dark:bg-slate-900 ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6 lg:p-8'}`}>

      {/* ──────────────── HEADER & TOP BAR ──────────────── */}
      {!isFullscreen && (
        <div className="font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              Purchases & Orders
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Manage supplier purchase orders, track incoming stock, and monitor procurement spend.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsPanelOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            New Purchase
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Purchases Overview | Purchases Table) */}
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
            Purchases Overview
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
            Purchases Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search PO #, supplier, items..."
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

          {/* Filter Button */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center px-4 h-full rounded-xl transition-all gap-2 font-bold relative cursor-pointer ${
              activeFilterCount > 0 
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Filter Purchases"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* List View Toggle */}
          <button 
            onClick={() => setViewMode('list')}
            title="List View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>

          {/* Grid View Toggle */}
          <button 
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' 
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Fullscreen Toggle */}
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
            className="flex items-center justify-center w-10 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────── CONDITIONAL VIEW: OVERVIEW DASHBOARD OR TABLE ──────────────── */}
      {activeTab === 'overview' ? (
        <PurchasesOverviewDashboard
          purchases={purchases}
          suppliers={suppliers}
          kpiData={kpiData}
          setActiveTab={setActiveTab}
          setStatusFilter={setStatusFilter}
          setPaymentStatusFilter={setPaymentStatusFilter}
          setSupplierFilter={setSupplierFilter}
          handleStartEditPurchase={handleStartEditPurchase}
          handleOpenDetailsDrawer={(p) => setExpandedRowId(p.id)}
        />
      ) : (
        <>
          {/* ──────────────── MAIN PURCHASES VIEW (LIST OR GRID) ──────────────── */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[420px]">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading purchase orders...</p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[420px]">
          <TableEmptyState
            icon={ShoppingBag}
            title="No purchases found"
            description="You haven't recorded any purchases yet, or none match your search. Click below to create a new purchase."
            actionLabel="Create First Purchase"
            onAction={() => setIsPanelOpen(true)}
          />
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[420px]">
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[180px_220px_130px_160px_140px_140px_120px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>PO Number</div>
                <div>Supplier</div>
                <div className="text-center">Items</div>
                <div className="text-right">Total (Rs.)</div>
                <div className="text-center">Payment</div>
                <div className="text-center">Status</div>
                <div className="text-center">Actions</div>
              </div>

              {/* Table Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {filteredPurchases.map(p => {
                    const isExpanded = expandedRowId === p.id;
                    const itemsCount = p.items?.length || 0;

                    return (
                      <div
                        key={p.id}
                        id={`purchase-row-${p.id}`}
                        className="border-b border-slate-100 dark:border-slate-800/60 flex flex-col group scroll-mt-20"
                      >
                        {/* Summary Row */}
                        <div
                          onClick={() => setExpandedRowId(prev => prev === p.id ? null : p.id)}
                          className="grid grid-cols-[180px_220px_130px_160px_140px_140px_120px] gap-4 p-5 items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                        >
                          {/* PO Number & Date */}
                          <div className="flex flex-col">
                            <span className="font-black text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                              #{p.purchaseNumber}
                            </span>
                            <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(p.orderDate).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Supplier */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.supplierName}</p>
                              {p.referenceNo && (
                                <p className="text-[11px] text-slate-400 truncate">Ref: {p.referenceNo}</p>
                              )}
                            </div>
                          </div>

                          {/* Items count */}
                          <div className="text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                              <Package className="w-3.5 h-3.5 text-slate-400" />
                              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                            </span>
                          </div>

                          {/* Total Cost */}
                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              Rs. {Number(p.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Payment Status Pill */}
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                : p.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                            }`}>
                              {p.paymentStatus}
                            </span>
                          </div>

                          {/* Delivery Status Pill */}
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                              p.status === 'RECEIVED'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                : p.status === 'ORDERED'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                                : p.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {p.status === 'RECEIVED' && <Check className="w-3 h-3" />}
                              {p.status === 'ORDERED' && <Clock className="w-3 h-3" />}
                              {p.status === 'PENDING' && <Truck className="w-3 h-3" />}
                              {p.status}
                            </span>
                          </div>

                          {/* Actions Column */}
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditPurchase(p);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                              title="Edit Purchase & Payment"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Chevron Action */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedRowId(prev => prev === p.id ? null : p.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse' : 'View Details'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {/* Delete Action */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm({ isOpen: true, id: p.id });
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* ──────────────── EXPANDED DETAILS ACCORDION ──────────────── */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden bg-slate-50/70 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60 p-6"
                            >
                              <div className="space-y-6">
                                {/* Header / Summary Information Row */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Supplier Contact</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{p.supplierName}</p>
                                    {p.referenceNo && (
                                      <p className="text-xs text-slate-500 mt-0.5">Ref: {p.referenceNo}</p>
                                    )}
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Order Timeline</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                      Ordered: {new Date(p.orderDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Expected: {p.expectedDate ? new Date(p.expectedDate).toLocaleDateString() : 'Immediate'}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Payment Summary</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                      Method: {p.paymentMethod || 'CASH'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Paid: Rs. {(p.paidAmount || 0).toLocaleString()} (Due: Rs. {Math.max(0, p.total - (p.paidAmount || 0)).toLocaleString()})
                                    </p>
                                    {p.paymentStatus !== 'PAID' && (
                                      <button
                                        onClick={() => handleQuickPaymentStatus(p, 'PAID')}
                                        className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-700/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Mark as Paid
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex flex-col justify-center items-start md:items-end gap-2">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleStartEditPurchase(p)}
                                        className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 px-3.5 py-2.5 rounded-xl font-bold text-sm border border-blue-200 dark:border-blue-500/30 transition-all cursor-pointer"
                                      >
                                        <Pencil className="w-4 h-4" />
                                        Edit Order
                                      </button>

                                      {p.status !== 'RECEIVED' ? (
                                        <button
                                          disabled={receivingOrderId === p.id}
                                          onClick={() => handleReceiveOrder(p)}
                                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                          {receivingOrderId === p.id ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <CheckCircle2 className="w-4 h-4" />
                                          )}
                                          Receive & Stock In
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                                          <Check className="w-4 h-4" />
                                          Stock Received on {p.receivedDate ? new Date(p.receivedDate).toLocaleDateString() : 'Order'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Items Table */}
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                                  <div className="p-3 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                      <Package className="w-4 h-4 text-blue-500" />
                                      Order Line Items ({p.items?.length || 0})
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(p.purchaseNumber, 'PO Number')}
                                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                      Copy PO #
                                    </button>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                      <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                          <th className="p-3">Product Name</th>
                                          <th className="p-3">Unit</th>
                                          <th className="p-3 text-right">Quantity</th>
                                          <th className="p-3 text-right">Received</th>
                                          <th className="p-3 text-right">Unit Cost (Rs.)</th>
                                          <th className="p-3 text-right">Line Total (Rs.)</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                        {p.items && p.items.length > 0 ? (
                                          p.items.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                              <td className="p-3 font-bold text-slate-800 dark:text-white">
                                                {item.productName}
                                                {item.barcode && (
                                                  <span className="block text-[11px] text-slate-400 font-normal">
                                                    Barcode: {item.barcode}
                                                  </span>
                                                )}
                                              </td>
                                              <td className="p-3 text-slate-500">{item.unit || 'pcs'}</td>
                                              <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">
                                                {item.quantity}
                                              </td>
                                              <td className="p-3 text-right">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                  (item.receivedQuantity || 0) >= item.quantity
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                                                }`}>
                                                  {item.receivedQuantity || 0} / {item.quantity}
                                                </span>
                                              </td>
                                              <td className="p-3 text-right text-slate-600 dark:text-slate-300">
                                                {Number(item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                              </td>
                                              <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                                                Rs. {Number(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan={6} className="p-4 text-center text-slate-400">No line items</td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Financial Breakdown Totals in Table Footer */}
                                  <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="text-xs text-slate-500">
                                      {p.notes && (
                                        <p><span className="font-bold text-slate-700 dark:text-slate-300">Notes:</span> {p.notes}</p>
                                      )}
                                    </div>

                                    <div className="flex flex-col gap-1 text-right min-w-[240px]">
                                      <div className="flex justify-between text-xs text-slate-500">
                                        <span>Subtotal:</span>
                                        <span className="font-bold">Rs. {Number(p.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      </div>
                                      {p.discount > 0 && (
                                        <div className="flex justify-between text-xs text-emerald-600">
                                          <span>Discount:</span>
                                          <span>- Rs. {Number(p.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                      )}
                                      {p.shippingCost > 0 && (
                                        <div className="flex justify-between text-xs text-slate-500">
                                          <span>Shipping:</span>
                                          <span>+ Rs. {Number(p.shippingCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                                        <span>Grand Total:</span>
                                        <span className="text-blue-600 dark:text-blue-400">Rs. {Number(p.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
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
        /* ──────────────── GRID VIEW ──────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPurchases.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setViewMode('list');
                  setExpandedRowId(p.id);
                  setTimeout(() => {
                    document.getElementById(`purchase-row-${p.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: PO # & Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      #{p.purchaseNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      p.status === 'RECEIVED'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : p.status === 'ORDERED'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {p.status === 'RECEIVED' && <Check className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </div>

                  {/* Supplier Name */}
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base truncate group-hover:text-blue-600 transition-colors">
                      {p.supplierName}
                    </h3>
                  </div>

                  {/* Items Preview Chips */}
                  <div className="space-y-1.5 mb-4">
                    {p.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg">
                        <span className="truncate max-w-[180px] font-medium">{item.productName}</span>
                        <span className="font-bold shrink-0">{item.quantity} {item.unit || 'pcs'}</span>
                      </div>
                    ))}
                    {(p.items?.length || 0) > 2 && (
                      <p className="text-[11px] text-slate-400 font-medium pl-1">
                        + {(p.items?.length || 0) - 2} more items...
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer: Amount & Quick Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      Rs. {Number(p.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditPurchase(p);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                      title="Edit Purchase & Payment"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {p.status !== 'RECEIVED' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReceiveOrder(p);
                        }}
                        disabled={receivingOrderId === p.id}
                        className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {receivingOrderId === p.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Receive
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
        </>
      )}

      {/* ──────────────── SLIDE-OUT FILTER PANEL ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Purchases"
        onClear={() => {
          clearFilters();
          setIsFilterOpen(false);
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-6">
          {/* Order Delivery Status */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Order Status</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'ORDERED', 'PENDING', 'RECEIVED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {st === 'all' ? 'All Statuses' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Payment Status</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'PAID', 'PARTIAL', 'UNPAID'].map((pst) => (
                <button
                  key={pst}
                  type="button"
                  onClick={() => setPaymentStatusFilter(pst)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    paymentStatusFilter === pst
                      ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {pst === 'all' ? 'All Payments' : pst}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</label>
              {isStartup && (
                <span 
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Lock className="w-3 h-3" /> Pro Feature
                </span>
              )}
            </div>
            <CustomSelect
              icon={Truck}
              value={isLocalMode ? 'all' : supplierFilter}
              onChange={(val) => setSupplierFilter(val)}
              options={[
                { value: 'all', label: 'All Suppliers' },
                ...suppliers.map(s => ({ value: String(s.id), label: s.name }))
              ]}
              label={isLocalMode ? 'All Suppliers (Locked)' : 'Select Supplier'}
              locked={isStartup}
              onLockedClick={() => setShowUpgradeModal(true)}
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Date Range</label>
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">From Date</span>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">To Date</span>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Sort By</label>
            <CustomSelect
              icon={CircleDollarSign}
              value={sortBy}
              onChange={(val: any) => setSortBy(val)}
              options={[
                { value: 'date_desc', label: 'Order Date (Newest First)' },
                { value: 'date_asc', label: 'Order Date (Oldest First)' },
                { value: 'total_desc', label: 'Total Amount (High to Low)' },
                { value: 'total_asc', label: 'Total Amount (Low to High)' },
              ]}
              label="Sort by..."
            />
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── SLIDE-OUT RIGHT PANEL: NEW / EDIT PURCHASE ──────────────── */}
      <MainRightPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onDiscard={handleDiscardChanges}
        title={editingPurchaseId ? "Edit Purchase Order" : "New Purchase"}
        subtitle={editingPurchaseId ? `PO #${editingPurchaseNumber || ''} • Update items, pricing & payment status` : "Create and manage supplier purchases"}
        icon={ShoppingBag}
        formId="purchaseOrderForm"
        isSubmitting={isSubmitting}
        saveText={editingPurchaseId ? "Update Purchase" : "Create Purchase"}
      >
        <form id="purchaseOrderForm" onSubmit={handleSavePurchaseOrder} className="font-sans space-y-4">
          
          {/* ──────────────── 1. Supplier & Schedule ──────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("supplier")}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.supplier ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-blue-600" />
                Supplier & Schedule
              </span>
              {openSections.supplier ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {openSections.supplier && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Supplier Name {!isStartup && <span className="text-red-500">*</span>}
                      </label>
                      <div className="space-y-3">
                        <div className="relative">
                          <button
                            id="supplier-select-btn"
                            type="button"
                            onClick={() => {
                              if (isStartup) {
                                setShowUpgradeModal(true);
                                return;
                              }
                              setSecondaryPanel(prev => prev === 'SUPPLIER' ? null : 'SUPPLIER');
                              setSupplierSearch('');
                            }}
                            className={`w-full flex items-center justify-between px-4 h-11 bg-slate-100 dark:bg-slate-900 border rounded-xl font-medium text-sm transition-all text-left ${
                              selectedSupplier || (formSupplierId === 'custom' && customSupplierName)
                                ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-900/10 text-slate-900 dark:text-white' 
                                : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="truncate">
                                {isStartup 
                                  ? 'Direct Purchase (Default)' 
                                  : formSupplierId === 'custom' 
                                    ? (customSupplierName || 'Custom Supplier') 
                                    : (selectedSupplier ? selectedSupplier.name : 'Select Supplier...')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isStartup ? (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              ) : selectedSupplier ? (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                  1 Selected
                                </span>
                              ) : null}
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${secondaryPanel === 'SUPPLIER' ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          <ValidationErrorTooltip error={validationError} fieldId="supplier-select-btn" />
                        </div>

                        {/* Selected Supplier Preview Card */}
                        {selectedSupplier && !isStartup && (
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
                                setFormSupplierId('');
                              }}
                              className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
                              title="Remove supplier"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {isStartup && (
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          Supplier tracking is locked on Startup plan. Your order will be recorded as a Direct Purchase.
                        </p>
                      )}
                    </div>

                    {!isStartup && formSupplierId === 'custom' && (
                      <div className="space-y-2 pt-1">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Custom Supplier Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="field-custom-supplier-name"
                            type="text"
                            placeholder="e.g. Acme Lanka Importers"
                            value={customSupplierName}
                            onChange={(e) => setCustomSupplierName(e.target.value)}
                            className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          />
                          <ValidationErrorTooltip error={validationError} fieldId="field-custom-supplier-name" />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Order Date</label>
                        <input
                          type="date"
                          value={orderDate}
                          onChange={(e) => setOrderDate(e.target.value)}
                          className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expected Delivery</label>
                        <input
                          type="date"
                          value={expectedDate}
                          onChange={(e) => setExpectedDate(e.target.value)}
                          className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Reference / Invoice #</label>
                      <input
                        type="text"
                        placeholder="e.g. INV-8821"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                        className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ──────────────── 2. Order Line Items ──────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("items")}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.items ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-blue-600" />
                Order Items ({orderItems.length})
              </span>
              {openSections.items ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {openSections.items && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Select Product <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          id="product-select-btn"
                          type="button"
                          onClick={() => {
                            setSecondaryPanel(prev => prev === 'PRODUCT' ? null : 'PRODUCT');
                            setProductSearch('');
                          }}
                          className={`w-full flex items-center justify-between px-4 h-11 bg-slate-100 dark:bg-slate-900 border rounded-xl font-medium text-sm transition-all text-left group ${
                            orderItems.length > 0 
                              ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-900/10 text-slate-900 dark:text-white' 
                              : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <Package className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate">
                              {orderItems.length > 0 ? `${orderItems.length} Product${orderItems.length > 1 ? 's' : ''} in Order` : 'Select Product...'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {orderItems.length > 0 && (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-all duration-200 flex items-center gap-1 shadow-xs">
                                <span className="group-hover:hidden">{orderItems.length} Added</span>
                                <span className="hidden group-hover:inline font-bold">Change</span>
                              </span>
                            )}
                            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-transform ${secondaryPanel === 'PRODUCT' ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        <ValidationErrorTooltip error={validationError} fieldId="product-select-btn" />
                      </div>
                    </div>

                    {/* Added Items List */}
                    {orderItems.length === 0 ? (
                      <div className="p-5 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <Package className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No items added</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click above to browse and add products to this order.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orderItems.map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Package className="w-4 h-4 text-blue-600 shrink-0" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.productName}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
                                title="Remove item"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3 items-center">
                              <div>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Qty ({item.unit || 'pcs'})</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItemQuantity(idx, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 h-11 text-xs font-bold text-center text-slate-800 dark:text-white outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Cost (Rs.)</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitCost}
                                  onChange={(e) => handleUpdateItemCost(idx, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 h-11 text-xs font-bold text-right text-slate-800 dark:text-white outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="text-right">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Total</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white block truncate">
                                  Rs. {(item.quantity * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ──────────────── 3. Financials & Extra Charges ──────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("pricing")}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.pricing ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <CircleDollarSign className="w-4 h-4 text-blue-600" />
                Financials & Extra Charges
              </span>
              {openSections.pricing ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {openSections.pricing && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Discount (Rs.)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(e.target.value)}
                          className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Tax / VAT (Rs.)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={taxAmount}
                          onChange={(e) => setTaxAmount(e.target.value)}
                          className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Shipping (Rs.)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingFee}
                          onChange={(e) => setShippingFee(e.target.value)}
                          className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Net Total Summary Box */}
                    <div className="p-4 bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl space-y-2">
                      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Items Subtotal:</span>
                        <span className="font-bold text-slate-900 dark:text-white">Rs. {formSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      {Number(discountAmount) > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Discount:</span>
                          <span>- Rs. {Number(discountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {Number(shippingFee) > 0 && (
                        <div className="flex justify-between text-sm text-slate-500">
                          <span>Shipping:</span>
                          <span>+ Rs. {Number(shippingFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-blue-200/60 dark:border-blue-800/40">
                        <span>Net Purchase Total:</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          Rs. {formTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ──────────────── 4. Payment & Stock Receipt ──────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("payment")}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.payment ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Payment & Stock Receipt
              </span>
              {openSections.payment ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {openSections.payment && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Status</label>
                        <CustomSelect
                          value={formPaymentStatus}
                          onChange={(val: any) => setFormPaymentStatus(val)}
                          options={[
                            { value: 'UNPAID', label: 'UNPAID (Pay Later)' },
                            { value: 'PARTIAL', label: 'PARTIAL (Deposit Paid)' },
                            { value: 'PAID', label: 'PAID (Fully Settled)' },
                          ]}
                          label="Payment Status"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Method</label>
                        <CustomSelect
                          value={formPaymentMethod}
                          onChange={(val) => setFormPaymentMethod(val)}
                          options={[
                            { value: 'CASH', label: 'Cash' },
                            { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                            { value: 'CARD', label: 'Credit / Debit Card' },
                            { value: 'CHEQUE', label: 'Cheque' },
                            { value: 'CREDIT', label: 'Supplier Credit' },
                          ]}
                          label="Payment Method"
                        />
                      </div>
                    </div>

                    {formPaymentStatus === 'PARTIAL' && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Paid Amount (Rs.) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="field-paid-amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            placeholder="Enter amount paid"
                            className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          />
                          <ValidationErrorTooltip error={validationError} fieldId="field-paid-amount" />
                        </div>
                      </div>
                    )}

                    {/* Immediate Stock Receipt Toggle Switch */}
                    <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="pr-4">
                        <span className="text-sm font-bold text-slate-800 dark:text-white block">
                          Stock has already arrived
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 font-normal">
                          Instantly increments your branch product stock and records inventory audit logs.
                        </span>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${formStatus === 'RECEIVED' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formStatus === 'RECEIVED' ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formStatus === 'RECEIVED'}
                        onChange={(e) => setFormStatus(e.target.checked ? 'RECEIVED' : 'ORDERED')}
                      />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ──────────────── 5. Notes & Remarks ──────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("notes")}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.notes ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-blue-600" />
                Internal Notes & Remarks
              </span>
              {openSections.notes ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {openSections.notes && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="p-4 border-t border-slate-300 dark:border-slate-700">
                    <textarea
                      rows={3}
                      placeholder="Enter any notes, payment terms, or delivery remarks..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </MainRightPanel>

      {/* ──────────────── DELETE ORDER CONFIRMATION DIALOG ──────────────── */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Purchase Order?"
        message="Are you sure you want to permanently delete this purchase order? This action cannot be undone."
        confirmText="Delete Order"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />

      {/* ──────────────── UPGRADE MODAL (PLAN GATING) ──────────────── */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Supplier Management"
        requiredTier="Pro"
      />
      {/* ──────────────── SLIDE-OUT PANEL: SUPPLIER SELECTION ──────────────── */}
      <SelectSupplierPanel
        isOpen={secondaryPanel === 'SUPPLIER'}
        onClose={() => setSecondaryPanel(null)}
        onSelect={(supplierId) => {
          setFormSupplierId(supplierId || '');
          setSecondaryPanel(null);
        }}
        selectedSupplierId={formSupplierId}
        suppliers={suppliers}
        setSuppliers={setSuppliers}
      />

      {/* ──────────────── SLIDE-OUT PANEL: PRODUCT SELECTION ──────────────── */}
      <SecondaryRightPanel
        isOpen={secondaryPanel === 'PRODUCT'}
        onClose={() => setSecondaryPanel(null)}
        title="Select Product"
        subtitle={orderItems.length > 0 ? `${orderItems.length} product${orderItems.length > 1 ? 's' : ''} added to order` : "Choose products to add to purchase order"}
        icon={Package}
        hideFooter={false}
        footerContent={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSecondaryPanel(null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              Done Selecting {orderItems.length > 0 ? `(${orderItems.length} Added)` : ''}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pb-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search by product name, barcode or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-10 pr-10 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
            />
            {productSearch && (
              <button 
                type="button"
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
              onClick={() => {
                setSecondaryPanel(null);
                setIsAddProductPanelOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 px-5 h-12 rounded-xl font-bold transition-all cursor-pointer border border-blue-200 dark:border-blue-500/30"
            >
              <Plus className="w-5 h-5" /> Add New Product
            </button>
            
            <hr className="w-full border-slate-200 dark:border-slate-700 border-t-2" />

            {filteredProductsToSelect.length > 0 ? (
              filteredProductsToSelect.map(prod => {
                const existingItem = orderItems.find(it => it.productId === prod.id);
                const isSelected = !!existingItem;
                const pStock = Number(prod.stockQuantity ?? prod.stock ?? 0);
                const pUnit = prod.unit || 'pcs';
                const pCost = Number(prod.cost || prod.costPrice || 0);
                const pImg = prod.images?.[0]?.url || prod.image;

                return (
                  <div
                    key={prod.id}
                    onClick={() => handleToggleProduct(prod)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500/60 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                        {pImg ? (
                          <img src={pImg} alt={prod.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 pr-2 flex-1">
                        <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500 truncate shrink min-w-0">SKU: {prod.barcode || prod.sku || 'N/A'}</p>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                            Stock: {pStock} {getShortUnit(pUnit)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 shrink-0 pl-2">
                      {isSelected && existingItem ? (
                        /* When selected: Replace Unit Cost and Price with Quantity Stepper */
                        <div 
                          className="flex items-center bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-600 rounded-lg p-0.5 shadow-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (existingItem.quantity > 1) {
                                setOrderItems(prev => prev.map(it => it.productId === prod.id ? { ...it, quantity: it.quantity - 1, subtotal: (it.quantity - 1) * it.unitCost } : it));
                              } else {
                                setOrderItems(prev => prev.filter(it => it.productId !== prod.id));
                              }
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer transition-colors"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-blue-600 dark:text-blue-400 min-w-[20px] text-center">
                            {existingItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setOrderItems(prev => prev.map(it => it.productId === prod.id ? { ...it, quantity: it.quantity + 1, subtotal: (it.quantity + 1) * it.unitCost } : it));
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer transition-colors"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        /* When unselected: Show Unit Cost & Price */
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Cost</div>
                          <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                            Rs. {pCost.toFixed(2)}
                          </div>
                        </div>
                      )}

                      {/* Selection indicator */}
                      <div className="shrink-0">
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

            {productSearch.trim() && (
              <div
                onClick={() => {
                  handleAddCustomItem();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer shadow-sm mt-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="flex items-center gap-3 text-left overflow-hidden flex-1">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 text-slate-500">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 truncate pr-2">
                    <span className="block font-bold text-sm text-slate-900 dark:text-white truncate">
                      Other / Custom Product
                    </span>
                    <span className="block text-[10px] font-medium text-slate-500 truncate mt-0.5">
                      Add "{productSearch}" as custom item
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SecondaryRightPanel>

      <AddProductPanel 
        isOpen={isAddProductPanelOpen} 
        suppliers={suppliers}
        onClose={() => {
          setIsAddProductPanelOpen(false);
          setSecondaryPanel('PRODUCT');
        }} 
        rightOffset="right-[448px]"
        onSuccess={(newProduct: any) => {
            loadAllData();
            if (newProduct) {
              handleAddItem(newProduct);
            }
            setIsAddProductPanelOpen(false);
            setSecondaryPanel('PRODUCT');
        }} 
      />
    </div>
  );
}
