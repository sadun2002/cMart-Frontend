// cMart — Shared TypeScript types

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// ─── Tenant ───────────────────────────────────────────────
export interface Tenant {
  id: number;
  businessName: string;
  subdomain: string;
  customDomain?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  active: boolean;
  suspended: boolean;
  logoUrl?: string;
  createdAt: string;
}

// ─── Product ──────────────────────────────────────────────
export interface Product {
  id: number;
  tenantId: number;
  name: string;
  slug?: string;
  description?: string;
  barcode?: string;
  sku?: string;
  price: number;
  cost?: number;
  comparePrice?: number;
  stock: number;
  minStock: number;
  unit: string;
  showOnWebsite: boolean;
  featured: boolean;
  categoryId?: number;
  category?: Category;
  images: ProductImage[];
  tags: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  sortOrder: number;
}

// ─── Category ─────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  children?: Category[];
  active: boolean;
}

// ─── Sale ─────────────────────────────────────────────────
export interface Sale {
  id: number;
  invoiceNo: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'PAYHERE_QR' | 'BANK_TRANSFER' | 'OTHER';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  cashReceived?: number;
  changeGiven?: number;
  customer?: Customer;
  items: SaleItem[];
  notes?: string;
  createdAt: string;
  user: { id: number; name: string };
}

export interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

// ─── Customer ─────────────────────────────────────────────
export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  customerGroup?: 'REGULAR' | 'WHOLESALE' | 'VIP';
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  openingBalance?: number;
  creditLimit?: number;
  paymentTerms?: 'CASH' | '7_DAYS' | '30_DAYS';
  loyaltyEnabled?: boolean;
  active?: boolean;
  notes?: string;
  totalSpent: number;
  totalOrders: number;
  points?: number;
  createdAt: string;
}

// ─── Employee ─────────────────────────────────────────────
export interface Employee {
  id: number;
  userId: number;
  user: { id: number; name: string; email: string; phone?: string };
  employeeCode: string;
  position: 'CASHIER' | 'MANAGER' | 'SUPERVISOR' | 'STAFF';
  salary?: number;
  joinDate: string;
  permissions: EmployeePermissions;
}

export interface EmployeePermissions {
  canProcessSales: boolean;
  canViewProducts: boolean;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canViewCustomers: boolean;
  canAddCustomers: boolean;
  canViewReports: boolean;
  canViewAllSales: boolean;
  canManageInventory: boolean;
  canManageEmployees: boolean;
}

// ─── Online Order ──────────────────────────────────────────
export interface OnlineOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryType: 'PICKUP' | 'DELIVERY';
  shippingAddress?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: string;
  paymentStatus: string;
  items: OnlineOrderItem[];
  createdAt: string;
}

export interface OnlineOrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// ─── Theme ────────────────────────────────────────────────
export interface Theme {
  id: number;
  name: string;
  slug: string;
  description?: string;
  previewUrl?: string;
  price: number;
  type: 'FREE' | 'PREMIUM';
  isActive: boolean;
  tags: string[];
}

export interface TenantTheme {
  themeId: number;
  theme: Theme;
  customizations: ThemeCustomizations;
}

export interface ThemeCustomizations {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  heroImage?: string;
  logoUrl?: string;
  bannerText?: string;
}

// ─── POS Cart ─────────────────────────────────────────────
export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customerId?: number;
  customer?: Customer;
}
