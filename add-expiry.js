const fs = require('fs');

const files = [
  'app/owner/products/page.tsx',
  'app/employee/products/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Add to initial state and setFormData resets
    content = content.replace(/trackExpiry: false,/g, 'trackExpiry: false, expiryDate: "",');
    
    // Some lines have `trackExpiry: false, trackBatch: false` in one line, above regex will replace it as `trackExpiry: false, expiryDate: "", trackBatch: false` - which is correct.
    
    // Add to product edit load
    content = content.replace(/trackExpiry: product\.trackExpiry === 1,/g, 'trackExpiry: product.trackExpiry === 1,\n      expiryDate: product.expiryDate || "",');

    // Add UI element after the Track Batch/Lot grid
    const targetGrid = `</label>
                            </div>`;
    const replaceWith = `</label>
                            </div>
                            
                            {formData.trackExpiry && (
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expiry Date</label>
                                <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" />
                              </div>
                            )}`;
                            
    content = content.replace(targetGrid, replaceWith);

    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Update complete');
