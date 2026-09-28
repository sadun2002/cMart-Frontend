'use client';
import { Suspense } from 'react';

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Edit, Trash2, 
  MapPin, Phone, Mail, FileText, CheckCircle, XCircle, UserCircle,
  Filter, List, LayoutGrid, Maximize, Minimize, X, Gift, ShoppingBag, Banknote, ChevronDown, ChevronUp, Copy,
  BarChart3, User, CreditCard, SlidersHorizontal, CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MainRightPanel } from '@/components/ui/right-panel';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara', 'Negombo', 'Moratuwa', 'Sri Jayawardenepura Kotte'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya', 'Gampola', 'Dambulla'],
  'Southern': ['Galle', 'Matara', 'Hambantota', 'Tangalle', 'Weligama'],
  'North Western': ['Kurunegala', 'Puttalam', 'Kuliyapitiya', 'Chilaw'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle', 'Balangoda', 'Embilipitiya'],
  'Eastern': ['Trincomalee', 'Batticaloa', 'Ampara', 'Kattankudy'],
  'Uva': ['Badulla', 'Monaragala', 'Bandarawela', 'Haputale'],
  'North Central': ['Anuradhapura', 'Polonnaruwa', 'Kekirawa', 'Medawachchiya'],
  'Northern': ['Jaffna', 'Vavuniya', 'Mannar', 'Kilinochchi', 'Point Pedro']
};


