/* ═══════════════════════════════════════════════════════════
   XÍCH BEER — tương tác trang
   Không phụ thuộc thư viện ngoài. Tôn trọng prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var CFG = {
    fbPage: 'xichbeer',              // facebook.com/<fbPage>
    tel:    '+842462722888',
    telText:'024.627.22.888'
  };

  /* ─── Toast ───────────────────────────────────────────── */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 4200);
  }

  /* ─── Header: đổi nền khi cuộn ────────────────────────── */
  var hdr = $('#hdr');
  var onScroll = function () { hdr.classList.toggle('is-stuck', window.scrollY > 12); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── Drawer mobile ───────────────────────────────────── */
  var burger = $('#burger'), drawer = $('#drawer');
  function setDrawer(open) {
    burger.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    burger.setAttribute('aria-label', open ? 'Đóng menu điều hướng' : 'Mở menu điều hướng');
  }
  burger.addEventListener('click', function () {
    setDrawer(burger.getAttribute('aria-expanded') !== 'true');
  });
  drawer.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) setDrawer(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setDrawer(false); burger.focus();
    }
  });

  /* ─── Scroll reveal ───────────────────────────────────── */
  var revealables = $$('.reveal');
  if (reduced.matches || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      io.observe(el);
    });

    /* Lưới an toàn: một số webview (trình duyệt trong app Facebook/Zalo) hoặc
       tab bị đóng băng có thể không gọi IntersectionObserver. Nội dung nằm
       trong tầm nhìn mà vẫn ẩn sau 1,5s thì hiện thẳng — thà mất hiệu ứng
       còn hơn khách nhìn thấy trang trắng. */
    var left = revealables.length;
    var sweep = function () {
      revealables.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 1.15) {
          el.classList.add('is-in');
          io.unobserve(el);
          left--;
        }
      });
      if (left <= 0) window.removeEventListener('scroll', onSweep);
    };

    var queued = false;
    var onSweep = function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () { queued = false; sweep(); });
    };

    setTimeout(sweep, 1500);
    window.addEventListener('scroll', onSweep, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) setTimeout(sweep, 400);
    });
  }

  /* ═══════════ MENU: tabs + thanh ngang ═══════════ */
  var DATA  = window.XICH_GALLERY || {};
  var view  = $('#railView');
  var prevB = $('#railPrev');
  var nextB = $('#railNext');
  var state = { cat: 'doan', items: [], i: 0 };

  $$('[data-count]').forEach(function (el) {
    var c = DATA[el.getAttribute('data-count')];
    el.textContent = c ? c.items.length : 0;
  });

  var ZOOM_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg>';

  function renderRail(cat) {
    var group = DATA[cat];
    if (!group) return;
    state.cat = cat;
    state.items = group.items;

    var panelId = 'panel-' + cat;
    view.id = 'railView';
    view.setAttribute('aria-labelledby', 'tab-' + cat);
    $$('.tab').forEach(function (t) { t.setAttribute('aria-controls', panelId); });

    if (!group.items.length) {
      view.innerHTML =
        '<p class="rail__empty">Nhóm “' + group.label + '” chưa có ảnh menu. ' +
        'Gọi <a href="tel:+842462722888">024.627.22.888</a> để hỏi món nhé.</p>';
      updateRailNav();
      return;
    }

    var html = group.items.map(function (it, i) {
      return '<button type="button" class="card" data-i="' + i + '" ' +
             'aria-label="Mở to ' + it.a + '">' +
               '<span class="card__ph">' +
                 '<img src="' + it.t + '" alt="' + it.a + '" loading="' + (i < 3 ? 'eager' : 'lazy') +
                 '" decoding="async" width="1500" height="2121">' +
               '</span>' +
               '<span class="card__tag">' + group.label + ' ' + (i + 1) + ZOOM_SVG + '</span>' +
             '</button>';
    }).join('');

    view.innerHTML = html;
    view.scrollLeft = 0;
    updateRailNav();
  }

  function updateRailNav() {
    if (!prevB || !nextB) return;
    var max = view.scrollWidth - view.clientWidth - 2;
    prevB.disabled = view.scrollLeft <= 2;
    nextB.disabled = view.scrollLeft >= max;
  }

  function railStep(dir) {
    var card = view.querySelector('.card');
    var w = card ? card.getBoundingClientRect().width + 16 : 280;
    var per = Math.max(1, Math.floor(view.clientWidth / w));
    view.scrollBy({ left: dir * w * per, behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  if (prevB) prevB.addEventListener('click', function () { railStep(-1); });
  if (nextB) nextB.addEventListener('click', function () { railStep(1); });
  view.addEventListener('scroll', function () {
    window.requestAnimationFrame(updateRailNav);
  }, { passive: true });
  window.addEventListener('resize', updateRailNav);

  // Phím ← → khi thanh menu đang được focus
  view.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); railStep(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); railStep(-1); }
  });

  /* Mọi nút .mtab (header, drawer, tabs) đều chuyển nhóm menu */
  function selectCat(cat, scroll) {
    if (!DATA[cat]) return;
    renderRail(cat);

    $$('.tab').forEach(function (t) {
      var on = t.getAttribute('data-cat') === cat;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    $$('.hdr__mid .mtab, .drawer .mtab').forEach(function (t) {
      var on = t.getAttribute('data-cat') === cat;
      t.classList.toggle('is-on', on);
      if (t.closest('.hdr__mid')) t.setAttribute('aria-current', on ? 'true' : 'false');
    });

    if (scroll) {
      document.getElementById('menu').scrollIntoView({
        behavior: reduced.matches ? 'auto' : 'smooth', block: 'start'
      });
    }
  }

  $$('.mtab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectCat(btn.getAttribute('data-cat'), !btn.closest('.tabs'));
    });
  });

  // Phím ← → giữa 3 tab (chuẩn WAI-ARIA tablist)
  var tabs = $$('.tab');
  tabs.forEach(function (tab, idx) {
    tab.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = tabs[(idx + d + tabs.length) % tabs.length];
      next.focus();
      selectCat(next.getAttribute('data-cat'), false);
    });
  });

  selectCat('doan', false);

  /* ═══════════ LIGHTBOX ═══════════ */
  var lb      = $('#lb');
  var lbImg   = $('#lbImg');
  var lbStage = $('#lbStage');
  var lbCount = $('#lbCount');
  var lbPrev  = $('#lbPrev');
  var lbNext  = $('#lbNext');
  var lbClose = $('#lbClose');
  var lastFocus = null;

  function showAt(i) {
    var it = state.items[i];
    if (!it) return;
    state.i = i;
    unzoom();
    lbImg.src = it.f;
    lbImg.alt = it.a;
    lbCount.textContent = (i + 1) + ' / ' + state.items.length;
    lbPrev.disabled = i === 0;
    lbNext.disabled = i === state.items.length - 1;

    // nạp trước ảnh kế tiếp cho mượt
    var nx = state.items[i + 1];
    if (nx) { var p = new Image(); p.src = nx.f; }
  }

  function openLB(i) {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    showAt(i);
    lbClose.focus();
  }

  function closeLB() {
    lb.hidden = true;
    document.body.style.overflow = '';
    unzoom();
    lbImg.src = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function unzoom() {
    lbStage.classList.remove('is-zoomed');
    lbImg.style.transformOrigin = 'center center';
  }

  view.addEventListener('click', function (e) {
    var card = e.target.closest('.card');
    if (card) openLB(Number(card.getAttribute('data-i')));
  });

  lbPrev.addEventListener('click', function () { showAt(state.i - 1); });
  lbNext.addEventListener('click', function () { showAt(state.i + 1); });
  lbClose.addEventListener('click', closeLB);

  /* Bấm vào ảnh → phóng to đúng vị trí con trỏ; bấm lại → thu về */
  lbImg.addEventListener('click', function (e) {
    if (lbStage.classList.contains('is-zoomed')) { unzoom(); return; }
    var r = lbImg.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width) * 100;
    var y = ((e.clientY - r.top) / r.height) * 100;
    lbImg.style.transformOrigin =
      Math.max(0, Math.min(100, x)) + '% ' + Math.max(0, Math.min(100, y)) + '%';
    lbStage.classList.add('is-zoomed');
  });

  /* Bấm ra vùng nền (ngoài ảnh) → đóng */
  lbStage.addEventListener('click', function (e) {
    if (e.target === lbStage) closeLB();
  });

  /* Bàn phím + bẫy focus trong lightbox */
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') {
      if (lbStage.classList.contains('is-zoomed')) { unzoom(); } else { closeLB(); }
    } else if (e.key === 'ArrowRight') { e.preventDefault(); showAt(state.i + 1); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); showAt(state.i - 1); }
    else if (e.key === 'Tab') {
      var f = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.disabled; });
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  /* Vuốt ngang trên mobile để chuyển ảnh */
  var tx = 0, ty = 0;
  lbStage.addEventListener('touchstart', function (e) {
    tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY;
  }, { passive: true });
  lbStage.addEventListener('touchend', function (e) {
    if (lbStage.classList.contains('is-zoomed')) return;
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      showAt(state.i + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  /* ═══════════ GIỜ MỞ CỬA: tô đậm hôm nay ═══════════ */
  var today = new Date().getDay();
  var td = $('#hours li[data-day="' + today + '"]');
  if (td) td.classList.add('is-today');
  $('#yr').textContent = new Date().getFullYear();

  /* ═══════════ FORM ĐẶT BÀN ═══════════ */
  var form = $('#bookForm');

  var RULES = {
    name:   { el: '#f-name',   err: '#e-name',
              test: function (v) { return v.trim().length >= 2; },
              msg: 'Cho quán xin tên với ạ (ít nhất 2 ký tự).' },
    tel:    { el: '#f-tel',    err: '#e-tel',
              test: function (v) { return /^[0-9+\s().-]{9,15}$/.test(v.trim()); },
              msg: 'Số điện thoại chưa đúng — nhập 9–15 chữ số.' },
    people: { el: '#f-people', err: '#e-people',
              test: function (v) { var n = Number(v); return n >= 1 && n <= 200; },
              msg: 'Số người phải từ 1 đến 200.' },
    time:   { el: '#f-time',   err: '#e-time',
              test: function (v) { return !!v && !isNaN(new Date(v).getTime()); },
              msg: 'Chọn ngày giờ anh/chị muốn tới quán.' }
  };

  function check(key, silent) {
    var r = RULES[key], input = $(r.el), errEl = $(r.err);
    var ok = r.test(input.value);
    if (!ok && !silent) {
      errEl.textContent = r.msg; errEl.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else if (ok) {
      errEl.hidden = true; input.removeAttribute('aria-invalid');
    }
    return ok;
  }

  Object.keys(RULES).forEach(function (key) {
    var input = $(RULES[key].el);
    input.addEventListener('blur', function () { check(key); });
    // sửa lỗi ngay khi gõ lại, nhưng không "mắng" khi đang gõ dở
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') check(key, false);
    });
  });

  function fmtTime(v) {
    var d = new Date(v);
    if (isNaN(d.getTime())) return v;
    var days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    var p = function (n) { return String(n).padStart(2, '0'); };
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ' ' + days[d.getDay()] +
           ' ' + p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function buildMessage() {
    var note = $('#f-note').value.trim();
    return 'ĐẶT BÀN XÍCH BEER\n' +
           '• Tên: '        + $('#f-name').value.trim() + '\n' +
           '• SĐT: '        + $('#f-tel').value.trim() + '\n' +
           '• Số người: '   + $('#f-people').value.trim() + '\n' +
           '• Thời gian: '  + fmtTime($('#f-time').value) +
           (note ? '\n• Ghi chú: ' + note : '');
  }

  /* Cách cũ execCommand — dùng khi Clipboard API bị chặn (Safari cũ, http, webview) */
  function copyLegacy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        // Clipboard API có thể bị từ chối (thiếu quyền / thiếu thao tác người dùng)
        return copyLegacy(text) ? Promise.resolve() : Promise.reject();
      });
    }
    return copyLegacy(text) ? Promise.resolve() : Promise.reject();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstBad = null;
    Object.keys(RULES).forEach(function (key) {
      if (!check(key) && !firstBad) firstBad = $(RULES[key].el);
    });
    if (firstBad) {
      firstBad.focus();
      firstBad.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
      return;
    }

    var msg = buildMessage();
    $('#bookMsg').textContent = msg;
    $('#bookMsn').href = 'https://m.me/' + CFG.fbPage;

    var out = $('#bookOut');
    out.hidden = false;
    out.focus();
    out.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });

    // Copy ngay trong handler để còn "user activation"; hỏng cũng không sao
    // vì nội dung đã hiện sẵn để anh/chị bôi đen chép tay.
    copyText(msg)
      .then(function () { toast('Đã sao chép — bấm “Mở Messenger & dán”.'); })
      .catch(function () { toast('Nội dung đặt bàn đã hiện bên dưới, anh/chị chép giúp nhé.'); });
  });

  $('#bookCopy').addEventListener('click', function () {
    copyText($('#bookMsg').textContent)
      .then(function () { toast('Đã sao chép nội dung đặt bàn.'); })
      .catch(function () { toast('Trình duyệt chặn sao chép — anh/chị bôi đen rồi copy tay nhé.'); });
  });
})();
