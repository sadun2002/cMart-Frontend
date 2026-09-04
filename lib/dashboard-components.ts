'use client';

export type DashboardComponentId =
  | 'kpi-today-sales'
  | 'kpi-month-revenue'
  | 'kpi-today-orders'
  | 'kpi-avg-order-value'
  | 'kpi-new-customers'
  | 'kpi-online-orders-today'
  | 'kpi-pending-online-orders'
  | 'kpi-total-products'
  | 'kpi-low-stock-count'
  | 'kpi-out-of-stock'
  | 'kpi-total-employees'
  | 'kpi-active-employees'
  | 'kpi-today-profit'
  | 'kpi-month-profit'
  | 'kpi-total-customers'
  | 'kpi-total-sales-all'
  | 'kpi-conversion-rate'
  | 'kpi-refund-rate'
  | 'kpi-inventory-value'
  | 'kpi-cash-in-hand'
  | 'chart-sales-7d-line'
  | 'chart-sales-30d-line'
  | 'chart-sales-bar-day'
  | 'chart-sales-area-cumulative'
  | 'chart-revenue-vs-target-gauge'
  | 'chart-sales-by-category-pie'
  | 'chart-sales-by-payment-donut'
  | 'chart-sales-by-hour-bar'
  | 'chart-sales-by-employee-bar'
  | 'chart-sales-by-weekday-heatmap'
  | 'chart-online-vs-pos-stacked'
  | 'chart-profit-margin-trend'
  | 'chart-refund-trend'
  | 'chart-customer-growth'
  | 'chart-product-performance-bar'
  | 'list-top5-products'
  | 'list-top10-products'
  | 'list-worst5-products'
  | 'list-top5-customers'
  | 'list-top5-employees'
  | 'list-top5-categories'
  | 'list-recent-stock-movements'
  | 'list-trending-products'
  | 'list-featured-products'
  | 'list-recently-added-products'
  | 'alert-low-stock'
  | 'alert-out-of-stock'
  | 'alert-pending-online-orders'
  | 'alert-payment-due'
  | 'alert-employee-absent'
  | 'alert-late-checkins'
  | 'alert-expiring-products'
  | 'alert-price-changes'
  | 'alert-system-notifications'
  | 'alert-backup-status'
  | 'table-recent-sales'
  | 'table-recent-orders'
  | 'table-recent-customers'
  | 'table-recent-activities'
  | 'table-top-products'
  | 'table-low-stock'
  | 'table-today-sales-detailed'
  | 'table-pending-payments'
  | 'table-employee-attendance'
  | 'table-refund-requests'
  | 'calendar-mini'
  | 'calendar-today-schedule'
  | 'calendar-employee-shifts'
  | 'calendar-upcoming-events'
  | 'calendar-delivery-schedule'
  | 'calendar-restock-schedule'
  | 'progress-monthly-sales-goal'
  | 'progress-daily-sales-goal'
  | 'progress-quarterly-target'
  | 'progress-annual-goal'
  | 'progress-product-target'
  | 'progress-customer-acquisition'
  | 'progress-online-traffic'
  | 'progress-employee-performance'
  | 'progress-inventory-turnover'
  | 'activity-recent-feed'
  | 'activity-system-log'
  | 'activity-user-log'
  | 'activity-employee-feed'
  | 'activity-customer-feed'
  | 'activity-audit-log'
  | 'quick-actions'
  | 'comparison-today-vs-yesterday'
  | 'comparison-week-vs-last-week'
  | 'comparison-month-vs-last-month'
  | 'comparison-year-vs-last-year'
  | 'comparison-pos-vs-online'
  | 'comparison-industry-average'
  | 'comparison-current-vs-target'
  | 'map-customer-locations'
  | 'map-delivery-locations'
  | 'map-multi-store'
  | 'map-sales-by-region'
  | 'financial-cash-register'
  | 'financial-payment-breakdown'
  | 'financial-outstanding-payments'
  | 'financial-expected-revenue'
  | 'financial-refund-requests'
  | 'financial-cash-reconciliation'
  | 'financial-bank-deposits'
  | 'inventory-total-value'
  | 'inventory-turnover-rate'
  | 'inventory-dead-stock'
  | 'inventory-fast-moving'
  | 'inventory-stock-aging'
  | 'inventory-reorder-suggestions'
  | 'inventory-stock-heatmap'
  | 'hr-employees-present'
  | 'hr-employees-on-leave'
  | 'hr-late-arrivals'
  | 'hr-top-salesperson'
  | 'hr-employee-performance-week'
  | 'hr-attendance-percentage'
  | 'hr-sales-per-employee'
  | 'hr-shift-coverage'
  | 'online-visitors-today'
  | 'online-conversion-rate'
  | 'online-cart-abandonment'
  | 'online-avg-order-value'
  | 'online-top-pages'
  | 'online-traffic-sources'
  | 'online-revenue-today'
  | 'online-pending-shipments'
  | 'online-product-page-views'
  | 'online-social-referrals'
  | 'device-sales-mobile-desktop'
  | 'device-app-vs-web'
  | 'device-ios-vs-android'
  | 'device-browser-stats'
  | 'system-uptime'
  | 'system-last-backup'
  | 'system-storage-usage'
  | 'system-api-health'
  | 'system-db-performance'
  | 'system-active-sessions'
  | 'customer-new-vs-returning'
  | 'customer-ltv'
  | 'customer-retention'
  | 'customer-satisfaction'
  | 'customer-demographics'
  | 'customer-purchase-frequency'
  | 'customer-segments'
  | 'customer-birthdays'
  | 'time-this-hour-vs-last'
  | 'time-peak-hour'
  | 'time-best-day-week'
  | 'time-best-day-month'
  | 'time-seasonal-trends'
  | 'time-holiday-comparison'
  | 'promo-active-count'
  | 'promo-discount-codes-used'
  | 'promo-revenue-impact'
  | 'promo-abandoned-cart'
  | 'promo-email-performance'
  | 'promo-sms-performance'
  | 'misc-pending-tasks'
  | 'misc-pending-approvals'
  | 'misc-customer-reviews'
  | 'misc-product-ratings'
  | 'misc-supplier-deliveries'
  | 'misc-notes-reminders'
  | 'misc-weather'
  | 'misc-news-updates'
  | 'misc-tips-suggestions'
  | 'misc-help-support';

