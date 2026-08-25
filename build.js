const { execSync } = require('child_process');
const fs = require('fs');

console.log('Reading private key...');
const key = fs.readFileSync('C:/Users/Nimesha Denuwanthi/.tauri/cmart.key', 'utf8');

console.log('Setting environment variables...');
process.env.TAURI_SIGNING_PRIVATE_KEY = key;
process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD = 'Chithmini@2002';

console.log('Starting Tauri build...');
try {
  execSync('npm run tauri build', { stdio: 'inherit' });
} catch (err) {
  console.error('Build failed', err.message);
  process.exitCode = 1;
}
