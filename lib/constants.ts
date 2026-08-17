// ============================================================
// cMart Platform — Frontend Constants
// Change COMPANY_NAME to rebrand the entire UI
// ============================================================

export const COMPANY_NAME = 'cMart';
export const COMPANY_TAGLINE = 'The Smart Way to Run Your Store';
export const COMPANY_EMAIL = 'hello@cmart.lk';
export const COMPANY_SUPPORT_EMAIL = 'support@cmart.lk';
export const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'cmart.lk';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// The current tier of the application for the offline SaaS model
export const CURRENT_TIER: 'FREE' | 'PRO' | 'ENTERPRISE' = (process.env.NEXT_PUBLIC_APP_TIER as any) || 'FREE';

// Plan details
export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    currency: 'LKR',
    maxProducts: 1000,
    maxEmployees: 2,
    maxOrdersPerMonth: 100,
    features: [
      '1,000 products',
      '2 employees',
      '100 orders/month',
      'Basic POS',
      'Basic reports',
      'cMart subdomain',
      'Basic online store',
      'Manual backup',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 3000,
    currency: 'LKR',
    maxProducts: 5000,
    maxEmployees: 10,
    maxOrdersPerMonth: Infinity,
    features: [
      '5,000 products',
      '10 employees',
      'Unlimited orders',
      'Advanced POS',
      'Advanced reports',
      'Pro store themes',
      'Priority support',
      'Daily auto-backup',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 12000,
    currency: 'LKR',
    maxProducts: Infinity,
    maxEmployees: Infinity,
    maxOrdersPerMonth: Infinity,
    features: [
      'Unlimited products',
      'Unlimited employees',
      'Unlimited orders',
      'Custom domain',
      'API access',
      'Dedicated support',
      'Custom store themes',
      'AI reports',
      'Cloud backup',
    ],
  },
} as const;

// Currency formatter
export const formatLKR = (amount: number) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount);

// Date formatter
export const formatDate = (date: string | Date) =>
  new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium' }).format(new Date(date));

export const formatDateTime = (date: string | Date) =>
  new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

// Supported languages
export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
] as const;

// Nav items per role
export const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { 
    href: '/admin/stores', 
    label: 'Stores', 
    icon: 'Store',
    subItems: [
      { href: '/admin/stores', label: 'Store Management' },
      { href: '/admin/stores/pending', label: 'Approvals' }
    ]
  },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: 'CreditCard' },
  { href: '/admin/payments', label: 'Payments', icon: 'DollarSign' },
  { href: '/admin/themes', label: 'Themes', icon: 'Palette' },
  { href: '/admin/revenue', label: 'Revenue', icon: 'TrendingUp' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'BarChart2' },
  { href: '/admin/support', label: 'Support', icon: 'HelpCircle' },
  { href: '/admin/users', label: 'Admin Users', icon: 'Users' },
  { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
] as const;

export const OWNER_NAV = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/owner/pos', label: 'POS', icon: 'ShoppingCart' },
  { href: '/owner/products', label: 'Products', icon: 'Package' },
  { href: '/owner/categories', label: 'Categories', icon: 'Tag' },
  { href: '/owner/inventory', label: 'Inventory', icon: 'Warehouse' },
  { href: '/owner/suppliers', label: 'Suppliers', icon: 'Truck' },
  { href: '/owner/sales', label: 'Sales', icon: 'Receipt' },
  { href: '/owner/online-orders', label: 'Online Orders', icon: 'Globe' },
  { href: '/owner/employees', label: 'Employees', icon: 'Users' },
  { href: '/owner/attendance', label: 'Attendance', icon: 'Clock' },
  { href: '/owner/customers', label: 'Customers', icon: 'UserCheck' },
  { href: '/owner/reports/sales', label: 'Reports', icon: 'BarChart2' },
  { href: '/owner/online-store/dashboard', label: 'Online Store', icon: 'Globe2' },
  { href: '/owner/subscription/plan', label: 'Subscription', icon: 'CreditCard' },
  { href: '/owner/settings/profile', label: 'Settings', icon: 'Settings' },
] as const;

export const EMPLOYEE_NAV = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/employee/pos', label: 'POS', icon: 'ShoppingCart' },
  { href: '/employee/attendance/checkin', label: 'Attendance', icon: 'Clock' },
  { href: '/employee/sales', label: 'My Sales', icon: 'Receipt' },
  { href: '/employee/products', label: 'Products', icon: 'Package' },
  { href: '/employee/customers', label: 'Customers', icon: 'UserCheck' },
  { href: '/employee/reports/my-sales', label: 'My Reports', icon: 'BarChart2' },
  { href: '/employee/settings', label: 'Settings', icon: 'Settings' },
] as const;

export const MOCK_PRODUCTS = [
  { id: 1, name: "Essential White Tee", price: 3500, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80" },
  { id: 2, name: "Classic Denim Jacket", price: 8500, image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80" },
  { id: 3, name: "Minimalist Watch", price: 12000, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" },
  { id: 4, name: "Leather Tote Bag", price: 9500, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80" },
];
