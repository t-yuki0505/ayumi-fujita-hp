/* ─────────────────────────────────────────────────────────
   ayumi fujita — Floral Artist HP
   Vanilla JS for interactivity
   ───────────────────────────────────────────────────────── */
(function () {
  'use strict';

  // ─── Mobile Menu ─────────────────────────────────────────
  const menuOpen = document.querySelector('[data-menu-open]');
  const menuClose = document.querySelector('[data-menu-close]');
  const menu = document.querySelector('[data-menu]');

  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  }
  menuOpen && menuOpen.addEventListener('click', openMenu);
  menuClose && menuClose.addEventListener('click', closeMenu);
  // 内側のリンクをクリックしたら閉じる
  menu && menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  // ─── Reveal on scroll ────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  // ─── Work category filter ────────────────────────────────
  const filterNav = document.querySelector('[data-filter-nav]');
  const worksGrid = document.querySelector('[data-works-grid]');
  if (filterNav && worksGrid) {
    filterNav.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      const filter = btn.dataset.filter;
      // toggle active chip
      filterNav.querySelectorAll('[data-filter]').forEach(function (b) {
        b.classList.toggle('is-on', b === btn);
      });
      // filter cards
      worksGrid.querySelectorAll('.work-card').forEach(function (card) {
        const cat = card.dataset.cat;
        card.style.display = (filter === 'ALL' || cat === filter) ? '' : 'none';
      });
    });
  }

  // ─── FAQ accordion (single-open) ─────────────────────────
  const faqList = document.querySelector('[data-faq-list]');
  if (faqList) {
    faqList.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-faq-toggle]');
      if (!btn) return;
      const li = btn.closest('li');
      const isOpen = li.classList.contains('is-open');
      // close all
      faqList.querySelectorAll('li').forEach(function (item) {
        item.classList.remove('is-open');
        const ind = item.querySelector('.ind');
        if (ind) ind.textContent = '+';
      });
      // open clicked (if was closed)
      if (!isOpen) {
        li.classList.add('is-open');
        const ind = li.querySelector('.ind');
        if (ind) ind.textContent = '−';
      }
    });
  }

  // ─── Work image modal ───────────────────────────────────
  const workModal = document.querySelector('[data-work-modal]');
  const workModalImg = document.querySelector('[data-work-modal-img]');
  const workModalCaption = document.querySelector('[data-work-modal-caption]');

  function openWorkModal(img) {
    if (!workModal || !workModalImg || !img) return;
    workModalImg.src = img.currentSrc || img.src;
    workModalImg.alt = img.alt || '';
    if (workModalCaption) workModalCaption.textContent = img.alt || '';
    workModal.classList.add('is-open');
    workModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = workModal.querySelector('[data-work-modal-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closeWorkModal() {
    if (!workModal || !workModalImg) return;
    workModal.classList.remove('is-open');
    workModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    workModalImg.removeAttribute('src');
  }

  if (worksGrid && workModal) {
    worksGrid.querySelectorAll('.work-card .ph img').forEach(function (img) {
      const frame = img.closest('.ph');
      if (!frame) return;
      frame.setAttribute('role', 'button');
      frame.setAttribute('tabindex', '0');
      frame.setAttribute('aria-label', '画像を拡大表示: ' + (img.alt || '作品画像'));
      frame.addEventListener('click', function () { openWorkModal(img); });
      frame.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openWorkModal(img);
        }
      });
    });
    workModal.querySelectorAll('[data-work-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeWorkModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && workModal.classList.contains('is-open')) closeWorkModal();
    });
  }

})();
