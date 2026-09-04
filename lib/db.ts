import Database from '@tauri-apps/plugin-sql';

let dbInstance: Database | null = null;

export async function getDb() {
  if (typeof window === 'undefined') {
    throw new Error('Database can only be accessed in the browser/Tauri environment.');
  }

  // Check if Tauri is available. If not, return a mock database or throw a handled error
  // @ts-ignore
  if (!window.__TAURI_INTERNALS__ && !window.__TAURI__) {
    console.warn('Tauri environment not detected. Database operations will be mocked or ignored.');
    return {
      execute: async () => [],
      select: async () => [],
    } as any;
  }
  
  if (!dbInstance) {
    dbInstance = await Database.load('sqlite:cmart.db');
    
    // Initialize tables automatically on first load
    
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenantId INTEGER,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        image TEXT,
        sortOrder INTEGER DEFAULT 0,
        offlineId TEXT UNIQUE,
        parentId INTEGER,
        active INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenantId INTEGER,
        name TEXT NOT NULL,
        slug TEXT,
        description TEXT,
        barcode TEXT,
        sku TEXT,
        offlineId TEXT UNIQUE,
        showOnWebsite INTEGER DEFAULT 0,
        featured INTEGER DEFAULT 0,
        publishedAt TEXT,
        categoryId INTEGER,
        metaTitle TEXT,
        metaDescription TEXT,
        weight REAL,
        length REAL,
        width REAL,
        height REAL,
        unit TEXT DEFAULT 'pieces',
        aliases TEXT,
        imageLabels TEXT,
        images TEXT,
        brand TEXT,
        supplierId INTEGER,
        trackExpiry INTEGER DEFAULT 0,
        expiryDate TEXT,
        trackBatch INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        tenantId INTEGER,
        offlineId TEXT UNIQUE,
        name TEXT NOT NULL,
        sku TEXT,
        barcode TEXT,
        price REAL,
        cost REAL,
        stockQuantity INTEGER DEFAULT 0,
        attributes TEXT,
        active INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS branch_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branchId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        tenantId INTEGER,
        sellingPrice REAL DEFAULT 0,
        wholesalePrice REAL DEFAULT 0,
        costPrice REAL DEFAULT 0,
        minimumStock INTEGER DEFAULT 5,
        maximumStock INTEGER,
        reorderLevel INTEGER,
        reorderQuantity INTEGER,
        isActive INTEGER DEFAULT 1,
        isSellable INTEGER DEFAULT 1,
        shelf TEXT,
        rack TEXT,
        synced INTEGER DEFAULT 0,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE (branchId, productId)
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branchId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        variantId INTEGER,
        tenantId INTEGER,
        quantity INTEGER DEFAULT 0,
        reservedQuantity INTEGER DEFAULT 0,
        availableQuantity INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE (branchId, productId, variantId)
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        variantId INTEGER,
        branchId INTEGER,
        tenantId INTEGER,
        action TEXT NOT NULL,
        description TEXT,
        performedBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS barcode_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenantId INTEGER,
        offlineId TEXT UNIQUE,
        barcode TEXT NOT NULL,
        barcodeType TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        performedBy TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenantId INTEGER,
        branchId INTEGER,
        invoiceNo TEXT,
        offlineId TEXT UNIQUE,
        subtotal REAL NOT NULL,
        tax REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        paymentMethod TEXT NOT NULL,
        paymentStatus TEXT DEFAULT 'COMPLETED',
        cashReceived REAL,
        changeGiven REAL,
        customerId INTEGER,
        userId INTEGER NOT NULL,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        saleId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        productName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        cost REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        subtotal REAL NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenantId INTEGER,
        offlineId TEXT UNIQUE,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenantId INTEGER,
        offlineId TEXT UNIQUE,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        loyaltyPoints INTEGER DEFAULT 0,
        totalSpent REAL DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS store_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }
  
  // Auto-migrate schema for dev environments
  try {
    const columnsToAdd = [
      'cost REAL DEFAULT 0',
      'unit TEXT DEFAULT "pieces"',
      'stockQuantity INTEGER DEFAULT 0',
      'lowStockLevel INTEGER DEFAULT 5',
      'aliases TEXT',
      'imageLabels TEXT',
      'images TEXT',
      'brand TEXT',
      'taxRate REAL DEFAULT 0',
      'wholesalePrice REAL DEFAULT 0',
      'supplierId INTEGER',
      'trackExpiry INTEGER DEFAULT 0',
      'expiryDate TEXT',
      'trackBatch INTEGER DEFAULT 0'
    ];
    
    for (const col of columnsToAdd) {
      try {
        await dbInstance.execute(`ALTER TABLE products ADD COLUMN ${col}`);
      } catch(e) {
        // Column might already exist, ignore
      }
    }
  } catch(e) {}
  
  // Auto-migrate schema for expenses
  try {
    const expenseColumnsToAdd = [
      'name TEXT',
      'type TEXT DEFAULT "One-time"',
      'recurringFrequency TEXT',
      'tax TEXT',
      'dueDate TEXT',
      'paymentStatus TEXT DEFAULT "Paid"',
      'paymentMethod TEXT DEFAULT "Cash"',
      'paidFromAccount TEXT',
      'vendorId TEXT',
      'branchId TEXT',
      'notes TEXT',
      'attachment TEXT'
    ];
    
    for (const col of expenseColumnsToAdd) {
      try {
        await dbInstance.execute(`ALTER TABLE expenses ADD COLUMN ${col}`);
      } catch(e) {
        // Column might already exist, ignore
      }
    }
  } catch(e) {}

  return dbInstance;
}

export async function initDb() {
  await getDb(); // getDb now handles initialization
}

import { encryptData, decryptData } from './local-db';

// Helper functions for settings
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const db = await getDb();
    const result = await db.select('SELECT value FROM store_settings WHERE key = ?', [key]) as {value: string}[];
    if (result && result.length > 0) {
      const decrypted = await decryptData(result[0].value);
      return decrypted !== null ? decrypted : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error('Error getting setting:', error);
    return defaultValue;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    const db = await getDb();
    const encrypted = await encryptData(value);
    await db.execute(
      'INSERT INTO store_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
      [key, encrypted, encrypted]
    );
  } catch (error) {
    console.error('Error setting setting:', error);
  }
}
