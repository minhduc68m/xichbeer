/**
 * Canh gác thông tin quán: số điện thoại, giờ mở cửa, email.
 *
 * Mấy thứ này nằm rải rác chục chỗ trong index.html và app.js. Cố tình để
 * vậy chứ không cho JS sinh ra — vì nếu JS hỏng, hoặc crawler Facebook
 * không chạy JS, thì số điện thoại biến mất khỏi trang. Với quán ăn đó là
 * thứ không được phép mất.
 *
 * Đổi lại, script này bắt buộc MỌI chỗ phải khớp nhau. Sửa sót một chỗ là
 * GitHub chặn, không cho lên web.
 *
 *   node kiem-tra-thong-tin.mjs
 */
import { readFileSync } from 'node:fs';

const doc = ['index.html', 'assets/js/app.js'];
let loi = 0;

function dong(file, chuoi) {          // trả về [số dòng] chứa chuỗi
  return readFileSync(file, 'utf8').split('\n')
    .map((l, i) => (l.includes(chuoi) ? i + 1 : 0)).filter(Boolean);
}

function soat(ten, regex, chuanHoa = (x) => x) {
  const thay = new Map();             // giá trị -> [file:dòng]
  for (const f of doc) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(regex)) {
      const v = chuanHoa(m[0]);
      if (!thay.has(v)) thay.set(v, []);
      for (const d of dong(f, m[0])) thay.get(v).push(`${f}:${d}`);
    }
  }
  const cacGiaTri = [...thay.keys()];
  const tong = [...thay.values()].reduce((s, a) => s + a.length, 0);

  if (cacGiaTri.length <= 1) {
    console.log(`  ✓ ${ten}: ${tong} chỗ, tất cả khớp — ${cacGiaTri[0] ?? '(không có)'}`);
    return;
  }
  loi++;
  console.error(`  ✗ ${ten}: LỆCH NHAU, tìm thấy ${cacGiaTri.length} giá trị khác nhau`);
  for (const [v, o] of thay) {
    console.error(`      "${v}"  ->  ${[...new Set(o)].join(', ')}`);
  }
}

console.log('\n▸ Soát thông tin quán\n');

// Số điện thoại — chấp nhận 2 dạng viết, nhưng mỗi dạng phải nhất quán
soat('Điện thoại (dạng tel:)',   /\+84\d{9,11}/g);
soat('Điện thoại (dạng hiện)',   /02\d[.\s]\d{3}[.\s]\d{2}[.\s]\d{3}/g);
soat('Email',                    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi);
soat('Giờ mở cửa',               /\b10:00\b/g);
soat('Giờ đóng cửa',             /\b23:30\b/g);

if (loi) {
  console.error(`\n✗ ${loi} thông tin bị lệch giữa các chỗ — SỬA CHO KHỚP rồi đẩy lại.\n`);
  process.exit(1);
}
console.log('\n✓ Mọi thông tin đều khớp.\n');
