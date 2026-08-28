const sharp = require('sharp');
const path = require('path');
const { execSync } = require('child_process');

async function processAppIcon() {
  const inputPath = path.join(__dirname, 'src-tauri', 'icons', 'app-icon.png');
  const outputPath = path.join(__dirname, 'src-tauri', 'icons', 'app-icon-square.png');

  console.log('1. Trimming transparent borders from app-icon.png...');
  const trimmedBuffer = await sharp(inputPath)
    .trim()
    .toBuffer();

  console.log('2. Scaling blue cMart logo to 960x930 inside 1024x1024 canvas (matching window-icon proportions)...');
  const scaledIconBuffer = await sharp(trimmedBuffer)
    .resize(960, 930, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  console.log('3. Placing scaled icon centrally on 1024x1024 transparent canvas...');
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: scaledIconBuffer, gravity: 'center' }])
  .png()
  .toFile(outputPath);

  console.log('✅ Created full-size app-icon-square.png');

  console.log('4. Regenerating all Tauri app icons using @tauri-apps/cli icon...');
  execSync('npx @tauri-apps/cli icon src-tauri/icons/app-icon-square.png', { stdio: 'inherit' });

  console.log('5. Ensuring setup-icon.ico is preserved as the crisp C window-icon...');
  execSync('node make-setup-ico.js', { stdio: 'inherit' });

  console.log('🎉 ALL ICONS UPDATED SUCCESSFULLY!');
}

processAppIcon().catch(err => {
  console.error('❌ Error updating icons:', err);
  process.exit(1);
});
