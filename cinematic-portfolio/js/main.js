/* ============================================================
   CINEMATIC PORTFOLIO ENGINE
   Hero orbit = frame-sequence scrubber with a 3D stand-in fallback.
   Drop real Seedance frames into assets/frames/hero/ + manifest.json
   ({"count":240,"ext":"webp"}) and the figure is replaced automatically.
   ============================================================ */

/* ------------------ EDIT ME ------------------ */
const CONFIG = {
  stats: [
    { label: 'Projects shipped',     value: 14,  suffix: '+' },
    { label: 'Workflows automated',  value: 27,  suffix: '+' },
    { label: 'Hours saved / month',  value: 120, suffix: '+' },
    { label: 'On-time delivery',     value: 100, suffix: '%' },
  ],
  framesPath: 'assets/frames/hero/',
};
/* ---------------------------------------------- */

gsap.registerPlugin(ScrollTrigger);

/* ------------------ smooth scroll (Lenis) ------------------ */
const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
window.lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('[data-scroll]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo(a.getAttribute('href'), { duration: 1.6 });
  });
});

const vh = () => window.innerHeight;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/* ------------------ hero typography ------------------ */
const nameEl = document.querySelector('.hero-name');
const letters = [];
nameEl.textContent = '';
for (const ch of nameEl.dataset.name) {
  const outer = document.createElement('span');
  outer.className = 'lt';
  const inner = document.createElement('span');
  inner.className = 'lt-in';
  inner.textContent = ch;
  outer.appendChild(inner);
  nameEl.appendChild(outer);
  letters.push(outer);
}

gsap.from('.lt-in', {
  yPercent: 115, rotate: 4, duration: 1.15, ease: 'power4.out',
  stagger: 0.07, delay: 0.25,
});
gsap.to('.hero-sub', { opacity: 1, duration: 1.2, ease: 'power2.out', delay: 1.0 });
gsap.from('.hero-eyebrow', { opacity: 0, y: 14, duration: 0.9, delay: 0.15 });

/* ------------------ hero scrub loop ------------------ */
const heroSection = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');
const scrollHint = document.querySelector('.scroll-hint');
const progressBar = document.querySelector('.scroll-progress');
const canvas = document.getElementById('hero-canvas');

let heroProgress = 0;      // raw 0..1 across the 400vh hero
let smoothProgress = 0;    // damped — this is what renders
let renderHero = null;     // set by whichever hero mode initializes

function heroLoop() {
  const scrollY = window.scrollY || 0;
  const range = heroSection.offsetHeight - vh();
  heroProgress = clamp01(range > 0 ? scrollY / range : 0);
  smoothProgress += (heroProgress - smoothProgress) * 0.09;

  // kinetic type: letters track apart, content fades toward orbit end
  const mid = (letters.length - 1) / 2;
  const spread = smoothProgress * 44;
  letters.forEach((l, i) => {
    l.style.transform = `translateX(${(i - mid) * spread}px)`;
  });
  const fade = 1 - clamp01((smoothProgress - 0.55) / 0.3);
  heroContent.style.opacity = fade;
  scrollHint.style.opacity = 1 - clamp01(smoothProgress / 0.08);

  // page progress bar
  const total = document.documentElement.scrollHeight - vh();
  progressBar.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;

  if (renderHero) renderHero(smoothProgress);
  requestAnimationFrame(heroLoop);
}

/* ------------------ MODE A: real frame sequence ------------------ */
function initFrameScrub(manifest) {
  const ctx = canvas.getContext('2d');
  const count = manifest.count;
  const ext = manifest.ext || 'webp';
  const frames = new Array(count);
  let loaded = 0;

  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.src = `${CONFIG.framesPath}${String(i + 1).padStart(4, '0')}.${ext}`;
    img.onload = () => { loaded++; };
    frames[i] = img;
  }

  function resize() {
    canvas.width = canvas.clientWidth * Math.min(devicePixelRatio, 2);
    canvas.height = canvas.clientHeight * Math.min(devicePixelRatio, 2);
  }
  resize();
  window.addEventListener('resize', resize);

  renderHero = (p) => {
    const idx = Math.min(count - 1, Math.round(p * (count - 1)));
    const img = frames[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    // cover-fit
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };
}

