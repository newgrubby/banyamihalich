'use client';

import { contacts, footer, nav, site } from '@/lib/content';
import { scrollToId } from '@/lib/motion';
import { BanyaMark, VkIcon } from './Icons';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        <div className={styles.brandCol}>
          <a
            className={styles.brand}
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              scrollToId('top');
            }}
          >
            <BanyaMark className={styles.mark} />
            <span>
              <span className={styles.name}>{site.shortName}</span>
              <span className={styles.tag}>{site.tagline}</span>
            </span>
          </a>
          <p className={styles.note}>{footer.note}</p>
        </div>

        <nav className={styles.navCol} aria-label="Разделы сайта">
          <h2 className={styles.colTitle}>Разделы</h2>
          <ul>
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToId(item.id);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.contactCol}>
          <h2 className={styles.colTitle}>Связь</h2>
          <a className={styles.phone} href={contacts.phoneHref}>
            {contacts.phone}
          </a>
          <p className={styles.manager}>{contacts.manager}</p>
          <address className={styles.address}>{contacts.addressFull}</address>
          <a className={styles.vk} href={contacts.vk} target="_blank" rel="noopener noreferrer">
            <VkIcon />
            Группа VK
          </a>
        </div>
      </div>

      <div className={`shell ${styles.bottom}`}>
        <p>{footer.copyright}</p>
        <p className={styles.made}>Санитарный день — понедельник</p>
      </div>
    </footer>
  );
}
