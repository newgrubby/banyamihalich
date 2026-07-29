'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { detectWebGL, isLowPowerDevice, prefersReducedMotion } from '@/lib/motion';
import styles from './Steam.module.css';

/* ------------------------------------------------------------------ */
/* Шейдеры                                                             */
/* ------------------------------------------------------------------ */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform float uAspect;
uniform vec2  uSource;    // положение горячей зоны в uv
uniform vec2  uMouse;     // сглаженная позиция курсора в uv
uniform float uMouseAmt;  // 0..1 — присутствие курсора
uniform float uScroll;    // 0..1 — прогресс ухода первого экрана
uniform float uGuard;     // насколько беречь колонку с заголовком
uniform float uOpacity;   // общий множитель (плавный вход)

vec3 hash33(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123) * 2.0 - 1.0;
}

// Градиентный шум Перлина — даёт мягкие «клубы» без сетчатых артефактов
float gnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(
      mix(dot(hash33(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
          dot(hash33(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
      mix(dot(hash33(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
          dot(hash33(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
    mix(
      mix(dot(hash33(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
          dot(hash33(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
      mix(dot(hash33(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
          dot(hash33(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y),
    u.z);
}

float fbm2(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 2; i++) {
    v += a * gnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

float fbm4(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * gnoise(p);
    p *= 2.07;
    a *= 0.52;
  }
  return v;
}

/* Один слой пара: собственный масштаб, скорость подъёма и ширина струи */
float plume(vec2 uv, float scale, float speed, float width, float seed, float fill) {
  float h = uv.y - uSource.y;

  // Струя расширяется кверху и слегка гуляет в стороны
  float sway = sin(uTime * 0.17 + seed + h * 2.6) * 0.055 * max(h, 0.0);
  float w = width * (0.30 + max(h, 0.0) * 1.85);
  float lat = exp(-pow(abs((uv.x - uSource.x) - sway) / max(w, 0.02), 2.0));

  float ver = smoothstep(-0.16, 0.05, h) * (1.0 - smoothstep(0.30, 1.15, h));
  float shape = lat * ver;

  // При уходе первого экрана струя раскрывается на весь кадр
  shape = mix(shape, 1.0, fill);

  vec2 q = vec2(uv.x * uAspect, uv.y) * scale;
  q.y -= uTime * speed;

  vec3 wp = vec3(q * 0.55, uTime * 0.09 + seed);
  vec2 warp = vec2(fbm2(wp), fbm2(wp + 13.7));

  float d = fbm4(vec3(q + warp * 1.45, uTime * 0.12 + seed)) * 0.5 + 0.5;
  d = smoothstep(0.44, 0.93, d);

  return d * shape;
}

void main() {
  vec2 uv = vUv;

  // Курсор мягко расталкивает пар
  vec2 md = uv - uMouse;
  float mi = exp(-dot(md, md) * 26.0) * uMouseAmt;
  uv += normalize(md + vec2(1e-4)) * mi * 0.04;

  float fill = sin(clamp(uScroll, 0.0, 1.0) * 3.14159265) * 0.85;
  float boost = 1.0 + 0.55 * smoothstep(0.0, 0.18, uScroll);

  // В кадре уже есть настоящий пар, поэтому струи здесь — добавка,
  // которая живёт от курсора и прокрутки, а не второй столб дыма
  float s1 = plume(uv, 2.30, 0.052, 0.105, 0.0, fill) * 0.34;
  float s2 = plume(uv, 4.10, 0.086, 0.165, 7.3, fill) * 0.26;
  float s3 = plume(uv, 7.60, 0.132, 0.245, 21.9, fill) * 0.16;

  // Общая дымка — она и проходит перед заголовком
  vec3 ap = vec3(uv.x * uAspect * 1.5, uv.y * 1.5 - uTime * 0.026, uTime * 0.04);
  float amb = smoothstep(0.34, 0.96, fbm4(ap) * 0.5 + 0.5);
  amb *= 0.30 * mix(0.30, 1.0, smoothstep(0.02, 0.55, uv.y));

  float total = (s1 + s2 + s3 + amb * (0.5 + fill)) * boost;

  // Колонка с заголовком остаётся читаемой: пар там есть, но тонкий
  float guard = mix(1.0, mix(0.34, 1.0, smoothstep(0.16, 0.52, vUv.x)), uGuard);
  total *= mix(guard, 1.0, fill * 0.7);

  // Мягкое растворение у краёв кадра
  total *= smoothstep(0.0, 0.10, vUv.x) * (1.0 - smoothstep(0.94, 1.0, vUv.x));
  total *= 1.0 - smoothstep(0.86, 1.0, vUv.y);

  // Уплывает вместе с первым экраном
  total *= 1.0 - smoothstep(0.62, 1.0, uScroll);

  float warmth = exp(-length((uv - uSource) * vec2(uAspect, 1.0)) * 2.1);
  vec3 col = mix(vec3(0.79, 0.755, 0.715), vec3(1.0, 0.72, 0.42), warmth * 0.5);

  // В покое слой почти незаметен, на переходе к следующему блоку — плотный
  float a = clamp(total, 0.0, 1.0) * (0.30 + 0.42 * fill) * uOpacity;
  gl_FragColor = vec4(col * a, a);
}
`;

/* ------------------------------------------------------------------ */
/* Утилиты WebGL                                                       */
/* ------------------------------------------------------------------ */

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function buildProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/* ------------------------------------------------------------------ */
/* Компонент                                                           */
/* ------------------------------------------------------------------ */

interface SteamProps {
  /** Секция, по прокрутке которой пар усиливается и затем рассеивается. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Маркер горячей зоны (кромка ушата) — задаёт источник струи. */
  sourceRef: RefObject<HTMLElement | null>;
}

export default function Steam({ sectionRef, sourceRef }: SteamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'gl' | 'fallback' | null>(null);

  useEffect(() => {
    setMode(detectWebGL() ? 'gl' : 'fallback');
  }, []);

  useEffect(() => {
    if (mode !== 'gl') return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const gl =
      canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        powerPreference: 'low-power',
      }) ?? null;

    if (!gl) {
      setMode('fallback');
      return;
    }

    const program = buildProgram(gl);
    if (!program) {
      setMode('fallback');
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const u = {
      time: gl.getUniformLocation(program, 'uTime'),
      aspect: gl.getUniformLocation(program, 'uAspect'),
      source: gl.getUniformLocation(program, 'uSource'),
      mouse: gl.getUniformLocation(program, 'uMouse'),
      mouseAmt: gl.getUniformLocation(program, 'uMouseAmt'),
      scroll: gl.getUniformLocation(program, 'uScroll'),
      guard: gl.getUniformLocation(program, 'uGuard'),
      opacity: gl.getUniformLocation(program, 'uOpacity'),
    };

    const reduced = prefersReducedMotion();
    const lowPower = isLowPowerDevice();
    // Пар — мягкая субстанция: считаем в пониженном разрешении и растягиваем.
    const renderScale = lowPower ? 0.34 : 0.5;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr * renderScale));
      const h = Math.max(1, Math.round(rect.height * dpr * renderScale));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform1f(u.aspect, rect.width / Math.max(rect.height, 1));
    };

    /* --- источник струи: берём из DOM, чтобы он совпадал с кромкой ушата --- */
    const source = { x: 0.66, y: 0.44 };
    const readSource = () => {
      const marker = sourceRef.current;
      const rect = section.getBoundingClientRect();
      if (!marker || rect.height === 0) return;
      const m = marker.getBoundingClientRect();
      source.x = (m.left + m.width / 2 - rect.left) / rect.width;
      // uv.y растёт вверх
      source.y = 1 - (m.top + m.height / 2 - rect.top) / rect.height;
    };

    /* --- курсор --- */
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, amt: 0, tamt: 0 };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = section.getBoundingClientRect();
      mouse.tx = (event.clientX - rect.left) / rect.width;
      mouse.ty = 1 - (event.clientY - rect.top) / rect.height;
      mouse.tamt = 1;
    };
    const onLeave = () => {
      mouse.tamt = 0;
    };

    /* --- прокрутка --- */
    let scroll = 0;
    const readScroll = () => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height, 1);
      scroll = Math.min(Math.max(-rect.top / travel, 0), 1);
    };

    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(section);

    let raf = 0;
    let startTime = performance.now();
    let opacity = 0;
    let burst = 0;
    const onBurst = () => {
      if (!reduced) burst = 1;
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible && !reduced) return;

      resize();
      readSource();
      readScroll();

      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      mouse.amt += (mouse.tamt - mouse.amt) * 0.04;
      opacity += (1 - opacity) * 0.035;
      burst *= 0.965;

      const t = reduced ? 8 : (now - startTime) / 1000;

      gl.uniform1f(u.time, t);
      gl.uniform2f(u.source, source.x, source.y);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.mouseAmt, reduced ? 0 : mouse.amt);
      gl.uniform1f(u.scroll, reduced ? 0 : scroll);
      gl.uniform1f(u.guard, window.innerWidth > 900 ? 1 : 0.45);
      gl.uniform1f(u.opacity, reduced ? 1 : opacity * (1 + burst * 1.75));

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // При отключённой анимации достаточно одного кадра
      if (reduced) cancelAnimationFrame(raf);
    };

    const onResize = () => {
      width = 0;
      height = 0;
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      setMode('fallback');
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('banya-steam-burst', onBurst);
    section.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('webglcontextlost', onContextLost);

    startTime = performance.now();
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('banya-steam-burst', onBurst);
      section.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [mode, sectionRef, sourceRef]);

  /* --- запасной слой для устройств без WebGL --- */
  useEffect(() => {
    if (mode !== 'fallback') return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const puffs = Array.from({ length: 9 }, (_, i) => ({
      x: 0.5 + Math.sin(i * 2.1) * 0.16,
      y: i / 9,
      r: 0.14 + (i % 3) * 0.07,
      speed: 0.012 + (i % 4) * 0.004,
      phase: i * 1.7,
    }));

    let raf = 0;
    let w = 0;
    let h = 0;

    const render = (now: number) => {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const nw = Math.round(rect.width * dpr * 0.4);
      const nh = Math.round(rect.height * dpr * 0.4);
      if (nw !== w || nh !== h) {
        w = nw;
        h = nh;
        canvas.width = Math.max(w, 1);
        canvas.height = Math.max(h, 1);
      }

      const t = reduced ? 6 : now / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of puffs) {
        const y = (p.y - t * p.speed) % 1;
        const py = (y < 0 ? y + 1 : y) * h;
        const px = (p.x + Math.sin(t * 0.3 + p.phase) * 0.05) * w;
        const r = p.r * h;
        const fade = Math.sin(((h - py) / h) * Math.PI) * 0.6;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
        grad.addColorStop(0, `rgba(214, 202, 186, ${0.1 * fade})`);
        grad.addColorStop(1, 'rgba(214, 202, 186, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [mode, sectionRef]);

  return (
    <canvas
      ref={canvasRef}
      className={mode === 'fallback' ? `${styles.canvas} ${styles.soft}` : styles.canvas}
      aria-hidden="true"
    />
  );
}
