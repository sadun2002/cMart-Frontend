const fs = require('fs');

const files = [
  'app/owner/products/page.tsx',
  'app/employee/products/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/📦 Basic Information/g, 'Basic Information');
  content = content.replace(/💰 Pricing & Inventory/g, 'Pricing & Inventory');
  content = content.replace(/🔖 Identification/g, 'Identification');
  content = content.replace(/🔀 Variants/g, 'Variants');
  content = content.replace(/⚙️ Advanced Settings/g, 'Advanced Settings');
  
  // Update inputs
  content = content.replace(/bg-slate-50 dark:bg-slate-800\/50 border border-slate-200/g, 'bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-300');
  
  content = content.replace(/bg-slate-50 dark:bg-slate-800 border border-slate-200/g, 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300');
  
  // Select fields and others
  content = content.replace(/border-slate-200 dark:border-slate-700/g, 'border-slate-300 dark:border-slate-600');
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Update complete');
