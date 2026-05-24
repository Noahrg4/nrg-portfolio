import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact — NRG Texas",
  description: "Start a web design project with NRG.",
  alternates: { canonical: "https://nrgbuilds.com/texas/contact" },
};

export default function TexasContactPage() {
  return <ContactPage location="texas" />;
}
