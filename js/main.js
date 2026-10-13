/* ============================================================
   STACKEDBYDAN.DEV — Main JS
   ============================================================ */

/* ── Matrix Rain ─────────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) {
    canvas.remove();
    return;
  }
  const ctx = canvas.getContext('2d');
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/\\~`';
  let cols, drops;
  const FONT_SIZE = 14;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / FONT_SIZE);
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(10,10,10,0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = FONT_SIZE + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FONT_SIZE, drops[i] * FONT_SIZE);
      if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  let timer = null;
  function start() { if (!timer) timer = setInterval(draw, 66); }
  function stop()  { clearInterval(timer); timer = null; }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
})();


/* ── Terminal Boot Sequence ──────────────────────────────────── */
(function () {
  const el = document.getElementById('terminal-output');
  if (!el) return;

  if (!el.offsetParent) return; // terminal is hidden on small screens

  const SEQ = [
    { type: 'cmd',    text: '$ wrangler deploy' },
    { type: 'load',   label: 'Building site       ', tag: 'OK' },
    { type: 'load',   label: 'Uploading to Pages  ', tag: 'OK' },
    { type: 'load',   label: 'Workers API         ', tag: 'OK' },
    { type: 'load',   label: 'Turnstile + headers ', tag: 'OK' },
    { type: 'blank' },
    { type: 'cmd',    text: '$ whoami' },
    { type: 'out',    text: 'NAME     : Daniel Golding' },
    { type: 'out',    text: 'DOES     : Websites, web apps, APIs' },
    { type: 'out',    text: 'PLATFORM : Cloudflare Workers, Pages,' },
    { type: 'out',    text: '           D1, KV, R2, Durable Objects' },
    { type: 'out',    text: 'PRICES   : Websites from £249' },
    { type: 'green',  text: 'STATUS   : ● Taking on projects' },
    { type: 'blank' },
    { type: 'cursor', text: '$ ' },
  ];

  const DELAYS = { system: 0, blank: 40, cmd: 220, load: 140, out: 60, green: 60, hl: 80, cursor: 40 };

  let idx = 0;
  function next() {
    if (idx >= SEQ.length) return;
    const item = SEQ[idx++];
    const div = document.createElement('div');

    switch (item.type) {
      case 'system':
        div.className = 't-system'; div.textContent = item.text; break;
      case 'blank':
        div.className = 't-blank'; break;
      case 'cmd':
        div.className = 't-cmd'; div.textContent = item.text; break;
      case 'load': {
        div.className = 't-loading';
        const dots = '.'.repeat(Math.max(0, 24 - item.label.length));
        div.innerHTML = `<span>${item.label}${dots}</span><span class="ok">[ ${item.tag} ]</span>`;
        break;
      }
      case 'out':
        div.className = 't-output'; div.textContent = item.text; break;
      case 'green':
        div.className = 't-green'; div.textContent = item.text; break;
      case 'hl':
        div.className = 't-hl'; div.textContent = item.text; break;
      case 'cursor':
        div.className = 't-cursor';
        div.innerHTML = item.text + '<span class="cursor-blink">_</span>';
        break;
    }

    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    setTimeout(next, DELAYS[item.type] || 80);
  }

  setTimeout(next, 200);
})();


/* ── Navbar Scroll & Active ──────────────────────────────────── */
(function () {
  const nav   = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');
  const secs  = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }

    if (secs.length === 0) return;

    let current = '';
    secs.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });

    // Near bottom of page — force last section active
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 60 && secs.length > 0) {
      current = secs[secs.length - 1].id;
    }
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
})();


