'use client';

import { useCallback, useEffect, useState } from 'react';
import { contacts, nav, site } from '@/lib/content';
import { scrollToId } from '@/lib/motion';
import { BanyaMark, CloseIcon, MenuIcon, PhoneIcon } from './Icons';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Подсветка активного пункта меню
  useEffect(() => {
    const sections = nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = useCallback((event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setOpen(false);
    scrollToId(id);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.solid : ''}`}>
      <div className={`shell ${styles.inner}`}>
        <a
          className={styles.brand}
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            setOpen(false);
            scrollToId('top');
          }}
          aria-label={`${site.name} — наверх`}
        >
          <BanyaMark className={styles.mark} />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{site.shortName}</span>
            <span className={styles.brandTag}>{site.tagline}</span>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Основная навигация">
          <ul className={styles.navList}>
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={active === item.id ? styles.navLinkActive : styles.navLink}
                  onClick={(event) => go(event, item.id)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.side}>
          <a
            className={styles.phone}
            href={contacts.phoneHref}
            aria-label={`Позвонить: ${contacts.phone}, ${contacts.manager}`}
          >
            <span className={styles.phoneNumber}>{contacts.phone}</span>
            <span className={styles.phoneManager}>{contacts.manager}</span>
          </a>

          <a className={styles.call} href={contacts.phoneHref} aria-label={`Позвонить: ${contacts.phone}`}>
            <PhoneIcon />
          </a>

          <button
            type="button"
            className={styles.burger}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`${styles.menu} ${open ? styles.menuOpen : ''}`} hidden={!open}>
        <ul className={styles.menuList}>
          {nav.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={(event) => go(event, item.id)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a className={styles.menuPhone} href={contacts.phoneHref}>
          <PhoneIcon />
          {contacts.phone}
        </a>
        <p className={styles.menuManager}>{contacts.manager}</p>
      </div>
    </header>
  );
}
