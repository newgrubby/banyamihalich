'use client';

import { kindLabel, schedule } from '@/lib/content';
import { useBanyaDay } from '@/lib/useBanyaDay';
import styles from './Schedule.module.css';

export default function Schedule() {
  const now = useBanyaDay();
  const todayWeekday = now?.day.weekday ?? null;

  return (
    <section className="section" id="schedule" aria-labelledby="schedule-title">
      <div className="shell">
        <header data-reveal>
          <span className="sectionEyebrow">Мужские и женские дни</span>
          <h2 className="sectionTitle" id="schedule-title">
            Расписание бани
          </h2>
          <div className="ornament" aria-hidden="true">
            <svg viewBox="0 0 24 12" width="24" height="12" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 6 12 2l6 4-6 4Z" />
            </svg>
          </div>
        </header>

        <ol className={styles.grid} data-reveal>
          {schedule.map((day) => {
            const isToday = todayWeekday === day.weekday;
            const closed = day.openHour === null;

            return (
              <li
                key={day.weekday}
                className={[
                  styles.card,
                  isToday ? styles.cardToday : '',
                  closed ? styles.cardClosed : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={isToday ? 'date' : undefined}
              >
                {isToday && <span className={styles.badge}>сегодня</span>}

                <span className={styles.short} aria-hidden="true">
                  {day.short}
                </span>
                <span className="visually-hidden">{day.full}</span>

                <span className={styles.mark} aria-hidden="true">
                  <svg viewBox="0 0 28 12" width="28" height="12" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M14 2v8M14 5c-3-2-6-2-8-3 2 3 5 4 8 4M14 5c3-2 6-2 8-3-2 3-5 4-8 4" />
                  </svg>
                </span>

                <span className={styles.kind}>{kindLabel[day.kind]}</span>
                <span className={styles.hours}>{day.hours}</span>
              </li>
            );
          })}
        </ol>

        <p className={styles.legend} data-reveal>
          Понедельник — санитарный день. В остальные дни приходите в любое время работы бани:
          <strong> билет не ограничен по часам</strong>.
        </p>
      </div>
    </section>
  );
}