/* ------------------ MODE B: 3D stand-in orbit ------------------ */
function initThreeOrbit() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060607);
  scene.fog = new THREE.Fog(0x060607, 9, 17);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);

  /* --- black-void studio lighting: emerald rims + faint cream key --- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.06));
  const rimL = new THREE.DirectionalLight(0x10b981, 5.5);
  rimL.position.set(-4, 3.5, -3);
  scene.add(rimL);
  const rimR = new THREE.DirectionalLight(0x34d399, 3.5);
  rimR.position.set(4, 2.5, -3.5);
  scene.add(rimR);
  const key = new THREE.DirectionalLight(0xf2ead8, 0.35);
  key.position.set(0, 4, 5);
  scene.add(key);

  /* --- floor + emerald light ring --- */
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 48),
    new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.85, metalness: 0.2 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.05, 2.12, 72),
    new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  scene.add(ring);

  /* --- the stand-in figure: confident stance, arms crossed --- */
  const figure = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.3, metalness: 0.7 });
  const add = (geo, x, y, z, rx = 0, ry = 0, rz = 0, sy = 1) => {
    const m = new THREE.Mesh(geo, skin);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.scale.y = sy;
    figure.add(m);
    return m;
  };

  add(new THREE.SphereGeometry(0.30, 32, 24), 0, 3.06, 0, 0, 0, 0, 1.12);              // head
  add(new THREE.CylinderGeometry(0.11, 0.13, 0.24, 16), 0, 2.72, 0);                    // neck
  add(new THREE.CylinderGeometry(0.52, 0.40, 1.30, 24), 0, 1.98, 0);                    // torso
  add(new THREE.SphereGeometry(0.21, 24, 16), -0.52, 2.48, 0);                          // shoulder L
  add(new THREE.SphereGeometry(0.21, 24, 16), 0.52, 2.48, 0);                           // shoulder R
  add(new THREE.CapsuleGeometry(0.115, 0.78, 8, 16), -0.10, 2.16, 0.30, 0.25, 0, 1.25); // crossed arm L
  add(new THREE.CapsuleGeometry(0.115, 0.78, 8, 16), 0.10, 2.06, 0.34, 0.25, 0, -1.25); // crossed arm R
  add(new THREE.CylinderGeometry(0.40, 0.36, 0.38, 24), 0, 1.18, 0);                    // hips
  add(new THREE.CapsuleGeometry(0.155, 0.95, 8, 16), -0.21, 0.60, 0);                   // leg L
  add(new THREE.CapsuleGeometry(0.155, 0.95, 8, 16), 0.21, 0.60, 0.02, 0.06);           // leg R
  add(new THREE.BoxGeometry(0.24, 0.10, 0.42), -0.21, 0.05, 0.06);                      // foot L
  add(new THREE.BoxGeometry(0.24, 0.10, 0.42), 0.21, 0.05, 0.08);                       // foot R
  scene.add(figure);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  renderHero = (p) => {
    const t = clock.getElapsedTime();
    // one full 360° orbit across the hero scroll, slight dolly-in + crane
    const angle = p * Math.PI * 2;
    const radius = 7.4 - p * 0.8;
    camera.position.set(
      Math.sin(angle) * radius,
      1.9 + Math.sin(p * Math.PI) * 0.4,
      Math.cos(angle) * radius
    );
    camera.lookAt(0, 1.75, 0);
    figure.position.y = Math.sin(t * 1.1) * 0.015; // idle breath
    ring.material.opacity = 0.38 + Math.sin(t * 2) * 0.08;
    renderer.render(scene, camera);
  };
}

