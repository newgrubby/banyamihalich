/**
 * Генерация листвы для public/art/venik.svg.
 * Листья раскладываются процедурно по силуэту связки — рисовать
 * полторы сотни путей руками бессмысленно, а править числа здесь просто.
 *
 * Запуск: npm run art
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const LEAF =
  'M0 1 C5 6 8 10 8.5 15 C11.5 15.5 12.5 19 10.5 21.5 C12.5 24 11 28 7.5 28.5 ' +
  'C6.5 32 2.5 34.5 0 33.5 C-2.5 34.5 -6.5 32 -7.5 28.5 C-11 28 -12.5 24 -10.5 21.5 ' +
  'C-12.5 19 -11.5 15.5 -8.5 15 C-8 10 -5 6 0 1 Z';

const DARK = [24, 28, 16];
const MID = [64, 70, 34];
const LIT = [128, 122, 58];

function tone(t) {
  const c = t < 0.5
    ? DARK.map((v, i) => lerp(v, MID[i], t * 2))
    : MID.map((v, i) => lerp(v, LIT[i], (t - 0.5) * 2));
  return `#${c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')}`;
}

/** Полуширина связки на относительной высоте t. */
const halfWidth = (t) => 30 + 196 * Math.pow(t, 0.7) * (1 - 0.2 * t);

const TIE_X = 300;
const TIE_Y = 194;
const LENGTH = 310;

function bundle(seed, count, { scale = 1, shade = 0, spread = 1 } = {}) {
  const rand = makeRandom(seed);
  const out = [];

  for (let i = 0; i < count; i += 1) {
    // Ближе к низу листьев больше — связка книзу гуще
    const t = Math.pow(rand(), 0.72);
    const u = (rand() * 2 - 1) * spread;

    const x = TIE_X + u * halfWidth(t);
    const y = TIE_Y + t * LENGTH + (rand() - 0.5) * 14;

    // Лист смотрит наружу и вниз
    const rotate = 180 + u * 46 + (rand() - 0.5) * 40;
    const s = (0.62 + rand() * 0.46) * scale;

    // Свет падает сверху-слева
    const light = clamp(0.30 + (1 - t) * 0.34 - u * 0.26 + rand() * 0.26 - shade);

    out.push({ x, y, rotate, s, fill: tone(light), opacity: (0.72 + light * 0.28).toFixed(2) });
  }

  // Дальние листья рисуем первыми
  return out.sort((a, b) => a.y - b.y);
}

const num = (v) => Number(v.toFixed(1));

function leafMarkup(leaves, vein) {
  return leaves
    .map(({ x, y, rotate, s, fill, opacity }) => {
      const g = `<g transform="translate(${num(x)} ${num(y)}) rotate(${num(rotate)}) scale(${s.toFixed(2)})">`;
      const path = `<path d="${LEAF}" fill="${fill}" opacity="${opacity}"/>`;
      const v = vein ? '<path d="M0 5 L0 30" stroke="#1d200f" stroke-width="1.1" opacity="0.45" fill="none"/>' : '';
      return `${g}${path}${v}</g>`;
    })
    .join('\n      ');
}

/** Прутья, расходящиеся от перевязи. */
function twigs() {
  const rand = makeRandom(4242);
  const lines = [];
  for (let i = 0; i < 9; i += 1) {
    const u = (i / 8) * 2 - 1;
    const endX = TIE_X + u * halfWidth(1) * 0.82;
    const endY = TIE_Y + LENGTH * (0.72 + rand() * 0.24);
    const cx = TIE_X + u * halfWidth(0.5) * 0.5;
    const cy = TIE_Y + LENGTH * 0.4;
    lines.push(`<path d="M${TIE_X} ${TIE_Y} Q${num(cx)} ${num(cy)} ${num(endX)} ${num(endY)}"/>`);
  }
  return lines.join('\n      ');
}

