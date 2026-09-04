const fs = require('fs');
const path = require('path');

const settingsDir = 'c:/Users/Nimesha Denuwanthi/Desktop/smart POS/frontend/app/owner/settings';

function getFiles(dir) {
  const subdirs = fs.readdirSync(dir);
  const files = subdirs.map((subdir) => {
    const res = path.resolve(dir, subdir);
    return fs.statSync(res).isDirectory() ? getFiles(res) : res;
  });
  return files.reduce((a, f) => a.concat(f), []);
}

const files = getFiles(settingsDir).filter(f => f.endsWith('page.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const regex = /<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200\/40">\s*<([a-zA-Z0-9]+)\s+className="w-5 h-5 text-white"\s*\/>\s*<\/div>/g;
  
  const newContent = content.replace(regex, (match, iconName) => {
    return `<${iconName} className="w-7 h-7 text-gray-900 dark:text-white" />`;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
