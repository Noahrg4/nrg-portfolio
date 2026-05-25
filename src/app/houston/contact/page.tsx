import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact — NRG Houston",
  description: "Start a web design or automation project with NRG. Houston-based. Usually responds same day.",
  alternates: { canonical: "https://nrgwebsites.com/houston/contact" },
};

export default function HoustonContactPage() {
  return <ContactPage location="houston" />;
}
