/* IMAWA — intro curtain, nav, work filters/views, lightbox, reveal */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- client logo marquee ----------
     Built here, and sized in pixels rather than percentages.

     The old track held 8 sets and animated to translateX(-50%). That made it
     8494px wide on desktop and 4369px on mobile - past the ~4096px texture
     limit a composited layer gets on most GPUs, which is why stretches of it
     went blank. A percentage target also re-resolves whenever the track is
     re-measured, so the loop jumped as mobile browsers grew and shrank the
     viewport under a hiding address bar.

     Now: lay down just enough sets to cover the viewport plus one spare, then
     slide by exactly one set width in px. Set two lands where set one was, so
     the loop is seamless, and the track stays far under the texture limit. */
  var track = document.getElementById('logoTrack');
  if (track) {
    var LOGOS = [['directv','DIRECTV',942,180],['dgo','DGO',536,180],
                 ['dsports','DSPORTS',734,180],['torneos','Torneos',453,180],
                 ['waiken','Waiken',1248,180]];
    var SPEED = 52;                       // px per second, steady at every width

    function buildSets(n) {
      var html = '';
      for (var s = 0; s < n; s++) {
        for (var i = 0; i < LOGOS.length; i++) {
          var first = (s === 0);
          html += '<img src="assets/logos/' + LOGOS[i][0] + '.png"' +
                  ' width="' + LOGOS[i][2] + '" height="' + LOGOS[i][3] + '"' +
                  ' alt="' + (first ? LOGOS[i][1] : '') + '"' +
                  (first ? '' : ' aria-hidden="true"') + '>';
        }
      }
      track.innerHTML = html;
    }

    function setWidth() {
      var imgs = track.children, w = 0;
      for (var i = 0; i < LOGOS.length && i < imgs.length; i++) {
        var cs = getComputedStyle(imgs[i]);
        w += imgs[i].getBoundingClientRect().width +
             parseFloat(cs.marginLeft) + parseFloat(cs.marginRight);
      }
      return w;
    }

    var built = 0, shift = 0;

    function layout() {
      if (!built) { buildSets(2); built = 2; }
      var sw = setWidth();
      if (!sw) return;
      var need = Math.max(2, Math.ceil(innerWidth / sw) + 1);
      // Only touch the DOM when something actually changed. Rebuilding
      // innerHTML tears down and recreates every img, which restarts the
      // animation and re-decodes the files - and mobile fires resize
      // constantly as the address bar hides, so an unconditional rebuild
      // made the strip stutter and look like it was still loading.
      if (need !== built) { buildSets(need); built = need; }
      if (Math.abs(sw - shift) > 0.5) {
        shift = sw;
        track.style.setProperty('--mq-shift', sw + 'px');
        track.style.setProperty('--mq-dur', (sw / SPEED) + 's');
      }
    }

    layout();
    window.addEventListener('load', layout);
    var mqW = innerWidth, mqT;
    window.addEventListener('resize', function () {
      if (innerWidth === mqW) return;      // height-only change: address bar
      mqW = innerWidth;
      clearTimeout(mqT); mqT = setTimeout(layout, 200);
    });
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
    if (!introLogo) return;
    // Reduce Motion keeps the sequence but drops the travel and the scaling:
    // an identity transform, so only the cross-fade plays.
    if (reduce) { flip = { dy: 0, s: 1 }; return; }
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
    // Measured against the pinned panel, not the window: the panel is shorter
    // than the viewport now, so the film is already peeking underneath by the
    // time the headline lands.
    var inner = intro.firstElementChild;
    var span = intro.offsetHeight - (inner ? inner.offsetHeight : innerHeight);
    var p = span > 0 ? Math.min(1, Math.max(0, scrollY / span)) : 1;
    function seg(a, b) { return Math.max(0, Math.min(1, (p - a) / (b - a))); }
    function smooth(x) { return x * x * (3 - 2 * x); }

    // Retimed so the beats land together. The peek is geometry, not script:
    // the film clears the bottom of the pinned panel at p=0.77 and is fully
    // open at p=1, so the mark leaves and the headline arrives just before
    // that, instead of finishing a third of the scroll early and leaving a
    // dead stretch in between.
    var out = smooth(seg(0, 0.48));
    introLogo.style.transform =
      'translateY(' + (flip.dy * out) + 'px) scale(' + (1 + (flip.s - 1) * out) + ')';
    introLogo.style.opacity = 1 - seg(0.20, 0.47);

    // the headline arrives in the very spot it left, overlapping slightly so
    // the stage is never empty
    var inn = smooth(seg(0.38, 0.72));
    if (head) {
      head.style.opacity = inn;
      head.style.transform = 'translateY(' + (20 * (1 - inn)) + 'px)';
    }

    // the scroll cue stays through the whole intro: it balances the stage
    // under the headline the same way it did under the mark
    var barIn = p > 0.55;                          // then the menu arrives
    root.style.setProperty('--logo-op', barIn ? 1 : 0);
    if (hdr) hdr.classList.toggle('is-top', !barIn);
  }

  if (intro && introLogo && hdrLogo) {
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
    // Silence the inline film first, or its audio plays under the one that is
    // about to open. filmCtl is a var, so it is in scope from further down.
    if (filmCtl) filmCtl.pause();
    var yt = card.dataset.yt, file = card.dataset.file, img = card.dataset.img,
        gallery = card.dataset.gallery;
    var box = lb.querySelector('.lb__box');
    box.classList.toggle('is-img', !!img);
    // Neither stills nor the gallery are 16:9, so they must not be sized by
    // the 16:9 fit formula.
    lb.classList.toggle('is-still', !!img);
    lb.classList.toggle('is-gallery', !!gallery);
    if (gallery) {
      var src = document.getElementById(gallery);
      slot.innerHTML = src ? src.innerHTML : '';
    } else if (img) {
      slot.innerHTML = '<img src="' + img + '" alt="' + (card.dataset.title || '') + '">';
    } else if (yt) {
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
    if (filmCtl) filmCtl.resume();                    // hand the room back
  }
  if (lb && grid) {
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-yt],[data-file],[data-img],[data-gallery]');
      if (c) openLb(c);
    });
    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLb(); closeNav(); } });
  }

  /* ---------- the featured film plays in place ----------
     Muted autoplay is the only kind browsers allow, and the embed is only
     created once the block is on screen and destroyed when it leaves, so the
     page costs nothing until the film is actually wanted. It is layered over
     the poster with pointer-events:none, leaving the frame a single click
     target that still opens the film with sound. Skipped under Reduce Motion,
     where the poster simply stays. */
  var filmCtl = null;
  var stage = document.querySelector('.reel__frame');
  if (stage && stage.dataset.yt && !reduce && 'IntersectionObserver' in window) {
    var player = null, mounting = false, paused = false, wantSound = false;
    /* soundTried: the automatic unmute is attempted once per mount, not on
       every playing event - loops and seeks fire plenty of those.
       soundRejected: the browser refused an unmuted start. Without this the
       two handlers below chase each other - unmute, refused, re-mute, play,
       unmute again - which is the stutter, and why sound never settled.
       Cleared by an explicit tap, which browsers do honour. */
    var soundTried = false, soundRejected = false, nudges = 0;
    var id = stage.dataset.yt, apiReady = null;

    /* Commands used to be posted straight at the iframe the moment it loaded.
       The iframe's load event fires well before the player inside it starts
       listening, so every unMute went nowhere and the film stayed silent no
       matter what had been clicked. Going through the real player API means a
       command is only ever sent after onReady, when it actually takes. */
    function loadAPI() {
      if (apiReady) return apiReady;
      apiReady = new Promise(function (done) {
        if (window.YT && window.YT.Player) { done(); return; }
        var prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
          if (typeof prev === 'function') prev();
          done();
        };
        var s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      });
      return apiReady;
    }

    /* Audio needs the browser's consent, which any interaction grants. That
       includes the click that opened the film in the lightbox - which is why
       it comes back with sound afterwards. */
    function soundAllowed() {
      if (userChose) return wantSound;          // an explicit choice wins
      return wantSound ||
        !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
    }
    function applySound(p) {
      if (!p || !p.unMute) return;
      p.unMute();
      p.setVolume(100);
    }

    function mountFilm() {
      if (player || mounting) return;
      mounting = true;
      var host = document.createElement('div');
      host.className = 'reel__video';
      var slot = document.createElement('div');
      host.appendChild(slot);
      stage.appendChild(host);

      loadAPI().then(function () {
        if (!host.isConnected) { mounting = false; host.remove(); return; }
        player = new YT.Player(slot, {
          videoId: id,
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            autoplay: 1, mute: 1, loop: 1, playlist: id, controls: 0,
            modestbranding: 1, rel: 0, playsinline: 1, disablekb: 1,
            iv_load_policy: 3, fs: 0, origin: location.origin
          },
          events: {
            onReady: function (e) {
              var f = e.target.getIframe();
              f.setAttribute('tabindex', '-1');
              f.setAttribute('aria-hidden', 'true');
              /* Start muted and only that. Unmuting here is what left phones
                 stuck on the YouTube poster: mobile refuses to begin playback
                 on an unmuted embed, so the play call was being rejected and
                 nothing ever started. Sound waits for playback to be running,
                 below. */
              e.target.mute();
              e.target.playVideo();
              host.classList.add('in');
              stage.parentElement.classList.add('is-live');
              mounting = false;
            },
            onStateChange: function (e) {
              if (paused || !player) return;
              // 1 = playing: now that it is actually running, sound is safe.
              if (e.data === 1 && !soundTried && !soundRejected &&
                  soundAllowed() && player.isMuted && player.isMuted()) {
                soundTried = true;
                applySound(player);
                wantSound = true;
                paint();
              }
              // 2 = paused. If unmuting is what stopped it, go back to muted
              // and keep playing rather than leave a silent frozen frame.
              if (e.data === 2 && player.isMuted && !player.isMuted()) {
                // It stopped while unmuted: the browser is refusing audio.
                // Settle on muted playback and let the control say so.
                soundRejected = true;
                wantSound = false;
                player.mute();
                player.playVideo();
                paint();
              }
              // -1 unstarted / 5 cued: autoplay never took. Nudge it.
              if ((e.data === -1 || e.data === 5) && nudges < 2) {
                nudges++;
                player.playVideo();
              }
            }
          }
        });
      });
    }

    function unmountFilm() {
      mounting = false;
      soundTried = false;
      nudges = 0;
      if (player) {
        try { player.destroy(); } catch (err) {}
        player = null;
      }
      var leftover = stage.querySelector('.reel__video');
      if (leftover) leftover.remove();
      stage.parentElement.classList.remove('is-live');
    }

    filmCtl = {
      pause: function () {
        paused = true;
        if (player && player.pauseVideo) player.pauseVideo();
      },
      resume: function () {
        if (!paused) return;
        paused = false;
        if (!player || !player.playVideo) return;
        player.playVideo();
        if (soundAllowed()) applySound(player);
      }
    };

    var muteBtn = document.getElementById('reelMute');

    function paint() {
      if (!muteBtn) return;
      muteBtn.setAttribute('aria-pressed', wantSound ? 'true' : 'false');
      muteBtn.setAttribute('aria-label', wantSound ? 'Turn sound off' : 'Turn sound on');
      muteBtn.classList.toggle('is-on', wantSound);
    }

    /* The automatic unmute is only there to catch the browser's consent the
       first time. It must not fire for taps on the control itself - those
       arrive as pointerdown here and as click there, so the pair read as two
       toggles and the button looked like it needed holding down. And once the
       visitor has chosen for themselves, their choice stands. */
    var userChose = false;

    function enableSound(e) {
      if (userChose) return;
      if (e && e.target && e.target.closest && e.target.closest('.reel__mute')) return;
      wantSound = true;
      if (player && !paused) applySound(player);
      paint();
    }

    /* Its own button, a sibling of the frame rather than inside it, so a tap
       here can never reach the handler that opens the film. */
    if (muteBtn) {
      muteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        userChose = true;
        // A tap is consent the browser accepts, so a past refusal no longer
        // applies.
        soundRejected = false;
        wantSound = !wantSound;
        if (player) { wantSound ? applySound(player) : player.mute(); }
        paint();
      });
    }
    paint();
    ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) {
      window.addEventListener(ev, enableSound, { passive: true });
    });

    new IntersectionObserver(function (en) {
      en.forEach(function (x) { x.isIntersecting ? mountFilm() : unmountFilm(); });
      // Low on purpose: only about 18svh of the film shows at the end of the
      // intro, so at 0.35 it would sit visible and not playing.
    }, { threshold: 0.1 }).observe(stage);
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
