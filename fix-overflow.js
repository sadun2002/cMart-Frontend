const fs = require('fs');

const files = [
  'app/owner/products/page.tsx',
  'app/employee/products/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/rounded-xl overflow-hidden/g, 'rounded-xl');
    
    content = content.replace(/<motion\.div\s+initial=\{\{\s*height:\s*0,\s*opacity:\s*0\s*\}\}\s+animate=\{\{\s*height:\s*'auto',\s*opacity:\s*1\s*\}\}\s+exit=\{\{\s*height:\s*0,\s*opacity:\s*0\s*\}\}\s+className="overflow-hidden"\s*>/g, 
      `<motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
        style={{ overflow: 'hidden' }}
      >`);
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Update complete');
