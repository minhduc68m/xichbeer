#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  XÍCH BEER — tạo lại ảnh cho website
#  Chạy sau mỗi lần thêm/xoá/đổi ảnh trong DoAn, DoUong, Combo, Khac.
#
#  Cách chạy:  ./build.sh      (hoặc: bash build.sh)
#
#  Chỉ dùng công cụ có sẵn của macOS (sips + python3) — không cần cài gì.
#  Nếu máy đã có Node thì `npm run build` cho ảnh WebP nhẹ hơn ~30%.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail
cd "$(dirname "$0")"

THUMB_MAX=1000; THUMB_Q=45      # thẻ thanh menu: nhiều điểm ảnh + nén sâu hơn
                                # cho ảnh nét hơn mà vẫn nhẹ hơn cách ngược lại
FULL_MAX=1600;  FULL_Q=70       # ảnh to khi bấm vào xem (đủ nét để phóng)

echo ""
echo "▸ Xích Beer — tạo lại ảnh"
echo ""

command -v sips >/dev/null || { echo "✗ Không tìm thấy sips. Script này chỉ chạy trên macOS."; exit 1; }
command -v python3 >/dev/null || { echo "✗ Không tìm thấy python3."; exit 1; }

# ── Ảnh menu ──────────────────────────────────────────────────
lam_nhom () {           # $1 = thư mục gốc   $2 = tên thư mục đích
  local src="$1" key="$2" n=0

  if [ ! -d "$src" ]; then
    echo "⚠  Bỏ qua \"$src\" — không có thư mục này."
    return
  fi

  # Xoá sạch bản cũ, tránh sót ảnh đã bị gỡ khỏi thư mục gốc
  rm -rf "assets/img/$key"
  mkdir -p "assets/img/$key/thumb" "assets/img/$key/full"

  # Duyệt theo thứ tự A→Z; nhận .webp .jpg .jpeg .png, bỏ file ẩn
  while IFS= read -r f; do
    local base
    base="$(basename "$f")"; base="${base%.*}"
    sips -s format jpeg -s formatOptions "$THUMB_Q" -Z "$THUMB_MAX" \
         "$f" --out "assets/img/$key/thumb/$base.jpg" >/dev/null 2>&1
    sips -s format jpeg -s formatOptions "$FULL_Q" -Z "$FULL_MAX" \
         "$f" --out "assets/img/$key/full/$base.jpg" >/dev/null 2>&1
    n=$((n+1))
  done < <(find "$src" -maxdepth 1 -type f \
             \( -iname '*.webp' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) \
             ! -name '.*' | sort)

  printf "✓ %-8s %2d ảnh\n" "$src" "$n"
}

lam_nhom "DoAn"   "doan"
lam_nhom "DoUong" "douong"
lam_nhom "Combo"  "combo"

# ── Logo, ảnh hero, ảnh share Facebook ────────────────────────
mkdir -p assets/img

if [ -f "Khac/khonggian.png" ]; then
  sips -s format jpeg -s formatOptions 62 -Z 900  Khac/khonggian.png --out assets/img/hero-900.jpg  >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 60 -Z 1600 Khac/khonggian.png --out assets/img/hero-1600.jpg >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 58 -Z 2400 Khac/khonggian.png --out assets/img/hero-2400.jpg >/dev/null 2>&1

  # Ảnh share 1200×630: cắt đúng tỉ lệ trước rồi mới thu nhỏ, tránh viền đen
  W=$(sips -g pixelWidth  Khac/khonggian.png | awk '/pixelWidth/{print $2}')
  H=$(sips -g pixelHeight Khac/khonggian.png | awk '/pixelHeight/{print $2}')
  CW=$(python3 -c "print(min($W, round($H*1200/630)))")
  OX=$(python3 -c "print(round(($W-$CW)/2))")
  sips -c "$H" "$CW" --cropOffset 0 "$OX" Khac/khonggian.png --out /tmp/xich-og.png >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 70 -z 630 1200 /tmp/xich-og.png --out assets/img/og-image.jpg >/dev/null 2>&1
  echo "✓ hero-900/1600/2400.jpg + og-image.jpg"
else
  echo "⚠  Không thấy Khac/khonggian.png — giữ nguyên ảnh hero cũ."
fi

if [ -f "Khac/logo.png" ]; then
  sips -Z 440  Khac/logo.png --out assets/img/logo.png    >/dev/null 2>&1
  sips -Z 1100 Khac/logo.png --out assets/img/logo-lg.png >/dev/null 2>&1
  sips -c 780 780 --cropOffset 90 170 Khac/logo.png --out /tmp/xich-mark.png >/dev/null 2>&1
  sips -Z 180 /tmp/xich-mark.png --out assets/img/mark.png >/dev/null 2>&1
  echo "✓ logo.png + logo-lg.png + mark.png"
else
  echo "⚠  Không thấy Khac/logo.png — giữ nguyên logo cũ."
fi

# ── Danh sách ảnh cho website đọc ─────────────────────────────
python3 - <<'PY'
import os, json
nhom = [("doan", "Đồ ăn"), ("douong", "Đồ uống"), ("combo", "Combo")]
data = {}
for key, nhan in nhom:
    d = f"assets/img/{key}/thumb"
    ten = sorted(f[:-4] for f in os.listdir(d) if f.endswith(".jpg")) if os.path.isdir(d) else []
    data[key] = {"label": nhan, "items": [
        {"t": f"assets/img/{key}/thumb/{n}.jpg",
         "f": f"assets/img/{key}/full/{n}.jpg",
         "a": f"Menu {nhan} Xích Beer – trang {i+1}"} for i, n in enumerate(ten)]}
os.makedirs("assets/js", exist_ok=True)
with open("assets/js/gallery-data.js", "w", encoding="utf-8") as fh:
    fh.write("/* Tự sinh bởi build.sh — đừng sửa tay, chạy lại ./build.sh để cập nhật. */\n")
    fh.write("window.XICH_GALLERY = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
print("✓ assets/js/gallery-data.js  (" +
      ", ".join(f"{v['label']}: {len(v['items'])}" for v in data.values()) + ")")
PY

echo ""
echo "✓ Xong. Xem thử:  python3 -m http.server 5173   →  http://localhost:5173"
echo "  Ưng rồi thì đẩy lên GitHub:  git add . && git commit -m \"Cập nhật menu\" && git push"
echo ""
