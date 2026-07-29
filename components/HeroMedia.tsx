'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './HeroMedia.module.css';

/** Не тянем ролик, если пользователь просил экономить трафик. */
function wantsLightPage(): boolean {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
}

interface HeroMediaProps {
  /** Маркер горячей зоны — по нему шейдер пара находит источник струи. */
  sourceRef: React.RefObject<HTMLSpanElement | null>;
}

export default function HeroMedia({ sourceRef }: HeroMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [ready, setReady] = useState(false);

  // Решение о видео принимаем только в браузере: на сервере рендерится кадр
  useEffect(() => {
    if (prefersReducedMotion() || wantsLightPage()) return;
    setShowVideo(true);
  }, []);

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    const root = rootRef.current;
    if (!video || !root) return;

    // Safari иногда игнорирует autoplay-атрибут, но разрешает play() для muted
    const start = () => {
      video.play().catch(() => {
        /* автовоспроизведение запрещено — остаётся постер */
      });
    };

    if (video.readyState >= 3) {
      setReady(true);
      start();
    }

    const onReady = () => {
      setReady(true);
      start();
    };
    video.addEventListener('canplay', onReady);

    // За пределами первого экрана ролик не декодируем
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else video.pause();
      },
      { threshold: 0 },
    );
    observer.observe(root);

    return () => {
      video.removeEventListener('canplay', onReady);
      observer.disconnect();
    };
  }, [showVideo]);

  // Мерцание тёплого света от каменки — очень слабое, поверх кадра
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to('[data-flicker="ember"]', {
        opacity: 0.68,
        duration: 3.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.scene} ref={rootRef}>
      {/* Маркер кромки ушата: шейдер пара берёт отсюда точку выхода струи */}
      <span ref={sourceRef} className={styles.source} aria-hidden="true" />

      {/*
        Кадр показывается сразу и остаётся под роликом: это LCP-элемент,
        он лёгкий и резкий, а видео проявляется поверх, когда готово.
      */}
      <picture>
        <source srcSet="/hero-poster.avif" type="image/avif" />
        <source srcSet="/hero-poster.webp" type="image/webp" />
        <img
          className={styles.still}
          src="/hero-poster.png"
          alt="Деревянный ушат с горячей водой и дубовым веником в парной, над водой поднимается пар"
          width={1672}
          height={900}
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      {showVideo && (
        <video
          ref={videoRef}
          className={ready ? `${styles.video} ${styles.videoReady}` : styles.video}
          src="/hero-loop.mp4"
          loop
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      {/* Тёплое зарево от печи справа */}
      <div className={styles.ember} data-flicker="ember" aria-hidden="true" />

      {/* Сведение с фоном страницы и защита читаемости заголовка */}
      <div className={styles.leftFade} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
    </div>
  );
}