/* ------------------ pick hero mode, then start the loop ------------------ */
(async () => {
  let manifest = null;
  try {
    const r = await fetch(CONFIG.framesPath + 'manifest.json', { cache: 'no-store' });
    if (r.ok) manifest = await r.json();
  } catch (_) { /* no frames yet — stand-in mode */ }

  if (manifest && manifest.count > 0) initFrameScrub(manifest);
  else initThreeOrbit();

  requestAnimationFrame(heroLoop);
})();

/* ------------------ stats: count up on scroll ------------------ */
const statsInner = document.getElementById('stats-inner');
CONFIG.stats.forEach((s) => {
  const div = document.createElement('div');
  div.className = 'stat';
  div.innerHTML = `<span class="stat-value">0<b>${s.suffix}</b></span><span class="stat-label">${s.label}</span>`;
  statsInner.appendChild(div);
});

ScrollTrigger.create({
  trigger: '.stats',
  start: 'top 82%',
  once: true,
  onEnter: () => {
    document.querySelectorAll('.stat').forEach((el, i) => {
      const target = CONFIG.stats[i];
      const obj = { v: 0 };
      const num = el.querySelector('.stat-value');
      gsap.to(obj, {
        v: target.value, duration: 1.8, ease: 'power2.out', delay: i * 0.12,
        onUpdate: () => { num.innerHTML = `${Math.round(obj.v)}<b>${target.suffix}</b>`; },
      });
    });
  },
});

/* ------------------ pillars: sequential reveal over holo field ------------------ */
const pillars = gsap.utils.toArray('[data-pillar]');
const pillarTl = gsap.timeline({
  scrollTrigger: { trigger: '.pillars', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
});
pillars.forEach((el, i) => {
  pillarTl.fromTo(el, { autoAlpha: 0, y: 100, scale: 0.96 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, i * 2.1);
  if (i < pillars.length - 1) {
    pillarTl.to(el, { autoAlpha: 0, y: -100, duration: 0.9, ease: 'power2.in' }, i * 2.1 + 1.45);
  }
});
// holo screens drift at differing speeds through the section
document.querySelectorAll('.holo').forEach((h) => {
  gsap.to(h, {
    y: -160 * parseFloat(h.dataset.speed),
    scrollTrigger: { trigger: '.pillars', start: 'top bottom', end: 'bottom top', scrub: 1 },
  });
});

/* ------------------ work: reveal + hover tilt ------------------ */
gsap.from('.work-title', {
  yPercent: 60, opacity: 0, duration: 1,
  scrollTrigger: { trigger: '.work', start: 'top 70%' },
});
gsap.from('[data-card]', {
  y: 110, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.14,
  scrollTrigger: { trigger: '.work-grid', start: 'top 78%' },
});

document.querySelectorAll('[data-card]').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
    gsap.to(card, {
      rotateY: (px - 0.5) * 10, rotateX: (0.5 - py) * 10,
      transformPerspective: 700, duration: 0.4, ease: 'power2.out',
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  });
});

/* ------------------ finale ------------------ */
gsap.from('.finale-title .w', {
  yPercent: 110, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.1,
  scrollTrigger: { trigger: '.finale', start: 'top 65%' },
});
gsap.from('.finale-cta .btn', {
  y: 30, opacity: 0, duration: 0.8, stagger: 0.12,
  scrollTrigger: { trigger: '.finale', start: 'top 55%' },
});

/* ------------------ perf probe (used by automated verification) ------------------ */
window.__measureFPS = (ms = 1500) => {
  let frames = 0;
  const t0 = performance.now();
  window.__fpsResult = null;
  (function tick() {
    frames++;
    if (performance.now() - t0 < ms) requestAnimationFrame(tick);
    else window.__fpsResult = +(frames / (ms / 1000)).toFixed(1);
  })();
  return 'measuring';
};
