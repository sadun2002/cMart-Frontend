import api from './api';

// ============================================================
// Product API
// ============================================================
export const productApi = {
  list: (params?: { page?: number; limit?: number; search?: string; categoryId?: number; showOnWebsite?: boolean }) =>
    api.get('/products', { params }),
  get: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  uploadImage: (productId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/products/${productId}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ============================================================
// Category API
// ============================================================
export const categoryApi = {
  list: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// ============================================================
// Sales API
// ============================================================
export const salesApi = {
  list: (params?: { page?: number; startDate?: string; endDate?: string; userId?: number }) =>
    api.get('/sales', { params }),
  get: (id: number) => api.get(`/sales/${id}`),
  create: (data: any) => api.post('/sales', data),
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/sales/stats', { params }),
};

// ============================================================
// Customer API
// ============================================================
export const customerApi = {
  list: (params?: { page?: number; search?: string }) => api.get('/customers', { params }),
  get: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: number, data: any) => api.patch(`/customers/${id}`, data),
  search: (query: string) => api.get(`/customers/search`, { params: { q: query } }),
};

// ============================================================
// Employee API
// ============================================================
export const employeeApi = {
  list: () => api.get('/employees'),
  get: (id: number) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: number, data: any) => api.patch(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
};

// ============================================================
// Attendance API
// ============================================================
export const attendanceApi = {
  checkIn: () => api.post('/attendance/checkin'),
  checkOut: () => api.post('/attendance/checkout'),
  myHistory: (params?: { month?: number; year?: number }) =>
    api.get('/attendance/my-history', { params }),
  tenantHistory: (params?: { date?: string; userId?: number }) =>
    api.get('/attendance', { params }),
};

// ============================================================
// Supplier API
// ============================================================
export const supplierApi = {
  list: () => api.get('/suppliers'),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: number, data: any) => api.patch(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

// ============================================================
// Online Orders API
// ============================================================
export const onlineOrderApi = {
  list: (params?: { page?: number; status?: string }) => api.get('/online-orders', { params }),
  get: (id: number) => api.get(`/online-orders/${id}`),
  updateStatus: (id: number, status: string) => api.patch(`/online-orders/${id}/status`, { status }),
};

// ============================================================
// Reports API
// ============================================================
export const reportsApi = {
  sales: (params: { startDate: string; endDate: string; groupBy?: 'day' | 'week' | 'month' }) =>
    api.get('/reports/sales', { params }),
  profitLoss: (params: { startDate: string; endDate: string }) =>
    api.get('/reports/profit-loss', { params }),
  inventory: () => api.get('/reports/inventory'),
  employees: (params: { startDate: string; endDate: string }) =>
    api.get('/reports/employees', { params }),
  products: (params: { startDate: string; endDate: string }) =>
    api.get('/reports/products', { params }),
};

// ============================================================
// Theme API
// ============================================================
export const themeApi = {
  list: () => api.get('/themes'),
  get: (id: number) => api.get(`/themes/${id}`),
  apply: (themeId: number, customizations?: any) =>
    api.post(`/themes/${themeId}/apply`, { customizations }),
  purchase: (themeId: number) => api.post(`/themes/${themeId}/purchase`),
  getMyTheme: () => api.get('/themes/my-theme'),
  updateCustomizations: (data: any) => api.patch('/themes/my-theme/customizations', data),
};

// ============================================================
// Admin API (Super Admin only)
// ============================================================
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  stores: (params?: { page?: number; plan?: string; status?: string }) =>
    api.get('/admin/stores', { params }),
  getStore: (id: number) => api.get(`/admin/stores/${id}`),
  suspendStore: (id: number, reason: string) =>
    api.post(`/admin/stores/${id}/suspend`, { reason }),
  reactivateStore: (id: number) => api.post(`/admin/stores/${id}/reactivate`),
  payments: (params?: { status?: string }) => api.get('/admin/payments', { params }),
  sendEmail: (tenantId: number, subject: string, message: string) =>
    api.post('/admin/emails/send', { tenantId, subject, message }),
  uploadTheme: (data: FormData) =>
    api.post('/admin/themes', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ============================================================
// Settings API
// ============================================================
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: any) => api.patch('/settings', data),
  updateProfile: (data: any) => api.patch('/settings/profile', data),
};
