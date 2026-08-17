import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './constants';

// ============================================================
// cMart — Axios API Client
// Handles: auth headers, token refresh, error normalization
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Request Interceptor — attach token ───────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookie (set by auth store)
    if (typeof window !== 'undefined') {
      const token = getCookie('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — handle 401 token refresh ─────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getCookie('refreshToken');
      if (!refreshToken) {
        // No refresh token → logout
        clearAuthCookies();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data || data;

        setCookie('accessToken', accessToken, 15 / (24 * 60)); // 15 min
        setCookie('refreshToken', newRefreshToken, 7);           // 7 days

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthCookies();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Cookie helpers ─────────────────────────────────────────
export function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function clearAuthCookies() {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  deleteCookie('userRole');
  deleteCookie('userType');
}

// ─── API Endpoints (Phase 3) ───────────────────────────────

export const storeOwnerAPI = {
  // Branches
  getBranches: () => api.get('/branches'),
  createBranch: (data: any) => api.post('/branches', data),
  updateBranch: (id: number, data: any) => api.patch(`/branches/${id}`, data),
  deleteBranch: (id: number) => api.delete(`/branches/${id}`),

  // Inventory
  getBranchInventory: (branchId: number) => api.get(`/inventory/branch/${branchId}`),
  stockAdjustment: (branchId: number, data: any) => api.post(`/inventory/branch/${branchId}/adjust`, data),

  // Categories
  getCategories: () => api.get('/categories'),
  getFlatCategories: () => api.get('/categories/flat'),
  createCategory: (data: any) => api.post('/categories', data, 
    data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  ),
  updateCategory: (id: number, data: any) => api.patch(`/categories/${id}`, data, 
    data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  ),
  deleteCategory: (id: number) => api.delete(`/categories/${id}`),

  // Products
  getProducts: () => api.get('/products'),
  createProduct: (data: any) => api.post('/products', data, 
    data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  ),
  updateProduct: (id: number, data: any) => api.patch(`/products/${id}`, data, 
    data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  ),
  deleteProduct: (id: number) => api.delete(`/products/${id}`),

  // Customers
  getCustomers: (search?: string) => api.get(search ? `/customers?search=${search}` : '/customers'),
  createCustomer: (data: any) => api.post('/customers', data),
  updateCustomer: (id: number, data: any) => api.patch(`/customers/${id}`, data),
  deleteCustomer: (id: number) => api.delete(`/customers/${id}`),

  // Sales (POS)
  createSale: (data: any) => api.post('/sales', data),
  getRecentSales: () => api.get('/sales'),

  // Employees
  getEmployees: () => api.get('/employees'),
  createEmployee: (data: any) => api.post('/employees', data),

  // Suppliers
  getSuppliers: (search?: string) => api.get(search ? `/suppliers?search=${search}` : '/suppliers'),
  createSupplier: (data: any) => api.post('/suppliers', data),
  updateSupplier: (id: number, data: any) => api.patch(`/suppliers/${id}`, data),
  deleteSupplier: (id: number) => api.delete(`/suppliers/${id}`),
};

export const employeeAPI = {
  // Attendance
  checkIn: () => api.post('/attendance/checkin'),
  checkOut: () => api.post('/attendance/checkout'),
  getMyAttendance: () => api.get('/attendance/me'),

  // POS / Sales (Reuses endpoints but as an employee)
  getProducts: () => api.get('/products'),
  createSale: (data: any) => api.post('/sales', data),
  getMySales: () => api.get('/sales/me'), 
};

// ─── Super Admin (Company) Endpoints ────────────────────────
export const userAPI = {
  updatePlan: (plan: string) => api.patch('/auth/plan', { plan }),
};

export const superAdminAPI = {
  // Tenants (Stores)
  getTenants: () => api.get('/admin/stores'),
  suspendTenant: (id: number, reason?: string) => api.patch(`/admin/stores/${id}/status`, { suspend: true, reason }),
  activateTenant: (id: number) => api.patch(`/admin/stores/${id}/status`, { suspend: false }),
  approveTenant: (id: number) => api.patch(`/admin/stores/${id}/status`, { suspend: false }),
  rejectTenant: (id: number, reason?: string) => api.patch(`/admin/stores/${id}/status`, { suspend: true, reason }),

  // Themes
  getThemes: () => api.get('/themes/all'),
  uploadTheme: (data: FormData) => api.post('/themes', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Platform Metrics
  getDashboardMetrics: () => api.get('/admin/metrics'),
};

export default api;
