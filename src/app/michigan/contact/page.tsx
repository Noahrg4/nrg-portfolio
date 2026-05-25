import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact — NRG Michigan",
  description: "Start a web design or automation project with NRG. Michigan-based work, direct response — usually same day.",
  alternates: { canonical: "https://nrgwebsites.com/michigan/contact" },
};

export default function MichiganContactPage() {
  return <ContactPage location="michigan" />;
}
