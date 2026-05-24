import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";

export const metadata: Metadata = {
  title: "Services & Pricing — NRG Houston Web Design",
  description:
    "Web design, automation, local SEO, and hosting for Houston small businesses. Flat pricing, no monthly retainer required.",
};

export default function Page() {
  return <ServicesPage />;
}
