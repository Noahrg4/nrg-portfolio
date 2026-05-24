import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About — NRG Michigan",
  description: "Michigan web designer and automation builder.",
  alternates: { canonical: "https://nrgwebsites.com/michigan/about" },
};

export default function MichiganAboutPage() {
  return <AboutPage location="michigan" />;
}
