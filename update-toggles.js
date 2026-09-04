const fs = require('fs');

const toggleMarkup = (checkedExpr, onChangeExpr) => `
  <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
    <input type="checkbox" className="sr-only peer" checked={${checkedExpr}} onChange={${onChangeExpr}} />
    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  </div>`;

const toggleMarkupDisabled = (id, checkedExpr, disabledExpr, onChangeExpr) => `
  <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
    <input type="checkbox" id="${id}" className="sr-only peer" checked={${checkedExpr}} disabled={${disabledExpr}} onChange={${onChangeExpr}} />
    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
  </div>`;

const files = [
  'app/owner/products/page.tsx',
  'app/employee/products/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Variants Toggle
    const variantRegex = /<label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500">[\s\S]*?<input type="checkbox" className="hidden" checked=\{hasVariants\} onChange=\{\(e\) => setHasVariants\(e\.target\.checked\)\} \/>[\s\S]*?<span className="text-sm font-bold text-slate-700 dark:text-slate-300">This product has multiple options, like different sizes or colors<\/span>[\s\S]*?<\/label>/;
    const variantReplacement = `<label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">This product has multiple options, like different sizes or colors</span>
                              ${toggleMarkup('hasVariants', '(e) => setHasVariants(e.target.checked)')}
                            </label>`;
    content = content.replace(variantRegex, variantReplacement);

    // 2. Track Expiry Toggle
    const expiryRegex = /<label className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer">\s*<input type="checkbox" checked=\{formData\.trackExpiry\} onChange=\{e => setFormData\(\{\.\.\.formData, trackExpiry: e\.target\.checked\}\)\} className="[^"]+" \/>\s*<span className="text-sm font-bold text-slate-700 dark:text-slate-300">Track Expiry<\/span>\s*<\/label>/;
    const expiryReplacement = `<label className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Track Expiry</span>
                                ${toggleMarkup('formData.trackExpiry', 'e => setFormData({...formData, trackExpiry: e.target.checked})')}
                              </label>`;
    content = content.replace(expiryRegex, expiryReplacement);

    // 3. Track Batch/Lot Toggle
    const batchRegex = /<label className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer">\s*<input type="checkbox" checked=\{formData\.trackBatch\} onChange=\{e => setFormData\(\{\.\.\.formData, trackBatch: e\.target\.checked\}\)\} className="[^"]+" \/>\s*<span className="text-sm font-bold text-slate-700 dark:text-slate-300">Track Batch\/Lot<\/span>\s*<\/label>/;
    const batchReplacement = `<label className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Track Batch/Lot</span>
                                ${toggleMarkup('formData.trackBatch', 'e => setFormData({...formData, trackBatch: e.target.checked})')}
                              </label>`;
    content = content.replace(batchRegex, batchReplacement);

    // 4. Show in E-Store Toggle
    const estoreRegex = /<div className=\{`flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl \$\{([^}]+)\}`\}>\s*<input type="checkbox" id="showOnWebsite" checked=\{([^}]+)\} disabled=\{([^}]+)\} onChange=\{e => setFormData\(\{\.\.\.formData, showOnWebsite: e\.target\.checked\}\)\} className="[^"]+" \/>\s*<label htmlFor="showOnWebsite" className="flex flex-col cursor-pointer select-none">\s*<span className="text-sm font-bold text-slate-700 dark:text-slate-300">Show in E-Store \(Show this product on your e-commerce website\)<\/span>([\s\S]*?)<\/label>\s*<\/div>/;
    
    // We have to dynamically rebuild this block since it has dynamic variables inside
    const estoreMatch = content.match(estoreRegex);
    if (estoreMatch) {
      const conditionClass = estoreMatch[1];
      const checkedExpr = estoreMatch[2];
      const disabledExpr = estoreMatch[3];
      const warningText = estoreMatch[4]; // the "Requires at least 1 image" block
      
      const estoreReplacement = `<div className={\`flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl \${${conditionClass}}\`}>
                                  <label htmlFor="showOnWebsite" className="flex flex-col cursor-pointer select-none">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Show in E-Store (Show this product on your e-commerce website)</span>${warningText}</label>
                                  ${toggleMarkupDisabled('showOnWebsite', checkedExpr, disabledExpr, 'e => setFormData({...formData, showOnWebsite: e.target.checked})')}
                                </div>`;
      content = content.replace(estoreRegex, estoreReplacement);
    }
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Toggles updated successfully');
