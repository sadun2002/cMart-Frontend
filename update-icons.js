const sharp = require('sharp');
const path = require('path');
const { execSync } = require('child_process');

async function createFullBlueIcon() {
  const inputPath = path.join(__dirname, 'src-tauri', 'icons', 'app-icon.png');
  const outputPath = path.join(__dirname, 'src-tauri', 'icons', 'app-icon-square.png');

  console.log('1. Trimming logo to remove all transparent edges...');
  const trimmedBuffer = await sharp(inputPath).trim().toBuffer();

  // Scale logo to 85% of canvas (just like iOS app icons - industry standard)
  const canvasSize = 1024;
  const logoSize = Math.round(canvasSize * 0.85);

  console.log(`2. Scaling logo to ${logoSize}x${logoSize} inside ${canvasSize}x${canvasSize} blue background...`);
  const scaledLogo = await sharp(trimmedBuffer)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // cMart blue: #1e6af5 (bright blue matching app theme)
  console.log('3. Placing logo on solid cMart blue (#1e6af5) background...');
  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 30, g: 106, b: 245, alpha: 255 }  // #1e6af5
    }
  })
    .composite([{ input: scaledLogo, gravity: 'center' }])
    .png()
    .toFile(outputPath);

  console.log('✅ Created solid-background icon: app-icon-square.png');

  console.log('4. Regenerating ALL Tauri icons from new solid-background source...');
  execSync('npx @tauri-apps/cli icon src-tauri/icons/app-icon-square.png', { stdio: 'inherit' });

  console.log('5. Preserving setup-icon.ico from window-icon.png...');
  execSync('node make-setup-ico.js', { stdio: 'inherit' });

  console.log(`
🎉 DONE! 
   - app-icon-square.png: solid blue background with logo
   - icon.ico / icon.png / all sizes: regenerated from new source
   - setup-icon.ico: preserved as the 'C' letter icon
`);
}

createFullBlueIcon().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
