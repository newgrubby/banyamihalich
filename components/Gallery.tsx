import styles from './Gallery.module.css';

const photos = [
  {
    src: '/photos/atmosphere-tea.webp',
    alt: 'Гости пьют чай и играют в настольную игру после парной',
    title: 'Отдых после пара',
    text: 'Чай, настольные игры и разговоры без спешки.',
  },
  {
    src: '/photos/atmosphere-hall.webp',
    alt: 'Гости отдыхают в общем зале и смотрят спортивную трансляцию',
    title: 'Просторный общий зал',
    text: 'Можно собраться компанией и посмотреть спортивную трансляцию.',
  },
  {
    src: '/photos/atmosphere-steam-room.webp',
    alt: 'Гости отдыхают на деревянных полках в парной',
    title: 'Настоящая парная',
    text: 'Деревянный полок, живой жар и атмосфера настоящей русской бани.',
  },
] as const;

export default function Gallery() {
  return (
    <section className={`section ${styles.section}`} id="gallery" aria-labelledby="gallery-title">
      <div className="shell">
        <header data-reveal>
          <span className="sectionEyebrow">Как у нас отдыхают</span>
          <h2 className="sectionTitle" id="gallery-title">
            Банная атмосфера
          </h2>
          <div className="ornament" aria-hidden="true">
            <svg viewBox="0 0 24 12" width="24" height="12" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 6 12 2l6 4-6 4Z" />
            </svg>
          </div>
        </header>

        <ul className={styles.grid}>
          {photos.map((photo, index) => (
            <li className={`${styles.card} ${index === 0 ? styles.featured : ''}`} key={photo.src} data-reveal>
              <figure className={styles.figure}>
                <img
                  className={styles.image}
                  src={photo.src}
                  alt={photo.alt}
                  width={1500}
                  height={index === 2 ? 1125 : index === 1 ? 844 : 998}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.shade} aria-hidden="true" />
                <figcaption className={styles.caption}>
                  <h3>{photo.title}</h3>
                  <p>{photo.text}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
