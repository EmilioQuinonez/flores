const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Visit notices: the page posts to this ntfy.sh topic when someone opens it
// and when the letter opens. Subscribe to the topic in the ntfy app to get
// them. Opening the page once with ?soyyo marks that browser as mine, so it
// stops sending notices (?nosoyyo undoes it).
const NTFY_TOPIC = 'cumple-c59015b34568613b';
const MINE_KEY = 'cumple-soy-yo';

const params = new URLSearchParams(window.location.search);
let isMine = false;
try {
  if (params.has('soyyo')) localStorage.setItem(MINE_KEY, '1');
  if (params.has('nosoyyo')) localStorage.removeItem(MINE_KEY);
  isMine = localStorage.getItem(MINE_KEY) === '1';
} catch {
  // storage blocked (private mode): treat ?soyyo as valid for this visit only
  isMine = params.has('soyyo');
}

async function describeDevice() {
  const ua = navigator.userAgent;
  const device =
    /iPhone/.test(ua) ? 'iPhone'
    : /iPad/.test(ua) ? 'iPad'
    : /Android/.test(ua) ? 'Android'
    : /Windows/.test(ua) ? 'Windows'
    : /Macintosh/.test(ua) ? 'Mac'
    : /Linux/.test(ua) ? 'Linux'
    : 'Desconocido';
  const browser =
    /Instagram/.test(ua) ? 'dentro de Instagram'
    : /FBAN|FBAV/.test(ua) ? 'dentro de Facebook/Messenger'
    : /WhatsApp/.test(ua) ? 'dentro de WhatsApp'
    : /Edg/.test(ua) ? 'Edge'
    : /CriOS|Chrome/.test(ua) ? 'Chrome'
    : /FxiOS|Firefox/.test(ua) ? 'Firefox'
    : /Safari/.test(ua) ? 'Safari'
    : 'otro navegador';

  // Chrome on Android can tell the phone model; nothing else does
  let model = '';
  try {
    const details = await navigator.userAgentData?.getHighEntropyValues(['model']);
    if (details?.model) model = ` (${details.model})`;
  } catch {
    // not available
  }

  return [
    `${device}${model}, ${browser}`,
    `Pantalla: ${screen.width}x${screen.height} (x${window.devicePixelRatio})`,
    `Idioma: ${navigator.language}`,
    `Zona horaria: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
  ].join('\n');
}

async function notify(title, tag) {
  if (isMine) return;
  try {
    await fetch('https://ntfy.sh/', {
      method: 'POST',
      keepalive: true,
      body: JSON.stringify({
        topic: NTFY_TOPIC,
        title,
        message: await describeDevice(),
        tags: [tag],
      }),
    });
  } catch {
    // offline or blocked: the page works the same without the notice
  }
}

notify('Abrieron la pagina de cumple', 'eyes');

const COLORS = ['#f28b9c', '#86cfc4', '#ffc95c', '#b9a2e0', '#8dbbea', '#ffb680'];

// Deterministic "random" so the frame looks the same on every load and resize.
const rand = (seed) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const repeat = (count, html) => Array.from({ length: count }, (_, i) => html(i)).join('');

const TEMPLATES = {
  lily: `
  <div class="flower__core">
    <div class="lily__glow"></div>
    ${repeat(6, (i) => `<div class="lily__petal" style="--i: ${i}"></div>`)}
    <div class="lily__stamens">
      ${repeat(6, (i) => `<div class="lily__stamen" style="--i: ${i}"></div>`)}
    </div>
  </div>`,
  tulip: `
  <div class="tulip__leaf tulip__leaf--l"></div>
  <div class="tulip__leaf tulip__leaf--r"></div>
  <div class="flower__stem"></div>
  <div class="flower__core">
    <div class="tulip__petal tulip__petal--l"></div>
    <div class="tulip__petal tulip__petal--r"></div>
    <div class="tulip__petal tulip__petal--c"></div>
  </div>`,
  euca: `
  <div class="flower__stem"></div>
  ${repeat(4, (k) => `
  <div class="euca__leaf euca__leaf--l" style="--k: ${k}"></div>
  <div class="euca__leaf euca__leaf--r" style="--k: ${k}"></div>`)}`,
};

// Corner bouquet, in px from the top-left corner of the screen (x right, y
// down), listed back to front. rot is the way a stem grows: 0 up, 90 right,
// 180 down. The bottom-right corner reuses it turned around.
const BOUQUET = {
  // x, y, rot, stem length
  euca: [
    [1150, 50, 100, 310],
    [990, 70, 120, 290],
    [820, 20, 172, 260],
    [620, 30, 158, 300],
    [330, 120, 140, 340],
    [90, 420, 112, 300],
    [130, 660, 150, 290],
    [60, 790, 172, 330],
  ],
  // x, y, rot
  leaf: [
    [300, 230, 135],
    [480, 190, 150],
    [880, 160, 200],
    [1070, 140, 122],
    [230, 330, 100],
    [200, 520, 80],
    [150, 700, 130],
  ],
  // x, y, rot, stem length
  tulip: [
    [470, -10, 172, 320],
    [680, -10, 186, 295],
    [880, -10, 176, 270],
    [1060, -10, 192, 230],
    [-10, 270, 96, 300],
    [-10, 480, 84, 275],
    [-10, 680, 100, 240],
    [-10, -10, 135, 680],
  ],
  // x, y, rot, bloom scale
  lily: [
    [1160, 95, -30, 0.85],
    [985, 160, 5, 1.05],
    [790, 110, 25, 1.25],
    [585, 180, -15, 1.15],
    [95, 800, 0, 0.95],
    [180, 610, 30, 1.15],
    [345, 330, 15, 1],
    [390, 125, 40, 1.4],
    [125, 400, -20, 1.4],
    [160, 160, 10, 1.7],
  ],
};

// Same pieces, small, at the foot of the cake stand: px from the bottom
// centre of the pedestal.
const FOOT_BOUQUET = {
  euca: [
    [-90, 15, -74, 330],
    [90, 15, 74, 330],
    [-70, 0, -50, 240],
    [70, 0, 50, 240],
  ],
  leaf: [
    [-60, 20, -100],
    [60, 20, 100],
    [-40, -10, -62],
    [40, -10, 62],
  ],
  tulip: [
    [-70, 30, -60, 250],
    [70, 30, 60, 250],
  ],
  lily: [
    [-165, 30, 10, 0.72],
    [165, 30, -20, 0.72],
    [0, 15, 0, 0.9],
  ],
};

function place(corner, type, [x, y, rot, size], seed) {
  const rim = document.createElement('div');
  rim.className = 'rim';
  rim.style.cssText = `left: ${x}px; top: ${y}px; --rot: ${rot}deg`;

  if (type === 'leaf') {
    rim.innerHTML = '<div class="leaf"></div>';
  } else {
    const flower = document.createElement('div');
    flower.className = `flower flower--${type}`;
    flower.style.cssText = `
      --stem-h: ${type === 'lily' ? 0 : size}px;
      --bloom-scale: ${type === 'lily' ? size : 1.2 + rand(seed) * 0.15};
      --sway-delay: ${-rand(seed + 0.9) * 8}s`;
    flower.innerHTML = TEMPLATES[type];
    rim.append(flower);
  }
  corner.append(rim);
}

function build(container, bouquet, seed) {
  Object.entries(bouquet).forEach(([type, items]) => {
    items.forEach((item) => place(container, type, item, seed++));
  });
}

document.querySelectorAll('.corner').forEach((corner, c) => build(corner, BOUQUET, 1 + c * 100));
build(document.querySelector('.cake__bouquet'), FOOT_BOUQUET, 300);

// The corner bouquets are drawn at one scale that follows the viewport; the
// one at the foot of the cake follows the cake's em size instead.
const scene = document.querySelector('.scene');
const party = document.querySelector('.party');

function fitBouquets() {
  const shortSide = Math.min(scene.clientWidth, scene.clientHeight);
  const scale = Math.min(0.5, Math.max(0.26, shortSide / 1700));
  const em = parseFloat(getComputedStyle(party).fontSize);
  document.documentElement.style.setProperty('--rim-scale', scale);
  document.documentElement.style.setProperty('--foot-scale', em * 0.015);
}

fitBouquets();
window.addEventListener('resize', fitBouquets);

// Confetti drifting down behind everything.
const confetti = document.querySelector('.confetti');
for (let i = 0; i < 26; i++) {
  const piece = document.createElement('span');
  piece.className = `confetti__piece${i % 3 === 0 ? ' confetti__piece--dot' : ''}`;
  piece.style.cssText = `
    --x: ${rand(i + 40) * 100}%;
    --c: ${COLORS[i % COLORS.length]};
    --size: ${6 + rand(i + 50) * 6}px;
    --dur: ${10 + rand(i + 60) * 9}s;
    --delay: ${-rand(i + 70) * 19}s;
    --drift: ${(rand(i + 80) - 0.5) * 120}px;
    --spin: ${(rand(i + 90) - 0.5) * 1400}deg`;
  confetti.append(piece);
}

// Tap the cake to blow out the candles (and again to light them back).
// Blowing them out opens the letter once the confetti has had its moment.
const cake = document.querySelector('.cake');
const hint = document.querySelector('.hint');
const letter = document.querySelector('.letter');
const letterClose = document.querySelector('.letter__close');
let letterTimer;

let letterNoticeSent = false;

function openLetter() {
  if (!letterNoticeSent) notify('Soplaron las velas y se abrio la carta', 'love_letter');
  letterNoticeSent = true;
  letter.hidden = false;
  letterClose.focus({ preventScroll: true });
}

function closeLetter() {
  if (letter.hidden) return;
  letter.hidden = true;
  cake.focus({ preventScroll: true });
}

if (params.has('soyyo') || params.has('nosoyyo')) {
  hint.textContent = isMine
    ? 'Este dispositivo quedó marcado como tuyo: ya no manda avisos'
    : 'Este dispositivo vuelve a mandar avisos';
}

letterClose.addEventListener('click', closeLetter);
document.querySelector('.letter__backdrop').addEventListener('click', closeLetter);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLetter();
});

function burst() {
  const from = cake.querySelector('.cake__candles').getBoundingClientRect();
  const originX = from.left + from.width / 2;
  const originY = from.top + from.height / 2;

  for (let i = 0; i < 46; i++) {
    const piece = document.createElement('span');
    piece.className = 'burst';
    piece.style.cssText = `left: ${originX}px; top: ${originY}px; --c: ${COLORS[i % COLORS.length]}`;
    scene.append(piece);

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
    const reach = 120 + Math.random() * 220;
    const x = Math.cos(angle) * reach;
    const y = Math.sin(angle) * reach;
    const spin = (Math.random() - 0.5) * 900;

    piece.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${x}px, ${y}px) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${x * 1.25}px, ${y + 260}px) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 1700 + Math.random() * 900, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' },
    ).onfinish = () => piece.remove();
  }
}

cake.addEventListener('click', () => {
  const blown = cake.classList.toggle('is-blown');
  cake.setAttribute('aria-label', blown ? 'Encender las velas' : 'Soplar las velas');
  hint.textContent = blown ? '¡Que se te cumpla!' : 'Pide un deseo y toca el pastel';

  clearTimeout(letterTimer);
  if (!blown) return;
  if (!prefersReducedMotion) burst();
  letterTimer = setTimeout(openLetter, prefersReducedMotion ? 0 : 1200);
});
