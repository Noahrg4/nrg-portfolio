import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About — NRG Michigan",
  description: "Noah Reuter-Gushow builds websites and automation for Michigan small businesses. Grew up here, works direct — no agency in the middle.",
  alternates: { canonical: "https://nrgwebsites.com/michigan/about" },
};

export default function MichiganAboutPage() {
  return <AboutPage location="michigan" />;
}
