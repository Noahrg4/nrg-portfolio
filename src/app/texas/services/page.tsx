import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";

export const metadata: Metadata = {
  title: "Services — NRG Texas",
  description: "Web design, automation, and local SEO for Texas small businesses. Flat pricing, Houston-based, no monthly retainer required.",
  alternates: { canonical: "https://nrgwebsites.com/texas/services" },
};

export default function TexasServicesPage() {
  return <ServicesPage location="texas" />;
}
