'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Edit, Trash2, 
  MapPin, Phone, Mail, FileText, CheckCircle, XCircle, Building2, UserCircle,
  Filter, List, LayoutGrid, Maximize, Minimize, Package, X, Truck, Copy, Banknote, CreditCard, ChevronDown, ChevronUp, Info,
  BarChart3, TrendingUp, Tag
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MainRightPanel } from '@/components/ui/right-panel';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';

const PROVINCES = [
  'Western', 'Central', 'Southern', 'North Western', 'Sabaragamuwa', 
  'Eastern', 'Uva', 'North Central', 'Northern'
];

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara', 'Negombo', 'Moratuwa', 'Sri Jayawardenepura Kotte'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya', 'Gampola', 'Dambulla'],
  'Southern': ['Galle', 'Matara', 'Hambantota', 'Tangalle', 'Weligama'],
  'North Western': ['Kurunegala', 'Puttalam', 'Kuliyapitiya', 'Chilaw'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle', 'Balangoda', 'Embilipitiya'],
  'Eastern': ['Trincomalee', 'Batticaloa', 'Ampara', 'Kattankudy'],
  'Uva': ['Badulla', 'Moneragala', 'Bandarawela', 'Haputale'],
  'North Central': ['Anuradhapura', 'Polonnaruwa', 'Hingurakgoda'],
  'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu']
};

const CATEGORIES = [
  'Electronics', 'Clothing', 'Groceries', 'Beverages', 'Hardware', 'Furniture', 
  'Stationery', 'Cosmetics', 'Toys', 'Automotive', 'Pharmaceuticals', 
  'Sporting Goods', 'Home Appliances', 'Footwear', 'Jewelry', 'Books', 
  'Music Instruments', 'Pet Supplies', 'Garden Supplies', 'Kitchenware',
  'Tools', 'Lighting', 'Plumbing', 'Paints', 'Textiles', 'Plastics',
  'Packaging', 'Chemicals', 'Cleaning Supplies', 'Office Supplies'
];
      




