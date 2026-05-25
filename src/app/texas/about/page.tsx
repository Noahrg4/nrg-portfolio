import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About — NRG Texas",
  description: "Noah Reuter-Gushow builds websites and automation for Texas small businesses. Houston-based, solo, and direct — no agency in the middle.",
  alternates: { canonical: "https://nrgwebsites.com/texas/about" },
};

export default function TexasAboutPage() {
  return <AboutPage location="texas" />;
}
