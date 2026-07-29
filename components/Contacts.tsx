'use client';

import { useState } from 'react';
import { contacts, cta, mapEmbedUrl, mapUrl, routeUrl, site } from '@/lib/content';
import { GlobeIcon, PhoneIcon, PinIcon, RouteIcon, VkIcon } from './Icons';
import MapScheme from './MapScheme';
import styles from './Contacts.module.css';

export default function Contacts() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <section className="section" id="contacts" aria-labelledby="contacts-title">
      <div className="shell">
        <div className={styles.layout}>
          <div className={styles.panel} data-reveal>
            <span className="sectionEyebrow" style={{ textAlign: 'left' }}>
              Контакты
            </span>

            <h2 className={styles.title} id="contacts-title">
              Ждём вас в бане!
            </h2>

            <ul className={styles.list}>
              <li>
                <PhoneIcon className={styles.icon} />
                <div>
                  <a className={styles.phone} href={contacts.phoneHref}>
                    {contacts.phone}
                  </a>
                </div>
              </li>

              <li>
                <PinIcon className={styles.icon} />
                <div>
                  <address className={styles.address}>
                    {contacts.city},
                    <br />
                    {contacts.street}
                  </address>
                  <p className={styles.sub}>{contacts.region}</p>
                </div>
              </li>

              <li>
                <GlobeIcon className={styles.icon} />
                <div>
                  <a className={styles.coords} href={mapUrl} target="_blank" rel="noopener noreferrer">
                    {contacts.coords.lat}, {contacts.coords.lon}
                  </a>
                  <p className={styles.sub}>Координаты для навигатора</p>
                </div>
              </li>
            </ul>

            <div className={styles.actions}>
              <a className="btn btn--primary" href={routeUrl} target="_blank" rel="noopener noreferrer">
                <RouteIcon />
                {cta.route}
              </a>
              <a className="btn btn--ghost" href={contacts.vk} target="_blank" rel="noopener noreferrer">
                <VkIcon />
                {cta.vk}
              </a>
            </div>
          </div>

          <div className={styles.map} data-reveal>
            {mapLoaded ? (
              <iframe
                className={styles.frame}
                src={mapEmbedUrl}
                title={`Карта: ${site.name}, ${contacts.addressFull}`}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <>
                <MapScheme />
                <div className={styles.mapOverlay}>
                  <p className={styles.mapNote}>
                    Схема расположения. Полная карта загрузится по нажатию —
                    так страница открывается быстрее.
                  </p>
                  <button type="button" className="btn btn--ghost" onClick={() => setMapLoaded(true)}>
                    Показать карту
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
