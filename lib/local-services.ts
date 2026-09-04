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

export async function saveProductLocally(data: any, tenantId: number | null, branchId: number | null = 1) {
  const db = await getDb();
  const offlineId = generateOfflineId();
  
  const categoryId = data.categoryId !== 'null' ? data.categoryId : null;

  const result = await db.execute(
      `INSERT INTO products (
      tenantId, name, slug, barcode, sku, unit, 
      showOnWebsite, categoryId, aliases, imageLabels, images, offlineId, synced, createdAt,
      brand, supplierId, trackExpiry, expiryDate, trackBatch
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)`,
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
      data.trackBatch ? 1 : 0
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
    variants: variantsByProduct.get(p.id) || []
  }));
}

export async function updateProductLocally(id: number | string, data: any, tenantId: number | null, branchId: number | null = 1) {
  const db = await getDb();
  const categoryId = data.categoryId !== 'null' ? data.categoryId : null;

  await db.execute(
    `UPDATE products SET 
      name = ?, slug = ?, barcode = ?, sku = ?, unit = ?, 
      showOnWebsite = ?, categoryId = ?, aliases = ?, imageLabels = ?, images = ?, 
      brand = ?, supplierId = ?, trackExpiry = ?, expiryDate = ?, trackBatch = ?, synced = 0
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
    `INSERT INTO sales (tenantId, branchId, invoiceNo, offlineId, subtotal, tax, discount, total, paymentMethod, paymentStatus, customerId, userId, synced) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      tenantId, 
      branchId, 
      invoiceNo, 
      offlineId, 
      data.amountLKR || 0, // Using amountLKR as total for now based on POS page
      0, 0, // tax, discount (can be updated later if needed)
      data.amountLKR || 0,
      data.paymentMethod,
      'COMPLETED',
      data.customerId || null,
      userId
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
