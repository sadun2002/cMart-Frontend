'use client';

import React, { useState, useEffect } from 'react';
import { getIcon } from '@/lib/icon-registry';
import { DashboardComponentId } from '@/lib/dashboard-components';
import { 
  AreaChart, Area, 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip 
} from 'recharts';
import { KpiCard } from '@/components/ui/kpi-card';
import { getSetting } from '@/lib/db';

interface ComponentPreviewProps {
  comp: {
    id: DashboardComponentId;
    label: string;
    description: string;
    category: string;
    icon: string;
    size: 'small' | 'medium' | 'large';
  };
  isEnabled: boolean;
  layout: 'grid' | 'list';
  isDashboardView?: boolean;
  overrideData?: any;
}

/* ───────────────────────── Mock Data ───────────────────────── */

const KPI_DATA: Record<string, { value: string; change: string; up: boolean; color: string; bg: string }> = {
  'kpi-today-sales':          { value: 'Rs. 45,230',   change: '+12%', up: true,  color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  'kpi-month-revenue':        { value: 'Rs. 890,450',  change: '+8%',  up: true,  color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'kpi-today-orders':         { value: '38 orders',     change: '+5%',  up: true,  color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  'kpi-avg-order-value':      { value: 'Rs. 1,190',    change: '+3%',  up: true,  color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  'kpi-new-customers':        { value: '12 new',       change: '+15%', up: true,  color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  'kpi-online-orders-today':  { value: '15 orders',     change: '+20%', up: true,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  'kpi-pending-online-orders':{ value: '7 pending',    change: '-2%',  up: false, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  'kpi-total-products':       { value: '248 items',    change: '+4%',  up: true,  color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  'kpi-low-stock-count':      { value: '12 items',     change: 'Needs attention', up: false, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  'kpi-out-of-stock':         { value: '4 items',      change: 'Critical', up: false, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  'kpi-total-employees':      { value: '18 active',    change: 'Stable', up: true,  color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/30' },
  'kpi-active-employees':     { value: '14 present',   change: '+2 today', up: true,  color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  'kpi-today-profit':         { value: 'Rs. 12,400',   change: '+15%', up: true,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  'kpi-month-profit':         { value: 'Rs. 245,000',  change: '+9%',  up: true,  color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  'kpi-total-customers':      { value: '1,240 total',  change: '+8%',  up: true,  color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'kpi-total-sales-all':      { value: 'Rs. 4.2M',     change: '+18%', up: true,  color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  'kpi-conversion-rate':      { value: '24.5%',         change: '+2.1%', up: true,  color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  'kpi-refund-rate':          { value: '3.2%',          change: '-0.5%', up: true,  color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  'kpi-inventory-value':      { value: 'Rs. 1.8M',     change: 'Updated', up: true,  color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  'kpi-cash-in-hand':         { value: 'Rs. 78,500',   change: 'Synced', up: true,  color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
};

const CHART_DATA_7D = [
  { day: 'Mon', sales: 45000 },
  { day: 'Tue', sales: 52000 },
  { day: 'Wed', sales: 38000 },
  { day: 'Thu', sales: 65000 },
  { day: 'Fri', sales: 72000 },
  { day: 'Sat', sales: 85000 },
  { day: 'Sun', sales: 45230 },
];

const CHART_DATA_30D = [
  { day: 'W1', sales: 180000 },
  { day: 'W2', sales: 220000 },
  { day: 'W3', sales: 195000 },
  { day: 'W4', sales: 295450 },
];

const PIE_DATA = [
  { name: 'Clothing', value: 45000 },
  { name: 'Footwear', value: 30000 },
  { name: 'Electronics', value: 15000 },
  { name: 'Other', value: 10000 },
];

const DONUT_DATA = [
  { name: 'Cash', value: 50000 },
  { name: 'Card', value: 35000 },
  { name: 'Online', value: 15000 },
];

const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];

const LIST_ITEMS: Record<string, { name: string; value: string; badge?: string }[]> = {
  'list-top5-products':     [
    { name: 'T-Shirt Cotton', value: 'Rs. 15,000.00', badge: 'Rank #1' },
    { name: 'Jeans Slim Fit', value: 'Rs. 12,000.00', badge: 'Rank #2' },
    { name: 'Sneakers White', value: 'Rs. 10,000.00', badge: 'Rank #3' },
    { name: 'Cap Black', value: 'Rs. 5,000.00', badge: 'Rank #4' },
    { name: 'Belt Brown', value: 'Rs. 3,000.00', badge: 'Rank #5' }
  ],
  'list-top10-products':    [
    { name: 'T-Shirt Cotton', value: 'Rs. 15,000.00' },
    { name: 'Jeans Slim Fit', value: 'Rs. 12,000.00' },
    { name: 'Sneakers White', value: 'Rs. 10,000.00' },
    { name: 'Cap Black', value: 'Rs. 5,000.00' },
    { name: 'Belt Brown', value: 'Rs. 3,000.00' }
  ],
  'list-worst5-products':   [
    { name: 'Scarf Silk', value: 'Rs. 200.00', badge: 'Low demand' },
    { name: 'Tie Clip', value: 'Rs. 350.00', badge: 'No sales' },
    { name: 'Cufflinks Gold', value: 'Rs. 500.00', badge: 'Overstocked' }
  ],
  'list-top5-customers':    [
    { name: 'Sarah K.', value: 'Rs. 48,250.00', badge: '5 orders' },
    { name: 'John D.', value: 'Rs. 35,400.00', badge: '4 orders' },
    { name: 'Mike R.', value: 'Rs. 28,900.00', badge: '3 orders' }
  ],
  'list-top5-employees':    [
    { name: 'Anu S.', value: '82 orders completed', badge: 'POS' },
    { name: 'Nimal P.', value: '65 orders completed', badge: 'POS' },
    { name: 'Daya W.', value: '54 orders completed', badge: 'Online' }
  ],
  'list-top5-categories':   [
    { name: 'Clothing', value: 'Rs. 120,450.00' },
    { name: 'Footwear', value: 'Rs. 85,200.00' },
    { name: 'Accessories', value: 'Rs. 45,600.00' }
  ],
  'list-recent-stock-movements': [
    { name: 'T-Shirt Cotton (M)', value: '+50 stock added', badge: 'Restock' },
    { name: 'Jeans Slim (32)', value: '-12 stock sold', badge: 'POS Sale' },
    { name: 'Cap Black (OneSize)', value: '+25 stock added', badge: 'Restock' }
  ],
  'list-trending-products': [
    { name: 'Sneakers White', value: '+45% views increase' },
    { name: 'Watch Gold', value: '+32% views increase' },
    { name: 'Backpack Blue', value: '+28% views increase' }
  ],
  'list-featured-products': [
    { name: 'Premium Cotton Shirt', value: 'Rs. 4,500.00', badge: 'Active' },
    { name: 'Leather Messenger Bag', value: 'Rs. 12,000.00', badge: 'Active' }
  ],
  'list-recently-added-products': [
    { name: 'Linen Polo Shirt', value: 'Rs. 3,800.00', badge: 'New' },
    { name: 'Leather Sandals', value: 'Rs. 4,200.00', badge: 'New' }
  ],
};

const ALERT_ITEMS: Record<string, { item: string; detail: string; badge: string; color: string }[]> = {
  'alert-low-stock': [
    { item: 'T-Shirt Medium', detail: 'Only 5 items left in inventory', badge: 'Restock', color: 'text-orange-600 bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400' },
    { item: 'Jeans 32', detail: 'Only 3 items left in inventory', badge: 'Restock', color: 'text-orange-600 bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400' },
    { item: 'Sneakers Red', detail: 'Only 2 items left in inventory', badge: 'Restock', color: 'text-orange-600 bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400' },
  ],
  'alert-out-of-stock': [
    { item: 'Cap White', detail: 'Out of stock (0 items remaining)', badge: 'Critical', color: 'text-red-600 bg-red-100 dark:bg-red-950/30 dark:text-red-400' },
    { item: 'Belt Brown', detail: 'Out of stock (0 items remaining)', badge: 'Critical', color: 'text-red-600 bg-red-100 dark:bg-red-950/30 dark:text-red-400' },
  ],
  'alert-expiring-items': [
    { item: 'Organic Face Cream', detail: 'Expiring in 3 days', badge: 'Expiring', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400' },
    { item: 'Lemon Scented Perfume', detail: 'Expiring in 7 days', badge: 'Expiring', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400' },
  ],
  'alert-pending-orders': [
    { item: 'Order #1234', detail: 'Awaiting shipping confirmation', badge: 'Pending', color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400' },
    { item: 'Order #1235', detail: 'Awaiting payment verification', badge: 'Pending', color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400' },
  ],
  'alert-failed-payments': [
    { item: 'Invoice INV-098', detail: 'Card payment declined (Rs. 4,500)', badge: 'Failed', color: 'text-red-600 bg-red-100 dark:bg-red-950/30 dark:text-red-400' },
  ],
};

/* ───────────────────────── Component ───────────────────────── */

export function ComponentPreview({ comp, isEnabled, layout, isDashboardView = false, overrideData }: ComponentPreviewProps) {
  const CompIcon = getIcon(comp.icon);
  const [salesGoal, setSalesGoal] = useState<number>(500000);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (comp.category === 'progress' && comp.id === 'progress-monthly-sales-goal') {
      const fetchGoal = async () => {
        try {
          const val = await getSetting('monthly_sales_goal', '500000');
          setSalesGoal(Number(val) || 500000);
        } catch (e) {
          console.error(e);
        }
      };
      fetchGoal();
    }
  }, [comp]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── List view: compact single row ──
  if (layout === 'list') {
    return (
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isEnabled ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-slate-800'}`}>
          <CompIcon className={`w-4 h-4 ${isEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`} />
        </div>
        <div className="min-w-0">
          <h4 className={`text-sm font-semibold truncate ${isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-400'}`}>
            {comp.label}
          </h4>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{comp.description}</p>
        </div>
      </div>
    );
  }

  // ── Grid view: realistic visual mockups ──
  const dim = !isEnabled && !isDashboardView ? 'opacity-40 grayscale pointer-events-none' : '';

  switch (comp.category) {

        /* ═══════════════════ KPI CARDS ═══════════════════ */
        case 'kpi': {
          const data = overrideData || KPI_DATA[comp.id] || { value: '—', change: '0%', up: true, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
          return (
            <div className={`w-full ${dim}`}>
              <KpiCard 
                title={comp.label} 
                value={data.value} 
                icon={CompIcon as any} 
                iconColorClass={data.color} 
                iconBgClass={data.bg} 
              />
            </div>
          );
        }

    /* ═══════════════════ CHARTS ═══════════════════ */
    case 'charts':
    case 'comparison': {
      const isPie = comp.id.includes('pie');
      const isDonut = comp.id.includes('donut');
      const isGauge = comp.id.includes('gauge');

      return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 w-full text-left flex flex-col h-[380px] justify-between ${dim}`}>
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CompIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {comp.label}
            </h2>
            {!isDashboardView && <span className="text-[10px] text-gray-400 dark:text-slate-500 border border-gray-100 dark:border-slate-800 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800">Mock Data</span>}
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                {isPie || isDonut ? (
                  <PieChart>
                    <Pie
                      data={overrideData || (isDonut ? DONUT_DATA : PIE_DATA)}
                      cx="50%"
                      cy="50%"
                      innerRadius={isDonut ? 35 : 0}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {(overrideData || (isDonut ? DONUT_DATA : PIE_DATA)).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : isGauge ? (
                  <PieChart>
                    <Pie
                      data={[{ value: 75 }, { value: 25 }]}
                      cx="50%"
                      cy="75%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill="#3B82F6" />
                      <Cell fill="var(--slate-800, #E5E7EB)" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : comp.id.includes('bar') || comp.id.includes('stacked') ? (
                  <BarChart data={overrideData || CHART_DATA_7D} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => `Rs.${v}`} />
                    <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : comp.id.includes('line') ? (
                  <LineChart data={overrideData || CHART_DATA_7D} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => `Rs.${v}`} />
                    <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                ) : (
                  <AreaChart data={overrideData || CHART_DATA_7D} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => `Rs.${v}`} />
                    <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Loading chart...</div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mt-4 pt-3 border-t border-gray-50 dark:border-slate-800 flex-shrink-0 font-medium pr-12">
            <span>Overall Total</span>
            <span className="font-bold text-gray-900 dark:text-white">Rs. 402,230.00</span>
          </div>
        </div>
      );
    }

    /* ═══════════════════ LISTS ═══════════════════ */
    case 'lists':
    case 'inventory': {
      const items = overrideData || LIST_ITEMS[comp.id] || [];
      const rankColors = [
        'bg-amber-500 text-white',
        'bg-slate-400 text-white',
        'bg-orange-700 text-white'
      ];
      return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 w-full text-left flex flex-col h-[380px] justify-between ${dim}`}>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <CompIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {comp.label}
            </h2>
            <div className="space-y-4">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rankColors[i] || 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</div>
                      {item.badge && <div className="text-[10px] text-gray-500 dark:text-slate-400">{item.badge}</div>}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800 text-center">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">View All →</span>
          </div>
        </div>
      );
    }

    /* ═══════════════════ ALERTS ═══════════════════ */
    case 'alerts': {
      const alerts = overrideData || ALERT_ITEMS[comp.id] || [];
      return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 w-full text-left flex flex-col h-[380px] justify-between ${dim}`}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CompIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {comp.label}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">{alerts.length} items</span>
            </div>
            <div className="space-y-4">
              {alerts.slice(0, 3).map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border border-gray-100 dark:border-slate-800/80 rounded-xl bg-gray-50/50 dark:bg-slate-950/20">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{a.item}</div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 truncate">{a.detail}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${a.color}`}>
                    {a.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800 text-center">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">Resolve Alerts →</span>
          </div>
        </div>
      );
    }

    /* ═══════════════════ ACTIVITY / TIMELINES ═══════════════════ */
    case 'activity':
    case 'calendar': {
      const events = [
        { text: 'New sale completed - Rs. 2,500 by Sarah K.', time: '2 mins ago', color: 'bg-green-500' },
        { text: 'New online order #1234 received from shop', time: '15 mins ago', color: 'bg-blue-500' },
        { text: 'Low stock warning alert: T-Shirt Medium', time: '1 hr ago', color: 'bg-orange-500' },
      ];
      return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 w-full text-left flex flex-col h-[380px] justify-between ${dim}`}>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <CompIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {comp.label}
            </h2>
            <div className="relative pl-5 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-slate-700">
              {events.map((ev, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-5 top-1 w-3.5 h-3.5 rounded-full ${ev.color} ring-4 ring-white dark:ring-slate-900`} />
                  <div className="text-sm font-medium text-gray-800 dark:text-slate-300 leading-snug">{ev.text}</div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{ev.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    /* ═══════════════════ PROGRESS BAR ═══════════════════ */
    case 'progress': {
      // Mock progress of 340000 for demonstration purposes
      const currentSales = 340000;
      const target = comp.id === 'progress-monthly-sales-goal' ? salesGoal : 890450;
      const pct = Math.min(100, Math.round((currentSales / target) * 100)) || 0;
      const remaining = Math.max(0, target - currentSales);
      
      return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 w-full text-left flex flex-col h-[380px] justify-between ${dim}`}>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <CompIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {comp.label}
            </h2>
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-800 dark:text-slate-200">{pct}% Completed</span>
                <span className="text-gray-400 dark:text-slate-500">Target: Rs. {target.toLocaleString()}</span>
              </div>
              <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-slate-700">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Your store is currently performing well. You need Rs. {remaining.toLocaleString()} more to hit the goal.
              </p>
            </div>
          </div>
        </div>
      );
    }

    /* ═══════════════════ TABLES ═══════════════════ */
    case 'tables':
    case 'financial':
    case 'inventory':
    case 'hr':
    case 'online':
    case 'misc': {
      const rows = [
        { inv: 'INV-001', customer: 'Sarah K.', amount: 'Rs. 2,500', time: '2 mins ago' },
        { inv: 'INV-002', customer: 'John D.', amount: 'Rs. 1,800', time: '1 hr ago' },
        { inv: 'INV-003', customer: 'Mike R.', amount: 'Rs. 4,200', time: '3 hrs ago' },
      ];
      return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 w-full text-left flex flex-col h-[380px] justify-between ${dim}`}>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <CompIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {comp.label}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 pb-2">
                    {['Invoice', 'Customer', 'Amount', 'Time'].map((h, i) => (
                      <th key={i} className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider pb-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {rows.map((row, ri) => (
                    <tr key={ri} className="py-2">
                      <td className="text-xs font-semibold text-blue-600 dark:text-blue-400 py-2">{row.inv}</td>
                      <td className="text-xs text-gray-700 dark:text-slate-300 py-2">{row.customer}</td>
                      <td className="text-xs font-bold text-gray-900 dark:text-white py-2">{row.amount}</td>
                      <td className="text-[10px] text-gray-400 dark:text-slate-500 py-2">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    /* ═══════════════════ QUICK ACTIONS ═══════════════════ */
    case 'quickActions':
      return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 w-full text-left flex flex-col h-[380px] justify-between ${dim}`}>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <CompIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {comp.label}
            </h2>
            <div className="space-y-3 mt-6">
              <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <span>+ Create New Sale</span>
              </button>
              <button className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl text-sm border border-gray-200/50 dark:border-slate-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <span>+ Add Product Item</span>
              </button>
            </div>
          </div>
        </div>
      );

    /* ═══════════════════ DEFAULT / FALLBACK ═══════════════════ */
    default:
      return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 w-full text-left flex flex-col h-[380px] justify-between ${dim}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-slate-800'}`}>
              <CompIcon className={`w-5 h-5 ${isEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">{comp.label}</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{comp.description}</p>
            </div>
          </div>
        </div>
      );
  }
}
