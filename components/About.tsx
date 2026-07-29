import { about } from '@/lib/content';
import styles from './About.module.css';

export default function About() {
  return (
    <section className={`section ${styles.section}`} id="about" aria-labelledby="about-title">
      <div className={styles.embers} aria-hidden="true" />

      <div className={`shell ${styles.inner}`}>
        <div className={styles.head}>
          <span className={styles.eyebrow} data-reveal>
            {about.eyebrow}
          </span>

          <h2 className={styles.title} id="about-title" data-reveal>
            <span className={styles.titleStrike}>{about.title[0]}</span>
            <span className={styles.titleMain}>{about.title[1]}</span>
          </h2>

          <p className={styles.lead} data-reveal>
            {about.lead}
          </p>
        </div>

        <ul className={styles.points}>
          {about.points.map((point, index) => (
            <li className={styles.point} key={point.title} data-reveal>
              <span className={styles.pointIndex} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.pointTitle}>{point.title}</h3>
              <p className={styles.pointText}>{point.text}</p>
            </li>
          ))}
        </ul>

        <p className={styles.quote} data-reveal>
          {about.quote}
        </p>
      </div>
    </section>
  );
}