function TransactionHistoryView({ supplier, onBack }: { supplier: any, onBack: () => void }) {
  const txs = [
    { id: 'TXN-1029', date: '2023-10-01T10:00:00', ref: 'INV-001', desc: 'Stock Purchase - Electronics', debit: 0, credit: 150000, balance: 150000, method: 'BANK_TRANSFER', status: 'COMPLETED', createdBy: 'Admin' },
    { id: 'TXN-1035', date: '2023-10-05T14:30:00', ref: 'PAY-001', desc: 'Payment for INV-001', debit: 50000, credit: 0, balance: 100000, method: 'CASH', status: 'COMPLETED', createdBy: 'Cashier' },
    { id: 'TXN-1042', date: '2023-10-12T09:15:00', ref: 'INV-002', desc: 'Stock Purchase - Accessories', debit: 0, credit: 75000, balance: 175000, method: 'CREDIT', status: 'PENDING', createdBy: 'Admin' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {supplier.name} - Transaction History
          </h2>
          <p className="text-sm font-medium text-slate-500">View all debit, credit, and balance records.</p>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto bg-white dark:bg-slate-900">
        <div className="min-w-max h-full flex flex-col">
          <div className="grid grid-cols-[150px_120px_120px_250px_120px_120px_120px_150px_120px_120px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            <div>Date</div>
            <div>Txn ID</div>
            <div>Reference</div>
            <div>Description</div>
            <div className="text-right">Debit (Rs)</div>
            <div className="text-right">Credit (Rs)</div>
            <div className="text-right">Balance (Rs)</div>
            <div className="text-center">Pay Method</div>
            <div className="text-center">Status</div>
            <div>Created By</div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {txs.map((t, i) => (
              <div key={i} className="grid grid-cols-[150px_120px_120px_250px_120px_120px_120px_150px_120px_120px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.id}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.ref}</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{t.desc}</div>
                <div className="text-sm font-bold text-emerald-600 text-right">{t.debit > 0 ? t.debit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</div>
                <div className="text-sm font-bold text-red-600 text-right">{t.credit > 0 ? t.credit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</div>
                <div className="text-sm font-black text-slate-900 dark:text-white text-right">{t.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                <div className="text-center">
                  <span className="inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{t.method.replace('_', ' ')}</span>
                </div>
                <div className="text-center">
                  <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>{t.status}</span>
                </div>
                <div className="text-sm font-medium text-slate-500">{t.createdBy}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SuppliersOverviewProps {
  suppliers: any[];
  kpis: { total: number; active: number; inactive: number; recent: number };
  setActiveTab: (tab: 'overview' | 'table') => void;
  setStatusFilter: (st: string) => void;
  setCategoryFilter: (cat: string) => void;
  openEditPanel: (supplier: any) => void;
}

function SuppliersOverviewDashboard({
  suppliers,
  kpis,
  setActiveTab,
  setStatusFilter,
  setCategoryFilter,
  openEditPanel,
}: SuppliersOverviewProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartMetric, setChartMetric] = useState<'count' | 'txns'>('count');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Category breakdown chart data
  const chartData = useMemo(() => {
    const catMap = new Map<string, { name: string; count: number; txns: number }>();
    suppliers.forEach(s => {
      const cat = s.category || 'General';
      const cur = catMap.get(cat) || { name: cat, count: 0, txns: 0 };
      cur.count += 1;
      cur.txns += Number(s.transactionCount) || 0;
      catMap.set(cat, cur);
    });
    return Array.from(catMap.values()).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [suppliers]);

  // Top 5 Active Suppliers by Transactions
  const topActiveSuppliers = useMemo(() => {
    return [...suppliers]
      .sort((a, b) => (Number(b.transactionCount) || 0) - (Number(a.transactionCount) || 0));
  }, [suppliers]);

  // Top Supply Categories
  const topCategories = useMemo(() => {
    const catMap = new Map<string, number>();
    suppliers.forEach(s => {
      const cat = s.category || 'General';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    return Array.from(catMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [suppliers]);

  // Recently Added Suppliers
  const recentSuppliers = useMemo(() => {
    return [...suppliers]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [suppliers]);

  // Regional (Province/City) Distribution
  const regionalDistribution = useMemo(() => {
    const regionMap = new Map<string, number>();
    suppliers.forEach(s => {
      const reg = s.province || (s.city ? `${s.city} (City)` : 'General');
      regionMap.set(reg, (regionMap.get(reg) || 0) + 1);
    });
    return Array.from(regionMap.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* ──────────────── TOP 4 KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Suppliers" 
          value={kpis.total} 
          icon={Building2} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active Vendors" 
          value={kpis.active} 
          icon={CheckCircle} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Inactive Vendors" 
          value={kpis.inactive} 
          icon={XCircle} 
          iconColorClass="text-red-600" 
          iconBgClass="bg-red-50 dark:bg-red-500/10" 
        />
        <KpiCard 
          title="New (7 Days)" 
          value={kpis.recent} 
          icon={Users} 
          iconColorClass="text-purple-600" 
          iconBgClass="bg-purple-50 dark:bg-purple-500/10" 
        />
      </div>

      {/* ──────────────── 2. MAIN DASHBOARD GRID: CHART (2 Cols) + TOP SUPPLIERS (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 shrink-0">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Category & Activity Distribution
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {chartMetric === 'count' ? 'Number of registered vendors per supply sector' : 'Total transaction count per sector'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMetric('count')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'count' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Suppliers
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('txns')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'txns' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Transactions
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
                  No supplier categories found to plot.
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
                          chartMetric === 'count' ? `${v} Suppliers` : `${v} Transactions`,
                          chartMetric === 'count' ? 'Suppliers' : 'Transactions'
                        ]}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey={chartMetric === 'count' ? 'count' : 'txns'} fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: any) => [
                          chartMetric === 'count' ? `${v} Suppliers` : `${v} Transactions`,
                          chartMetric === 'count' ? 'Suppliers' : 'Transactions'
                        ]}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey={chartMetric === 'count' ? 'count' : 'txns'}
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
                Loading suppliers chart...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 font-medium">
            <span>Overall Supplier Network</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {kpis.total} Total Vendors ({kpis.active} Active)
            </span>
          </div>
        </div>

        {/* Right: Card 1 - Top 5 Active Suppliers by Transactions */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Most Active Suppliers
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              High Volume
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topActiveSuppliers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No suppliers registered yet.
              </div>
            ) : (
              topActiveSuppliers.slice(0, 5).map((sup, i) => {
                const rankColors = [
                  'bg-blue-600 text-white',
                  'bg-blue-500 text-white',
                  'bg-indigo-500 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div
                    key={sup.id || i}
                    onClick={() => openEditPanel(sup)}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view/edit supplier"
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
                          {sup.contactPerson || sup.city || 'Vendor'} • {sup.category || 'General'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 shrink-0">
                      {sup.transactionCount || 0} Txns
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
              View All in Suppliers Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 RANKINGS / INSIGHTS CARDS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 2: Top Supply Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Supply Categories
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Sectors
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topCategories.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No categories registered.
              </div>
            ) : (
              topCategories.slice(0, 5).map((cat, i) => (
                <div
                  key={cat.name || i}
                  onClick={() => {
                    setCategoryFilter(cat.name);
                    setActiveTab('table');
                  }}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to filter category in table"
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
                        {cat.count} vendor{cat.count !== 1 ? 's' : ''} supplying
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                    {Math.round((cat.count / Math.max(1, suppliers.length)) * 100)}%
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
              Filter Categories in Table →
            </button>
          </div>
        </div>

        {/* Card 3: Recently Added Suppliers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Recently Added
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              New Vendors
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {recentSuppliers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No recent suppliers recorded.
              </div>
            ) : (
              recentSuppliers.slice(0, 5).map((sup, i) => (
                <div
                  key={sup.id || i}
                  onClick={() => openEditPanel(sup)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view supplier"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                        {sup.name}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                        {sup.city || sup.province || 'Registered'} • {sup.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                    {sup.contactPerson || 'Vendor'}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Suppliers Table →
            </button>
          </div>
        </div>

        {/* Card 4: Regional Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Regional Coverage
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Provinces
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {regionalDistribution.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No location data registered.
              </div>
            ) : (
              regionalDistribution.slice(0, 5).map((reg, i) => (
                <div
                  key={reg.region || i}
                  onClick={() => setActiveTab('table')}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view suppliers in table"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">
                        {reg.region}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {reg.count} supplier{reg.count !== 1 ? 's' : ''} located
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 shrink-0">
                    {Math.round((reg.count / Math.max(1, suppliers.length)) * 100)}%
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              Filter by Region in Table →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Tab & View & Filter State
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactionSort, setTransactionSort] = useState('default');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    contactPersonPhone: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Sri Lanka',
    province: '',
    category: '',
    brNumber: '',
    openingBalance: '',
    creditLimit: '',
    paymentTerms: 'CASH',
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    notes: '',
    active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [openSections, setOpenSections] = useState({
    basic: true,
    location: false,
    financial: false,
    bank: false,
    notes: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        basic: false,
        location: false,
        financial: false,
        bank: false,
        notes: false,
        [section]: true
      };
    });
  };
  
  // Delete Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_supplier_form');
    } catch (e) {}
    resetForm();
    setIsPanelOpen(false);
  };

  // Auto-save draft for new supplier
  useEffect(() => {
    if (editingSupplier || !isPanelOpen) return;
    const hasData = Boolean(
      formData.name || formData.contactPerson || formData.phone || formData.email ||
      formData.address || formData.city || formData.category || formData.notes
    );
    if (hasData) {
      try {
        localStorage.setItem('draft_supplier_form', JSON.stringify(formData));
      } catch (e) {}
    }
  }, [formData, editingSupplier, isPanelOpen]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerAPI.getSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      toast.error('Failed to load suppliers');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerValidation('basic', 'field-supplier-name', 'Supplier name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingSupplier) {
        await storeOwnerAPI.updateSupplier(editingSupplier.id, formData);
        toast.success('Supplier updated successfully!');
      } else {
        await storeOwnerAPI.createSupplier(formData);
        toast.success('Supplier added successfully!');
      }
      setIsPanelOpen(false);
      try {
        localStorage.removeItem('draft_supplier_form');
      } catch (e) {}
      resetForm();
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save supplier');
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
      await storeOwnerAPI.deleteSupplier(confirmDialog.id);
      toast.success('Supplier deleted');
      fetchSuppliers();
      setConfirmDialog({ isOpen: false, id: null });
    } catch (err) {
      toast.error('Failed to delete supplier');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddPanel = () => {
    setEditingSupplier(null);
    try {
      const saved = localStorage.getItem('draft_supplier_form');
      if (saved) {
        setFormData(JSON.parse(saved));
      } else {
        resetForm();
      }
    } catch (e) {
      resetForm();
    }
    setIsPanelOpen(true);
  };

  const openEditPanel = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      contactPersonPhone: supplier.contactPersonPhone || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
      province: supplier.province || '',
      category: supplier.category || '',
      brNumber: supplier.brNumber || '',
      openingBalance: supplier.openingBalance || '',
      creditLimit: supplier.creditLimit || '',
      paymentTerms: supplier.paymentTerms || 'CASH',
      bankName: supplier.bankName || '',
      accountName: supplier.accountName || '',
      accountNumber: supplier.accountNumber || '',
      branch: supplier.branch || '',
      notes: supplier.notes || '',
      active: supplier.active !== undefined ? supplier.active : true
    });
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({
      name: '', contactPerson: '', contactPersonPhone: '', phone: '', email: '', 
      address: '', city: '', country: '', province: '',
      category: '', brNumber: '',
      openingBalance: '', creditLimit: '', paymentTerms: 'CASH',
      bankName: '', accountName: '', accountNumber: '', branch: '',
      notes: '', active: true
    });
  };

  const filteredSuppliers = useMemo(() => {
    let result = suppliers.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = 
        s.name?.toLowerCase().includes(q) ||
        s.contactPerson?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q);
        
        let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = s.active === true;
      if (statusFilter === 'inactive') matchesStatus = s.active === false;

      let matchesCategory = true;
      if (categoryFilter !== 'all') matchesCategory = s.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (transactionSort === 'most') {
      result.sort((a, b) => (b.transactionCount || 0) - (a.transactionCount || 0));
    } else if (transactionSort === 'least') {
      result.sort((a, b) => (a.transactionCount || 0) - (b.transactionCount || 0));
    } else {
      // default: latest transaction
      result.sort((a, b) => new Date(b.lastTransactionDate || b.createdAt).getTime() - new Date(a.lastTransactionDate || a.createdAt).getTime());
    }

    return result;
  }, [suppliers, search, statusFilter, transactionSort]);

  const kpis = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.active).length;
    const inactive = total - active;
    const recent = suppliers.filter(s => {
      const days = (new Date().getTime() - new Date(s.createdAt).getTime()) / (1000 * 3600 * 24);
      return days <= 7;
    }).length;
    return { total, active, inactive, recent };
  }, [suppliers]);

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="font-sans flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Supplier Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Add, update, and manage your store's suppliers efficiently.</p>
          </div>
          
          <button 
            onClick={openAddPanel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Supplier
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Suppliers Overview | Suppliers Table) */}
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
            Suppliers Overview
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
            Suppliers Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search suppliers..."
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
              statusFilter !== 'all' || categoryFilter !== 'all' || transactionSort !== 'default'
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Filter Suppliers"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Filters</span>
            {(statusFilter !== 'all' || categoryFilter !== 'all' || transactionSort !== 'default') && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
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
        <SuppliersOverviewDashboard
          suppliers={suppliers}
          kpis={kpis}
          setActiveTab={setActiveTab}
          setStatusFilter={setStatusFilter}
          setCategoryFilter={setCategoryFilter}
          openEditPanel={openEditPanel}
        />
      ) : (
        /* ──────────────── DATA TABLE ──────────────── */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>

        {viewingSupplier ? (
          <TransactionHistoryView supplier={viewingSupplier} onBack={() => setViewingSupplier(null)} />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <TableEmptyState
            icon={Building2}
            title="No suppliers found"
            description="You haven't added any suppliers yet, or none match your search. Click below to add your first supplier."
            actionLabel="Create First Supplier"
            onAction={openAddPanel}
          />
        ) : viewMode === 'list' ? (
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[250px_150px_250px_200px_150px_150px_150px_100px_100px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Supplier Name</div>
                <div>Category & BR</div>
                <div>Contact Details</div>
                <div>Location</div>
                <div>Financial Info</div>
                <div>Bank Details</div>
                <div>Transactions</div>
                <div className="text-right">Status</div>
                <div className="text-center">Action</div>
              </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {filteredSuppliers.map((s) => (
                  <div key={s.id} onClick={() => setViewingSupplier(s)} className="cursor-pointer grid grid-cols-[250px_150px_250px_200px_150px_150px_150px_100px_100px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    
                    {/* Supplier Name */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{s.name}</h3>
                        <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                          <UserCircle className="w-3 h-3" />
                          {s.contactPerson || 'No contact person'}
                        </p>
                      </div>
                    </div>

                    {/* Category & BR */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{s.category || '-'}</span>
                      <span className="text-xs text-slate-500 truncate">BR: {s.brNumber || '-'}</span>
                    </div>

                    {/* Contact Details */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      {s.phone ? (
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 group/copy">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{s.phone}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.phone); toast.success('Phone copied!'); }}
                            className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded"
                            title="Copy Phone"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : <span className="text-xs italic text-slate-400">No phone</span>}
                      
                      {s.email ? (
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 group/copy">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{s.email}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.email); toast.success('Email copied!'); }}
                            className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded"
                            title="Copy Email"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Location */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{s.city ? `${s.city}, ${s.province}` : '-'}</span>
                      <span className="text-xs text-slate-500 truncate">{s.country || 'Sri Lanka'}</span>
                    </div>

                    {/* Financial Info */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">Limit: {s.creditLimit || '0.00'}</span>
                      <span className="text-xs text-slate-500 truncate">Terms: {s.paymentTerms || 'CASH'}</span>
                    </div>

                    {/* Bank Details */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{s.bankName || '-'}</span>
                      <span className="text-xs text-slate-500 truncate">{s.accountNumber || '-'}</span>
                    </div>

                    {/* Transactions */}
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{s.transactionCount || 0} Txns</p>
                          <p className="text-xs text-slate-500 truncate">{s.lastTransactionDate ? new Date(s.lastTransactionDate).toLocaleDateString() : 'No history'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-end">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                        s.active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditPanel(s); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Supplier">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Supplier">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSuppliers.map((s) => (
                  <div key={s.id} onClick={() => setViewingSupplier(s)} className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col min-h-[240px]">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                        s.active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col mb-4">
                      <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate">{s.name}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate mb-3 flex items-center gap-1">
                        <UserCircle className="w-3 h-3" />
                        {s.contactPerson || 'No Contact Person'}
                      </p>
                      
                      <div className="space-y-1.5 mb-4">
                        {s.phone && (
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 group/copy">
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{s.phone}</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.phone); toast.success('Phone copied!'); }}
                              className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1"
                              title="Copy Phone"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {s.email && (
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 group/copy">
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{s.email}</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.email); toast.success('Email copied!'); }}
                              className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1"
                              title="Copy Email"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-auto flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{s.transactionCount || 0} Transactions</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditPanel(s); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">
                        Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}
      </div>
      )}

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Suppliers"
        onClear={() => { setStatusFilter('all'); setTransactionSort('default'); setCategoryFilter('all'); setIsFilterOpen(false); }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Status</label>
          <CustomSelect
            icon={CheckCircle}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Suppliers' },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive Only' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort by Transactions</label>
          <CustomSelect
            icon={TrendingUp}
            value={transactionSort}
            onChange={setTransactionSort}
            options={[
              { value: 'default', label: 'Last Transaction (Default)' },
              { value: 'most', label: 'Most Transactions' },
              { value: 'least', label: 'Least Transactions' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Category</label>
          <CustomSelect
            icon={Tag}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'All Categories' },
              ...Array.from(new Set(suppliers.map(s => s.category).filter(Boolean))).map(cat => ({ value: cat, label: cat }))
            ]}
          />
        </div>
      </FilterPanel>

      {/* ──────────────── SLIDE OUT PANEL FOR ADD/EDIT ──────────────── */}
      <MainRightPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onDiscard={handleDiscardChanges}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        subtitle={editingSupplier ? 'Update supplier profile and terms' : 'Register a new vendor contact'}
        icon={Truck}
        formId="supplierForm"
        isSubmitting={isSubmitting}
        saveText={editingSupplier ? 'Save Changes' : 'Save Supplier'}
      >
        <form id="supplierForm" onSubmit={handleSave} className="font-sans space-y-4">
                  
                  {/* 1. Basic Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("basic")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.basic ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Basic Details
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
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                Supplier Name <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input 
                                  id="field-supplier-name"
                                  type="text" 
                                  value={formData.name} 
                                  onChange={e => {
                                    if (validationError?.field === 'field-supplier-name') setValidationError(null);
                                    setFormData({...formData, name: e.target.value});
                                  }} 
                                  className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" 
                                  placeholder="e.g. Acme Corporation" 
                                />
                                <ValidationErrorTooltip error={validationError} fieldId="field-supplier-name" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                                <CustomSelect 
                                  value={formData.category} 
                                  onChange={v => setFormData({...formData, category: v})} 
                                  options={CATEGORIES.map(c => ({ value: c, label: c }))} 
                                  label="Select Category" 
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                  BR Number
                                  <div className="relative group flex items-center">
                                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                      Business Registration
                                    </div>
                                  </div>
                                </label>
                                <input type="text" value={formData.brNumber} onChange={e => setFormData({...formData, brNumber: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. PV012345" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Supplier Phone</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. 011 234 5678" />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. contact@acme.com" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Contact Person</label>
                                <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. John Smith" />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Contact Person Phone</label>
                                <input type="text" value={formData.contactPersonPhone} onChange={e => setFormData({...formData, contactPersonPhone: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. 077 123 4567" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 2. Location Information */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("location")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.location ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Location Information
                      </span>
                      {openSections.location ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.location && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Address</label>
                              <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none resize-none" rows={2} placeholder="Street address" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Province</label>
                                <CustomSelect 
                                  value={formData.province} 
                                  onChange={v => setFormData({...formData, province: v, city: ''})} 
                                  options={PROVINCES.map(p => ({ value: p, label: p }))} 
                                  label="Select Province" 
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                                <CustomSelect 
                                  value={formData.city} 
                                  onChange={v => setFormData({...formData, city: v})} 
                                  options={(formData.province ? CITIES_BY_PROVINCE[formData.province] || [] : Object.values(CITIES_BY_PROVINCE).flat()).map(c => ({ value: c, label: c }))} 
                                  label="Select City" 
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Country</label>
                              <input readOnly type="text" value={formData.country} className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-sm text-slate-500 outline-none cursor-not-allowed" placeholder="e.g. Sri Lanka" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. Financial Settings */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("financial")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.financial ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Banknote className="w-4 h-4 text-blue-600" />
                        Financial Settings
                      </span>
                      {openSections.financial ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.financial && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Opening Balance</label>
                                <input type="number" value={formData.openingBalance} onChange={e => setFormData({...formData, openingBalance: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="Default 0.00" />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Credit Limit</label>
                                <input type="number" value={formData.creditLimit} onChange={e => setFormData({...formData, creditLimit: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="0.00" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Payment Terms</label>
                              <CustomSelect 
                                value={formData.paymentTerms} 
                                onChange={v => setFormData({...formData, paymentTerms: v})} 
                                options={[
                                  { value: 'CASH', label: 'Cash (Immediate)' },
                                  { value: '7_DAYS', label: '7 Days' },
                                  { value: '15_DAYS', label: '15 Days' },
                                  { value: '30_DAYS', label: '30 Days' },
                                  { value: '60_DAYS', label: '60 Days' },
                                  { value: 'AFTER_SELL', label: 'After Sell' }
                                ]} 
                                label="Select Terms" 
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 4. Bank & Settlement Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("bank")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.bank ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        Bank & Settlement Details
                      </span>
                      {openSections.bank ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.bank && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Bank Name</label>
                              <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. Commercial Bank" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Account Name</label>
                                <input type="text" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. John Smith" />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Account Number</label>
                                <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. 1234567890" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Branch</label>
                              <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. Colombo 03" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 5. Internal Notes & Status */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("notes")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.notes ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Info className="w-4 h-4 text-blue-600" />
                        Internal Notes & Status
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
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Notes / Remarks</label>
                              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none resize-none" rows={3} placeholder="Any additional details..." />
                            </div>
                            <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <div>
                                <span className="block text-sm font-bold text-slate-900 dark:text-white">Active Supplier</span>
                                <span className="block text-xs font-medium text-slate-500 mt-0.5">Toggle whether this supplier is currently active.</span>
                              </div>
                              <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${formData.active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.active ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                              <input type="checkbox" className="hidden" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

        </form>
      </MainRightPanel>

      {/* ──────────────── DELETE CONFIRMATION ──────────────── */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Supplier?"
        message="Are you sure you want to permanently delete this supplier? This action cannot be undone."
        confirmText="Delete Supplier"
        cancelText="Cancel"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
        isLoading={isDeleting}
      />

    </div>
  );
}
