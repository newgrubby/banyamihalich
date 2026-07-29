'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contacts, cta, hero } from '@/lib/content';
import { prefersReducedMotion, scrollToId } from '@/lib/motion';
import { useBanyaDay } from '@/lib/useBanyaDay';
import { kindToday } from '@/lib/content';
import HeroMedia from './HeroMedia';
import Steam from './Steam';
import { ArrowIcon, PhoneIcon } from './Icons';
import styles from './Hero.module.css';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const sourceRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const now = useBanyaDay();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .from(`.${styles.titleLine} > span`, {
          yPercent: 118,
          duration: 1.15,
          stagger: 0.11,
        })
        .from(`.${styles.rule}`, { scaleX: 0, transformOrigin: 'left center', duration: 0.9 }, '-=0.6')
        .from([`.${styles.lead}`, `.${styles.claim}`, `.${styles.actions}`, `.${styles.status}`], {
          y: 22,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
        }, '-=0.65');

      // Текст уходит вверх чуть быстрее фона — глубина без тяжёлого параллакса
      gsap.to(copyRef.current, {
        yPercent: -14,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.hero} ref={sectionRef} id="top" aria-labelledby="hero-title">
      <HeroMedia sourceRef={sourceRef} />
      <Steam sectionRef={sectionRef} sourceRef={sourceRef} />

      <div className={`shell ${styles.inner}`}>
        <div className={styles.copy} ref={copyRef}>
          <h1 className={styles.title} id="hero-title">
            {hero.titleLines.map((line) => (
              <span className={styles.titleLine} key={line}>
                <span>{line}</span>
              </span>
            ))}
          </h1>

          <div className={styles.rule} aria-hidden="true" />

          <p className={styles.lead}>{hero.description}</p>
          <p className={styles.claim}>{hero.claim}</p>

          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => scrollToId('schedule')}
            >
              {cta.schedule}
              <ArrowIcon />
            </button>

            <a className="btn btn--ghost" href={contacts.phoneHref}>
              <PhoneIcon />
              {cta.call}
            </a>
          </div>

          <p className={styles.status} aria-live="polite">
            {now ? (
              <>
                <span className={now.isOpenNow ? styles.dotOpen : styles.dotClosed} aria-hidden="true" />
                <span className={styles.statusDay}>{kindToday[now.day.kind]}</span>
                <span className={styles.statusSep} aria-hidden="true">
                  ·
                </span>
                <span>{now.status}</span>
              </>
            ) : (
              <span className={styles.statusDay}>Расписание мужских и женских дней</span>
            )}
          </p>
        </div>
      </div>

      <div className={styles.bottomFade} aria-hidden="true" />
    </section>
  );
}
