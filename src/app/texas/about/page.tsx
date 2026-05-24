import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About — NRG Texas",
  description: "Texas web designer and automation builder.",
  alternates: { canonical: "https://nrgwebsites.com/texas/about" },
};

export default function TexasAboutPage() {
  return <AboutPage location="texas" />;
}
