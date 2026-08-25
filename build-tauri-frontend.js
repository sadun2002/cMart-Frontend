const fs = require('fs');
const { execSync } = require('child_process');

try {
  if (fs.existsSync('app/s')) {
    fs.renameSync('app/s', 'app/_s');
    console.log('Temporarily disabled storefront routes (app/s -> app/_s)');
  }
  
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('Cleared .next cache to prevent route mismatch errors');
  }
  
  console.log('Running next build...');
  execSync('npm run build', { stdio: 'inherit' });
  
} catch (e) {
  console.error('Build failed', e.message);
  process.exitCode = 1;
} finally {
  if (fs.existsSync('app/_s')) {
    fs.renameSync('app/_s', 'app/s');
    console.log('Restored storefront routes (app/_s -> app/s)');
  }
}
