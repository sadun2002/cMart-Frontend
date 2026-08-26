const { spawn } = require('child_process');

const child = spawn('node', ['./node_modules/@tauri-apps/cli/tauri.js', 'signer', 'generate', '-w', 'cmart.key']);

child.stdout.on('data', (data) => {
  const str = data.toString();
  console.log(str);
  if (str.includes('Please enter a password')) {
    child.stdin.write('cmartpassword123\n');
  }
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
