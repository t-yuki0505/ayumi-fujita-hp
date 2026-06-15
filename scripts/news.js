/* ──────────────────────────────────────────────
   news.js  — Googleスプレッドシートからお知らせを読み込む
   ──────────────────────────────────────────────

   【スプレッドシートのURL設定】
   共有済みスプレッドシートをCSV形式で読み込みます。

   ────────────────────────────────────────────── */

(function () {
  'use strict';

  // ↓「ウェブに公開」で出てきたURLをそのまま貼る
  var CSV_URL = 'https://docs.google.com/spreadsheets/d/1WLBW8ImwZYkn1suX5LbDMCsoVwzFCEIoa9xXKhDT36M/export?format=csv&gid=0';

  /* ── DOM ─────────────────────────────────────── */
  var list         = document.getElementById('js-news-list');
  var modal        = document.querySelector('[data-news-modal]');
  var modalImgWrap = document.getElementById('js-modal-img-wrap');
  var modalImg     = document.getElementById('js-modal-img');
  var modalCat     = document.getElementById('js-modal-cat');
  var modalDate    = document.getElementById('js-modal-date');
  var modalTitle   = document.getElementById('js-modal-title');
  var modalText    = document.getElementById('js-modal-text');
  var modalLink    = document.getElementById('js-modal-link');

  if (!list || !modal) return;

  /* ── CSV パーサー ────────────────────────────── */
  function parseCSV(text) {
    var rows = [];
    var row = [];
    var cur = '';
    var inQ = false;

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var next = text[i + 1];

      if (ch === '"') {
        if (inQ && next === '"') {
          cur += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (ch === ',' && !inQ) {
        row.push(cur);
        cur = '';
      } else if ((ch === '\n' || ch === '\r') && !inQ) {
        if (ch === '\r' && next === '\n') i++;
        row.push(cur);
        if (row.some(function (col) { return col !== ''; })) rows.push(row);
        row = [];
        cur = '';
      } else {
        cur += ch;
      }
    }

    row.push(cur);
    if (row.some(function (col) { return col !== ''; })) rows.push(row);
    return rows;
  }

  /* ── Google Drive URL → 直接表示URLに変換 ───── */
  function convertImageUrl(url) {
    if (!url) return '';
    // https://drive.google.com/file/d/FILE_ID/view
    var m = url.match(/\/file\/d\/([^\/\?]+)/);
    if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1200';
    // https://drive.google.com/open?id=FILE_ID
    var m2 = url.match(/[?&]id=([^&]+)/);
    if (m2) return 'https://drive.google.com/thumbnail?id=' + m2[1] + '&sz=w1200';
    // それ以外はそのまま
    return url;
  }

  /* ── 日付フォーマット ────────────────────────── */
  function formatDate(raw) {
    if (!raw) return '';
    // 2025/12/20 or 2025-12-20 → 2025.12.20
    var m = raw.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (m) {
      return m[1] + '.' + m[2].padStart(2,'0') + '.' + m[3].padStart(2,'0');
    }
    return raw;
  }

  /* ── データ変換 ──────────────────────────────── */
  function toItems(rows) {
    return rows
      .slice(1) // 1行目はヘッダーなのでスキップ
      .map(function (cols) {
        var get = function (i) { return (cols[i] || '').trim(); };
        return {
          title    : get(0),
          date     : formatDate(get(1)),
          category : get(2),
          body     : get(3),
          imageUrl : convertImageUrl(get(4)),
          linkUrl  : get(5),
          show     : get(6).toUpperCase() !== 'FALSE'
        };
      })
      .filter(function (item) { return item.title && item.show; });
  }

  /* ── リスト描画 ──────────────────────────────── */
  // TOPページは最大3件、news.htmlは全件
  var IS_TOP = !document.querySelector('.news--all');
  var LIMIT  = IS_TOP ? 3 : Infinity;

  function renderList(items) {
    if (!items.length) {
      list.innerHTML = '<li class="news__state lang-jp">現在お知らせはありません。</li>';
      return;
    }
    var displayed = items.slice(0, LIMIT);
    list.innerHTML = displayed.map(function (item, i) {
      return (
        '<li class="news__item" data-index="' + i + '" tabindex="0" role="button"' +
          ' aria-label="' + esc(item.title) + '">' +
          '<span class="news__date en">'  + esc(item.date)     + '</span>' +
          '<span class="news__cat en">'   + esc(item.category) + '</span>' +
          '<span class="news__title">'    + esc(item.title)    + '</span>' +
          '<span class="news__arrow" aria-hidden="true">→</span>' +
        '</li>'
      );
    }).join('');

    list.querySelectorAll('.news__item').forEach(function (el) {
      el.addEventListener('click', function () { openModal(items[el.dataset.index]); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(items[el.dataset.index]); }
      });
    });
  }

  function esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── モーダル ────────────────────────────────── */
  function openModal(item) {
    modalCat.textContent   = item.category;
    modalDate.textContent  = item.date;
    modalTitle.textContent = item.title;
    modalText.textContent  = item.body;

    if (item.imageUrl) {
      modalImg.src = item.imageUrl;
      modalImg.alt = item.title;
      modalImgWrap.style.display = '';
    } else {
      modalImgWrap.style.display = 'none';
    }

    if (item.linkUrl) {
      modalLink.href          = item.linkUrl;
      modalLink.style.display = '';
    } else {
      modalLink.style.display = 'none';
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var btn = modal.querySelector('[data-news-modal-close]');
    if (btn) btn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modal.querySelectorAll('[data-news-modal-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ── データ取得 ──────────────────────────────── */
  fetch(CSV_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('fetch failed');
      return res.text();
    })
    .then(function (text) {
      renderList(toItems(parseCSV(text)));
    })
    .catch(function () {
      list.innerHTML = '<li class="news__state lang-jp">お知らせの読み込みに失敗しました。</li>';
    });

}());

