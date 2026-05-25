import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";

export const metadata: Metadata = {
  title: "Services — NRG Houston",
  description: "Web design, automation, and local SEO for Houston small businesses. Flat pricing, no monthly retainer required.",
  alternates: { canonical: "https://nrgwebsites.com/houston/services" },
};

export default function HoustonServicesPage() {
  return <ServicesPage location="houston" />;
}
