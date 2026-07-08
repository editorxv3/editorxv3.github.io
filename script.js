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
const sections = ['hero', 'about', 'work', 'channels', 'services', 'contact']
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

/* ---------- Hero showreel play/pause ---------- */
const reelVideo = document.getElementById('reelVideo');
const reelPlay = document.getElementById('reelPlay');

reelPlay.addEventListener('click', () => {
  reelVideo.play();
  reelPlay.classList.add('playing');
});
reelVideo.addEventListener('pause', () => reelPlay.classList.remove('playing'));
reelVideo.addEventListener('ended', () => reelPlay.classList.remove('playing'));

/* ---------- Work grid clip play/pause (delegated) ---------- */
document.querySelectorAll('.clip-media .reel-play').forEach(btn => {
  btn.addEventListener('click', () => {
    const video = document.getElementById(btn.dataset.video);
    if (!video) return;
    video.play();
    btn.classList.add('playing');
  });
});
document.querySelectorAll('.clip-media video').forEach(video => {
  video.addEventListener('pause', () => {
    const btn = document.querySelector(`[data-video="${video.id}"]`);
    if (btn) btn.classList.remove('playing');
  });
  video.addEventListener('ended', () => {
    const btn = document.querySelector(`[data-video="${video.id}"]`);
    if (btn) btn.classList.remove('playing');
  });
});
