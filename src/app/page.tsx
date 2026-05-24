import { LocationPage } from '@/components/LocationPage'
import type { Metadata } from 'next'
import { locationContent } from '@/lib/locationContent'

export const metadata: Metadata = {
  title: locationContent.root.metaTitle,
  description: locationContent.root.metaDescription,
  alternates: { canonical: 'https://nrgwebsites.com' },
}

export default function HomePage() {
  return <LocationPage location="root" />
}
