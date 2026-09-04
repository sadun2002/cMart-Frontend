export function calculateEAN13Checksum(barcode12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

export function generateSystemBarcode(tenantId: number = 0): string {
  // GS1 Prefix '20' is officially reserved for Internal / In-Store Use
  const prefix = '20';
  
  // Pad tenantId to 4 digits (e.g., 0014)
  const tenantStr = tenantId.toString().padStart(4, '0').slice(-4);
  
  // Random 6 digits for the product/item
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += Math.floor(Math.random() * 10).toString();
  }
  
  const barcode12 = prefix + tenantStr + randomStr;
  const checksum = calculateEAN13Checksum(barcode12);
  
  return barcode12 + checksum.toString();
}
