import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";

export const metadata: Metadata = {
  title: "Services — NRG Texas",
  description: "Web design and automation for Texas small businesses.",
  alternates: { canonical: "https://nrgbuilds.com/texas/services" },
};

export default function TexasServicesPage() {
  return <ServicesPage location="texas" />;
}
