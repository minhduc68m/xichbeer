# Xích Beer — landing page

Trang giới thiệu một trang cho **Xích Beer — 68 Nguyên Hồng, Láng, Hà Nội**.
HTML/CSS/JS thuần, không framework, không cần server — deploy thẳng lên GitHub Pages.

---

## 1. Xem thử trên máy

```bash
python3 -m http.server 5173
```

Mở http://localhost:5173. Dừng bằng `Ctrl+C`. `python3` có sẵn trên macOS, không cần cài gì.

> Máy nào đã cài **Node 18+** thì dùng `npm run dev` cũng ra kết quả y hệt.
>
> Đừng mở thẳng `index.html` bằng cách nhấp đúp — trình duyệt chặn một số tính năng khi chạy từ `file://`.

---

## 2. Deploy lên GitHub Pages

**Lần đầu:**

1. Tạo repository mới trên GitHub (ví dụ `xichbeer`), để **Public**.
2. Trong thư mục dự án, chạy:

```bash
git init
git add .
git commit -m "Trang chủ Xích Beer"
git branch -M main
git remote add origin https://github.com/<TÊN-GITHUB>/<TÊN-REPO>.git
git push -u origin main
```

3. Trên GitHub, vào **Settings → Pages**:
   - *Source*: **Deploy from a branch**
   - *Branch*: **main**, thư mục **/ (root)** → **Save**
4. Đợi 1–2 phút. Trang sẽ chạy tại `https://<TÊN-GITHUB>.github.io/<TÊN-REPO>/`.

**Các lần sau:**

```bash
git add .
git commit -m "Cập nhật menu"
git push
```

GitHub Pages tự cập nhật sau khoảng 1 phút.

> File `.nojekyll` ở thư mục gốc là cố ý — nó bảo GitHub đừng xử lý trang qua Jekyll.
> Đừng xoá.

---

## 3. Cần sửa gì sau khi deploy

Ba chỗ dùng nội dung tạm, đều có ghi chú `TODO(Xích Beer)` ngay trong file:

| Việc | Ở đâu | Sửa thành |
|---|---|---|
| Địa chỉ trang thật (cho SEO + ảnh share Facebook/Zalo) | `index.html` — thẻ `og:url`, `og:image`, `canonical`, và `"image"` trong khối JSON-LD | Thay `https://xichbeer.github.io/` bằng địa chỉ thật. **Phải là địa chỉ đầy đủ** — Facebook không đọc được đường dẫn tương đối. |
| Email quán | `index.html` — footer, `mailto:lienhe@xichbeer.vn` | Email thật, hoặc xoá hẳn dòng đó |
| Instagram | `index.html` — footer, khối `<a>` Instagram | Link thật, hoặc xoá cả khối `<a>` |

Ngoài ra:

- **Giờ mở cửa** đang là **10:00 – 23:30 mọi ngày**. Sửa ở 3 nơi nếu đổi: bảng `<ul id="hours">`, dòng `Quán mở 10:00 – 23:30 hằng ngày` trong form, và mục `openingHoursSpecification` trong khối JSON-LD ở `<head>`.
- **Nút đặt bàn** gửi qua Facebook Messenger của trang `facebook.com/xichbeer`. Muốn đổi sang trang khác: sửa `fbPage` ở đầu `assets/js/app.js`.
  Muốn dùng **Zalo** thay Messenger: đổi link nút `#bookMsn` trong `index.html` thành `https://zalo.me/<số-zalo>` và sửa nhãn nút.

---

## 4. Thay hoặc thêm ảnh menu

**Website không đọc thẳng từ `DoAn/`, `DoUong/`, `Combo/`.** Nó đọc bản đã nén trong
`assets/img/` và danh sách `assets/js/gallery-data.js`. Thay ảnh gốc xong **phải chạy lại
build** thì trang mới hiện ảnh mới.

### Ba bước

**Bước 1 — sửa ảnh gốc.** Thêm, xoá, hoặc thay file trong `DoAn/`, `DoUong/`, `Combo/`.
Nhận `.webp`, `.jpg`, `.jpeg`, `.png`.

> **Tên file quyết định thứ tự hiển thị** — trang sắp A→Z. Nên đặt `a01`, `a02`, `a03`…
> Muốn chèn một trang vào giữa `a02` và `a03` thì đặt tên `a02b`.

**Bước 2 — chạy build:**

```bash
./build.sh
```

