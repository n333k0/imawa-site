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
    // Intrinsic sizes are declared so the track measures correctly before the
    // images decode. Without them each img starts at zero width, the track
    // collapses, and translateX(-50%) - which is relative to the track's
    // current width - jumps as the files land, blanking the strip mid-loop.
    var LOGOS = [['directv','DIRECTV',942,180],['dgo','DGO',536,180],
                 ['dsports','DSPORTS',734,180],['torneos','Torneos',453,180],
                 ['waiken','Waiken',1248,180]];
    var SETS = 4, html = '';
    for (var h = 0; h < 2; h++) {
      for (var s = 0; s < SETS; s++) {
        for (var i = 0; i < LOGOS.length; i++) {
          var first = (h === 0 && s === 0);
          html += '<img src="assets/logos/' + LOGOS[i][0] + '.png"' +
                  ' width="' + LOGOS[i][2] + '" height="' + LOGOS[i][3] + '"' +
                  ' alt="' + (first ? LOGOS[i][1] : '') + '"' +
                  (first ? '' : ' aria-hidden="true"') + '>';
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
  var head = document.getElementById('introHead');
  var flip = null;

  function measure() {
    if (!introLogo || reduce) return;
    introLogo.style.transform = '';
    var a = introLogo.getBoundingClientRect();
    if (!a.height) return;
    var barH = hdr ? hdr.offsetHeight : 56;
    // straight up only: the mark rises until its centre reaches the bar's
    // centre, then hands off. No horizontal travel - a diagonal flight reads
    // as a sideways slide, not as the mark going up and out of the way.
    flip = { dy: -(a.top + a.height / 2 - barH / 2), s: 0.30 };
  }

  function onScroll() {
    if (!intro || !flip) return;
    var span = intro.offsetHeight - innerHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, scrollY / span)) : 1;
    function seg(a, b) { return Math.max(0, Math.min(1, (p - a) / (b - a))); }
    function smooth(x) { return x * x * (3 - 2 * x); }

    // the mark rises straight out
    var out = smooth(seg(0, 0.45));
    introLogo.style.transform =
      'translateY(' + (flip.dy * out) + 'px) scale(' + (1 + (flip.s - 1) * out) + ')';
    introLogo.style.opacity = 1 - seg(0.18, 0.44);

    // the headline arrives in the very spot it left, overlapping slightly so
    // the stage is never empty
    var inn = smooth(seg(0.34, 0.60));
    if (head) {
      head.style.opacity = inn;
      head.style.transform = 'translateY(' + (20 * (1 - inn)) + 'px)';
    }

    // the scroll cue stays through the whole intro: it balances the stage
    // under the headline the same way it did under the mark
    var barIn = p > 0.45;                          // then the menu arrives
    root.style.setProperty('--logo-op', barIn ? 1 : 0);
    if (hdr) hdr.classList.toggle('is-top', !barIn);
  }

  if (intro && introLogo && hdrLogo && !reduce) {
    root.style.setProperty('--logo-op', 0);
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

  /* the bar stays put once the intro has handed it over */

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

  /* ---------- touch: light the card crossing the middle ----------
     There is no hover on a phone, so the colour, tags and play affordance
     would never appear. The card closest to the centre of the viewport gets
     .is-active, which mirrors :hover, and loses it as it moves away. */
  var touchMQ = window.matchMedia('(max-width: 900px)');
  var lit = [].slice.call(document.querySelectorAll('.grid .card'));
  var featured = document.querySelector('.reel__frame');
  if (featured) lit.push(featured);

  function spotlight() {
    if (!lit.length) return;
    if (!touchMQ.matches) {
      for (var i = 0; i < lit.length; i++) lit[i].classList.remove('is-active');
      return;
    }
    var mid = innerHeight / 2, best = null, bestD = Infinity;
    for (var j = 0; j < lit.length; j++) {
      var el = lit[j];
      if (el.classList.contains('is-hidden')) { el.classList.remove('is-active'); continue; }
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) { el.classList.remove('is-active'); continue; }
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) { bestD = d; best = el; }
    }
    var reach = innerHeight * 0.5;
    for (var k = 0; k < lit.length; k++) {
      lit[k].classList.toggle('is-active', lit[k] === best && bestD < reach);
    }
  }

  var litTick = false;
  function queueSpotlight() {
    if (litTick) return;
    litTick = true;
    requestAnimationFrame(function () { spotlight(); litTick = false; });
  }
  window.addEventListener('scroll', queueSpotlight, { passive: true });
  window.addEventListener('resize', queueSpotlight);
  if (touchMQ.addEventListener) touchMQ.addEventListener('change', spotlight);
  window.addEventListener('load', spotlight);
  spotlight();

  /* ---------- scroll reveal ----------
     IntersectionObserver alone is not safe here: when the page jumps or
     scrolls fast its callback can be missed, and a .rv element that is never
     told to reveal stays at opacity 0 for good - an invisible portfolio.
     A throttled sweep runs alongside it and reveals anything that has reached
     the viewport, so content can never get stuck hidden. */
  var items = [].slice.call(document.querySelectorAll('.rv'));
  if (!items.length) return;
  if (reduce) { items.forEach(function (el) { el.classList.add('in'); }); return; }

  items.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
  });

  function show(el) { el.classList.add('in'); }

  function sweep() {
    var still = false;
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      if (el.classList.contains('in')) continue;
      still = true;
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.96 && r.bottom > 0) show(el);
    }
    return still;
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { show(x.target); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  var sweeping = false;
  function queueSweep() {
    if (sweeping) return;
    sweeping = true;
    requestAnimationFrame(function () { sweep(); sweeping = false; });
  }
  window.addEventListener('scroll', queueSweep, { passive: true });
  window.addEventListener('resize', queueSweep);
  window.addEventListener('load', sweep);
  sweep();
  // last resort: if anything is still hidden after the page settles, show it
  setTimeout(function () { items.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < innerHeight) show(el);
  }); }, 1200);
})();
