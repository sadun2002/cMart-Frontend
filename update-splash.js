const fs = require('fs');
const file = 'app/splash/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the 'c' card
content = content.replace(/<div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6">[\s\S]*?<\/div>/, '<img src=\"/logo-large.png\" alt=\"cMart\" className=\"w-48 h-auto object-contain mb-4 shadow-2xl rounded-2xl bg-white\" />');

// Remove the h1 text
content = content.replace(/<motion\.h1[\s\S]*?<\/motion\.h1>/, '');

fs.writeFileSync(file, content);
console.log('Splash screen updated');
