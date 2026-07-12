document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof gsap !== 'undefined';
const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
const hasLenis = typeof Lenis !== 'undefined';

/* ---------- Lenis smooth scroll, synced to GSAP's ticker ----------
   Skipped entirely under prefers-reduced-motion: native scroll behavior
   is left completely untouched for those visitors. */
let lenis = null;
if (!reduceMotion && hasLenis && hasGSAP) {
  lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', () => {
    updatePlayhead();
    if (hasScrollTrigger) ScrollTrigger.update();
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- Scrubber playhead follows scroll position ---------- */
const track = document.querySelector('.scrubber-track');
const playhead = document.getElementById('playhead');

function updatePlayhead() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
  const trackWidth = track.clientWidth;
  playhead.style.left = (progress * trackWidth) + 'px';
}
window.addEventListener('scroll', updatePlayhead, { passive: true });
window.addEventListener('resize', updatePlayhead);
updatePlayhead();

/* ---------- Scrubber tick clicks scroll to section ---------- */
document.querySelectorAll('.scrubber-tick').forEach(tick => {
  tick.addEventListener('click', () => {
    const target = document.getElementById(tick.dataset.target);
    if (!target) return;
    if (lenis) {
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
      lenis.scrollTo(target, { offset: -navH - 8 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ---------- Active tick highlight via IntersectionObserver ---------- */
const sections = ['hero', 'about', 'work', 'photos', 'channels', 'services', 'contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);

const ticks = Array.from(document.querySelectorAll('.scrubber-tick'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      ticks.forEach(t => t.classList.toggle('active', t.dataset.target === id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sections.forEach(sec => observer.observe(sec));

/* ---------- Shared play/pause toggle (videos can always be paused) ---------- */
const PLAY_ICON = `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="31" fill="white" fill-opacity="0.95"/>
    <path d="M26 21L44 32L26 43V21Z" fill="#15171B"/>
  </svg>`;
const PAUSE_ICON = `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="31" fill="white" fill-opacity="0.95"/>
    <rect x="22" y="20" width="7" height="24" rx="1.5" fill="#15171B"/>
    <rect x="35" y="20" width="7" height="24" rx="1.5" fill="#15171B"/>
  </svg>`;

function setupVideoToggle(video, button) {
  if (!video || !button) return;

  function toggle() {
    if (video.paused) video.play();
    else video.pause();
  }

  function syncIcon() {
    button.innerHTML = video.paused ? PLAY_ICON : PAUSE_ICON;
    button.classList.toggle('playing', !video.paused);
  }

  button.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  video.addEventListener('click', toggle);
  video.addEventListener('play', syncIcon);
  video.addEventListener('pause', syncIcon);
  video.addEventListener('ended', syncIcon);
  syncIcon();
}

setupVideoToggle(document.getElementById('reelVideo'), document.getElementById('reelPlay'));

document.querySelectorAll('.clip-media .reel-play').forEach(btn => {
  const video = document.getElementById(btn.dataset.video);
  setupVideoToggle(video, btn);
});

/* ---------- GSAP: hero entrance + scroll-triggered reveals ----------
   Entirely skipped under reduced-motion or if GSAP failed to load —
   in either case content simply appears with no animation, never hidden. */
if (!reduceMotion && hasGSAP) {
  gsap.set('#hero .eyebrow, #hero .hero-title, #hero .hero-sub, #reelFrame, .hero-strip span', { opacity: 0 });

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
  heroTl
    .to('#hero .eyebrow', { opacity: 1, y: 0 }, 0.1)
    .from('#hero .eyebrow', { y: 16 }, 0.1)
    .to('#hero .hero-title', { opacity: 1 }, 0.25)
    .from('#hero .hero-title', { y: 26 }, 0.25)
    .to('#hero .hero-sub', { opacity: 1 }, 0.4)
    .from('#hero .hero-sub', { y: 20 }, 0.4)
    .to('#reelFrame', { opacity: 1 }, 0.5)
    .from('#reelFrame', { y: 32, scale: 0.98 }, 0.5)
    .to('.hero-strip span', { opacity: 1, stagger: 0.06 }, 0.75)
    .from('.hero-strip span', { y: 10, stagger: 0.06 }, 0.75);

  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const revealSelectors = [
      '.section-head', '.clip-card', '.photo-pile', '.photo-grid-mobile',
      '.channel-featured', '.channel-cell', '.service-card', '.stat', '.contact-panel'
    ];

    revealSelectors.forEach(sel => {
      const els = gsap.utils.toArray(sel);
      if (!els.length) return;
      gsap.set(els, { opacity: 0, y: 26 });
      ScrollTrigger.batch(els, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' })
      });
    });
  }
}

/* ---------- Viewfinder cursor (desktop, fine-pointer only) ---------- */
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (canHover && !reduceMotion && hasGSAP) {
  document.documentElement.classList.add('viewfinder-active');
  const cursorEl = document.getElementById('viewfinderCursor');
  const labelEl = document.getElementById('vfLabel');
  const moveX = gsap.quickTo(cursorEl, 'x', { duration: 0.35, ease: 'power3' });
  const moveY = gsap.quickTo(cursorEl, 'y', { duration: 0.35, ease: 'power3' });

  window.addEventListener('mousemove', (e) => {
    moveX(e.clientX);
    moveY(e.clientY);
  });

  function labelFor(el) {
    if (el.hasAttribute('data-cursor-label')) return el.getAttribute('data-cursor-label');
    if (el.classList.contains('reel-play')) return el.classList.contains('playing') ? 'PAUSE' : 'PLAY';
    if (el.classList.contains('photo-card')) return 'VIEW';
    if (el.classList.contains('channel-featured-btn')) return 'YOUTUBE';
    if (el.classList.contains('contact-link')) return 'OPEN';
    if (el.classList.contains('scrubber-contact')) return 'CHAT';
    if (el.classList.contains('scrubber-tick')) return '';
    if (el.tagName === 'A') return 'OPEN';
    return '';
  }

  document.querySelectorAll('a, button, .photo-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorEl.classList.add('focus');
      const txt = labelFor(el);
      labelEl.textContent = txt;
      labelEl.classList.toggle('show', !!txt);
    });
    el.addEventListener('mouseleave', () => {
      cursorEl.classList.remove('focus');
      labelEl.classList.remove('show');
    });
  });
}
