/* ═══════════════════════════════════════════════════════════
   main.js  —  Diksha Asnora Portfolio
   Responsibilities:
     1. API calls  — fetch profile, skills, projects, education
     2. DOM render — hydrate all dynamic sections
     3. UI logic   — nav, cursor, reveal, typewriter, form
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── Config ──────────────────────────────────────────────── */
const API_BASE = 'http://localhost:5000/api';

/* ── DOM helpers ─────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ═══════════════════════════════════════════════════════════
   1. API LAYER
   Each function fetches one endpoint and returns parsed JSON.
   Falls back to an empty value so the page never crashes.
═══════════════════════════════════════════════════════════ */

async function fetchJSON(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] ${path} failed:`, err.message);
    return null;
  }
}

const API = {
  profile  : () => fetchJSON('/profile'),
  skills   : () => fetchJSON('/skills'),
  projects : () => fetchJSON('/projects'),
  education: () => fetchJSON('/education'),
  sendContact: (body) =>
    fetch(`${API_BASE}/contact`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body),
    }),
};

/* ═══════════════════════════════════════════════════════════
   2. RENDER FUNCTIONS
   Pure DOM builders — each receives data, writes to the DOM.
═══════════════════════════════════════════════════════════ */

/** Hydrate hero tag, bio paragraphs, stats, and contact links */
function renderProfile(profile) {
  if (!profile) return;

  // Availability badge
  const tag = $('#heroTag');
  if (!profile.available) tag?.classList.add('hidden');

  // Bio paragraphs
  const bioEl = $('#bioParagraphs');
  if (bioEl && profile.bio?.length) {
    bioEl.innerHTML = profile.bio
      .map(p => `<p>${p}</p>`)
      .join('');
  }

  // Stats grid
  const statsEl = $('#statsGrid');
  if (statsEl && profile.stats) {
    const { projects, cgpa, years } = profile.stats;
    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="num">${projects}+</div>
        <div class="label">Projects</div>
      </div>
      <div class="stat-card">
        <div class="num">${cgpa}</div>
        <div class="label">CGPA</div>
      </div>
      <div class="stat-card">
        <div class="num">${years}</div>
        <div class="label">Years CSE</div>
      </div>
    `;
  }

  // Contact links
  const linksEl = $('#contactLinks');
  if (linksEl) {
    const links = [
      profile.email    && { href: `mailto:${profile.email}`, label: profile.email,   icon: iconEmail() },
      profile.linkedin && { href: profile.linkedin,           label: 'LinkedIn',      icon: iconLinkedIn() },
      profile.github   && { href: profile.github,             label: 'GitHub',        icon: iconGitHub() },
      profile.resume   && { href: profile.resume,             label: 'Resume',        icon: iconDownload(), download: true },
    ].filter(Boolean);

    linksEl.innerHTML = links.map(l => `
      <a href="${l.href}" class="contact-link" ${l.download ? 'download' : 'target="_blank" rel="noopener"'}>
        ${l.icon}
        <span>${l.label}</span>
      </a>
    `).join('');
  }
}

/** Render skill pills with staggered entrance */
function renderSkills(skills) {
  const grid = $('#skillsGrid');
  if (!grid || !skills?.length) return;

  grid.innerHTML = skills.map((s, i) => `
    <div class="skill-pill" style="transition-delay:${i * 55}ms" role="listitem">
      <span class="skill-icon" aria-hidden="true">${s.icon}</span>
      <span>${s.name}</span>
    </div>
  `).join('');

  // Trigger entrance via IntersectionObserver
  const pillObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    $$('.skill-pill', grid).forEach(p => p.classList.add('loaded'));
    pillObserver.disconnect();
  }, { threshold: 0.25 });
  pillObserver.observe(grid);
}

