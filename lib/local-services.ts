import { getDb } from './db';
import { useAuthStore } from './auth-store';

function getPerformedByStr() {
  const user = useAuthStore.getState().user;
  if (!user) return 'System';
  return `${user.name || 'System'}|${user.role || ''}`;
}

function generateOfflineId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function saveCategoryLocally(data: any, tenantId: number | null) {
  const db = await getDb();
  const offlineId = generateOfflineId();
  
  // Try to use provided image or null
  const image = data.image || null;
  const parentId = data.parentId !== 'null' ? data.parentId : null;

  const result = await db.execute(
    `INSERT INTO categories (tenantId, name, slug, description, image, parentId, offlineId, synced, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [
      tenantId,
      data.name,
      data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      data.description || null,
      image,
      parentId,
      offlineId
    ]
  );
  return { id: result.lastInsertId, offlineId };
}

export async function deleteCategoryLocally(id: number, tenantId: number | null) {
  const db = await getDb();
  await db.execute(
    `DELETE FROM categories WHERE id = ? AND tenantId = ?`,
    [id, tenantId]
  );
}

export async function saveProductLocally(data: any, tenantId: number | null, branchId: number | null = 1) {
  const db = await getDb();
  const offlineId = generateOfflineId();
  
  const categoryId = data.categoryId !== 'null' ? data.categoryId : null;

  const result = await db.execute(
      `INSERT INTO products (
      tenantId, name, slug, barcode, sku, unit, 
      showOnWebsite, categoryId, aliases, imageLabels, images, offlineId, synced, createdAt,
      brand, supplierId, trackExpiry, expiryDate, trackBatch, isBarcodePrinted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)`,
    [
      tenantId,
      data.name,
      data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      data.barcode || null,
      data.sku || null,
      data.unit || '',
      data.showOnWebsite ? 1 : 0,
      categoryId,
      data.aliases || null,
      data.imageLabels || null,
      data.images || null, // expects a stringified JSON array
      offlineId,
      data.brand || null,
      data.supplierId !== 'null' && data.supplierId ? parseInt(data.supplierId, 10) : null,
      data.trackExpiry ? 1 : 0,
      data.expiryDate || null,
      data.trackBatch ? 1 : 0,
      data.isBarcodePrinted ? 1 : 0
    ]
  );
  const productId = result.lastInsertId;

  // Insert BranchProduct config
  const sellingPrice = parseFloat(data.price || '0');
  const wholesalePrice = parseFloat(data.wholesalePrice || '0');
  const costPrice = parseFloat(data.cost || '0');
  const lowStockLevel = parseInt(data.lowStockLevel || '5', 10);
  
  await db.execute(
    `INSERT INTO branch_products (branchId, productId, tenantId, sellingPrice, wholesalePrice, costPrice, minimumStock, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [branchId, productId, tenantId, sellingPrice, wholesalePrice, costPrice, lowStockLevel]
  );

  // Insert base product inventory
  const stockQuantity = parseInt(data.stockQuantity || '0', 10);
  await db.execute(
    `INSERT INTO inventory (branchId, productId, tenantId, quantity, synced) VALUES (?, ?, ?, ?, 0)`,
    [branchId, productId, tenantId, stockQuantity]
  );

  // Log base product creation if stock > 0
  if (stockQuantity > 0) {
    await db.execute(
      `INSERT INTO inventory_logs (productId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [productId, branchId, tenantId, 'STOCK_ADD', `Initial stock: ${stockQuantity}`, getPerformedByStr()]
    );
  }

  if (data.hasVariants && data.variants && data.variants.length > 0) {
    for (const v of data.variants) {
      const vOfflineId = generateOfflineId();
      const variantResult = await db.execute(
        `INSERT INTO product_variants (productId, tenantId, offlineId, name, sku, barcode, price, cost, attributes, synced, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
        [
          productId,
          tenantId,
          vOfflineId,
          v.name,
          v.sku || null,
          v.barcode || null,
          v.price ? parseFloat(v.price) : null,
          v.cost ? parseFloat(v.cost) : null,
          v.attributes ? JSON.stringify(v.attributes) : null
        ]
      );
      
      const variantId = variantResult.lastInsertId;
      const vStock = parseInt(v.stockQuantity || '0', 10);
      const vLowStock = parseInt(v.lowStockLevel || '5', 10);
      
      await db.execute(
        `INSERT INTO inventory (productId, variantId, branchId, tenantId, quantity, synced) VALUES (?, ?, ?, ?, ?, 0)`,
        [productId, variantId, branchId, tenantId, vStock]
      );
      
      if (vStock > 0) {
        await db.execute(
          `INSERT INTO inventory_logs (productId, variantId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
          [productId, variantId, branchId, tenantId, 'STOCK_ADD', `Initial variant stock: ${vStock}`, getPerformedByStr()]
        );
      }
    }
  }

  return { id: productId, offlineId };
}

export async function markProductSynced(id: number | string) {
  const db = await getDb();
  await db.execute(`UPDATE products SET synced = 1 WHERE id = ? OR offlineId = ?`, [id, id]);
}

export async function markBarcodePrintedLocally(id: number | string) {
  const db = await getDb();
  await db.execute(`UPDATE products SET isBarcodePrinted = 1, synced = 0 WHERE id = ? OR offlineId = ?`, [id, id]);
}

export async function markCategorySynced(id: number | string) {
  const db = await getDb();
  await db.execute(`UPDATE categories SET synced = 1 WHERE id = ? OR offlineId = ?`, [id, id]);
}

export async function getLocalCategories(tenantId: number | null) {
  const db = await getDb();
  const categories = await db.select('SELECT * FROM categories WHERE tenantId = ? OR tenantId IS NULL ORDER BY sortOrder ASC, createdAt DESC', [tenantId]) as any[];
  
  // Transform to tree structure
  const categoryMap = new Map();
  categories.forEach(c => {
    categoryMap.set(c.id, { ...c, children: [] });
  });

  const rootCategories: any[] = [];
  categories.forEach(c => {
    if (c.parentId) {
      const parent = categoryMap.get(c.parentId);
      if (parent) {
        parent.children.push(categoryMap.get(c.id));
      } else {
        rootCategories.push(categoryMap.get(c.id));
      }
    } else {
      rootCategories.push(categoryMap.get(c.id));
    }
  });

  return rootCategories;
}

export async function getLocalProducts(tenantId: number | null, branchId: number | null = 1) {
  const db = await getDb();
  const products = await db.select(
    `SELECT p.*, 
            bp.sellingPrice as price, bp.costPrice as cost, bp.wholesalePrice as wholesalePrice, bp.minimumStock as lowStockLevel,
            i.quantity as stockQuantity
     FROM products p 
     LEFT JOIN branch_products bp ON p.id = bp.productId AND bp.branchId = ?
     LEFT JOIN inventory i ON p.id = i.productId AND i.variantId IS NULL AND i.branchId = ?
     WHERE p.tenantId = ? OR p.tenantId IS NULL 
     ORDER BY p.createdAt DESC`, 
    [branchId, branchId, tenantId]
  ) as any[];
  
  const variants = await db.select(
    `SELECT pv.*,
            i.quantity as stockQuantity
     FROM product_variants pv
     LEFT JOIN inventory i ON pv.id = i.variantId AND i.branchId = ?
     WHERE pv.tenantId = ? OR pv.tenantId IS NULL`, 
    [branchId, tenantId]
  ) as any[];
  
  const variantsByProduct = new Map();
  variants.forEach(v => {
    if (!variantsByProduct.has(v.productId)) {
      variantsByProduct.set(v.productId, []);
    }
    const parsedVariant = {
      ...v,
      attributes: v.attributes ? JSON.parse(v.attributes) : null
    };
    variantsByProduct.get(v.productId).push(parsedVariant);
  });
  
  // Parse JSON fields
  return products.map(p => ({
    ...p,
    showOnWebsite: p.showOnWebsite === 1,
    active: p.active === 1,
    images: p.images ? JSON.parse(p.images) : [],
    imageLabels: p.imageLabels ? JSON.parse(p.imageLabels) : [],
    variants: variantsByProduct.get(p.id) || [],
    isBarcodePrinted: p.isBarcodePrinted === 1
  }));
}

export async function updateProductLocally(id: number | string, data: any, tenantId: number | null, branchId: number | null = 1) {
  const db = await getDb();
  const categoryId = data.categoryId !== 'null' ? data.categoryId : null;

  await db.execute(
    `UPDATE products SET 
      name = ?, slug = ?, barcode = ?, sku = ?, unit = ?, 
      showOnWebsite = ?, categoryId = ?, aliases = ?, imageLabels = ?, images = ?, 
      brand = ?, supplierId = ?, trackExpiry = ?, expiryDate = ?, trackBatch = ?, isBarcodePrinted = ?, synced = 0
     WHERE (id = ? OR offlineId = ?) AND (tenantId = ? OR tenantId IS NULL)`,
    [
      data.name,
      data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      data.barcode || null,
      data.sku || null,
      data.unit || '',
      data.showOnWebsite ? 1 : 0,
      categoryId,
      data.aliases || null,
      data.imageLabels || null,
      data.images || null,
      data.brand || null,
      data.supplierId !== 'null' && data.supplierId ? parseInt(data.supplierId, 10) : null,
      data.trackExpiry ? 1 : 0,
      data.expiryDate || null,
      data.trackBatch ? 1 : 0,
      data.isBarcodePrinted ? 1 : 0,
      id, id, tenantId
    ]
  );
  
  // Try to find the exact local productId if an offlineId was provided
  let localProductId = id;
  if (typeof id === 'string') {
    const p = await db.select('SELECT id FROM products WHERE offlineId = ?', [id]) as any[];
    if (p.length > 0) localProductId = p[0].id;
  }
  
  // Upsert branch product details
  const sellingPrice = parseFloat(data.price || '0');
  const wholesalePrice = parseFloat(data.wholesalePrice || '0');
  const costPrice = parseFloat(data.cost || '0');
  const lowStockLevel = parseInt(data.lowStockLevel || '5', 10);
  
  const existingBp = await db.select('SELECT id FROM branch_products WHERE branchId = ? AND productId = ?', [branchId, localProductId]) as any[];
  if (existingBp.length > 0) {
    await db.execute(
      `UPDATE branch_products SET sellingPrice = ?, wholesalePrice = ?, costPrice = ?, minimumStock = ?, synced = 0 WHERE branchId = ? AND productId = ?`,
      [sellingPrice, wholesalePrice, costPrice, lowStockLevel, branchId, localProductId]
    );
  } else {
    await db.execute(
      `INSERT INTO branch_products (branchId, productId, tenantId, sellingPrice, wholesalePrice, costPrice, minimumStock, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [branchId, localProductId, tenantId, sellingPrice, wholesalePrice, costPrice, lowStockLevel]
    );
  }

  // Stock updates are generally handled via Inventory Logs (Adjustments), but if the form sends stock explicitly:
  if (data.stockQuantity !== undefined) {
    const newStock = parseInt(data.stockQuantity || '0', 10);
    const existingInv = await db.select('SELECT id, quantity FROM inventory WHERE branchId = ? AND productId = ? AND variantId IS NULL', [branchId, localProductId]) as any[];
    
    if (existingInv.length > 0) {
      if (existingInv[0].quantity !== newStock) {
        await db.execute(
          `UPDATE inventory SET quantity = ?, synced = 0 WHERE branchId = ? AND productId = ? AND variantId IS NULL`,
          [newStock, branchId, localProductId]
        );
        // We should log this manual edit
        await db.execute(
          `INSERT INTO inventory_logs (productId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, 0)`,
          [localProductId, branchId, tenantId, 'STOCK_EDIT', `Manual edit: ${existingInv[0].quantity} -> ${newStock}`, getPerformedByStr()]
        );
      }
    } else {
      await db.execute(
        `INSERT INTO inventory (branchId, productId, tenantId, quantity, synced) VALUES (?, ?, ?, ?, 0)`,
        [branchId, localProductId, tenantId, newStock]
      );
      await db.execute(
        `INSERT INTO inventory_logs (productId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [localProductId, branchId, tenantId, 'STOCK_ADD', `Initial stock set via update: ${newStock}`, getPerformedByStr()]
      );
    }
  }
  
  // Resolve actual product id
  const productRes = await db.select('SELECT id FROM products WHERE id = ? OR offlineId = ?', [id, id]) as any[];
  const actualProductId = productRes[0]?.id;

  if (actualProductId) {
    const stockQuantity = parseInt(data.stockQuantity || '0', 10);
    const lowStockLevel = parseInt(data.lowStockLevel || '5', 10);
    
    // Update branch_products for lowStockLevel
    await db.execute(
      `UPDATE branch_products SET minimumStock = ?, synced = 0 WHERE productId = ? AND branchId = ?`,
      [lowStockLevel, actualProductId, branchId]
    );

    const existingInv = await db.select('SELECT * FROM inventory WHERE productId = ? AND variantId IS NULL AND branchId = ?', [actualProductId, branchId]) as any[];
    if (existingInv.length > 0) {
      const diff = stockQuantity - existingInv[0].quantity;
      await db.execute(
        `UPDATE inventory SET quantity = ?, synced = 0, updatedAt = CURRENT_TIMESTAMP WHERE productId = ? AND variantId IS NULL AND branchId = ?`,
        [stockQuantity, actualProductId, branchId]
      );
      if (diff !== 0) {
        await db.execute(
          `INSERT INTO inventory_logs (productId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, 0)`,
          [actualProductId, branchId, tenantId, diff > 0 ? 'STOCK_ADD' : 'STOCK_REDUCE', `Stock adjusted by ${diff}`, getPerformedByStr()]
        );
      }
    } else {
      await db.execute(
        `INSERT INTO inventory (productId, branchId, tenantId, quantity, synced) VALUES (?, ?, ?, ?, 0)`,
        [actualProductId, branchId, tenantId, stockQuantity]
      );
      if (stockQuantity > 0) {
        await db.execute(
          `INSERT INTO inventory_logs (productId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, 0)`,
          [actualProductId, branchId, tenantId, 'STOCK_ADD', `Initial stock: ${stockQuantity}`, getPerformedByStr()]
        );
      }
    }
  
  // For variants
  if (data.hasVariants && data.variants) {
    const existingVariants = await db.select(`SELECT * FROM product_variants WHERE productId = ?`, [actualProductId]) as any[];
    const keptVariantIds = [];

    for (const v of data.variants) {
      const match = existingVariants.find((ev: any) => ev.name === v.name);
      if (match) {
        keptVariantIds.push(match.id);
        await db.execute(
          `UPDATE product_variants SET sku = ?, barcode = ?, price = ?, cost = ?, attributes = ?, synced = 0 WHERE id = ?`,
          [v.sku || null, v.barcode || null, v.price ? parseFloat(v.price) : null, v.cost ? parseFloat(v.cost) : null, v.attributes ? JSON.stringify(v.attributes) : null, match.id]
        );
        const vStock = parseInt(v.stockQuantity || '0', 10);
        
        const invMatch = await db.select('SELECT * FROM inventory WHERE variantId = ? AND branchId = ?', [match.id, branchId]) as any[];
        
        if (invMatch.length > 0) {
          const diff = vStock - invMatch[0].quantity;
          await db.execute(`UPDATE inventory SET quantity = ?, synced = 0, updatedAt = CURRENT_TIMESTAMP WHERE variantId = ? AND branchId = ?`, [vStock, match.id, branchId]);
          if (diff !== 0) {
            await db.execute(`INSERT INTO inventory_logs (productId, variantId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`, [actualProductId, match.id, branchId, tenantId, diff > 0 ? 'STOCK_ADD' : 'STOCK_REDUCE', `Stock adjusted by ${diff}`, getPerformedByStr()]);
          }
        } else {
          await db.execute(`INSERT INTO inventory (productId, variantId, branchId, tenantId, quantity, synced) VALUES (?, ?, ?, ?, ?, 0)`, [actualProductId, match.id, branchId, tenantId, vStock]);
          if (vStock > 0) {
            await db.execute(`INSERT INTO inventory_logs (productId, variantId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`, [actualProductId, match.id, branchId, tenantId, 'STOCK_ADD', `Initial variant stock: ${vStock}`, getPerformedByStr()]);
          }
        }
      } else {
        const vOfflineId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const varRes = await db.execute(
          `INSERT INTO product_variants (productId, tenantId, offlineId, name, sku, barcode, price, cost, attributes, synced, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [actualProductId, tenantId, vOfflineId, v.name, v.sku || null, v.barcode || null, v.price ? parseFloat(v.price) : null, v.cost ? parseFloat(v.cost) : null, v.attributes ? JSON.stringify(v.attributes) : null]
        );
        const newVarId = varRes.lastInsertId;
        keptVariantIds.push(newVarId);
        const vStock = parseInt(v.stockQuantity || '0', 10);
        
        await db.execute(`INSERT INTO inventory (productId, variantId, branchId, tenantId, quantity, synced) VALUES (?, ?, ?, ?, ?, 0)`, [actualProductId, newVarId, branchId, tenantId, vStock]);
        if (vStock > 0) {
          await db.execute(`INSERT INTO inventory_logs (productId, variantId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`, [actualProductId, newVarId, branchId, tenantId, 'STOCK_ADD', `Initial variant stock: ${vStock}`, getPerformedByStr()]);
        }
      }
    }

    if (keptVariantIds.length > 0) {
      const placeholders = keptVariantIds.map(() => '?').join(',');
      await db.execute(`DELETE FROM product_variants WHERE productId = ? AND id NOT IN (${placeholders})`, [actualProductId, ...keptVariantIds]);
      await db.execute(`DELETE FROM inventory WHERE productId = ? AND variantId NOT IN (${placeholders}) AND variantId IS NOT NULL`, [actualProductId, ...keptVariantIds]);
    } else {
      await db.execute(`DELETE FROM product_variants WHERE productId = ?`, [actualProductId]);
      await db.execute(`DELETE FROM inventory WHERE productId = ? AND variantId IS NOT NULL`, [actualProductId]);
    }
  } else {
    await db.execute(`DELETE FROM product_variants WHERE productId = ?`, [actualProductId]);
    await db.execute(`DELETE FROM inventory WHERE productId = ? AND variantId IS NOT NULL`, [actualProductId]);
  }
  }
}

export async function getProductLogs(productId: number, branchId: number | null = 1) {
  const db = await getDb();
  const logs = await db.select(
    `SELECT * FROM inventory_logs WHERE productId = ? AND branchId = ? ORDER BY createdAt DESC`,
    [productId, branchId]
  ) as any[];
  return logs;
}

export async function updateStockLocally(
  productId: number | string,
  newStock: number,
  action: string,
  description: string,
  tenantId: number | null,
  branchId: number | null = 1
) {
  const db = await getDb();
  const numericProdId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
  if (isNaN(numericProdId)) return;

  // Check if product exists in products table to prevent foreign key constraint failure
  const productExists = await db.select(
    'SELECT id FROM products WHERE id = ?',
    [numericProdId]
  ) as any[];
  if (!productExists || productExists.length === 0) {
    console.warn(`Product ID ${numericProdId} not found in products table, skipping inventory update`);
    return;
  }

  const existing = await db.select(
    'SELECT id FROM inventory WHERE productId = ? AND branchId = ? AND variantId IS NULL',
    [numericProdId, branchId]
  ) as any[];

  if (existing && existing.length > 0) {
    await db.execute(
      'UPDATE inventory SET quantity = ?, synced = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [newStock, existing[0].id]
    );
  } else {
    await db.execute(
      'INSERT INTO inventory (productId, branchId, tenantId, quantity, synced) VALUES (?, ?, ?, ?, 0)',
      [numericProdId, branchId, tenantId, newStock]
    );
  }

  await db.execute(
    'INSERT INTO inventory_logs (productId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, 0)',
    [numericProdId, branchId, tenantId, action, description, getPerformedByStr()]
  );
}

export async function deleteProductLocally(id: number | string, tenantId: number | null) {
  const db = await getDb();
  await db.execute(`DELETE FROM product_variants WHERE productId = ?`, [id]);
  await db.execute(`DELETE FROM products WHERE (id = ? OR offlineId = ?) AND (tenantId = ? OR tenantId IS NULL)`, [id, id, tenantId]);
}

export async function saveBrandLocally(data: any, tenantId: number | null) {
  const db = await getDb();
  const offlineId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  const image = data.image || null;

  const result = await db.execute(
    `INSERT INTO brands (tenantId, name, description, image, offlineId, synced, createdAt)
     VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [
      tenantId,
      data.name,
      data.description || null,
      image,
      offlineId
    ]
  );
  return { id: result.lastInsertId, offlineId };
}

export async function markBrandSynced(id: number | string) {
  const db = await getDb();
  await db.execute(`UPDATE brands SET synced = 1 WHERE id = ? OR offlineId = ?`, [id, id]);
}

export async function updateBrandLocally(id: number, data: any, tenantId: number | null) {
  const db = await getDb();
  await db.execute(
    `UPDATE brands SET name = ?, description = ?, image = ?, synced = 0 WHERE id = ? AND (tenantId = ? OR tenantId IS NULL)`,
    [data.name, data.description || null, data.image || null, id, tenantId]
  );
}

export async function deleteBrandLocally(id: number, tenantId: number | null) {
  const db = await getDb();
  await db.execute(`DELETE FROM brands WHERE id = ? AND (tenantId = ? OR tenantId IS NULL)`, [id, tenantId]);
}

export async function getLocalBrands(tenantId: number | null) {
  const db = await getDb();
  try {
    const brands = await db.select('SELECT * FROM brands WHERE tenantId = ? OR tenantId IS NULL ORDER BY createdAt DESC', [tenantId]) as any[];
    return brands;
  } catch (e) {
    console.error('Failed to get local brands, creating table if not exists...', e);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenantId INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        offlineId TEXT,
        synced INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    return [];
  }
}

// -------------------------------------------------------------
// POS Specific Local Operations
// -------------------------------------------------------------

export async function saveCustomerLocally(data: any, tenantId: number | null) {
  const db = await getDb();
  const offlineId = `local_cust_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const result = await db.execute(
    `INSERT INTO customers (tenantId, name, phone, email, offlineId, synced) VALUES (?, ?, ?, ?, ?, 0)`,
    [tenantId, data.name, data.phone || null, data.email || null, offlineId]
  );
  return { id: result.lastInsertId, offlineId, ...data };
}

export async function getLocalCustomers(tenantId: number | null, search: string = '') {
  const db = await getDb();
  let query = 'SELECT * FROM customers WHERE (tenantId = ? OR tenantId IS NULL)';
  const params: any[] = [tenantId];

  if (search) {
    query += ' AND (name LIKE ? OR phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  query += ' ORDER BY name ASC';
  return (await db.select(query, params)) as any[];
}

export async function createSaleLocally(data: any, tenantId: number | null, branchId: number | null = 1, userId: number) {
  const db = await getDb();
  const offlineId = `local_sale_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const invoiceNo = `INV-${Date.now()}`;
  
  // 1. Insert into sales table
  const saleResult = await db.execute(
    `INSERT INTO sales (tenantId, branchId, invoiceNo, offlineId, subtotal, tax, discount, total, paymentMethod, paymentStatus, customerId, userId, cashReceived, changeGiven, createdAt, synced) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      tenantId, 
      branchId, 
      invoiceNo, 
      offlineId, 
      data.subtotal || data.amountLKR || 0,
      data.tax || 0, 
      data.discount || 0,
      data.amountLKR || 0,
      data.paymentMethod,
      'COMPLETED',
      data.customerId || null,
      userId,
      data.tenderedAmount || null,
      data.changeAmount || null,
      new Date().toISOString()
    ]
  );
  const saleId = saleResult.lastInsertId;

  // 2. Insert sale items and update inventory
  for (const item of data.items) {
    const itemSubtotal = item.price * item.quantity;
    
    // Insert sale_items
    await db.execute(
      `INSERT INTO sale_items (saleId, productId, productName, quantity, price, subtotal, synced) 
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [saleId, item.productId, item.productName, item.quantity, item.price, itemSubtotal]
    );

    // Decrement inventory
    await db.execute(
      `UPDATE inventory SET quantity = quantity - ?, synced = 0 WHERE branchId = ? AND productId = ? AND variantId IS NULL`,
      [item.quantity, branchId, item.productId]
    );

    // Log inventory change
    await db.execute(
      `INSERT INTO inventory_logs (productId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [item.productId, branchId, tenantId, 'STOCK_REMOVE', `Sale completed (${invoiceNo}): Sold ${item.quantity}`, 'POS System']
    );
  }

  return { id: saleId, offlineId, invoiceNo };
}

export async function getLocalSales(tenantId: number | null, limit: number = 200) {
  const db = await getDb();
  try {
    // Fetch sales with optional customer join
    const sales = await db.select(
      `SELECT s.*, c.name as customerName, c.phone as customerPhone, c.email as customerEmail
       FROM sales s
       LEFT JOIN customers c ON s.customerId = c.id
       WHERE (s.tenantId = ? OR s.tenantId IS NULL)
       ORDER BY s.id DESC
       LIMIT ?`,
      [tenantId, limit]
    ) as any[];

    if (sales.length === 0) return [];

    // Fetch all sale items for these sales in one query
    const saleIds = sales.map(s => s.id);
    const items = await db.select(
      `SELECT * FROM sale_items WHERE saleId IN (${saleIds.map(() => '?').join(',')})`,
      saleIds
    ) as any[];

    // Group items by saleId
    const itemsBySaleId = new Map<number, any[]>();
    items.forEach(item => {
      if (!itemsBySaleId.has(item.saleId)) itemsBySaleId.set(item.saleId, []);
      itemsBySaleId.get(item.saleId)!.push({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        refundedQuantity: item.refundedQuantity || 0,
        price: item.price,
        subtotal: item.subtotal,
      });
    });

    // Shape data to match the remote API format
      const currentUser = useAuthStore.getState().user;
      return sales.map(s => ({
      id: s.id,
      invoiceNo: s.invoiceNo,
      offlineId: s.offlineId,
      subtotal: s.subtotal,
      tax: s.tax ?? 0,
      discount: s.discount ?? 0,
      total: s.total,
      refundAmount: s.refundAmount || 0,
      paymentMethod: s.paymentMethod,
      paymentStatus: s.paymentStatus || 'COMPLETED',
      cashReceived: s.cashReceived,
      changeGiven: s.changeGiven,
      notes: s.notes,
      createdAt: s.createdAt,
      channel: 'POS',
      customer: s.customerId ? {
        id: s.customerId,
        name: s.customerName,
        phone: s.customerPhone,
        email: s.customerEmail,
      } : null,
      user: { id: s.userId, name: s.userId === currentUser?.id ? (currentUser?.name || currentUser?.email) : 'Cashier' },
      items: itemsBySaleId.get(s.id) || [],
    }));
  } catch (e) {
    console.error('Failed to get local sales', e);
    return [];
  }
}

export async function getRecentSoldProductIds(tenantId: number | null, limit: number = 30) {
  const db = await getDb();
  try {
    const rows = await db.select(
      `SELECT DISTINCT si.productId 
       FROM sale_items si
       JOIN sales s ON si.saleId = s.id
       WHERE (s.tenantId = ? OR s.tenantId IS NULL)
       ORDER BY s.id DESC
       LIMIT ?`,
      [tenantId, limit]
    ) as any[];
    return rows.map(r => r.productId);
  } catch (e) {
    console.error('Failed to get recent sold products', e);
    return [];
  }
}

export async function processRefundLocally(saleId: number, refundItems: { id: number, productId: number, refundQty: number }[], totalRefundAmount: number, branchId: number | null = 1, tenantId: number | null) {
  const db = await getDb();
  
  // 1. Update sale items
  for (const item of refundItems) {
    if (item.refundQty > 0) {
      await db.execute(
        `UPDATE sale_items SET refundedQuantity = refundedQuantity + ?, synced = 0 WHERE id = ?`,
        [item.refundQty, item.id]
      );
      
      // 2. Restore inventory
      await db.execute(
        `UPDATE inventory SET quantity = quantity + ?, synced = 0 WHERE branchId = ? AND productId = ? AND variantId IS NULL`,
        [item.refundQty, branchId, item.productId]
      );
      
      // 3. Log inventory change
      await db.execute(
        `INSERT INTO inventory_logs (productId, branchId, tenantId, action, description, performedBy, synced) VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [item.productId, branchId, tenantId, 'STOCK_ADD', `Refund processed for sale #${saleId}: Returned ${item.refundQty}`, 'POS System']
      );
    }
  }

  // 4. Check if full or partial refund
  const allItems = await db.select(`SELECT quantity, refundedQuantity FROM sale_items WHERE saleId = ?`, [saleId]) as any[];
  const isFullRefund = allItems.every(i => i.quantity === i.refundedQuantity);
  const paymentStatus = isFullRefund ? 'REFUNDED' : 'PARTIAL_REFUND';

  // 5. Update sale record
  await db.execute(
    `UPDATE sales SET paymentStatus = ?, refundAmount = refundAmount + ?, synced = 0 WHERE id = ?`,
    [paymentStatus, totalRefundAmount, saleId]
  );
  
  return true;
}

export async function getBarcodeHistory(tenantId: number | null) {
  const db = await getDb();
  try {
    const rows = await db.select(
      `SELECT * FROM barcode_history 
       WHERE tenantId = ? OR tenantId IS NULL
       ORDER BY id DESC LIMIT 50`,
      [tenantId]
    ) as any[];
    return rows;
  } catch (e) {
    console.error('Failed to get barcode history', e);
    return [];
  }
}

export async function saveBarcodeHistory(tenantId: number | null, data: { barcode: string, barcodeType: string, quantity: number }) {
  const db = await getDb();
  try {
    const offlineId = generateOfflineId();
    const performedBy = getPerformedByStr();
    await db.execute(
      `INSERT INTO barcode_history (tenantId, offlineId, barcode, barcodeType, quantity, performedBy) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tenantId, offlineId, data.barcode, data.barcodeType, data.quantity, performedBy]
    );
  } catch (e) {
    console.error('Failed to save barcode history', e);
  }
}

// -------------------------------------------------------------
// Promotions Local Operations
// -------------------------------------------------------------

export async function savePromotionLocally(data: any, tenantId: number | null) {
  const db = await getDb();
  const offlineId = generateOfflineId();
  const result = await db.execute(
    `INSERT INTO promotions (
      tenantId, offlineId, name, type, offerValue, quantityRequirement, rewardQuantity,
      startDate, endDate, appliesToType, appliesToIds, active, synced, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [
      tenantId, offlineId, data.name, data.type, data.offerValue || 0,
      data.quantityRequirement || 0, data.rewardQuantity || 0,
      data.startDate, data.endDate, data.appliesToType,
      JSON.stringify(data.appliesToIds || []), data.active ? 1 : 0
    ]
  );
  return { id: result.lastInsertId, offlineId };
}

export async function getPromotionsLocally(tenantId: number | null) {
  const db = await getDb();
  try {
    const rows = await db.select(
      `SELECT * FROM promotions WHERE tenantId = ? OR tenantId IS NULL ORDER BY createdAt DESC`,
      [tenantId]
    ) as any[];
    return rows.map(r => ({
      ...r,
      active: r.active === 1,
      appliesToIds: JSON.parse(r.appliesToIds || '[]')
    }));
  } catch (e) {
    console.error('Failed to get promotions locally', e);
    return [];
  }
}

export async function updatePromotionLocally(id: number, data: any) {
  const db = await getDb();
  await db.execute(
    `UPDATE promotions SET 
      name = ?, type = ?, offerValue = ?, quantityRequirement = ?, rewardQuantity = ?,
      startDate = ?, endDate = ?, appliesToType = ?, appliesToIds = ?, active = ?, synced = 0, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      data.name, data.type, data.offerValue || 0, data.quantityRequirement || 0, data.rewardQuantity || 0,
      data.startDate, data.endDate, data.appliesToType, JSON.stringify(data.appliesToIds || []),
      data.active ? 1 : 0, id
    ]
  );
}

export async function deletePromotionLocally(id: number) {
  const db = await getDb();
  await db.execute(`DELETE FROM promotions WHERE id = ?`, [id]);
}

export async function togglePromotionActive(id: number, active: boolean) {
  const db = await getDb();
  await db.execute(`UPDATE promotions SET active = ?, synced = 0 WHERE id = ?`, [active ? 1 : 0, id]);
}

// -------------------------------------------------------------
// Purchases Local Operations
// -------------------------------------------------------------

export async function savePurchaseLocally(
  data: {
    purchaseNumber?: string;
    supplierId?: number | null;
    supplierName?: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    subtotal?: number;
    tax?: number;
    discount?: number;
    shippingCost?: number;
    total?: number;
    paidAmount?: number;
    orderDate?: string;
    expectedDate?: string | null;
    referenceNo?: string | null;
    notes?: string | null;
    items: Array<{
      productId: number;
      productName: string;
      sku?: string;
      barcode?: string;
      unit?: string;
      quantity: number;
      unitCost: number;
      subtotal?: number;
      batchNumber?: string;
      expiryDate?: string;
    }>;
  },
  tenantId: number | null,
  branchId: number | null = 1
) {
  const db = await getDb();
  const purchaseNumber = data.purchaseNumber || `PO-${Math.floor(100000 + Math.random() * 900000)}`;
  const status = data.status || 'ORDERED';
  const paymentStatus = data.paymentStatus || 'UNPAID';
  const paymentMethod = data.paymentMethod || 'CASH';
  const orderDate = data.orderDate || new Date().toISOString();
  const receivedDate = status === 'RECEIVED' ? new Date().toISOString() : null;

  const result = await db.execute(
    `INSERT INTO purchases (
      tenantId, branchId, purchaseNumber, supplierId, supplierName,
      status, paymentStatus, paymentMethod, subtotal, tax, discount,
      shippingCost, total, paidAmount, orderDate, expectedDate, receivedDate,
      referenceNo, notes, synced, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      tenantId,
      branchId,
      purchaseNumber,
      data.supplierId || null,
      data.supplierName || 'General Supplier',
      status,
      paymentStatus,
      paymentMethod,
      data.subtotal || 0,
      data.tax || 0,
      data.discount || 0,
      data.shippingCost || 0,
      data.total || 0,
      data.paidAmount || 0,
      orderDate,
      data.expectedDate || null,
      receivedDate,
      data.referenceNo || null,
      data.notes || null,
    ]
  );

  const purchaseId = result.lastInsertId;

  if (data.items && data.items.length > 0) {
    for (const item of data.items) {
      const receivedQty = status === 'RECEIVED' ? (item.quantity || 0) : 0;
      const itemSubtotal = item.subtotal !== undefined ? item.subtotal : (item.quantity * item.unitCost);
      await db.execute(
        `INSERT INTO purchase_items (
          purchaseId, productId, productName, sku, barcode, unit,
          quantity, receivedQuantity, unitCost, subtotal, batchNumber, expiryDate, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          purchaseId,
          item.productId,
          item.productName,
          item.sku || null,
          item.barcode || null,
          item.unit || 'pcs',
          item.quantity || 0,
          receivedQty,
          item.unitCost || 0,
          itemSubtotal,
          item.batchNumber || null,
          item.expiryDate || null,
        ]
      );

      // If already received upon creation, update inventory and log!
      if (status === 'RECEIVED' && item.quantity > 0) {
        const existing = await db.select(
          'SELECT quantity FROM inventory WHERE productId = ? AND branchId = ? AND variantId IS NULL',
          [item.productId, branchId]
        ) as any[];
        const currentStock = existing && existing.length > 0 ? (existing[0].quantity || 0) : 0;
        const newStock = currentStock + item.quantity;
        await updateStockLocally(
          item.productId,
          newStock,
          'PURCHASE_RECEIPT',
          `Received PO #${purchaseNumber}: +${item.quantity} ${item.unit || 'pcs'} from ${data.supplierName || 'Supplier'}`,
          tenantId,
          branchId
        );
        // Also update branch_products costPrice if unitCost > 0
        if (item.unitCost > 0) {
          await db.execute(
            'UPDATE branch_products SET costPrice = ? WHERE productId = ? AND branchId = ?',
            [item.unitCost, item.productId, branchId]
          ).catch(() => {});
        }
      }
    }
  }

  return { id: purchaseId, purchaseNumber };
}

export async function getPurchasesLocally(tenantId: number | null, branchId: number | null = 1) {
  const db = await getDb();
  try {
    const rows = await db.select(
      `SELECT * FROM purchases 
       WHERE (tenantId = ? OR tenantId IS NULL) 
         AND (branchId = ? OR branchId IS NULL)
       ORDER BY id DESC`,
      [tenantId, branchId]
    ) as any[];

    if (!rows || rows.length === 0) return [];

    const purchaseIds = rows.map(r => r.id);
    const placeholders = purchaseIds.map(() => '?').join(',');
    const items = await db.select(
      `SELECT * FROM purchase_items WHERE purchaseId IN (${placeholders})`,
      purchaseIds
    ) as any[];

    const itemsByPurchase = new Map<number, any[]>();
    for (const item of items) {
      if (!itemsByPurchase.has(item.purchaseId)) {
        itemsByPurchase.set(item.purchaseId, []);
      }
      itemsByPurchase.get(item.purchaseId)!.push(item);
    }

    return rows.map(r => ({
      ...r,
      items: itemsByPurchase.get(r.id) || []
    }));
  } catch (e) {
    console.error('Failed to get purchases locally', e);
    return [];
  }
}

export async function receivePurchaseLocally(
  purchaseId: number,
  tenantId: number | null,
  branchId: number | null = 1
) {
  const db = await getDb();
  
  const purchases = await db.select('SELECT * FROM purchases WHERE id = ?', [purchaseId]) as any[];
  if (!purchases || purchases.length === 0) {
    throw new Error('Purchase order not found');
  }
  const purchase = purchases[0];
  if (purchase.status === 'RECEIVED') {
    return { success: true, alreadyReceived: true };
  }

  const items = await db.select('SELECT * FROM purchase_items WHERE purchaseId = ?', [purchaseId]) as any[];

  await db.execute(
    `UPDATE purchases 
     SET status = 'RECEIVED', receivedDate = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP, synced = 0
     WHERE id = ?`,
    [purchaseId]
  );

  for (const item of items) {
    await db.execute(
      `UPDATE purchase_items SET receivedQuantity = quantity WHERE id = ?`,
      [item.id]
    );

    if (item.quantity > 0) {
      const existing = await db.select(
        'SELECT quantity FROM inventory WHERE productId = ? AND branchId = ? AND variantId IS NULL',
        [item.productId, branchId]
      ) as any[];
      const currentStock = existing && existing.length > 0 ? (existing[0].quantity || 0) : 0;
      const newStock = currentStock + item.quantity;

      await updateStockLocally(
        item.productId,
        newStock,
        'PURCHASE_RECEIPT',
        `Received PO #${purchase.purchaseNumber}: +${item.quantity} ${item.unit || 'pcs'} from ${purchase.supplierName || 'Supplier'}`,
        tenantId,
        branchId
      );

      if (item.unitCost > 0) {
        await db.execute(
          'UPDATE branch_products SET costPrice = ? WHERE productId = ? AND branchId = ?',
          [item.unitCost, item.productId, branchId]
        ).catch(() => {});
      }
    }
  }

  return { success: true };
}

export async function deletePurchaseLocally(purchaseId: number) {
  const db = await getDb();
  await db.execute('DELETE FROM purchase_items WHERE purchaseId = ?', [purchaseId]);
  await db.execute('DELETE FROM purchases WHERE id = ?', [purchaseId]);
}

export async function updatePurchasePaymentStatusLocally(
  purchaseId: number,
  paymentStatus: string,
  paidAmount?: number
) {
  const db = await getDb();
  if (paidAmount !== undefined) {
    await db.execute(
      `UPDATE purchases SET paymentStatus = ?, paidAmount = ?, updatedAt = CURRENT_TIMESTAMP, synced = 0 WHERE id = ?`,
      [paymentStatus, paidAmount, purchaseId]
    );
  } else {
    await db.execute(
      `UPDATE purchases SET paymentStatus = ?, updatedAt = CURRENT_TIMESTAMP, synced = 0 WHERE id = ?`,
      [paymentStatus, purchaseId]
    );
  }
}

export async function updatePurchaseLocally(
  purchaseId: number,
  data: {
    supplierId?: number | null;
    supplierName?: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    subtotal?: number;
    tax?: number;
    discount?: number;
    shippingCost?: number;
    total?: number;
    paidAmount?: number;
    orderDate?: string;
    expectedDate?: string | null;
    referenceNo?: string | null;
    notes?: string | null;
    items?: Array<{
      productId: number;
      productName: string;
      sku?: string;
      barcode?: string;
      unit?: string;
      quantity: number;
      receivedQuantity?: number;
      unitCost: number;
      subtotal?: number;
      batchNumber?: string;
      expiryDate?: string;
    }>;
  }
) {
  const db = await getDb();
  await db.execute(
    `UPDATE purchases SET 
      supplierId = ?, supplierName = ?, status = ?, paymentStatus = ?, paymentMethod = ?,
      subtotal = ?, tax = ?, discount = ?, shippingCost = ?, total = ?, paidAmount = ?,
      orderDate = ?, expectedDate = ?, referenceNo = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP, synced = 0
     WHERE id = ?`,
    [
      data.supplierId || null,
      data.supplierName || 'General Supplier',
      data.status || 'ORDERED',
      data.paymentStatus || 'UNPAID',
      data.paymentMethod || 'CASH',
      data.subtotal || 0,
      data.tax || 0,
      data.discount || 0,
      data.shippingCost || 0,
      data.total || 0,
      data.paidAmount || 0,
      data.orderDate || new Date().toISOString(),
      data.expectedDate || null,
      data.referenceNo || null,
      data.notes || null,
      purchaseId
    ]
  );

  if (data.items && data.items.length > 0) {
    await db.execute('DELETE FROM purchase_items WHERE purchaseId = ?', [purchaseId]);
    for (const item of data.items) {
      const itemSubtotal = item.subtotal !== undefined ? item.subtotal : (item.quantity * item.unitCost);
      await db.execute(
        `INSERT INTO purchase_items (
          purchaseId, productId, productName, sku, barcode, unit,
          quantity, receivedQuantity, unitCost, subtotal, batchNumber, expiryDate, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          purchaseId,
          item.productId,
          item.productName,
          item.sku || null,
          item.barcode || null,
          item.unit || 'pcs',
          item.quantity,
          item.receivedQuantity || 0,
          item.unitCost,
          itemSubtotal,
          item.batchNumber || null,
          item.expiryDate || null,
        ]
      );
    }
  }
}

