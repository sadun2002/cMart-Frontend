const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const readline = require('readline');

// Load environment variables from .env.local if present
function loadEnvLocal() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    });
  }
}

loadEnvLocal();

function runBuild(privateKey, password) {
  process.env.TAURI_SIGNING_PRIVATE_KEY = privateKey;
  if (password) {
    process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD = password;
  }
  
  console.log('✅ Loaded signing key & password');
  console.log('🚀 Running Tauri build (Packaging application & generating signature)...');
  
  const result = spawnSync('npm', ['run', 'tauri', 'build'], {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });
  
  if (result.error) {
    console.error('❌ Build execution error:', result.error.message);
    process.exit(1);
  }
  
  if (result.status !== 0) {
    console.error(`❌ Tauri build exited with code ${result.status}`);
    process.exit(result.status);
  }
  
  console.log('\n🎉 ==============================================');
  console.log('✅ cMart POS build completed successfully!');
  console.log('📦 Setup EXE & .sig files are in:');
  console.log('   frontend/src-tauri/target/release/bundle/nsis/');
  console.log('==============================================\n');
}

try {
  if (!fs.existsSync('cmart.key')) {
    console.error('❌ Error: cmart.key private key file not found in frontend directory.');
    process.exit(1);
  }

  const privateKey = fs.readFileSync('cmart.key', 'utf8').trim();
  const envPassword = process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD;

  if (envPassword) {
    runBuild(privateKey, envPassword);
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.stdoutMuted = true;
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted) rl.output.write('*');
      else rl.output.write(stringToWrite);
    };

    rl.question('Please enter your Tauri private key password: ', (password) => {
      rl.stdoutMuted = false;
      rl.close();
      console.log('\n');
      runBuild(privateKey, password.trim());
    });
  }
} catch (error) {
  console.error('❌ Unexpected error during build:', error.message);
  process.exit(1);
}
