const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (!content.includes('font-sans')) {
        let modified = false;
        
        // Common root classes in the project
        const targets = [
          'className="min-h-screen ',
          'className="p-6 lg:p-8',
          'className="p-4 md:p-6',
          'className="h-full flex',
          'className="py-12 px-4',
          'className="space-y-6',
          'className="flex flex-col',
          'className="w-full'
        ];

        for (const target of targets) {
          if (content.includes(target) && !modified) {
             content = content.replace(target, target.replace('className="', 'className="font-sans '));
             modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
        } else {
           // fallback: just find the first className=" after return
           const idx = content.indexOf('return (');
           if (idx !== -1) {
              const classIdx = content.indexOf('className="', idx);
              if (classIdx !== -1) {
                 content = content.substring(0, classIdx + 11) + 'font-sans ' + content.substring(classIdx + 11);
                 fs.writeFileSync(fullPath, content, 'utf8');
              }
           }
        }
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