/** Render project cards */
function renderProjects(projects) {
  const grid = $('#projectsGrid');
  if (!grid || !projects?.length) return;

  grid.innerHTML = projects.map((p, i) => `
    <article class="project-card reveal reveal-delay-${(i % 4) + 1}" role="listitem">
      <div class="project-banner ${p.bannerColor}">
        <div class="banner-grid" aria-hidden="true"></div>
        <div class="project-banner-icon" aria-hidden="true">${p.bannerEmoji}</div>
      </div>
      <div class="project-body">
        <div class="project-tags">
          ${p.tags.map((t, ti) => `
            <span class="project-tag ${ti % 2 === 1 ? p.tagTheme : ''}">${t}</span>
          `).join('')}
        </div>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-links">
          ${p.github ? `
            <a href="${p.github}" class="project-link" target="_blank" rel="noopener" aria-label="${p.title} GitHub">
              ${iconGitHub(13)} GitHub
            </a>` : ''}
          ${p.demo ? `
            <a href="${p.demo}" class="project-link" target="_blank" rel="noopener" aria-label="${p.title} live demo">
              ${iconExternalLink(13)} Live Demo
            </a>` : ''}
        </div>
      </div>
    </article>
  `).join('');

  // Re-observe newly created cards
  observeReveal();
}

/** Render education timeline */
function renderEducation(education) {
  const timeline = $('#educationTimeline');
  if (!timeline || !education?.length) return;

  timeline.innerHTML = education.map((e, i) => {
    const end = e.endYear ? e.endYear : 'Present';
    const period = e.startYear === e.endYear ? String(e.endYear) : `${e.startYear} — ${end}`;
    return `
      <div class="timeline-item reveal reveal-delay-${i + 1}">
        <div class="timeline-card">
          <div class="timeline-date">${period}</div>
          <div class="timeline-institution">${e.institution}</div>
          <div class="timeline-degree">${e.degree}${e.field ? ` — ${e.field}` : ''}</div>
          ${e.grade ? `<div class="timeline-grade">⭐ ${e.grade}</div>` : ''}
          ${e.description ? `<p class="timeline-desc">${e.description}</p>` : ''}
        </div>
      </div>
    `;
  }).join('');

  observeReveal();
}

/* ═══════════════════════════════════════════════════════════
   3. UI BEHAVIOUR
═══════════════════════════════════════════════════════════ */

/** Scroll-based reveal via IntersectionObserver */
function observeReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  $$('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

/** Typewriter cycle on the hero role line */
function initTypewriter(roles = [
  'Final Year B.Tech CSE Student',
  'Full-Stack Developer',
  'ML Enthusiast',
  'Open Source Contributor',
]) {
  const target = $('#typewriterTarget');
  if (!target) return;

  let roleIndex = 0;
  let charIndex  = 0;
  let deleting   = false;

  const TYPE_SPEED   = 70;
  const DELETE_SPEED = 35;
  const PAUSE_END    = 2200;
  const PAUSE_START  = 400;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      target.textContent = current.substring(0, charIndex);
      charIndex++;
      if (charIndex > current.length) {
        deleting = true;
        return setTimeout(tick, PAUSE_END);
      }
    } else {
      target.textContent = current.substring(0, charIndex);
      charIndex--;
      if (charIndex < 0) {
        deleting  = false;
        roleIndex = (roleIndex + 1) % roles.length;
        charIndex = 0;
        return setTimeout(tick, PAUSE_START);
      }
    }

    setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
  }

  // Start after hero entrance animations settle
  setTimeout(tick, 1800);
}

/** Scrolled nav state */
function initNav() {
  const navbar = $('#navbar');
  const onScroll = () => navbar?.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/** Mobile hamburger menu */
function initMobileMenu() {
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  if (!hamburger || !mobileMenu) return;

  const toggle = (open) => {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => toggle(!hamburger.classList.contains('open')));

  // Close on link click
  $$('[data-close-menu]', mobileMenu).forEach(a =>
    a.addEventListener('click', () => toggle(false))
  );

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) toggle(false);
  });
}

