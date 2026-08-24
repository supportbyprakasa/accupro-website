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
