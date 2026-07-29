'use client';

import { useEffect, useRef } from 'react';
import styles from './BanyaCursor.module.css';

export default function BanyaCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!cursor || !finePointer.matches || reduced.matches) return;

    document.documentElement.classList.add('banya-cursor-enabled');
    let x = -60;
    let y = -60;
    let tx = x;
    let ty = y;
    let angle = -18;
    let raf = 0;

    const move = (event: PointerEvent) => {
      const dx = event.clientX - tx;
      const dy = event.clientY - ty;
      tx = event.clientX;
      ty = event.clientY;
      angle = Math.max(-42, Math.min(24, Math.atan2(dy, Math.max(Math.abs(dx), 1)) * 18 - 18));
      cursor.dataset.visible = 'true';
    };

    const over = (event: PointerEvent) => {
      const target = event.target as Element | null;
      cursor.dataset.active = target?.closest('a, button, [role="button"]') ? 'true' : 'false';
    };

    const leave = () => {
      cursor.dataset.visible = 'false';
    };

    const draw = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    raf = requestAnimationFrame(draw);

    return () => {
      document.documentElement.classList.remove('banya-cursor-enabled');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('mouseleave', leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles.cursor} ref={cursorRef} aria-hidden="true">
      <span className={styles.glow} />
      <svg viewBox="0 0 44 64">
        <path className={styles.stem} d="M24 61c-2-15-3-29-7-43M27 61c1-16 0-30 4-44" />
        <path className={styles.tie} d="M20 48c4 2 8 2 12 0M20 52c4 2 8 2 12 0" />
        <path className={styles.leaf} d="M18 42C8 39 5 31 8 25c7 0 12 5 13 12M17 31C7 28 5 19 9 14c7 1 11 6 11 13M16 20C9 16 10 8 15 4c5 3 7 8 5 13M28 42c9-3 13-10 10-17-7 0-12 5-13 12M29 30c9-4 11-12 7-17-7 2-10 7-10 14M29 19c7-5 5-12 0-16-5 4-6 9-3 15" />
      </svg>
    </div>
  );
}
