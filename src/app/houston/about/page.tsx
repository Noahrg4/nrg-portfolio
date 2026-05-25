import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About — NRG Houston",
  description: "Noah Reuter-Gushow builds websites and automation for Houston small businesses. Houston-based, solo, and direct — no agency in the middle.",
  alternates: { canonical: "https://nrgwebsites.com/houston/about" },
};

export default function HoustonAboutPage() {
  return <AboutPage location="houston" />;
}
