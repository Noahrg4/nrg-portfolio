import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About — NRG Houston",
  description: "Houston web designer and automation builder.",
  alternates: { canonical: "https://nrgwebsites.com/houston/about" },
};

export default function HoustonAboutPage() {
  return <AboutPage location="houston" />;
}
