import type { MetadataRoute } from 'next';
import { site } from '@/lib/content';

// robots.txt формируется на этапе сборки: сайт статический,
// пересчитывать содержимое в рантайме негде и незачем.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
