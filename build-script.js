const { spawnSync } = require('child_process');

process.env.TAURI_SIGNING_PRIVATE_KEY_PATH = "C:\\Users\\Nimesha Denuwanthi\\.tauri\\cmart.key";
process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "Chithmini@2002";
process.env.TAURI_SIGNING_PRIVATE_KEY = "dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5ClJXUlRZMEl5Mnc3aWNPcGcxdEtJc3A2N1AxYnU4YWt1ZjcvdDU2MVVNWjFNeHNlZHliUUFBQkFBQUFBQUFBQUFBQUlBQUFBQTVJSzdnUldTTUd4QVk0aUFZemdVNDRWR1BjZWtrWWtjSXJXSDRDMUM5cGhHa1gyOU5FTXhKRzYvYTVGaXU3dkVDSG56Rk5FZ0NSVElSOHViY0dsOTQ4UGJFYmtMNDJqd09FaDRJcEpIeTJmZlNuZ2VCekJOejBWWXR4N3B5eDViQkNwbStWMUhTZlU9Cg==";

console.log("Starting Tauri build with injected signing keys...");

const child = spawnSync('npm', ['run', 'tauri', 'build'], { 
  stdio: 'inherit',
  shell: true 
});

if (child.error) {
  console.error("Failed to start:", child.error);
  process.exit(1);
}

process.exit(child.status);