function CustomerHistoryView({ customer, onBack, formatCurrency }: { customer: any, onBack: () => void, formatCurrency: (v: any) => string }) {
  const orders = [
    { id: 'ORD-1029', date: '2023-10-01T10:00:00', items: '2x Wireless Mouse, 1x Keyboard', total: 15000, discount: 500, netTotal: 14500, pointsEarned: 145, payMethod: 'CARD', status: 'COMPLETED', cashier: 'Admin' },
    { id: 'ORD-1035', date: '2023-10-05T14:30:00', items: '1x Monitor, 1x HDMI Cable', total: 45000, discount: 0, netTotal: 45000, pointsEarned: 450, payMethod: 'CASH', status: 'COMPLETED', cashier: 'Cashier' },
    { id: 'ORD-1042', date: '2023-10-12T09:15:00', items: '3x USB Drive 64GB', total: 7500, discount: 0, netTotal: 7500, pointsEarned: 75, payMethod: 'CREDIT', status: 'PENDING', cashier: 'Admin' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {customer.name} - Order History
          </h2>
          <p className="text-sm font-medium text-slate-500">View all past purchases, points earned, and payment details.</p>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto bg-white dark:bg-slate-900">
        <div className="min-w-max h-full flex flex-col">
          <div className="grid grid-cols-[150px_120px_250px_120px_120px_120px_120px_150px_120px_120px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            <div>Date</div>
            <div>Order ID</div>
            <div>Items Summary</div>
            <div className="text-right">Total (Rs)</div>
            <div className="text-right">Discount (Rs)</div>
            <div className="text-right">Net Total (Rs)</div>
            <div className="text-center">Points Earned</div>
            <div className="text-center">Pay Method</div>
            <div className="text-center">Status</div>
            <div>Cashier</div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {orders.map((o, i) => (
              <div key={i} className="grid grid-cols-[150px_120px_250px_120px_120px_120px_120px_150px_120px_120px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(o.date).toLocaleDateString()} {new Date(o.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{o.id}</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{o.items}</div>
                <div className="text-sm font-bold text-slate-600 text-right">{o.total > 0 ? o.total.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</div>
                <div className="text-sm font-bold text-red-600 text-right">{o.discount > 0 ? o.discount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 text-right">{o.netTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                <div className="text-center text-sm font-bold text-amber-500">+{o.pointsEarned}</div>
                <div className="text-center">
                  <span className="inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{o.payMethod.replace('_', ' ')}</span>
                </div>
                <div className="text-center">
                  <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>{o.status}</span>
                </div>
                <div className="text-sm font-medium text-slate-500">{o.cashier}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CustomersOverviewProps {
  customers: any[];
  kpis: { total: number; active: number; recent: number; totalSpent: number };
  setActiveTab: (tab: 'overview' | 'table') => void;
  setStatusFilter: (st: string) => void;
  setGroupFilter: (grp: string) => void;
  openEditPanel: (customer: any) => void;
  formatCurrency: (val: any) => string;
}

function CustomersOverviewDashboard({
  customers,
  kpis,
  setActiveTab,
  setStatusFilter,
  setGroupFilter,
  openEditPanel,
  formatCurrency,
}: CustomersOverviewProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartMetric, setChartMetric] = useState<'count' | 'spend'>('count');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Customer Groups breakdown chart data
  const chartData = useMemo(() => {
    const groupMap = new Map<string, { name: string; count: number; spend: number }>();
    customers.forEach(c => {
      const grp = c.customerGroup || 'REGULAR';
      const cur = groupMap.get(grp) || { name: grp, count: 0, spend: 0 };
      cur.count += 1;
      cur.spend += Number(c.totalSpent) || 0;
      groupMap.set(grp, cur);
    });
    return Array.from(groupMap.values()).sort((a, b) => b.count - a.count);
  }, [customers]);

  // Top 5 Spenders by totalSpent
  const topSpenders = useMemo(() => {
    return [...customers]
      .sort((a, b) => (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0));
  }, [customers]);

  // Top 5 Loyalty Points Leaders
  const topLoyalty = useMemo(() => {
    return [...customers]
      .sort((a, b) => (Number(b.loyaltyPoints) || 0) - (Number(a.loyaltyPoints) || 0));
  }, [customers]);

  // Customer Groups
  const customerGroups = useMemo(() => {
    const map = new Map<string, number>();
    customers.forEach(c => {
      const grp = c.customerGroup || 'REGULAR';
      map.set(grp, (map.get(grp) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [customers]);

  // Customers with Credit Limits
  const creditCustomers = useMemo(() => {
    return [...customers]
      .filter(c => Number(c.creditLimit) > 0)
      .sort((a, b) => (Number(b.creditLimit) || 0) - (Number(a.creditLimit) || 0));
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* ──────────────── 1. KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Customers" 
          value={kpis.total} 
          icon={Users} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active Customers" 
          value={kpis.active} 
          icon={CheckCircle} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Total Spent" 
          value={`Rs. ${formatCurrency(kpis.totalSpent)}`}
          icon={Banknote} 
          iconColorClass="text-orange-600" 
          iconBgClass="bg-orange-50 dark:bg-orange-500/10" 
        />
        <KpiCard 
          title="New (7 Days)" 
          value={kpis.recent} 
          icon={Users} 
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
                Customer Distribution by Segment
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analyze registered customer volume and spend per group
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMetric('count')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'count' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Customers
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('spend')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'spend' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Spend (Rs)
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
                  No customer segments found to plot.
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
                          chartMetric === 'count' ? `${v} Customers` : `Rs. ${Number(v).toLocaleString()}`,
                          chartMetric === 'count' ? 'Customers' : 'Total Spend'
                        ]}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey={chartMetric === 'count' ? 'count' : 'spend'} fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: any) => [
                          chartMetric === 'count' ? `${v} Customers` : `Rs. ${Number(v).toLocaleString()}`,
                          chartMetric === 'count' ? 'Customers' : 'Total Spend'
                        ]}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey={chartMetric === 'count' ? 'count' : 'spend'} stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : null}
          </div>
        </div>

        {/* Card 1: Top Spenders by Revenue (1 col, h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Top Spenders by Revenue
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              High Value
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topSpenders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No customer spend data available.
              </div>
            ) : (
              topSpenders.slice(0, 5).map((cust, i) => {
                const rankColors = [
                  'bg-emerald-600 text-white',
                  'bg-emerald-500 text-white',
                  'bg-teal-500 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div
                    key={cust.id || i}
                    onClick={() => openEditPanel(cust)}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view/edit customer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                          {cust.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {cust.phone || cust.city || 'Customer'} • {cust.customerGroup || 'REGULAR'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      Rs. {formatCurrency(cust.totalSpent || 0)}
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
              View All in Customers Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 RANKINGS / INSIGHTS CARDS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 2: Loyalty Points Leaders */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Loyalty Points Leaders
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              Rewards
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topLoyalty.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No loyalty points recorded.
              </div>
            ) : (
              topLoyalty.slice(0, 5).map((cust, i) => (
                <div
                  key={cust.id || i}
                  onClick={() => openEditPanel(cust)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view/edit customer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                        {cust.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {cust.phone || 'Member'} • {cust.loyaltyEnabled ? 'Loyalty Active' : 'Standard'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-500 shrink-0">
                    {Number(cust.loyaltyPoints || 0).toLocaleString()} pts
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
              View All Loyalty Members in Table →
            </button>
          </div>
        </div>

        {/* Card 3: Customer Segments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Customer Segments
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Groups
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {customerGroups.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No customer segments found.
              </div>
            ) : (
              customerGroups.slice(0, 5).map((grp, i) => (
                <div
                  key={grp.name || i}
                  onClick={() => {
                    setGroupFilter(grp.name);
                    setActiveTab('table');
                  }}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to filter segment in table"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                        {grp.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {grp.count} customer{grp.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                    {Math.round((grp.count / Math.max(1, customers.length)) * 100)}%
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
              Filter Segments in Table →
            </button>
          </div>
        </div>

        {/* Card 4: Credit & Account Limits */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Credit Account Limits
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Credit
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {creditCustomers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No credit accounts assigned.
              </div>
            ) : (
              creditCustomers.slice(0, 5).map((cust, i) => (
                <div
                  key={cust.id || i}
                  onClick={() => openEditPanel(cust)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view/edit customer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">
                        {cust.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Terms: {cust.paymentTerms || 'CASH'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 shrink-0">
                    Limit: Rs. {formatCurrency(cust.creditLimit || 0)}
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
              Manage Credit in Table →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomersPageContent() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [termsFilter, setTermsFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc'); 
  
  // History Panel state
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_customer_form');
    } catch (e) {}
    resetForm();
    setIsPanelOpen(false);
  };
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    customerGroup: 'REGULAR',
    dateOfBirth: '',
    gender: 'OTHER',
    openingBalance: '',
    creditLimit: '',
    paymentTerms: 'CASH',
    loyaltyEnabled: false,
    loyaltyPoints: '',
    active: true,
    notes: '',
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save draft when adding a new customer
  useEffect(() => {
    if (editingId || !isPanelOpen) return;
    const hasData = Boolean(
      formData.name || formData.phone || formData.email || formData.address ||
      formData.city || formData.province || formData.notes || formData.creditLimit
    );
    if (hasData) {
      try {
        localStorage.setItem('draft_customer_form', JSON.stringify(formData));
      } catch (e) {}
    }
  }, [formData, editingId, isPanelOpen]);

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    address: false,
    customer: false,
    financial: false,
    loyalty: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        basic: false,
        address: false,
        customer: false,
        financial: false,
        loyalty: false,
        [section]: true
      };
    });
  };
  
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsPanelOpen(true);
    }
  }, [searchParams]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerAPI.getCustomers();
      setCustomers(res.data);
    } catch (err) {
      toast.error('Failed to load customers');
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

    if (sectionKey && !openSections[sectionKey]) {
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
      triggerValidation('basic', 'field-customer-name', 'Customer name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await storeOwnerAPI.updateCustomer(editingId, formData);
        toast.success('Customer updated successfully!');
      } else {
        await storeOwnerAPI.createCustomer(formData);
        toast.success('Customer added successfully!');
      }
      setIsPanelOpen(false);
      try {
        localStorage.removeItem('draft_customer_form');
      } catch (e) {}
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      setIsDeleting(true);
      await storeOwnerAPI.deleteCustomer(deleteConfirm.id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
      setDeleteConfirm({ isOpen: false, id: null });
    } catch (err) {
      toast.error('Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddPanel = () => {
    setEditingId(null);
    try {
      const saved = localStorage.getItem('draft_customer_form');
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

  const openHistory = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleEdit = (c: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      city: c.city || '',
      province: c.province || '',
      customerGroup: c.customerGroup || 'REGULAR',
      dateOfBirth: c.dateOfBirth || '',
      gender: c.gender || 'OTHER',
      openingBalance: c.openingBalance || '',
      creditLimit: c.creditLimit || '',
      paymentTerms: c.paymentTerms || 'CASH',
      loyaltyEnabled: c.loyaltyEnabled || false,
      loyaltyPoints: c.points || '',
      active: c.active !== false,
      notes: c.notes || '',
    });
    setEditingId(c.id);
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', phone: '', email: '', address: '', city: '', province: '',
      customerGroup: 'REGULAR', dateOfBirth: '', gender: 'OTHER',
      openingBalance: '', creditLimit: '', paymentTerms: 'CASH',
      loyaltyEnabled: false, loyaltyPoints: '', active: true, notes: ''
    });
  };

  const filteredCustomers = useMemo(() => {
    let result = customers.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = 
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.province?.toLowerCase().includes(q);
        
      if (!matchesSearch) return false;

      if (statusFilter === 'active' && c.active === false) return false;
      if (statusFilter === 'inactive' && c.active !== false) return false;
      
      if (groupFilter !== 'all' && c.customerGroup !== groupFilter) return false;
      if (genderFilter !== 'all' && c.gender !== genderFilter) return false;
      if (termsFilter !== 'all' && c.paymentTerms !== termsFilter) return false;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'spent-desc': return Number(b.totalSpent || 0) - Number(a.totalSpent || 0);
        case 'spent-asc': return Number(a.totalSpent || 0) - Number(b.totalSpent || 0);
        case 'points-desc': return Number(b.points || 0) - Number(a.points || 0);
        case 'points-asc': return Number(a.points || 0) - Number(b.points || 0);
        case 'orders-desc': return Number(b.totalOrders || 0) - Number(a.totalOrders || 0);
        case 'orders-asc': return Number(a.totalOrders || 0) - Number(b.totalOrders || 0);
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'name-asc': 
        default: return (a.name || '').localeCompare(b.name || '');
      }
    });

    return result;
  }, [customers, search, statusFilter, groupFilter, genderFilter, termsFilter, sortBy]);

  const kpis = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.active !== false).length;
    const recent = customers.filter(c => {
      if (!c.createdAt) return false;
      const days = (new Date().getTime() - new Date(c.createdAt).getTime()) / (1000 * 3600 * 24);
      return days <= 7;
    }).length;
    const totalSpent = customers.reduce((acc, c) => acc + (Number(c.totalSpent) || 0), 0);
    return { total, active, recent, totalSpent };
  }, [customers]);

  const formatCurrency = (val: any) => {
    return Number(val || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  };

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Users className="w-7 h-7 sm:w-8 h-8 text-blue-600" />
              Customer Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-xs sm:text-sm font-medium">Add, update, and manage your loyal customers.</p>
          </div>
          
          <button 
            type="button"
            onClick={openAddPanel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Customers Overview | Customers Table) */}
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
            Customers Overview
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
            Customers Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search customers..."
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
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center px-4 h-full rounded-xl transition-all gap-2 font-bold relative cursor-pointer ${
              statusFilter !== 'all' || groupFilter !== 'all' || genderFilter !== 'all' || termsFilter !== 'all'
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Filter Customers"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Filters</span>
            {(statusFilter !== 'all' || groupFilter !== 'all' || genderFilter !== 'all' || termsFilter !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 shrink-0" />
            )}
          </button>

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
        <CustomersOverviewDashboard
          customers={customers}
          kpis={kpis}
          setActiveTab={setActiveTab}
          setStatusFilter={setStatusFilter}
          setGroupFilter={setGroupFilter}
          openEditPanel={handleEdit}
          formatCurrency={formatCurrency}
        />
      ) : (
        /* ──────────────── DATA TABLE / HISTORY VIEW ──────────────── */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>

        {selectedCustomer ? (
          <CustomerHistoryView 
            customer={selectedCustomer} 
            onBack={() => setSelectedCustomer(null)} 
            formatCurrency={formatCurrency}
          />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="font-medium text-sm">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <TableEmptyState
            icon={Users}
            title="No customers found"
            description="You haven't registered any customers yet, or none match your search. Click below to register your first customer."
            actionLabel="Create First Customer"
            onAction={openAddPanel}
          />
        ) : viewMode === 'list' ? (
          <>
            {/* Table wrapper for horizontal scroll */}
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap min-w-[1500px]">
                <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider z-10 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-bold text-slate-500">Customer Name</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Contact</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Location</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Group</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Gender & DOB</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Balance</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Credit Limit</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Terms</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Loyalty Pts</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Total Spent</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Orders</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Status</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredCustomers.map((c) => (
                      <tr 
                        key={c.id}
                        onClick={() => openHistory(c)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{c.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 group/copy">
                              <Phone className="w-3.5 h-3.5 text-slate-400" /> 
                              <span className="truncate">{c.phone || 'N/A'}</span>
                              {c.phone && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.phone); toast.success('Phone copied!'); }}
                                  className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded"
                                  title="Copy Phone"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 group/copy">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> 
                              <span className="truncate">{c.email || 'N/A'}</span>
                              {c.email && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.email); toast.success('Email copied!'); }}
                                  className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded"
                                  title="Copy Email"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.city || 'No city'}
                            </p>
                            {c.province && <p className="text-xs text-slate-500 ml-5.5">{c.province}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            c.customerGroup === 'VIP' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                            c.customerGroup === 'WHOLESALE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {c.customerGroup || 'REGULAR'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300 capitalize">{c.gender?.toLowerCase() || 'Other'}</p>
                            <p className="text-xs text-slate-500">{c.dateOfBirth || 'No DOB'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className={`text-sm font-bold ${Number(c.openingBalance) < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                            Rs. {formatCurrency(c.openingBalance || 0)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Rs. {formatCurrency(c.creditLimit || 0)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                            {c.paymentTerms?.replace('NET_', '')?.concat(' Days')?.replace('CASH Days', 'CASH') || 'CASH'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-sm font-bold text-amber-500">
                            {c.points || 0}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex justify-end items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5" /> Rs. {formatCurrency(c.totalSpent)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <p className="text-sm font-bold text-slate-900 dark:text-white flex justify-center items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" /> {c.totalOrders || 0}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border items-center justify-center gap-1.5 ${
                            c.active !== false 
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${c.active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                            {c.active !== false ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleEdit(c, e)}
                              className="p-2 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                              title="Edit Customer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(c.id, e)}
                              className="p-2 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Grid View */
          <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCustomers.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => openHistory(c)}
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 group cursor-pointer relative"
                  >
                    <div className="absolute top-4 right-4">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 ${
                        c.active !== false
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}>
                        {c.active !== false ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-black text-2xl mb-4">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <h3 className="font-black text-lg text-slate-900 dark:text-white truncate pr-16">{c.name}</h3>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 group/copy">
                        <Phone className="w-4 h-4 opacity-70" />
                        <span className="truncate">{c.phone || 'N/A'}</span>
                        {c.phone && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.phone); toast.success('Phone copied!'); }}
                            className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded ml-auto"
                            title="Copy Phone"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 group/copy">
                        <Mail className="w-4 h-4 opacity-70" />
                        <span className="truncate">{c.email || 'N/A'}</span>
                        {c.email && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.email); toast.success('Email copied!'); }}
                            className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded ml-auto"
                            title="Copy Email"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4 opacity-70" />
                        <span className="truncate">{c.city || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Orders</p>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                          {c.totalOrders || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total Spent</p>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                          Rs. {formatCurrency(c.totalSpent)}
                        </p>
                      </div>
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10">
                      <button 
                        onClick={(e) => handleEdit(c, e)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all"
                        title="Edit Customer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(c.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* ──────────────── SLIDE-OUT PANEL ──────────────── */}
      <MainRightPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onDiscard={handleDiscardChanges}
        title={editingId ? 'Edit Customer' : 'Add New Customer'}
        subtitle={editingId ? 'Update customer profile and contact' : 'Register a new customer account'}
        icon={UserCircle}
        formId="customerForm"
        isSubmitting={isSubmitting}
        saveText={editingId ? 'Update Customer' : 'Save Customer'}
      >
        <form id="customerForm" onSubmit={handleSave} className="font-sans space-y-6">
                  {/* Section 1: Basic Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("basic")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.basic ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <UserCircle className="w-4 h-4 text-blue-600" />
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
                            <div>
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Customer Name <span className="text-red-500">*</span>
                              </label>
                              <div className="relative mt-1.5 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                                  <UserCircle className="w-5 h-5" />
                                </div>
                                <input
                                  id="field-customer-name"
                                  type="text"
                                  value={formData.name}
                                  onChange={e => {
                                    if (validationError?.field === 'field-customer-name') setValidationError(null);
                                    setFormData({...formData, name: e.target.value});
                                  }}
                                  className="w-full pl-10 pr-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                  placeholder="e.g. Nimesha Denuwanthi"
                                />
                                <ValidationErrorTooltip error={validationError} fieldId="field-customer-name" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone</label>
                                <div className="relative mt-1.5 group">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                                    <Phone className="w-4 h-4" />
                                  </div>
                                  <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full pl-9 pr-3 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                    placeholder="07XXXXXXXX"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                                <div className="relative mt-1.5 group">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                                    <Mail className="w-4 h-4" />
                                  </div>
                                  <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full pl-9 pr-3 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                    placeholder="user@example.com"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 2: Address Info */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("address")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.address ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Address Info
                      </span>
                      {openSections.address ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.address && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div>
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Address</label>
                              <input
                                type="text"
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                placeholder="123 Main St"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Province (Optional)</label>
                                <CustomSelect
                                  value={formData.province}
                                  onChange={val => {
                                    setFormData({...formData, province: val, city: ''});
                                  }}
                                  options={[
                                    { value: '', label: 'Select Province' },
                                    ...Object.keys(CITIES_BY_PROVINCE).map(p => ({ value: p, label: p }))
                                  ]}
                                  label="Select Province"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                                <CustomSelect
                                  value={formData.city}
                                  onChange={val => setFormData({...formData, city: val})}
                                  options={[
                                    { value: '', label: 'Select City' },
                                    ...(formData.province && CITIES_BY_PROVINCE[formData.province] 
                                        ? CITIES_BY_PROVINCE[formData.province].map(c => ({ value: c, label: c }))
                                        : [])
                                  ]}
                                  label="Select City"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 3: Customer Info */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("customer")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.customer ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-blue-600" />
                        Customer Info
                      </span>
                      {openSections.customer ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.customer && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Customer Group</label>
                                <CustomSelect
                                  value={formData.customerGroup}
                                  onChange={val => setFormData({...formData, customerGroup: val})}
                                  options={[
                                    { value: 'REGULAR', label: 'Regular' },
                                    { value: 'WHOLESALE', label: 'Wholesale' },
                                    { value: 'VIP', label: 'VIP' },
                                  ]}
                                  label="Select Group"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Gender</label>
                                <CustomSelect
                                  value={formData.gender}
                                  onChange={val => setFormData({...formData, gender: val})}
                                  options={[
                                    { value: 'MALE', label: 'Male' },
                                    { value: 'FEMALE', label: 'Female' },
                                    { value: 'OTHER', label: 'Other' },
                                  ]}
                                  label="Select Gender"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date of Birth (Optional)</label>
                                <input
                                  type="date"
                                  value={formData.dateOfBirth}
                                  onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                                  className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 4: Financial Info */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("financial")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.financial ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Banknote className="w-4 h-4 text-blue-600" />
                        Financial Info
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
                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Opening Balance</label>
                                <input
                                  type="number"
                                  value={formData.openingBalance}
                                  onChange={e => setFormData({...formData, openingBalance: e.target.value})}
                                  className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Credit Limit</label>
                                <input
                                  type="number"
                                  value={formData.creditLimit}
                                  onChange={e => setFormData({...formData, creditLimit: e.target.value})}
                                  className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Terms</label>
                                <CustomSelect
                                  value={formData.paymentTerms}
                                  onChange={val => setFormData({...formData, paymentTerms: val})}
                                  options={[
                                    { value: 'CASH', label: 'Cash' },
                                    { value: 'NET_7', label: '7 Days' },
                                    { value: 'NET_15', label: '15 Days' },
                                    { value: 'NET_30', label: '30 Days' },
                                  ]}
                                  label="Select Terms"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 5: Loyalty & Options */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("loyalty")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.loyalty ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Gift className="w-4 h-4 text-blue-600" />
                        Loyalty & Options
                      </span>
                      {openSections.loyalty ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.loyalty && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            {/* Toggle: Loyalty Program */}
                            <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <div>
                                <span className="block text-sm font-bold text-slate-900 dark:text-white">Enable Loyalty Program</span>
                                <span className="block text-xs font-medium text-slate-500 mt-0.5">Allow customer to earn points</span>
                              </div>
                              <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${formData.loyaltyEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.loyaltyEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={formData.loyaltyEnabled}
                                onChange={e => setFormData({ ...formData, loyaltyEnabled: e.target.checked })}
                              />
                            </label>

                            {formData.loyaltyEnabled && (
                              <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Opening Loyalty Points</label>
                                <input
                                  type="number"
                                  value={formData.loyaltyPoints}
                                  onChange={e => setFormData({...formData, loyaltyPoints: e.target.value})}
                                  className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                  placeholder="0"
                                />
                              </div>
                            )}

                            {/* Toggle: Active Status */}
                            <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <div>
                                <span className="block text-sm font-bold text-slate-900 dark:text-white">Active Status</span>
                                <span className="block text-xs font-medium text-slate-500 mt-0.5">Customer account is active</span>
                              </div>
                              <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${formData.active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.active ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                              />
                            </label>

                            <div>
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notes / Remarks</label>
                              <textarea
                                value={formData.notes}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                                className="mt-1.5 w-full p-4 h-24 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none resize-none"
                                placeholder="Any additional notes..."
                              ></textarea>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
        </form>
      </MainRightPanel>

      {/* ──────────────── FILTER FLYOUT ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Customers"
        onClear={() => { 
          setStatusFilter('all'); 
          setGroupFilter('all');
          setGenderFilter('all');
          setTermsFilter('all');
          setSortBy('name-asc');
          setIsFilterOpen(false); 
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label>
            <CustomSelect
              icon={SlidersHorizontal}
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'name-asc', label: 'Name (A-Z)' },
                { value: 'name-desc', label: 'Name (Z-A)' },
                { value: 'spent-desc', label: 'Total Spent (Highest)' },
                { value: 'spent-asc', label: 'Total Spent (Lowest)' },
                { value: 'orders-desc', label: 'Total Orders (Highest)' },
                { value: 'orders-asc', label: 'Total Orders (Lowest)' },
                { value: 'points-desc', label: 'Loyalty Points (Highest)' },
                { value: 'points-asc', label: 'Loyalty Points (Lowest)' }
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Status</label>
            <CustomSelect
              icon={CheckCircle2}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Customers' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' }
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Customer Group</label>
            <CustomSelect
              icon={Users}
              value={groupFilter}
              onChange={setGroupFilter}
              options={[
                { value: 'all', label: 'All Groups' },
                { value: 'REGULAR', label: 'Regular' },
                { value: 'WHOLESALE', label: 'Wholesale' },
                { value: 'VIP', label: 'VIP' }
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Gender</label>
            <CustomSelect
              icon={User}
              value={genderFilter}
              onChange={setGenderFilter}
              options={[
                { value: 'all', label: 'All Genders' },
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' }
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Payment Terms</label>
            <CustomSelect
              icon={CreditCard}
              value={termsFilter}
              onChange={setTermsFilter}
              options={[
                { value: 'all', label: 'All Terms' },
                { value: 'CASH', label: 'Cash' },
                { value: 'NET_7', label: '7 Days' },
                { value: 'NET_15', label: '15 Days' },
                { value: 'NET_30', label: '30 Days' }
              ]}
            />
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── DELETE CONFIRMATION ──────────────── */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Customer?"
        message="Are you sure you want to permanently delete this customer? This action cannot be undone."
        confirmText="Delete Customer"
        cancelText="Cancel"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        isLoading={isDeleting}
      />

    </div>
  );
}


export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-8">Loading...</div>}>
      <CustomersPageContent />
    </Suspense>
  );
}
