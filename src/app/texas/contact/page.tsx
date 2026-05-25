import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact — NRG Texas",
  description: "Start a web design or automation project with NRG. Houston-based, working across Texas. Usually responds same day.",
  alternates: { canonical: "https://nrgwebsites.com/texas/contact" },
};

export default function TexasContactPage() {
  return <ContactPage location="texas" />;
}
