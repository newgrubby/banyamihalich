import { contacts, site } from '@/lib/content';
import styles from './Contacts.module.css';

/**
 * Декоративная схема расположения в стиле сайта.
 * Точные улицы показывает настоящая карта, которая грузится по клику.
 */
export default function MapScheme() {
  return (
    <svg
      className={styles.scheme}
      viewBox="0 0 900 620"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Схема расположения: ${site.shortName}, ${contacts.addressFull}`}
    >
      <defs>
        <linearGradient id="mapBg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#191411" />
          <stop offset="55%" stopColor="#110d0b" />
          <stop offset="100%" stopColor="#0a0807" />
        </linearGradient>

        <radialGradient id="mapGlow" cx="0.62" cy="0.46" r="0.45">
          <stop offset="0%" stopColor="#c47a35" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="riverG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2b4450" />
          <stop offset="100%" stopColor="#1a2b33" />
        </linearGradient>
      </defs>

      <rect width="900" height="620" fill="url(#mapBg)" />

      {/* кварталы */}
      <g fill="#181310" opacity="0.9">
        <rect x="40" y="52" width="200" height="140" />
        <rect x="268" y="34" width="170" height="120" />
        <rect x="470" y="60" width="220" height="130" />
        <rect x="716" y="40" width="150" height="150" />
        <rect x="60" y="228" width="180" height="150" />
        <rect x="286" y="196" width="150" height="180" />
        <rect x="620" y="228" width="240" height="140" />
        <rect x="90" y="418" width="220" height="150" />
        <rect x="352" y="430" width="180" height="140" />
        <rect x="572" y="410" width="270" height="170" />
      </g>

      {/* улицы */}
      <g stroke="#2e2620" strokeWidth="14" strokeLinecap="square">
        <path d="M0 206h900" />
        <path d="M0 396h900" />
        <path d="M256 0v620" />
        <path d="M552 0v620" />
      </g>
      <g stroke="#3b3128" strokeWidth="7" strokeLinecap="square">
        <path d="M0 100h900" />
        <path d="M0 512h900" />
        <path d="M110 0v620" />
        <path d="M700 0v620" />
        <path d="M0 300h900" opacity="0.55" />
      </g>

      {/* диагональ — шоссе */}
      <path d="M-40 620 L940 96" stroke="#463829" strokeWidth="16" />
      <path d="M-40 620 L940 96" stroke="#5d4a34" strokeWidth="2" strokeDasharray="18 16" opacity="0.65" />

      {/* река */}
      <path
        d="M-20 470 C120 440 190 500 300 480 C420 458 470 396 590 386 C700 376 790 404 920 380"
        fill="none"
        stroke="url(#riverG)"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* зелёная зона */}
      <path d="M700 470 q80 -40 190 -10 l0 160 -210 0 z" fill="#1b2117" opacity="0.7" />

      <rect width="900" height="620" fill="url(#mapGlow)" />

      {/* метка */}
      <g transform="translate(552 300)">
        <ellipse cx="0" cy="6" rx="30" ry="9" fill="#000" opacity="0.55" />
        <path
          d="M0 6 C-16 -18 -26 -30 -26 -44 A26 26 0 0 1 26 -44 C26 -30 16 -18 0 6Z"
          fill="#c37a33"
          stroke="#f0b571"
          strokeWidth="2"
        />
        <circle cx="0" cy="-44" r="9" fill="#1a0f07" />
        <circle cx="0" cy="-44" r="70" fill="#e2884a" opacity="0.12" />
      </g>

      <g transform="translate(600 306)">
        <text
          x="0"
          y="0"
          fill="#efe0c8"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="26"
          letterSpacing="1"
        >
          {site.shortName}
        </text>
        <text x="0" y="26" fill="#9b8876" fontFamily="Arial, Helvetica, sans-serif" fontSize="15">
          {contacts.street}
        </text>
      </g>
    </svg>
  );
}
