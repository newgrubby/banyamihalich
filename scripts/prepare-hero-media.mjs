/**
 * Подготовка медиа первого экрана из исходников public/hero.mp4 и public/hero.png.
 *
 *   public/hero-loop.mp4   — бесшовная плавная петля (прямой проход + обратный)
 *   public/hero-poster.avif — постер для быстрого LCP
 *   public/hero-poster.webp — то же в WebP
 *
 * Исходный ролик — медленный наезд камеры: его последний кадр сильно
 * отличается от первого, поэтому обычный loop даёт рывок каждые пять секунд.
 * Склеиваем прямой проход с обратным, отбрасывая дублирующиеся кадры
 * на стыках, — петля замыкается кадр в кадр. После склейки добавляем
 * промежуточные кадры с компенсацией движения: разворот камеры и пар
 * воспринимаются мягче, а итоговая частота составляет 48 кадров в секунду.
 *
 * Нужен ffmpeg в PATH. Запуск: npm run media
 */

import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const SOURCE_VIDEO = join(pub, 'hero.mp4');
const SOURCE_IMAGE = join(pub, 'hero.png');

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
}

function ffprobe(args) {
  return execFileSync('ffprobe', ['-v', 'error', ...args], { encoding: 'utf8' }).trim();
}

function report(file) {
  const kb = statSync(file).size / 1024;
  console.log(`  ${file.replace(root + '\\', '').replace(root + '/', '')}  ${kb.toFixed(1)} KB`);
}

if (!existsSync(SOURCE_VIDEO) || !existsSync(SOURCE_IMAGE)) {
  console.error('Нужны public/hero.mp4 и public/hero.png');
  process.exit(1);
}

/* ---------- бесшовная петля ---------- */

const frames = Number(
  ffprobe([
    '-select_streams', 'v:0',
    '-count_frames',
    '-show_entries', 'stream=nb_read_frames',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    SOURCE_VIDEO,
  ]),
);

// Обратный проход берём без первого и последнего кадра: иначе крайние
// кадры прозвучат дважды и на развороте появится микро-стоп.
const reverseEnd = frames - 1;

const loopOut = join(pub, 'hero-loop.mp4');
ffmpeg([
  '-i', SOURCE_VIDEO,
  '-filter_complex',
  `[0:v]split=2[fwd][tmp];` +
    `[tmp]reverse,trim=start_frame=1:end_frame=${reverseEnd},setpts=PTS-STARTPTS[rev];` +
    `[fwd][rev]concat=n=2:v=1:a=0[loop];` +
    `[loop]minterpolate=fps=48:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1[out]`,
  '-map', '[out]',
  '-an',
  '-c:v', 'libx264',
  '-profile:v', 'high',
  '-pix_fmt', 'yuv420p',
  '-crf', '24',
  '-preset', 'slow',
  // moov в начало файла — браузер начинает играть, не дожидаясь конца загрузки
  '-movflags', '+faststart',
  loopOut,
]);

/* ---------- постер ---------- */

const size = (file) =>
  ffprobe([
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0',
    file,
  ])
    .split(',')
    .map(Number);

const [videoW, videoH] = size(SOURCE_VIDEO);
const [imageW, imageH] = size(SOURCE_IMAGE);

// Кадр и ролик сняты с разным соотношением сторон. Подрезаем картинку под
// пропорции ролика, иначе при появлении видео композиция заметно дёрнется.
// Центрированный кроп проверен по PSNR относительно первого кадра.
const posterH = Math.round(imageW / (videoW / videoH) / 2) * 2;
const posterY = Math.max(0, Math.round((imageH - posterH) / 2));
const crop = `crop=${imageW}:${posterH}:0:${posterY}`;

const posterAvif = join(pub, 'hero-poster.avif');
ffmpeg([
  '-i', SOURCE_IMAGE,
  '-vf', crop,
  '-c:v', 'libaom-av1',
  '-still-picture', '1',
  '-crf', '32',
  '-cpu-used', '4',
  '-pix_fmt', 'yuv420p',
  posterAvif,
]);

const posterWebp = join(pub, 'hero-poster.webp');
ffmpeg([
  '-i', SOURCE_IMAGE,
  '-vf', crop,
  '-c:v', 'libwebp',
  '-quality', '78',
  '-compression_level', '6',
  '-pix_fmt', 'yuv420p',
  posterWebp,
]);

// Запасной PNG для старых браузеров — с тем же кадрированием
const posterPng = join(pub, 'hero-poster.png');
ffmpeg(['-i', SOURCE_IMAGE, '-vf', crop, '-compression_level', '100', posterPng]);

/* ---------- картинка для соцсетей ---------- */

// 1200×630 — кадрируем по правой части, где ушат и пар
const ogImage = join(pub, 'og.jpg');
ffmpeg([
  '-i', SOURCE_IMAGE,
  '-vf', 'crop=iw:iw*630/1200:0:ih*0.10,scale=1200:630:flags=lanczos',
  '-q:v', '4',
  ogImage,
]);

console.log('Готово:');
report(loopOut);
report(posterAvif);
report(posterWebp);
report(posterPng);
report(ogImage);
console.log(`  постер: ${imageW}×${posterH} (кроп по пропорциям ролика ${videoW}×${videoH})`);
console.log(`  (петля: ${frames} + ${reverseEnd - 1} кадров)`);
