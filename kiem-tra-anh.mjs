/**
 * Kiểm tra kết quả build trước khi cho phép commit.
 * Nếu build hỏng mà vẫn commit thì trang web sẽ mất ảnh — thà dừng còn hơn.
 *
 *   node kiem-tra-anh.mjs
 */
import { readFileSync, existsSync } from 'node:fs';

let loi = 0;
const bao = (ok, msg) => { console.log(`  ${ok ? '✓' : '✗'} ${msg}`); if (!ok) loi++; };

/* ── 1. Danh sách ảnh ────────────────────────────────────── */
const F = 'assets/js/gallery-data.js';
if (!existsSync(F)) {
  console.error(`✗ Không có ${F} — build đã hỏng.`);
  process.exit(1);
}

const src = readFileSync(F, 'utf8');
let data;
try {
  data = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf(';')));
} catch (e) {
  console.error(`✗ ${F} không đọc được: ${e.message}`);
  process.exit(1);
}

let tongAnh = 0;
const thieu = [];
for (const nhom of Object.values(data)) {
  console.log(`  · ${nhom.label}: ${nhom.items.length} ảnh`);
  for (const it of nhom.items) {
    tongAnh++;
    if (!existsSync(it.t)) thieu.push(it.t);
    if (!existsSync(it.f)) thieu.push(it.f);
  }
}

bao(tongAnh > 0, `có ${tongAnh} trang menu`);
bao(thieu.length === 0,
    thieu.length ? `thiếu ${thieu.length} file, ví dụ: ${thieu.slice(0, 3).join(', ')}`
                 : 'mọi đường dẫn trong danh sách đều có file thật');

/* ── 2. Ảnh trang chủ trỏ thẳng tới ──────────────────────── */
const batBuoc = [
  'assets/img/logo.png', 'assets/img/logo-lg.png', 'assets/img/mark.png',
  'assets/img/hero-900.jpg', 'assets/img/hero-1600.jpg', 'assets/img/hero-2400.jpg',
  'assets/img/og-image.jpg'
];
const thieuCoDinh = batBuoc.filter(f => !existsSync(f));
bao(thieuCoDinh.length === 0,
    thieuCoDinh.length ? `thiếu: ${thieuCoDinh.join(', ')}` : 'logo, hero, ảnh share: đủ');

/* ── 3. index.html không trỏ tới file không tồn tại ──────── */
if (existsSync('index.html')) {
  const html = readFileSync('index.html', 'utf8');
  const duongDan = [...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map(m => m[1]);
  const srcset   = [...html.matchAll(/(assets\/img\/[^\s",]+\.(?:jpg|png|webp))/g)].map(m => m[1]);
  const hong = [...new Set([...duongDan, ...srcset])].filter(p => !existsSync(p));
  bao(hong.length === 0,
      hong.length ? `index.html trỏ tới file không có: ${hong.join(', ')}` : 'index.html không có link ảnh gãy');
}

console.log(loi ? `\n✗ ${loi} lỗi — KHÔNG commit.\n` : '\n✓ Build hợp lệ.\n');
process.exit(loi ? 1 : 0);
