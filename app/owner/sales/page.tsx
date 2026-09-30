'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Receipt, Search, Plus, Printer, Eye, ChevronDown, ChevronUp, Copy, CheckCircle, XCircle, Clock, Banknote, ShoppingBag, LayoutGrid, List, Maximize, Minimize, X, Calendar, Filter, FileText, UserCircle, User, Package, CreditCard, DollarSign, QrCode, Minus, ShoppingCart, Lock, Trash2, Tag, RotateCcw,
  TrendingUp, TrendingDown, Star, BarChart3, AlertCircle, CheckCircle2, ArrowRight, Users
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { MainRightPanel } from '@/components/ui/right-panel';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { CustomSelect } from '@/components/ui/custom-select';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { getLocalSales, processRefundLocally } from '@/lib/local-services';
import { useAuthStore } from '@/lib/auth-store';

interface SalesOverviewDashboardProps {
  kpis: Array<{ title: string; value: string; icon: any; color: string; bg: string }>;
  overviewStats: {
    totalRevenue: number;
    totalTransactions: number;
    todaysRevenue: number;
    avgOrderValue: number;
    chartData: Array<{ date: string; revenue: number; orders: number }>;
    topSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
    topCustomers: Array<{ name: string; count: number; spend: number }>;
    paymentMethods: Array<{ method: string; count: number; amount: number; percentage: number }>;
    recentHighValueOrders: Array<{ id: string | number; invoiceNo: string; customerName: string; total: number; createdAt: string; paymentMethod: string }>;
  };
  setActiveTab: (tab: 'overview' | 'table') => void;
  setPaymentMethodFilter: (method: string) => void;
  openViewPanel: (sale: any) => void;
  sales: any[];
}

