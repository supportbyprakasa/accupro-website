/* Accupro International — behaviour. One dependency: Lenis (smooth scroll),
   loaded via CDN in layout.mjs's head()/footer(). Everything else is
   vanilla. */
(function () {
  'use strict';

  /* ---- smooth scroll (Lenis) -------------------------------------------
     autoRaf runs its own rAF loop; anchors:true keeps in-page hash links
     (e.g. the footer's "Our Team" → about.html#team) scrolling smoothly
     instead of jumping. Lenis already disables itself under
     prefers-reduced-motion by default, so no extra guard is needed here. */
  if (typeof Lenis !== 'undefined') {
    new Lenis({ autoRaf: true, anchors: true });
  }

  /* ---- scroll reveal -----------------------------------------------------
     Cards and row-cards fade/slide in as they enter the viewport. Guarded
     twice: the CSS only defines the hidden starting state inside
     prefers-reduced-motion:no-preference, and this script skips entirely
     for users who've asked for reduced motion — so nothing ever depends on
     JS running to become visible. */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('.card, .rowcard'));
    revealEls.forEach(function (el) { el.classList.add('reveal'); });
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---- mobile navigation ---------------------------------------------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('primary-nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('nav--open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('nav--open')) burger.click();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav--open')) burger.click();
    });
    var mq = window.matchMedia('(min-width:1025px)');
    mq.addEventListener('change', function (e) {
      if (e.matches && nav.classList.contains('nav--open')) burger.click();
    });
  }

  /* ---- homepage hero: headline/subtext/photo crossfade ------------------ */
  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero__slide'));
    var frameSlides = Array.prototype.slice.call(hero.querySelectorAll('.hero__frame-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero__dot'));
    var arrows = Array.prototype.slice.call(hero.querySelectorAll('.hero__arrow'));
    var activeIndex = 0;
    /* Only the .is-active slide is position:relative (in flow); the other two
       are position:absolute (out of flow) — so .hero__slides' height always
       tracks whichever slide is actually showing, no JS measurement needed.
       Same trick for .hero__frame-slide, so the photo crossfades in sync with
       the headline instead of sitting there static. */
    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === activeIndex);
      });
      frameSlides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === activeIndex);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.slideIndex));
      });
    });
    arrows.forEach(function (arrow) {
      arrow.addEventListener('click', function () {
        showSlide(activeIndex + (arrow.dataset.slide === 'next' ? 1 : -1));
      });
    });
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 6000);
  }

  /* ---- accordions ------------------------------------------------------ */
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });

  /* ---- service finder (home) ------------------------------------------ */
  var finder = document.getElementById('finder');
  if (finder) {
    var catSel = finder.querySelector('[name="category"]');
    var svcSel = finder.querySelector('[name="service"]');
    var all = Array.prototype.slice.call(svcSel.options);
    function syncFinder() {
      var cat = catSel.value;
      svcSel.innerHTML = '';
      all.forEach(function (o) {
        if (!o.value || !cat || o.dataset.cat === cat) svcSel.appendChild(o.cloneNode(true));
      });
      svcSel.disabled = !cat;
    }
    catSel.addEventListener('change', syncFinder);
    syncFinder();
    finder.addEventListener('submit', function (e) {
      e.preventDefault();
      var go = svcSel.value || (catSel.value ? 'services/' + catSel.value + '.html' : 'services.html');
      window.location.href = finder.dataset.base + go;
    });
  }

  /* ---- service index: search + category filter ------------------------ */
  var index = document.getElementById('service-index');
  if (index) {
    var search = document.getElementById('service-search');
    var chips = Array.prototype.slice.call(index.querySelectorAll('[data-filter]'));
    var groups = Array.prototype.slice.call(index.querySelectorAll('[data-group]'));
    var cards = Array.prototype.slice.call(index.querySelectorAll('[data-name]'));
    var empty = document.getElementById('service-empty');
    var active = 'all';

    function apply() {
      var q = (search && search.value || '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var okCat = active === 'all' || c.dataset.cat === active;
        var okQ = !q || c.dataset.name.toLowerCase().indexOf(q) > -1;
        var on = okCat && okQ;
        c.hidden = !on;
        if (on) shown++;
      });
      groups.forEach(function (g) {
        g.hidden = !g.querySelectorAll('[data-name]:not([hidden])').length;
      });
      if (empty) empty.hidden = shown > 0;
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        active = chip.dataset.filter;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        apply();
      });
    });
    if (search) {
      search.addEventListener('input', apply);
      var form = search.closest('form');
      if (form) form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    }
    apply();
  }

  /* ---- contact form: front-end validation only ------------------------
     No endpoint is wired up. Point action= at your handler, or let the
     developer connect it to WordPress / an email service. See README.     */
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var note = form.querySelector('[data-form-note]');
      if (note) {
        note.hidden = false;
        note.textContent = 'Form is valid. No submit endpoint is connected yet — see README.md.';
      }
    });
  });

  /* ---- mark current year ---------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
