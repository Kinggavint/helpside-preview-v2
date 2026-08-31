// Helpside v2 - motion + interactions
(function(){
  'use strict';

  // ── Smooth scroll for anchor links ──────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor){
    anchor.addEventListener('click', function(e){
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Intersection Observer: fade-in-up for cards, sections, headings ─────────
  var animateEls = document.querySelectorAll(
    '.reveal, .card, .feature-card, .service-card, .team-card, ' +
    '.pricing-card, .testimonial-card, .animate-on-scroll, ' +
    'h1, h2, h3, section > p, .section-intro'
  );

  if ('IntersectionObserver' in window && animateEls.length) {
    // Add base class for CSS animation hooks
    animateEls.forEach(function(el){
      if (!el.classList.contains('no-animate')) {
        el.classList.add('animate-ready');
      }
    });

    var animateIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          // Stagger siblings slightly if inside a grid/flex parent
          var siblings = entry.target.parentElement
            ? entry.target.parentElement.querySelectorAll('.animate-ready')
            : [];
          var idx = Array.prototype.indexOf.call(siblings, entry.target);
          var delay = Math.min(idx * 60, 300);

          setTimeout(function(){
            entry.target.classList.add('animate-in');
            entry.target.classList.add('is-visible');
          }, delay);

          animateIo.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.07
    });

    animateEls.forEach(function(el){
      animateIo.observe(el);
    });
  }

  // ── Reveal on scroll (legacy .reveal class support) ──────────────────────────
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.add('animate-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    reveals.forEach(function(el){ io.observe(el); });
  }

  // ── Hero parallax ────────────────────────────────────────────────────────────
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var heroPhoto = document.querySelector('.hero__photo img');
  if (heroPhoto && !prefersReducedMotion) {
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      if (y < window.innerHeight) {
        var scale = 1.02 + Math.min(y / window.innerHeight, 1) * 0.06;
        heroPhoto.style.transform = 'scale(' + scale.toFixed(3) + ') translateY(' + (y * 0.15) + 'px)';
      }
    }, { passive: true });
  }

  // ── Hero section parallax overlay depth ─────────────────────────────────────
  var heroSections = document.querySelectorAll('.hero, .hero-overlay, [class*="hero"]');
  if (heroSections.length && !prefersReducedMotion) {
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      heroSections.forEach(function(hero){
        var rect = hero.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          var offset = y * 0.25;
          hero.style.backgroundPositionY = offset + 'px';
        }
      });
    }, { passive: true });
  }

  // ── Nav toggle ───────────────────────────────────────────────────────────────
  var toggle = document.querySelector('.nav-toggle');
  var navInner = document.querySelector('.site-nav__inner');
  if (toggle && navInner) {
    toggle.addEventListener('click', function(){
      navInner.classList.toggle('open');
    });
  }

  // ── Scroll-aware navbar (add class when scrolled) ────────────────────────────
  var siteHeader = document.querySelector('.site-header, header');
  if (siteHeader) {
    var onHeaderScroll = function(){
      if (window.scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  // ── Stat counter ─────────────────────────────────────────────────────────────
  var stats = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && stats.length && !prefersReducedMotion) {
    var countIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseFloat(el.dataset.count);
          var suffix = el.dataset.suffix || '';
          var duration = 1400;
          var start = performance.now();
          function tick(now){
            var t = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            var val = Math.round(target * eased);
            el.textContent = val + suffix;
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          countIo.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    stats.forEach(function(el){ countIo.observe(el); });
  }

  // ── Slideshow (photo carousel) ───────────────────────────────────────────────
  var track = document.getElementById('slideshow-track');
  var prevBtn = document.querySelector('[data-slide-prev]');
  var nextBtn = document.querySelector('[data-slide-next]');
  if (track && prevBtn && nextBtn) {
    var slideStep = function(){
      var first = track.querySelector('.slideshow__slide');
      return first ? first.getBoundingClientRect().width + 24 : 400;
    };
    prevBtn.addEventListener('click', function(){
      track.scrollBy({ left: -slideStep(), behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', function(){
      track.scrollBy({ left: slideStep(), behavior: 'smooth' });
    });
  }

  // ── Chat launcher ────────────────────────────────────────────────────────────
  var chatBtn = document.getElementById('chat-launcher');
  var chatModal = document.getElementById('chat-modal');
  if (chatBtn && chatModal) {
    chatBtn.addEventListener('click', function(){
      var open = chatModal.classList.toggle('open');
      chatBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      chatModal.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && chatModal.classList.contains('open')) {
        chatModal.classList.remove('open');
        chatBtn.setAttribute('aria-expanded', 'false');
        chatModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ── Accessibility toolbar ────────────────────────────────────────────────────
  var a11yButtons = document.querySelectorAll('[data-a11y]');
  var htmlEl = document.documentElement;
  var A11Y_KEY = 'helpside_a11y_prefs';
  var prefs = { textSize: 0, contrast: false, motion: false };
  try {
    var stored = localStorage.getItem(A11Y_KEY);
    if (stored) prefs = JSON.parse(stored);
  } catch(e) {}

  function applyA11y(){
    htmlEl.classList.remove('a11y-large-text', 'a11y-xl-text');
    if (prefs.textSize === 1) htmlEl.classList.add('a11y-large-text');
    else if (prefs.textSize === 2) htmlEl.classList.add('a11y-xl-text');
    htmlEl.classList.toggle('a11y-high-contrast', !!prefs.contrast);
    htmlEl.classList.toggle('a11y-reduce-motion', !!prefs.motion);

    a11yButtons.forEach(function(btn){
      var kind = btn.getAttribute('data-a11y');
      if (kind === 'text-size') btn.setAttribute('aria-pressed', prefs.textSize > 0 ? 'true' : 'false');
      if (kind === 'contrast') btn.setAttribute('aria-pressed', prefs.contrast ? 'true' : 'false');
      if (kind === 'motion') btn.setAttribute('aria-pressed', prefs.motion ? 'true' : 'false');
    });

    try { localStorage.setItem(A11Y_KEY, JSON.stringify(prefs)); } catch(e) {}
  }

  a11yButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      var kind = btn.getAttribute('data-a11y');
      if (kind === 'text-size') prefs.textSize = (prefs.textSize + 1) % 3;
      else if (kind === 'contrast') prefs.contrast = !prefs.contrast;
      else if (kind === 'motion') prefs.motion = !prefs.motion;
      applyA11y();
    });
  });
  if (a11yButtons.length) applyA11y();

  // ── Language switcher (visual highlight only) ────────────────────────────────
  var langButtons = document.querySelectorAll('.lang-switch a');
  langButtons.forEach(function(a){
    a.addEventListener('click', function(){
      langButtons.forEach(function(b){ b.removeAttribute('aria-current'); });
      a.setAttribute('aria-current', 'true');
    });
  });

  // ── Card hover micro-interactions ────────────────────────────────────────────
  var cards = document.querySelectorAll(
    '.card, .feature-card, .service-card, .team-card, .pricing-card, .testimonial-card'
  );
  cards.forEach(function(card){
    card.addEventListener('mouseenter', function(){
      this.style.willChange = 'transform, box-shadow';
    });
    card.addEventListener('mouseleave', function(){
      this.style.willChange = 'auto';
    });
  });

  // ── Link underline animation trigger ────────────────────────────────────────
  // Applied via CSS, but ensure .animated-link class is present on nav links
  document.querySelectorAll('.site-nav a, .footer-nav a').forEach(function(link){
    if (!link.classList.contains('btn') && !link.classList.contains('button')) {
      link.classList.add('animated-link');
    }
  });

})();