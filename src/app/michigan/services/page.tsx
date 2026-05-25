import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";

export const metadata: Metadata = {
  title: "Services — NRG Michigan",
  description: "Web design, automation, and local SEO for Michigan small businesses. Flat pricing, no monthly retainer required.",
  alternates: { canonical: "https://nrgwebsites.com/michigan/services" },
};

export default function MichiganServicesPage() {
  return <ServicesPage location="michigan" />;
}
