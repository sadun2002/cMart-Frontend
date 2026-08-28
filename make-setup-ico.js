const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createIco(inputPngPath, outputIcoPath) {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    const buf = await sharp(inputPngPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push({ size, buffer: buf });
  }

  // Calculate header and directory size
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let currentOffset = headerSize + (dirEntrySize * numImages);

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(numImages, 4); // Number of images

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    const w = item.size >= 256 ? 0 : item.size;
    const h = item.size >= 256 ? 0 : item.size;
    entry.writeUInt8(w, 0);
    entry.writeUInt8(h, 1);
    entry.writeUInt8(0, 2); // No palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Image data size
    entry.writeUInt32LE(currentOffset, 12); // Offset
    dirEntries.push(entry);
    currentOffset += item.buffer.length;
  }

  const finalBuffer = Buffer.concat([
    header,
    ...dirEntries,
    ...pngBuffers.map(p => p.buffer)
  ]);

  fs.writeFileSync(outputIcoPath, finalBuffer);
  console.log(`✅ Successfully generated ${outputIcoPath} from ${inputPngPath} (${finalBuffer.length} bytes)`);
}

const input = path.join(__dirname, 'src-tauri', 'icons', 'window-icon.png');
const output = path.join(__dirname, 'src-tauri', 'icons', 'setup-icon.ico');

createIco(input, output).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
