const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Nimesha Denuwanthi/Desktop/smart POS/frontend/app/s/[domain]';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Remove Aurora imports
  content = content.replace(/^import\s+\{\s*Aurora[a-zA-Z0-9_]*\s*\}\s+from\s+[\"'].*aurora.*[\"'];?\s*$/gm, '');
  
  // Remove Aurora theme condition block
  // Example: if (theme === 'aurora' || params.domain === 'aurora') { return <AuroraHome ... /> }
  content = content.replace(/\s*if\s*\(\s*theme\s*===\s*['"]aurora['"]\s*(?:\|\|\s*params\.domain\s*===\s*['"]aurora['"]\s*)?\)\s*\{\s*return\s*<Aurora[^>]+(?:>\s*<\/\s*Aurora[^>]+>|\/>)\s*;?\s*\}/g, '');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Processed', filePath);
  }
}

function walk(currentDirPath) {
  fs.readdirSync(currentDirPath).forEach(function(name) {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      if (name === 'page.tsx') {
        processFile(filePath);
      }
    } else if (stat.isDirectory()) {
      walk(filePath);
    }
  });
}

walk(dir);