/** Custom dual-layer cursor (desktop only) */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // touch devices

  const cursor    = $('#cursor');
  const cursorRing = $('#cursorRing');
  if (!cursor || !cursorRing) return;

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX - 6}px`;
    cursor.style.top  = `${mouseY - 6}px`;
  });

  (function animateRing() {
    ringX += (mouseX - ringX - 18) * 0.12;
    ringY += (mouseY - ringY - 18) * 0.12;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top  = `${ringY}px`;
    requestAnimationFrame(animateRing);
  })();

  const hoverEls = 'a, button, .skill-pill, .project-card, .contact-link, .stat-card, .timeline-card';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); cursorRing.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); cursorRing.classList.remove('hover'); });
  });
}

/** Ambient background blobs fade-in */
function initBlobs() {
  $$('.blob').forEach((b, i) => setTimeout(() => b.classList.add('visible'), 300 + i * 150));
}

/** Footer year */
function initFooter() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/** Contact form submission */
function initContactForm() {
  const submitBtn  = $('#formSubmit');
  const alertEl    = $('#formAlert');
  if (!submitBtn) return;

  const showAlert = (msg, type) => {
    alertEl.textContent = msg;
    alertEl.className   = `form-alert ${type}`;
    alertEl.hidden      = false;
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const setLoading = (loading) => {
    $('#submitLabel').textContent = loading ? 'Sending…' : 'Send Message';
    $('#submitSpinner').classList.toggle('hidden', !loading);
    submitBtn.disabled = loading;
  };

  submitBtn.addEventListener('click', async () => {
    alertEl.hidden = true;

    const name    = $('#cfName')?.value.trim();
    const email   = $('#cfEmail')?.value.trim();
    const subject = $('#cfSubject')?.value.trim();
    const message = $('#cfMessage')?.value.trim();

    // Client-side validation
    if (!name || !email || !message)
      return showAlert('Please fill in name, email, and message.', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showAlert('Please enter a valid email address.', 'error');
    if (message.length > 2000)
      return showAlert('Message too long (max 2000 characters).', 'error');

    setLoading(true);

    try {
      const res  = await API.sendContact({ name, email, subject, message });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Server error');

      showAlert(data.message || 'Message sent! Diksha will get back to you soon.', 'success');
      // Clear form
      ['cfName','cfEmail','cfSubject','cfMessage'].forEach(id => {
        const el = $(`#${id}`);
        if (el) el.value = '';
      });
    } catch (err) {
      showAlert(err.message || 'Something went wrong. Please try emailing directly.', 'error');
    } finally {
      setLoading(false);
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   4. INLINE SVG ICONS  (tiny, no external dependency)
═══════════════════════════════════════════════════════════ */

const svg = (d, size = 18) =>
  `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;

const svgFilled = (d, size = 18) =>
  `<svg width="${size}" height="${size}" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;

function iconEmail(s) {
  return svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`, s);
}
function iconLinkedIn(s) {
  return svgFilled(`<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>`, s);
}
function iconGitHub(s) {
  return svgFilled(`<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>`, s);
}
function iconDownload(s) {
  return svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`, s);
}
function iconExternalLink(s) {
  return svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>`, s);
}

/* ═══════════════════════════════════════════════════════════
   5. BOOTSTRAP  —  load data + init all UI
═══════════════════════════════════════════════════════════ */

async function bootstrap() {
  // Kick off non-dependent UI immediately
  initBlobs();
  initNav();
  initMobileMenu();
  initCursor();
  initTypewriter();
  initFooter();
  initContactForm();
  observeReveal();       // handle static reveals (hero etc.)

  // Fetch all API data in parallel
  const [profile, skills, projects, education] = await Promise.all([
    API.profile(),
    API.skills(),
    API.projects(),
    API.education(),
  ]);

  // Render dynamic sections
  renderProfile(profile);
  renderSkills(skills);
  renderProjects(projects);
  renderEducation(education);

  // Final reveal pass after DOM is hydrated
  observeReveal();
}

// Run once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}