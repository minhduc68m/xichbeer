/**
 * XÍCH BEER — build ảnh
 * ---------------------------------------------------------------
 * Đọc ảnh gốc trong DoAn/ DoUong/ Combo/ Khac/, sinh ra:
 *   assets/img/<nhóm>/thumb/*   ảnh nhỏ cho thanh menu ngang
 *   assets/img/<nhóm>/full/*    ảnh to cho lightbox
 *   assets/img/hero-*.jpg       ảnh nền hero 3 kích thước
 *   assets/img/logo*.png        logo, mark làm favicon
 *   assets/img/og-image.jpg     ảnh share Facebook/Zalo (1200×630)
 *   assets/js/gallery-data.js   danh sách ảnh cho trang web đọc
 *
 * Nếu đã cài `sharp` (npm install) thì xuất WebP — nhẹ hơn ~30%.
 * Nếu chưa có sharp, script tự chuyển sang dùng `sips` có sẵn của macOS
 * và xuất JPEG. Cả hai trường hợp trang web đều chạy đúng vì
 * gallery-data.js luôn ghi lại đúng tên file đã tạo.
 *
 *   npm run build      # tạo lại toàn bộ ảnh + manifest
 *   npm run dev        # xem thử tại http://localhost:5173
 */

import { mkdir, readdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const run = promisify(execFile);
const OUT = 'assets/img';

const GROUPS = [
  { key: 'doan',   label: 'Đồ ăn',   src: 'DoAn' },
  { key: 'douong', label: 'Đồ uống', src: 'DoUong' },
  { key: 'combo',  label: 'Combo',   src: 'Combo' }
];

const SIZES = {
  thumb: { max: 640,  quality: 62 },   // thẻ trong thanh ngang
  full:  { max: 1600, quality: 72 }    // lightbox (đủ nét để zoom)
};

/* ── Chọn bộ xử lý ảnh ───────────────────────────────────── */
let sharp = null;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.log('ℹ  Chưa cài sharp — dùng sips của macOS, xuất JPEG.');
  console.log('   Muốn ảnh nhẹ hơn (WebP): npm install\n');
}
const EXT = sharp ? 'webp' : 'jpg';

async function convert(src, dest, { max, quality }) {
  if (sharp) {
    await sharp(src)
      .rotate()
      .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toFile(dest);
  } else {
    await run('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality),
                       '-Z', String(max), src, '--out', dest]);
  }
}

/* ── Ảnh menu ────────────────────────────────────────────── */
async function buildMenu() {
  const manifest = {};

  for (const g of GROUPS) {
    if (!existsSync(g.src)) {
      console.warn(`⚠  Bỏ qua "${g.src}" — không tìm thấy thư mục.`);
      manifest[g.key] = { label: g.label, items: [] };
      continue;
    }

    for (const size of ['thumb', 'full']) {
      await rm(`${OUT}/${g.key}/${size}`, { recursive: true, force: true });
      await mkdir(`${OUT}/${g.key}/${size}`, { recursive: true });
    }

    const files = (await readdir(g.src))
      .filter(f => /\.(webp|jpe?g|png)$/i.test(f) && !f.startsWith('.'))
      .sort();

    const items = [];
    for (const [i, file] of files.entries()) {
      const base = path.parse(file).name;
      const src  = path.join(g.src, file);

      await convert(src, `${OUT}/${g.key}/thumb/${base}.${EXT}`, SIZES.thumb);
      await convert(src, `${OUT}/${g.key}/full/${base}.${EXT}`,  SIZES.full);

      items.push({
        t: `${OUT}/${g.key}/thumb/${base}.${EXT}`,
        f: `${OUT}/${g.key}/full/${base}.${EXT}`,
        a: `Menu ${g.label} Xích Beer – trang ${i + 1}`
      });
    }

    manifest[g.key] = { label: g.label, items };
    console.log(`✓ ${g.label.padEnd(8)} ${items.length} ảnh`);
  }

  await mkdir('assets/js', { recursive: true });
  await writeFile(
    'assets/js/gallery-data.js',
    '/* Tự sinh bởi build.mjs — đừng sửa tay, chạy `npm run build` để tạo lại. */\n' +
    'window.XICH_GALLERY = ' + JSON.stringify(manifest, null, 2) + ';\n',
    'utf8'
  );
  console.log('✓ assets/js/gallery-data.js');
}

/* ── Hero, logo, OG ──────────────────────────────────────── */
async function buildBrand() {
  await mkdir(OUT, { recursive: true });
  const hero = 'Khac/khonggian.png';
  const logo = 'Khac/logo.png';

  if (existsSync(hero)) {
    // Hero: JPEG ở mọi trường hợp — <img srcset> trong index.html trỏ tới .jpg
    for (const [w, q] of [[900, 62], [1600, 60], [2400, 58]]) {
      await run('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(q),
                         '-Z', String(w), hero, '--out', `${OUT}/hero-${w}.jpg`]);
    }
    // OG 1200×630: cắt đúng tỉ lệ 1.905:1 trước khi thu nhỏ, tránh viền đen
    const { stdout } = await run('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', hero]);
    const W = +stdout.match(/pixelWidth:\s*(\d+)/)[1];
    const H = +stdout.match(/pixelHeight:\s*(\d+)/)[1];
    const cw = Math.min(W, Math.round(H * 1200 / 630));
    await run('sips', ['-c', String(H), String(cw), '--cropOffset', '0', String(Math.round((W - cw) / 2)),
                       hero, '--out', '/tmp/xich-og.png']);
    await run('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '70',
                       '-z', '630', '1200', '/tmp/xich-og.png', '--out', `${OUT}/og-image.jpg`]);
    console.log('✓ hero-900/1600/2400.jpg + og-image.jpg');
  } else {
    console.warn('⚠  Không thấy Khac/khonggian.png — bỏ qua hero & ảnh share.');
  }

  if (existsSync(logo)) {
    await run('sips', ['-Z', '440',  logo, '--out', `${OUT}/logo.png`]);
    await run('sips', ['-Z', '1100', logo, '--out', `${OUT}/logo-lg.png`]);
    await run('sips', ['-c', '780', '780', '--cropOffset', '90', '170', logo, '--out', '/tmp/xich-mark.png']);
    await run('sips', ['-Z', '180', '/tmp/xich-mark.png', '--out', `${OUT}/mark.png`]);
    console.log('✓ logo.png + logo-lg.png + mark.png (favicon)');
  } else {
    console.warn('⚠  Không thấy Khac/logo.png — bỏ qua logo & favicon.');
  }
}

console.log('\n▸ Xích Beer — build ảnh\n');
await buildBrand();
await buildMenu();
console.log('\n✓ Xong. Mở index.html hoặc chạy `npm run dev`.\n');
