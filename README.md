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

Còn **một** chỗ dùng nội dung tạm, có ghi chú `TODO(Xích Beer)` ngay trong file:

| Việc | Ở đâu | Sửa thành |
|---|---|---|
| Instagram | `index.html` — footer, khối `<a>` Instagram | Link thật, hoặc xoá cả khối `<a>` |

Ngoài ra:

- **Địa chỉ trang** đã trỏ đúng `https://minhduc68m.github.io/xichbeer/`. Chỉ phải sửa lại nếu sau này đổi sang tên miền riêng — khi đó đổi cả 4 chỗ: `canonical`, `og:url`, `og:image` và `"image"` trong khối JSON-LD. **Phải là địa chỉ đầy đủ** vì Facebook không đọc được đường dẫn tương đối.
- **Email quán** là `xichbeer1@gmail.com`, ở footer `index.html`.
- **Giờ mở cửa** đang là **10:00 – 23:30 mọi ngày**. Sửa ở 3 nơi nếu đổi: bảng `<ul id="hours">`, dòng `Quán mở 10:00 – 23:30 hằng ngày` trong form, và mục `openingHoursSpecification` trong khối JSON-LD ở `<head>`.
- **Nút đặt bàn** gửi qua Facebook Messenger của trang `facebook.com/xichbeer`. Muốn đổi sang trang khác: sửa `fbPage` ở đầu `assets/js/app.js`.
  Muốn dùng **Zalo** thay Messenger: đổi link nút `#bookMsn` trong `index.html` thành `https://zalo.me/<số-zalo>` và sửa nhãn nút.

---

## 4. Thay hoặc thêm ảnh menu

**Website không đọc thẳng từ `DoAn/`, `DoUong/`, `Combo/`.** Nó đọc bản đã nén trong
`assets/img/` và danh sách `assets/js/gallery-data.js`. Trước đây phải nhớ chạy `build.sh`, quên là web
vẫn hiện ảnh cũ. **Giờ GitHub tự làm việc đó** mỗi khi anh đẩy ảnh mới lên.

### Cách làm — chỉ 2 bước

**Bước 1.** Thêm, xoá, hoặc thay file ảnh trong `DoAn/`, `DoUong/`, `Combo/`.
Nhận `.webp`, `.jpg`, `.jpeg`, `.png`.

> **Tên file quyết định thứ tự hiển thị** — trang sắp A→Z. Nên đặt `a01`, `a02`, `a03`…
> Muốn chèn một trang vào giữa `a02` và `a03` thì đặt tên `a02b`.

**Bước 2.** Đẩy lên GitHub:

```bash
git add . && git commit -m "Cập nhật menu" && git push
```

**Hết.** Không phải chạy `build.sh` nữa.

GitHub sẽ tự nén ảnh, cập nhật danh sách rồi commit ngược lại. Trang web đổi theo sau
khoảng **2–3 phút**. Nếu trình duyệt vẫn hiện ảnh cũ, bấm **Cmd + Shift + R**.

### Không dùng dòng lệnh cũng được

Không cần mở Terminal chút nào:

1. Vào https://github.com/minhduc68m/xichbeer
2. Bấm vào thư mục `DoAn` (hoặc `DoUong`, `Combo`)
3. **Add file → Upload files**, kéo ảnh vào, bấm **Commit changes**
4. Xoá ảnh cũ: bấm vào ảnh đó → biểu tượng thùng rác → **Commit changes**

GitHub tự lo phần còn lại y hệt.

### Theo dõi xem chạy xong chưa

Vào tab **Actions** của repo. Dấu ✅ vàng đang quay là đang chạy, xanh là xong, đỏ là lỗi
(bấm vào xem log để biết hỏng ở đâu).

Nếu build hỏng giữa chừng, workflow **dừng lại và không commit gì cả** — trang web giữ
nguyên ảnh cũ chứ không bị mất ảnh.

### Vẫn muốn dựng ảnh trên máy

Dùng khi cần xem thử trước lúc đẩy lên:

```bash
./build.sh
```

Script chỉ dùng `sips` + `python3` có sẵn của macOS, không cần cài gì. Máy có Node thì
`npm run build` cho ảnh WebP nhẹ hơn — đây cũng chính là thứ GitHub chạy.

### Những điểm cần biết

- **Xoá ảnh gốc thì build sẽ dọn sạch theo** — bản nén cũ và mục trong danh sách đều biến mất, không sót rác.
- **`build.sh` không bao giờ đụng vào `DoAn/`, `DoUong/`, `Combo/`, `Khac/`.** Nó chỉ ghi vào `assets/`. Ảnh gốc của anh an toàn.
- **Ảnh gốc là thứ duy nhất không tái tạo được.** `assets/` luôn dựng lại được từ ảnh gốc, còn ảnh gốc mất là mất. Nên giữ một bản sao ở nơi khác trước khi dọn dẹp hàng loạt.
- Nhóm nào hết sạch ảnh thì tab đó hiện dòng nhắn "chưa có ảnh menu" kèm số điện thoại, không để trống.
- Đổi ảnh không gian quán hoặc logo: thay `Khac/khonggian.png` / `Khac/logo.png` rồi đẩy lên, GitHub cũng tự dựng lại.
- Bấm chạy lại bằng tay: tab **Actions** → **Dựng lại ảnh** → **Run workflow**.

---

## 5. Cấu trúc thư mục

```
index.html              trang chính (ở thư mục gốc — GitHub Pages yêu cầu)
README.md
package.json
build.sh                dựng ảnh trên máy macOS (tuỳ chọn, để xem thử)
build.mjs               dựng ảnh bằng Node + sharp — GitHub chạy file này
kiem-tra-anh.mjs        chặn commit nếu build hỏng
.github/workflows/      GitHub tự dựng ảnh mỗi khi đẩy ảnh gốc lên
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

`assets/img/` và `assets/js/gallery-data.js` do GitHub tự sinh ra từ ảnh gốc mỗi khi
anh đẩy ảnh mới lên. Đừng sửa tay hai chỗ đó — lần build sau sẽ ghi đè.

---

## 6. Ghi chú kỹ thuật

- **Màu nhấn `#F89938`** lấy trực tiếp từ file logo. Đổi ở biến `--brass` trong `styles.css` là đổi toàn trang.
- **Font**: Bitter (tiêu đề) + Be Vietnam Pro (nội dung) — cả hai đều có bộ ký tự tiếng Việt đầy đủ.
- **Ảnh hero** chụp ban ngày, được hạ sáng và ngả vàng bằng CSS filter cho hợp tông quán bia buổi tối. Muốn bỏ hiệu ứng này: xoá dòng `filter:` trong `.hero__media img`.
- **Bản đồ Google** bị đảo màu bằng CSS để hợp nền tối (Google Maps nhúng không có tuỳ chọn dark mode).
- Toàn bộ chuyển động đều tắt khi máy khách bật *Giảm chuyển động* (`prefers-reduced-motion`).
- Trang không thu thập dữ liệu, không cookie, không script bên thứ ba ngoài Google Fonts và Google Maps.
