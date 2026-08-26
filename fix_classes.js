const fs = require('fs');
const files = [
  'components/layout/AdminSidebar.tsx',
  'components/layout/DashboardSidebar.tsx',
  'components/layout/EmployeeSidebar.tsx',
  'components/layout/OwnerSidebar.tsx',
  'components/layout/site-footer.tsx',
  'components/layout/site-header.tsx',
  'app/login/page.tsx',
  'app/register/page.tsx'
];

files.forEach(file => {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const newLines = lines.map(line => {
    if (line.includes('<img src="/logo-small.png"')) {
      let l = line.replace(/rounded-\[[^\]]+\]/g, '');
      l = l.replace(/rounded-xl/g, '');
      l = l.replace(/shadow-sm/g, '');
      l = l.replace(/shadow-lg/g, '');
      l = l.replace(/shadow-blue-200/g, '');
      l = l.replace(/className="\s+/g, 'className="');
      l = l.replace(/\s+"/g, '"');
      l = l.replace(/\s{2,}/g, ' '); // clean extra spaces inside className
      return l;
    }
    return line;
  });
  fs.writeFileSync(file, newLines.join('\n'));
});
console.log('Done');
