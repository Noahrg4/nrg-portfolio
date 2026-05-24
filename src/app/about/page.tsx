import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About — NRG / Noah Reuter-Gushow, Web Designer",
  description:
    "Noah Reuter-Gushow builds websites and automation for small businesses. Solo, direct, and accountable — not an agency.",
};

export default function Page() {
  return <AboutPage />;
}