export interface DashboardComponent {
  id: DashboardComponentId;
  label: string;
  description: string;
  category: string;
  icon: string;
  default: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export const CATEGORY_LIMITS: Record<string, number> = {
  kpi: 8,
  charts: 1,
  lists: 1,
  alerts: 1,
  tables: 1,
  calendar: 1,
  progress: 1,
  activity: 1,
  quickActions: 1,
  comparison: 1,
  financial: 1,
  inventory: 1,
  hr: 1,
  online: 1,
  map: 1,
  device: 1,
  system: 1,
  customer: 1,
  time: 1,
  promo: 1,
  misc: 1,
};

export const componentCategories = [
  { key: 'kpi', label: 'KPI Cards (Metric Cards)', icon: 'LayoutDashboard', color: 'blue', bgClass: 'bg-blue-100 dark:bg-blue-900/30', textClass: 'text-blue-600 dark:text-blue-400' },
  { key: 'charts', label: 'Charts (Graphs)', icon: 'BarChart3', color: 'emerald', bgClass: 'bg-emerald-100 dark:bg-emerald-900/30', textClass: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'lists', label: 'Lists / Rankings', icon: 'ListOrdered', color: 'violet', bgClass: 'bg-violet-100 dark:bg-violet-900/30', textClass: 'text-violet-600 dark:text-violet-400' },
  { key: 'alerts', label: 'Alerts / Warnings', icon: 'AlertTriangle', color: 'orange', bgClass: 'bg-orange-100 dark:bg-orange-900/30', textClass: 'text-orange-600 dark:text-orange-400' },
  { key: 'tables', label: 'Tables (Data Tables)', icon: 'Table', color: 'sky', bgClass: 'bg-sky-100 dark:bg-sky-900/30', textClass: 'text-sky-600 dark:text-sky-400' },
  { key: 'calendar', label: 'Calendar / Schedule', icon: 'Calendar', color: 'rose', bgClass: 'bg-rose-100 dark:bg-rose-900/30', textClass: 'text-rose-600 dark:text-rose-400' },
  { key: 'progress', label: 'Progress / Goals', icon: 'Target', color: 'amber', bgClass: 'bg-amber-100 dark:bg-amber-900/30', textClass: 'text-amber-600 dark:text-amber-400' },
  { key: 'activity', label: 'Activity / Feed', icon: 'Activity', color: 'indigo', bgClass: 'bg-indigo-100 dark:bg-indigo-900/30', textClass: 'text-indigo-600 dark:text-indigo-400' },
  { key: 'quickActions', label: 'Quick Actions', icon: 'Zap', color: 'purple', bgClass: 'bg-purple-100 dark:bg-purple-900/30', textClass: 'text-purple-600 dark:text-purple-400' },
  { key: 'comparison', label: 'Comparison Widgets', icon: 'GitCompare', color: 'cyan', bgClass: 'bg-cyan-100 dark:bg-cyan-900/30', textClass: 'text-cyan-600 dark:text-cyan-400' },
  { key: 'map', label: 'Map / Location', icon: 'MapPin', color: 'pink', bgClass: 'bg-pink-100 dark:bg-pink-900/30', textClass: 'text-pink-600 dark:text-pink-400' },
  { key: 'financial', label: 'Financial / Cash', icon: 'CreditCard', color: 'green', bgClass: 'bg-green-100 dark:bg-green-900/30', textClass: 'text-green-600 dark:text-green-400' },
  { key: 'inventory', label: 'Inventory Specific', icon: 'Package', color: 'lime', bgClass: 'bg-lime-100 dark:bg-lime-900/30', textClass: 'text-lime-600 dark:text-lime-400' },
  { key: 'hr', label: 'HR / Employee', icon: 'Users', color: 'fuchsia', bgClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', textClass: 'text-fuchsia-600 dark:text-fuchsia-400' },
  { key: 'online', label: 'Online Store (E-commerce)', icon: 'Globe', color: 'teal', bgClass: 'bg-teal-100 dark:bg-teal-900/30', textClass: 'text-teal-600 dark:text-teal-400' },
  { key: 'device', label: 'Mobile / Device Stats', icon: 'Smartphone', color: 'slate', bgClass: 'bg-slate-100 dark:bg-slate-500/20', textClass: 'text-slate-600 dark:text-slate-300' },
  { key: 'system', label: 'System / Technical', icon: 'Server', color: 'gray', bgClass: 'bg-gray-100 dark:bg-gray-500/20', textClass: 'text-gray-600 dark:text-gray-300' },
  { key: 'customer', label: 'Customer Specific', icon: 'UserCheck', color: 'indigo', bgClass: 'bg-indigo-100 dark:bg-indigo-900/30', textClass: 'text-indigo-600 dark:text-indigo-400' },
  { key: 'time', label: 'Time-Based Comparisons', icon: 'Clock', color: 'orange', bgClass: 'bg-orange-100 dark:bg-orange-900/30', textClass: 'text-orange-600 dark:text-orange-400' },
  { key: 'promo', label: 'Promotions / Marketing', icon: 'Gift', color: 'rose', bgClass: 'bg-rose-100 dark:bg-rose-900/30', textClass: 'text-rose-600 dark:text-rose-400' },
  { key: 'misc', label: 'Other / Misc', icon: 'MoreHorizontal', color: 'neutral', bgClass: 'bg-neutral-100 dark:bg-neutral-500/20', textClass: 'text-neutral-600 dark:text-neutral-300' },
] as const;

export const dashboardComponents: DashboardComponent[] = [
  // KPI Cards
  { id: 'kpi-today-sales', label: "Today's Sales", description: 'Total sales amount for today', category: 'kpi', icon: 'DollarSign', default: true, size: 'medium' },
  { id: 'kpi-month-revenue', label: 'This Month Revenue', description: 'Total revenue for current month', category: 'kpi', icon: 'TrendingUp', default: true, size: 'medium' },
  { id: 'kpi-today-orders', label: "Today's Orders Count", description: 'Number of orders placed today', category: 'kpi', icon: 'ShoppingCart', default: true, size: 'medium' },
  { id: 'kpi-avg-order-value', label: 'Average Order Value', description: 'Average value per order', category: 'kpi', icon: 'Calculator', default: true, size: 'medium' },
  { id: 'kpi-new-customers', label: 'New Customers Today', description: 'New customer registrations today', category: 'kpi', icon: 'UserPlus', default: false, size: 'medium' },
  { id: 'kpi-online-orders-today', label: 'Online Orders Today', description: 'Online store orders placed today', category: 'kpi', icon: 'Globe', default: true, size: 'medium' },
  { id: 'kpi-pending-online-orders', label: 'Pending Online Orders', description: 'Orders awaiting fulfillment', category: 'kpi', icon: 'Clock', default: true, size: 'medium' },
  { id: 'kpi-total-products', label: 'Total Products', description: 'Total active products in catalog', category: 'kpi', icon: 'Package', default: true, size: 'medium' },
  { id: 'kpi-low-stock-count', label: 'Low Stock Items', description: 'Products below minimum stock threshold', category: 'kpi', icon: 'AlertTriangle', default: true, size: 'medium' },
  { id: 'kpi-out-of-stock', label: 'Out of Stock Items', description: 'Products with zero inventory', category: 'kpi', icon: 'XCircle', default: false, size: 'medium' },
  { id: 'kpi-total-employees', label: 'Total Employees', description: 'Total active employees', category: 'kpi', icon: 'Users', default: false, size: 'medium' },
  { id: 'kpi-active-employees', label: 'Active Employees', description: 'Currently checked-in employees', category: 'kpi', icon: 'UserCheck', default: false, size: 'medium' },
  { id: 'kpi-today-profit', label: "Today's Profit", description: 'Net profit for today', category: 'kpi', icon: 'Wallet', default: false, size: 'medium' },
  { id: 'kpi-month-profit', label: 'Monthly Profit', description: 'Net profit for current month', category: 'kpi', icon: 'Wallet', default: false, size: 'medium' },
  { id: 'kpi-total-customers', label: 'Total Customers (All Time)', description: 'Total registered customers', category: 'kpi', icon: 'Users', default: false, size: 'medium' },
  { id: 'kpi-total-sales-all', label: 'Total Sales (All Time)', description: 'Cumulative sales since inception', category: 'kpi', icon: 'TrendingUp', default: false, size: 'medium' },
  { id: 'kpi-conversion-rate', label: 'Conversion Rate', description: 'POS to Online conversion rate', category: 'kpi', icon: 'Percent', default: false, size: 'medium' },
  { id: 'kpi-refund-rate', label: 'Refund Rate', description: 'Percentage of refunded orders', category: 'kpi', icon: 'RotateCcw', default: false, size: 'medium' },
  { id: 'kpi-inventory-value', label: 'Inventory Value', description: 'Total worth of current stock', category: 'kpi', icon: 'Coins', default: false, size: 'medium' },
  { id: 'kpi-cash-in-hand', label: 'Cash in Hand', description: 'Current cash register balance', category: 'kpi', icon: 'Banknote', default: false, size: 'medium' },

  // Charts
  { id: 'chart-sales-7d-line', label: 'Sales Chart (7 Days)', description: 'Line chart of daily sales for last 7 days', category: 'charts', icon: 'LineChart', default: true, size: 'large' },
  { id: 'chart-sales-30d-line', label: 'Sales Chart (30 Days)', description: 'Line chart of daily sales for last 30 days', category: 'charts', icon: 'LineChart', default: false, size: 'large' },
  { id: 'chart-sales-bar-day', label: 'Sales by Day (Bar)', description: 'Bar chart of sales by day of week', category: 'charts', icon: 'BarChart', default: false, size: 'large' },
  { id: 'chart-sales-area-cumulative', label: 'Cumulative Sales (Area)', description: 'Area chart of cumulative sales', category: 'charts', icon: 'AreaChart', default: false, size: 'large' },
  { id: 'chart-revenue-vs-target-gauge', label: 'Revenue vs Target (Gauge)', description: 'Gauge chart showing progress to target', category: 'charts', icon: 'Gauge', default: true, size: 'medium' },
  { id: 'chart-sales-by-category-pie', label: 'Sales by Category (Pie)', description: 'Pie chart of sales distribution by category', category: 'charts', icon: 'PieChart', default: true, size: 'medium' },
  { id: 'chart-sales-by-payment-donut', label: 'Sales by Payment (Donut)', description: 'Donut chart of payment method distribution', category: 'charts', icon: 'DonutChart', default: false, size: 'medium' },
  { id: 'chart-sales-by-hour-bar', label: 'Sales by Hour (Bar)', description: 'Bar chart showing peak sales hours', category: 'charts', icon: 'BarChart2', default: false, size: 'large' },
  { id: 'chart-sales-by-employee-bar', label: 'Sales by Employee', description: 'Bar chart of sales per employee', category: 'charts', icon: 'BarChart2', default: false, size: 'large' },
  { id: 'chart-sales-by-weekday-heatmap', label: 'Sales by Day of Week (Heatmap)', description: 'Heatmap of sales by day and hour', category: 'charts', icon: 'Grid', default: false, size: 'large' },
  { id: 'chart-online-vs-pos-stacked', label: 'Online vs POS (Stacked)', description: 'Stacked bar chart comparing channels', category: 'charts', icon: 'Layers', default: true, size: 'large' },
  { id: 'chart-profit-margin-trend', label: 'Profit Margin Trend', description: 'Line chart of profit margin over time', category: 'charts', icon: 'LineChart', default: false, size: 'large' },
  { id: 'chart-refund-trend', label: 'Refund Trend', description: 'Line chart of refund amounts', category: 'charts', icon: 'LineChart', default: false, size: 'large' },
  { id: 'chart-customer-growth', label: 'Customer Growth', description: 'Line chart of customer acquisition', category: 'charts', icon: 'LineChart', default: false, size: 'large' },
  { id: 'chart-product-performance-bar', label: 'Product Performance', description: 'Bar chart of top product performance', category: 'charts', icon: 'BarChart2', default: false, size: 'large' },

  // Lists
  { id: 'list-top5-products', label: 'Top 5 Products', description: 'Best selling products by revenue', category: 'lists', icon: 'Trophy', default: true, size: 'medium' },
  { id: 'list-top10-products', label: 'Top 10 Products', description: 'Extended best sellers list', category: 'lists', icon: 'Trophy', default: false, size: 'medium' },
  { id: 'list-worst5-products', label: 'Worst 5 Products', description: 'Slowest moving products', category: 'lists', icon: 'TrendingDown', default: false, size: 'medium' },
  { id: 'list-top5-customers', label: 'Top 5 Customers', description: 'Customers with highest spending', category: 'lists', icon: 'Star', default: false, size: 'medium' },
  { id: 'list-top5-employees', label: 'Top 5 Employees', description: 'Employees with most sales', category: 'lists', icon: 'Award', default: false, size: 'medium' },
  { id: 'list-top5-categories', label: 'Top 5 Categories', description: 'Categories generating most revenue', category: 'lists', icon: 'Tag', default: false, size: 'medium' },
  { id: 'list-recent-stock-movements', label: 'Recent Stock Movements', description: 'Latest inventory changes', category: 'lists', icon: 'ArrowUpDown', default: false, size: 'medium' },
  { id: 'list-trending-products', label: 'Trending Products', description: 'Products gaining popularity this week', category: 'lists', icon: 'TrendingUp', default: false, size: 'medium' },
  { id: 'list-featured-products', label: 'Featured Products', description: 'Products marked as featured', category: 'lists', icon: 'Star', default: false, size: 'medium' },
  { id: 'list-recently-added-products', label: 'Recently Added Products', description: 'Newest products in catalog', category: 'lists', icon: 'Plus', default: false, size: 'medium' },

  // Alerts
  { id: 'alert-low-stock', label: 'Low Stock Alert', description: 'Items below minimum stock level', category: 'alerts', icon: 'AlertTriangle', default: true, size: 'medium' },
  { id: 'alert-out-of-stock', label: 'Out of Stock Alert', description: 'Products with zero inventory', category: 'alerts', icon: 'XCircle', default: true, size: 'medium' },
  { id: 'alert-pending-online-orders', label: 'Pending Online Orders', description: 'Online orders awaiting action', category: 'alerts', icon: 'Clock', default: true, size: 'medium' },
  { id: 'alert-payment-due', label: 'Payment Due Alerts', description: 'Subscription or payment reminders', category: 'alerts', icon: 'CreditCard', default: false, size: 'medium' },
  { id: 'alert-employee-absent', label: 'Employee Absent Today', description: 'Employees who did not check in', category: 'alerts', icon: 'UserX', default: false, size: 'medium' },
  { id: 'alert-late-checkins', label: 'Late Check-ins', description: 'Employees checking in late', category: 'alerts', icon: 'Clock', default: false, size: 'medium' },
  { id: 'alert-expiring-products', label: 'Expiring Products', description: 'Products nearing expiry date', category: 'alerts', icon: 'Calendar', default: false, size: 'medium' },
  { id: 'alert-price-changes', label: 'Price Change Alerts', description: 'Recent price modifications', category: 'alerts', icon: 'Tag', default: false, size: 'medium' },
  { id: 'alert-system-notifications', label: 'System Notifications', description: 'System-wide announcements', category: 'alerts', icon: 'Bell', default: false, size: 'medium' },
  { id: 'alert-backup-status', label: 'Backup Status', description: 'Last backup completion status', category: 'alerts', icon: 'Database', default: true, size: 'small' },

  // Tables
  { id: 'table-recent-sales', label: 'Recent Sales', description: 'Last 5-10 sales transactions', category: 'tables', icon: 'Receipt', default: true, size: 'large' },
  { id: 'table-recent-orders', label: 'Recent Orders', description: 'Latest customer orders', category: 'tables', icon: 'ShoppingBag', default: false, size: 'large' },
  { id: 'table-recent-customers', label: 'Recent Customers', description: 'Newest customer registrations', category: 'tables', icon: 'UserPlus', default: false, size: 'large' },
  { id: 'table-recent-activities', label: 'Recent Activities', description: 'System activity timeline', category: 'tables', icon: 'Activity', default: true, size: 'large' },
  { id: 'table-top-products', label: 'Top Products Table', description: 'Detailed best sellers table', category: 'tables', icon: 'Table', default: false, size: 'large' },
  { id: 'table-low-stock', label: 'Low Stock Products', description: 'Detailed low inventory table', category: 'tables', icon: 'Table', default: false, size: 'large' },
  { id: 'table-today-sales-detailed', label: "Today's Sales Detail", description: 'Full breakdown of today sales', category: 'tables', icon: 'Table', default: false, size: 'large' },
  { id: 'table-pending-payments', label: 'Pending Payments', description: 'Outstanding customer payments', category: 'tables', icon: 'Table', default: false, size: 'large' },
  { id: 'table-employee-attendance', label: 'Employee Attendance (Today)', description: 'Today check-in/out records', category: 'tables', icon: 'Table', default: false, size: 'large' },
  { id: 'table-refund-requests', label: 'Refund Requests', description: 'Pending refund approvals', category: 'tables', icon: 'Table', default: false, size: 'large' },

  // Calendar
  { id: 'calendar-mini', label: 'Mini Calendar', description: 'Current month view', category: 'calendar', icon: 'Calendar', default: false, size: 'medium' },
  { id: 'calendar-today-schedule', label: "Today's Schedule", description: 'Appointments and tasks for today', category: 'calendar', icon: 'Calendar', default: false, size: 'medium' },
  { id: 'calendar-employee-shifts', label: "Employee Shifts Today", description: 'Shift schedule for today', category: 'calendar', icon: 'Clock', default: false, size: 'medium' },
  { id: 'calendar-upcoming-events', label: 'Upcoming Events', description: 'Holidays and special events', category: 'calendar', icon: 'CalendarDays', default: false, size: 'medium' },
  { id: 'calendar-delivery-schedule', label: 'Delivery Schedule', description: 'Online order delivery timeline', category: 'calendar', icon: 'Truck', default: false, size: 'medium' },
  { id: 'calendar-restock-schedule', label: 'Restock Schedule', description: 'Planned inventory replenishment', category: 'calendar', icon: 'RotateCcw', default: false, size: 'medium' },

  // Progress / Goals
  { id: 'progress-monthly-sales-goal', label: 'Monthly Sales Goal', description: 'Progress toward monthly revenue target', category: 'progress', icon: 'Target', default: true, size: 'large' },
  { id: 'progress-daily-sales-goal', label: 'Daily Sales Goal', description: 'Progress toward daily revenue target', category: 'progress', icon: 'Target', default: false, size: 'medium' },
  { id: 'progress-quarterly-target', label: 'Quarterly Target', description: 'Quarterly revenue progress', category: 'progress', icon: 'Target', default: false, size: 'medium' },
  { id: 'progress-annual-goal', label: 'Annual Goal', description: 'Yearly revenue progress', category: 'progress', icon: 'Target', default: false, size: 'medium' },
  { id: 'progress-product-target', label: 'Product Sales Target', description: 'Per-product sales goals', category: 'progress', icon: 'Target', default: false, size: 'medium' },
  { id: 'progress-customer-acquisition', label: 'Customer Acquisition Goal', description: 'New customer target progress', category: 'progress', icon: 'Target', default: false, size: 'medium' },
  { id: 'progress-online-traffic', label: 'Online Traffic Goal', description: 'Website visitor target', category: 'progress', icon: 'Target', default: false, size: 'medium' },
  { id: 'progress-employee-performance', label: 'Employee Performance Goals', description: 'Individual employee targets', category: 'progress', icon: 'Target', default: false, size: 'medium' },
  { id: 'progress-inventory-turnover', label: 'Inventory Turnover Goal', description: 'Stock rotation target', category: 'progress', icon: 'Target', default: false, size: 'medium' },

  // Activity / Feed
  { id: 'activity-recent-feed', label: 'Recent Activity Feed', description: 'Timeline of recent system events', category: 'activity', icon: 'Activity', default: true, size: 'large' },
  { id: 'activity-system-log', label: 'System Activity Log', description: 'Detailed system events', category: 'activity', icon: 'FileText', default: false, size: 'large' },
  { id: 'activity-user-log', label: 'User Activity Log', description: 'Actions by User', category: 'activity', icon: 'User', default: false, size: 'large' },
  { id: 'activity-employee-feed', label: 'Employee Activity Feed', description: 'Employee-specific events', category: 'activity', icon: 'Users', default: false, size: 'large' },
  { id: 'activity-customer-feed', label: 'Customer Activity Feed', description: 'Customer interaction timeline', category: 'activity', icon: 'UserCheck', default: false, size: 'large' },
  { id: 'activity-audit-log', label: 'Audit Log', description: 'Enterprise audit trail', category: 'activity', icon: 'Shield', default: false, size: 'large' },

  // Quick Actions
  { id: 'quick-actions', label: 'Quick Action Buttons', description: 'New Sale, Add Product, Add Customer, etc.', category: 'quickActions', icon: 'Zap', default: true, size: 'small' },

  // Comparison
  { id: 'comparison-today-vs-yesterday', label: 'Today vs Yesterday', description: 'Sales comparison with yesterday', category: 'comparison', icon: 'GitCompare', default: false, size: 'medium' },
  { id: 'comparison-week-vs-last-week', label: 'This Week vs Last Week', description: 'Weekly sales comparison', category: 'comparison', icon: 'GitCompare', default: true, size: 'medium' },
  { id: 'comparison-month-vs-last-month', label: 'This Month vs Last Month', description: 'Monthly sales comparison', category: 'comparison', icon: 'GitCompare', default: true, size: 'medium' },
  { id: 'comparison-year-vs-last-year', label: 'This Year vs Last Year', description: 'Yearly sales comparison', category: 'comparison', icon: 'GitCompare', default: false, size: 'medium' },
  { id: 'comparison-pos-vs-online', label: 'POS vs Online Performance', description: 'Channel comparison', category: 'comparison', icon: 'GitCompare', default: true, size: 'medium' },
  { id: 'comparison-industry-average', label: 'Industry Average', description: 'Performance vs benchmarks', category: 'comparison', icon: 'BarChart2', default: false, size: 'medium' },
  { id: 'comparison-current-vs-target', label: 'Current vs Target', description: 'Actual vs planned performance', category: 'comparison', icon: 'Target', default: false, size: 'medium' },

  // Maps
  { id: 'map-customer-locations', label: 'Customer Locations', description: 'Geographic customer distribution', category: 'map', icon: 'MapPin', default: false, size: 'large' },
  { id: 'map-delivery-locations', label: 'Delivery Locations', description: 'Active delivery destinations', category: 'map', icon: 'MapPin', default: false, size: 'large' },
  { id: 'map-multi-store', label: 'Multi-Store Locations', description: 'All store locations', category: 'map', icon: 'Building2', default: false, size: 'large' },
  { id: 'map-sales-by-region', label: 'Sales by Region', description: 'Revenue heatmap by area', category: 'map', icon: 'Map', default: false, size: 'large' },

  // Financial
  { id: 'financial-cash-register', label: 'Cash Register Status', description: 'Current cash drawer balance', category: 'financial', icon: 'Wallet', default: false, size: 'medium' },
  { id: 'financial-payment-breakdown', label: 'Payment Methods Breakdown', description: 'Today payments by method', category: 'financial', icon: 'CreditCard', default: true, size: 'medium' },
  { id: 'financial-outstanding-payments', label: 'Outstanding Payments', description: 'Credit sales awaiting payment', category: 'financial', icon: 'DollarSign', default: false, size: 'medium' },
  { id: 'financial-expected-revenue', label: 'Expected Revenue', description: 'Pending orders value', category: 'financial', icon: 'TrendingUp', default: false, size: 'medium' },
  { id: 'financial-refund-requests', label: 'Refund Requests Pending', description: 'Awaiting refund approval', category: 'financial', icon: 'RotateCcw', default: false, size: 'medium' },
  { id: 'financial-cash-reconciliation', label: 'Daily Cash Reconciliation', description: 'End-of-day cash verification', category: 'financial', icon: 'CheckCircle', default: false, size: 'medium' },
  { id: 'financial-bank-deposits', label: 'Bank Deposits Needed', description: 'Amount to deposit to bank', category: 'financial', icon: 'Building', default: false, size: 'medium' },

  // Inventory
  { id: 'inventory-total-value', label: 'Inventory Total Value', description: 'Worth of all stock on hand', category: 'inventory', icon: 'Coins', default: true, size: 'medium' },
  { id: 'inventory-turnover-rate', label: 'Inventory Turnover Rate', description: 'How fast stock sells', category: 'inventory', icon: 'RotateCcw', default: false, size: 'medium' },
  { id: 'inventory-dead-stock', label: 'Dead Stock (90+ days)', description: 'Products with no sales 90+ days', category: 'inventory', icon: 'Package', default: false, size: 'medium' },
  { id: 'inventory-fast-moving', label: 'Fast Moving Items', description: 'Highest velocity products', category: 'inventory', icon: 'Zap', default: false, size: 'medium' },
  { id: 'inventory-stock-aging', label: 'Stock Aging Report', description: 'Inventory age distribution', category: 'inventory', icon: 'Clock', default: false, size: 'medium' },
  { id: 'inventory-reorder-suggestions', label: 'Reorder Suggestions', description: 'AI recommended reorder quantities', category: 'inventory', icon: 'ShoppingCart', default: false, size: 'medium' },
  { id: 'inventory-stock-heatmap', label: 'Stock Movement Heatmap', description: 'Visual stock velocity map', category: 'inventory', icon: 'Grid', default: false, size: 'large' },

  // HR / Employee
  { id: 'hr-employees-present', label: 'Employees Present Today', description: 'Currently checked-in staff', category: 'hr', icon: 'UserCheck', default: true, size: 'medium' },
  { id: 'hr-employees-on-leave', label: 'Employees on Leave', description: 'Staff on vacation/sick leave', category: 'hr', icon: 'UserX', default: false, size: 'medium' },
  { id: 'hr-late-arrivals', label: 'Late Arrivals Today', description: 'Staff checking in late', category: 'hr', icon: 'Clock', default: false, size: 'medium' },
  { id: 'hr-top-salesperson', label: 'Top Salesperson Today', description: 'Highest revenue employee today', category: 'hr', icon: 'Trophy', default: false, size: 'medium' },
  { id: 'hr-employee-performance-week', label: 'Employee Performance (Week)', description: 'Weekly sales per employee', category: 'hr', icon: 'BarChart2', default: false, size: 'large' },
  { id: 'hr-attendance-percentage', label: 'Monthly Attendance %', description: 'Team attendance rate', category: 'hr', icon: 'Percent', default: false, size: 'medium' },
  { id: 'hr-sales-per-employee', label: 'Sales per Employee (Avg)', description: 'Average revenue per staff', category: 'hr', icon: 'Users', default: false, size: 'medium' },
  { id: 'hr-shift-coverage', label: 'Shift Coverage Status', description: 'Open vs covered shifts', category: 'hr', icon: 'Calendar', default: false, size: 'medium' },

  // Online Store
  { id: 'online-visitors-today', label: 'Website Visitors Today', description: 'Online store traffic count', category: 'online', icon: 'Users', default: false, size: 'medium' },
  { id: 'online-conversion-rate', label: 'Conversion Rate (Web)', description: 'Visitor to order percentage', category: 'online', icon: 'Percent', default: false, size: 'medium' },
  { id: 'online-cart-abandonment', label: 'Cart Abandonment Rate', description: 'Abandoned checkout percentage', category: 'online', icon: 'ShoppingCart', default: false, size: 'medium' },
  { id: 'online-avg-order-value', label: 'Avg Order Value (Online)', description: 'Average online order size', category: 'online', icon: 'DollarSign', default: false, size: 'medium' },
  { id: 'online-top-pages', label: 'Top Pages Viewed', description: 'Most visited product pages', category: 'online', icon: 'FileText', default: false, size: 'medium' },
  { id: 'online-traffic-sources', label: 'Traffic Sources', description: 'Channel breakdown (organic, paid, etc.)', category: 'online', icon: 'PieChart', default: false, size: 'large' },
  { id: 'online-revenue-today', label: 'Online Revenue Today', description: 'E-commerce sales today', category: 'online', icon: 'DollarSign', default: true, size: 'medium' },
  { id: 'online-pending-shipments', label: 'Pending Shipments', description: 'Orders ready to ship', category: 'online', icon: 'Truck', default: true, size: 'medium' },
  { id: 'online-product-page-views', label: 'Product Page Views (Top 5)', description: 'Most viewed products', category: 'online', icon: 'Eye', default: false, size: 'medium' },
  { id: 'online-social-referrals', label: 'Social Media Referrals', description: 'Traffic from social channels', category: 'online', icon: 'Share2', default: false, size: 'medium' },

  // Device
  { id: 'device-sales-mobile-desktop', label: 'Sales by Device', description: 'Mobile vs Desktop sales', category: 'device', icon: 'Monitor', default: false, size: 'medium' },
  { id: 'device-app-vs-web', label: 'App vs Web Usage', description: 'Platform usage comparison', category: 'device', icon: 'Smartphone', default: false, size: 'medium' },
  { id: 'device-ios-vs-android', label: 'iOS vs Android Users', description: 'Mobile OS breakdown', category: 'device', icon: 'Smartphone', default: false, size: 'medium' },
  { id: 'device-browser-stats', label: 'Browser Usage', description: 'Web browser distribution', category: 'device', icon: 'Globe', default: false, size: 'medium' },

  // System
  { id: 'system-uptime', label: 'System Uptime', description: 'Platform availability percentage', category: 'system', icon: 'Server', default: false, size: 'small' },
  { id: 'system-last-backup', label: 'Last Backup Status', description: 'Most recent backup time/size', category: 'system', icon: 'Database', default: true, size: 'small' },
  { id: 'system-storage-usage', label: 'Storage Usage', description: 'Disk space utilization', category: 'system', icon: 'HardDrive', default: false, size: 'small' },
  { id: 'system-api-health', label: 'API Health Status', description: 'Backend service health', category: 'system', icon: 'Activity', default: false, size: 'small' },
  { id: 'system-db-performance', label: 'Database Performance', description: 'Query response times', category: 'system', icon: 'Database', default: false, size: 'small' },
  { id: 'system-active-sessions', label: 'Active Sessions', description: 'Current logged-in users', category: 'system', icon: 'Users', default: false, size: 'small' },

  // Customer
  { id: 'customer-new-vs-returning', label: 'New vs Returning Customers', description: 'Customer type breakdown', category: 'customer', icon: 'PieChart', default: false, size: 'medium' },
  { id: 'customer-ltv', label: 'Customer Lifetime Value', description: 'Average revenue per customer', category: 'customer', icon: 'Coins', default: false, size: 'medium' },
  { id: 'customer-retention', label: 'Customer Retention Rate', description: 'Repeat purchase percentage', category: 'customer', icon: 'RotateCcw', default: false, size: 'medium' },
  { id: 'customer-satisfaction', label: 'Satisfaction Score', description: 'CSAT/NPS metrics', category: 'customer', icon: 'Heart', default: false, size: 'medium' },
  { id: 'customer-demographics', label: 'Customer Demographics', description: 'Age, gender, location breakdown', category: 'customer', icon: 'Users', default: false, size: 'medium' },
  { id: 'customer-purchase-frequency', label: 'Purchase Frequency', description: 'How often customers buy', category: 'customer', icon: 'Calendar', default: false, size: 'medium' },
  { id: 'customer-segments', label: 'Customer Segments', description: 'RFM or custom segments', category: 'customer', icon: 'UserGroup', default: false, size: 'medium' },
  { id: 'customer-birthdays', label: 'Birthdays This Week', description: 'Customers with upcoming birthdays', category: 'customer', icon: 'Cake', default: false, size: 'small' },

  // Time-Based
  { id: 'time-this-hour-vs-last', label: 'This Hour vs Last Hour', description: 'Hourly sales comparison', category: 'time', icon: 'Clock', default: false, size: 'small' },
  { id: 'time-peak-hour', label: 'Peak Sales Hour', description: 'Best performing hour today', category: 'time', icon: 'Clock', default: false, size: 'small' },
  { id: 'time-best-day-week', label: 'Best Sales Day (Week)', description: 'Top day this week', category: 'time', icon: 'Calendar', default: false, size: 'small' },
  { id: 'time-best-day-month', label: 'Best Sales Day (Month)', description: 'Top day this month', category: 'time', icon: 'Calendar', default: false, size: 'small' },
  { id: 'time-seasonal-trends', label: 'Seasonal Trends', description: 'Year-over-year seasonal chart', category: 'time', icon: 'LineChart', default: false, size: 'large' },
  { id: 'time-holiday-comparison', label: 'Holiday Performance', description: 'Sales during holidays', category: 'time', icon: 'CalendarDays', default: false, size: 'medium' },

  // Promotions
  { id: 'promo-active-count', label: 'Active Promotions', description: 'Currently running promotions', category: 'promo', icon: 'Gift', default: false, size: 'small' },
  { id: 'promo-discount-codes-used', label: 'Discount Codes Used Today', description: 'Coupon redemption count', category: 'promo', icon: 'Tag', default: false, size: 'small' },
  { id: 'promo-revenue-impact', label: 'Promotion Revenue Impact', description: 'Revenue attributable to promos', category: 'promo', icon: 'TrendingUp', default: false, size: 'medium' },
  { id: 'promo-abandoned-cart', label: 'Abandoned Cart Recovery', description: 'Recovered cart revenue', category: 'promo', icon: 'ShoppingCart', default: false, size: 'small' },
  { id: 'promo-email-performance', label: 'Email Campaign Performance', description: 'Open/click/conversion rates', category: 'promo', icon: 'Mail', default: false, size: 'medium' },
  { id: 'promo-sms-performance', label: 'SMS Campaign Performance', description: 'SMS delivery/response rates', category: 'promo', icon: 'MessageSquare', default: false, size: 'medium' },

  // Misc
  { id: 'misc-pending-tasks', label: 'Pending Tasks', description: 'To-do items for owner', category: 'misc', icon: 'CheckSquare', default: false, size: 'medium' },
  { id: 'misc-pending-approvals', label: 'Pending Approvals', description: 'Items requiring owner approval', category: 'misc', icon: 'ClipboardCheck', default: false, size: 'medium' },
  { id: 'misc-customer-reviews', label: 'New Customer Reviews', description: 'Latest product reviews', category: 'misc', icon: 'Star', default: false, size: 'medium' },
  { id: 'misc-product-ratings', label: 'Product Ratings Summary', description: 'Average ratings overview', category: 'misc', icon: 'Star', default: false, size: 'medium' },
  { id: 'misc-supplier-deliveries', label: 'Supplier Deliveries Expected', description: 'Incoming purchase orders', category: 'misc', icon: 'Truck', default: false, size: 'medium' },
  { id: 'misc-notes-reminders', label: 'Notes & Reminders', description: 'Personal notes for owner', category: 'misc', icon: 'StickyNote', default: false, size: 'medium' },
  { id: 'misc-weather', label: 'Weather Widget', description: 'Local weather forecast', category: 'misc', icon: 'Cloud', default: false, size: 'small' },
  { id: 'misc-news-updates', label: 'News & Updates', description: 'Platform announcements', category: 'misc', icon: 'Newspaper', default: false, size: 'medium' },
  { id: 'misc-tips-suggestions', label: 'Tips & Suggestions', description: 'Feature discovery tips', category: 'misc', icon: 'Lightbulb', default: false, size: 'small' },
  { id: 'misc-help-support', label: 'Help / Support', description: 'Quick access to support', category: 'misc', icon: 'HelpCircle', default: true, size: 'small' },
];

export function getComponentsByCategory(category: string): DashboardComponent[] {
  return dashboardComponents.filter(c => c.category === category);
}

export function getComponentById(id: DashboardComponentId): DashboardComponent | undefined {
  return dashboardComponents.find(c => c.id === id);
}

export const defaultEnabledComponents: DashboardComponentId[] = dashboardComponents
  .filter(c => c.default)
  .map(c => c.id);

export function isComponentLockedForStartup(id: DashboardComponentId): boolean {
  const c = getComponentById(id);
  if (!c) return false;
  
  // Entire categories locked
  if (['hr', 'online', 'device', 'customer', 'map'].includes(c.category)) {
    return true;
  }
  
  // Specific IDs locked
  const explicitLocked = [
    'kpi-new-customers',
    'kpi-online-orders-today',
    'kpi-pending-online-orders',
    'kpi-total-employees',
    'kpi-active-employees',
    'kpi-total-customers',
    'chart-sales-by-employee-bar',
    'chart-online-vs-pos-stacked',
    'chart-customer-growth',
    'list-top5-customers',
    'list-top5-employees',
    'alert-pending-online-orders',
    'alert-payment-due',
    'alert-employee-absent',
    'alert-late-checkins',
    'table-recent-customers',
    'table-employee-attendance',
    'calendar-employee-shifts',
    'progress-customer-acquisition',
    'progress-online-traffic',
    'progress-employee-performance',
    'activity-employee-feed',
    'activity-customer-feed',
    'misc-supplier-deliveries',
    'misc-customer-reviews'
  ];
  
  if (explicitLocked.includes(id)) return true;
  
  // Word matching for extra safety
  if (id.includes('employee') || id.includes('customer') || id.includes('supplier') || id.includes('branch') || id.includes('online') || id.includes('app')) {
    return true;
  }
  
  return false;
}

export const STARTUP_DEFAULT_COMPONENTS: DashboardComponentId[] = [
  // 8 KPIs
  'kpi-today-sales',
  'kpi-today-orders',
  'kpi-total-products',
  'kpi-low-stock-count',
  'kpi-out-of-stock',
  'kpi-today-profit',
  'kpi-month-profit',
  'kpi-total-sales-all',
  
  // 1 from other allowed categories
  'chart-sales-7d-line',
  'list-top5-products',
  'alert-low-stock',
  'table-recent-sales',
  'calendar-mini',
  'progress-monthly-sales-goal',
  'activity-recent-feed',
  'quick-actions',
  'comparison-week-vs-last-week',
  'financial-payment-breakdown',
  'inventory-total-value',
  'system-last-backup',
  'time-this-hour-vs-last',
  'promo-active-count',
  'misc-help-support'
];

export function getDefaultEnabledComponents(userPlan?: string): DashboardComponentId[] {
  if (userPlan === 'STARTUP') {
    return STARTUP_DEFAULT_COMPONENTS;
  }
  return defaultEnabledComponents;
}

export type CategoryKey = typeof componentCategories[number]['key'];