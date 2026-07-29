'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion';

function revealAll(nodes: HTMLElement[]): void {
  nodes.forEach((node) => node.classList.add('is-visible'));
}

/**
 * Одна общая партия анимаций появления вместо десятков наблюдателей:
 * элементы помечаются в разметке атрибутом data-reveal.
 */
export default function Reveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (nodes.length === 0) return;

    if (prefersReducedMotion()) {
      revealAll(nodes);
      return;
    }

    let ctx: gsap.Context | undefined;

    try {
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        ScrollTrigger.batch(nodes, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              stagger: 0.07,
              overwrite: true,
              onComplete: () => {
                batch.forEach((node) => {
                  const element = node as HTMLElement;
                  element.classList.add('is-visible');
                  element.style.willChange = 'auto';
                });
              },
            });
          },
        });
      });
    } catch {
      // Если анимация недоступна, страница всё равно должна быть читаемой
      revealAll(nodes);
      return;
    }

    /**
     * Подстраховка: если через две секунды блок в зоне видимости всё ещё
     * прозрачен (не отработал тикер, вкладка была свёрнута, упал плагин) —
     * показываем его без анимации. Блоки ниже экрана не трогаем: их черёд
     * наступит при прокрутке.
     */
    const failsafe = window.setTimeout(() => {
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView && parseFloat(getComputedStyle(node).opacity) < 0.9) {
          node.classList.add('is-visible');
        }
      });
    }, 2000);

    return () => {
      window.clearTimeout(failsafe);
      ctx?.revert();
    };
  }, []);

  return null;
}
