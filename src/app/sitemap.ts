import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://nrgbuilds.com', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://nrgbuilds.com/houston', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://nrgbuilds.com/texas', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://nrgbuilds.com/michigan', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://nrgbuilds.com/work', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://nrgbuilds.com/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://nrgbuilds.com/services', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: 'https://nrgbuilds.com/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ]
}
