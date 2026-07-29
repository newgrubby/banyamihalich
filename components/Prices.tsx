'use client';

import { contacts, cta, prices } from '@/lib/content';
import { scrollToId } from '@/lib/motion';
import { ArrowIcon, PhoneIcon, TicketIcon, TicketStarIcon } from './Icons';
import styles from './Prices.module.css';

const icons = [TicketIcon, TicketStarIcon];

export default function Prices() {
  return (
    <section className="section" id="prices" aria-labelledby="prices-title">
      <div className="shell">
        <header data-reveal>
          <span className="sectionEyebrow">Цены</span>
          <h2 className="sectionTitle" id="prices-title">
            {prices.headline}
          </h2>
          <div className="ornament" aria-hidden="true">
            <svg viewBox="0 0 24 12" width="24" height="12" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 6 12 2l6 4-6 4Z" />
            </svg>
          </div>
        </header>

        <div className={styles.layout}>
          <ul className={styles.cards}>
            {prices.items.map((item, index) => {
              const Icon = icons[index] ?? TicketIcon;
              return (
                <li className={styles.card} key={item.id} data-reveal>
                  <Icon className={styles.icon} />
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.amount}>
                    <span className={styles.number}>{item.value}</span>
                    <span className={styles.currency}>{item.currency}</span>
                  </p>
                  <p className={styles.cardNote}>{item.note}</p>
                </li>
              );
            })}
          </ul>

          <div className={styles.aside} data-reveal>
            <p className={styles.claim}>{prices.note}</p>

            <ul className={styles.extras}>
              {prices.extras.map((extra) => (
                <li key={extra}>
                  <span className={styles.bullet} aria-hidden="true" />
                  {extra}
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              <button type="button" className="btn btn--primary" onClick={() => scrollToId('schedule')}>
                {cta.schedule}
                <ArrowIcon />
              </button>
              <a className="btn btn--ghost" href={contacts.phoneHref}>
                <PhoneIcon />
                {cta.call}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