Nếu máy báo *permission denied*, chạy `chmod +x build.sh` một lần rồi thử lại.
Script chỉ dùng `sips` + `python3` có sẵn của macOS — **không cần cài gì**.

> Máy có Node thì `npm run build` cho kết quả tốt hơn một chút (ảnh WebP, nhẹ hơn ~30%).
> Hai lệnh thay thế được cho nhau, dùng cái nào cũng ra trang chạy đúng.

Script sẽ in ra số ảnh nó tìm thấy — **nhìn con số này để biết nó có nhận đúng file không**:

```
✓ DoAn     19 ảnh
✓ DoUong    2 ảnh
✓ Combo     6 ảnh
✓ assets/js/gallery-data.js  (Đồ ăn: 19, Đồ uống: 2, Combo: 6)
```

**Bước 3 — xem thử rồi đẩy lên:**

```bash
python3 -m http.server 5173
```

Mở http://localhost:5173, bấm qua 3 tab kiểm tra. Ưng rồi thì:

```bash
git add . && git commit -m "Cập nhật menu" && git push
```

GitHub Pages tự cập nhật sau khoảng 1 phút. Nếu trình duyệt vẫn hiện ảnh cũ,
bấm **Cmd + Shift + R** để tải lại bỏ qua cache.

### Những điểm cần biết

- **Xoá ảnh gốc thì build sẽ dọn sạch theo** — bản nén cũ và mục trong danh sách đều biến mất, không sót rác.
- **`build.sh` không bao giờ đụng vào `DoAn/`, `DoUong/`, `Combo/`, `Khac/`.** Nó chỉ ghi vào `assets/`. Ảnh gốc của anh an toàn.
- **Ảnh gốc là thứ duy nhất không tái tạo được.** `assets/` luôn dựng lại được từ ảnh gốc, còn ảnh gốc mất là mất. Nên giữ một bản sao ở nơi khác trước khi dọn dẹp hàng loạt.
- Nhóm nào hết sạch ảnh thì tab đó hiện dòng nhắn "chưa có ảnh menu" kèm số điện thoại, không để trống.
- Đổi ảnh không gian quán hoặc logo: thay `Khac/khonggian.png` / `Khac/logo.png` rồi cũng chạy `./build.sh`.

---

## 5. Cấu trúc thư mục

```
index.html              trang chính (ở thư mục gốc — GitHub Pages yêu cầu)
README.md
package.json
build.sh                tạo ảnh nén + gallery-data.js  ← chạy cái này
build.mjs               bản Node của build.sh (cần cài Node)
serve.mjs               server xem thử tại chỗ
.nojekyll               bắt buộc cho GitHub Pages

assets/
  css/styles.css
  js/app.js             tabs, thanh menu ngang, lightbox, form đặt bàn
  js/gallery-data.js    ← TỰ SINH, đừng sửa tay
  img/                  ← TỰ SINH, đừng sửa tay
    hero-900|1600|2400.jpg
    og-image.jpg        ảnh hiện khi share lên Facebook/Zalo
    logo.png, logo-lg.png, mark.png
    doan/ douong/ combo/  (thumb/ và full/)

DoAn/ DoUong/ Combo/    ẢNH GỐC — nguồn để build, đừng xoá
Khac/                   logo.png + khonggian.png
```

`assets/img/` và `assets/js/gallery-data.js` được sinh ra từ ảnh gốc. Vẫn nên commit
cả hai lên GitHub để trang chạy được ngay mà không cần ai chạy build.

---

## 6. Ghi chú kỹ thuật

- **Màu nhấn `#F89938`** lấy trực tiếp từ file logo. Đổi ở biến `--brass` trong `styles.css` là đổi toàn trang.
- **Font**: Bitter (tiêu đề) + Be Vietnam Pro (nội dung) — cả hai đều có bộ ký tự tiếng Việt đầy đủ.
- **Ảnh hero** chụp ban ngày, được hạ sáng và ngả vàng bằng CSS filter cho hợp tông quán bia buổi tối. Muốn bỏ hiệu ứng này: xoá dòng `filter:` trong `.hero__media img`.
- **Bản đồ Google** bị đảo màu bằng CSS để hợp nền tối (Google Maps nhúng không có tuỳ chọn dark mode).
- Toàn bộ chuyển động đều tắt khi máy khách bật *Giảm chuyển động* (`prefers-reduced-motion`).
- Trang không thu thập dữ liệu, không cookie, không script bên thứ ba ngoài Google Fonts và Google Maps.
