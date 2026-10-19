import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const TARGET_DIRS = ['./public/images', './public'];
const MAX_DIM = 1200;

function getAllImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;

  const inputBuffer = fs.readFileSync(filePath);
  let pipeline = sharp(inputBuffer).rotate(); // auto-rotate based on EXIF
  pipeline = pipeline.resize(MAX_DIM, MAX_DIM, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true, progressive: true });
  } else if (ext === '.png') {
    pipeline = pipeline.png({ quality: 80, compressionLevel: 9, effort: 7 });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: 80 });
  } else if (ext === '.avif') {
    pipeline = pipeline.avif({ quality: 75 });
  }

  const compressedBuffer = await pipeline.toBuffer();
  const newSize = compressedBuffer.length;

  if (newSize < originalSize) {
    fs.writeFileSync(filePath, compressedBuffer);
    return {
      filePath,
      originalSize,
      newSize,
      saved: originalSize - newSize,
      status: 'compressed',
    };
  } else {
    return {
      filePath,
      originalSize,
      newSize: originalSize,
      saved: 0,
      status: 'skipped (already optimal)',
    };
  }
}

async function main() {
  const seen = new Set();
  const allFiles = [];

  for (const dir of TARGET_DIRS) {
    const files = getAllImageFiles(dir);
    for (const f of files) {
      const normalized = path.resolve(f);
      if (!seen.has(normalized)) {
        seen.add(normalized);
        allFiles.push(f);
      }
    }
  }

  console.log(`Found ${allFiles.length} image files to process...`);

  let totalOriginal = 0;
  let totalNew = 0;
  let compressedCount = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    try {
      const res = await compressImage(file);
      totalOriginal += res.originalSize;
      totalNew += res.newSize;
      if (res.status === 'compressed') compressedCount++;
      const savedPct = ((res.saved / res.originalSize) * 100).toFixed(1);
      const origKb = (res.originalSize / 1024).toFixed(0);
      const newKb = (res.newSize / 1024).toFixed(0);
      console.log(`[${i + 1}/${allFiles.length}] ${path.basename(file)}: ${origKb}KB -> ${newKb}KB (${savedPct}% saved)`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
      const size = fs.statSync(file).size;
      totalOriginal += size;
      totalNew += size;
    }
  }

  const savedTotalMb = ((totalOriginal - totalNew) / (1024 * 1024)).toFixed(2);
  const origMb = (totalOriginal / (1024 * 1024)).toFixed(2);
  const newMb = (totalNew / (1024 * 1024)).toFixed(2);
  const totalSavedPct = (((totalOriginal - totalNew) / totalOriginal) * 100).toFixed(1);

  console.log('\n=======================================');
  console.log(`Finished processing ${allFiles.length} images.`);
  console.log(`Compressed: ${compressedCount} files`);
  console.log(`Original total: ${origMb} MB`);
  console.log(`New total: ${newMb} MB`);
  console.log(`Saved: ${savedTotalMb} MB (${totalSavedPct}% reduction)`);
  console.log('=======================================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
