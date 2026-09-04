const fs = require('fs');

// 1. Update custom-select.tsx
let selectContent = fs.readFileSync('components/ui/custom-select.tsx', 'utf8');

if (!selectContent.includes('Search }')) {
  selectContent = selectContent.replace(/ChevronDown } from 'lucide-react';/, "ChevronDown, Search } from 'lucide-react';");
}

if (!selectContent.includes('searchQuery')) {
  selectContent = selectContent.replace(/const \[isOpen, setIsOpen\] = useState\(false\);/, "const [isOpen, setIsOpen] = useState(false);\n  const [searchQuery, setSearchQuery] = useState('');");
}

if (!selectContent.includes('filteredOptions')) {
  selectContent = selectContent.replace(/const selectedOption = options.find/, "const filteredOptions = options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()));\n  const selectedOption = options.find");
}

selectContent = selectContent.replace(/onClick=\{\(\) => setIsOpen\(false\)\}/, "onClick={() => { setIsOpen(false); setSearchQuery(''); }}");

const motionDivRegex = /<motion\.div[\s\S]*?className="([^"]+max-h-60[^"]+)"\s*>([\s\S]*?)<\/motion\.div>/;
const match = selectContent.match(motionDivRegex);
if (match) {
  let inner = match[2];
  
  if (!inner.includes('Search...')) {
    inner = inner.replace(/\{options\.map\(opt => \([\s\S]*?<\/button>\s*\)\)\}/, 
      `{options.length >= 5 && (
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 sticky top-0 bg-white dark:bg-slate-800 z-10 shrink-0">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        autoFocus={true}
                      />
                    </div>
                  </div>
                )}
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {filteredOptions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found</div>
                  ) : (
                    filteredOptions.map(opt => (
                      <button 
                        key={opt.value} 
                        type="button" 
                        onClick={() => { onChange(opt.value); setIsOpen(false); setSearchQuery(''); }} 
                        className={\`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors \${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}\`}
                      >
                        {opt.label}
                      </button>
                    ))
                  )}
                </div>`
    );
    
    const oldClass = match[1];
    let newClass = oldClass.replace('overflow-y-auto', 'flex flex-col');
    
    selectContent = selectContent.replace(match[0], `<motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="${newClass}"
              >
                ${inner}
              </motion.div>`);
  }
}

fs.writeFileSync('components/ui/custom-select.tsx', selectContent, 'utf8');

// 2. Update page.tsx files
const files = [
  'app/owner/products/page.tsx',
  'app/employee/products/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    content = content.replace(/label="Select Category"/g, 'label="Select"');
    content = content.replace(/label="Select Subcategory"/g, 'label="Select"');
    content = content.replace(/label="Select Supplier"/g, 'label="Select"');
    content = content.replace(/label="Select Unit"/g, 'label="Select"');
    content = content.replace(/label="Select Tax"/g, 'label="Select"');
    content = content.replace(/label="Select Variant"/g, 'label="Select"');
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Update complete');
