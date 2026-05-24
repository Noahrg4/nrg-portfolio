import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Root
    { url: 'https://nrgbuilds.com', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },

    // Location homepages
    { url: 'https://nrgbuilds.com/houston', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://nrgbuilds.com/texas', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://nrgbuilds.com/michigan', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },

    // Root sub-pages
    { url: 'https://nrgbuilds.com/work', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://nrgbuilds.com/services', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: 'https://nrgbuilds.com/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://nrgbuilds.com/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },

    // Houston sub-pages
    { url: 'https://nrgbuilds.com/houston/work', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nrgbuilds.com/houston/services', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://nrgbuilds.com/houston/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: 'https://nrgbuilds.com/houston/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },

    // Texas sub-pages
    { url: 'https://nrgbuilds.com/texas/work', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nrgbuilds.com/texas/services', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://nrgbuilds.com/texas/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: 'https://nrgbuilds.com/texas/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },

    // Michigan sub-pages
    { url: 'https://nrgbuilds.com/michigan/work', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nrgbuilds.com/michigan/services', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://nrgbuilds.com/michigan/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: 'https://nrgbuilds.com/michigan/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ]
}
