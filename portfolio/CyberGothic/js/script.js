// Subtle random glitch effect on cards
document.querySelectorAll('.card').forEach(card => {
  setInterval(() => {
    if (Math.random() > 0.97) {
      card.style.transform = `translateX(${(Math.random()-0.5)*4}px)`;
      setTimeout(() => card.style.transform = '', 80);
    }
  }, 500);
});

// Cursor trail
document.addEventListener('mousemove', e => {
  const dot = document.createElement('div');
  dot.style.cssText = `
    position:fixed;left:${e.clientX}px;top:${e.clientY}px;
    width:3px;height:3px;background:rgba(200,0,40,0.6);
    border-radius:50%;pointer-events:none;z-index:9999;
    transition:all 0.4s ease;
  `;
  document.body.appendChild(dot);
  setTimeout(() => { dot.style.opacity = '0'; dot.style.transform = 'scale(0)'; }, 100);
  setTimeout(() => dot.remove(), 500);
});

// ── RESPONSIVE BLOOD DRIPS ──
const dripData = [
  { h: 45, d: 0.4 }, { h: 80, d: 1.2 }, { h: 55, d: 2.0 }, { h: 35, d: 0.7 },
  { h: 70, d: 1.6 }, { h: 90, d: 0.1 }, { h: 50, d: 2.4 }, { h: 65, d: 0.9 },
  { h: 40, d: 1.8 }, { h: 75, d: 0.5 }, { h: 30, d: 2.8 }, { h: 58, d: 1.3 }
];

function renderDrips() {
  const container = document.getElementById('headerDrips');
  const count = window.innerWidth >= 768 ? 12 : 5;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const d = dripData[i];
    const el = document.createElement('div');
    el.className = 'header-drip';
    el.style.height = d.h + 'px';
    el.style.animationDelay = d.d + 's';
    container.appendChild(el);
  }
}

renderDrips();
window.addEventListener('resize', renderDrips);

// ── CINEMA SCROLL OBSERVER ──
const cinemaObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // unobserve after reveal for performance
      cinemaObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.cinema').forEach(el => cinemaObserver.observe(el));