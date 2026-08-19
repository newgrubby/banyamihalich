/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * Статический экспорт: `next build` кладёт готовый сайт в out/.
   * Каталог загружается в public_html обычного хостинга — Node.js
   * на сервере не нужен.
   */
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  /*
   * Заголовки Cache-Control раздаёт Apache: при статическом экспорте
   * next.config.headers() не применяется, потому что отдачей файлов
   * занимается веб-сервер, а не Next.js. Правила — в public/.htaccess,
   * оттуда они попадают в out/.htaccess.
   */
};

export default nextConfig;
