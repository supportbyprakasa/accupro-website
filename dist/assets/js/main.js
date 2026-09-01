/* Accupro International — behaviour. No dependencies. */
(function () {
  'use strict';

  /* ---- mobile navigation ---------------------------------------------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('primary-nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('nav--open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? burger.dataset.closeLabel : burger.dataset.menuLabel);
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

  /* ---- home hero slider ------------------------------------------------- */
  document.querySelectorAll('[data-hero-slider]').forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var bgSlides = Array.prototype.slice.call(root.querySelectorAll('.hero-bg-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) return;
    var i = 0, timer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, idx) {
        var on = idx === i;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
        var focusable = s.querySelectorAll('a, button');
        focusable.forEach(function (el) { el.tabIndex = on ? 0 : -1; });
      });
      bgSlides.forEach(function (s, idx) {
        var on = idx === i;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
      });
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === i);
        d.setAttribute('aria-selected', String(idx === i));
      });
    }
    function next() { show(i + 1); }
    function prev() { show(i - 1); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { if (!reduceMotion) { stop(); timer = setInterval(next, 6000); } }

    var prevBtn = root.querySelector('[data-hero-prev]');
    var nextBtn = root.querySelector('[data-hero-next]');
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); start(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); start(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { show(Number(d.dataset.heroDot)); start(); });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    start();
  });

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
