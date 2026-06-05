/**
 * 知多なおゆきサポート - LP JavaScript
 * =========================================
 * - スクロールアニメーション（Intersection Observer）
 * - フッター著作権年自動更新
 * - ヘッダースクロール時スタイル変化
 * - 固定CTAのフェードイン
 * - スムーズスクロール（アンカーリンク）
 */

'use strict';

/* =========================================
   フッター：著作権年
========================================= */
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* =========================================
   スクロールアニメーション
========================================= */
(function initReveal() {
  const selectors = [
    '.trouble-item',
    '.value-card',
    '.service-category',
    '.case-card',
    '.flow-step',
    '.faq-item',
    '.pricing-example',
    '.pricing-overview',
    '.section-header',
    '.hero-profile',
    '.troubles-cta-text',
    '.philosophy-note',
    '.services-note',
    '.final-cta-inner',
  ];

  const elements = document.querySelectorAll(selectors.join(','));
  elements.forEach(function (el) { el.classList.add('reveal'); });

  // reduced-motion または非対応ブラウザは即表示
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.from(el.parentElement.children);
        const index = siblings.indexOf(el);
        const delay = Math.min(index * 60, 360);
        setTimeout(function () {
          el.classList.add('is-visible');
        }, delay);
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) { observer.observe(el); });
})();

/* =========================================
   ヘッダー：スクロール時スタイル変化
========================================= */
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        header.style.boxShadow = window.scrollY > 60
          ? '0 2px 16px rgba(0,0,0,.12)'
          : '';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* =========================================
   固定CTA：スクロール後にフェードイン
========================================= */
(function initFixedCta() {
  const cta = document.querySelector('.fixed-cta');
  if (!cta) return;

  cta.style.transition = 'opacity .3s ease, transform .3s ease';
  cta.style.opacity = '0';
  cta.style.transform = 'translateY(100%)';

  let shown = false;

  function check() {
    if (!shown && window.scrollY > 200) {
      cta.style.opacity = '1';
      cta.style.transform = 'translateY(0)';
      shown = true;
    }
  }

  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* =========================================
   スムーズスクロール（アンカーリンク）
========================================= */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const headerH = (document.querySelector('.site-header') || {}).offsetHeight || 0;
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 8;

      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });
})();
