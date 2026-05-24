import { LocationPage } from '@/components/LocationPage'
import type { Metadata } from 'next'
import { locationContent } from '@/lib/locationContent'

export const metadata: Metadata = {
  title: locationContent.houston.metaTitle,
  description: locationContent.houston.metaDescription,
  alternates: { canonical: 'https://nrgbuilds.com/houston' },
}

export default function HoustonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "ProfessionalService"],
            "name": "NRG",
            "description": "Web design and automation for Houston small businesses",
            "areaServed": {
              "@type": "City",
              "name": "Houston",
              "containedInPlace": {
                "@type": "State",
                "name": "Texas"
              }
            },
            "url": "https://nrgbuilds.com/houston"
          })
        }}
      />
      <LocationPage location="houston" />
    </>
  )
}