function SalesOverviewDashboard({
  kpis,
  overviewStats,
  setActiveTab,
  setPaymentMethodFilter,
  openViewPanel,
  sales
}: SalesOverviewDashboardProps) {
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
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

      {/* ──────────────── 2. MAIN DASHBOARD GRID: CHART (2 Cols) + TOP SELLING PRODUCTS (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (Sales Revenue & Orders Trend) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 flex-shrink-0">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Sales Performance & Order Velocity
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {chartMetric === 'revenue' ? 'Daily revenue timeline (Rs.)' : 'Transaction count timeline'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Metric Toggle: Revenue vs Orders */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMetric('revenue')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'revenue' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Revenue (Rs)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('orders')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMetric === 'orders' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Orders
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
                  No sales transaction history available to plot.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={overviewStats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(v) => chartMetric === 'revenue' ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`) : `${v}`} 
                      />
                      <Tooltip 
                        formatter={(v: any) => [
                          chartMetric === 'revenue' 
                            ? `Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : `${Number(v)} orders`, 
                          chartMetric === 'revenue' ? 'Sales Revenue' : 'Orders'
                        ]} 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar 
                        dataKey={chartMetric === 'revenue' ? 'revenue' : 'orders'} 
                        fill={chartMetric === 'revenue' ? '#3B82F6' : '#8B5CF6'} 
                        radius={[6, 6, 0, 0]} 
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={overviewStats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(v) => chartMetric === 'revenue' ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`) : `${v}`} 
                      />
                      <Tooltip 
                        formatter={(v: any) => [
                          chartMetric === 'revenue' 
                            ? `Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : `${Number(v)} orders`, 
                          chartMetric === 'revenue' ? 'Sales Revenue' : 'Orders'
                        ]} 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={chartMetric === 'revenue' ? 'revenue' : 'orders'} 
                        stroke={chartMetric === 'revenue' ? '#3B82F6' : '#8B5CF6'} 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: chartMetric === 'revenue' ? '#3B82F6' : '#8B5CF6' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading sales chart...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 font-medium">
            <span>
              {chartMetric === 'revenue' ? 'Total Period Sales' : 'Total Period Orders'}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {chartMetric === 'revenue' 
                ? `Rs. ${overviewStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `${overviewStats.totalTransactions} transactions`}
            </span>
          </div>
        </div>

        {/* Right: Card 1 - Top 5 Selling Products */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Top Selling Products
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              By Volume
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {overviewStats.topSellingProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No sales items recorded yet.
              </div>
            ) : (
              overviewStats.topSellingProducts.slice(0, 5).map((item, i) => {
                const rankColors = [
                  'bg-amber-500 text-white',
                  'bg-slate-400 text-white',
                  'bg-orange-700 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div 
                    key={i} 
                    onClick={() => setActiveTab('table')}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view sales table"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.quantity} units sold
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white flex-shrink-0">
                      Rs. {item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              View All in Sales Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 RANKINGS / INSIGHTS CARDS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 2: Top Customers by Spend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Top Customers
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              By Spend
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {overviewStats.topCustomers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No customer records found.
              </div>
            ) : (
              overviewStats.topCustomers.slice(0, 5).map((cust, i) => {
                const rankColors = [
                  'bg-indigo-600 text-white',
                  'bg-indigo-500 text-white',
                  'bg-purple-500 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div 
                    key={i} 
                    onClick={() => setActiveTab('table')}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view sales table"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                          {cust.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {cust.count} orders placed
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white flex-shrink-0">
                      Rs. {cust.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View Customers in Sales Table →
            </button>
          </div>
        </div>

        {/* Card 3: Payment Method Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Payment Channels
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Share %
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {overviewStats.paymentMethods.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No payment records found.
              </div>
            ) : (
              overviewStats.paymentMethods.slice(0, 5).map((p, i) => {
                const methodLabel = p.method === 'PAYHERE_QR' ? 'Mobile QR' : p.method === 'CARD' ? 'Card Payment' : p.method === 'CASH' ? 'Cash Tendered' : p.method;
                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      setPaymentMethodFilter(p.method.toLowerCase());
                      setActiveTab('table');
                    }}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to filter by payment method"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                        {p.method === 'CASH' ? <Banknote className="w-4 h-4 text-emerald-500" /> : p.method === 'CARD' ? <CreditCard className="w-4 h-4 text-blue-500" /> : <QrCode className="w-4 h-4 text-purple-500" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                          {methodLabel}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {p.count} transactions ({p.percentage}%)
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white flex-shrink-0">
                      Rs. {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              Filter Payment Methods in Table →
            </button>
          </div>
        </div>

        {/* Card 4: Recent High-Value Orders */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Top Value Invoices
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              Highest
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {overviewStats.recentHighValueOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No orders recorded.
              </div>
            ) : (
              overviewStats.recentHighValueOrders.slice(0, 5).map((ord, i) => {
                const actualSale = sales.find(s => s.id === ord.id);
                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (actualSale) {
                        openViewPanel(actualSale);
                      }
                      setActiveTab('table');
                    }}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view invoice details"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                          {ord.invoiceNo}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {ord.customerName} • {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white flex-shrink-0">
                      Rs. {ord.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View Invoices in Sales Table →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SalesPage() {
  const { user } = useAuthStore();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Sales Filters
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Side Panel state for viewing sale details
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Refund State
  const [isRefundPanelOpen, setIsRefundPanelOpen] = useState(false);
  const [refundSale, setRefundSale] = useState<any>(null);

  useEffect(() => {
    fetchSales();
  }, [user?.tenantId]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      // @ts-ignore
      const isDesktop = typeof window !== 'undefined' && (window.__TAURI_INTERNALS__ || window.__TAURI__);

      if (isDesktop) {
        // Fetch completely locally for fast loading on desktop
        const localSales = await getLocalSales(user?.tenantId ?? null);
        setSales(localSales);
      } else {
        // Fetch from backend API for browser users
        const res = await storeOwnerAPI.getRecentSales();
        const remoteSales = res.data?.data || res.data || [];
        setSales(remoteSales.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = 
        s.invoiceNo?.toLowerCase().includes(q) ||
        s.customer?.name?.toLowerCase().includes(q) ||
        s.customer?.phone?.toLowerCase().includes(q) ||
        s.user?.name?.toLowerCase().includes(q);
        
      let matchesPayment = true;
      if (paymentMethodFilter !== 'all') matchesPayment = s.paymentMethod === paymentMethodFilter.toUpperCase();
      
      let matchesStatus = true;
      if (statusFilter !== 'all') matchesStatus = s.paymentStatus === statusFilter.toUpperCase();

      let matchesChannel = true;
      if (channelFilter === 'pos') matchesChannel = s.channel === 'POS' || !s.channel;
      if (channelFilter === 'online') matchesChannel = s.channel === 'ONLINE';

      let matchesDate = true;
      const targetDate = new Date(s.createdAt);
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

      return matchesSearch && matchesPayment && matchesStatus && matchesChannel && matchesDate;
    });
  }, [sales, search, paymentMethodFilter, statusFilter, channelFilter, fromDate, toDate]);

  const kpis = useMemo(() => {
    const totalTransactions = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysSales = sales.filter(s => new Date(s.createdAt) >= today);
    const todaysRevenue = todaysSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
    
    return [
      { 
        title: 'Total Revenue', 
        value: `Rs. ${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
        icon: DollarSign, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50 dark:bg-emerald-500/10' 
      },
      { 
        title: 'Total Transactions', 
        value: totalTransactions.toString(), 
        icon: Receipt, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-500/10' 
      },
      { 
        title: "Today's Revenue", 
        value: `Rs. ${todaysRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
        icon: Clock, 
        color: 'text-violet-500', 
        bg: 'bg-violet-50 dark:bg-violet-500/10' 
      },
      { 
        title: 'Avg Order Value', 
        value: `Rs. ${avgOrderValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
        icon: Banknote, 
        color: 'text-orange-500', 
        bg: 'bg-orange-50 dark:bg-orange-500/10' 
      }
    ];
  }, [sales]);

  const overviewStats = useMemo(() => {
    const dateMap = new Map<string, { date: string; revenue: number; orders: number; timestamp: number }>();
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    const customerMap = new Map<string, { name: string; count: number; spend: number }>();
    const paymentMap = new Map<string, { method: string; count: number; amount: number }>();

    sales.forEach((s) => {
      const total = Number(s.total || 0);
      const d = new Date(s.createdAt);
      const dateKey = !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown';
      const dayTimestamp = !isNaN(d.getTime()) ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() : 0;

      const existingDate = dateMap.get(dateKey) || { date: dateKey, revenue: 0, orders: 0, timestamp: dayTimestamp };
      existingDate.revenue += total;
      existingDate.orders += 1;
      dateMap.set(dateKey, existingDate);

      const method = (s.paymentMethod || 'OTHER').toUpperCase();
      const existingPay = paymentMap.get(method) || { method, count: 0, amount: 0 };
      existingPay.count += 1;
      existingPay.amount += total;
      paymentMap.set(method, existingPay);

      const custName = s.customer?.name || (s.customer?.phone ? `Customer (${s.customer.phone})` : 'Walk-in Customer');
      const existingCust = customerMap.get(custName) || { name: custName, count: 0, spend: 0 };
      existingCust.count += 1;
      existingCust.spend += total;
      customerMap.set(custName, existingCust);

      if (Array.isArray(s.items)) {
        s.items.forEach((item: any) => {
          const name = item.productName || item.name || 'Unknown Product';
          const qty = Number(item.quantity || 1);
          const rev = Number(item.subtotal || (item.price ? item.price * qty : 0));
          const existingProd = productMap.get(name) || { name, quantity: 0, revenue: 0 };
          existingProd.quantity += qty;
          existingProd.revenue += rev;
          productMap.set(name, existingProd);
        });
      }
    });

    const chartData = Array.from(dateMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-10);

    const topSellingProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 5);

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    const totalSalesRev = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
    const paymentMethods = Array.from(paymentMap.values())
      .map(p => ({
        ...p,
        percentage: totalSalesRev > 0 ? Math.round((p.amount / totalSalesRev) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    const recentHighValueOrders = [...sales]
      .sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        invoiceNo: s.invoiceNo || `INV-${s.id}`,
        customerName: s.customer?.name || 'Walk-in Customer',
        total: Number(s.total || 0),
        createdAt: s.createdAt,
        paymentMethod: s.paymentMethod || 'CASH'
      }));

    const totalTransactions = sales.length;
    const avgOrderValue = totalTransactions > 0 ? totalSalesRev / totalTransactions : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysSales = sales.filter(s => new Date(s.createdAt) >= today);
    const todaysRevenue = todaysSales.reduce((sum, s) => sum + Number(s.total || 0), 0);

    return {
      totalRevenue: totalSalesRev,
      totalTransactions,
      todaysRevenue,
      avgOrderValue,
      chartData,
      topSellingProducts,
      topCustomers,
      paymentMethods,
      recentHighValueOrders
    };
  }, [sales]);

  const [expandedSale, setExpandedSale] = useState<number | string | null>(null);

  const openViewPanel = (sale: any) => {
    setSelectedSale(sale);
    setExpandedSale(expandedSale === sale.id ? null : sale.id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '-' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (val: any) => {
    return Number(val || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  };

  const handlePrintReceipt = (sale: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const customerName = sale.customer?.name || "Guest";
    const dateStr = formatDate(sale.createdAt) + " at " + formatTime(sale.createdAt);
    let itemsHtml = "";
    if (sale.items) {
      sale.items.forEach((item: any) => {
        itemsHtml += `
          <tr>
            <td style="padding: 5px 0;">${item.productName}<br><small>${item.quantity} x Rs. ${formatCurrency(item.price)}</small></td>
            <td style="padding: 5px 0; text-align: right;">Rs. ${formatCurrency(item.subtotal)}</td>
          </tr>
        `;
      });
    }
    const html = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: #000; }
            h2 { text-align: center; margin: 0 0 10px 0; }
            p { margin: 5px 0; font-size: 14px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>cMart</h2>
          <p class="text-center">Receipt</p>
          <div class="divider"></div>
          <p>Invoice: ${sale.invoiceNo}</p>
          <p>Date: ${dateStr}</p>
          <p>Customer: ${customerName}</p>
          <p>Pay Method: ${sale.paymentMethod}</p>
          <div class="divider"></div>
          <table>
            ${itemsHtml}
          </table>
          <div class="divider"></div>
          <table>
            <tr><td>Subtotal:</td><td class="text-right">Rs. ${formatCurrency(sale.subtotal)}</td></tr>
            ${Number(sale.discount) > 0 ? `<tr><td>Discount:</td><td class="text-right">-Rs. ${formatCurrency(sale.discount)}</td></tr>` : ""}
            ${Number(sale.tax) > 0 ? `<tr><td>Tax:</td><td class="text-right">+Rs. ${formatCurrency(sale.tax)}</td></tr>` : ""}
            <tr><td class="bold">Total:</td><td class="text-right bold">Rs. ${formatCurrency(sale.total)}</td></tr>
          </table>
          ${
            sale.paymentMethod === "CASH" && sale.cashReceived
              ? `
          <div class="divider"></div>
          <table>
            <tr><td>Tendered:</td><td class="text-right">Rs. ${formatCurrency(sale.cashReceived)}</td></tr>
            <tr><td>Change:</td><td class="text-right">Rs. ${formatCurrency(sale.changeGiven || 0)}</td></tr>
          </table>
          `
              : ""
          }
          <div class="divider"></div>
          <p class="text-center">Thank you for your business!</p>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className={`flex flex-col bg-[#F4F7F6] dark:bg-slate-900 ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6 lg:p-8'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Receipt className="w-8 h-8 text-blue-600" />
              Sales History
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              View and manage all transactions elegantly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.href = '/owner/pos'}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              New Sale
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Sales Overview | Sales Orders) */}
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
            Sales Overview
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
            Sales Orders
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search invoice, customer..."
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
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center px-4 h-full rounded-xl transition-all gap-2 font-bold relative cursor-pointer text-xs sm:text-sm ${
              (statusFilter !== 'all' || paymentMethodFilter !== 'all' || channelFilter !== 'all' || fromDate || toDate)
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Filter Sales"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(statusFilter !== 'all' || paymentMethodFilter !== 'all' || channelFilter !== 'all' || fromDate || toDate) && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* List View Toggle */}
          <button 
            type="button"
            onClick={() => {
              setActiveTab('table');
              setViewMode('list');
            }}
            title="List View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>

          {/* Grid View Toggle */}
          <button 
            type="button"
            onClick={() => {
              setActiveTab('table');
              setViewMode('grid');
            }}
            title="Grid View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Full Screen Toggle */}
          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Full Screen"
            className="flex items-center justify-center w-10 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────── TAB CONTENT: OVERVIEW OR TABLE ──────────────── */}
      {activeTab === 'overview' ? (
        <SalesOverviewDashboard
          kpis={kpis}
          overviewStats={overviewStats}
          setActiveTab={setActiveTab}
          setPaymentMethodFilter={setPaymentMethodFilter}
          openViewPanel={openViewPanel}
          sales={sales}
        />
      ) : (
        /* ──────────────── DATA CONTAINER ──────────────── */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Loading sales...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <TableEmptyState
            icon={Receipt}
            title="No sales transactions found"
            description="You haven't recorded any sales transactions yet, or none match your search filters. Open POS register to start billing."
            actionLabel="Open POS Register"
            onAction={() => window.location.href = '/owner/pos'}
          />
        ) : viewMode === 'list' ? (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(180px,1.8fr)_minmax(130px,1.2fr)_minmax(160px,1.5fr)_minmax(150px,1.3fr)_120px] gap-4 h-14 px-5 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Invoice & Cashier</div>
                <div>Date & Time</div>
                <div>Customer & Channel</div>
                <div>Total & Payment</div>
                <div className="text-right pr-2">Actions</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSales.map((s) => (
                    <React.Fragment key={s.id}>
                      <div 
                        onClick={() => setExpandedSale(prev => prev === s.id ? null : s.id)} 
                        className={`grid grid-cols-[minmax(180px,1.8fr)_minmax(130px,1.2fr)_minmax(160px,1.5fr)_minmax(150px,1.3fr)_120px] gap-4 p-4 sm:px-5 items-center transition-colors cursor-pointer group ${
                          expandedSale === s.id 
                            ? 'bg-blue-50/60 dark:bg-blue-900/15' 
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* 1. Invoice & Cashier */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{s.invoiceNo}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <UserCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {s.user?.name || s.user?.email || 'Cashier'}
                            </p>
                          </div>
                        </div>

                        {/* 2. Date & Time */}
                        <div className="flex flex-col justify-center min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {formatDate(s.createdAt)}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {formatTime(s.createdAt)}
                          </div>
                        </div>

                        {/* 3. Customer & Channel */}
                        <div className="flex flex-col justify-center min-w-0">
                          {s.customer ? (
                            <>
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.customer.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{s.customer.phone || 'No phone'}</p>
                            </>
                          ) : (
                            <span className="text-xs font-medium italic text-slate-400">Walk-in Customer</span>
                          )}
                          <span className="inline-flex items-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                            Channel: {s.channel || 'POS'}
                          </span>
                        </div>

                        {/* 4. Total & Payment */}
                        <div className="flex flex-col justify-center min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                              Rs. {formatCurrency(s.total)}
                            </span>
                            <span className="text-[10px] text-slate-400">({s.items?.length || 0})</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                              s.paymentStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                              'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {s.paymentStatus === 'REFUNDED' ? 'Refunded' : s.paymentStatus === 'PARTIAL_REFUND' ? 'Partial' : s.paymentStatus}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              • {s.paymentMethod === 'PAYHERE_QR' ? 'QR' : s.paymentMethod === 'CARD' ? 'Card' : 'Cash'}
                            </span>
                          </div>
                        </div>

                        {/* 5. Actions Column (Right-aligned, tailored for sales) */}
                        <div className="flex items-center justify-end gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintReceipt(s);
                            }}
                            title="Print Receipt"
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {s.paymentStatus !== 'REFUNDED' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRefundSale(s);
                                setIsRefundPanelOpen(true);
                              }}
                              title="Refund Sale"
                              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          <div className="p-1 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedSale === s.id ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                          </div>
                        </div>

                      </div>

                      {/* Inline Details Expansion */}
                      <AnimatePresence>
                        {expandedSale === s.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-b border-slate-100 dark:border-slate-800/60"
                          >
                            <SaleDetailsInline 
                              selectedSale={s} 
                              onClose={() => setExpandedSale(null)}
                              onRefund={() => {
                                setRefundSale(s);
                                setIsRefundPanelOpen(true);
                              }}
                              onPrint={() => handlePrintReceipt(s)}
                              formatCurrency={formatCurrency}
                              formatDate={formatDate}
                              formatTime={formatTime}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSales.map((s) => (
                    <React.Fragment key={s.id}>
                      <div onClick={() => openViewPanel(s)} className={`bg-white dark:bg-slate-900 border ${expandedSale === s.id ? 'border-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-800'} rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full hover:border-blue-500/50`}>
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <FileText className="w-6 h-6" />
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                            s.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                            s.paymentStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                            'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            {s.paymentStatus === 'REFUNDED' ? 'REFUND' : s.paymentStatus === 'PARTIAL_REFUND' ? 'PARTIAL REFUND' : s.paymentStatus}
                          </span>
                        </div>
                        
                        <div className="flex-1 flex flex-col mb-4">
                          <h3 className="font-black text-slate-900 dark:text-white text-lg mb-1">{s.invoiceNo}</h3>
                          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-3">
                            <Calendar className="w-3 h-3" /> {formatDate(s.createdAt)} at {formatTime(s.createdAt)}
                          </p>
                          
                          <div className="space-y-2 mt-auto">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="truncate">{s.customer?.name || 'Walk-in Customer'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                              {s.paymentMethod === 'CASH' ? <Banknote className="w-4 h-4 text-slate-400" /> : s.paymentMethod === 'PAYHERE_QR' ? <QrCode className="w-4 h-4 text-slate-400" /> : <CreditCard className="w-4 h-4 text-slate-400" />}
                              <span>{s.paymentMethod === 'PAYHERE_QR' ? 'Mobile QR' : s.paymentMethod === 'CARD' ? 'Card' : 'Cash'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.items?.length || 0} Items</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white">Rs. {formatCurrency(s.total)}</p>
                        </div>
                      </div>

                      {/* Inline Details Expansion for Grid */}
                      <AnimatePresence>
                        {expandedSale === s.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="col-span-full overflow-hidden rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-lg mt-2 mb-4"
                          >
                            <SaleDetailsInline 
                              selectedSale={s} 
                              onClose={() => setExpandedSale(null)}
                              onRefund={() => {
                                setRefundSale(s);
                                setIsRefundPanelOpen(true);
                              }}
                              formatCurrency={formatCurrency}
                              formatDate={formatDate}
                              formatTime={formatTime}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
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
        title="Filter Sales"
        onClear={() => { 
          setPaymentMethodFilter('all'); 
          setStatusFilter('all'); 
          setChannelFilter('all'); 
          setFromDate(''); 
          setToDate(''); 
          setIsFilterOpen(false); 
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Payment Method</label>
          <CustomSelect
            icon={CreditCard}
            value={paymentMethodFilter}
            onChange={setPaymentMethodFilter}
            options={[
              { value: 'all', label: 'All Methods' },
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Payment Status</label>
          <CustomSelect
            icon={CheckCircle2}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sales Channel</label>
          <CustomSelect
            icon={ShoppingBag}
            value={channelFilter}
            onChange={setChannelFilter}
            options={[
              { value: 'all', label: 'All Channels' },
              { value: 'pos', label: 'POS System' },
              { value: 'online', label: 'Online Store' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Date Range</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">From</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">To</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── REFUND PANEL ──────────────── */}
      <AnimatePresence>
        {isRefundPanelOpen && refundSale && (
          <RefundPanel 
            sale={refundSale} 
            onClose={() => {
              setIsRefundPanelOpen(false);
              setRefundSale(null);
            }} 
            onConfirm={async (items, totalRefundAmount) => {
              try {
                await processRefundLocally(refundSale.id, items, totalRefundAmount, user?.branchId || 1, user?.tenantId || null);
                toast.success('Refund processed successfully!');
                setIsRefundPanelOpen(false);
                setRefundSale(null);
                // We'd ideally call fetchSales() here, but since it's not exposed, 
                // we'll just reload the page for now to ensure state is fresh.
                window.location.reload(); 
              } catch (e) {
                console.error(e);
                toast.error('Failed to process refund');
              }
            }} 
            formatCurrency={formatCurrency}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SaleDetailsInline({ selectedSale, onClose, onRefund, onPrint, formatCurrency, formatDate, formatTime }: { selectedSale: any, onClose: () => void, onRefund?: () => void, onPrint?: () => void, formatCurrency: any, formatDate: any, formatTime: any }) {
  if (!selectedSale) return null;
  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-900/50 border-b-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 group/invoice">
            {selectedSale.invoiceNo}
            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(selectedSale.invoiceNo); toast.success('Invoice number copied!'); }} className="p-1 opacity-0 group-hover/invoice:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0" title="Copy Invoice Number">
              <Copy className="w-4 h-4 text-slate-400 hover:text-blue-500" />
            </button>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
              selectedSale.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
              selectedSale.paymentStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
              'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {selectedSale.paymentStatus === 'REFUNDED' ? 'REFUND' : selectedSale.paymentStatus === 'PARTIAL_REFUND' ? 'PARTIAL REFUND' : selectedSale.paymentStatus}
            </span>
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {formatDate(selectedSale.createdAt)} at {formatTime(selectedSale.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onPrint && onPrint()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-colors shadow-sm shadow-blue-500/20">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          {selectedSale.paymentStatus !== 'REFUNDED' && (
            <button onClick={() => onRefund && onRefund()} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/10 font-bold transition-colors">
              Refund
            </button>
          )}
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10 font-bold transition-colors">
            Close <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Box 1: Customer Info */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> Customer Info
          </h3>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedSale.customer?.name || 'Walk-in Customer'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{selectedSale.customer?.phone || 'No phone provided'}</p>
          </div>
        </div>

        {/* Box 2: Payment Info */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            {selectedSale.paymentMethod === 'CASH' ? <Banknote className="w-4 h-4" /> : selectedSale.paymentMethod === 'PAYHERE_QR' ? <QrCode className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />} Payment Info
          </h3>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedSale.paymentMethod === 'PAYHERE_QR' ? 'Mobile QR' : selectedSale.paymentMethod === 'CARD' ? 'Card' : 'Cash'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Processed by {selectedSale.user?.name || selectedSale.user?.email || 'System'}</p>
          </div>
        </div>

        {/* Box 3: Order Summary */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span>Rs. {formatCurrency(selectedSale.subtotal)}</span>
            </div>
            {Number(selectedSale.discount) > 0 && (
              <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>- Rs. {formatCurrency(selectedSale.discount)}</span>
              </div>
            )}
            {Number(selectedSale.tax) > 0 && (
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Tax</span>
                <span>+ Rs. {formatCurrency(selectedSale.tax)}</span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Total</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-500">Rs. {formatCurrency(selectedSale.total)}</span>
            </div>
            {selectedSale.paymentMethod === 'CASH' && selectedSale.cashReceived && (
              <>
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Tendered</span>
                  <span>Rs. {formatCurrency(selectedSale.cashReceived)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Change</span>
                  <span>Rs. {formatCurrency(selectedSale.changeGiven || 0)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" /> Purchased Items
          </h3>
        </div>
        <div className="w-full overflow-hidden">
          <div className="flex flex-col">
            <div className="grid grid-cols-[minmax(180px,2fr)_minmax(100px,1fr)_80px_minmax(100px,1fr)] gap-4 p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <div>Item</div>
              <div className="text-right">Price</div>
              <div className="text-center">Qty</div>
              <div className="text-right">Subtotal</div>
            </div>
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
              {selectedSale.items && selectedSale.items.map((item: any) => (
                <div key={item.id} className="grid grid-cols-[minmax(180px,2fr)_minmax(100px,1fr)_80px_minmax(100px,1fr)] gap-4 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.productName}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 text-right">Rs. {formatCurrency(item.price)}</div>
                  <div className="text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white text-right">Rs. {formatCurrency(item.subtotal)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedSale.notes && (
        <div className="mt-8 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6">
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-2">Order Notes</h4>
          <p className="text-sm text-amber-900 dark:text-amber-400">{selectedSale.notes}</p>
        </div>
      )}
    </div>
  );
}

function RefundPanel({ sale, onClose, onConfirm, formatCurrency }: { sale: any, onClose: () => void, onConfirm: (items: any[], totalRefundAmount: number) => void, formatCurrency: any }) {
  const [refundItems, setRefundItems] = useState<any[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingConfirmData, setPendingConfirmData] = useState<{items: any[], total: number} | null>(null);
  
  useEffect(() => {
    if (sale?.items) {
      setRefundItems(sale.items.map((item: any) => {
        const availableQty = item.quantity - (item.refundedQuantity || 0);
        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          originalPrice: item.price,
          maxQty: availableQty,
          cartQty: availableQty // Initially, all items are in the customer's bag
        };
      }).filter((item: any) => item.maxQty > 0)); // Only show items that can be refunded
    }
  }, [sale]);

  const updateQty = (id: number, delta: number) => {
    setRefundItems(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(0, Math.min(item.maxQty, item.cartQty + delta));
        return { ...item, cartQty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: any) => {
    // Removing from cart means customer returns all of it (cartQty = 0)
    setRefundItems(prev => prev.map(item => item.productId === id ? { ...item, cartQty: 0 } : item));
  };
  
  // Cart reflects what is currently in the customer's bag
  const cart = refundItems.filter(item => item.cartQty > 0).map(item => ({ ...item, quantity: item.cartQty }));
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const customer = sale?.customer;
  const formatLKR = (val: any) => "Rs. " + formatCurrency(val);
  const focusedSection: string = "";
  const focusedCartIndex = -1;
  const discount = 0;
  const discountAmount = 0;
  
  // Total Refund Amount is calculated from the items REMOVED from the bag
  const totalRefundAmount = refundItems.reduce((acc, item) => {
    const refundedQty = item.maxQty - item.cartQty;
    return acc + (refundedQty * item.price);
  }, 0);
  
  const subtotal = totalRefundAmount;
  const originalTaxPercentage = (sale?.subtotal && sale.subtotal > 0) ? (Number(sale.tax) / Number(sale.subtotal)) : 0;
  const taxAmount = subtotal * originalTaxPercentage;
  const total = subtotal + taxAmount;
  
  const handleHoldOrder = () => {};
  const setPaymentModal = (a: any) => {
    const itemsToRefund = refundItems
      .map(item => ({ ...item, refundQty: item.maxQty - item.cartQty }))
      .filter(item => item.refundQty > 0);
      
    if (itemsToRefund.length === 0) {
      toast.error('No items selected for refund. Reduce quantities to refund items.');
      return;
    }
    
    setPendingConfirmData({ items: itemsToRefund, total });
    setIsConfirmOpen(true);
  };
  const setDiscountInputValue = (a: any) => {};
  const setDiscountFocusedBtn = (a: any) => {};
  const setIsDiscountModalOpen = (a: any) => {};
  const setCart = (a: any) => {
    // Clear all means customer returns EVERYTHING
    setRefundItems(prev => prev.map(item => ({ ...item, cartQty: 0 })));
  };
  const setDiscount = (a: any) => {};
  const user = { tenant: { plan: "PRO" } };

  return (
    <>
      <MainRightPanel
        isOpen={true}
        onClose={onClose}
        title="Refund Details"
        subtitle={`${totalItems} ${totalItems === 1 ? "Item" : "Items"}`}
        icon={RotateCcw}
        className="!w-[400px] !z-[210]"
        footerContent={
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-500 dark:text-slate-400 font-medium">
                <span>Subtotal</span>
                <span>{formatLKR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-orange-500 font-bold">
                  <span>Discount</span>
                  <span>-{formatLKR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 dark:text-slate-400 font-medium">
                <span>Tax ({(originalTaxPercentage * 100).toFixed(0)}%)</span>
                <span>{formatLKR(taxAmount)}</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-3 border-t border-gray-200 dark:border-slate-700">
              <span className="text-gray-900 dark:text-white font-black uppercase tracking-wider text-sm">
                Refund Total
              </span>
              <span className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight truncate ml-2 text-right">
                {formatLKR(total)}
              </span>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                disabled={total === 0}
                id="cart-pay-btn"
                onClick={() => {
                  setPaymentModal({ open: true, method: "CASH", cashAmount: "" });
                }}
                className={`w-full relative group overflow-hidden bg-red-600 text-white font-black text-lg h-14 rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3 ${focusedSection === "cart" && focusedCartIndex === cart.length + 3 ? "ring-4 ring-red-300 dark:ring-red-700" : ""}`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex flex-col items-center justify-center">
                  <span className="flex items-center justify-center gap-2 font-bold">
                    <Banknote className="w-5 h-5" />
                    REFUND NOW
                  </span>
                </span>
              </button>
            </div>
          </div>
        }
      >
        {/* Cart Items List */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {cart.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={item.productId}
                id={`cart-item-${index}`}
                className={`group flex flex-col p-3 border rounded-xl shadow-sm hover:border-blue-200 transition-colors ${focusedSection === "cart" && focusedCartIndex === index ? "bg-blue-50 dark:bg-slate-800 border-blue-400 ring-2 ring-blue-400" : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight pr-4 truncate">
                    {item.productName.length > 30 ? item.productName.substring(0, 30) + "..." : item.productName}
                  </h4>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {formatLKR(item.price)}
                  </span>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-lg p-0.5 border border-gray-100 dark:border-slate-700">
                    <button
                      onClick={() =>
                        updateQty(item.productId, -1)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= item.maxQty}
                      onClick={() =>
                        updateQty(item.productId, 1)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {cart.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
              <ShoppingCart className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-bold text-gray-500">Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">
                Scan or tap products to add
              </p>
            </div>
          )}
        </div>
      </MainRightPanel>

      <AnimatePresence>
        {isConfirmOpen && pendingConfirmData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Banknote className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Confirm Refund</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Are you sure you want to refund <span className="font-bold text-slate-900 dark:text-white">{formatLKR(pendingConfirmData.total)}</span>?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => { setIsConfirmOpen(false); onConfirm(pendingConfirmData.items, pendingConfirmData.total); }} className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
