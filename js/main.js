/* IMAWA — intro curtain, nav, work filters/views, lightbox, reveal */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- client logo marquee ----------
     Built here so the track always holds enough repeats to exceed the
     viewport; a short track leaves a gap and the logos appear to vanish. */
  var track = document.getElementById('logoTrack');
  if (track) {
    var LOGOS = [['directv','DIRECTV'],['dgo','DGO'],['dsports','DSPORTS'],
                 ['torneos','Torneos'],['waiken','Waiken']];
    var SETS = 4, html = '';
    for (var h = 0; h < 2; h++) {
      for (var s = 0; s < SETS; s++) {
        for (var i = 0; i < LOGOS.length; i++) {
          var first = (h === 0 && s === 0);
          html += '<img src="assets/logos/' + LOGOS[i][0] + '.png" alt="' +
                  (first ? LOGOS[i][1] : '') + '"' + (first ? '' : ' aria-hidden="true"') + '>';
        }
      }
    }
    track.innerHTML = html;
  }

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  var hdr = document.querySelector('.hdr');
  function setNavTop() { if (hdr) root.style.setProperty('--navtop', hdr.offsetHeight + 'px'); }
  setNavTop(); window.addEventListener('resize', setNavTop);
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open'); document.body.classList.remove('nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    window.addEventListener('resize', function () { if (innerWidth > 900) closeNav(); });
  }

  /* ---------- intro curtain -> nav bar ---------- */
  var intro = document.getElementById('intro');
  var introLogo = document.getElementById('introLogo');
  var hdrLogo = document.querySelector('.hdr .logo img');
  var sub = document.querySelector('.intro__sub');
  var sd = document.querySelector('.scrolldown');
  var flip = null;

  function measure() {
    if (!introLogo || !hdrLogo || reduce) return;
    introLogo.style.transform = '';
    var a = introLogo.getBoundingClientRect(), b = hdrLogo.getBoundingClientRect();
    if (!a.width || !b.width) return;
    // the bar starts translated off the top, so its logo measures above the
    // viewport; add the bar height back to get the real landing position
    var off = hdr && hdr.classList.contains('is-top') ? hdr.offsetHeight : 0;
    flip = {
      dx: (b.left + b.width / 2) - (a.left + a.width / 2),
      dy: (b.top + off + b.height / 2) - (a.top + a.height / 2),
      s: b.width / a.width
    };
  }

  function onScroll() {
    if (!intro || !flip) return;
    var span = intro.offsetHeight - innerHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, scrollY / span)) : 1;
    var e = p * p * (3 - 2 * p);                       // smoothstep
    introLogo.style.transform =
      'translate(' + (flip.dx * e) + 'px,' + (flip.dy * e) + 'px) scale(' + (1 + (flip.s - 1) * e) + ')';
    var fade = Math.max(0, 1 - p * 3);                 // sub + cue leave early
    if (sub) sub.style.opacity = fade;
    if (sd) sd.style.opacity = fade;
    var landed = p > 0.97;
    introLogo.style.opacity = landed ? 0 : 1;          // hand off to the real nav logo
    root.style.setProperty('--logo-op', landed ? 1 : 0);
    if (hdr) hdr.classList.toggle('is-top', !landed);  // bar drops in behind it
  }

  if (intro && introLogo && hdrLogo && !reduce) {
    root.style.setProperty('--logo-op', 0);
    hdr.classList.add('is-top');
    var imgs = [introLogo, hdrLogo];
    var pending = imgs.filter(function (i) { return !i.complete; }).length;
    function ready() { if (--pending <= 0 || true) { measure(); onScroll(); } }
    imgs.forEach(function (i) { i.complete ? null : i.addEventListener('load', ready); });
    measure(); onScroll();
    window.addEventListener('load', function () { measure(); onScroll(); });
    window.addEventListener('resize', function () { measure(); onScroll(); });
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () { onScroll(); tick = false; });
    }, { passive: true });
  }

  /* ---------- header hides on scroll, but never over the intro ---------- */
  if (hdr && !reduce) {
    var last = 0;
    window.addEventListener('scroll', function () {
      var y = scrollY;
      var overIntro = intro && y < intro.offsetHeight - innerHeight;
      if (nav && nav.classList.contains('open')) return;
      if (!overIntro) hdr.classList.toggle('is-hidden', y > last && y > 220);
      last = y;
    }, { passive: true });
  }

  /* ---------- work: filters + view switcher ---------- */
  var grid = document.querySelector('.grid[data-view]');
  var chips = document.querySelector('.chips');
  var views = document.querySelector('.viewbar');
  if (grid && chips) {
    var cards = [].slice.call(grid.querySelectorAll('.card[data-cat]'));
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]'); if (!b) return;
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
      var b = e.target.closest('button[data-view-set]'); if (!b) return;
      grid.dataset.view = b.dataset.viewSet;
      views.querySelectorAll('button').forEach(function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      try { localStorage.setItem('imawa-view', b.dataset.viewSet); } catch (err) {}
    });
    try {
      var saved = localStorage.getItem('imawa-view');
      if (saved) { var t = views.querySelector('[data-view-set="' + saved + '"]'); if (t) t.click(); }
    } catch (err) {}
  }

  /* ---------- lightbox: YouTube embed or self-hosted file ---------- */
  var lb = document.getElementById('lb'), slot = document.getElementById('lbSlot'),
      lbTitle = document.getElementById('lbTitle'), lbClose = document.getElementById('lbClose');
  function openLb(card) {
    var yt = card.dataset.yt, file = card.dataset.file;
    if (yt) {
      slot.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + yt +
        '?autoplay=1&rel=0&modestbranding=1" title="' + (card.dataset.title || '') +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    } else if (file) {
      slot.innerHTML = '<video src="' + file + '" controls autoplay playsinline preload="metadata"></video>';
    } else return;
    lbTitle.textContent = card.dataset.title || '';
    lb.classList.add('open'); document.body.classList.add('lb-open');
    lbClose.focus();
  }
  function closeLb() {
    if (!lb.classList.contains('open')) return;
    slot.innerHTML = '';                              // clearing stops playback
    lb.classList.remove('open'); document.body.classList.remove('lb-open');
  }
  if (lb && grid) {
    document.addEventListener('click', function (e) {
      var c = e.target.closest('.card[data-yt],.card[data-file]');
      if (c) openLb(c);
    });
    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLb(); closeNav(); } });
  }

  /* ---------- scroll reveal ---------- */
  var items = document.querySelectorAll('.rv');
  if (!items.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); }); return;
  }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms'; io.observe(el);
  });
})();
