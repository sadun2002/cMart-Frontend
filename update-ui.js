const fs = require('fs');

const files = [
  'app/owner/products/page.tsx',
  'app/employee/products/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Extract the hasVariants toggle block
    // It looks like:
    // <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
    //   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">This product has multiple options, like different sizes or colors</span>
    //   <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
    //     <input type="checkbox" className="sr-only peer" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
    //     ...
    //   </div>
    // </label>
    const toggleRegex = /<label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">\s*<span className="text-sm font-bold text-slate-700 dark:text-slate-300">This product has multiple options, like different sizes or colors<\/span>\s*<div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">\s*<input type="checkbox" className="sr-only peer" checked=\{hasVariants\} onChange=\{\(e\) => setHasVariants\(e\.target\.checked\)\} \/>\s*<div className="[^"]+"><\/div>\s*<\/div>\s*<\/label>/;
    
    const toggleMatch = content.match(toggleRegex);
    if (!toggleMatch) {
        console.log("Could not find toggle in " + file);
        return;
    }
    const toggleBlock = toggleMatch[0];
    
    // Remove toggle block from original place
    content = content.replace(toggleBlock, '');
    
    // 2. Insert toggle block into Basic Info
    // Looking for:
    // <div className="grid grid-cols-2 gap-4">
    //   <div className="space-y-2">
    //     <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Brand</label>
    //     ...
    //   </div>
    //   <div className="space-y-2">
    //     <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Unit</label>
    //     ...
    //   </div>
    // </div>
    const brandUnitGridRegex = /(<label className="text-sm font-bold text-slate-700 dark:text-slate-300">Brand<\/label>[\s\S]*?<label className="text-sm font-bold text-slate-700 dark:text-slate-300">Unit<\/label>[\s\S]*?<\/div>\s*<\/div>)/;
    content = content.replace(brandUnitGridRegex, `$1\n\n                            <div className="mt-4">\n                              ${toggleBlock}\n                            </div>`);

    // 3. Extract Variants Section
    // Starts with {/* Variants Section */} and ends with the close of the AnimatePresence and outer div.
    // Let's use a more precise regex.
    const variantsSectionRegex = /\{\/\* Variants Section \*\/\}[\s\S]*?<div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">[\s\S]*?onClick=\{\(\) => toggleSection\('variants'\)\}[\s\S]*?<\/AnimatePresence>\s*<\/div>/;
    const variantsMatch = content.match(variantsSectionRegex);
    if (!variantsMatch) {
        console.log("Could not find variants section in " + file);
        return;
    }
    let variantsBlock = variantsMatch[0];
    
    // Remove Variants Section from original place
    content = content.replace(variantsBlock, '');
    
    // Wrap variants block in hasVariants condition
    variantsBlock = `{hasVariants && (\n                  ${variantsBlock}\n                  )}`;
    
    // 4. Update the input in Variants block to use datalist
    const optionInputRegex = /<input type="text" value=\{opt\.name\} onChange=\{e => \{ const newOpts = \[\.\.\.variantOptions\]; newOpts\[idx\]\.name = e\.target\.value; setVariantOptions\(newOpts\); \}\} placeholder="Option Name \(e\.g\. Size\)" className="([^"]+)" \/>/;
    const datalistInjection = `<input type="text" list={\`variant-options-\${idx}\`} value={opt.name} onChange={e => { const newOpts = [...variantOptions]; newOpts[idx].name = e.target.value; setVariantOptions(newOpts); }} placeholder="Option Name (e.g. Size)" className="$1" />\n                                        <datalist id={\`variant-options-\${idx}\`}>\n                                          <option value="Size" />\n                                          <option value="Color" />\n                                          <option value="Material" />\n                                          <option value="Style" />\n                                          <option value="Weight" />\n                                        </datalist>`;
    variantsBlock = variantsBlock.replace(optionInputRegex, datalistInjection);
    
    // 5. Insert Variants section before Pricing & Inventory
    const pricingRegex = /\{\/\* 2\. Pricing & Inventory \*\/\}[\s\S]*?<div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">[\s\S]*?onClick=\{\(\) => toggleSection\('pricing'\)\}/;
    
    // We will replace {/* 2. Pricing & Inventory */} with `{/* 3. Pricing & Inventory */}`
    content = content.replace(pricingRegex, (match) => {
        const renamedMatch = match.replace('{/* 2. Pricing & Inventory */}', '{/* 3. Pricing & Inventory */}');
        return `                  {/* 2. Variants Section */}\n                  ${variantsBlock}\n\n                  ${renamedMatch}`;
    });
    
    // Also update Identification and Advanced Settings headers
    content = content.replace('{/* 3. Identification */}', '{/* 4. Identification */}');
    content = content.replace('{/* 4. Advanced Settings */}', '{/* 5. Advanced Settings */}');
    
    // Wait, let's also fix the title of the sections so they don't have numbers if they didn't have them in the UI text, or if they did, let's leave them.
    // The UI text actually doesn't have numbers: `<span className="font-bold ...">Basic Information</span>`.
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated " + file);
  }
});