const back = bundle(101, 110, { scale: 1.02, shade: 0.2, spread: 1.06 });
const front = bundle(2027, 140, { scale: 1.2, shade: 0, spread: 0.94 });
const fallen = bundle(909, 9, { scale: 0.8, shade: 0.24 }).map((leaf, i) => ({
  ...leaf,
  x: 70 + i * 62 + (i % 3) * 14,
  y: 560 + (i % 4) * 16,
  rotate: 30 + i * 37,
}));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 640" width="600" height="640" role="img" aria-label="Связка дубовых веников на деревянной стене предбанника">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#2a1c13"/>
      <stop offset="55%" stop-color="#180f0a"/>
      <stop offset="100%" stop-color="#0a0705"/>
    </linearGradient>

    <linearGradient id="plank" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#33210f" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#452d1a" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#20140c" stop-opacity="0.9"/>
    </linearGradient>

    <radialGradient id="lamp" cx="0.26" cy="0.12" r="0.66">
      <stop offset="0%" stop-color="#e39a4c" stop-opacity="0.38"/>
      <stop offset="55%" stop-color="#8a4d1f" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="vign" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.55"/>
      <stop offset="32%" stop-color="#000" stop-opacity="0"/>
      <stop offset="70%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.84"/>
    </linearGradient>

    <filter id="grain" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.16" numOctaves="4" seed="12"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>
    </filter>

    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
  </defs>

  <rect width="600" height="640" fill="url(#wall)"/>

  <g fill="url(#plank)">
    <rect x="0" y="0" width="600" height="86"/>
    <rect x="0" y="90" width="600" height="86"/>
    <rect x="0" y="180" width="600" height="86"/>
    <rect x="0" y="270" width="600" height="86"/>
    <rect x="0" y="360" width="600" height="86"/>
    <rect x="0" y="450" width="600" height="86"/>
    <rect x="0" y="540" width="600" height="100"/>
  </g>
  <rect width="600" height="640" filter="url(#grain)" opacity="0.2" style="mix-blend-mode:overlay"/>
  <g stroke="#0b0704" stroke-width="3" opacity="0.65">
    <path d="M0 88h600M0 178h600M0 268h600M0 358h600M0 448h600M0 538h600"/>
  </g>

  <rect width="600" height="640" fill="url(#lamp)"/>

  <!-- тень связки на стене -->
  <ellipse cx="330" cy="360" rx="180" ry="170" fill="#050403" opacity="0.5" filter="url(#softShadow)"/>

  <!-- крюк и верёвка -->
  <g>
    <path d="M300 84 v20 q0 12 -14 14" fill="none" stroke="#8b6537" stroke-width="6" stroke-linecap="round"/>
    <circle cx="300" cy="82" r="6" fill="#5c4023" stroke="#9c7440" stroke-width="2"/>
    <path d="M300 110 q-5 42 0 76" stroke="#7a5c30" stroke-width="4" fill="none"/>
  </g>

  <!-- прутья -->
  <g stroke="#4a3a1f" stroke-width="3" fill="none" opacity="0.85" stroke-linecap="round">
      ${twigs()}
  </g>

  <!-- листва: дальний ярус -->
  <g opacity="0.85">
      ${leafMarkup(back, false)}
  </g>

  <!-- листва: передний ярус -->
  <g>
      ${leafMarkup(front, true)}
  </g>

  <!-- перевязь -->
  <g>
    <path d="M270 186 q30 14 60 0 q7 22 -2 34 q-29 14 -56 0 q-8 -14 -2 -34Z" fill="#6b4a24" stroke="#33220e" stroke-width="2"/>
    <path d="M274 196 q26 12 52 0" fill="none" stroke="#a3793f" stroke-width="2" opacity="0.7"/>
    <path d="M276 210 q24 11 48 0" fill="none" stroke="#a3793f" stroke-width="2" opacity="0.5"/>
  </g>

  <!-- опавшие листья на полу -->
  <g opacity="0.6">
      ${leafMarkup(fallen, false)}
  </g>

  <rect width="600" height="640" fill="url(#vign)"/>
</svg>
`;

writeFileSync(join(root, 'public', 'art', 'venik.svg'), svg);
console.log(`public/art/venik.svg  ${(svg.length / 1024).toFixed(1)} KB  (${back.length + front.length + fallen.length} листьев)`);
