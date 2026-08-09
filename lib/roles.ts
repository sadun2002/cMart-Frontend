export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export type PermissionModule = {
  id: string;
  name: string;
  actions: PermissionAction[];
};

export type Role = {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean; // System roles cannot be deleted
  permissions: Record<string, PermissionAction[]>; // Module ID -> Array of granted actions
};

export const MODULES: PermissionModule[] = [
  { id: 'products', name: 'Products', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'categories', name: 'Categories', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'inventory', name: 'Inventory', actions: ['view', 'create', 'edit'] }, // 'create' as adjust stock
  { id: 'sales', name: 'Sales / POS', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'customers', name: 'Customers', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'suppliers', name: 'Suppliers', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'employees', name: 'Employees', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'roles', name: 'Roles & Permissions', actions: ['view', 'edit'] },
  { id: 'reports', name: 'Reports', actions: ['view'] },
  { id: 'settings', name: 'Settings', actions: ['view', 'edit'] },
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'role-1', name: 'System Administrator', description: 'Full access to all system features and settings.', isSystem: true,
    permissions: MODULES.reduce((acc, m) => ({ ...acc, [m.id]: m.actions }), {})
  },
  {
    id: 'role-2', name: 'Store Owner', description: 'Complete business oversight, excluding core system settings.', isSystem: true,
    permissions: MODULES.reduce((acc, m) => ({ ...acc, [m.id]: m.id === 'roles' ? ['view'] : m.actions }), {})
  },
  {
    id: 'role-3', name: 'General Manager', description: 'Manage all operations, inventory, and staff.', isSystem: false,
    permissions: {
      products: ['view', 'create', 'edit'], inventory: ['view', 'create', 'edit'], sales: ['view', 'create', 'edit'],
      customers: ['view', 'create', 'edit'], employees: ['view', 'create', 'edit'], reports: ['view']
    }
  },
  { id: 'role-4', name: 'Assistant Manager', description: 'Assist in daily operations and staff supervision.', isSystem: false, permissions: { products: ['view'], inventory: ['view'], sales: ['view', 'create'], customers: ['view', 'create'], reports: ['view'] } },
  { id: 'role-5', name: 'Store Supervisor', description: 'Oversee store floor and address immediate issues.', isSystem: false, permissions: { products: ['view'], sales: ['view', 'create'], customers: ['view'] } },
  { id: 'role-6', name: 'Shift Supervisor', description: 'Manage a specific shift of cashiers and associates.', isSystem: false, permissions: { sales: ['view', 'create'] } },
  { id: 'role-7', name: 'Head Cashier', description: 'Lead cashier, handles overrides and returns.', isSystem: false, permissions: { sales: ['view', 'create', 'edit'], customers: ['view', 'create'] } },
  { id: 'role-8', name: 'Cashier', description: 'Standard POS operations and sales processing.', isSystem: false, permissions: { sales: ['create'], customers: ['view'] } },
  { id: 'role-9', name: 'Senior Sales Associate', description: 'Experienced sales staff with some customer management access.', isSystem: false, permissions: { products: ['view'], sales: ['create'], customers: ['view', 'create', 'edit'] } },
  { id: 'role-10', name: 'Sales Associate', description: 'Assist customers on the floor.', isSystem: false, permissions: { products: ['view'], sales: ['create'] } },
  { id: 'role-11', name: 'Inventory Manager', description: 'Full control over stock, suppliers, and procurement.', isSystem: false, permissions: { products: ['view', 'create', 'edit', 'delete'], inventory: ['view', 'create', 'edit'], suppliers: ['view', 'create', 'edit', 'delete'] } },
  { id: 'role-12', name: 'Stock Clerk', description: 'Handle receiving and shelf stocking.', isSystem: false, permissions: { products: ['view'], inventory: ['view', 'create'] } },
  { id: 'role-13', name: 'Warehouse Supervisor', description: 'Oversee warehouse operations and bulk stock.', isSystem: false, permissions: { inventory: ['view', 'create', 'edit'] } },
  { id: 'role-14', name: 'Procurement Officer', description: 'Manage supplier relations and purchase orders.', isSystem: false, permissions: { suppliers: ['view', 'create', 'edit'] } },
  { id: 'role-15', name: 'Customer Service Rep', description: 'Handle customer inquiries, profiles, and complaints.', isSystem: false, permissions: { customers: ['view', 'create', 'edit'] } },
  { id: 'role-16', name: 'Accountant', description: 'Manage finances, view high-level sales and reports.', isSystem: false, permissions: { sales: ['view'], reports: ['view'] } },
  { id: 'role-17', name: 'Financial Analyst', description: 'Analyze store performance metrics.', isSystem: false, permissions: { reports: ['view'] } },
  { id: 'role-18', name: 'Marketing Specialist', description: 'Manage promotions and customer engagement.', isSystem: false, permissions: { products: ['view'], customers: ['view', 'edit'] } },
  { id: 'role-19', name: 'IT Support / Technician', description: 'Maintain POS hardware and basic settings.', isSystem: false, permissions: { settings: ['view'] } },
  { id: 'role-20', name: 'Trainee / Intern', description: 'Limited read-only access for training purposes.', isSystem: false, permissions: { products: ['view'] } },
  { id: 'role-21', name: 'Cleaning Staff / Janitor', description: 'Maintain store cleanliness. No system access required.', isSystem: false, permissions: {} },
  { id: 'role-22', name: 'Tea Maker / Pantry Staff', description: 'Handle pantry and refreshments. No system access required.', isSystem: false, permissions: {} },
  { id: 'role-23', name: 'Pharmacist', description: 'Dispense medication and handle prescription sales.', isSystem: false, permissions: { products: ['view'], sales: ['view', 'create', 'edit'], inventory: ['view'] } },
  { id: 'role-24', name: 'Hardware Specialist', description: 'Assist with hardware tools and bulk materials.', isSystem: false, permissions: { products: ['view'], sales: ['create'], inventory: ['view'] } },
  { id: 'role-25', name: 'Fashion Advisor', description: 'Assist customers with clothing, fitting, and apparel sales.', isSystem: false, permissions: { products: ['view'], sales: ['create'], customers: ['view', 'create'] } },
  { id: 'role-26', name: 'Butcher / Meat Section', description: 'Manage meat weighing and pre-packaging.', isSystem: false, permissions: { products: ['view'], inventory: ['view', 'create'] } },
  { id: 'role-27', name: 'Delivery Driver', description: 'Deliver goods to customers and track order status.', isSystem: false, permissions: { sales: ['view'] } },
];
