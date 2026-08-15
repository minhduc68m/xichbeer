#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  XÍCH BEER — đăng thay đổi lên web
#
#  BẤM ĐÚP vào file này trong Finder là chạy. Không cần gõ lệnh.
#
#  Nó làm 3 việc: xem anh đã đổi gì, hỏi xác nhận, rồi đẩy lên GitHub.
#  GitHub tự nén ảnh và cập nhật trang web sau đó 2–3 phút.
# ═══════════════════════════════════════════════════════════════
cd "$(dirname "$0")" || exit 1

# Màu cho dễ đọc
D=$'\033[0m'; V=$'\033[1;33m'; X=$'\033[1;32m'; R=$'\033[1;31m'

echo ""
echo "${V}════════════════════════════════════════${D}"
echo "${V}  XÍCH BEER — đăng thay đổi lên web${D}"
echo "${V}════════════════════════════════════════${D}"
echo ""

# ── Kiểm tra môi trường ──────────────────────────────────────
if ! command -v git >/dev/null; then
  echo "${R}✗ Máy chưa có git.${D}"
  echo "  Mở Terminal, gõ:  xcode-select --install"
  echo ""; read -n 1 -s -r -p "Bấm phím bất kỳ để đóng..."; exit 1
fi

if [ ! -d .git ]; then
  echo "${R}✗ Thư mục này chưa được nối với GitHub.${D}"
  echo "  Nhờ người cài đặt lại giúp."
  echo ""; read -n 1 -s -r -p "Bấm phím bất kỳ để đóng..."; exit 1
fi

# ── Có gì thay đổi không ─────────────────────────────────────
if [ -z "$(git status --porcelain)" ]; then
  echo "${X}✓ Không có gì thay đổi.${D}"
  echo "  Trang web đang là bản mới nhất rồi."
  echo ""; read -n 1 -s -r -p "Bấm phím bất kỳ để đóng..."; exit 0
fi

echo "Những thứ sẽ được đăng lên:"
echo ""
git status --porcelain | while IFS= read -r dong; do
  ma="${dong:0:2}"; ten="${dong:3}"
  case "$ma" in
    "??"|"A "|" A") echo "  ${X}+ thêm mới${D}   $ten" ;;
    " D"|"D "|"AD") echo "  ${R}- xoá bỏ${D}     $ten" ;;
    *)              echo "  ${V}~ sửa đổi${D}    $ten" ;;
  esac
done
echo ""

SO=$(git status --porcelain | wc -l | tr -d ' ')
echo "Tổng cộng: ${SO} file."
echo ""

# ── Xác nhận ─────────────────────────────────────────────────
printf "Đăng lên web? [Enter = đồng ý, gõ n rồi Enter = huỷ] "
read -r tra_loi
case "$tra_loi" in
  [nN]*) echo ""; echo "Đã huỷ, không đăng gì cả."; echo ""
         read -n 1 -s -r -p "Bấm phím bất kỳ để đóng..."; exit 0 ;;
esac

# ── Đăng ─────────────────────────────────────────────────────
echo ""
echo "Đang đăng..."
git add -A || { echo "${R}✗ Lỗi ở bước git add${D}"; read -n 1 -s -r -p "..."; exit 1; }
git commit -q -m "Cập nhật nội dung $(date '+%d/%m/%Y %H:%M')" \
  || { echo "${R}✗ Lỗi ở bước ghi nhận thay đổi${D}"; read -n 1 -s -r -p "..."; exit 1; }

if ! git push -q origin main 2>&1; then
  echo ""
  echo "${R}✗ Không đẩy lên được.${D}"
  echo "  Thường do mất mạng, hoặc có người khác vừa sửa trên GitHub."
  echo "  Thử chạy lệnh này trong Terminal rồi bấm đúp lại file này:"
  echo ""
  echo "      cd \"$(pwd)\" && git pull --rebase"
  echo ""
  read -n 1 -s -r -p "Bấm phím bất kỳ để đóng..."; exit 1
fi

echo ""
echo "${X}✓ Đã đăng xong.${D}"
echo ""
echo "  GitHub đang tự nén ảnh và dựng lại trang."
echo "  Đợi khoảng 2–3 phút rồi mở:"
echo ""
echo "      ${V}https://minhduc68m.github.io/xichbeer/${D}"
echo ""
echo "  Nếu vẫn thấy nội dung cũ, bấm Cmd + Shift + R để tải lại."
echo "  Xem tiến độ: https://github.com/minhduc68m/xichbeer/actions"
echo ""
read -n 1 -s -r -p "Bấm phím bất kỳ để đóng cửa sổ này..."
echo ""
