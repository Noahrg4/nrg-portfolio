import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Root
    { url: 'https://nrgwebsites.com', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },

    // Location homepages
    { url: 'https://nrgwebsites.com/houston', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://nrgwebsites.com/texas', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://nrgwebsites.com/michigan', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },

    // Root sub-pages
    { url: 'https://nrgwebsites.com/work', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://nrgwebsites.com/services', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: 'https://nrgwebsites.com/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://nrgwebsites.com/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },

    // Houston sub-pages
    { url: 'https://nrgwebsites.com/houston/work', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nrgwebsites.com/houston/services', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://nrgwebsites.com/houston/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: 'https://nrgwebsites.com/houston/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },

    // Texas sub-pages
    { url: 'https://nrgwebsites.com/texas/work', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nrgwebsites.com/texas/services', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://nrgwebsites.com/texas/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: 'https://nrgwebsites.com/texas/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },

    // Michigan sub-pages
    { url: 'https://nrgwebsites.com/michigan/work', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nrgwebsites.com/michigan/services', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: 'https://nrgwebsites.com/michigan/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: 'https://nrgwebsites.com/michigan/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ]
}
