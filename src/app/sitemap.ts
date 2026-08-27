import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const lastModified = new Date();

  const publicRoutes = [
    '',
    '/projects',
    '/builders',
    '/opportunities',
    '/events',
    '/careers',
    '/built-by',
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
