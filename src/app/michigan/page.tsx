import { LocationPage } from '@/components/LocationPage'
import type { Metadata } from 'next'
import { locationContent } from '@/lib/locationContent'

export const metadata: Metadata = {
  title: locationContent.michigan.metaTitle,
  description: locationContent.michigan.metaDescription,
  alternates: { canonical: 'https://nrgbuilds.com/michigan' },
}

export default function MichiganPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "ProfessionalService"],
            "name": "NRG",
            "description": "Web design and automation for Michigan small businesses",
            "areaServed": {
              "@type": "State",
              "name": "Michigan"
            },
            "url": "https://nrgbuilds.com/michigan"
          })
        }}
      />
      <LocationPage location="michigan" />
    </>
  )
}
