/**
 * Генерация app/apple-icon.png (180×180) без внешних зависимостей:
 * иконка рисуется процедурно и кодируется в PNG вручную через zlib.
 *
 * Картинка для соцсетей делается из настоящего кадра — см. npm run media.
 *
 * Запуск: npm run assets
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ */
/* Кодирование PNG                                                     */
/* ------------------------------------------------------------------ */

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgb) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // глубина канала
  header[9] = 2; // truecolor RGB
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // фильтр None
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ */
/* Рисование                                                           */
/* ------------------------------------------------------------------ */

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/** Накладывает цвет с прозрачностью на накопитель. */
function over(dst, r, g, b, a) {
  dst[0] = lerp(dst[0], r, a);
  dst[1] = lerp(dst[1], g, a);
  dst[2] = lerp(dst[2], b, a);
}

/** Печь-каменка с горящей топкой — тот же знак, что и в app/icon.svg. */
function renderIcon(size) {
  const rgb = Buffer.alloc(size * size * 3);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const px = [14, 11, 9];

      over(px, 226, 136, 74, Math.exp(-((u - 0.5) ** 2 + (v - 0.72) ** 2) * 9) * 0.22);

      // корпус печи
      if (u > 0.22 && u < 0.78 && v > 0.4 && v < 0.86) {
        const light = 1 - (v - 0.4) * 0.7;
        over(px, 74 * light, 48 * light, 28 * light, 1);
      }

      // скат крыши
      const roof = Math.abs(u - 0.5) * 1.28;
      if (v > 0.26 && v < 0.4 && roof < (v - 0.26) / 0.14) {
        over(px, 92, 60, 34, 1);
      }

      // топка с огнём
      if (u > 0.36 && u < 0.64 && v > 0.55 && v < 0.8) {
        const fire = 1 - smoothstep(0.55, 0.82, v);
        over(px, 255, 168, 74, 0.55 + fire * 0.4);
        over(px, 255, 224, 150, Math.exp(-((u - 0.5) ** 2) * 90) * 0.5);
      }

      // рамка
      const m = Math.round(size * 0.045);
      if (x === m || x === size - 1 - m || y === m || y === size - 1 - m) {
        over(px, 184, 118, 58, 0.6);
      }

      const i = (y * size + x) * 3;
      rgb[i] = clamp(px[0], 0, 255);
      rgb[i + 1] = clamp(px[1], 0, 255);
      rgb[i + 2] = clamp(px[2], 0, 255);
    }
  }

  return encodePng(size, size, rgb);
}

/* ------------------------------------------------------------------ */

const icon = renderIcon(180);
writeFileSync(join(root, 'app', 'apple-icon.png'), icon);

console.log(`app/apple-icon.png  ${(icon.length / 1024).toFixed(1)} KB`);
