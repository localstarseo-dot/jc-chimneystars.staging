// Repackage JC's supplied Chimney Star photos and payment artwork for staging.
// Run only when refreshing these assets: node scripts/pack-hero-assets.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const supplied = path.resolve(process.argv[2] || path.join(root, '../assets'));
const require = createRequire(import.meta.url);
const sharp = require(process.env.JC_SHARP_PATH || 'sharp');
const manifestPath = path.join(root, 'docs/asset-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const entries = [];

async function pack(source, packaged, width, height) {
  const input = path.join(supplied, source);
  const output = path.join(root, packaged);
  mkdirSync(path.dirname(output), { recursive: true });
  let image = sharp(input).rotate();
  if (height) image = image.trim().resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } });
  else image = image.resize({ width, withoutEnlargement: true });
  const info = await image.webp({ quality: 80 }).toFile(output);
  entries.push({ source: `assets/${source}`, packaged, width: info.width, height: info.height,
    source_bytes: statSync(input).size, packaged_bytes: info.size,
    sha256: createHash('sha256').update(readFileSync(output)).digest('hex') });
}

for (const name of readdirSync(path.join(supplied, 'photos/Black Uniform')).filter(name => /\.png$/i.test(name)).sort()) {
  const slug = name.replace(/\.png$/i, '').replaceAll('_', '-');
  await pack(`photos/Black Uniform/${name}`, `assets/photos/hero/${slug}.webp`, 1448);
}
for (const name of ['visa-color-white-bg', 'mastercard-color-transparent', 'american-express-color-transparent', 'discover-color-white-bg']) {
  await pack(`payment-card-logos-svg-webp (1)/${name}.webp`, `assets/payments/${name}.webp`, 160, 104);
}
const replaced = new Set(entries.map(entry => entry.packaged));
manifest.images = manifest.images.filter(entry => !replaced.has(entry.packaged)).concat(entries);
manifest.asset_count = manifest.images.length;
manifest.source_asset_bytes = manifest.images.reduce((sum, entry) => sum + entry.source_bytes, 0);
manifest.packaged_asset_bytes = manifest.images.reduce((sum, entry) => sum + entry.packaged_bytes, 0);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Packaged ${entries.length} assets; ${entries.reduce((sum, entry) => sum + entry.packaged_bytes, 0)} bytes.`);