/* ── Mobile Nav Toggle ───────────────────────────────────────── */
(function () {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ── Skill Bars (IntersectionObserver) ───────────────────────── */
(function () {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animated');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  fills.forEach(f => obs.observe(f));
})();


/* ── Reveal on Scroll ────────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach(el => obs.observe(el));
})();


/* ── Cookie Consent ──────────────────────────────────────────── */
(function () {
  let banner = document.getElementById('cookie-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="cookie-content">
        <span class="prompt" aria-hidden="true">&gt;&nbsp;</span>
        <p>This site uses cookies to analyse traffic and improve your experience.
          <a href="/cookie-policy">Cookie Policy</a> &nbsp;|&nbsp;
          <a href="/privacy-policy">Privacy Policy</a>
        </p>
      </div>
      <div class="cookie-actions">
        <button id="accept-cookies" class="btn btn-primary">Accept all</button>
        <button id="decline-cookies" class="btn btn-ghost">Decline</button>
      </div>
    `;
    document.body.appendChild(banner);
  }

  const accept  = document.getElementById('accept-cookies');
  const decline = document.getElementById('decline-cookies');
  const manage  = document.getElementById('manage-cookies');

  let stored = null;
  try { stored = localStorage.getItem('cookie-consent'); } catch (e) {}
  if (!stored) {
    setTimeout(() => banner.classList.add('visible'), 1200);
  } else {
    banner.classList.add('hidden');
  }

  function dismiss(val) {
    try { localStorage.setItem('cookie-consent', val); } catch (e) {}
    banner.classList.remove('visible');
    setTimeout(() => banner.classList.add('hidden'), 400);
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'analytics_storage': val === 'accepted' ? 'granted' : 'denied'
      });
    }
  }

  function showBanner() {
    try { localStorage.removeItem('cookie-consent'); } catch (e) {}
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('visible'), 50);
  }

  accept?.addEventListener('click',  () => dismiss('accepted'));
  decline?.addEventListener('click', () => dismiss('declined'));
  manage?.addEventListener('click',  (e) => { e.preventDefault(); showBanner(); });
})();


/* ── Contact Form (Web3Forms) ────────────────────────────────── */
(function () {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = '';

    try {
      const data = Object.fromEntries(new FormData(form));
      const res  = await fetch('https://api.stackedbydan.dev/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data)
      });
      const json = await res.json();

      if (res.ok && json.success) {
        status.className = 'form-status success';
        status.textContent = '> Message sent. I\'ll reply within 24 hours.';
        form.reset();
        if (typeof gtag === 'function') {
          gtag('event', 'qualify_lead', {
            event_category: 'Contact Form',
            event_label: data.project || 'General',
          });
        }
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    } catch (err) {
      status.className = 'form-status error';
      status.textContent = '> Sorry, that didn\'t send (' + (err.message || 'network error') + '). Please email hello@stackedbydan.dev directly.';
    } finally {
      btn.textContent = 'Send message';
      btn.disabled = false;
    }
  });
})();


/* ── Footer Year ─────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ── FAQ Accordion ───────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (typeof gtag === 'function') {
          const question = btn.textContent.replace('+', '').trim();
          gtag('event', 'faq_open', { event_label: question });
        }
      }
    });
  });
})();


/* ── Scroll Progress Bar ─────────────────────────────────────── */
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max  = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }, { passive: true });
})();


/* ── Stat Counter ────────────────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const step   = Math.max(1, Math.floor(duration / target));
      let current  = 0;
      const timer  = setInterval(() => {
        current++;
        el.textContent = current;
        if (current >= target) { el.textContent = target; clearInterval(timer); }
      }, step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();


/* ── Back to Top ─────────────────────────────────────────────── */
(function () {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ── Analytics Event Tracking ────────────────────────────────── */
(function () {
  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }

  // Hero CTA clicks
  document.querySelectorAll('.hero-cta .btn').forEach(btn => {
    btn.addEventListener('click', () =>
      track('hero_cta_click', { event_label: btn.textContent.trim() })
    );
  });

  // Package interest — which plan CTA was clicked
  document.querySelectorAll('.pricing-card').forEach(card => {
    const plan = card.dataset.plan || card.querySelector('.pricing-tier')?.textContent?.trim() || 'Unknown';
    card.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () =>
        track('package_interest', { event_label: plan })
      );
    });
  });

  // Demo site clicks
  document.querySelectorAll('.pricing-demo, .demos-grid a').forEach(link => {
    link.addEventListener('click', () =>
      track('demo_click', { event_label: link.textContent.trim() })
    );
  });

  // Email link click
  document.querySelector('a[href^="mailto:"]')?.addEventListener('click', () =>
    track('email_click')
  );

  // LinkedIn click
  document.querySelector('a[href*="linkedin.com"]')?.addEventListener('click', () =>
    track('linkedin_click')
  );

  // Nav link clicks — which section
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () =>
      track('nav_click', { event_label: link.getAttribute('href') })
    );
  });

  // Cookie consent
  document.getElementById('accept-cookies')?.addEventListener('click', () =>
    track('cookie_consent', { event_label: 'accepted' })
  );
  document.getElementById('decline-cookies')?.addEventListener('click', () =>
    track('cookie_consent', { event_label: 'declined' })
  );

  // Back to top click
  document.getElementById('back-to-top')?.addEventListener('click', () =>
    track('back_to_top')
  );

  // Scroll depth — 25 / 50 / 75 / 100%
  const depthsFired = new Set();
  window.addEventListener('scroll', () => {
    const pct = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    [25, 50, 75, 100].forEach(d => {
      if (pct >= d && !depthsFired.has(d)) {
        depthsFired.add(d);
        track('scroll_depth', { event_label: d + '%' });
      }
    });
  }, { passive: true });

  // Section visibility — fires once per section when scrolled into view
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        track('section_view', { event_label: e.target.id });
        secObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('section[id]').forEach(s => secObs.observe(s));

})();


/* ── Contact form: prefill project type ──────────────────────── */
(function () {
  const select = document.getElementById('project');
  if (!select) return;

  function choose(value) {
    const opt = Array.from(select.options).find(o => o.value === value);
    if (opt) select.value = opt.value;
  }

  // From pricing buttons: <a href="#contact" data-project="Growth — £499">
  document.querySelectorAll('[data-project]').forEach(btn => {
    btn.addEventListener('click', () => choose(btn.dataset.project));
  });

  // From other pages: /?project=cloudflare#contact
  const param = new URLSearchParams(location.search).get('project');
  if (param === 'cloudflare') choose('Cloudflare work');
  else if (param === 'audit') choose('Website audit');
})();


/* ── Turnstile: load only when the contact form is near ──────── */
(function () {
  const widget = document.querySelector('.cf-turnstile');
  if (!widget) return;

  let loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    document.head.appendChild(s);
  }

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) { load(); obs.disconnect(); }
    }, { rootMargin: '600px 0px' });
    obs.observe(widget);
  } else {
    load();
  }
  document.getElementById('contact-form')?.addEventListener('focusin', load, { once: true });
})();
