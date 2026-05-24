import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact — NRG Michigan",
  description: "Start a web design project with NRG.",
  alternates: { canonical: "https://nrgwebsites.com/michigan/contact" },
};

export default function MichiganContactPage() {
  return <ContactPage location="michigan" />;
}
