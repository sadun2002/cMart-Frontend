const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildIco() {
  const inputPath = path.join(__dirname, 'src-tauri', 'icons', 'app-icon.png');
  const iconIcoPath = path.join(__dirname, 'src-tauri', 'icons', 'icon.ico');
  const iconPngPath = path.join(__dirname, 'src-tauri', 'icons', 'icon.png');

  console.log('1. Trimming all transparent edges from app-icon.png...');
  const trimmedBuffer = await sharp(inputPath).trim().toBuffer();

  // ICO sizes - need all common sizes including 16x16
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  // PNG sizes Tauri uses
  const pngSizes = { '32x32': 32, '64x64': 64, '128x128': 128, '128x128@2x': 256 };

  console.log('2. Generating all ICO sizes (no extra padding)...');
  const pngBuffers = [];
  for (const size of icoSizes) {
    const buf = await sharp(trimmedBuffer)
      .resize(size, size, {
        fit: 'fill',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    pngBuffers.push({ size, buffer: buf });
    console.log(`   ✓ ${size}x${size}`);
  }

  console.log('3. Packing into icon.ico...');
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let currentOffset = headerSize + (dirEntrySize * numImages);

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    const w = item.size >= 256 ? 0 : item.size;
    const h = item.size >= 256 ? 0 : item.size;
    entry.writeUInt8(w, 0);
    entry.writeUInt8(h, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(item.buffer.length, 8);
    entry.writeUInt32LE(currentOffset, 12);
    dirEntries.push(entry);
    currentOffset += item.buffer.length;
  }

  const finalBuffer = Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
  fs.writeFileSync(iconIcoPath, finalBuffer);
  console.log(`   ✓ icon.ico (${finalBuffer.length} bytes)`);

  console.log('4. Generating icon.png (512x512, no padding)...');
  await sharp(trimmedBuffer)
    .resize(512, 512, { fit: 'fill', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(iconPngPath);
  console.log('   ✓ icon.png (512x512)');

  console.log('5. Generating small PNG sizes...');
  for (const [name, size] of Object.entries(pngSizes)) {
    const outPath = path.join(__dirname, 'src-tauri', 'icons', `${name}.png`);
    await sharp(trimmedBuffer)
      .resize(size, size, { fit: 'fill', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`   ✓ ${name}.png`);
  }

  console.log('\n🎉 DONE! All icons rebuilt without any extra padding.');
  console.log('   icon.ico: 16, 24, 32, 48, 64, 128, 256px (transparent, no padding)');
}

buildIco().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
