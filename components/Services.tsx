import { services } from '@/lib/content';
import { ServiceIcon } from './Icons';
import styles from './Services.module.css';

export default function Services() {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="shell">
        <header data-reveal>
          <span className="sectionEyebrow">Услуги</span>
          <h2 className="sectionTitle" id="services-title">
            Что ждёт вас у нас
          </h2>
          <div className="ornament" aria-hidden="true">
            <svg viewBox="0 0 24 12" width="24" height="12" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 6 12 2l6 4-6 4Z" />
            </svg>
          </div>
        </header>

        <ul className={styles.grid}>
          {services.map((service) => (
            <li className={styles.card} key={service.id} data-reveal>
              <figure className={styles.media}>
                <img
                  src={service.art}
                  alt={service.alt}
                  width={600}
                  height={640}
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
                <span className={styles.mediaFade} aria-hidden="true" />
              </figure>

              <div className={styles.body}>
                <span className={styles.icon} aria-hidden="true">
                  <ServiceIcon name={service.icon} />
                </span>
                <h3 className={styles.title}>
                  {service.titleLines[0]}
                  <br />
                  {service.titleLines[1]}
                </h3>
                <p className={styles.text}>{service.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
