const fs = require('fs');

const files = [
  'app/owner/products/page.tsx',
  'app/employee/products/page.tsx',
  'components/ui/custom-select.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Make borders more visible in dark mode
    content = content.replace(/dark:border-slate-600/g, 'dark:border-slate-500');
    content = content.replace(/dark:border-slate-700/g, 'dark:border-slate-500');
    
    // Fix custom select border visibility
    content = content.replace(/border border-slate-200 dark:border-slate-500/g, 'border-2 border-slate-300 dark:border-slate-500');
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Update complete');
