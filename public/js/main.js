/* =========================================================
   Enclume numérique — interactions
   ========================================================= */
(() => {
  'use strict';

  /* Adresse de réception des messages du formulaire (à adapter). */
  const CONTACT_EMAIL = 'mohhamroun@gmail.com';

  document.documentElement.classList.remove('no-js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Année du pied de page ---------- */
  const annee = document.getElementById('annee');
  if (annee) annee.textContent = new Date().getFullYear();

  /* ---------- En-tête : ombre au défilement ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav-principale');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    nav.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Apparition au défilement ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Lien de navigation actif ---------- */
  const links = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Étincelles de forge (hero) ---------- */
  const canvas = document.querySelector('.sparks');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let w = 0, h = 0, dpr = 1, sparks = [], running = true, rafId = null;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = () => ({
      x: w * (0.55 + Math.random() * 0.35),
      y: h + 10,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(1.2 + Math.random() * 2.6),
      life: 0,
      max: 120 + Math.random() * 160,
      r: 0.6 + Math.random() * 1.8,
      hue: 18 + Math.random() * 22,
    });

    const tick = () => {
      if (!running) { rafId = null; return; }
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      const target = w < 700 ? 35 : 70;
      if (sparks.length < target && Math.random() < 0.6) sparks.push(spawn());

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        s.vx += (Math.random() - 0.5) * 0.08;
        s.vy *= 0.995;
        s.x += s.vx;
        s.y += s.vy;
        const t = 1 - s.life / s.max;
        if (t <= 0 || s.y < -20) { sparks.splice(i, 1); continue; }
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
        g.addColorStop(0, `hsla(${s.hue}, 100%, 70%, ${0.9 * t})`);
        g.addColorStop(1, `hsla(${s.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      rafId = requestAnimationFrame(tick);
    };

    const start = () => { running = true; if (!rafId) rafId = requestAnimationFrame(tick); };
    const stop = () => { running = false; };

    resize();
    window.addEventListener('resize', resize);
    // N'anime que lorsque le hero est visible et l'onglet actif.
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* ---------- Formulaire de contact (via le client de messagerie) ---------- */
  document.querySelectorAll('[data-contact-email]').forEach((a) => {
    a.href = 'mailto:' + CONTACT_EMAIL;
    a.textContent = CONTACT_EMAIL;
  });

  const form = document.getElementById('contact-form');

  /* Liens « data-sujet » : pré-sélectionnent le sujet du formulaire. */
  document.querySelectorAll('[data-sujet]').forEach((a) => {
    a.addEventListener('click', () => {
      const select = form && form.elements.sujet;
      if (!select) return;
      const opt = [...select.options].find((o) => o.text === a.dataset.sujet);
      if (opt) select.value = opt.value;
    });
  });
  if (form) {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach((field) => {
        const valid = field.checkValidity() && field.value.trim() !== '';
        field.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        status.textContent = 'Merci de compléter les champs obligatoires (nom, courriel valide, message).';
        status.className = 'form-status error';
        return;
      }
      const d = Object.fromEntries(new FormData(form));
      const subject = `[Site] ${d.sujet} — ${d.nom}`;
      const body = `Nom : ${d.nom}\nOrganisation : ${d.organisation || '—'}\nCourriel : ${d.email}\n\n${d.message}`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = 'Votre messagerie va s\'ouvrir avec le message pré-rempli. Merci !';
      status.className = 'form-status success';
    });
    form.addEventListener('input', (e) => e.target.classList.remove('invalid'));
  }
})();
