document.getElementById('year').textContent = new Date().getFullYear();

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
    if (target) target.scrollIntoView({ behavior: 'smooth' });
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
