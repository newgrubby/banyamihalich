'use client';

import { contacts, routeUrl } from '@/lib/content';
import { scrollToId } from '@/lib/motion';
import { CalendarIcon, PhoneIcon, RouteIcon } from './Icons';
import styles from './MobileBar.module.css';

export default function MobileBar() {
  return (
    <nav className={styles.bar} aria-label="Быстрые действия">
      <button type="button" className={styles.item} onClick={() => scrollToId('schedule')}>
        <CalendarIcon />
        <span>Расписание</span>
      </button>

      <a className={`${styles.item} ${styles.accent}`} href={contacts.phoneHref}>
        <PhoneIcon />
        <span>Позвонить</span>
      </a>

      <a className={styles.item} href={routeUrl} target="_blank" rel="noopener noreferrer">
        <RouteIcon />
        <span>Маршрут</span>
      </a>
    </nav>
  );
}
