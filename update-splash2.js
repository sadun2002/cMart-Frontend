const fs = require('fs');
const file = 'app/splash/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/className=\"w-48 h-auto object-contain mb-4 shadow-2xl rounded-2xl bg-white\"/, 'className=\"w-48 h-auto object-contain mb-4 shadow-2xl rounded-2xl\"');
fs.writeFileSync(file, content);
