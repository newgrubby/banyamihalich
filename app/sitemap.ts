import type { MetadataRoute } from 'next';
import { site } from '@/lib/content';

// sitemap.xml формируется на этапе сборки: lastModified фиксируется
// временем сборки, потому что статический экспорт не выполняет код в рантайме.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
