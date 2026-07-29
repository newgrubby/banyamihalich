'use client';

import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Высота липкой шапки, чтобы якорь не уезжал под неё. */
function headerOffset(): number {
  if (typeof window === 'undefined') return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-h');
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed + 12 : 84;
}

export function scrollToId(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  const offset = -headerOffset();
  const lenis = getLenis();

  if (lenis && !prefersReducedMotion()) {
    lenis.scrollTo(target, { offset, duration: 1.15 });
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({
    top,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

/** Есть ли рабочий WebGL — решает, показывать шейдерный пар или лёгкий запасной слой. */
export function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.WebGLRenderingContext) return false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Грубая оценка «слабого» устройства — на нём снижаем разрешение пара. */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const narrow = typeof window !== 'undefined' && window.innerWidth < 720;
  return cores <= 4 || memory <= 4 || narrow;
}
