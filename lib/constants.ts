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
export const CURRENT_TIER: 'STARTUP' | 'PRO' | 'ENTERPRISE' = (process.env.NEXT_PUBLIC_APP_TIER as any) || 'STARTUP';

// Plan details
export const PLANS = {
  STARTUP: {
    name: 'Startup',
    priceMonthly: 990,
    priceYearly: 9900,
    priceLifetime: 24900,
    currency: 'LKR',
    features: [
      'Local POS',
      'Increased product limit',
      'Single cashier/user',
      'Inventory management',
      'Purchase management',
      'Sales & stock reports',
      'Data export/import',
      'Basic backup/restore',
      'Offline working',
    ],
  },
  PRO: {
    name: 'Pro',
    priceMonthly: 2490,
    priceYearly: 24900,
    priceLifetime: null,
    currency: 'LKR',
    features: [
      'All Startup features',
      'Cloud database',
      'Multiple cashiers/users',
      'Supplier management',
      'Customer management',
      'Employee & attendance mgmt',
      'Automatic cloud backup',
      'Multi-device sync',
      'Advanced inventory & reports',
      'Online Store with subdomain',
      'Products sync to online store',
      'Online & COD orders',
      'Store customization & SEO',
      'Data recovery',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceMonthly: 5990,
    priceYearly: 59900,
    priceLifetime: null,
    currency: 'LKR',
    features: [
      'All Pro features',
      'Unlimited products',
      'Multiple branches',
      'Branch-wise inventory & sales',
      'Centralized inventory',
      'Roles & permissions',
      'Custom domain',
      'Multiple online stores',
      'API access & Custom integrations',
      'Advanced security & 2FA',
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
  { href: '/admin/releases', label: 'App Releases', icon: 'DownloadCloud' },
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
export const EXTENDED_PRODUCTS = [
  {
    id: 1,
    name: "Essential White Tee",
    price: 3500,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    ],
    category: "Clothing",
    description: "The perfect everyday essential. Crafted from 100% organic cotton for a soft, breathable feel and maximum durability that lasts through countless washes.",
    stock: 12,
  },
  {
    id: 2,
    name: "Classic Denim Jacket",
    price: 8500,
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
      "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80",
      "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80",
    ],
    category: "Clothing",
    description: "A timeless staple piece that gets better with age. Features durable hardware, reinforced stitching, and a comfortable slightly relaxed fit.",
    stock: 5,
  },
  {
    id: 3,
    name: "Minimalist Watch",
    price: 12000,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      "https://images.unsplash.com/photo-1508656936551-c9af71ea21fb?w=800&q=80",
    ],
    category: "Accessories",
    description: "Sleek, modern, and reliable. Featuring a scratch-resistant sapphire crystal and a genuine leather strap that ages beautifully.",
    stock: 0, // Out of stock example
  },
  {
    id: 4,
    name: "Leather Tote Bag",
    price: 9500,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80",
    ],
    category: "Accessories",
    description: "Spacious enough for your laptop and daily essentials. Handcrafted from premium full-grain leather with sturdy brass fittings.",
    stock: 8,
  },
];

export const MOCK_CATEGORIES = [
  { id: 1, name: "Clothing", count: 124, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
  { id: 2, name: "Accessories", count: 86, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
  { id: 3, name: "Footwear", count: 52, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
  { id: 4, name: "Electronics", count: 43, image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80" },
  { id: 5, name: "Home Decor", count: 91, image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80" },
];
