/* IMAWA — nav, work views/filters, hover demo, scroll reveal */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  var hdr = document.querySelector('.hdr');

  function setNavTop() {
    if (hdr) document.documentElement.style.setProperty('--navtop', hdr.offsetHeight + 'px');
  }
  setNavTop();
  window.addEventListener('resize', setNavTop);

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- header hide on scroll down ---------- */
  if (hdr && !reduce) {
    var last = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      hdr.classList.toggle('is-stuck', y > 8);
      if (nav && nav.classList.contains('open')) return;
      hdr.classList.toggle('is-hidden', y > last && y > 220);
      last = y;
    }, { passive: true });
  }

  /* ---------- work: category filter + view switcher ---------- */
  var grid = document.querySelector('.grid[data-view]');
  var chips = document.querySelector('.chips');
  var views = document.querySelector('.viewbar');

  if (grid && chips) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card[data-cat]'));
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (!b) return;
      var want = b.dataset.filter;
      chips.querySelectorAll('button').forEach(function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      cards.forEach(function (c) {
        c.classList.toggle('is-hidden', !(want === 'all' || c.dataset.cat === want));
      });
    });
  }

  if (grid && views) {
    views.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-view-set]');
      if (!b) return;
      grid.dataset.view = b.dataset.viewSet;
      views.querySelectorAll('button').forEach(function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      try { localStorage.setItem('imawa-view', b.dataset.viewSet); } catch (err) {}
    });
    // restore last chosen view
    try {
      var saved = localStorage.getItem('imawa-view');
      if (saved) {
        var target = views.querySelector('[data-view-set="' + saved + '"]');
        if (target) target.click();
      }
    } catch (err) {}
  }

  /* ---------- scroll reveal ---------- */
  var items = document.querySelectorAll('.rv');
  if (!items.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
    io.observe(el);
  });
})();
