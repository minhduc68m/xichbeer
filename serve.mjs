/**
 * Máy chủ tĩnh xem thử tại chỗ — chỉ dùng module có sẵn của Node,
 * không cần cài gì thêm.   npm run dev  →  http://localhost:5173
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const PORT = Number(process.env.PORT) || 5173;
const ROOT = process.cwd();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg':  'image/jpeg', '.jpeg': 'image/jpeg',
  '.png':  'image/png',  '.webp': 'image/webp',
  '.svg':  'image/svg+xml', '.ico': 'image/x-icon'
};

createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.normalize(path.join(ROOT, url));

    // chặn thoát ra ngoài thư mục dự án
    if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }

    const info = await stat(file).catch(() => null);
    if (!info || info.isDirectory()) file = path.join(ROOT, 'index.html');

    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    }).end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 — Không tìm thấy');
  }
}).listen(PORT, () => {
  console.log(`\n▸ Xích Beer đang chạy tại http://localhost:${PORT}\n  Ctrl+C để dừng.\n`);
});
