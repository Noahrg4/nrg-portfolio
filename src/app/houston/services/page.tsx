import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";

export const metadata: Metadata = {
  title: "Services — NRG Houston",
  description: "Web design and automation services for Houston small businesses.",
  alternates: { canonical: "https://nrgwebsites.com/houston/services" },
};

export default function HoustonServicesPage() {
  return <ServicesPage location="houston" />;
}
