import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact — NRG Houston",
  description: "Start a web design project with NRG in Houston.",
  alternates: { canonical: "https://nrgwebsites.com/houston/contact" },
};

export default function HoustonContactPage() {
  return <ContactPage location="houston" />;
}
