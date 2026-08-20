import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { contacts, schedule, seo, site } from '@/lib/content';
import './globals.css';

/*
 * Шрифты лежат в репозитории (app/fonts) и раздаются с нашего домена:
 * сборка не ходит в Google Fonts, в рантайме запросов к fonts.gstatic.com нет.
 * Файлы — официальные переменные шрифты Google Fonts (Playfair Display 1.203,
 * Inter 4.001), обрезанные по тем же диапазонам символов, что отдавал Google
 * (latin, latin-ext, vietnamese, cyrillic; у Inter дополнительно cyrillic-ext,
 * greek, greek-ext). Начертания и метрики не изменились.
 */

const playfair = localFont({
  src: [
    {
      path: './fonts/PlayfairDisplay-Variable.woff2',
      style: 'normal',
      weight: '400 600',
    },
    {
      path: './fonts/PlayfairDisplay-Italic-Variable.woff2',
      style: 'italic',
      weight: '400 600',
    },
  ],
  display: 'swap',
  variable: '--font-playfair',
  adjustFontFallback: 'Times New Roman',
});

const inter = localFont({
  src: [
    {
      path: './fonts/Inter-Variable.woff2',
      style: 'normal',
      weight: '400 500',
    },
  ],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: 'Arial',
});

export const viewport: Viewport = {
  themeColor: '#0e0b09',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: seo.title,
    template: `%s — ${site.name}`,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  applicationName: site.name,
  authors: [{ name: site.name }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: seo.title,
    description: seo.description,
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Баня «У Михалыча» — общественная баня в Павловском Посаде',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
    images: ['/og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  category: 'Баня и сауна',
};

/** Локальное SEO: карточка организации для поисковых систем. */
const weekdayName: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

function pad(value: number): string {
  return `${value < 10 ? '0' : ''}${value}:00`;
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndBeautyBusiness',
  additionalType: 'https://schema.org/DaySpa',
  name: site.legalName,
  alternateName: site.shortName,
  description: seo.description,
  url: site.url,
  image: `${site.url}/og.jpg`,
  telephone: contacts.phoneRaw,
  priceRange: '600–800 ₽',
  currenciesAccepted: 'RUB',
  paymentAccepted: 'Наличные',
  address: {
    '@type': 'PostalAddress',
    streetAddress: contacts.street,
    addressLocality: contacts.city,
    addressRegion: contacts.region,
    postalCode: contacts.postalCode,
    addressCountry: 'RU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: contacts.coords.lat,
    longitude: contacts.coords.lon,
  },
  hasMap: `https://yandex.ru/maps/?ll=${contacts.coords.lon},${contacts.coords.lat}&z=17`,
  sameAs: [contacts.vk],
  openingHoursSpecification: schedule
    .filter((day) => day.openHour !== null && day.closeHour !== null)
    .map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${weekdayName[day.weekday]}`,
      opens: pad(day.openHour as number),
      closes: pad(day.closeHour as number),
    })),
  makesOffer: [
    {
      '@type': 'Offer',
      name: 'Общий билет',
      price: '800',
      priceCurrency: 'RUB',
    },
    {
      '@type': 'Offer',
      name: 'Льготный билет',
      price: '600',
      priceCurrency: 'RUB',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${playfair.variable} ${inter.variable} no-js`}>
      <head>
        {/* Кадр первого экрана — элемент LCP, забираем его как можно раньше */}
        <link rel="preload" as="image" href="/hero-poster.avif" type="image/avif" fetchPriority="high" />
        {/* Без JS анимации появления не нужны — контент показываем сразу */}
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body>
        {children}
        <div className="grain" aria-hidden="true" />
        <script
          type="application/ld+json"
          // Разметка формируется из локального контента, внешних данных здесь нет
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
