'use client';

import { contacts, infoBar, kindToday, prices } from '@/lib/content';
import { useBanyaDay } from '@/lib/useBanyaDay';
import { CalendarIcon, ClockIcon, PinIcon, TicketIcon, TicketStarIcon } from './Icons';
import styles from './InfoBar.module.css';

export default function InfoBar() {
  const now = useBanyaDay();
  const [full, reduced] = prices.items;

  return (
    <div className={`shell ${styles.wrap}`}>
      <div className={styles.panel} data-reveal>
        <div className={`${styles.cell} ${styles.today}`}>
          <CalendarIcon className={styles.icon} />
          <div className={styles.body}>
            <span className={styles.label}>Сегодня</span>
            <strong className={styles.valueSmall} aria-live="polite">
              {now ? kindToday[now.day.kind].replace('Сегодня ', '') : 'уточняем…'}
            </strong>
            <span className={styles.note}>{now ? now.status : 'Часы работы по расписанию'}</span>
          </div>
        </div>

        <div className={styles.cell}>
          <TicketIcon className={styles.icon} />
          <div className={styles.body}>
            <span className={styles.label}>{full.title}</span>
            <strong className={styles.value}>
              {full.value} <span className={styles.currency}>{full.currency}</span>
            </strong>
          </div>
        </div>

        <div className={styles.cell}>
          <TicketStarIcon className={styles.icon} />
          <div className={styles.body}>
            <span className={styles.label}>{reduced.title}</span>
            <strong className={styles.value}>
              {reduced.value} <span className={styles.currency}>{reduced.currency}</span>
            </strong>
          </div>
        </div>

        <div className={styles.cell}>
          <ClockIcon className={styles.icon} />
          <div className={styles.body}>
            <span className={styles.label}>{infoBar.timeTitle}</span>
            <span className={styles.note}>
              Не ограничено,
              <br />
              кроме часов работы бани
            </span>
          </div>
        </div>

        <div className={styles.cell}>
          <PinIcon className={styles.icon} />
          <div className={styles.body}>
            <span className={styles.label}>{infoBar.addressTitle}</span>
            <address className={styles.note}>
              {contacts.city},
              <br />
              {contacts.street}
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}
