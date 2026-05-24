import { LocationPage } from '@/components/LocationPage'
import type { Metadata } from 'next'
import { locationContent } from '@/lib/locationContent'

export const metadata: Metadata = {
  title: locationContent.texas.metaTitle,
  description: locationContent.texas.metaDescription,
  alternates: { canonical: 'https://nrgbuilds.com/texas' },
}

export default function TexasPage() {
  return <LocationPage location="texas" />
}
